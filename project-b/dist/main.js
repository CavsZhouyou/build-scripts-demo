(() => {
  var r = {
      700: (r) => {
        r.exports = () => {
          console.log('hello world!');
        };
      },
    },
    o = {};
  !(function e(t) {
    var s = o[t];
    if (void 0 !== s) return s.exports;
    var l = (o[t] = { exports: {} });
    return r[t](l, l.exports, e), l.exports;
  })(700)();
})();
