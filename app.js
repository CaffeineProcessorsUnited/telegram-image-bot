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

var availableProvider = {};

var bing = require('./bing.js')(config.get("bing", "keys"), config.get("bing", "config"));
if (config.get("bing", "keys") && config.get("bing", "keys").length > 0) {
  availableProvider["bing"] = {
    name: "Bing",
    class: bing
  };
}

var google = require('./google.js')(config.get("google", "keys"), config.get("google", "config"));
if (config.get("google", "keys") && config.get("google", "keys").length > 0) {
  availableProvider["google"] = {
    name: "Google",
    class: google
  };
}

var pr0 = require('./pr0gramm.js')(config.get("pr0gramm","config"));
availableProvider["pr0gramm"] =  {
    name: "Pr0gramm",
    class: pr0
};

if (Object.keys(availableProvider).length == 0) {
  console.error("The bot couldn't load any search provider and thus will not work! Have a look at README.md on how to correctly setup search providers.");
  process.exit(1);
}

console.log("Bot is running with " + Object.keys(availableProvider).length + " available search providers.");

var gm = require('gm').subClass({imageMagick: true});
var temp = require('temp').track();
var fs = require('fs');
var random = require('./random');
var leet = require('./leet')();

var resolution = config.get("bot", "resolution");

function sendImage(query, msg, nsfw, providername) {
    var providername = (providername === undefined || availableProvider[providername] === undefined)
     ? Object.keys(availableProvider)[random.randomInt(0, Object.keys(availableProvider).length)] : providername;
    var provider = availableProvider[providername];
    var msgId = msg.message_id;
    var chatId = msg.chat.id;
    if (provider === undefined) {
      bot.sendMessage(chatId, "There are no search providers available!", {
          reply_to_message_id: msgId
      });
    }
    console.log("using: " + provider["name"]);

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

// Matches /image [whatever]
bot.onText(/\/image (.+)/, function (msg, match) {
    onCommand("image", match[1], msg);
});
bot.onText(/\/get (.+)/, function (msg, match) {
    onCommand("image", match[1], msg);
});
bot.onText(/\/google (.+)/, function (msg, match) {
    onCommand("image", match[1], msg, "google");
});
bot.onText(/\/bing (.+)/, function (msg, match) {
    onCommand("image", match[1], msg, "bing");
});
bot.onText(/\/pr0 (.+)/, function (msg, match) {
    onCommand("image", match[1], msg, "pr0gramm");
});
bot.onText(/\/wow (.+)/, function (msg, match) {
    onCommand("image", "wow such "+match[1], msg);
});
bot.onText(/\/1337 (.+)/, function (msg, match) {
    onCommand("image", leet.get(match[1]), msg);
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
