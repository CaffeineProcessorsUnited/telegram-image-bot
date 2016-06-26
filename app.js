"use strict";
var config = require('./config.js')();
if (!config.exists("telegram", "token")) {
  console.error("You need to specify a token for the Telegram API");
  process.exit(1);
}

var request = require('request');

var TelegramBot = require('node-telegram-bot-api');

// Setup polling way
var bot = new TelegramBot(config.get("telegram", "token"), { polling: true });

function sendImage(query, msg, nsfw) {
  var msgId = msg.message_id;
  var chatId = msg.chat.id;
  bing.getImageData(query, nsfw, function(result) {
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
  });
}

function onCommand(command, query, msg) {
  switch(command) {
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

// Matches /nsfw [whatever]
bot.onText(/\/nsfw (.+)/, function (msg, match) {
  onCommand("nsfw", match[1], msg);
});

var bing = require('./bing.js')(config.get("bing", "keys"));
