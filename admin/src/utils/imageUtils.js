const normalizeImageUrl = (image, customBackendUrl = "") => {
  if (!image || typeof image !== "string") {
    return "";
  }

  const trimmed = image.trim();
  if (!trimmed) {
    return "";
  }

  // 1. Extract nested absolute URL if prepended (e.g. "https://habeshabites.onrender.com/images/https://res.cloudinary.com/...")
  const lastHttpIndex = trimmed.lastIndexOf("http://");
  const lastHttpsIndex = trimmed.lastIndexOf("https://");
  const lastIndex = Math.max(lastHttpIndex, lastHttpsIndex);

  if (lastIndex > 0) {
    return trimmed.slice(lastIndex);
  }

  // 2. If it's already a clean absolute URL starting with http://, https://, or //
  if (/^(?:https?:)?\/\//i.test(trimmed)) {
    return trimmed;
  }

  // 3. Strip any prepended /images/ or /uploads/ or images/ or uploads/ prefixes
  const cleaned = trimmed.replace(/^(?:\/?(?:images|uploads)\/)+/i, "");

  // 4. If after cleaning it starts with http:// or https://
  if (/^(?:https?:)?\/\//i.test(cleaned)) {
    return cleaned;
  }

  // 5. If relative filename, prepend backend URL if available
  const backendUrl =
    customBackendUrl ||
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
    "";

  if (backendUrl) {
    const baseUrl = backendUrl.replace(/\/+$/, "");
    return `${baseUrl}/images/${cleaned}`;
  }

  return cleaned;
};

export { normalizeImageUrl };
