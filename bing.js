"use strict";
// bing.js

var request = require('request');

var Bing = function(keys, config) {
    var _keys, _config;
    
    var _errors = [];

    var addError = function(name, message) {
      if (_errors.length == 42) {
        _errors.push({
          "name": "answer_to_the_ultimate_question_of_life_the_universe_and_everything",
          "message": "You just found the Answer to the Ultimate Question of Life, The Universe, and Everything!"
        });
      }
      _errors.push({
        "name": name,
        "message": message
      });
    }

    addError("no_error", "There were no errors.");
    addError("unknown_error", "I don't know why it didn't work. :(");
    addError("connection_error", "The bot couldn't connect to the API server");
    addError("no_keys_usable", "Apparently you have keys with quota left.");
    addError("invalid_key", "The key is invalid.");
    addError("infinite_loop_detected", "Loop-Loop-Loop");
    addError("malformed_response", "The bot couldn't parse the API servers response.");

    var errorCode = function(name) {
      for(var i = 0; i < _errors.length; i++) {
        if (_errors[i]["name"] === name) {
          return i;
        }
      }
      // Don't have 42 error messages
      return 42;
    }

    var errorMessage = function(code) {
      return _errors[code]["message"];
    }

    var clone = function(o) {
      if (undefined == o || typeof o !== "object") {
        return o;
      }
      var copy = o.constructor();
      for (var k in o) {
        if (o.hasOwnProperty(k)) {
          copy[k] = o[k];
        }
      }
      return copy;
    };
    var extend = function(o1, o2) {
      // extend object1 with object2
      var e = clone(o1);
      for (var k in o2) {
          if (o2.hasOwnProperty(k)) {
             e[k] = o2[k];
          }
       }
       return e;
    };

    // inclusive low and exclusive high
    var randomInt = function(low, high) {
      return Math.floor(Math.random() * (high - low) + low);
    };

    var getAvailableApiKey = function() {
      var result = undefined;
      for (var i = 0; i < _keys.length; i++) {
        if (_keys[i]["usable"] === true) {
          result = {
            "i": i,
            "key": _keys[i]["key"]
          };
          break;
        }
      }
      return result;
    }

    var getLeastUsedApiKey = function() {
      var result = {
        "i": -1,
        "date": new Date().getTime()
      };
      for (var i = 0; i < _keys.length; i++) {
        if (_keys[i]["usable"] === true) {
          result = {
            "i": i,
            "key": _keys[i]["key"]
          };
          break;
        }
      }
      return result;
    }

    /*
      Use a key, if it falis try the next key
    */
    var useKey = function(onUse, keysUsed) {
      var keysUsed = (keysUsed === undefined) ? -1 : keysUsed;
      var onSuccess = function(cb, key, data) {
        _keys[key["i"]]["usable"] = true;
        _keys[key["i"]]["usedon"] = new Date().getTime();
        cb({
          "status": errorCode("no_error"),
          "data": data
        });
      };
      var onError = function(cb, key) {
        _keys[key["i"]]["usable"] = false;
        _keys[key["i"]]["usedon"] = new Date().getTime();
        var result = useKey(onUse, ++keysUsed);
        if (result === false) {
          return cb({
            "status": errorCode("no_keys_usable")
          });
        }
        return result;
      };
      var key;
      if (keysUsed === -1) {
        key = getAvailableApiKey();
      }
      if (key === undefined && keysUsed < _keys.length) {
        key = {
          "i": keysUsed,
          "key": _keys[keysUsed]["key"]
        };
      }
      // try with another key
      if (keysUsed < _keys.length) {
        onUse(key, keysUsed, onSuccess, onError);
        return true;
      }
      // we tried all keys... we dont have any quota left
      return false;

    }

    var generateUrl = function(query, nsfw) {
      nsfw = nsfw || false;
      return 'https://api.cognitive.microsoft.com/bing/v5.0/images/search'
          + '?q=' + encodeURIComponent(query)
          + '&count=' + _config["count"]
          + '&offset=0'
          + '&mkt=' + _config["market"]
          + '&safeSearch=' + (nsfw ? 'Off' : 'Moderate');
    }

    /*
      status:
      0 - everything ok
      1 - no connection
      1 - no connection
      2 - no available keys
      3 - used key was invalid
    */
    var queryApi = function(query, nsfw, cb) {
      if (typeof nsfw === "function") {
        cb = nsfw;
        nsfw = undefined;
      }
      useKey(function(key, keysUsed, success, error) {
        var options = {
          url: generateUrl(query, nsfw),
          headers: {
            'Ocp-Apim-Subscription-Key': key["key"]
          }
        };
        request.get(options, function (err, res, body) {
          if (err != null) {
            console.error(err);
            cb({
              "status": errorCode("connection_error")
            });
          } else {
            switch (res.statusCode) {
              case 200:
                try {
                  var json = JSON.parse(body);
                  success(cb, key, json);
                } catch(e) {
                  //Received data was malformed json! Unable to parse.
                  cb({
                    "status": errorCode("malformed_response")
                  });
                }
                break;
              case 401:
                // This is an invalid key! You should remove it. But we will try a different key
                console.error("The key\n", key, "\n is invalid! You should remove it from the configuration file.");
                error(cb, key);
                break;
              case 403:
                // This key doesn't work. Try another one
                error(cb, key);
                break;
              default:
                // What happened?
                cb({
                  "status": errorCode("unknown_error"),
                  "data": body
                });
                break;
            }
          }
        });
      });
    }

    // Constructor
    function Bing(keys, config) {
      if (!(this instanceof Bing)) {
        return new Bing(keys);
      }
      keys = keys || [];
      _keys = [];
      for (var i = 0; i < keys.length; i++) {
        _keys.push({
          "key": keys[i],
          "usable": true
        });
      }
      var defaults = {
        "count": 1000,
        "market": 'de-de'
      }
      _config = extend(defaults, config || {});

    }

    Bing.prototype.test = function (cb) {
      queryApi("test", function(result) {
        if (!result) {
          result = {
            "status": errorCode("unknown_error")
          };
        }
        cb(result);
      });
    };

    Bing.prototype.getImageData = function(query, nsfw, cb) {
      if (typeof nsfw === "function") {
        cb = nsfw;
        nsfw = undefined;
      }
      queryApi(query, nsfw, function(result) {
        if (!result) {
          result = {
            "status": errorCode("unknown_error")
          };
        } else if (result["status"] === errorCode("no_error")) {
          var data = result["data"]
          if (data && data["value"]) {
            var value = data["value"];
            if (typeof value === "object" && Array.isArray(value)) {
              var max = Math.min(_config["count"], value.length);
              result["image"] = value[randomInt(0, max)];
            }
          }
          delete result["data"];
        }
        result["message"] = errorMessage(result["status"]);
        cb(result);
      });
    };

    return new Bing(keys, config);
}

var exports = module.exports = Bing
