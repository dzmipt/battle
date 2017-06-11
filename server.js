var http = require("http");

var x=0;

http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World");
  response.end();
  console.log(x++);
}).listen(1234);

console.error("Started");