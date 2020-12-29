const http = require("http");
const fs = require("fs");
const qs = require("querystring");

const server = http.createServer(((req, res) => {
  if (req.url === "/upload") {
    if (req.method === 'POST') {
      req.setEncoding('binary');
      let body = '';

      // 拿到 boundary 字符串
      const totalBoundary = req.headers['content-type'].split("; ")[1];
      const boundary = totalBoundary.split("=")[1];

      req.on('data', (data) => {
        body += data;
      });

      req.on('end', () => {
        // qs.parse 一般用于处理 url 之后的 query，这里利用它来处理字符串
        // 在这里， “\r\n” 相当于 & 分隔符，“: ” 相当于 key
        const payload = qs.parse(body, "\r\n", ": ");

        // 拿到 content type -- image/png
        const type = payload["Content-Type"];
        const startIndex = body.indexOf(type);

        // 切割字符串，从 contenttype 之后的内容开始截取
        let imageData = body.slice(startIndex + type.length);
        imageData = imageData.replace(/^\s\s*/, '')
        imageData = imageData.slice(0, imageData.indexOf(`--${boundary}--`));
        fs.writeFile('./foo.png', imageData, 'binary', (err) => {
          res.end("upload successfully!");
        })
      })
    }
  }
}));


server.listen(8000, '127.0.0.1', () => {
  console.log("success~");
});


