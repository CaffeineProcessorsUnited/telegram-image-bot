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
    return str.replace("i","1").replace("I","1")
        .replace("z","2").replace("Z","2")
        .replace("e","3").replace("E","3")
        .replace("a","4").replace("A","4")
        .replace("s","5").replace("S","5")
        .replace("g","6").replace("G","6")
        .replace("t","7").replace("T","7")
        .replace("l","7").replace("L","7")
        .replace("b","8").replace("B","8")
        .replace("o","0").replace("O","0");
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
