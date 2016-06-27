"use strict";
// Google.js

var Search = require('./search');
var Error = require('./errors');
var extend = require('./extend');
var random = require('./random');

var Google = function (keys, config) {
    var _config, _search;

    // Constructor
    function Google(keys, config) {
        if (!(this instanceof Google)) {
            return new Google(keys,config);
        }
        var defaults = {
            "count": 200
        };
        _config = extend(defaults, config || {});
        _search = new Search(keys || [], _config, function (query, nsfw) {
          return 'https://www.googleapis.com/customsearch/v1'
              + '?q=' + encodeURIComponent(query)
              + '&searchType=image'
              + '&safe=' + ((nsfw || false) ? 'off' : 'high')
              + '&filter=1'
              + '&key=' + key
              + '&cx=' + _config["engine"];
        });
    }

    Google.prototype.getImageData = function (query, nsfw, cb) {
        var ok = false;
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
                if (data && data["items"]) {
                    var items = data["items"];
                    if (typeof items === "object" && Array.isArray(items)) {
                        var max = Math.min(_config["count"], items.length);
                        var image = items[random.randomInt(0, max)];
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

    return new Google(keys, config);
};
var exports = module.exports = Google;
/*var test = Google(["AIzaSyBWWUNm5nuTg1TZzqRjPV81gIGpHObiu-E"],{"engine":"003902443275155350118:lty-b98cdnm"});
test.getImageData("test",function(data){
    console.log(data);
});

*/
