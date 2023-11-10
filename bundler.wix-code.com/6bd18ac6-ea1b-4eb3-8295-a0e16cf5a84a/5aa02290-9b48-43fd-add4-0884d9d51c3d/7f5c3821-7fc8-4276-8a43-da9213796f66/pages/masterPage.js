!(function (e, t) {
  "object" == typeof exports && "object" == typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? define(["globals"], t)
    : "object" == typeof exports
    ? (exports.masterPage = t())
    : (e.masterPage = t());
})(this, function (globals) {
  var $w = globals.$w;
  globals.$ns,
    globals.$widget,
    globals.console,
    globals.elementorySupport,
    globals.generateWebMethodUrl;
  return (function () {
    "use strict";
    var e = {
        d: function (t, o) {
          for (var n in o)
            e.o(o, n) &&
              !e.o(t, n) &&
              Object.defineProperty(t, n, { enumerable: !0, get: o[n] });
        },
        o: function (e, t) {
          return Object.prototype.hasOwnProperty.call(e, t);
        },
        r: function (e) {
          "undefined" != typeof Symbol &&
            Symbol.toStringTag &&
            Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
            Object.defineProperty(e, "__esModule", { value: !0 });
        },
      },
      t = {};
    function o(e) {}
    function n(e) {}
    return (
      e.r(t),
      e.d(t, {
        header1_viewportEnter: function () {
          return o;
        },
        languageSelector43_viewportEnter: function () {
          return n;
        },
      }),
      $w.onReady(function () {}),
      t
    );
  })();
}); //# sourceMappingURL=https://bundler.wix-code.com/6bd18ac6-ea1b-4eb3-8295-a0e16cf5a84a/5aa02290-9b48-43fd-add4-0884d9d51c3d/7f5c3821-7fc8-4276-8a43-da9213796f66/pages/masterPage.js.map?get-app-def-id-from-package-name=false&resolve-npm-package-entry-by-target=false&add-ui-lib-externals=false&disable-yarn-pnp-mode=false
//# sourceURL=https://bundler.wix-code.com/6bd18ac6-ea1b-4eb3-8295-a0e16cf5a84a/5aa02290-9b48-43fd-add4-0884d9d51c3d/7f5c3821-7fc8-4276-8a43-da9213796f66/pages/masterPage.js?analyze-imported-namespaces=true&init-platform-api-provider=true&get-app-def-id-from-package-name=false&resolve-npm-package-entry-by-target=false&disable-yarn-pnp-mode=false&dependencies-token=3938&cache-buster=cachebuster2
