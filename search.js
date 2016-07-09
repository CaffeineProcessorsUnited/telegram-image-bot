"use strict";
// Search.js

var request = require('request');
var Keys = require('./keys');
var Error = require('./errors');
var extend = require('./extend');

var Search = function (keys, config, generateRequestOptions) {
    var _keys, _config;
    var _generateRequestOptions = generateRequestOptions;

    var queryApi = function (query, nsfw, cbsuccess, cberror) {
        if (typeof nsfw === "function") {
            cberror = cbsuccess;
            cbsuccess = nsfw;
            nsfw = undefined;
        }
        _keys.useKey(function(key, success, error, terminate){
            var options = _generateRequestOptions(query, nsfw, key);

            var onSuccess = function(body){
                var ok = true;
                try {
                    var json = JSON.parse(body);
                } catch (e) {
                    ok = false;
                    terminate(Error.malformed_response);
                }
                if(ok)
                    success(json);
            };

            var onError = function(err){
                error();
            };

            request.get(options,function(error, response, body){
               if(!error && response.statusCode == 200){
                   onSuccess(body);
               } else {
                   onError(error);
               }
            });
        }, cbsuccess, cberror);
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
