// random.js

// inclusive low and exclusive high
var randomInt = function (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
};

module.exports = {
  randomInt: randomInt
}
