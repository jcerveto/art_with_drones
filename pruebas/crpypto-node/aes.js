const crypto = require('crypto');

function encryptMessage(message, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cfb', key, iv);
  let encryptedMessage = cipher.update(message, 'utf-8', 'base64');
  encryptedMessage += cipher.final('base64');
  const result = Buffer.concat([iv, Buffer.from(encryptedMessage, 'base64')]).toString('base64');
  return result;
}

function decryptMessage(encryptedMessage, key) {
  const decoded = Buffer.from(encryptedMessage, 'base64');
  const iv = decoded.slice(0, 16);
  const ciphertext = decoded.slice(16);
  const decipher = crypto.createDecipheriv('aes-256-cfb', key, iv);
  let decryptedMessage = decipher.update(ciphertext, 'base64', 'utf-8');
  decryptedMessage += decipher.final('utf-8');
  return decryptedMessage;
}

// Example usage
const key = Buffer.from('Sixteen byte key'.padEnd(16, '\0'), 'utf-8');
const messageToEncrypt = 'Hello, AES encryption!';

const encryptedMessage = encryptMessage(messageToEncrypt, key);
console.log(`Encrypted message: ${encryptedMessage}`);

const decryptedMessage = decryptMessage(encryptedMessage, key);
console.log(`Decrypted message: ${decryptedMessage}`);
