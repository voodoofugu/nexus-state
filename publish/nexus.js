"use strict";
var e,
  r = require("react"),
  t = { exports: {} },
  n = {};
var o,
  a,
  i = {};
function s() {
  return (
    o ||
      ((o = 1),
      "production" !== process.env.NODE_ENV &&
        (function () {
          var e = r,
            t = Symbol.for("react.element"),
            n = Symbol.for("react.portal"),
            o = Symbol.for("react.fragment"),
            a = Symbol.for("react.strict_mode"),
            s = Symbol.for("react.profiler"),
            c = Symbol.for("react.provider"),
            u = Symbol.for("react.context"),
            l = Symbol.for("react.forward_ref"),
            f = Symbol.for("react.suspense"),
            p = Symbol.for("react.suspense_list"),
            y = Symbol.for("react.memo"),
            d = Symbol.for("react.lazy"),
            v = Symbol.for("react.offscreen"),
            b = Symbol.iterator;
          var g = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
          function m(e) {
            for (
              var r = arguments.length, t = new Array(r > 1 ? r - 1 : 0), n = 1;
              n < r;
              n++
            )
              t[n - 1] = arguments[n];
            !(function (e, r, t) {
              var n = g.ReactDebugCurrentFrame,
                o = n.getStackAddendum();
              "" !== o && ((r += "%s"), (t = t.concat([o])));
              var a = t.map(function (e) {
                return String(e);
              });
              a.unshift("Warning: " + r),
                Function.prototype.apply.call(console[e], console, a);
            })("error", e, t);
          }
          var h;
          function S(e) {
            return e.displayName || "Context";
          }
          function _(e) {
            if (null == e) return null;
            if (
              ("number" == typeof e.tag &&
                m(
                  "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
                ),
              "function" == typeof e)
            )
              return e.displayName || e.name || null;
            if ("string" == typeof e) return e;
            switch (e) {
              case o:
                return "Fragment";
              case n:
                return "Portal";
              case s:
                return "Profiler";
              case a:
                return "StrictMode";
              case f:
                return "Suspense";
              case p:
                return "SuspenseList";
            }
            if ("object" == typeof e)
              switch (e.$$typeof) {
                case u:
                  return S(e) + ".Consumer";
                case c:
                  return S(e._context) + ".Provider";
                case l:
                  return (function (e, r, t) {
                    var n = e.displayName;
                    if (n) return n;
                    var o = r.displayName || r.name || "";
                    return "" !== o ? t + "(" + o + ")" : t;
                  })(e, e.render, "ForwardRef");
                case y:
                  var r = e.displayName || null;
                  return null !== r ? r : _(e.type) || "Memo";
                case d:
                  var t = e,
                    i = t._payload,
                    v = t._init;
                  try {
                    return _(v(i));
                  } catch (e) {
                    return null;
                  }
              }
            return null;
          }
          h = Symbol.for("react.module.reference");
          var k,
            w,
            j,
            O,
            E,
            R,
            x,
            P = Object.assign,
            T = 0;
          function C() {}
          C.__reactDisabledLog = !0;
          var $,
            N = g.ReactCurrentDispatcher;
          function D(e, r, t) {
            if (void 0 === $)
              try {
                throw Error();
              } catch (e) {
                var n = e.stack.trim().match(/\n( *(at )?)/);
                $ = (n && n[1]) || "";
              }
            return "\n" + $ + e;
          }
          var F,
            I = !1,
            A = "function" == typeof WeakMap ? WeakMap : Map;
          function L(e, r) {
            if (!e || I) return "";
            var t,
              n = F.get(e);
            if (void 0 !== n) return n;
            I = !0;
            var o,
              a = Error.prepareStackTrace;
            (Error.prepareStackTrace = void 0),
              (o = N.current),
              (N.current = null),
              (function () {
                if (0 === T) {
                  (k = console.log),
                    (w = console.info),
                    (j = console.warn),
                    (O = console.error),
                    (E = console.group),
                    (R = console.groupCollapsed),
                    (x = console.groupEnd);
                  var e = {
                    configurable: !0,
                    enumerable: !0,
                    value: C,
                    writable: !0,
                  };
                  Object.defineProperties(console, {
                    info: e,
                    log: e,
                    warn: e,
                    error: e,
                    group: e,
                    groupCollapsed: e,
                    groupEnd: e,
                  });
                }
                T++;
              })();
            try {
              if (r) {
                var i = function () {
                  throw Error();
                };
                if (
                  (Object.defineProperty(i.prototype, "props", {
                    set: function () {
                      throw Error();
                    },
                  }),
                  "object" == typeof Reflect && Reflect.construct)
                ) {
                  try {
                    Reflect.construct(i, []);
                  } catch (e) {
                    t = e;
                  }
                  Reflect.construct(e, [], i);
                } else {
                  try {
                    i.call();
                  } catch (e) {
                    t = e;
                  }
                  e.call(i.prototype);
                }
              } else {
                try {
                  throw Error();
                } catch (e) {
                  t = e;
                }
                e();
              }
            } catch (r) {
              if (r && t && "string" == typeof r.stack) {
                for (
                  var s = r.stack.split("\n"),
                    c = t.stack.split("\n"),
                    u = s.length - 1,
                    l = c.length - 1;
                  u >= 1 && l >= 0 && s[u] !== c[l];

                )
                  l--;
                for (; u >= 1 && l >= 0; u--, l--)
                  if (s[u] !== c[l]) {
                    if (1 !== u || 1 !== l)
                      do {
                        if ((u--, --l < 0 || s[u] !== c[l])) {
                          var f = "\n" + s[u].replace(" at new ", " at ");
                          return (
                            e.displayName &&
                              f.includes("<anonymous>") &&
                              (f = f.replace("<anonymous>", e.displayName)),
                            "function" == typeof e && F.set(e, f),
                            f
                          );
                        }
                      } while (u >= 1 && l >= 0);
                    break;
                  }
              }
            } finally {
              (I = !1),
                (N.current = o),
                (function () {
                  if (0 == --T) {
                    var e = { configurable: !0, enumerable: !0, writable: !0 };
                    Object.defineProperties(console, {
                      log: P({}, e, { value: k }),
                      info: P({}, e, { value: w }),
                      warn: P({}, e, { value: j }),
                      error: P({}, e, { value: O }),
                      group: P({}, e, { value: E }),
                      groupCollapsed: P({}, e, { value: R }),
                      groupEnd: P({}, e, { value: x }),
                    });
                  }
                  T < 0 &&
                    m(
                      "disabledDepth fell below zero. This is a bug in React. Please file an issue."
                    );
                })(),
                (Error.prepareStackTrace = a);
            }
            var p = e ? e.displayName || e.name : "",
              y = p ? D(p) : "";
            return "function" == typeof e && F.set(e, y), y;
          }
          function W(e, r, t) {
            if (null == e) return "";
            if ("function" == typeof e)
              return L(e, !(!(n = e.prototype) || !n.isReactComponent));
            var n;
            if ("string" == typeof e) return D(e);
            switch (e) {
              case f:
                return D("Suspense");
              case p:
                return D("SuspenseList");
            }
            if ("object" == typeof e)
              switch (e.$$typeof) {
                case l:
                  return L(e.render, !1);
                case y:
                  return W(e.type, r, t);
                case d:
                  var o = e,
                    a = o._payload,
                    i = o._init;
                  try {
                    return W(i(a), r, t);
                  } catch (e) {}
              }
            return "";
          }
          F = new A();
          var U = Object.prototype.hasOwnProperty,
            z = {},
            M = g.ReactDebugCurrentFrame;
          function Y(e) {
            if (e) {
              var r = e._owner,
                t = W(e.type, e._source, r ? r.type : null);
              M.setExtraStackFrame(t);
            } else M.setExtraStackFrame(null);
          }
          var B = Array.isArray;
          function V(e) {
            return B(e);
          }
          function q(e) {
            return "" + e;
          }
          function J(e) {
            if (
              (function (e) {
                try {
                  return q(e), !1;
                } catch (e) {
                  return !0;
                }
              })(e)
            )
              return (
                m(
                  "The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.",
                  (function (e) {
                    return (
                      ("function" == typeof Symbol &&
                        Symbol.toStringTag &&
                        e[Symbol.toStringTag]) ||
                      e.constructor.name ||
                      "Object"
                    );
                  })(e)
                ),
                q(e)
              );
          }
          var K,
            X,
            H,
            G = g.ReactCurrentOwner,
            Q = { key: !0, ref: !0, __self: !0, __source: !0 };
          H = {};
          function Z(e, r, n, o, a) {
            var i,
              s = {},
              c = null,
              u = null;
            for (i in (void 0 !== n && (J(n), (c = "" + n)),
            (function (e) {
              if (U.call(e, "key")) {
                var r = Object.getOwnPropertyDescriptor(e, "key").get;
                if (r && r.isReactWarning) return !1;
              }
              return void 0 !== e.key;
            })(r) && (J(r.key), (c = "" + r.key)),
            (function (e) {
              if (U.call(e, "ref")) {
                var r = Object.getOwnPropertyDescriptor(e, "ref").get;
                if (r && r.isReactWarning) return !1;
              }
              return void 0 !== e.ref;
            })(r) &&
              ((u = r.ref),
              (function (e, r) {
                if (
                  "string" == typeof e.ref &&
                  G.current &&
                  r &&
                  G.current.stateNode !== r
                ) {
                  var t = _(G.current.type);
                  H[t] ||
                    (m(
                      'Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref',
                      _(G.current.type),
                      e.ref
                    ),
                    (H[t] = !0));
                }
              })(r, a)),
            r))
              U.call(r, i) && !Q.hasOwnProperty(i) && (s[i] = r[i]);
            if (e && e.defaultProps) {
              var l = e.defaultProps;
              for (i in l) void 0 === s[i] && (s[i] = l[i]);
            }
            if (c || u) {
              var f =
                "function" == typeof e
                  ? e.displayName || e.name || "Unknown"
                  : e;
              c &&
                (function (e, r) {
                  var t = function () {
                    K ||
                      ((K = !0),
                      m(
                        "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)",
                        r
                      ));
                  };
                  (t.isReactWarning = !0),
                    Object.defineProperty(e, "key", {
                      get: t,
                      configurable: !0,
                    });
                })(s, f),
                u &&
                  (function (e, r) {
                    var t = function () {
                      X ||
                        ((X = !0),
                        m(
                          "%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)",
                          r
                        ));
                    };
                    (t.isReactWarning = !0),
                      Object.defineProperty(e, "ref", {
                        get: t,
                        configurable: !0,
                      });
                  })(s, f);
            }
            return (function (e, r, n, o, a, i, s) {
              var c = {
                $$typeof: t,
                type: e,
                key: r,
                ref: n,
                props: s,
                _owner: i,
                _store: {},
              };
              return (
                Object.defineProperty(c._store, "validated", {
                  configurable: !1,
                  enumerable: !1,
                  writable: !0,
                  value: !1,
                }),
                Object.defineProperty(c, "_self", {
                  configurable: !1,
                  enumerable: !1,
                  writable: !1,
                  value: o,
                }),
                Object.defineProperty(c, "_source", {
                  configurable: !1,
                  enumerable: !1,
                  writable: !1,
                  value: a,
                }),
                Object.freeze && (Object.freeze(c.props), Object.freeze(c)),
                c
              );
            })(e, c, u, a, o, G.current, s);
          }
          var ee,
            re = g.ReactCurrentOwner,
            te = g.ReactDebugCurrentFrame;
          function ne(e) {
            if (e) {
              var r = e._owner,
                t = W(e.type, e._source, r ? r.type : null);
              te.setExtraStackFrame(t);
            } else te.setExtraStackFrame(null);
          }
          function oe(e) {
            return "object" == typeof e && null !== e && e.$$typeof === t;
          }
          function ae() {
            if (re.current) {
              var e = _(re.current.type);
              if (e) return "\n\nCheck the render method of `" + e + "`.";
            }
            return "";
          }
          ee = !1;
          var ie = {};
          function se(e, r) {
            if (e._store && !e._store.validated && null == e.key) {
              e._store.validated = !0;
              var t = (function (e) {
                var r = ae();
                if (!r) {
                  var t = "string" == typeof e ? e : e.displayName || e.name;
                  t &&
                    (r =
                      "\n\nCheck the top-level render call using <" + t + ">.");
                }
                return r;
              })(r);
              if (!ie[t]) {
                ie[t] = !0;
                var n = "";
                e &&
                  e._owner &&
                  e._owner !== re.current &&
                  (n = " It was passed a child from " + _(e._owner.type) + "."),
                  ne(e),
                  m(
                    'Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.',
                    t,
                    n
                  ),
                  ne(null);
              }
            }
          }
          function ce(e, r) {
            if ("object" == typeof e)
              if (V(e))
                for (var t = 0; t < e.length; t++) {
                  var n = e[t];
                  oe(n) && se(n, r);
                }
              else if (oe(e)) e._store && (e._store.validated = !0);
              else if (e) {
                var o = (function (e) {
                  if (null === e || "object" != typeof e) return null;
                  var r = (b && e[b]) || e["@@iterator"];
                  return "function" == typeof r ? r : null;
                })(e);
                if ("function" == typeof o && o !== e.entries)
                  for (var a, i = o.call(e); !(a = i.next()).done; )
                    oe(a.value) && se(a.value, r);
              }
          }
          function ue(e) {
            var r,
              t = e.type;
            if (null != t && "string" != typeof t) {
              if ("function" == typeof t) r = t.propTypes;
              else {
                if (
                  "object" != typeof t ||
                  (t.$$typeof !== l && t.$$typeof !== y)
                )
                  return;
                r = t.propTypes;
              }
              if (r) {
                var n = _(t);
                !(function (e, r, t, n, o) {
                  var a = Function.call.bind(U);
                  for (var i in e)
                    if (a(e, i)) {
                      var s = void 0;
                      try {
                        if ("function" != typeof e[i]) {
                          var c = Error(
                            (n || "React class") +
                              ": " +
                              t +
                              " type `" +
                              i +
                              "` is invalid; it must be a function, usually from the `prop-types` package, but received `" +
                              typeof e[i] +
                              "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
                          );
                          throw ((c.name = "Invariant Violation"), c);
                        }
                        s = e[i](
                          r,
                          i,
                          n,
                          t,
                          null,
                          "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"
                        );
                      } catch (e) {
                        s = e;
                      }
                      !s ||
                        s instanceof Error ||
                        (Y(o),
                        m(
                          "%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).",
                          n || "React class",
                          t,
                          i,
                          typeof s
                        ),
                        Y(null)),
                        s instanceof Error &&
                          !(s.message in z) &&
                          ((z[s.message] = !0),
                          Y(o),
                          m("Failed %s type: %s", t, s.message),
                          Y(null));
                    }
                })(r, e.props, "prop", n, e);
              } else if (void 0 !== t.PropTypes && !ee) {
                (ee = !0),
                  m(
                    "Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?",
                    _(t) || "Unknown"
                  );
              }
              "function" != typeof t.getDefaultProps ||
                t.getDefaultProps.isReactClassApproved ||
                m(
                  "getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead."
                );
            }
          }
          var le = {};
          function fe(e, r, n, i, b, g) {
            var S = (function (e) {
              return (
                "string" == typeof e ||
                "function" == typeof e ||
                e === o ||
                e === s ||
                e === a ||
                e === f ||
                e === p ||
                e === v ||
                ("object" == typeof e &&
                  null !== e &&
                  (e.$$typeof === d ||
                    e.$$typeof === y ||
                    e.$$typeof === c ||
                    e.$$typeof === u ||
                    e.$$typeof === l ||
                    e.$$typeof === h ||
                    void 0 !== e.getModuleId))
              );
            })(e);
            if (!S) {
              var k = "";
              (void 0 === e ||
                ("object" == typeof e &&
                  null !== e &&
                  0 === Object.keys(e).length)) &&
                (k +=
                  " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
              var w;
              (k += ae()),
                null === e
                  ? (w = "null")
                  : V(e)
                  ? (w = "array")
                  : void 0 !== e && e.$$typeof === t
                  ? ((w = "<" + (_(e.type) || "Unknown") + " />"),
                    (k =
                      " Did you accidentally export a JSX literal instead of a component?"))
                  : (w = typeof e),
                m(
                  "React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s",
                  w,
                  k
                );
            }
            var j = Z(e, r, n, b, g);
            if (null == j) return j;
            if (S) {
              var O = r.children;
              if (void 0 !== O)
                if (i)
                  if (V(O)) {
                    for (var E = 0; E < O.length; E++) ce(O[E], e);
                    Object.freeze && Object.freeze(O);
                  } else
                    m(
                      "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
                    );
                else ce(O, e);
            }
            if (U.call(r, "key")) {
              var R = _(e),
                x = Object.keys(r).filter(function (e) {
                  return "key" !== e;
                }),
                P =
                  x.length > 0
                    ? "{key: someKey, " + x.join(": ..., ") + ": ...}"
                    : "{key: someKey}";
              if (!le[R + P])
                m(
                  'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
                  P,
                  R,
                  x.length > 0 ? "{" + x.join(": ..., ") + ": ...}" : "{}",
                  R
                ),
                  (le[R + P] = !0);
            }
            return (
              e === o
                ? (function (e) {
                    for (
                      var r = Object.keys(e.props), t = 0;
                      t < r.length;
                      t++
                    ) {
                      var n = r[t];
                      if ("children" !== n && "key" !== n) {
                        ne(e),
                          m(
                            "Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.",
                            n
                          ),
                          ne(null);
                        break;
                      }
                    }
                    null !== e.ref &&
                      (ne(e),
                      m(
                        "Invalid attribute `ref` supplied to `React.Fragment`."
                      ),
                      ne(null));
                  })(j)
                : ue(j),
              j
            );
          }
          var pe = function (e, r, t) {
              return fe(e, r, t, !1);
            },
            ye = function (e, r, t) {
              return fe(e, r, t, !0);
            };
          (i.Fragment = o), (i.jsx = pe), (i.jsxs = ye);
        })()),
    i
  );
}
var c =
  (a ||
    ((a = 1),
    "production" === process.env.NODE_ENV
      ? (t.exports = (function () {
          if (e) return n;
          e = 1;
          var t = r,
            o = Symbol.for("react.element"),
            a = Symbol.for("react.fragment"),
            i = Object.prototype.hasOwnProperty,
            s =
              t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
                .ReactCurrentOwner,
            c = { key: !0, ref: !0, __self: !0, __source: !0 };
          function u(e, r, t) {
            var n,
              a = {},
              u = null,
              l = null;
            for (n in (void 0 !== t && (u = "" + t),
            void 0 !== r.key && (u = "" + r.key),
            void 0 !== r.ref && (l = r.ref),
            r))
              i.call(r, n) && !c.hasOwnProperty(n) && (a[n] = r[n]);
            if (e && e.defaultProps)
              for (n in (r = e.defaultProps)) void 0 === a[n] && (a[n] = r[n]);
            return {
              $$typeof: o,
              type: e,
              key: u,
              ref: l,
              props: a,
              _owner: s.current,
            };
          }
          return (n.Fragment = a), (n.jsx = u), (n.jsxs = u), n;
        })())
      : (t.exports = s())),
  t.exports);
function u(e, t) {
  const n = (function (e) {
    const t = r.useRef(e),
      n = r.useRef(new Set());
    return {
      get: r.useCallback(() => t.current, []),
      set: r.useCallback((e) => {
        (t.current = Object.assign(Object.assign({}, t.current), e)),
          n.current.forEach((e) => e());
      }, []),
      subscribe: r.useCallback(
        (e) => (n.current.add(e), () => n.current.delete(e)),
        []
      ),
    };
  })(e);
  return {
    get: function (t) {
      return (
        t in n.get() ||
          console.error(`State "${String(t)}" in useNexus not found 👺`),
        r.useSyncExternalStore(
          n.subscribe,
          () => {
            var r;
            return null !== (r = n.get()[t]) && void 0 !== r ? r : e[t];
          },
          () => e[t]
        )
      );
    },
    dispatch: function (e) {
      const r = n.get(),
        o = t(r, e);
      r !== o && n.set(o);
    },
    getAll: function () {
      return r.useSyncExternalStore(n.subscribe, n.get, () => e);
    },
    selector: function (t) {
      const o = n.get();
      return (
        void 0 === t(o) && console.error("State in useSelector not found 👺"),
        r.useSyncExternalStore(
          n.subscribe,
          () => t(n.get()),
          () => t(e)
        )
      );
    },
    subscribe: n.subscribe,
  };
}
const l = r.createContext(null);
let f = null;
function p() {
  const e = r.useContext(l);
  if (!e) throw new Error("NexusProvider not found 👺");
  return e;
}
(exports.NexusProvider = ({ initialStates: e, actions: r, children: t }) => {
  const n = (function (e) {
      return function (r, t) {
        const n = t.type;
        if (n in e) {
          const o = e[n];
          return o.reducer
            ? o.reducer(r, t)
            : Object.assign(Object.assign({}, r), t.payload);
        }
        return r;
      };
    })(r),
    o = structuredClone(e),
    a = Object.assign(Object.assign({}, u(o, n)), { initialStates: e });
  return (f = a.dispatch), c.jsx(l.Provider, { value: a, children: t });
}),
  (exports.nexusAction = function (e) {
    return { reducer: e || ((e) => e) };
  }),
  (exports.nexusDispatch = function (e) {
    if (!f)
      throw new Error(
        "nexusDispatch is not initialized. Make sure NexusProvider is used 👺"
      );
    f(e);
  }),
  (exports.useNexus = function (e) {
    const r = p();
    return e ? r.get(e) : r.getAll();
  }),
  (exports.useSelector = (e) => {
    const t = p(),
      n = r.useCallback(e, [e]);
    return r.useSyncExternalStore(
      t.subscribe,
      () => n(t.getAll()),
      () => n(t.initialStates)
    );
  });
