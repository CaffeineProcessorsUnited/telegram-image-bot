var config = new (require('./config.js'))("config.sample.json");
console.log(config.exists("token"));
console.log(config.get("token"));

var config = require('./config.js')();
console.log(config.exists("token"));
console.log(config.get("token"));
