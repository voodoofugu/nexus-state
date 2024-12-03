"use strict";
var e = require("react/jsx-runtime"),
  t = require("react");
function r(e, r) {
  const n = (function (e) {
    let r = e;
    const n = t.useRef(new Set());
    return {
      get: t.useCallback(() => r, []),
      set: t.useCallback((e) => {
        (r = Object.assign(Object.assign({}, r), e)),
          n.current.forEach((e) => e());
      }, []),
      subscribe: t.useCallback(
        (e) => (n.current.add(e), () => n.current.delete(e)),
        []
      ),
    };
  })(e);
  return {
    get: function (r) {
      return (
        r in n.get() ||
          console.error(`State "${String(r)}" in useNexus not found 👺`),
        t.useSyncExternalStore(
          n.subscribe,
          () => {
            var t;
            return null !== (t = n.get()[r]) && void 0 !== t ? t : e[r];
          },
          () => e[r]
        )
      );
    },
    dispatch: function (e) {
      const t = n.get(),
        s = r(t, e);
      t !== s && n.set(s);
    },
    getAll: function () {
      return t.useSyncExternalStore(n.subscribe, n.get, () => e);
    },
    selector: function (r) {
      const s = n.get();
      return (
        void 0 === r(s) &&
          console.error("State in useNexusSelect not found 👺"),
        t.useSyncExternalStore(
          n.subscribe,
          () => r(n.get()),
          () => r(e)
        )
      );
    },
    subscribe: n.subscribe,
  };
}
const n = t.createContext(null);
let s = null;
function i() {
  const e = t.useContext(n);
  if (!e) throw new Error("NexusProvider not found 👺");
  return e;
}
(exports.NexusProvider = ({ initialStates: t, actions: i, children: o }) => {
  const u = (function (e) {
      return function t(r, n, s) {
        var i, o;
        if (Array.isArray(n.payload) && !s)
          return n.payload.reduce((e, r) => t(e, r, !0), r);
        const { stateKey: u, payload: c, type: a } = n;
        if (u) {
          const e = r[u],
            t = "function" == typeof c ? c(e) : c;
          if (t != e) return Object.assign(Object.assign({}, r), { [u]: t });
        }
        if (a) {
          const t = e[a];
          if (null == t ? void 0 : t.reducer) {
            const t = n.type,
              s = e[t],
              u =
                null !==
                  (o =
                    null === (i = s.reducer) || void 0 === i
                      ? void 0
                      : i.call(s, r, n)) && void 0 !== o
                  ? o
                  : r;
            if (u !== r) return u;
          }
          (null == t ? void 0 : t.action) && t.action(c);
        }
        return r;
      };
    })(i || {}),
    c = structuredClone(t),
    a = Object.assign(Object.assign({}, r(c, u)), { initialStates: t });
  return (s = a.dispatch), e.jsx(n.Provider, { value: a, children: o });
}),
  (exports.nexusEffect = function (e) {
    if (!s)
      throw new Error(
        "nexusEffect is not initialized. Make sure NexusProvider is used 👺"
      );
    s({ payload: Array.isArray(e) ? e : [e] });
  }),
  (exports.nexusUpdate = function (e) {
    if (!s)
      throw new Error(
        "nexusEffect is not initialized. Make sure NexusProvider is used 👺"
      );
    if ("_NEXUS_" in e) {
      const t = e._NEXUS_;
      s({
        payload: Object.keys(t).map((e) => ({ stateKey: e, payload: t[e] })),
      });
    } else {
      const t = Object.entries(e).map(([e, t]) => ({
        stateKey: e,
        payload: t,
      }));
      s({ payload: t });
    }
  }),
  (exports.useNexus = function (e) {
    const t = i();
    return e ? t.get(e) : t.getAll();
  }),
  (exports.useNexusSelect = (e) => e(i().getAll()));
