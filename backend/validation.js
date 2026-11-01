function asRequiredText(value, field, maxLength = 120) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${field} is required`);
  if (text.length > maxLength) throw new Error(`${field} is too long`);
  return text;
}

function asOptionalText(value, maxLength = 120) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  if (text.length > maxLength) throw new Error("Value is too long");
  return text || null;
}

function asNumber(value, field, { required = false, min = null, max = null } = {}) {
  if (value === null || value === undefined || value === "") {
    if (required) throw new Error(`${field} is required`);
    return null;
  }
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${field} must be numeric`);
  if (min !== null && number < min) throw new Error(`${field} must be at least ${min}`);
  if (max !== null && number > max) throw new Error(`${field} must be at most ${max}`);
  return number;
}

function asEmail(value) {
  const email = asRequiredText(value, "email", 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("email is invalid");
  return email;
}

function asId(value, field = "id") {
  const id = asNumber(value, field, { required: true, min: 1 });
  if (!Number.isInteger(id)) throw new Error(`${field} must be an integer`);
  return id;
}

module.exports = { asRequiredText, asOptionalText, asNumber, asEmail, asId };
