"use strict";
// leet.js

  var Leet = function (ignoreCase) {
    var _translate = [];
    var _ignoreCase;
    var alphabet = [
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
      "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
    ];
    var leet = [
      "4", "8", "c", "d", "3", "f", "6", "h", "!", "j", "k", "1", "m",
      "n", "0", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
    ];
    var _file, _config;
    var addTranslation = function(from, to) {
      _translate.push({ from: from, to: to });
    }
    // Constructor
    function Leet(ignoreCase) {
      if (!(this instanceof Leet)) {
        return new Leet();
      }
      _ignoreCase = (ignoreCase === undefined) ? true : ignoreCase;
      addTranslation("a", "4");
      addTranslation("b", "8");
      addTranslation("c", "c");
      addTranslation("d", "d");
      addTranslation("e", "3");
      addTranslation("f", "f");
      addTranslation("g", "6");
      addTranslation("h", "h");
      addTranslation("i", "!");
      addTranslation("j", "j");
      addTranslation("k", "k");
      addTranslation("l", "1");
      addTranslation("m", "m");
      addTranslation("n", "n");
      addTranslation("o", "0");
      addTranslation("p", "p");
      addTranslation("q", "q");
      addTranslation("r", "r");
      addTranslation("s", "5");
      addTranslation("t", "7");
      addTranslation("u", "u");
      addTranslation("v", "v");
      addTranslation("w", "w");
      addTranslation("x", "x");
      addTranslation("y", "y");
      addTranslation("z", "2");
    }

    Leet.prototype.get = function (str) {
      for (var i = 0; i < _translate.length; i++) {
        var t = _translate[i];
        if (t.from != t.to) {
          var re = new RegExp(t.from, "g" + (_ignoreCase ? "i" : ""));
          str = str.replace(re, t.to);
        }
      }
      return str;
    };

    return new Leet(ignoreCase);
}

var exports = module.exports = Leet
