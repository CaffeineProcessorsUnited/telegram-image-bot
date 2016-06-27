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

function sendImage(query, msg, nsfw) {
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
    var r = Math.random() < 0;
    if (r) {
        bing.getImageData(query, nsfw, resultfunc);
    } else {
        google.getImageData(query, nsfw, resultfunc);
    }
}

function onCommand(command, query, msg) {
    switch (command) {
        case "image":
            sendImage(query, msg);
            break;
        case "image":
            sendImage(query, msg, true);
            break;
    }
}

// Matches /image [whatever]
bot.onText(/\/image (.+)/, function (msg, match) {
    onCommand("image", match[1], msg);
});

if (config.get("bot", "nsfw")) {
    // Matches /nsfw [whatever]
    bot.onText(/\/nsfw (.+)/, function (msg, match) {
        onCommand("nsfw", match[1], msg);
    });
}
