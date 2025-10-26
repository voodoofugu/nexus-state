import {
  useRef as t,
  useEffect as e,
  useReducer as n,
  useSyncExternalStore as s,
} from "react";
function o(t) {
  const { state: e, actions: n } = t;
  let s = Object.assign({}, e);
  const o = new Map(),
    r = [],
    c = (t) => {
      var e;
      "*" === t
        ? o.forEach((t) => t.forEach((t) => t()))
        : (t.forEach((t) => {
            var e;
            return null === (e = o.get(t)) || void 0 === e
              ? void 0
              : e.forEach((t) => t());
          }),
          null === (e = o.get("*")) || void 0 === e || e.forEach((t) => t()));
    },
    u = (t) => {
      const e = Object.assign({}, s),
        n = "function" == typeof t ? t(e) : t;
      let o = Object.assign(Object.assign({}, s), n);
      for (const t of r) {
        const n = t(e, o);
        void 0 !== n && (o = n);
      }
      const u = [];
      for (const t in o)
        Object.prototype.hasOwnProperty.call(o, t) &&
          s[t] !== o[t] &&
          u.push(t);
      u.length && ((s = o), c(u));
    },
    a = {
      get: function (t) {
        return void 0 !== t ? s[t] : s;
      },
      set: u,
      reset: () => {
        (s = Object.assign({}, e)), c("*");
      },
      subscribe: (t, e) => {
        if (0 === e.length) return () => {};
        const n = () => t(s);
        return "*" === e[0]
          ? (o.has("*") || o.set("*", new Set()),
            o.get("*").add(n),
            () => {
              var t;
              return null === (t = o.get("*")) || void 0 === t
                ? void 0
                : t.delete(n);
            })
          : (e.forEach((t) => {
              o.has(t) || o.set(t, new Set()), o.get(t).add(n);
            }),
            () => {
              e.forEach((t) => {
                var e;
                return null === (e = o.get(t)) || void 0 === e
                  ? void 0
                  : e.delete(n);
              });
            });
      },
      middleware: (t) => {
        r.push(t);
      },
    },
    i = {};
  if (Array.isArray(n))
    for (const t of n) {
      const e = t.call(i, u);
      e && "object" == typeof e && Object.assign(i, e);
    }
  else if ("function" == typeof n) {
    const t = n.call(i, u);
    t && "object" == typeof t && Object.assign(i, t);
  }
  for (const t of Object.keys(i)) {
    const e = i[t];
    "function" == typeof e && (i[t] = e.bind(i));
  }
  return { store: a, actions: i };
}
function r(r) {
  const c = () => {
      const [, t] = n(() => ({}), {});
      return t;
    },
    { store: u, actions: a } = o(r);
  return {
    store: Object.assign(Object.assign({}, u), {
      use: function (t) {
        return s(
          (e) => u.subscribe(e, t ? [t] : []),
          () => (t ? u.get(t) : u.get())
        );
      },
      useRerender: c,
      useSelector: function (n, s) {
        const o = c(),
          r = t(n(u.get()));
        return (
          e(() => {
            const t = (t) => {
                const e = n(t);
                e !== r.current && ((r.current = e), o());
              },
              e = u.subscribe(t, s);
            return t(u.get()), e;
          }, [n, s.join()]),
          r.current
        );
      },
    }),
    actions: a,
  };
}
function c(t) {
  return function (e) {
    return t.call(this, e);
  };
}
const u = { createNexus: o, createReactNexus: r, createActs: c };
export {
  c as createActs,
  r as createReactNexus,
  o as createNexus,
  u as default,
};
