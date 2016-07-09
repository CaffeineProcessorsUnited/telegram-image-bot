"use strict";
// Pr0gramm.js

var Search = require('./search');
var Error = require('./errors');
var extend = require('./extend');
var random = require('./random');

var Pr0gramm = function (config) {
    var _config, _search;

    // Constructor
    function Pr0gramm(config) {
        if (!(this instanceof Pr0gramm)) {
            return new Pr0gramm(config);
        }
        var defaults = {
            "count": 200
        };
        _config = extend(defaults, config || {});
        _search = new Search(["noop"], _config, function (query, nsfw, key) {
          return {
            url: "http://pr0gramm.com/api/items/get"
            + '?q=' + encodeURIComponent(query)
            + '&flags=' + ((nsfw || false) ? '7' : '1')
            + '&promoted=1'
          };
        });
    }

    Pr0gramm.prototype.getImageData = function (query, nsfw, success, error) {
        if (typeof nsfw === "function") {
            error = success;
            success = nsfw;
            nsfw = undefined;
        }


        var onSuccess = function(result) {
            var data = result["data"];
            if (data && data["items"]) {
                var items = data["items"];
                if (typeof items === "object" && Array.isArray(items)) {
                    var max = Math.min(_config["count"], items.length);
                    if (max == 0) {
                        error({
                            status: 1,
                            message: Error.message(Error.no_results)
                        });
                        return;
                    }
                    var image = items[random.randomInt(0, max)];
                    if (image !== undefined) {
                        success({
                            contentUrl: "http://img.pr0gramm.com/" + image["image"],
                            name: query
                        });
                        return;
                    }
                }
            }

            error({
                status: 1,
                message: Error.message(Error.empty_response)
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

    return new Pr0gramm(config);
};
var exports = module.exports = Pr0gramm;
/*var test = Pr0gramm(["AIzaSyBWWUNm5nuTg1TZzqRjPV81gIGpHObiu-E"],{"engine":"003902443275155350118:lty-b98cdnm"});
test.getImageData("test",function(data){
    console.log(data);
});

*/
