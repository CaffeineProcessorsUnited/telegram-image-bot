"use strict";
// config.js

var fs = require('fs');

function fileExists(path) {
    try {
        var stats = fs.lstatSync(path);
        if (stats.isFile()) {
            return true;
        }
    } catch (e) {
    }
    return false;
}

var Config = function (file) {
    var _file, _config;
    // Constructor
    function Config(file) {
        if (!(this instanceof Config)) {
            return new Config(file);
        }
        _file = file || "config.json";
        if (fileExists(_file)) {
            try {
                _config = JSON.parse(fs.readFileSync(_file));
            } catch (e) {
            }
        }
        _config = _config || {};
    }

    Config.prototype.get = function () {
        var c = _config;
        for (var i = 0; i < arguments.length; i++) {
            if (c[arguments[i]]) {
                c = c[arguments[i]];
            } else {
                return undefined;
            }
        }
        return c;
    };

    Config.prototype.exists = function () {
        return this.get.apply(null, arguments) !== undefined;
    };

    return new Config(file);
}

var exports = module.exports = Config
