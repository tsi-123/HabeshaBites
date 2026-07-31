const normalizeImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return "";
  }

  const trimmed = image.trim();
  if (!trimmed) {
    return "";
  }

  // 1. Check if the string contains a nested absolute URL (e.g. "https://habeshabites.onrender.com/images/https://res.cloudinary.com/...")
  const nestedUrlMatch = trimmed.match(/(https?:\/\/.+)$/i);
  if (nestedUrlMatch) {
    const possibleUrl = nestedUrlMatch[1];
    if (trimmed !== possibleUrl) {
      return possibleUrl;
    }
  }

  // 2. If it's already a clean absolute URL (http://, https://, or //)
  if (/^(?:https?:)?\/\//i.test(trimmed)) {
    return trimmed;
  }

  // 3. Strip any prepended /images/ or /uploads/ or images/ or uploads/ prefixes
  const cleaned = trimmed.replace(/^(?:\/?(?:images|uploads)\/)+/i, "");

  // 4. If after cleaning it starts with http:// or https://
  if (/^(?:https?:)?\/\//i.test(cleaned)) {
    return cleaned;
  }

  return cleaned;
};

export { normalizeImageUrl };
