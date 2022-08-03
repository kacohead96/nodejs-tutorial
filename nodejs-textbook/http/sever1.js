const http = require('http');

const server = http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-type': 'text/html; charset=utf-8' });
    res.write('<h1>Hello Node</h1>');
    res.write('<p>Hello Server</p>');
    res.write('<p>Hello User</p>');
  })
  .listen(8080);

server.on('listening', () => {
  console.log('서버 대기 중');
});
server.on('error', (error) => {
  console.error(error);
});
