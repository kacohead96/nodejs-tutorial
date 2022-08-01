const fs = require('fs');
const readStream = fs.createReadStream('./readme.txt', { highWaterMark: 16 });

const data = [];
readStream.on('data', (chunk) => {
  data.push(chunk);
  console.log('chunk=>', chunk, chunk.length);
});
readStream.on('end', () => {
  console.log(
    'Buffer.concat(data).toString()=>',
    Buffer.concat(data).toString()
  );
});
readStream.on('error', (error) => {
  console.log('error=>', error);
});
