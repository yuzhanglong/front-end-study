const http = require('http');

const server = http.createServer((req, resp) => {
  resp.end('hello world!');
});

server.listen(8000, '127.0.0.1', () => {
  console.log('the server is running successfully!');
});
