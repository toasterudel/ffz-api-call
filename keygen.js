const crypto = require('crypto');

const API_KEY_LENGTH = 32; // 32 characters

const generateAPIKey = () => {
  const buffer = crypto.randomBytes(API_KEY_LENGTH / 2);
  return buffer.toString('hex');
};

console.log(generateAPIKey()); // prints a random 32-character string like "2a1c13d4f5b6..."
