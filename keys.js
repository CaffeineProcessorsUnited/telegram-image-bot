"use strict";

var Error = require('./errors');

var Keys = function(keys){
    var _keys;

    var getPreferredKey = function(){
        var key = undefined;
        var lastUsedIndex = new Date().getTime();

        for(var idx=0; idx < _keys.length; ++idx){
            if(!_keys[idx]["usable"])
                continue;
            //Prefer unused keys
            if(!_keys[idx]["usedon"]){
                _keys[idx]["usedon"] = new Date().getTime();
                return _keys[idx]["key"];
            }
            //Prefer least recently used keys
            if(keys[idx]["usedon"] < lastUsedIndex){
                key = idx;
                lastUsedIndex = keys[idx]["usedon"]
            }
        }
        if(key !== undefined){
            _keys[key]["usedon"] = new Date().getTime();
            return _keys[key]["key"];
        }

        // No "usable" key found - Try "unusable"
        for(var idx=0; idx < _keys.length; ++idx){
            if(_keys[idx]["usable"])
                continue;
            //Prefer unused keys
            if(!_keys[idx]["usedon"]){
                _keys[idx]["usedon"] = new Date().getTime();
                return _keys[idx]["key"];
            }
            //Prefer least recently used keys
            if(keys[idx]["usedon"] < lastUsedIndex){
                key = idx;
                lastUsedIndex = keys[idx]["usedon"]
            }
        }
        return key;
    };

    var useKey = function(onUse, success, error){
        var key = getPreferredKey();
        console.log("selcted key "+ key);

        // Key was usable
        var onSuccess = function(data){
            for(var i = 0; i< _keys.length; ++i){
                if(_keys[i]["key"] == key)
                    _keys[i]["usable"] = true;
            }
            success({
                "status": Error.no_error,
                "data": data
            })
        };

        // Key was unusable
        var onError = function(){
            for(var i = 0; i< _keys.length; ++i){
                if(_keys[i]["key"] == key)
                    _keys[i]["usable"] = false;
            }
            useKey(onUse, success, error);
        };

        // No more keys available
        var onFinalError = function(){
            error({
                "status": Error.no_keys_usable
            });
        };

        if(key === undefined){
            onFinalError()
        } else {
            onUse(key, onSuccess, onError);
        }
    };

    function Keys(keys) {
        if(!(this instanceof Keys)){
            return new Keys(keys);
        }
        keys = keys || [];
        _keys = [];
        for (var i = 0; i < keys.length; i++) {
            _keys.push({
                "key": keys[i],
                "usable": true
            });
        }
    }
    Keys.prototype.useKey = useKey;

    return new Keys(keys);
};

var exports = module.exports = Keys;

/*
var test = Keys(["abc","def"]);
test.useKey(function(key,success,error){
    console.log(key);
    if(key == "def")
        success();
    else
        error();
},function (data){
    console.log("success", data);
}, function (data){
    console.log("error",data)
});*/
