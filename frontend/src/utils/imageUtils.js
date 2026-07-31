const normalizeImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return "";
  }

  const trimmed = image.trim();
  if (!trimmed) {
    return "";
  }

  const cleaned = trimmed.replace(/^(?:https?:\/\/[^/]+)?\/(?:images|uploads)\//i, "");

  if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith("//")) {
    return cleaned;
  }

  return cleaned;
};

export { normalizeImageUrl };
