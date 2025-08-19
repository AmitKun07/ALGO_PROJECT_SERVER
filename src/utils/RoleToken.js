import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateEncryptedKey = (prefix) => {
  const randomPart = crypto.randomBytes(2).toString("hex");
  return `${prefix}${randomPart}`;
};

const generateRoleToken = (role, suffix) => {
  const token = jwt.sign({ role }, process.env.ROLE_JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  return `${token}-${suffix}`;
};

const decodeRoleToken = (tokenWithSuffix) => {
  // extract end suffix
  const suffix = `-${suffix}`;

  if (!tokenWithSuffix || !tokenWithSuffix.endsWith(suffix)) {
    return null;
  }

  const pureToken = tokenWithSuffix.replace(suffix, "");

  try {
    const decoded = jwt.verify(pureToken, process.env.ROLE_JWT_SECRET);
    return decoded; // contains actuall role
  } catch (err) {
    return null;
  }
};

export { generateRoleToken, generateEncryptedKey, decodeRoleToken };
