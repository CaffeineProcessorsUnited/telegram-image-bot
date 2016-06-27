var simpleGit = require('simple-git')('./');
var config = require('./config.js')();

var http = require('http');
var createHandler = require('github-webhook-handler');
var handler = createHandler({
	path: config.get("updater", "path") || "/",
	secret: config.get("updater", "secret")
});

if (!config.exists("updater", "port")) {
	console.error("You need to specify a port for the updater to liston on for webhooks!");
	process.exit(1);
}

if (!config.exists("updater", "port")) {
	console.warn("You didn't specifiy a secret! Not using a secret makes this updater runable by whoever can reach it.");
}

http.createServer(function (req, res) {
	handler(req, res, function (err) {
	res.statusCode = 404;
	res.end('');
	});
}).listen(config.get("updater", "port"));

handler.on('error', function (err) {
	console.error('Error:', err.message);
});

handler.on('push', function (event) {
	simpleGit.pull(function(err, update) {
	if(update && update.summary.changes) {
		// restart the app
		require('child_process').exec('npm restart');
	}
 });
});
