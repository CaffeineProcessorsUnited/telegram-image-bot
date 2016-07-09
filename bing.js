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
        };
        _config = extend(defaults, config || {});
        _search = new Search(keys || [], _config, function (query, nsfw, key) {
            return {
              url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search'
              + '?q=' + encodeURIComponent(query)
              + '&count=' + _config["count"]
              + '&offset=0'
              + '&mkt=' + _config["market"]
              + '&safeSearch=' + ((nsfw || false) ? 'Off' : 'Moderate'),
              headers : {"Ocp-Apim-Subscription-Key": key}
            };
        });
    }

    Bing.prototype.getImageData = function (query, nsfw, success, error) {
        if (typeof nsfw === "function") {
            error = success;
            success = nsfw;
            nsfw = undefined;
        }

        var onSuccess = function(result){
            var ok = false;
            var data = result["data"];
            if (data && data["value"]) {
                var value = data["value"];
                if (typeof value === "object" && Array.isArray(value)) {
                    var max = Math.min(_config["count"], value.length);
                    var image = value[random.randomInt(0, max)];
                    if (image != undefined && image["contentUrl"] != undefined){
                        success({
                            contentUrl: image["contentUrl"],
                            name: image["name"]
                        });
                        return;
                    }
                }
            }

            error({
                status: 1,
                message: Error.message(Error.unknown_error)
            });
        };

        var onError = function(err){
            error({
                status: 1,
                message: Error.message(err["status"])
            });
        };

        _search.queryApi(query, nsfw, onSuccess, onError);
    };

    return new Bing(keys, config);
};

var exports = module.exports = Bing;
