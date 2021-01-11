const http = require("http");

const server1 = http.createServer((req, res) => {
  res.end("server1");
});


server1.listen(8000, () => {
  console.log("server1 success!");
})

const server2 = new http.Server(((req, res) => {
  res.end("server2");
}));


server2.listen(8001, () => {
  console.log("server2 success!");
});
