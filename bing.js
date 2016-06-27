"use strict";
// bing.js

var Search = require('./search');
var Error = require('./errors');
var extend = require('./extend');
var random = require('./random');

var Bing = function (keys, config) {
    var _config, _search;

    // Constructor
    function Bing(keys, config) {
        if (!(this instanceof Bing)) {
            return new Bing(keys);
        }
        var defaults = {
            "count": 1000,
            "market": 'en-en'
        }
        _config = extend(defaults, config || {});
        _search = new Search(keys || [], _config, function (query, nsfw) {
            return {
              url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search'
              + '?q=' + encodeURIComponent(query)
              + '&count=' + _config["count"]
              + '&offset=0'
              + '&mkt=' + _config["market"]
              + '&safeSearch=' + ((nsfw || false) ? 'Off' : 'Moderate'),
              "Ocp-Apim-Subscription-Key": key
            };
        });
    }

    Bing.prototype.getImageData = function (query, nsfw, cb) {
        if (typeof nsfw === "function") {
            cb = nsfw;
            nsfw = undefined;
        }
        _search.queryApi(query, nsfw, function (result) {
          var ok = false;
            if (!result) {
                result = {
                    "status": Error.unknown_error
                };
            } else if (result["status"] === Error.no_error) {
                var data = result["data"];
                if (data && data["value"]) {
                    var value = data["value"];
                    if (typeof value === "object" && Array.isArray(value)) {
                      var max = Math.min(_config["count"], value.length);
                      var image = value[random.randomInt(0, max)];
                      ok = true;
                      cb({
                          status: 0,
                          image: {
                              contentUrl: image["link"],
                              name: image["title"]
                          }
                      });
                    }
                }
            }
            if (!ok) {
                cb({
                    status: 1,
                    message: Error.message(result["status"])
                });
            }
        });
    };

    return new Bing(keys, config);
}

var exports = module.exports = Bing;
