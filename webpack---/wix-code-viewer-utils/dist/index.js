!(function (e, t) {
  "object" == typeof exports && "object" == typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? define([], t)
    : "object" == typeof exports
    ? (exports.wixCodeViewerUtils = t())
    : (e.wixCodeViewerUtils = t());
})("undefined" != typeof self ? self : this, function () {
  return (function (e) {
    var t = {};
    function n(r) {
      if (t[r]) return t[r].exports;
      var o = (t[r] = { i: r, l: !1, exports: {} });
      return e[r].call(o.exports, o, o.exports, n), (o.l = !0), o.exports;
    }
    return (
      (n.m = e),
      (n.c = t),
      (n.d = function (e, t, r) {
        n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: r });
      }),
      (n.r = function (e) {
        "undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(e, "__esModule", { value: !0 });
      }),
      (n.t = function (e, t) {
        if ((1 & t && (e = n(e)), 8 & t)) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var r = Object.create(null);
        if (
          (n.r(r),
          Object.defineProperty(r, "default", { enumerable: !0, value: e }),
          2 & t && "string" != typeof e)
        )
          for (var o in e)
            n.d(
              r,
              o,
              function (t) {
                return e[t];
              }.bind(null, o)
            );
        return r;
      }),
      (n.n = function (e) {
        var t =
          e && e.__esModule
            ? function () {
                return e.default;
              }
            : function () {
                return e;
              };
        return n.d(t, "a", t), t;
      }),
      (n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
      }),
      (n.p = ""),
      n((n.s = 1))
    );
  })([
    function (e, t, n) {
      "use strict";
      var r = { "wix-users": "user", "wix-events": "wixEvents" };
      (e.exports.namespaceToSdk = function (e) {
        return r[e] || e.replace("wix-", "").replace(/-frontend$/, "");
      }),
        (e.exports.sdkToNamespace = function (e) {
          return (
            Object.keys(r).find(function (t) {
              return r[t] === e;
            }) || "wix-" + e
          );
        });
    },
    function (e, t, n) {
      "use strict";
      var r = n(2).buildNamespacesMap,
        o = n(0).namespaceToSdk;
      e.exports = { buildNamespacesMap: r, namespaceToSdk: o };
    },
    function (e, t, n) {
      "use strict";
      var r = n(3).createWixFetch,
        o = n(0).sdkToNamespace;
      e.exports = {
        buildNamespacesMap: function (e, t) {
          var n =
            arguments.length > 2 && void 0 !== arguments[2]
              ? arguments[2]
              : function (e) {
                  return e;
                };
          return Object.keys(e).reduce(
            function (t, r) {
              var u = e[r];
              switch (r) {
                case "events":
                  break;
                default:
                  var i = o(r);
                  (t[i] = n(u)), (t[i + "-frontend"] = n(u));
              }
              return t;
            },
            { "wix-fetch": n(r(t)) }
          );
        },
      };
    },
    function (e, t, n) {
      "use strict";
      var r =
        Object.assign ||
        function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        };
      e.exports = {
        createWixFetch: function (e) {
          return {
            fetch: e,
            getJSON: function (t) {
              var n =
                  arguments.length > 1 && void 0 !== arguments[1]
                    ? arguments[1]
                    : {},
                o = r({}, n, {
                  method: "GET",
                  headers: r({ Accept: "application/json" }, n.headers),
                });
              return e(t, o).then(function (e) {
                return e.json();
              });
            },
          };
        },
      };
    },
  ]);
});
