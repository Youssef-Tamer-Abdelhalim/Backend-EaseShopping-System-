const xss = require("xss");

/**
 * Recursively sanitizes a value:
 * - Strings: strips HTML/XSS via xss()
 * - Objects: removes keys starting with "$" or containing "." (NoSQL injection),
 *            then recurses into values
 * - Arrays: maps over each element
 *
 * NOTE: mutates the object in-place intentionally —
 * Express 5 made req.query a read-only getter so we cannot reassign it,
 * only modify its contents.
 */
const sanitizeValue = (value) => {
  if (typeof value === "string") return xss(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") return sanitizeObject(value);
  return value;
};

const sanitizeObject = (obj) => {
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else {
      obj[key] = sanitizeValue(obj[key]);
    }
  }
  return obj;
};

module.exports = (req, res, next) => {
  if (req.body && typeof req.body === "object") sanitizeObject(req.body);
  if (req.params && typeof req.params === "object") sanitizeObject(req.params);
  // Mutate in-place — do NOT reassign req.query (Express 5 getter-only)
  if (req.query && typeof req.query === "object") sanitizeObject(req.query);
  next();
};
