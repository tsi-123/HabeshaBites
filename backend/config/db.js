import mongoose from "mongoose";
import dns from "dns";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

/**
 * Resolves a mongodb+srv:// URI into a standard mongodb:// URI by
 * performing SRV + TXT DNS lookups manually using a custom DNS resolver.
 *
 * WHY THIS IS NEEDED:
 * On some Windows systems, Node.js's internal `dns.resolveSrv()` fails with
 * ECONNREFUSED for SRV queries even though `nslookup` works fine.
 * This is because Node.js uses a different DNS resolution code path than
 * the system's nslookup command.
 *
 * The fix: Use the `dns.Resolver` class with Google's public DNS (8.8.8.8)
 * to resolve SRV records manually, then build a direct mongodb:// connection
 * string, completely bypassing Mongoose's built-in SRV lookup.
 */
const srvToDirectUrl = (srvUrl) => {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(srvUrl);
      const hostname = parsed.hostname;
      const srvName = `_mongodb._tcp.${hostname}`;
      const username = parsed.username;
      const password = parsed.password;
      const database = parsed.pathname.replace(/^\//, "") || "habeshabites";

      const resolver = new dns.Resolver();
      resolver.setServers(["8.8.8.8", "1.1.1.1"]);

      resolver.resolveSrv(srvName, (srvErr, srvAddresses) => {
        if (srvErr) {
          console.warn("⚠️  Custom SRV resolution also failed:", srvErr.message);
          return resolve(null);
        }

        const hosts = srvAddresses
          .sort((a, b) => (b.priority !== a.priority ? a.priority - b.priority : b.weight - a.weight))
          .map((a) => `${a.name}:${a.port}`)
          .join(",");

        resolver.resolveTxt(hostname, (txtErr, txtRecords) => {
          const params = new URLSearchParams(parsed.search);

          // Merge TXT record params (replicaSet, authSource) with original URL params
          if (!txtErr && txtRecords?.length > 0) {
            const txtParams = new URLSearchParams(txtRecords[0].join(""));
            for (const [key, value] of txtParams) {
              if (!params.has(key)) params.set(key, value);
            }
          }

          if (!params.has("authSource")) params.set("authSource", "admin");
          params.set("ssl", "true");
          params.set("tls", "true");
          if (!params.has("retryWrites")) params.set("retryWrites", "true");
          if (!params.has("w")) params.set("w", "majority");

          const auth = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
          const directUrl = `mongodb://${auth}${hosts}/${database}?${params.toString()}`;

          console.log("✅ Custom SRV resolved to direct MongoDB connection string");
          resolve(directUrl);
        });
      });
    } catch (e) {
      console.warn("⚠️  Failed to parse SRV URL:", e.message);
      resolve(null);
    }
  });
};

export const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL is not defined in environment variables.");
  }

  // Prevent unhandled EventEmitter 'error' process crash on connection drop
  if (!mongoose.connection.listeners("error").length) {
    mongoose.connection.on("error", (err) => {
      console.error("⚠️ MongoDB runtime connection error:", err.message);
    });
  }

  const baseOptions = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    maxPoolSize: 10,
  };

  let directUrl = null;
  if (mongoUrl.startsWith("mongodb+srv://")) {
    console.log("🔍 SRV URL detected — resolving via custom DNS resolver...");
    directUrl = await srvToDirectUrl(mongoUrl);
  }

  // Prioritize original SRV URL for standard Atlas replica set connections in production.
  // Fall back to custom direct URL if SRV fails (e.g. Windows dev environment DNS issues).
  const urlsToTry = [
    { url: mongoUrl, label: "original SRV URL", opts: baseOptions },
    ...(directUrl ? [{ url: directUrl, label: "direct resolved URL", opts: baseOptions }] : []),
  ];

  for (const { url, label, opts } of urlsToTry) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 Connecting via ${label} (attempt ${attempt}/${MAX_RETRIES})...`);
        await mongoose.connect(url, opts);
        console.log(`✅ MongoDB Connected Successfully via ${label}`);
        return;
      } catch (err) {
        console.error(`❌ Connection failed via ${label} (attempt ${attempt}/${MAX_RETRIES}):`);
        console.error(`   Code: ${err.code || "N/A"} | Message: ${err.message}`);

        if (attempt < MAX_RETRIES) {
          console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
          await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
        }
      }
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }

  throw new Error(
    "All MongoDB connection strategies failed. Check Atlas Network Access (0.0.0.0/0), credentials, and cluster status."
  );
};
