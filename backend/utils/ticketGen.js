const crypto = require("crypto");

const generateTicketNumber = (prefix) => {
  const year = new Date().getFullYear().toString().slice(-2);

  const randomPart = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return `${prefix}-${year}-${randomPart}`;
};

module.exports = {
  generateTicketNumber,
};