"use strict";

var config = require('./config.js')();
if (!config.exists("telegram", "token")) {
    console.error("You need to specify a token for the Telegram API");
    process.exit(1);
}
var request = require('request');

var TelegramBot = require('node-telegram-bot-api');
// Setup polling way
var bot = new TelegramBot(config.get("telegram", "token"), {polling: true});
var bing = require('./bing.js')(config.get("bing", "keys"), config.get("bing", "config"));
var google = require('./google.js')(config.get("google", "keys"), config.get("google", "config"));

var gm = require('gm').subClass({imageMagick: true});
var temp = require('temp').track();
var fs = require('fs');

var random = require('./random');
var availableProvider = [
    {
        "name": "Google",
        "class": google
    },
    {
        "name": "Bing",
        "class": bing
    }
];

var stream = require('stream');
var util = require('util');

// node v0.10+ use native Transform, else polyfill
var Transform = stream.Transform ||
  require('readable-stream').Transform;

function Upper(options) {
  // allow use without new
  if (!(this instanceof Upper)) {
    return new Upper(options);
  }

  // init Transform
  Transform.call(this, options);
}
util.inherits(Upper, Transform);

Upper.prototype._transform = function (chunk, enc, cb) {
  this.push(chunk);
  cb();
};

function sendImage(query, msg, nsfw, provider) {
    var provider = (provider === undefined) ? availableProvider[random.randomInt(0, availableProvider.length)] : provider;
    console.log("using: " + provider["name"]);
    var msgId = msg.message_id;
    var chatId = msg.chat.id;
    var resultfunc = function (result) {
        switch (result.status) {
            case 0:
                var image = result["image"];
                var path = image["contentUrl"];
                var caption = image["name"];
                var tmpout = temp.createWriteStream({suffix: ".png"});
                gm(request(path)).stream('png').on('data', function(data) {
                  tmpout.write(data);
                }).on('end', function() {
                  bot.sendPhoto(chatId, tmpout.path, {
                    reply_to_message_id: msgId,
                    caption: caption
                  }).then(function() {
                    tmpout.end();
                    temp.cleanupSync();
                  });
                });
                break;
            default:
                var message = result.message || "Unknown error!";
                bot.sendMessage(chatId, message, {
                    reply_to_message_id: msgId
                });
                break;
        }
    };
    if (provider["class"]) {
        provider["class"].getImageData(query, nsfw, resultfunc);
    } else {
        bot.sendMessage(chatId, "Can't search for images with provider\n```\n" + JSON.stringify(provider) + "\n```", {
            reply_to_message_id: msgId
        });
    }
}

function onCommand(command, query, msg, provider) {
    switch (command) {
        case "image":
            sendImage(query, msg, undefined, provider);
            break;
        case "nsfw":
            sendImage(query, msg, true, provider);
            break;
    }
}

function _1337(str) {
    str = str.replace("i","1").replace("I","1")
        .replace("a","4").replace("A","4")
        .replace("e","3").replace("E","3")
        .replace("t","7").replace("T","7")
        .replace("b","8").replace("B","8")
        .replace("o","0").replace("O","0")
        .replace("s","5").replace("S","5")
}

// Matches /image [whatever]
bot.onText(/\/image (.+)/, function (msg, match) {
    onCommand("image", match[1], msg);
});
bot.onText(/\/get (.+)/, function (msg, match) {
    onCommand("image", match[1], msg);
});
bot.onText(/\/google (.+)/, function (msg, match) {
    onCommand("image", match[1], msg, availableProvider[0]);
});
bot.onText(/\/bing (.+)/, function (msg, match) {
    onCommand("image", match[1], msg, availableProvider[1]);
});
bot.onText(/\/wow (.+)/, function (msg, match) {
    onCommand("image", "wow such "+match[1], msg);
});
bot.onText(/\/1337 (.+)/, function (msg, match) {
    onCommand("image", _1337(match[1]), msg);
});

if (config.get("bot", "nsfw")) {
    // Matches /nsfw [whatever]
    bot.onText(/\/nsfw (.+)/, function (msg, match) {
        onCommand("nsfw", match[1], msg);
    });
}
