// extend.js
module.exports = function(o1, o2) {
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
  return extend(o1, o2);
}
