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

var resolution = config.get("bot","resolution");

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

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function sendImage(query, msg, nsfw, provider) {
    var provider = (provider === undefined) ? availableProvider[random.randomInt(0, availableProvider.length)] : provider;
    console.log("using: " + provider["name"]);
    var msgId = msg.message_id;
    var chatId = msg.chat.id;

    var onSuccess = function(result){
        var path = result["contentUrl"];
        var caption = result["name"];
        var tmpout = temp.createWriteStream({suffix: ".png"});

        var gms = gm(request(path));
        console.log(resolution);
        if(resolution){
            gms = gms.resize(resolution[0],resolution[1]);
        }

        gms.stream('png').on('data', function(data) {
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
    };

    var onError = function(result){
        var message = result.message || "Unknown error!";
        bot.sendMessage(chatId, message, {
            reply_to_message_id: msgId
        });
    };

    if (provider["class"]) {
        provider["class"].getImageData(query, nsfw, onSuccess, onError);
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
    return str.replaceAll("i","1").replaceAll("I","1")
        .replaceAll("z","2").replaceAll("Z","2")
        .replaceAll("e","3").replaceAll("E","3")
        .replaceAll("a","4").replaceAll("A","4")
        .replaceAll("s","5").replaceAll("S","5")
        .replaceAll("g","6").replaceAll("G","6")
        .replaceAll("t","7").replaceAll("T","7")//.replaceAll("l","7").replaceAll("L","7")
        .replaceAll("b","8").replaceAll("B","8")
        .replaceAll("o","0").replaceAll("O","0");
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

bot.on('inline_query',function (a,b,c,d) {
    console.log(a,b,c,d);
});