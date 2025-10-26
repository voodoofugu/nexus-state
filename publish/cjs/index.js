"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var e = require("react");
function t(e) {
  const { state: t, actions: n } = e;
  let s = Object.assign({}, t);
  const r = new Map(),
    o = [],
    c = (e) => {
      var t;
      "*" === e
        ? r.forEach((e) => e.forEach((e) => e()))
        : (e.forEach((e) => {
            var t;
            return null === (t = r.get(e)) || void 0 === t
              ? void 0
              : t.forEach((e) => e());
          }),
          null === (t = r.get("*")) || void 0 === t || t.forEach((e) => e()));
    },
    u = (e) => {
      const t = Object.assign({}, s),
        n = "function" == typeof e ? e(t) : e;
      let r = Object.assign(Object.assign({}, s), n);
      for (const e of o) {
        const n = e(t, r);
        void 0 !== n && (r = n);
      }
      const u = [];
      for (const e in r)
        Object.prototype.hasOwnProperty.call(r, e) &&
          s[e] !== r[e] &&
          u.push(e);
      u.length && ((s = r), c(u));
    },
    a = {
      get: function (e) {
        return void 0 !== e ? s[e] : s;
      },
      set: u,
      reset: () => {
        (s = Object.assign({}, t)), c("*");
      },
      subscribe: (e, t) => {
        if (0 === t.length) return () => {};
        const n = () => e(s);
        return "*" === t[0]
          ? (r.has("*") || r.set("*", new Set()),
            r.get("*").add(n),
            () => {
              var e;
              return null === (e = r.get("*")) || void 0 === e
                ? void 0
                : e.delete(n);
            })
          : (t.forEach((e) => {
              r.has(e) || r.set(e, new Set()), r.get(e).add(n);
            }),
            () => {
              t.forEach((e) => {
                var t;
                return null === (t = r.get(e)) || void 0 === t
                  ? void 0
                  : t.delete(n);
              });
            });
      },
      middleware: (e) => {
        o.push(e);
      },
    },
    i = {};
  if (Array.isArray(n))
    for (const e of n) {
      const t = e.call(i, u);
      t && "object" == typeof t && Object.assign(i, t);
    }
  else if ("function" == typeof n) {
    const e = n.call(i, u);
    e && "object" == typeof e && Object.assign(i, e);
  }
  for (const e of Object.keys(i)) {
    const t = i[e];
    "function" == typeof t && (i[e] = t.bind(i));
  }
  return { store: a, actions: i };
}
function n(n) {
  const s = () => {
      const [, t] = e.useReducer(() => ({}), {});
      return t;
    },
    { store: r, actions: o } = t(n);
  return {
    store: Object.assign(Object.assign({}, r), {
      use: function (t) {
        return e.useSyncExternalStore(
          (e) => r.subscribe(e, t ? [t] : []),
          () => (t ? r.get(t) : r.get())
        );
      },
      useRerender: s,
      useSelector: function (t, n) {
        const o = s(),
          c = e.useRef(t(r.get()));
        return (
          e.useEffect(() => {
            const e = (e) => {
                const n = t(e);
                n !== c.current && ((c.current = n), o());
              },
              s = r.subscribe(e, n);
            return e(r.get()), s;
          }, [t, n.join()]),
          c.current
        );
      },
    }),
    actions: o,
  };
}
function s(e) {
  return function (t) {
    return e.call(this, t);
  };
}
const r = { createNexus: t, createReactNexus: n, createActs: s };
(exports.createActs = s),
  (exports.createReactNexus = n),
  (exports.createNexus = t),
  (exports.default = r);
