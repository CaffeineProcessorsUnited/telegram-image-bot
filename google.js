"use strict";
// Google.js

var request = require('request');
var Keys = require('./keys');
var Error = require('./errors');

var Google = function (keys, config) {
    var _keys, _config;

    var clone = function (o) {
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
    var extend = function (o1, o2) {
        // extend object1 with object2
        var e = clone(o1);
        for (var k in o2) {
            if (o2.hasOwnProperty(k) && o2[k] !== undefined) {
                e[k] = o2[k];
            }
        }
        return e;
    };

    // inclusive low and exclusive high
    var randomInt = function (low, high) {
        return Math.floor(Math.random() * (high - low) + low);
    };

    var generateUrl = function (query, nsfw, key) {
        console.log("---CONFIG:",_config);
        nsfw = nsfw || false;
        return 'https://www.googleapis.com/customsearch/v1'
            + '?q=' + encodeURIComponent(query)
            + '&searchType=image'
            + '&safe=' + (nsfw ? 'off' : 'high')
            + '&filter=1'
            + '&key=' + key
            + '&cx=' + _config["engine"];
    };

    /*
     status:
     0 - everything ok
     1 - no connection
     1 - no connection
     2 - no available keys
     3 - used key was invalid
     */
    var queryApi = function (query, nsfw, cb) {
        if (typeof nsfw === "function") {
            cb = nsfw;
            nsfw = undefined;
        }
        _keys.useKey(function(key, success, error){
            var url = generateUrl(query, nsfw, key);
            console.log(url);
            var options = {
                url: url
            };
            request.get(options, function (err, res, body) {
                if (err != null) {
                    console.error(err);
                    error();
                } else {
                    switch (res.statusCode) {
                        case 200:
                            var ok = true;
                            try {
                                var json = JSON.parse(body);
                            } catch (e) {
                                console.error("Received data was malformed json! Unable to parse.",body);
                                //Received data was malformed json! Unable to parse.
                                ok = false;
                                error();
                            }
                            if(ok)
                                success(json);
                            break;
                        case 401:
                            // This is an invalid key! You should remove it. But we will try a different key
                            console.error("The key\n", key, "\n is invalid! You should remove it from the configuration file.");
                            error();
                            break;
                        case 403:
                            // This key doesn't work. Try another one
                            console.error("This key doesn't work. Try another one");
                            error();
                            break;
                        default:
                            // What happened?
                            console.error("unknown error", body);
                            error({
                                "status": Error.unknown_error,
                                "data": body
                            });
                            break;
                    }
                }
            });
        },cb,cb);
    };

    // Constructor
    function Google(keys, config) {
        if (!(this instanceof Google)) {
            return new Google(keys,config);
        }
        _keys = new Keys(keys || []);
        
        var defaults = {
            "count": 200
        };
        _config = extend(defaults, config || {});

    }

    Google.prototype.test = function (cb) {
        queryApi("test", function (result) {
            if (!result) {
                result = {
                    "status": Error.unknown_error
                };
            }
            cb(result);
        });
    };

    Google.prototype.getImageData = function (query, nsfw, cb) {
        var ok = false;
        if (typeof nsfw === "function") {
            cb = nsfw;
            nsfw = undefined;
        }
        queryApi(query, nsfw, function (result) {
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
                        var image = items[randomInt(0, max)];
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
            if(!ok){
                cb({
                    status: 1,
                    message: result["status"]
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