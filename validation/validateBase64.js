const ApiError = require("../utils/ApiError");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

const MAGIC_NUMBERS = {
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

const ALLOWED_TYPES = Object.keys(MAGIC_NUMBERS);

const validateBase64 = (base64) => {
  if (!base64 || typeof base64 !== "string") {
    throw new ApiError("Image payload missing", 400);
  }

  // 1️⃣ Validate data URI
  const matches = base64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) {
    throw new ApiError("Invalid image encoding", 400);
  }

  const mimeType = matches[1];
  const data = matches[2];

  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new ApiError("Unsupported image type", 415);
  }

  // 2️⃣ Decode base64
  let buffer;
  try {
    buffer = Buffer.from(data, "base64");
  } catch {
    throw new ApiError("Invalid base64 data", 400);
  }

  // 3️⃣ Size check
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new ApiError("Image too large (max 5MB)", 413);
  }

  // 4️⃣ Magic number check
  const magic = MAGIC_NUMBERS[mimeType];
  const isValidMagic = magic.every(
    (byte, index) => buffer[index] === byte
  );

  if (!isValidMagic) {
    throw new ApiError("Image content mismatch", 400);
  }

  return {
    bufferSize: buffer.length,
    mimeType,
  };
};

module.exports = validateBase64;
