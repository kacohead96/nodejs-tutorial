const crypto = require('crypto');

// crypto init
const algorithm = 'aes-256-cbc';
const key = 'abcdefghijklmnopqrstuvwxyz123456';
const iv = '1234567890123456';
const cipher = crypto.createCipheriv(algorithm, key, iv);

// encrypt
let result = cipher.update('비밀번호', 'utf8', 'base64');
result += cipher.final('base64');

console.log('result:', result);

// decrypt
const decipher = crypto.createDecipheriv(algorithm, key, iv);
let result2 = decipher.update(result, 'base64', 'utf8');

result2 += decipher.final('utf8');
console.log('result2:', result2);
