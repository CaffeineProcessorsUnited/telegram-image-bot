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
    var provider = provider || availableProvider[random.randomInt(0, availableProvider.length)];
    var msgId = msg.message_id;
    var chatId = msg.chat.id;
    var resultfunc = function (result) {
        switch (result.status) {
            case 0:
                var image = result["image"];
                var path = image["contentUrl"];
                var caption = image["name"];
                bot.sendPhoto(chatId, request(path), {
                    reply_to_message_id: msgId,
                    caption: caption
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

function onCommand(command, query, msg) {
    switch (command) {
        case "image":
            sendImage(query, msg);
            break;
        case "nsfw":
            sendImage(query, msg, true);
            break;
    }
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

if (config.get("bot", "nsfw")) {
    // Matches /nsfw [whatever]
    bot.onText(/\/nsfw (.+)/, function (msg, match) {
        onCommand("nsfw", match[1], msg);
    });
}
