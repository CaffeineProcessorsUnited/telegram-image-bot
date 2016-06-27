"use strict";
// Search.js

var request = require('request');
var Keys = require('./keys');
var Error = require('./errors');
var extend = require('./extend');

var Search = function (keys, config, generateRequestOptions) {
    var _keys, _config;
    var _generateRequestOptions = generateRequestOptions;

    var queryApi = function (query, nsfw, cb) {
        if (typeof nsfw === "function") {
            cb = nsfw;
            nsfw = undefined;
        }
        _keys.useKey(function(key, success, error){
            var options = _generateRequestOptions(query, nsfw, key)
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
        }, cb, cb);
    };

    // Constructor
    function Search(keys, config) {
        if (!(this instanceof Search)) {
            return new Search(keys, config);
        }
        _keys = new Keys(keys || []);
        _config = extend({}, config || {});
    }

    Search.prototype.queryApi = queryApi;

    return new Search(keys, config);
};
var exports = module.exports = Search;
