"use strict";

var Errors = function(){
    var _errors = [];

    var errorCode = function (name) {
        for (var i = 0; i < _errors.length; i++) {
            if (_errors[i]["name"] === name) {
                return i;
            }
        }
        // Don't have 42 error messages
        return 42;
    };

    var errorMessage = function (code) {
        return _errors[code]["message"];
    };

    var error = {
        "code": errorCode,
        "message": errorMessage
    };

    var addError = function (name, message) {
      if (name == "code" || name == "message") {
        return;
      }
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
      error[name] = _errors.length - 1;
    };

    addError("no_error", "There were no errors.");
    addError("unknown_error", "I don't know why it didn't work. :(");
    addError("connection_error", "The bot couldn't connect to the API server");
    addError("no_keys_usable", "Apparently you have keys with quota left.");
    addError("invalid_key", "The key is invalid.");
    addError("infinite_loop_detected", "Loop-Loop-Loop");
    addError("malformed_response", "The bot couldn't parse the API servers response.");
    addError("no_results", "I couldn't find any images for you :(");
    addError("empty_response", "The search API acted strange...");

    return error;
};

var exports = module.exports = Errors();
