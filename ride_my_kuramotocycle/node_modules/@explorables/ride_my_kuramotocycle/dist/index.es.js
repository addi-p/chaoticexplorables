(function(){"use strict";try{if(typeof document<"u"){var t=document.createElement("style");t.appendChild(document.createTextNode('/*! tailwindcss v4.1.4 | MIT License | https://tailwindcss.com */@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-border-style:solid;--tw-font-weight:initial}}}@layer theme{:root,:host{--tw-font-sans:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";--tw-color-black:#000;--tw-color-white:#fff;--tw-spacing:.25rem;--tw-container-5xl:64rem;--tw-text-2xl:1.5rem;--tw-text-2xl--line-height:calc(2/1.5);--tw-text-3xl:1.875rem;--tw-text-3xl--line-height: 1.2 ;--tw-text-5xl:3rem;--tw-text-5xl--line-height:1;--tw-font-weight-light:300}}@layer base,components;@layer utilities{.tw\\:m-8{margin:calc(var(--tw-spacing)*8)}.tw\\:grid{display:grid}.tw\\:max-w-5xl{max-width:var(--tw-container-5xl)}.tw\\:grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.tw\\:border-1{border-style:var(--tw-border-style);border-width:1px}.tw\\:border-black{border-color:var(--tw-color-black)}.tw\\:bg-white{background-color:var(--tw-color-white)}.tw\\:p-0{padding:calc(var(--tw-spacing)*0)}.tw\\:px-1{padding-inline:calc(var(--tw-spacing)*1)}.tw\\:px-10{padding-inline:calc(var(--tw-spacing)*10)}.tw\\:font-sans{font-family:var(--tw-font-sans)}.tw\\:text-2xl{font-size:var(--tw-text-2xl);line-height:var(--tw-leading,var(--tw-text-2xl--line-height))}.tw\\:text-3xl{font-size:var(--tw-text-3xl);line-height:var(--tw-leading,var(--tw-text-3xl--line-height))}.tw\\:text-5xl{font-size:var(--tw-text-5xl);line-height:var(--tw-leading,var(--tw-text-5xl--line-height))}.tw\\:font-light{--tw-font-weight:var(--tw-font-weight-light);font-weight:var(--tw-font-weight-light)}.tw\\:text-black{color:var(--tw-color-black)}@media (min-width:40rem){.tw\\:sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.tw\\:sm\\:gap-8{gap:calc(var(--tw-spacing)*8)}.tw\\:sm\\:p-0{padding:calc(var(--tw-spacing)*0)}}@media (prefers-color-scheme:dark){.tw\\:dark\\:border-white{border-color:var(--tw-color-white)}.tw\\:dark\\:bg-black{background-color:var(--tw-color-black)}.tw\\:dark\\:text-white{color:var(--tw-color-white)}}.debug-grid-16{background-image:linear-gradient(90deg,#0000ff1a 1px,#0000 1px),linear-gradient(#0000ff1a 1px,#0000 1px);background-repeat:repeat;background-size:6.25% 6.25%,6.25% 6.25%}}.explorable *,.explorable :before,.explorable :after{box-sizing:border-box}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-font-weight{syntax:"*";inherits:false}._agent_1wtcj_1{opacity:.7;stroke:#000;stroke-width:.5px}._xlabel_1wtcj_22,._ylabel_1wtcj_25{text-anchor:middle}._caxis_1wtcj_28{stroke:#000;stroke-width:.5px;stroke-opacity:.5}._dot_1wtcj_34{stroke:gray;stroke-width:.5px;fill:#8b0000}._op_1wtcj_40{stroke:#8b0000;stroke-width:.5px;fill:none}._plotline_1wtcj_46{stroke:#8b0000;stroke-width:2px;fill:none}._osctrack_1wtcj_52{fill:none;stroke-width:1px;stroke-opacity:.6;stroke:gray}@media (prefers-color-scheme: dark){._caxis_1wtcj_28{stroke:#fff}._plot_1wtcj_11{color:#fff}._xlabel_1wtcj_22,._ylabel_1wtcj_25{fill:#fff}._plotline_1wtcj_46{stroke:red}._op_1wtcj_40{stroke:red;stroke-width:1px;fill:none}._dot_1wtcj_34{stroke:gray;stroke-width:.5px;fill:red}}._displayPanel_1wtcj_89,._controlPanel_1wtcj_94{display:block}')),document.head.appendChild(t)}}catch(e){console.error("vite-plugin-css-injected-by-js",e)}})();
const ol = {
  display_type: "svg",
  // either svg or canvas depending on explorable
  debug: !1,
  // if set to true, draws dots on the control panel to help widget placement
  debug_lattice: "debug-grid-16",
  controls_grid: { nx: 12, ny: 12 },
  display_size: { width: 500, height: 500 },
  controls_size: { width: 480, height: 480 },
  display_class: " tw:p-0 tw:border-1 tw:border-black tw:dark:border-white",
  controls_class: "d3-widgets tw:p-0",
  container_class: "tw:font-sans tw:font-light tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:sm:gap-8 tw:px-1 tw:sm:p-0 tw:m-8"
};
function oe(t, n) {
  return t == null || n == null ? NaN : t < n ? -1 : t > n ? 1 : t >= n ? 0 : NaN;
}
function sl(t, n) {
  return t == null || n == null ? NaN : n < t ? -1 : n > t ? 1 : n >= t ? 0 : NaN;
}
function Uo(t) {
  let n, e, r;
  t.length !== 2 ? (n = oe, e = (s, l) => oe(t(s), l), r = (s, l) => t(s) - l) : (n = t === oe || t === sl ? t : ul, e = t, r = t);
  function i(s, l, u = 0, c = s.length) {
    if (u < c) {
      if (n(l, l) !== 0) return c;
      do {
        const h = u + c >>> 1;
        e(s[h], l) < 0 ? u = h + 1 : c = h;
      } while (u < c);
    }
    return u;
  }
  function a(s, l, u = 0, c = s.length) {
    if (u < c) {
      if (n(l, l) !== 0) return c;
      do {
        const h = u + c >>> 1;
        e(s[h], l) <= 0 ? u = h + 1 : c = h;
      } while (u < c);
    }
    return u;
  }
  function o(s, l, u = 0, c = s.length) {
    const h = i(s, l, u, c - 1);
    return h > u && r(s[h - 1], l) > -r(s[h], l) ? h - 1 : h;
  }
  return { left: i, center: o, right: a };
}
function ul() {
  return 0;
}
function ll(t) {
  return t === null ? NaN : +t;
}
const cl = Uo(oe), fl = cl.right;
Uo(ll).center;
const hl = Math.sqrt(50), pl = Math.sqrt(10), dl = Math.sqrt(2);
function me(t, n, e) {
  const r = (n - t) / Math.max(0, e), i = Math.floor(Math.log10(r)), a = r / Math.pow(10, i), o = a >= hl ? 10 : a >= pl ? 5 : a >= dl ? 2 : 1;
  let s, l, u;
  return i < 0 ? (u = Math.pow(10, -i) / o, s = Math.round(t * u), l = Math.round(n * u), s / u < t && ++s, l / u > n && --l, u = -u) : (u = Math.pow(10, i) * o, s = Math.round(t / u), l = Math.round(n / u), s * u < t && ++s, l * u > n && --l), l < s && 0.5 <= e && e < 2 ? me(t, n, e * 2) : [s, l, u];
}
function gl(t, n, e) {
  if (n = +n, t = +t, e = +e, !(e > 0)) return [];
  if (t === n) return [t];
  const r = n < t, [i, a, o] = r ? me(n, t, e) : me(t, n, e);
  if (!(a >= i)) return [];
  const s = a - i + 1, l = new Array(s);
  if (r)
    if (o < 0) for (let u = 0; u < s; ++u) l[u] = (a - u) / -o;
    else for (let u = 0; u < s; ++u) l[u] = (a - u) * o;
  else if (o < 0) for (let u = 0; u < s; ++u) l[u] = (i + u) / -o;
  else for (let u = 0; u < s; ++u) l[u] = (i + u) * o;
  return l;
}
function Sr(t, n, e) {
  return n = +n, t = +t, e = +e, me(t, n, e)[2];
}
function _l(t, n, e) {
  n = +n, t = +t, e = +e;
  const r = n < t, i = r ? Sr(n, t, e) : Sr(t, n, e);
  return (r ? -1 : 1) * (i < 0 ? 1 / -i : i);
}
function yl(t) {
  return t;
}
var dr = 1, gr = 2, zr = 3, vn = 4, aa = 1e-6;
function ml(t) {
  return "translate(" + t + ",0)";
}
function vl(t) {
  return "translate(0," + t + ")";
}
function wl(t) {
  return (n) => +t(n);
}
function bl(t, n) {
  return n = Math.max(0, t.bandwidth() - n * 2) / 2, t.round() && (n = Math.round(n)), (e) => +t(e) + n;
}
function xl() {
  return !this.__axis;
}
function Yo(t, n) {
  var e = [], r = null, i = null, a = 6, o = 6, s = 3, l = typeof window < "u" && window.devicePixelRatio > 1 ? 0 : 0.5, u = t === dr || t === vn ? -1 : 1, c = t === vn || t === gr ? "x" : "y", h = t === dr || t === zr ? ml : vl;
  function f(p) {
    var d = r ?? (n.ticks ? n.ticks.apply(n, e) : n.domain()), _ = i ?? (n.tickFormat ? n.tickFormat.apply(n, e) : yl), w = Math.max(a, 0) + s, y = n.range(), M = +y[0] + l, A = +y[y.length - 1] + l, g = (n.bandwidth ? bl : wl)(n.copy(), l), v = p.selection ? p.selection() : p, T = v.selectAll(".domain").data([null]), k = v.selectAll(".tick").data(d, n).order(), O = k.exit(), F = k.enter().append("g").attr("class", "tick"), R = k.select("line"), m = k.select("text");
    T = T.merge(T.enter().insert("path", ".tick").attr("class", "domain").attr("stroke", "currentColor")), k = k.merge(F), R = R.merge(F.append("line").attr("stroke", "currentColor").attr(c + "2", u * a)), m = m.merge(F.append("text").attr("fill", "currentColor").attr(c, u * w).attr("dy", t === dr ? "0em" : t === zr ? "0.71em" : "0.32em")), p !== v && (T = T.transition(p), k = k.transition(p), R = R.transition(p), m = m.transition(p), O = O.transition(p).attr("opacity", aa).attr("transform", function(S) {
      return isFinite(S = g(S)) ? h(S + l) : this.getAttribute("transform");
    }), F.attr("opacity", aa).attr("transform", function(S) {
      var $ = this.parentNode.__axis;
      return h(($ && isFinite($ = $(S)) ? $ : g(S)) + l);
    })), O.remove(), T.attr("d", t === vn || t === gr ? o ? "M" + u * o + "," + M + "H" + l + "V" + A + "H" + u * o : "M" + l + "," + M + "V" + A : o ? "M" + M + "," + u * o + "V" + l + "H" + A + "V" + u * o : "M" + M + "," + l + "H" + A), k.attr("opacity", 1).attr("transform", function(S) {
      return h(g(S) + l);
    }), R.attr(c + "2", u * a), m.attr(c, u * w).text(_), v.filter(xl).attr("fill", "none").attr("font-size", 10).attr("font-family", "sans-serif").attr("text-anchor", t === gr ? "start" : t === vn ? "end" : "middle"), v.each(function() {
      this.__axis = g;
    });
  }
  return f.scale = function(p) {
    return arguments.length ? (n = p, f) : n;
  }, f.ticks = function() {
    return e = Array.from(arguments), f;
  }, f.tickArguments = function(p) {
    return arguments.length ? (e = p == null ? [] : Array.from(p), f) : e.slice();
  }, f.tickValues = function(p) {
    return arguments.length ? (r = p == null ? null : Array.from(p), f) : r && r.slice();
  }, f.tickFormat = function(p) {
    return arguments.length ? (i = p, f) : i;
  }, f.tickSize = function(p) {
    return arguments.length ? (a = o = +p, f) : a;
  }, f.tickSizeInner = function(p) {
    return arguments.length ? (a = +p, f) : a;
  }, f.tickSizeOuter = function(p) {
    return arguments.length ? (o = +p, f) : o;
  }, f.tickPadding = function(p) {
    return arguments.length ? (s = +p, f) : s;
  }, f.offset = function(p) {
    return arguments.length ? (l = +p, f) : l;
  }, f;
}
function Ml(t) {
  return Yo(zr, t);
}
function Al(t) {
  return Yo(vn, t);
}
var $l = { value: () => {
} };
function Go() {
  for (var t = 0, n = arguments.length, e = {}, r; t < n; ++t) {
    if (!(r = arguments[t] + "") || r in e || /[\s.]/.test(r)) throw new Error("illegal type: " + r);
    e[r] = [];
  }
  return new se(e);
}
function se(t) {
  this._ = t;
}
function Nl(t, n) {
  return t.trim().split(/^|\s+/).map(function(e) {
    var r = "", i = e.indexOf(".");
    if (i >= 0 && (r = e.slice(i + 1), e = e.slice(0, i)), e && !n.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    return { type: e, name: r };
  });
}
se.prototype = Go.prototype = {
  constructor: se,
  on: function(t, n) {
    var e = this._, r = Nl(t + "", e), i, a = -1, o = r.length;
    if (arguments.length < 2) {
      for (; ++a < o; ) if ((i = (t = r[a]).type) && (i = kl(e[i], t.name))) return i;
      return;
    }
    if (n != null && typeof n != "function") throw new Error("invalid callback: " + n);
    for (; ++a < o; )
      if (i = (t = r[a]).type) e[i] = oa(e[i], t.name, n);
      else if (n == null) for (i in e) e[i] = oa(e[i], t.name, null);
    return this;
  },
  copy: function() {
    var t = {}, n = this._;
    for (var e in n) t[e] = n[e].slice();
    return new se(t);
  },
  call: function(t, n) {
    if ((i = arguments.length - 2) > 0) for (var e = new Array(i), r = 0, i, a; r < i; ++r) e[r] = arguments[r + 2];
    if (!this._.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    for (a = this._[t], r = 0, i = a.length; r < i; ++r) a[r].value.apply(n, e);
  },
  apply: function(t, n, e) {
    if (!this._.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    for (var r = this._[t], i = 0, a = r.length; i < a; ++i) r[i].value.apply(n, e);
  }
};
function kl(t, n) {
  for (var e = 0, r = t.length, i; e < r; ++e)
    if ((i = t[e]).name === n)
      return i.value;
}
function oa(t, n, e) {
  for (var r = 0, i = t.length; r < i; ++r)
    if (t[r].name === n) {
      t[r] = $l, t = t.slice(0, r).concat(t.slice(r + 1));
      break;
    }
  return e != null && t.push({ name: n, value: e }), t;
}
var Pr = "http://www.w3.org/1999/xhtml";
const sa = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Pr,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function De(t) {
  var n = t += "", e = n.indexOf(":");
  return e >= 0 && (n = t.slice(0, e)) !== "xmlns" && (t = t.slice(e + 1)), sa.hasOwnProperty(n) ? { space: sa[n], local: t } : t;
}
function Tl(t) {
  return function() {
    var n = this.ownerDocument, e = this.namespaceURI;
    return e === Pr && n.documentElement.namespaceURI === Pr ? n.createElement(t) : n.createElementNS(e, t);
  };
}
function Sl(t) {
  return function() {
    return this.ownerDocument.createElementNS(t.space, t.local);
  };
}
function Vo(t) {
  var n = De(t);
  return (n.local ? Sl : Tl)(n);
}
function zl() {
}
function di(t) {
  return t == null ? zl : function() {
    return this.querySelector(t);
  };
}
function Pl(t) {
  typeof t != "function" && (t = di(t));
  for (var n = this._groups, e = n.length, r = new Array(e), i = 0; i < e; ++i)
    for (var a = n[i], o = a.length, s = r[i] = new Array(o), l, u, c = 0; c < o; ++c)
      (l = a[c]) && (u = t.call(l, l.__data__, c, a)) && ("__data__" in l && (u.__data__ = l.__data__), s[c] = u);
  return new X(r, this._parents);
}
function El(t) {
  return t == null ? [] : Array.isArray(t) ? t : Array.from(t);
}
function Ol() {
  return [];
}
function Ko(t) {
  return t == null ? Ol : function() {
    return this.querySelectorAll(t);
  };
}
function Cl(t) {
  return function() {
    return El(t.apply(this, arguments));
  };
}
function Il(t) {
  typeof t == "function" ? t = Cl(t) : t = Ko(t);
  for (var n = this._groups, e = n.length, r = [], i = [], a = 0; a < e; ++a)
    for (var o = n[a], s = o.length, l, u = 0; u < s; ++u)
      (l = o[u]) && (r.push(t.call(l, l.__data__, u, o)), i.push(l));
  return new X(r, i);
}
function Zo(t) {
  return function() {
    return this.matches(t);
  };
}
function Wo(t) {
  return function(n) {
    return n.matches(t);
  };
}
var Rl = Array.prototype.find;
function jl(t) {
  return function() {
    return Rl.call(this.children, t);
  };
}
function ql() {
  return this.firstElementChild;
}
function Fl(t) {
  return this.select(t == null ? ql : jl(typeof t == "function" ? t : Wo(t)));
}
var Ll = Array.prototype.filter;
function Dl() {
  return Array.from(this.children);
}
function Hl(t) {
  return function() {
    return Ll.call(this.children, t);
  };
}
function Bl(t) {
  return this.selectAll(t == null ? Dl : Hl(typeof t == "function" ? t : Wo(t)));
}
function Xl(t) {
  typeof t != "function" && (t = Zo(t));
  for (var n = this._groups, e = n.length, r = new Array(e), i = 0; i < e; ++i)
    for (var a = n[i], o = a.length, s = r[i] = [], l, u = 0; u < o; ++u)
      (l = a[u]) && t.call(l, l.__data__, u, a) && s.push(l);
  return new X(r, this._parents);
}
function Jo(t) {
  return new Array(t.length);
}
function Ul() {
  return new X(this._enter || this._groups.map(Jo), this._parents);
}
function ve(t, n) {
  this.ownerDocument = t.ownerDocument, this.namespaceURI = t.namespaceURI, this._next = null, this._parent = t, this.__data__ = n;
}
ve.prototype = {
  constructor: ve,
  appendChild: function(t) {
    return this._parent.insertBefore(t, this._next);
  },
  insertBefore: function(t, n) {
    return this._parent.insertBefore(t, n);
  },
  querySelector: function(t) {
    return this._parent.querySelector(t);
  },
  querySelectorAll: function(t) {
    return this._parent.querySelectorAll(t);
  }
};
function Yl(t) {
  return function() {
    return t;
  };
}
function Gl(t, n, e, r, i, a) {
  for (var o = 0, s, l = n.length, u = a.length; o < u; ++o)
    (s = n[o]) ? (s.__data__ = a[o], r[o] = s) : e[o] = new ve(t, a[o]);
  for (; o < l; ++o)
    (s = n[o]) && (i[o] = s);
}
function Vl(t, n, e, r, i, a, o) {
  var s, l, u = /* @__PURE__ */ new Map(), c = n.length, h = a.length, f = new Array(c), p;
  for (s = 0; s < c; ++s)
    (l = n[s]) && (f[s] = p = o.call(l, l.__data__, s, n) + "", u.has(p) ? i[s] = l : u.set(p, l));
  for (s = 0; s < h; ++s)
    p = o.call(t, a[s], s, a) + "", (l = u.get(p)) ? (r[s] = l, l.__data__ = a[s], u.delete(p)) : e[s] = new ve(t, a[s]);
  for (s = 0; s < c; ++s)
    (l = n[s]) && u.get(f[s]) === l && (i[s] = l);
}
function Kl(t) {
  return t.__data__;
}
function Zl(t, n) {
  if (!arguments.length) return Array.from(this, Kl);
  var e = n ? Vl : Gl, r = this._parents, i = this._groups;
  typeof t != "function" && (t = Yl(t));
  for (var a = i.length, o = new Array(a), s = new Array(a), l = new Array(a), u = 0; u < a; ++u) {
    var c = r[u], h = i[u], f = h.length, p = Wl(t.call(c, c && c.__data__, u, r)), d = p.length, _ = s[u] = new Array(d), w = o[u] = new Array(d), y = l[u] = new Array(f);
    e(c, h, _, w, y, p, n);
    for (var M = 0, A = 0, g, v; M < d; ++M)
      if (g = _[M]) {
        for (M >= A && (A = M + 1); !(v = w[A]) && ++A < d; ) ;
        g._next = v || null;
      }
  }
  return o = new X(o, r), o._enter = s, o._exit = l, o;
}
function Wl(t) {
  return typeof t == "object" && "length" in t ? t : Array.from(t);
}
function Jl() {
  return new X(this._exit || this._groups.map(Jo), this._parents);
}
function Ql(t, n, e) {
  var r = this.enter(), i = this, a = this.exit();
  return typeof t == "function" ? (r = t(r), r && (r = r.selection())) : r = r.append(t + ""), n != null && (i = n(i), i && (i = i.selection())), e == null ? a.remove() : e(a), r && i ? r.merge(i).order() : i;
}
function tc(t) {
  for (var n = t.selection ? t.selection() : t, e = this._groups, r = n._groups, i = e.length, a = r.length, o = Math.min(i, a), s = new Array(i), l = 0; l < o; ++l)
    for (var u = e[l], c = r[l], h = u.length, f = s[l] = new Array(h), p, d = 0; d < h; ++d)
      (p = u[d] || c[d]) && (f[d] = p);
  for (; l < i; ++l)
    s[l] = e[l];
  return new X(s, this._parents);
}
function nc() {
  for (var t = this._groups, n = -1, e = t.length; ++n < e; )
    for (var r = t[n], i = r.length - 1, a = r[i], o; --i >= 0; )
      (o = r[i]) && (a && o.compareDocumentPosition(a) ^ 4 && a.parentNode.insertBefore(o, a), a = o);
  return this;
}
function ec(t) {
  t || (t = rc);
  function n(h, f) {
    return h && f ? t(h.__data__, f.__data__) : !h - !f;
  }
  for (var e = this._groups, r = e.length, i = new Array(r), a = 0; a < r; ++a) {
    for (var o = e[a], s = o.length, l = i[a] = new Array(s), u, c = 0; c < s; ++c)
      (u = o[c]) && (l[c] = u);
    l.sort(n);
  }
  return new X(i, this._parents).order();
}
function rc(t, n) {
  return t < n ? -1 : t > n ? 1 : t >= n ? 0 : NaN;
}
function ic() {
  var t = arguments[0];
  return arguments[0] = this, t.apply(null, arguments), this;
}
function ac() {
  return Array.from(this);
}
function oc() {
  for (var t = this._groups, n = 0, e = t.length; n < e; ++n)
    for (var r = t[n], i = 0, a = r.length; i < a; ++i) {
      var o = r[i];
      if (o) return o;
    }
  return null;
}
function sc() {
  let t = 0;
  for (const n of this) ++t;
  return t;
}
function uc() {
  return !this.node();
}
function lc(t) {
  for (var n = this._groups, e = 0, r = n.length; e < r; ++e)
    for (var i = n[e], a = 0, o = i.length, s; a < o; ++a)
      (s = i[a]) && t.call(s, s.__data__, a, i);
  return this;
}
function cc(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function fc(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function hc(t, n) {
  return function() {
    this.setAttribute(t, n);
  };
}
function pc(t, n) {
  return function() {
    this.setAttributeNS(t.space, t.local, n);
  };
}
function dc(t, n) {
  return function() {
    var e = n.apply(this, arguments);
    e == null ? this.removeAttribute(t) : this.setAttribute(t, e);
  };
}
function gc(t, n) {
  return function() {
    var e = n.apply(this, arguments);
    e == null ? this.removeAttributeNS(t.space, t.local) : this.setAttributeNS(t.space, t.local, e);
  };
}
function _c(t, n) {
  var e = De(t);
  if (arguments.length < 2) {
    var r = this.node();
    return e.local ? r.getAttributeNS(e.space, e.local) : r.getAttribute(e);
  }
  return this.each((n == null ? e.local ? fc : cc : typeof n == "function" ? e.local ? gc : dc : e.local ? pc : hc)(e, n));
}
function Qo(t) {
  return t.ownerDocument && t.ownerDocument.defaultView || t.document && t || t.defaultView;
}
function yc(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function mc(t, n, e) {
  return function() {
    this.style.setProperty(t, n, e);
  };
}
function vc(t, n, e) {
  return function() {
    var r = n.apply(this, arguments);
    r == null ? this.style.removeProperty(t) : this.style.setProperty(t, r, e);
  };
}
function wc(t, n, e) {
  return arguments.length > 1 ? this.each((n == null ? yc : typeof n == "function" ? vc : mc)(t, n, e ?? "")) : nn(this.node(), t);
}
function nn(t, n) {
  return t.style.getPropertyValue(n) || Qo(t).getComputedStyle(t, null).getPropertyValue(n);
}
function bc(t) {
  return function() {
    delete this[t];
  };
}
function xc(t, n) {
  return function() {
    this[t] = n;
  };
}
function Mc(t, n) {
  return function() {
    var e = n.apply(this, arguments);
    e == null ? delete this[t] : this[t] = e;
  };
}
function Ac(t, n) {
  return arguments.length > 1 ? this.each((n == null ? bc : typeof n == "function" ? Mc : xc)(t, n)) : this.node()[t];
}
function ts(t) {
  return t.trim().split(/^|\s+/);
}
function gi(t) {
  return t.classList || new ns(t);
}
function ns(t) {
  this._node = t, this._names = ts(t.getAttribute("class") || "");
}
ns.prototype = {
  add: function(t) {
    var n = this._names.indexOf(t);
    n < 0 && (this._names.push(t), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(t) {
    var n = this._names.indexOf(t);
    n >= 0 && (this._names.splice(n, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(t) {
    return this._names.indexOf(t) >= 0;
  }
};
function es(t, n) {
  for (var e = gi(t), r = -1, i = n.length; ++r < i; ) e.add(n[r]);
}
function rs(t, n) {
  for (var e = gi(t), r = -1, i = n.length; ++r < i; ) e.remove(n[r]);
}
function $c(t) {
  return function() {
    es(this, t);
  };
}
function Nc(t) {
  return function() {
    rs(this, t);
  };
}
function kc(t, n) {
  return function() {
    (n.apply(this, arguments) ? es : rs)(this, t);
  };
}
function Tc(t, n) {
  var e = ts(t + "");
  if (arguments.length < 2) {
    for (var r = gi(this.node()), i = -1, a = e.length; ++i < a; ) if (!r.contains(e[i])) return !1;
    return !0;
  }
  return this.each((typeof n == "function" ? kc : n ? $c : Nc)(e, n));
}
function Sc() {
  this.textContent = "";
}
function zc(t) {
  return function() {
    this.textContent = t;
  };
}
function Pc(t) {
  return function() {
    var n = t.apply(this, arguments);
    this.textContent = n ?? "";
  };
}
function Ec(t) {
  return arguments.length ? this.each(t == null ? Sc : (typeof t == "function" ? Pc : zc)(t)) : this.node().textContent;
}
function Oc() {
  this.innerHTML = "";
}
function Cc(t) {
  return function() {
    this.innerHTML = t;
  };
}
function Ic(t) {
  return function() {
    var n = t.apply(this, arguments);
    this.innerHTML = n ?? "";
  };
}
function Rc(t) {
  return arguments.length ? this.each(t == null ? Oc : (typeof t == "function" ? Ic : Cc)(t)) : this.node().innerHTML;
}
function jc() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function qc() {
  return this.each(jc);
}
function Fc() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Lc() {
  return this.each(Fc);
}
function Dc(t) {
  var n = typeof t == "function" ? t : Vo(t);
  return this.select(function() {
    return this.appendChild(n.apply(this, arguments));
  });
}
function Hc() {
  return null;
}
function Bc(t, n) {
  var e = typeof t == "function" ? t : Vo(t), r = n == null ? Hc : typeof n == "function" ? n : di(n);
  return this.select(function() {
    return this.insertBefore(e.apply(this, arguments), r.apply(this, arguments) || null);
  });
}
function Xc() {
  var t = this.parentNode;
  t && t.removeChild(this);
}
function Uc() {
  return this.each(Xc);
}
function Yc() {
  var t = this.cloneNode(!1), n = this.parentNode;
  return n ? n.insertBefore(t, this.nextSibling) : t;
}
function Gc() {
  var t = this.cloneNode(!0), n = this.parentNode;
  return n ? n.insertBefore(t, this.nextSibling) : t;
}
function Vc(t) {
  return this.select(t ? Gc : Yc);
}
function Kc(t) {
  return arguments.length ? this.property("__data__", t) : this.node().__data__;
}
function Zc(t) {
  return function(n) {
    t.call(this, n, this.__data__);
  };
}
function Wc(t) {
  return t.trim().split(/^|\s+/).map(function(n) {
    var e = "", r = n.indexOf(".");
    return r >= 0 && (e = n.slice(r + 1), n = n.slice(0, r)), { type: n, name: e };
  });
}
function Jc(t) {
  return function() {
    var n = this.__on;
    if (n) {
      for (var e = 0, r = -1, i = n.length, a; e < i; ++e)
        a = n[e], (!t.type || a.type === t.type) && a.name === t.name ? this.removeEventListener(a.type, a.listener, a.options) : n[++r] = a;
      ++r ? n.length = r : delete this.__on;
    }
  };
}
function Qc(t, n, e) {
  return function() {
    var r = this.__on, i, a = Zc(n);
    if (r) {
      for (var o = 0, s = r.length; o < s; ++o)
        if ((i = r[o]).type === t.type && i.name === t.name) {
          this.removeEventListener(i.type, i.listener, i.options), this.addEventListener(i.type, i.listener = a, i.options = e), i.value = n;
          return;
        }
    }
    this.addEventListener(t.type, a, e), i = { type: t.type, name: t.name, value: n, listener: a, options: e }, r ? r.push(i) : this.__on = [i];
  };
}
function tf(t, n, e) {
  var r = Wc(t + ""), i, a = r.length, o;
  if (arguments.length < 2) {
    var s = this.node().__on;
    if (s) {
      for (var l = 0, u = s.length, c; l < u; ++l)
        for (i = 0, c = s[l]; i < a; ++i)
          if ((o = r[i]).type === c.type && o.name === c.name)
            return c.value;
    }
    return;
  }
  for (s = n ? Qc : Jc, i = 0; i < a; ++i) this.each(s(r[i], n, e));
  return this;
}
function is(t, n, e) {
  var r = Qo(t), i = r.CustomEvent;
  typeof i == "function" ? i = new i(n, e) : (i = r.document.createEvent("Event"), e ? (i.initEvent(n, e.bubbles, e.cancelable), i.detail = e.detail) : i.initEvent(n, !1, !1)), t.dispatchEvent(i);
}
function nf(t, n) {
  return function() {
    return is(this, t, n);
  };
}
function ef(t, n) {
  return function() {
    return is(this, t, n.apply(this, arguments));
  };
}
function rf(t, n) {
  return this.each((typeof n == "function" ? ef : nf)(t, n));
}
function* af() {
  for (var t = this._groups, n = 0, e = t.length; n < e; ++n)
    for (var r = t[n], i = 0, a = r.length, o; i < a; ++i)
      (o = r[i]) && (yield o);
}
var as = [null];
function X(t, n) {
  this._groups = t, this._parents = n;
}
function Dn() {
  return new X([[document.documentElement]], as);
}
function of() {
  return this;
}
X.prototype = Dn.prototype = {
  constructor: X,
  select: Pl,
  selectAll: Il,
  selectChild: Fl,
  selectChildren: Bl,
  filter: Xl,
  data: Zl,
  enter: Ul,
  exit: Jl,
  join: Ql,
  merge: tc,
  selection: of,
  order: nc,
  sort: ec,
  call: ic,
  nodes: ac,
  node: oc,
  size: sc,
  empty: uc,
  each: lc,
  attr: _c,
  style: wc,
  property: Ac,
  classed: Tc,
  text: Ec,
  html: Rc,
  raise: qc,
  lower: Lc,
  append: Dc,
  insert: Bc,
  remove: Uc,
  clone: Vc,
  datum: Kc,
  on: tf,
  dispatch: rf,
  [Symbol.iterator]: af
};
function sf(t) {
  return typeof t == "string" ? new X([[document.querySelector(t)]], [document.documentElement]) : new X([[t]], as);
}
function _i(t, n, e) {
  t.prototype = n.prototype = e, e.constructor = t;
}
function os(t, n) {
  var e = Object.create(t.prototype);
  for (var r in n) e[r] = n[r];
  return e;
}
function Hn() {
}
var Tn = 0.7, we = 1 / Tn, Kt = "\\s*([+-]?\\d+)\\s*", Sn = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", rt = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", uf = /^#([0-9a-f]{3,8})$/, lf = new RegExp(`^rgb\\(${Kt},${Kt},${Kt}\\)$`), cf = new RegExp(`^rgb\\(${rt},${rt},${rt}\\)$`), ff = new RegExp(`^rgba\\(${Kt},${Kt},${Kt},${Sn}\\)$`), hf = new RegExp(`^rgba\\(${rt},${rt},${rt},${Sn}\\)$`), pf = new RegExp(`^hsl\\(${Sn},${rt},${rt}\\)$`), df = new RegExp(`^hsla\\(${Sn},${rt},${rt},${Sn}\\)$`), ua = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
_i(Hn, It, {
  copy(t) {
    return Object.assign(new this.constructor(), this, t);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: la,
  // Deprecated! Use color.formatHex.
  formatHex: la,
  formatHex8: gf,
  formatHsl: _f,
  formatRgb: ca,
  toString: ca
});
function la() {
  return this.rgb().formatHex();
}
function gf() {
  return this.rgb().formatHex8();
}
function _f() {
  return ss(this).formatHsl();
}
function ca() {
  return this.rgb().formatRgb();
}
function It(t) {
  var n, e;
  return t = (t + "").trim().toLowerCase(), (n = uf.exec(t)) ? (e = n[1].length, n = parseInt(n[1], 16), e === 6 ? fa(n) : e === 3 ? new D(n >> 8 & 15 | n >> 4 & 240, n >> 4 & 15 | n & 240, (n & 15) << 4 | n & 15, 1) : e === 8 ? Gn(n >> 24 & 255, n >> 16 & 255, n >> 8 & 255, (n & 255) / 255) : e === 4 ? Gn(n >> 12 & 15 | n >> 8 & 240, n >> 8 & 15 | n >> 4 & 240, n >> 4 & 15 | n & 240, ((n & 15) << 4 | n & 15) / 255) : null) : (n = lf.exec(t)) ? new D(n[1], n[2], n[3], 1) : (n = cf.exec(t)) ? new D(n[1] * 255 / 100, n[2] * 255 / 100, n[3] * 255 / 100, 1) : (n = ff.exec(t)) ? Gn(n[1], n[2], n[3], n[4]) : (n = hf.exec(t)) ? Gn(n[1] * 255 / 100, n[2] * 255 / 100, n[3] * 255 / 100, n[4]) : (n = pf.exec(t)) ? da(n[1], n[2] / 100, n[3] / 100, 1) : (n = df.exec(t)) ? da(n[1], n[2] / 100, n[3] / 100, n[4]) : ua.hasOwnProperty(t) ? fa(ua[t]) : t === "transparent" ? new D(NaN, NaN, NaN, 0) : null;
}
function fa(t) {
  return new D(t >> 16 & 255, t >> 8 & 255, t & 255, 1);
}
function Gn(t, n, e, r) {
  return r <= 0 && (t = n = e = NaN), new D(t, n, e, r);
}
function yf(t) {
  return t instanceof Hn || (t = It(t)), t ? (t = t.rgb(), new D(t.r, t.g, t.b, t.opacity)) : new D();
}
function be(t, n, e, r) {
  return arguments.length === 1 ? yf(t) : new D(t, n, e, r ?? 1);
}
function D(t, n, e, r) {
  this.r = +t, this.g = +n, this.b = +e, this.opacity = +r;
}
_i(D, be, os(Hn, {
  brighter(t) {
    return t = t == null ? we : Math.pow(we, t), new D(this.r * t, this.g * t, this.b * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? Tn : Math.pow(Tn, t), new D(this.r * t, this.g * t, this.b * t, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new D(Ot(this.r), Ot(this.g), Ot(this.b), xe(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: ha,
  // Deprecated! Use color.formatHex.
  formatHex: ha,
  formatHex8: mf,
  formatRgb: pa,
  toString: pa
}));
function ha() {
  return `#${Pt(this.r)}${Pt(this.g)}${Pt(this.b)}`;
}
function mf() {
  return `#${Pt(this.r)}${Pt(this.g)}${Pt(this.b)}${Pt((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function pa() {
  const t = xe(this.opacity);
  return `${t === 1 ? "rgb(" : "rgba("}${Ot(this.r)}, ${Ot(this.g)}, ${Ot(this.b)}${t === 1 ? ")" : `, ${t})`}`;
}
function xe(t) {
  return isNaN(t) ? 1 : Math.max(0, Math.min(1, t));
}
function Ot(t) {
  return Math.max(0, Math.min(255, Math.round(t) || 0));
}
function Pt(t) {
  return t = Ot(t), (t < 16 ? "0" : "") + t.toString(16);
}
function da(t, n, e, r) {
  return r <= 0 ? t = n = e = NaN : e <= 0 || e >= 1 ? t = n = NaN : n <= 0 && (t = NaN), new W(t, n, e, r);
}
function ss(t) {
  if (t instanceof W) return new W(t.h, t.s, t.l, t.opacity);
  if (t instanceof Hn || (t = It(t)), !t) return new W();
  if (t instanceof W) return t;
  t = t.rgb();
  var n = t.r / 255, e = t.g / 255, r = t.b / 255, i = Math.min(n, e, r), a = Math.max(n, e, r), o = NaN, s = a - i, l = (a + i) / 2;
  return s ? (n === a ? o = (e - r) / s + (e < r) * 6 : e === a ? o = (r - n) / s + 2 : o = (n - e) / s + 4, s /= l < 0.5 ? a + i : 2 - a - i, o *= 60) : s = l > 0 && l < 1 ? 0 : o, new W(o, s, l, t.opacity);
}
function vf(t, n, e, r) {
  return arguments.length === 1 ? ss(t) : new W(t, n, e, r ?? 1);
}
function W(t, n, e, r) {
  this.h = +t, this.s = +n, this.l = +e, this.opacity = +r;
}
_i(W, vf, os(Hn, {
  brighter(t) {
    return t = t == null ? we : Math.pow(we, t), new W(this.h, this.s, this.l * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? Tn : Math.pow(Tn, t), new W(this.h, this.s, this.l * t, this.opacity);
  },
  rgb() {
    var t = this.h % 360 + (this.h < 0) * 360, n = isNaN(t) || isNaN(this.s) ? 0 : this.s, e = this.l, r = e + (e < 0.5 ? e : 1 - e) * n, i = 2 * e - r;
    return new D(
      _r(t >= 240 ? t - 240 : t + 120, i, r),
      _r(t, i, r),
      _r(t < 120 ? t + 240 : t - 120, i, r),
      this.opacity
    );
  },
  clamp() {
    return new W(ga(this.h), Vn(this.s), Vn(this.l), xe(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const t = xe(this.opacity);
    return `${t === 1 ? "hsl(" : "hsla("}${ga(this.h)}, ${Vn(this.s) * 100}%, ${Vn(this.l) * 100}%${t === 1 ? ")" : `, ${t})`}`;
  }
}));
function ga(t) {
  return t = (t || 0) % 360, t < 0 ? t + 360 : t;
}
function Vn(t) {
  return Math.max(0, Math.min(1, t || 0));
}
function _r(t, n, e) {
  return (t < 60 ? n + (e - n) * t / 60 : t < 180 ? e : t < 240 ? n + (e - n) * (240 - t) / 60 : n) * 255;
}
function wf(t, n, e, r, i) {
  var a = t * t, o = a * t;
  return ((1 - 3 * t + 3 * a - o) * n + (4 - 6 * a + 3 * o) * e + (1 + 3 * t + 3 * a - 3 * o) * r + o * i) / 6;
}
function bf(t) {
  var n = t.length - 1;
  return function(e) {
    var r = e <= 0 ? e = 0 : e >= 1 ? (e = 1, n - 1) : Math.floor(e * n), i = t[r], a = t[r + 1], o = r > 0 ? t[r - 1] : 2 * i - a, s = r < n - 1 ? t[r + 2] : 2 * a - i;
    return wf((e - r / n) * n, o, i, a, s);
  };
}
const yi = (t) => () => t;
function xf(t, n) {
  return function(e) {
    return t + e * n;
  };
}
function Mf(t, n, e) {
  return t = Math.pow(t, e), n = Math.pow(n, e) - t, e = 1 / e, function(r) {
    return Math.pow(t + r * n, e);
  };
}
function Af(t) {
  return (t = +t) == 1 ? us : function(n, e) {
    return e - n ? Mf(n, e, t) : yi(isNaN(n) ? e : n);
  };
}
function us(t, n) {
  var e = n - t;
  return e ? xf(t, e) : yi(isNaN(t) ? n : t);
}
const Me = function t(n) {
  var e = Af(n);
  function r(i, a) {
    var o = e((i = be(i)).r, (a = be(a)).r), s = e(i.g, a.g), l = e(i.b, a.b), u = us(i.opacity, a.opacity);
    return function(c) {
      return i.r = o(c), i.g = s(c), i.b = l(c), i.opacity = u(c), i + "";
    };
  }
  return r.gamma = t, r;
}(1);
function $f(t) {
  return function(n) {
    var e = n.length, r = new Array(e), i = new Array(e), a = new Array(e), o, s;
    for (o = 0; o < e; ++o)
      s = be(n[o]), r[o] = s.r || 0, i[o] = s.g || 0, a[o] = s.b || 0;
    return r = t(r), i = t(i), a = t(a), s.opacity = 1, function(l) {
      return s.r = r(l), s.g = i(l), s.b = a(l), s + "";
    };
  };
}
var Nf = $f(bf);
function kf(t, n) {
  n || (n = []);
  var e = t ? Math.min(n.length, t.length) : 0, r = n.slice(), i;
  return function(a) {
    for (i = 0; i < e; ++i) r[i] = t[i] * (1 - a) + n[i] * a;
    return r;
  };
}
function Tf(t) {
  return ArrayBuffer.isView(t) && !(t instanceof DataView);
}
function Sf(t, n) {
  var e = n ? n.length : 0, r = t ? Math.min(e, t.length) : 0, i = new Array(r), a = new Array(e), o;
  for (o = 0; o < r; ++o) i[o] = mi(t[o], n[o]);
  for (; o < e; ++o) a[o] = n[o];
  return function(s) {
    for (o = 0; o < r; ++o) a[o] = i[o](s);
    return a;
  };
}
function zf(t, n) {
  var e = /* @__PURE__ */ new Date();
  return t = +t, n = +n, function(r) {
    return e.setTime(t * (1 - r) + n * r), e;
  };
}
function K(t, n) {
  return t = +t, n = +n, function(e) {
    return t * (1 - e) + n * e;
  };
}
function Pf(t, n) {
  var e = {}, r = {}, i;
  (t === null || typeof t != "object") && (t = {}), (n === null || typeof n != "object") && (n = {});
  for (i in n)
    i in t ? e[i] = mi(t[i], n[i]) : r[i] = n[i];
  return function(a) {
    for (i in e) r[i] = e[i](a);
    return r;
  };
}
var Er = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, yr = new RegExp(Er.source, "g");
function Ef(t) {
  return function() {
    return t;
  };
}
function Of(t) {
  return function(n) {
    return t(n) + "";
  };
}
function ls(t, n) {
  var e = Er.lastIndex = yr.lastIndex = 0, r, i, a, o = -1, s = [], l = [];
  for (t = t + "", n = n + ""; (r = Er.exec(t)) && (i = yr.exec(n)); )
    (a = i.index) > e && (a = n.slice(e, a), s[o] ? s[o] += a : s[++o] = a), (r = r[0]) === (i = i[0]) ? s[o] ? s[o] += i : s[++o] = i : (s[++o] = null, l.push({ i: o, x: K(r, i) })), e = yr.lastIndex;
  return e < n.length && (a = n.slice(e), s[o] ? s[o] += a : s[++o] = a), s.length < 2 ? l[0] ? Of(l[0].x) : Ef(n) : (n = l.length, function(u) {
    for (var c = 0, h; c < n; ++c) s[(h = l[c]).i] = h.x(u);
    return s.join("");
  });
}
function mi(t, n) {
  var e = typeof n, r;
  return n == null || e === "boolean" ? yi(n) : (e === "number" ? K : e === "string" ? (r = It(n)) ? (n = r, Me) : ls : n instanceof It ? Me : n instanceof Date ? zf : Tf(n) ? kf : Array.isArray(n) ? Sf : typeof n.valueOf != "function" && typeof n.toString != "function" || isNaN(n) ? Pf : K)(t, n);
}
function Cf(t, n) {
  return t = +t, n = +n, function(e) {
    return Math.round(t * (1 - e) + n * e);
  };
}
var _a = 180 / Math.PI, Or = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function cs(t, n, e, r, i, a) {
  var o, s, l;
  return (o = Math.sqrt(t * t + n * n)) && (t /= o, n /= o), (l = t * e + n * r) && (e -= t * l, r -= n * l), (s = Math.sqrt(e * e + r * r)) && (e /= s, r /= s, l /= s), t * r < n * e && (t = -t, n = -n, l = -l, o = -o), {
    translateX: i,
    translateY: a,
    rotate: Math.atan2(n, t) * _a,
    skewX: Math.atan(l) * _a,
    scaleX: o,
    scaleY: s
  };
}
var Kn;
function If(t) {
  const n = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(t + "");
  return n.isIdentity ? Or : cs(n.a, n.b, n.c, n.d, n.e, n.f);
}
function Rf(t) {
  return t == null || (Kn || (Kn = document.createElementNS("http://www.w3.org/2000/svg", "g")), Kn.setAttribute("transform", t), !(t = Kn.transform.baseVal.consolidate())) ? Or : (t = t.matrix, cs(t.a, t.b, t.c, t.d, t.e, t.f));
}
function fs(t, n, e, r) {
  function i(u) {
    return u.length ? u.pop() + " " : "";
  }
  function a(u, c, h, f, p, d) {
    if (u !== h || c !== f) {
      var _ = p.push("translate(", null, n, null, e);
      d.push({ i: _ - 4, x: K(u, h) }, { i: _ - 2, x: K(c, f) });
    } else (h || f) && p.push("translate(" + h + n + f + e);
  }
  function o(u, c, h, f) {
    u !== c ? (u - c > 180 ? c += 360 : c - u > 180 && (u += 360), f.push({ i: h.push(i(h) + "rotate(", null, r) - 2, x: K(u, c) })) : c && h.push(i(h) + "rotate(" + c + r);
  }
  function s(u, c, h, f) {
    u !== c ? f.push({ i: h.push(i(h) + "skewX(", null, r) - 2, x: K(u, c) }) : c && h.push(i(h) + "skewX(" + c + r);
  }
  function l(u, c, h, f, p, d) {
    if (u !== h || c !== f) {
      var _ = p.push(i(p) + "scale(", null, ",", null, ")");
      d.push({ i: _ - 4, x: K(u, h) }, { i: _ - 2, x: K(c, f) });
    } else (h !== 1 || f !== 1) && p.push(i(p) + "scale(" + h + "," + f + ")");
  }
  return function(u, c) {
    var h = [], f = [];
    return u = t(u), c = t(c), a(u.translateX, u.translateY, c.translateX, c.translateY, h, f), o(u.rotate, c.rotate, h, f), s(u.skewX, c.skewX, h, f), l(u.scaleX, u.scaleY, c.scaleX, c.scaleY, h, f), u = c = null, function(p) {
      for (var d = -1, _ = f.length, w; ++d < _; ) h[(w = f[d]).i] = w.x(p);
      return h.join("");
    };
  };
}
var jf = fs(If, "px, ", "px)", "deg)"), qf = fs(Rf, ", ", ")", ")"), en = 0, wn = 0, gn = 0, hs = 1e3, Ae, bn, $e = 0, Rt = 0, He = 0, zn = typeof performance == "object" && performance.now ? performance : Date, ps = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(t) {
  setTimeout(t, 17);
};
function Be() {
  return Rt || (ps(Ff), Rt = zn.now() + He);
}
function Ff() {
  Rt = 0;
}
function Pn() {
  this._call = this._time = this._next = null;
}
Pn.prototype = ds.prototype = {
  constructor: Pn,
  restart: function(t, n, e) {
    if (typeof t != "function") throw new TypeError("callback is not a function");
    e = (e == null ? Be() : +e) + (n == null ? 0 : +n), !this._next && bn !== this && (bn ? bn._next = this : Ae = this, bn = this), this._call = t, this._time = e, Cr();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Cr());
  }
};
function ds(t, n, e) {
  var r = new Pn();
  return r.restart(t, n, e), r;
}
function Lf() {
  Be(), ++en;
  for (var t = Ae, n; t; )
    (n = Rt - t._time) >= 0 && t._call.call(void 0, n), t = t._next;
  --en;
}
function ya() {
  Rt = ($e = zn.now()) + He, en = wn = 0;
  try {
    Lf();
  } finally {
    en = 0, Hf(), Rt = 0;
  }
}
function Df() {
  var t = zn.now(), n = t - $e;
  n > hs && (He -= n, $e = t);
}
function Hf() {
  for (var t, n = Ae, e, r = 1 / 0; n; )
    n._call ? (r > n._time && (r = n._time), t = n, n = n._next) : (e = n._next, n._next = null, n = t ? t._next = e : Ae = e);
  bn = t, Cr(r);
}
function Cr(t) {
  if (!en) {
    wn && (wn = clearTimeout(wn));
    var n = t - Rt;
    n > 24 ? (t < 1 / 0 && (wn = setTimeout(ya, t - zn.now() - He)), gn && (gn = clearInterval(gn))) : (gn || ($e = zn.now(), gn = setInterval(Df, hs)), en = 1, ps(ya));
  }
}
function ma(t, n, e) {
  var r = new Pn();
  return n = n == null ? 0 : +n, r.restart((i) => {
    r.stop(), t(i + n);
  }, n, e), r;
}
function Bf(t, n, e) {
  var r = new Pn(), i = n;
  return r._restart = r.restart, r.restart = function(a, o, s) {
    o = +o, s = s == null ? Be() : +s, r._restart(function l(u) {
      u += i, r._restart(l, i += o, s), a(u);
    }, o, s);
  }, r.restart(t, n, e), r;
}
var Xf = Go("start", "end", "cancel", "interrupt"), Uf = [], gs = 0, va = 1, Ir = 2, ue = 3, wa = 4, Rr = 5, le = 6;
function Xe(t, n, e, r, i, a) {
  var o = t.__transition;
  if (!o) t.__transition = {};
  else if (e in o) return;
  Yf(t, e, {
    name: n,
    index: r,
    // For context during callback.
    group: i,
    // For context during callback.
    on: Xf,
    tween: Uf,
    time: a.time,
    delay: a.delay,
    duration: a.duration,
    ease: a.ease,
    timer: null,
    state: gs
  });
}
function vi(t, n) {
  var e = tt(t, n);
  if (e.state > gs) throw new Error("too late; already scheduled");
  return e;
}
function ot(t, n) {
  var e = tt(t, n);
  if (e.state > ue) throw new Error("too late; already running");
  return e;
}
function tt(t, n) {
  var e = t.__transition;
  if (!e || !(e = e[n])) throw new Error("transition not found");
  return e;
}
function Yf(t, n, e) {
  var r = t.__transition, i;
  r[n] = e, e.timer = ds(a, 0, e.time);
  function a(u) {
    e.state = va, e.timer.restart(o, e.delay, e.time), e.delay <= u && o(u - e.delay);
  }
  function o(u) {
    var c, h, f, p;
    if (e.state !== va) return l();
    for (c in r)
      if (p = r[c], p.name === e.name) {
        if (p.state === ue) return ma(o);
        p.state === wa ? (p.state = le, p.timer.stop(), p.on.call("interrupt", t, t.__data__, p.index, p.group), delete r[c]) : +c < n && (p.state = le, p.timer.stop(), p.on.call("cancel", t, t.__data__, p.index, p.group), delete r[c]);
      }
    if (ma(function() {
      e.state === ue && (e.state = wa, e.timer.restart(s, e.delay, e.time), s(u));
    }), e.state = Ir, e.on.call("start", t, t.__data__, e.index, e.group), e.state === Ir) {
      for (e.state = ue, i = new Array(f = e.tween.length), c = 0, h = -1; c < f; ++c)
        (p = e.tween[c].value.call(t, t.__data__, e.index, e.group)) && (i[++h] = p);
      i.length = h + 1;
    }
  }
  function s(u) {
    for (var c = u < e.duration ? e.ease.call(null, u / e.duration) : (e.timer.restart(l), e.state = Rr, 1), h = -1, f = i.length; ++h < f; )
      i[h].call(t, c);
    e.state === Rr && (e.on.call("end", t, t.__data__, e.index, e.group), l());
  }
  function l() {
    e.state = le, e.timer.stop(), delete r[n];
    for (var u in r) return;
    delete t.__transition;
  }
}
function Gf(t, n) {
  var e = t.__transition, r, i, a = !0, o;
  if (e) {
    n = n == null ? null : n + "";
    for (o in e) {
      if ((r = e[o]).name !== n) {
        a = !1;
        continue;
      }
      i = r.state > Ir && r.state < Rr, r.state = le, r.timer.stop(), r.on.call(i ? "interrupt" : "cancel", t, t.__data__, r.index, r.group), delete e[o];
    }
    a && delete t.__transition;
  }
}
function Vf(t) {
  return this.each(function() {
    Gf(this, t);
  });
}
function Kf(t, n) {
  var e, r;
  return function() {
    var i = ot(this, t), a = i.tween;
    if (a !== e) {
      r = e = a;
      for (var o = 0, s = r.length; o < s; ++o)
        if (r[o].name === n) {
          r = r.slice(), r.splice(o, 1);
          break;
        }
    }
    i.tween = r;
  };
}
function Zf(t, n, e) {
  var r, i;
  if (typeof e != "function") throw new Error();
  return function() {
    var a = ot(this, t), o = a.tween;
    if (o !== r) {
      i = (r = o).slice();
      for (var s = { name: n, value: e }, l = 0, u = i.length; l < u; ++l)
        if (i[l].name === n) {
          i[l] = s;
          break;
        }
      l === u && i.push(s);
    }
    a.tween = i;
  };
}
function Wf(t, n) {
  var e = this._id;
  if (t += "", arguments.length < 2) {
    for (var r = tt(this.node(), e).tween, i = 0, a = r.length, o; i < a; ++i)
      if ((o = r[i]).name === t)
        return o.value;
    return null;
  }
  return this.each((n == null ? Kf : Zf)(e, t, n));
}
function wi(t, n, e) {
  var r = t._id;
  return t.each(function() {
    var i = ot(this, r);
    (i.value || (i.value = {}))[n] = e.apply(this, arguments);
  }), function(i) {
    return tt(i, r).value[n];
  };
}
function _s(t, n) {
  var e;
  return (typeof n == "number" ? K : n instanceof It ? Me : (e = It(n)) ? (n = e, Me) : ls)(t, n);
}
function Jf(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function Qf(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function th(t, n, e) {
  var r, i = e + "", a;
  return function() {
    var o = this.getAttribute(t);
    return o === i ? null : o === r ? a : a = n(r = o, e);
  };
}
function nh(t, n, e) {
  var r, i = e + "", a;
  return function() {
    var o = this.getAttributeNS(t.space, t.local);
    return o === i ? null : o === r ? a : a = n(r = o, e);
  };
}
function eh(t, n, e) {
  var r, i, a;
  return function() {
    var o, s = e(this), l;
    return s == null ? void this.removeAttribute(t) : (o = this.getAttribute(t), l = s + "", o === l ? null : o === r && l === i ? a : (i = l, a = n(r = o, s)));
  };
}
function rh(t, n, e) {
  var r, i, a;
  return function() {
    var o, s = e(this), l;
    return s == null ? void this.removeAttributeNS(t.space, t.local) : (o = this.getAttributeNS(t.space, t.local), l = s + "", o === l ? null : o === r && l === i ? a : (i = l, a = n(r = o, s)));
  };
}
function ih(t, n) {
  var e = De(t), r = e === "transform" ? qf : _s;
  return this.attrTween(t, typeof n == "function" ? (e.local ? rh : eh)(e, r, wi(this, "attr." + t, n)) : n == null ? (e.local ? Qf : Jf)(e) : (e.local ? nh : th)(e, r, n));
}
function ah(t, n) {
  return function(e) {
    this.setAttribute(t, n.call(this, e));
  };
}
function oh(t, n) {
  return function(e) {
    this.setAttributeNS(t.space, t.local, n.call(this, e));
  };
}
function sh(t, n) {
  var e, r;
  function i() {
    var a = n.apply(this, arguments);
    return a !== r && (e = (r = a) && oh(t, a)), e;
  }
  return i._value = n, i;
}
function uh(t, n) {
  var e, r;
  function i() {
    var a = n.apply(this, arguments);
    return a !== r && (e = (r = a) && ah(t, a)), e;
  }
  return i._value = n, i;
}
function lh(t, n) {
  var e = "attr." + t;
  if (arguments.length < 2) return (e = this.tween(e)) && e._value;
  if (n == null) return this.tween(e, null);
  if (typeof n != "function") throw new Error();
  var r = De(t);
  return this.tween(e, (r.local ? sh : uh)(r, n));
}
function ch(t, n) {
  return function() {
    vi(this, t).delay = +n.apply(this, arguments);
  };
}
function fh(t, n) {
  return n = +n, function() {
    vi(this, t).delay = n;
  };
}
function hh(t) {
  var n = this._id;
  return arguments.length ? this.each((typeof t == "function" ? ch : fh)(n, t)) : tt(this.node(), n).delay;
}
function ph(t, n) {
  return function() {
    ot(this, t).duration = +n.apply(this, arguments);
  };
}
function dh(t, n) {
  return n = +n, function() {
    ot(this, t).duration = n;
  };
}
function gh(t) {
  var n = this._id;
  return arguments.length ? this.each((typeof t == "function" ? ph : dh)(n, t)) : tt(this.node(), n).duration;
}
function _h(t, n) {
  if (typeof n != "function") throw new Error();
  return function() {
    ot(this, t).ease = n;
  };
}
function yh(t) {
  var n = this._id;
  return arguments.length ? this.each(_h(n, t)) : tt(this.node(), n).ease;
}
function mh(t, n) {
  return function() {
    var e = n.apply(this, arguments);
    if (typeof e != "function") throw new Error();
    ot(this, t).ease = e;
  };
}
function vh(t) {
  if (typeof t != "function") throw new Error();
  return this.each(mh(this._id, t));
}
function wh(t) {
  typeof t != "function" && (t = Zo(t));
  for (var n = this._groups, e = n.length, r = new Array(e), i = 0; i < e; ++i)
    for (var a = n[i], o = a.length, s = r[i] = [], l, u = 0; u < o; ++u)
      (l = a[u]) && t.call(l, l.__data__, u, a) && s.push(l);
  return new pt(r, this._parents, this._name, this._id);
}
function bh(t) {
  if (t._id !== this._id) throw new Error();
  for (var n = this._groups, e = t._groups, r = n.length, i = e.length, a = Math.min(r, i), o = new Array(r), s = 0; s < a; ++s)
    for (var l = n[s], u = e[s], c = l.length, h = o[s] = new Array(c), f, p = 0; p < c; ++p)
      (f = l[p] || u[p]) && (h[p] = f);
  for (; s < r; ++s)
    o[s] = n[s];
  return new pt(o, this._parents, this._name, this._id);
}
function xh(t) {
  return (t + "").trim().split(/^|\s+/).every(function(n) {
    var e = n.indexOf(".");
    return e >= 0 && (n = n.slice(0, e)), !n || n === "start";
  });
}
function Mh(t, n, e) {
  var r, i, a = xh(n) ? vi : ot;
  return function() {
    var o = a(this, t), s = o.on;
    s !== r && (i = (r = s).copy()).on(n, e), o.on = i;
  };
}
function Ah(t, n) {
  var e = this._id;
  return arguments.length < 2 ? tt(this.node(), e).on.on(t) : this.each(Mh(e, t, n));
}
function $h(t) {
  return function() {
    var n = this.parentNode;
    for (var e in this.__transition) if (+e !== t) return;
    n && n.removeChild(this);
  };
}
function Nh() {
  return this.on("end.remove", $h(this._id));
}
function kh(t) {
  var n = this._name, e = this._id;
  typeof t != "function" && (t = di(t));
  for (var r = this._groups, i = r.length, a = new Array(i), o = 0; o < i; ++o)
    for (var s = r[o], l = s.length, u = a[o] = new Array(l), c, h, f = 0; f < l; ++f)
      (c = s[f]) && (h = t.call(c, c.__data__, f, s)) && ("__data__" in c && (h.__data__ = c.__data__), u[f] = h, Xe(u[f], n, e, f, u, tt(c, e)));
  return new pt(a, this._parents, n, e);
}
function Th(t) {
  var n = this._name, e = this._id;
  typeof t != "function" && (t = Ko(t));
  for (var r = this._groups, i = r.length, a = [], o = [], s = 0; s < i; ++s)
    for (var l = r[s], u = l.length, c, h = 0; h < u; ++h)
      if (c = l[h]) {
        for (var f = t.call(c, c.__data__, h, l), p, d = tt(c, e), _ = 0, w = f.length; _ < w; ++_)
          (p = f[_]) && Xe(p, n, e, _, f, d);
        a.push(f), o.push(c);
      }
  return new pt(a, o, n, e);
}
var Sh = Dn.prototype.constructor;
function zh() {
  return new Sh(this._groups, this._parents);
}
function Ph(t, n) {
  var e, r, i;
  return function() {
    var a = nn(this, t), o = (this.style.removeProperty(t), nn(this, t));
    return a === o ? null : a === e && o === r ? i : i = n(e = a, r = o);
  };
}
function ys(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function Eh(t, n, e) {
  var r, i = e + "", a;
  return function() {
    var o = nn(this, t);
    return o === i ? null : o === r ? a : a = n(r = o, e);
  };
}
function Oh(t, n, e) {
  var r, i, a;
  return function() {
    var o = nn(this, t), s = e(this), l = s + "";
    return s == null && (l = s = (this.style.removeProperty(t), nn(this, t))), o === l ? null : o === r && l === i ? a : (i = l, a = n(r = o, s));
  };
}
function Ch(t, n) {
  var e, r, i, a = "style." + n, o = "end." + a, s;
  return function() {
    var l = ot(this, t), u = l.on, c = l.value[a] == null ? s || (s = ys(n)) : void 0;
    (u !== e || i !== c) && (r = (e = u).copy()).on(o, i = c), l.on = r;
  };
}
function Ih(t, n, e) {
  var r = (t += "") == "transform" ? jf : _s;
  return n == null ? this.styleTween(t, Ph(t, r)).on("end.style." + t, ys(t)) : typeof n == "function" ? this.styleTween(t, Oh(t, r, wi(this, "style." + t, n))).each(Ch(this._id, t)) : this.styleTween(t, Eh(t, r, n), e).on("end.style." + t, null);
}
function Rh(t, n, e) {
  return function(r) {
    this.style.setProperty(t, n.call(this, r), e);
  };
}
function jh(t, n, e) {
  var r, i;
  function a() {
    var o = n.apply(this, arguments);
    return o !== i && (r = (i = o) && Rh(t, o, e)), r;
  }
  return a._value = n, a;
}
function qh(t, n, e) {
  var r = "style." + (t += "");
  if (arguments.length < 2) return (r = this.tween(r)) && r._value;
  if (n == null) return this.tween(r, null);
  if (typeof n != "function") throw new Error();
  return this.tween(r, jh(t, n, e ?? ""));
}
function Fh(t) {
  return function() {
    this.textContent = t;
  };
}
function Lh(t) {
  return function() {
    var n = t(this);
    this.textContent = n ?? "";
  };
}
function Dh(t) {
  return this.tween("text", typeof t == "function" ? Lh(wi(this, "text", t)) : Fh(t == null ? "" : t + ""));
}
function Hh(t) {
  return function(n) {
    this.textContent = t.call(this, n);
  };
}
function Bh(t) {
  var n, e;
  function r() {
    var i = t.apply(this, arguments);
    return i !== e && (n = (e = i) && Hh(i)), n;
  }
  return r._value = t, r;
}
function Xh(t) {
  var n = "text";
  if (arguments.length < 1) return (n = this.tween(n)) && n._value;
  if (t == null) return this.tween(n, null);
  if (typeof t != "function") throw new Error();
  return this.tween(n, Bh(t));
}
function Uh() {
  for (var t = this._name, n = this._id, e = ms(), r = this._groups, i = r.length, a = 0; a < i; ++a)
    for (var o = r[a], s = o.length, l, u = 0; u < s; ++u)
      if (l = o[u]) {
        var c = tt(l, n);
        Xe(l, t, e, u, o, {
          time: c.time + c.delay + c.duration,
          delay: 0,
          duration: c.duration,
          ease: c.ease
        });
      }
  return new pt(r, this._parents, t, e);
}
function Yh() {
  var t, n, e = this, r = e._id, i = e.size();
  return new Promise(function(a, o) {
    var s = { value: o }, l = { value: function() {
      --i === 0 && a();
    } };
    e.each(function() {
      var u = ot(this, r), c = u.on;
      c !== t && (n = (t = c).copy(), n._.cancel.push(s), n._.interrupt.push(s), n._.end.push(l)), u.on = n;
    }), i === 0 && a();
  });
}
var Gh = 0;
function pt(t, n, e, r) {
  this._groups = t, this._parents = n, this._name = e, this._id = r;
}
function ms() {
  return ++Gh;
}
var ut = Dn.prototype;
pt.prototype = {
  constructor: pt,
  select: kh,
  selectAll: Th,
  selectChild: ut.selectChild,
  selectChildren: ut.selectChildren,
  filter: wh,
  merge: bh,
  selection: zh,
  transition: Uh,
  call: ut.call,
  nodes: ut.nodes,
  node: ut.node,
  size: ut.size,
  empty: ut.empty,
  each: ut.each,
  on: Ah,
  attr: ih,
  attrTween: lh,
  style: Ih,
  styleTween: qh,
  text: Dh,
  textTween: Xh,
  remove: Nh,
  tween: Wf,
  delay: hh,
  duration: gh,
  ease: yh,
  easeVarying: vh,
  end: Yh,
  [Symbol.iterator]: ut[Symbol.iterator]
};
function Vh(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var Kh = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: Vh
};
function Zh(t, n) {
  for (var e; !(e = t.__transition) || !(e = e[n]); )
    if (!(t = t.parentNode))
      throw new Error(`transition ${n} not found`);
  return e;
}
function Wh(t) {
  var n, e;
  t instanceof pt ? (n = t._id, t = t._name) : (n = ms(), (e = Kh).time = Be(), t = t == null ? null : t + "");
  for (var r = this._groups, i = r.length, a = 0; a < i; ++a)
    for (var o = r[a], s = o.length, l, u = 0; u < s; ++u)
      (l = o[u]) && Xe(l, t, n, u, o, e || Zh(l, n));
  return new pt(r, this._parents, t, n);
}
Dn.prototype.interrupt = Vf;
Dn.prototype.transition = Wh;
const jr = Math.PI, qr = 2 * jr, St = 1e-6, Jh = qr - St;
function vs(t) {
  this._ += t[0];
  for (let n = 1, e = t.length; n < e; ++n)
    this._ += arguments[n] + t[n];
}
function Qh(t) {
  let n = Math.floor(t);
  if (!(n >= 0)) throw new Error(`invalid digits: ${t}`);
  if (n > 15) return vs;
  const e = 10 ** n;
  return function(r) {
    this._ += r[0];
    for (let i = 1, a = r.length; i < a; ++i)
      this._ += Math.round(arguments[i] * e) / e + r[i];
  };
}
class tp {
  constructor(n) {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null, this._ = "", this._append = n == null ? vs : Qh(n);
  }
  moveTo(n, e) {
    this._append`M${this._x0 = this._x1 = +n},${this._y0 = this._y1 = +e}`;
  }
  closePath() {
    this._x1 !== null && (this._x1 = this._x0, this._y1 = this._y0, this._append`Z`);
  }
  lineTo(n, e) {
    this._append`L${this._x1 = +n},${this._y1 = +e}`;
  }
  quadraticCurveTo(n, e, r, i) {
    this._append`Q${+n},${+e},${this._x1 = +r},${this._y1 = +i}`;
  }
  bezierCurveTo(n, e, r, i, a, o) {
    this._append`C${+n},${+e},${+r},${+i},${this._x1 = +a},${this._y1 = +o}`;
  }
  arcTo(n, e, r, i, a) {
    if (n = +n, e = +e, r = +r, i = +i, a = +a, a < 0) throw new Error(`negative radius: ${a}`);
    let o = this._x1, s = this._y1, l = r - n, u = i - e, c = o - n, h = s - e, f = c * c + h * h;
    if (this._x1 === null)
      this._append`M${this._x1 = n},${this._y1 = e}`;
    else if (f > St) if (!(Math.abs(h * l - u * c) > St) || !a)
      this._append`L${this._x1 = n},${this._y1 = e}`;
    else {
      let p = r - o, d = i - s, _ = l * l + u * u, w = p * p + d * d, y = Math.sqrt(_), M = Math.sqrt(f), A = a * Math.tan((jr - Math.acos((_ + f - w) / (2 * y * M))) / 2), g = A / M, v = A / y;
      Math.abs(g - 1) > St && this._append`L${n + g * c},${e + g * h}`, this._append`A${a},${a},0,0,${+(h * p > c * d)},${this._x1 = n + v * l},${this._y1 = e + v * u}`;
    }
  }
  arc(n, e, r, i, a, o) {
    if (n = +n, e = +e, r = +r, o = !!o, r < 0) throw new Error(`negative radius: ${r}`);
    let s = r * Math.cos(i), l = r * Math.sin(i), u = n + s, c = e + l, h = 1 ^ o, f = o ? i - a : a - i;
    this._x1 === null ? this._append`M${u},${c}` : (Math.abs(this._x1 - u) > St || Math.abs(this._y1 - c) > St) && this._append`L${u},${c}`, r && (f < 0 && (f = f % qr + qr), f > Jh ? this._append`A${r},${r},0,1,${h},${n - s},${e - l}A${r},${r},0,1,${h},${this._x1 = u},${this._y1 = c}` : f > St && this._append`A${r},${r},0,${+(f >= jr)},${h},${this._x1 = n + r * Math.cos(a)},${this._y1 = e + r * Math.sin(a)}`);
  }
  rect(n, e, r, i) {
    this._append`M${this._x0 = this._x1 = +n},${this._y0 = this._y1 = +e}h${r = +r}v${+i}h${-r}Z`;
  }
  toString() {
    return this._;
  }
}
function np(t) {
  return Math.abs(t = Math.round(t)) >= 1e21 ? t.toLocaleString("en").replace(/,/g, "") : t.toString(10);
}
function Ne(t, n) {
  if ((e = (t = n ? t.toExponential(n - 1) : t.toExponential()).indexOf("e")) < 0) return null;
  var e, r = t.slice(0, e);
  return [
    r.length > 1 ? r[0] + r.slice(2) : r,
    +t.slice(e + 1)
  ];
}
function rn(t) {
  return t = Ne(Math.abs(t)), t ? t[1] : NaN;
}
function ep(t, n) {
  return function(e, r) {
    for (var i = e.length, a = [], o = 0, s = t[0], l = 0; i > 0 && s > 0 && (l + s + 1 > r && (s = Math.max(1, r - l)), a.push(e.substring(i -= s, i + s)), !((l += s + 1) > r)); )
      s = t[o = (o + 1) % t.length];
    return a.reverse().join(n);
  };
}
function rp(t) {
  return function(n) {
    return n.replace(/[0-9]/g, function(e) {
      return t[+e];
    });
  };
}
var ip = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function ke(t) {
  if (!(n = ip.exec(t))) throw new Error("invalid format: " + t);
  var n;
  return new bi({
    fill: n[1],
    align: n[2],
    sign: n[3],
    symbol: n[4],
    zero: n[5],
    width: n[6],
    comma: n[7],
    precision: n[8] && n[8].slice(1),
    trim: n[9],
    type: n[10]
  });
}
ke.prototype = bi.prototype;
function bi(t) {
  this.fill = t.fill === void 0 ? " " : t.fill + "", this.align = t.align === void 0 ? ">" : t.align + "", this.sign = t.sign === void 0 ? "-" : t.sign + "", this.symbol = t.symbol === void 0 ? "" : t.symbol + "", this.zero = !!t.zero, this.width = t.width === void 0 ? void 0 : +t.width, this.comma = !!t.comma, this.precision = t.precision === void 0 ? void 0 : +t.precision, this.trim = !!t.trim, this.type = t.type === void 0 ? "" : t.type + "";
}
bi.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
function ap(t) {
  t: for (var n = t.length, e = 1, r = -1, i; e < n; ++e)
    switch (t[e]) {
      case ".":
        r = i = e;
        break;
      case "0":
        r === 0 && (r = e), i = e;
        break;
      default:
        if (!+t[e]) break t;
        r > 0 && (r = 0);
        break;
    }
  return r > 0 ? t.slice(0, r) + t.slice(i + 1) : t;
}
var ws;
function op(t, n) {
  var e = Ne(t, n);
  if (!e) return t + "";
  var r = e[0], i = e[1], a = i - (ws = Math.max(-8, Math.min(8, Math.floor(i / 3))) * 3) + 1, o = r.length;
  return a === o ? r : a > o ? r + new Array(a - o + 1).join("0") : a > 0 ? r.slice(0, a) + "." + r.slice(a) : "0." + new Array(1 - a).join("0") + Ne(t, Math.max(0, n + a - 1))[0];
}
function ba(t, n) {
  var e = Ne(t, n);
  if (!e) return t + "";
  var r = e[0], i = e[1];
  return i < 0 ? "0." + new Array(-i).join("0") + r : r.length > i + 1 ? r.slice(0, i + 1) + "." + r.slice(i + 1) : r + new Array(i - r.length + 2).join("0");
}
const xa = {
  "%": (t, n) => (t * 100).toFixed(n),
  b: (t) => Math.round(t).toString(2),
  c: (t) => t + "",
  d: np,
  e: (t, n) => t.toExponential(n),
  f: (t, n) => t.toFixed(n),
  g: (t, n) => t.toPrecision(n),
  o: (t) => Math.round(t).toString(8),
  p: (t, n) => ba(t * 100, n),
  r: ba,
  s: op,
  X: (t) => Math.round(t).toString(16).toUpperCase(),
  x: (t) => Math.round(t).toString(16)
};
function Ma(t) {
  return t;
}
var Aa = Array.prototype.map, $a = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function sp(t) {
  var n = t.grouping === void 0 || t.thousands === void 0 ? Ma : ep(Aa.call(t.grouping, Number), t.thousands + ""), e = t.currency === void 0 ? "" : t.currency[0] + "", r = t.currency === void 0 ? "" : t.currency[1] + "", i = t.decimal === void 0 ? "." : t.decimal + "", a = t.numerals === void 0 ? Ma : rp(Aa.call(t.numerals, String)), o = t.percent === void 0 ? "%" : t.percent + "", s = t.minus === void 0 ? "−" : t.minus + "", l = t.nan === void 0 ? "NaN" : t.nan + "";
  function u(h) {
    h = ke(h);
    var f = h.fill, p = h.align, d = h.sign, _ = h.symbol, w = h.zero, y = h.width, M = h.comma, A = h.precision, g = h.trim, v = h.type;
    v === "n" ? (M = !0, v = "g") : xa[v] || (A === void 0 && (A = 12), g = !0, v = "g"), (w || f === "0" && p === "=") && (w = !0, f = "0", p = "=");
    var T = _ === "$" ? e : _ === "#" && /[boxX]/.test(v) ? "0" + v.toLowerCase() : "", k = _ === "$" ? r : /[%p]/.test(v) ? o : "", O = xa[v], F = /[defgprs%]/.test(v);
    A = A === void 0 ? 6 : /[gprs]/.test(v) ? Math.max(1, Math.min(21, A)) : Math.max(0, Math.min(20, A));
    function R(m) {
      var S = T, $ = k, j, Tt, B;
      if (v === "c")
        $ = O(m) + $, m = "";
      else {
        m = +m;
        var Y = m < 0 || 1 / m < 0;
        if (m = isNaN(m) ? l : O(Math.abs(m), A), g && (m = ap(m)), Y && +m == 0 && d !== "+" && (Y = !1), S = (Y ? d === "(" ? d : s : d === "-" || d === "(" ? "" : d) + S, $ = (v === "s" ? $a[8 + ws / 3] : "") + $ + (Y && d === "(" ? ")" : ""), F) {
          for (j = -1, Tt = m.length; ++j < Tt; )
            if (B = m.charCodeAt(j), 48 > B || B > 57) {
              $ = (B === 46 ? i + m.slice(j + 1) : m.slice(j)) + $, m = m.slice(0, j);
              break;
            }
        }
      }
      M && !w && (m = n(m, 1 / 0));
      var V = S.length + m.length + $.length, C = V < y ? new Array(y - V + 1).join(f) : "";
      switch (M && w && (m = n(C + m, C.length ? y - $.length : 1 / 0), C = ""), p) {
        case "<":
          m = S + m + $ + C;
          break;
        case "=":
          m = S + C + m + $;
          break;
        case "^":
          m = C.slice(0, V = C.length >> 1) + S + m + $ + C.slice(V);
          break;
        default:
          m = C + S + m + $;
          break;
      }
      return a(m);
    }
    return R.toString = function() {
      return h + "";
    }, R;
  }
  function c(h, f) {
    var p = u((h = ke(h), h.type = "f", h)), d = Math.max(-8, Math.min(8, Math.floor(rn(f) / 3))) * 3, _ = Math.pow(10, -d), w = $a[8 + d / 3];
    return function(y) {
      return p(_ * y) + w;
    };
  }
  return {
    format: u,
    formatPrefix: c
  };
}
var Zn, bs, xs;
up({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});
function up(t) {
  return Zn = sp(t), bs = Zn.format, xs = Zn.formatPrefix, Zn;
}
function lp(t) {
  return Math.max(0, -rn(Math.abs(t)));
}
function cp(t, n) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(rn(n) / 3))) * 3 - rn(Math.abs(t)));
}
function fp(t, n) {
  return t = Math.abs(t), n = Math.abs(n) - t, Math.max(0, rn(n) - rn(t)) + 1;
}
const hp = Math.random, pp = function t(n) {
  function e(r, i) {
    var a, o;
    return r = r == null ? 0 : +r, i = i == null ? 1 : +i, function() {
      var s;
      if (a != null) s = a, a = null;
      else do
        a = n() * 2 - 1, s = n() * 2 - 1, o = a * a + s * s;
      while (!o || o > 1);
      return r + i * s * Math.sqrt(-2 * Math.log(o) / o);
    };
  }
  return e.source = t, e;
}(hp);
function dp(t, n) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(t);
      break;
    default:
      this.range(n).domain(t);
      break;
  }
  return this;
}
function gp(t) {
  return function() {
    return t;
  };
}
function _p(t) {
  return +t;
}
var Na = [0, 1];
function Gt(t) {
  return t;
}
function Fr(t, n) {
  return (n -= t = +t) ? function(e) {
    return (e - t) / n;
  } : gp(isNaN(n) ? NaN : 0.5);
}
function yp(t, n) {
  var e;
  return t > n && (e = t, t = n, n = e), function(r) {
    return Math.max(t, Math.min(n, r));
  };
}
function mp(t, n, e) {
  var r = t[0], i = t[1], a = n[0], o = n[1];
  return i < r ? (r = Fr(i, r), a = e(o, a)) : (r = Fr(r, i), a = e(a, o)), function(s) {
    return a(r(s));
  };
}
function vp(t, n, e) {
  var r = Math.min(t.length, n.length) - 1, i = new Array(r), a = new Array(r), o = -1;
  for (t[r] < t[0] && (t = t.slice().reverse(), n = n.slice().reverse()); ++o < r; )
    i[o] = Fr(t[o], t[o + 1]), a[o] = e(n[o], n[o + 1]);
  return function(s) {
    var l = fl(t, s, 1, r) - 1;
    return a[l](i[l](s));
  };
}
function wp(t, n) {
  return n.domain(t.domain()).range(t.range()).interpolate(t.interpolate()).clamp(t.clamp()).unknown(t.unknown());
}
function bp() {
  var t = Na, n = Na, e = mi, r, i, a, o = Gt, s, l, u;
  function c() {
    var f = Math.min(t.length, n.length);
    return o !== Gt && (o = yp(t[0], t[f - 1])), s = f > 2 ? vp : mp, l = u = null, h;
  }
  function h(f) {
    return f == null || isNaN(f = +f) ? a : (l || (l = s(t.map(r), n, e)))(r(o(f)));
  }
  return h.invert = function(f) {
    return o(i((u || (u = s(n, t.map(r), K)))(f)));
  }, h.domain = function(f) {
    return arguments.length ? (t = Array.from(f, _p), c()) : t.slice();
  }, h.range = function(f) {
    return arguments.length ? (n = Array.from(f), c()) : n.slice();
  }, h.rangeRound = function(f) {
    return n = Array.from(f), e = Cf, c();
  }, h.clamp = function(f) {
    return arguments.length ? (o = f ? !0 : Gt, c()) : o !== Gt;
  }, h.interpolate = function(f) {
    return arguments.length ? (e = f, c()) : e;
  }, h.unknown = function(f) {
    return arguments.length ? (a = f, h) : a;
  }, function(f, p) {
    return r = f, i = p, c();
  };
}
function xp() {
  return bp()(Gt, Gt);
}
function Mp(t, n, e, r) {
  var i = _l(t, n, e), a;
  switch (r = ke(r ?? ",f"), r.type) {
    case "s": {
      var o = Math.max(Math.abs(t), Math.abs(n));
      return r.precision == null && !isNaN(a = cp(i, o)) && (r.precision = a), xs(r, o);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      r.precision == null && !isNaN(a = fp(i, Math.max(Math.abs(t), Math.abs(n)))) && (r.precision = a - (r.type === "e"));
      break;
    }
    case "f":
    case "%": {
      r.precision == null && !isNaN(a = lp(i)) && (r.precision = a - (r.type === "%") * 2);
      break;
    }
  }
  return bs(r);
}
function Ap(t) {
  var n = t.domain;
  return t.ticks = function(e) {
    var r = n();
    return gl(r[0], r[r.length - 1], e ?? 10);
  }, t.tickFormat = function(e, r) {
    var i = n();
    return Mp(i[0], i[i.length - 1], e ?? 10, r);
  }, t.nice = function(e) {
    e == null && (e = 10);
    var r = n(), i = 0, a = r.length - 1, o = r[i], s = r[a], l, u, c = 10;
    for (s < o && (u = o, o = s, s = u, u = i, i = a, a = u); c-- > 0; ) {
      if (u = Sr(o, s, e), u === l)
        return r[i] = o, r[a] = s, n(r);
      if (u > 0)
        o = Math.floor(o / u) * u, s = Math.ceil(s / u) * u;
      else if (u < 0)
        o = Math.ceil(o * u) / u, s = Math.floor(s * u) / u;
      else
        break;
      l = u;
    }
    return t;
  }, t;
}
function _t() {
  var t = xp();
  return t.copy = function() {
    return wp(t, _t());
  }, dp.apply(t, arguments), Ap(t);
}
function Ms(t) {
  for (var n = t.length / 6 | 0, e = new Array(n), r = 0; r < n; ) e[r] = "#" + t.slice(r * 6, ++r * 6);
  return e;
}
const As = (t) => Nf(t[t.length - 1]);
var $p = new Array(3).concat(
  "fc8d59ffffbf99d594",
  "d7191cfdae61abdda42b83ba",
  "d7191cfdae61ffffbfabdda42b83ba",
  "d53e4ffc8d59fee08be6f59899d5943288bd",
  "d53e4ffc8d59fee08bffffbfe6f59899d5943288bd",
  "d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd",
  "d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd",
  "9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2",
  "9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2"
).map(Ms);
const Np = As($p);
var kp = new Array(3).concat(
  "f0f0f0bdbdbd636363",
  "f7f7f7cccccc969696525252",
  "f7f7f7cccccc969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
).map(Ms);
const Tp = As(kp);
function Yt(t) {
  return function() {
    return t;
  };
}
function Sp(t) {
  let n = 3;
  return t.digits = function(e) {
    if (!arguments.length) return n;
    if (e == null)
      n = null;
    else {
      const r = Math.floor(e);
      if (!(r >= 0)) throw new RangeError(`invalid digits: ${e}`);
      n = r;
    }
    return t;
  }, () => new tp(n);
}
function zp(t) {
  return typeof t == "object" && "length" in t ? t : Array.from(t);
}
function $s(t) {
  this._context = t;
}
$s.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(t, n) {
    switch (t = +t, n = +n, this._point) {
      case 0:
        this._point = 1, this._line ? this._context.lineTo(t, n) : this._context.moveTo(t, n);
        break;
      case 1:
        this._point = 2;
      // falls through
      default:
        this._context.lineTo(t, n);
        break;
    }
  }
};
function Pp(t) {
  return new $s(t);
}
function Ep(t) {
  return t[0];
}
function Op(t) {
  return t[1];
}
function Ns(t, n) {
  var e = Yt(!0), r = null, i = Pp, a = null, o = Sp(s);
  t = typeof t == "function" ? t : t === void 0 ? Ep : Yt(t), n = typeof n == "function" ? n : n === void 0 ? Op : Yt(n);
  function s(l) {
    var u, c = (l = zp(l)).length, h, f = !1, p;
    for (r == null && (a = i(p = o())), u = 0; u <= c; ++u)
      !(u < c && e(h = l[u], u, l)) === f && ((f = !f) ? a.lineStart() : a.lineEnd()), f && a.point(+t(h, u, l), +n(h, u, l));
    if (p) return a = null, p + "" || null;
  }
  return s.x = function(l) {
    return arguments.length ? (t = typeof l == "function" ? l : Yt(+l), s) : t;
  }, s.y = function(l) {
    return arguments.length ? (n = typeof l == "function" ? l : Yt(+l), s) : n;
  }, s.defined = function(l) {
    return arguments.length ? (e = typeof l == "function" ? l : Yt(!!l), s) : e;
  }, s.curve = function(l) {
    return arguments.length ? (i = l, r != null && (a = i(r)), s) : i;
  }, s.context = function(l) {
    return arguments.length ? (l == null ? r = a = null : a = i(r = l), s) : r;
  }, s;
}
function xn(t, n, e) {
  this.k = t, this.x = n, this.y = e;
}
xn.prototype = {
  constructor: xn,
  scale: function(t) {
    return t === 1 ? this : new xn(this.k * t, this.x, this.y);
  },
  translate: function(t, n) {
    return t === 0 & n === 0 ? this : new xn(this.k, this.x + this.k * t, this.y + this.k * n);
  },
  apply: function(t) {
    return [t[0] * this.k + this.x, t[1] * this.k + this.y];
  },
  applyX: function(t) {
    return t * this.k + this.x;
  },
  applyY: function(t) {
    return t * this.k + this.y;
  },
  invert: function(t) {
    return [(t[0] - this.x) / this.k, (t[1] - this.y) / this.k];
  },
  invertX: function(t) {
    return (t - this.x) / this.k;
  },
  invertY: function(t) {
    return (t - this.y) / this.k;
  },
  rescaleX: function(t) {
    return t.copy().domain(t.range().map(this.invertX, this).map(t.invert, t));
  },
  rescaleY: function(t) {
    return t.copy().domain(t.range().map(this.invertY, this).map(t.invert, t));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
xn.prototype;
(function() {
  try {
    if (typeof document < "u") {
      var t = document.createElement("style");
      t.appendChild(document.createTextNode(".d3-widgets{--color-border: rgb(150, 150, 150);--color-background: #ccc;--color-text: #000;--color-symbol: #fff;--color-lit: #eee;--color-lit-symbol: #bbb;--color-selected: #000;--color-handle: #fff}@media (prefers-color-scheme: dark){.d3-widgets{--color-border: rgb(105, 105, 105);--color-background: #333;--color-text: #bcbcbc;--color-symbol: #000;--color-lit: #111;--color-lit-symbol: #444;--color-selected: #dbdbdb;--color-handle: #9f9f9f}}.d3-widgets.dark-mode{--color-border: rgb(105, 105, 105);--color-background: #333;--color-text: #bcbcbc;--color-symbol: #000;--color-lit: #111;--color-lit-symbol: #444;--color-selected: #dbdbdb;--color-handle: #9f9f9f}._widget_1aazq_40{stroke:var(--color-border);stroke-width:1px;cursor:pointer;pointer-events:all;stroke-opacity:1;fill-opacity:1;fill:var(--color-background);font-size:16px}._widget_1aazq_40 ._title_1aazq_51{font-size:20px;fill:var(--color-text);stroke:none;text-anchor:middle}._widget_1aazq_40 ._label_1aazq_58{fill:var(--color-text);stroke:none}._widget_1aazq_40 ._lit_1aazq_63{fill:var(--color-lit)}._button_1aazq_67>._symbol_1aazq_67,._radio_1aazq_68>._radiobutton_1aazq_68>._symbol_1aazq_67{fill:var(--color-symbol);fill-rule:nonzero;pointer-events:none}._widget_1aazq_40 ._symbol_1aazq_67._selected_1aazq_74,._toggle_1aazq_75._selected_1aazq_74,._widget_1aazq_40 ._symbol_1aazq_67._selected_1aazq_74._lit_1aazq_63{fill:var(--color-selected)}._widget_1aazq_40 ._symbol_1aazq_67._lit_1aazq_63{fill:var(--color-lit-symbol)}._slider_1aazq_84>._track_1aazq_84,._toggle_1aazq_75>._track_1aazq_84{pointer-events:none}._slider_1aazq_84>._track_overlay_1aazq_89,._toggle_1aazq_75>._track_overlay_1aazq_89{pointer-events:all;cursor:pointer;fill:transparent;stroke:transparent}._slider_1aazq_84>._handle_1aazq_97,._toggle_1aazq_75>._handle_1aazq_97{fill:var(--color-handle)}")), document.head.appendChild(t);
    }
  } catch (n) {
    console.error("vite-plugin-css-injected-by-js", n);
  }
})();
function ce(t, n) {
  return t == null || n == null ? NaN : t < n ? -1 : t > n ? 1 : t >= n ? 0 : NaN;
}
function Cp(t, n) {
  return t == null || n == null ? NaN : n < t ? -1 : n > t ? 1 : n >= t ? 0 : NaN;
}
function ks(t) {
  let n, e, r;
  t.length !== 2 ? (n = ce, e = (s, l) => ce(t(s), l), r = (s, l) => t(s) - l) : (n = t === ce || t === Cp ? t : Ip, e = t, r = t);
  function i(s, l, u = 0, c = s.length) {
    if (u < c) {
      if (n(l, l) !== 0) return c;
      do {
        const h = u + c >>> 1;
        e(s[h], l) < 0 ? u = h + 1 : c = h;
      } while (u < c);
    }
    return u;
  }
  function a(s, l, u = 0, c = s.length) {
    if (u < c) {
      if (n(l, l) !== 0) return c;
      do {
        const h = u + c >>> 1;
        e(s[h], l) <= 0 ? u = h + 1 : c = h;
      } while (u < c);
    }
    return u;
  }
  function o(s, l, u = 0, c = s.length) {
    const h = i(s, l, u, c - 1);
    return h > u && r(s[h - 1], l) > -r(s[h], l) ? h - 1 : h;
  }
  return { left: i, center: o, right: a };
}
function Ip() {
  return 0;
}
function Rp(t) {
  return t === null ? NaN : +t;
}
const jp = ks(ce), qp = jp.right;
ks(Rp).center;
const Fp = Math.sqrt(50), Lp = Math.sqrt(10), Dp = Math.sqrt(2);
function Te(t, n, e) {
  const r = (n - t) / Math.max(0, e), i = Math.floor(Math.log10(r)), a = r / Math.pow(10, i), o = a >= Fp ? 10 : a >= Lp ? 5 : a >= Dp ? 2 : 1;
  let s, l, u;
  return i < 0 ? (u = Math.pow(10, -i) / o, s = Math.round(t * u), l = Math.round(n * u), s / u < t && ++s, l / u > n && --l, u = -u) : (u = Math.pow(10, i) * o, s = Math.round(t / u), l = Math.round(n / u), s * u < t && ++s, l * u > n && --l), l < s && 0.5 <= e && e < 2 ? Te(t, n, e * 2) : [s, l, u];
}
function Hp(t, n, e) {
  if (n = +n, t = +t, e = +e, !(e > 0)) return [];
  if (t === n) return [t];
  const r = n < t, [i, a, o] = r ? Te(n, t, e) : Te(t, n, e);
  if (!(a >= i)) return [];
  const s = a - i + 1, l = new Array(s);
  if (r)
    if (o < 0) for (let u = 0; u < s; ++u) l[u] = (a - u) / -o;
    else for (let u = 0; u < s; ++u) l[u] = (a - u) * o;
  else if (o < 0) for (let u = 0; u < s; ++u) l[u] = (i + u) / -o;
  else for (let u = 0; u < s; ++u) l[u] = (i + u) * o;
  return l;
}
function Lr(t, n, e) {
  return n = +n, t = +t, e = +e, Te(t, n, e)[2];
}
function Bp(t, n, e) {
  n = +n, t = +t, e = +e;
  const r = n < t, i = r ? Lr(n, t, e) : Lr(t, n, e);
  return (r ? -1 : 1) * (i < 0 ? 1 / -i : i);
}
function Wn(t, n) {
  let e;
  for (const r of t)
    r != null && (e < r || e === void 0 && r >= r) && (e = r);
  return e;
}
function Xp(t, n, e) {
  t = +t, n = +n, e = (i = arguments.length) < 2 ? (n = t, t = 0, 1) : i < 3 ? 1 : +e;
  for (var r = -1, i = Math.max(0, Math.ceil((n - t) / e)) | 0, a = new Array(i); ++r < i; )
    a[r] = t + r * e;
  return a;
}
var Up = { value: () => {
} };
function xi() {
  for (var t = 0, n = arguments.length, e = {}, r; t < n; ++t) {
    if (!(r = arguments[t] + "") || r in e || /[\s.]/.test(r)) throw new Error("illegal type: " + r);
    e[r] = [];
  }
  return new fe(e);
}
function fe(t) {
  this._ = t;
}
function Yp(t, n) {
  return t.trim().split(/^|\s+/).map(function(e) {
    var r = "", i = e.indexOf(".");
    if (i >= 0 && (r = e.slice(i + 1), e = e.slice(0, i)), e && !n.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    return { type: e, name: r };
  });
}
fe.prototype = xi.prototype = {
  constructor: fe,
  on: function(t, n) {
    var e = this._, r = Yp(t + "", e), i, a = -1, o = r.length;
    if (arguments.length < 2) {
      for (; ++a < o; ) if ((i = (t = r[a]).type) && (i = Gp(e[i], t.name))) return i;
      return;
    }
    if (n != null && typeof n != "function") throw new Error("invalid callback: " + n);
    for (; ++a < o; )
      if (i = (t = r[a]).type) e[i] = ka(e[i], t.name, n);
      else if (n == null) for (i in e) e[i] = ka(e[i], t.name, null);
    return this;
  },
  copy: function() {
    var t = {}, n = this._;
    for (var e in n) t[e] = n[e].slice();
    return new fe(t);
  },
  call: function(t, n) {
    if ((i = arguments.length - 2) > 0) for (var e = new Array(i), r = 0, i, a; r < i; ++r) e[r] = arguments[r + 2];
    if (!this._.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    for (a = this._[t], r = 0, i = a.length; r < i; ++r) a[r].value.apply(n, e);
  },
  apply: function(t, n, e) {
    if (!this._.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    for (var r = this._[t], i = 0, a = r.length; i < a; ++i) r[i].value.apply(n, e);
  }
};
function Gp(t, n) {
  for (var e = 0, r = t.length, i; e < r; ++e)
    if ((i = t[e]).name === n)
      return i.value;
}
function ka(t, n, e) {
  for (var r = 0, i = t.length; r < i; ++r)
    if (t[r].name === n) {
      t[r] = Up, t = t.slice(0, r).concat(t.slice(r + 1));
      break;
    }
  return e != null && t.push({ name: n, value: e }), t;
}
var Dr = "http://www.w3.org/1999/xhtml";
const Ta = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Dr,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function Ue(t) {
  var n = t += "", e = n.indexOf(":");
  return e >= 0 && (n = t.slice(0, e)) !== "xmlns" && (t = t.slice(e + 1)), Ta.hasOwnProperty(n) ? { space: Ta[n], local: t } : t;
}
function Vp(t) {
  return function() {
    var n = this.ownerDocument, e = this.namespaceURI;
    return e === Dr && n.documentElement.namespaceURI === Dr ? n.createElement(t) : n.createElementNS(e, t);
  };
}
function Kp(t) {
  return function() {
    return this.ownerDocument.createElementNS(t.space, t.local);
  };
}
function Ts(t) {
  var n = Ue(t);
  return (n.local ? Kp : Vp)(n);
}
function Zp() {
}
function Mi(t) {
  return t == null ? Zp : function() {
    return this.querySelector(t);
  };
}
function Wp(t) {
  typeof t != "function" && (t = Mi(t));
  for (var n = this._groups, e = n.length, r = new Array(e), i = 0; i < e; ++i)
    for (var a = n[i], o = a.length, s = r[i] = new Array(o), l, u, c = 0; c < o; ++c)
      (l = a[c]) && (u = t.call(l, l.__data__, c, a)) && ("__data__" in l && (u.__data__ = l.__data__), s[c] = u);
  return new U(r, this._parents);
}
function Jp(t) {
  return t == null ? [] : Array.isArray(t) ? t : Array.from(t);
}
function Qp() {
  return [];
}
function Ss(t) {
  return t == null ? Qp : function() {
    return this.querySelectorAll(t);
  };
}
function td(t) {
  return function() {
    return Jp(t.apply(this, arguments));
  };
}
function nd(t) {
  typeof t == "function" ? t = td(t) : t = Ss(t);
  for (var n = this._groups, e = n.length, r = [], i = [], a = 0; a < e; ++a)
    for (var o = n[a], s = o.length, l, u = 0; u < s; ++u)
      (l = o[u]) && (r.push(t.call(l, l.__data__, u, o)), i.push(l));
  return new U(r, i);
}
function zs(t) {
  return function() {
    return this.matches(t);
  };
}
function Ps(t) {
  return function(n) {
    return n.matches(t);
  };
}
var ed = Array.prototype.find;
function rd(t) {
  return function() {
    return ed.call(this.children, t);
  };
}
function id() {
  return this.firstElementChild;
}
function ad(t) {
  return this.select(t == null ? id : rd(typeof t == "function" ? t : Ps(t)));
}
var od = Array.prototype.filter;
function sd() {
  return Array.from(this.children);
}
function ud(t) {
  return function() {
    return od.call(this.children, t);
  };
}
function ld(t) {
  return this.selectAll(t == null ? sd : ud(typeof t == "function" ? t : Ps(t)));
}
function cd(t) {
  typeof t != "function" && (t = zs(t));
  for (var n = this._groups, e = n.length, r = new Array(e), i = 0; i < e; ++i)
    for (var a = n[i], o = a.length, s = r[i] = [], l, u = 0; u < o; ++u)
      (l = a[u]) && t.call(l, l.__data__, u, a) && s.push(l);
  return new U(r, this._parents);
}
function Es(t) {
  return new Array(t.length);
}
function fd() {
  return new U(this._enter || this._groups.map(Es), this._parents);
}
function Se(t, n) {
  this.ownerDocument = t.ownerDocument, this.namespaceURI = t.namespaceURI, this._next = null, this._parent = t, this.__data__ = n;
}
Se.prototype = {
  constructor: Se,
  appendChild: function(t) {
    return this._parent.insertBefore(t, this._next);
  },
  insertBefore: function(t, n) {
    return this._parent.insertBefore(t, n);
  },
  querySelector: function(t) {
    return this._parent.querySelector(t);
  },
  querySelectorAll: function(t) {
    return this._parent.querySelectorAll(t);
  }
};
function hd(t) {
  return function() {
    return t;
  };
}
function pd(t, n, e, r, i, a) {
  for (var o = 0, s, l = n.length, u = a.length; o < u; ++o)
    (s = n[o]) ? (s.__data__ = a[o], r[o] = s) : e[o] = new Se(t, a[o]);
  for (; o < l; ++o)
    (s = n[o]) && (i[o] = s);
}
function dd(t, n, e, r, i, a, o) {
  var s, l, u = /* @__PURE__ */ new Map(), c = n.length, h = a.length, f = new Array(c), p;
  for (s = 0; s < c; ++s)
    (l = n[s]) && (f[s] = p = o.call(l, l.__data__, s, n) + "", u.has(p) ? i[s] = l : u.set(p, l));
  for (s = 0; s < h; ++s)
    p = o.call(t, a[s], s, a) + "", (l = u.get(p)) ? (r[s] = l, l.__data__ = a[s], u.delete(p)) : e[s] = new Se(t, a[s]);
  for (s = 0; s < c; ++s)
    (l = n[s]) && u.get(f[s]) === l && (i[s] = l);
}
function gd(t) {
  return t.__data__;
}
function _d(t, n) {
  if (!arguments.length) return Array.from(this, gd);
  var e = n ? dd : pd, r = this._parents, i = this._groups;
  typeof t != "function" && (t = hd(t));
  for (var a = i.length, o = new Array(a), s = new Array(a), l = new Array(a), u = 0; u < a; ++u) {
    var c = r[u], h = i[u], f = h.length, p = yd(t.call(c, c && c.__data__, u, r)), d = p.length, _ = s[u] = new Array(d), w = o[u] = new Array(d), y = l[u] = new Array(f);
    e(c, h, _, w, y, p, n);
    for (var M = 0, A = 0, g, v; M < d; ++M)
      if (g = _[M]) {
        for (M >= A && (A = M + 1); !(v = w[A]) && ++A < d; ) ;
        g._next = v || null;
      }
  }
  return o = new U(o, r), o._enter = s, o._exit = l, o;
}
function yd(t) {
  return typeof t == "object" && "length" in t ? t : Array.from(t);
}
function md() {
  return new U(this._exit || this._groups.map(Es), this._parents);
}
function vd(t, n, e) {
  var r = this.enter(), i = this, a = this.exit();
  return typeof t == "function" ? (r = t(r), r && (r = r.selection())) : r = r.append(t + ""), n != null && (i = n(i), i && (i = i.selection())), e == null ? a.remove() : e(a), r && i ? r.merge(i).order() : i;
}
function wd(t) {
  for (var n = t.selection ? t.selection() : t, e = this._groups, r = n._groups, i = e.length, a = r.length, o = Math.min(i, a), s = new Array(i), l = 0; l < o; ++l)
    for (var u = e[l], c = r[l], h = u.length, f = s[l] = new Array(h), p, d = 0; d < h; ++d)
      (p = u[d] || c[d]) && (f[d] = p);
  for (; l < i; ++l)
    s[l] = e[l];
  return new U(s, this._parents);
}
function bd() {
  for (var t = this._groups, n = -1, e = t.length; ++n < e; )
    for (var r = t[n], i = r.length - 1, a = r[i], o; --i >= 0; )
      (o = r[i]) && (a && o.compareDocumentPosition(a) ^ 4 && a.parentNode.insertBefore(o, a), a = o);
  return this;
}
function xd(t) {
  t || (t = Md);
  function n(h, f) {
    return h && f ? t(h.__data__, f.__data__) : !h - !f;
  }
  for (var e = this._groups, r = e.length, i = new Array(r), a = 0; a < r; ++a) {
    for (var o = e[a], s = o.length, l = i[a] = new Array(s), u, c = 0; c < s; ++c)
      (u = o[c]) && (l[c] = u);
    l.sort(n);
  }
  return new U(i, this._parents).order();
}
function Md(t, n) {
  return t < n ? -1 : t > n ? 1 : t >= n ? 0 : NaN;
}
function Ad() {
  var t = arguments[0];
  return arguments[0] = this, t.apply(null, arguments), this;
}
function $d() {
  return Array.from(this);
}
function Nd() {
  for (var t = this._groups, n = 0, e = t.length; n < e; ++n)
    for (var r = t[n], i = 0, a = r.length; i < a; ++i) {
      var o = r[i];
      if (o) return o;
    }
  return null;
}
function kd() {
  let t = 0;
  for (const n of this) ++t;
  return t;
}
function Td() {
  return !this.node();
}
function Sd(t) {
  for (var n = this._groups, e = 0, r = n.length; e < r; ++e)
    for (var i = n[e], a = 0, o = i.length, s; a < o; ++a)
      (s = i[a]) && t.call(s, s.__data__, a, i);
  return this;
}
function zd(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function Pd(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function Ed(t, n) {
  return function() {
    this.setAttribute(t, n);
  };
}
function Od(t, n) {
  return function() {
    this.setAttributeNS(t.space, t.local, n);
  };
}
function Cd(t, n) {
  return function() {
    var e = n.apply(this, arguments);
    e == null ? this.removeAttribute(t) : this.setAttribute(t, e);
  };
}
function Id(t, n) {
  return function() {
    var e = n.apply(this, arguments);
    e == null ? this.removeAttributeNS(t.space, t.local) : this.setAttributeNS(t.space, t.local, e);
  };
}
function Rd(t, n) {
  var e = Ue(t);
  if (arguments.length < 2) {
    var r = this.node();
    return e.local ? r.getAttributeNS(e.space, e.local) : r.getAttribute(e);
  }
  return this.each((n == null ? e.local ? Pd : zd : typeof n == "function" ? e.local ? Id : Cd : e.local ? Od : Ed)(e, n));
}
function Os(t) {
  return t.ownerDocument && t.ownerDocument.defaultView || t.document && t || t.defaultView;
}
function jd(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function qd(t, n, e) {
  return function() {
    this.style.setProperty(t, n, e);
  };
}
function Fd(t, n, e) {
  return function() {
    var r = n.apply(this, arguments);
    r == null ? this.style.removeProperty(t) : this.style.setProperty(t, r, e);
  };
}
function Ld(t, n, e) {
  return arguments.length > 1 ? this.each((n == null ? jd : typeof n == "function" ? Fd : qd)(t, n, e ?? "")) : an(this.node(), t);
}
function an(t, n) {
  return t.style.getPropertyValue(n) || Os(t).getComputedStyle(t, null).getPropertyValue(n);
}
function Dd(t) {
  return function() {
    delete this[t];
  };
}
function Hd(t, n) {
  return function() {
    this[t] = n;
  };
}
function Bd(t, n) {
  return function() {
    var e = n.apply(this, arguments);
    e == null ? delete this[t] : this[t] = e;
  };
}
function Xd(t, n) {
  return arguments.length > 1 ? this.each((n == null ? Dd : typeof n == "function" ? Bd : Hd)(t, n)) : this.node()[t];
}
function Cs(t) {
  return t.trim().split(/^|\s+/);
}
function Ai(t) {
  return t.classList || new Is(t);
}
function Is(t) {
  this._node = t, this._names = Cs(t.getAttribute("class") || "");
}
Is.prototype = {
  add: function(t) {
    var n = this._names.indexOf(t);
    n < 0 && (this._names.push(t), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(t) {
    var n = this._names.indexOf(t);
    n >= 0 && (this._names.splice(n, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(t) {
    return this._names.indexOf(t) >= 0;
  }
};
function Rs(t, n) {
  for (var e = Ai(t), r = -1, i = n.length; ++r < i; ) e.add(n[r]);
}
function js(t, n) {
  for (var e = Ai(t), r = -1, i = n.length; ++r < i; ) e.remove(n[r]);
}
function Ud(t) {
  return function() {
    Rs(this, t);
  };
}
function Yd(t) {
  return function() {
    js(this, t);
  };
}
function Gd(t, n) {
  return function() {
    (n.apply(this, arguments) ? Rs : js)(this, t);
  };
}
function Vd(t, n) {
  var e = Cs(t + "");
  if (arguments.length < 2) {
    for (var r = Ai(this.node()), i = -1, a = e.length; ++i < a; ) if (!r.contains(e[i])) return !1;
    return !0;
  }
  return this.each((typeof n == "function" ? Gd : n ? Ud : Yd)(e, n));
}
function Kd() {
  this.textContent = "";
}
function Zd(t) {
  return function() {
    this.textContent = t;
  };
}
function Wd(t) {
  return function() {
    var n = t.apply(this, arguments);
    this.textContent = n ?? "";
  };
}
function Jd(t) {
  return arguments.length ? this.each(t == null ? Kd : (typeof t == "function" ? Wd : Zd)(t)) : this.node().textContent;
}
function Qd() {
  this.innerHTML = "";
}
function t0(t) {
  return function() {
    this.innerHTML = t;
  };
}
function n0(t) {
  return function() {
    var n = t.apply(this, arguments);
    this.innerHTML = n ?? "";
  };
}
function e0(t) {
  return arguments.length ? this.each(t == null ? Qd : (typeof t == "function" ? n0 : t0)(t)) : this.node().innerHTML;
}
function r0() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function i0() {
  return this.each(r0);
}
function a0() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function o0() {
  return this.each(a0);
}
function s0(t) {
  var n = typeof t == "function" ? t : Ts(t);
  return this.select(function() {
    return this.appendChild(n.apply(this, arguments));
  });
}
function u0() {
  return null;
}
function l0(t, n) {
  var e = typeof t == "function" ? t : Ts(t), r = n == null ? u0 : typeof n == "function" ? n : Mi(n);
  return this.select(function() {
    return this.insertBefore(e.apply(this, arguments), r.apply(this, arguments) || null);
  });
}
function c0() {
  var t = this.parentNode;
  t && t.removeChild(this);
}
function f0() {
  return this.each(c0);
}
function h0() {
  var t = this.cloneNode(!1), n = this.parentNode;
  return n ? n.insertBefore(t, this.nextSibling) : t;
}
function p0() {
  var t = this.cloneNode(!0), n = this.parentNode;
  return n ? n.insertBefore(t, this.nextSibling) : t;
}
function d0(t) {
  return this.select(t ? p0 : h0);
}
function g0(t) {
  return arguments.length ? this.property("__data__", t) : this.node().__data__;
}
function _0(t) {
  return function(n) {
    t.call(this, n, this.__data__);
  };
}
function y0(t) {
  return t.trim().split(/^|\s+/).map(function(n) {
    var e = "", r = n.indexOf(".");
    return r >= 0 && (e = n.slice(r + 1), n = n.slice(0, r)), { type: n, name: e };
  });
}
function m0(t) {
  return function() {
    var n = this.__on;
    if (n) {
      for (var e = 0, r = -1, i = n.length, a; e < i; ++e)
        a = n[e], (!t.type || a.type === t.type) && a.name === t.name ? this.removeEventListener(a.type, a.listener, a.options) : n[++r] = a;
      ++r ? n.length = r : delete this.__on;
    }
  };
}
function v0(t, n, e) {
  return function() {
    var r = this.__on, i, a = _0(n);
    if (r) {
      for (var o = 0, s = r.length; o < s; ++o)
        if ((i = r[o]).type === t.type && i.name === t.name) {
          this.removeEventListener(i.type, i.listener, i.options), this.addEventListener(i.type, i.listener = a, i.options = e), i.value = n;
          return;
        }
    }
    this.addEventListener(t.type, a, e), i = { type: t.type, name: t.name, value: n, listener: a, options: e }, r ? r.push(i) : this.__on = [i];
  };
}
function w0(t, n, e) {
  var r = y0(t + ""), i, a = r.length, o;
  if (arguments.length < 2) {
    var s = this.node().__on;
    if (s) {
      for (var l = 0, u = s.length, c; l < u; ++l)
        for (i = 0, c = s[l]; i < a; ++i)
          if ((o = r[i]).type === c.type && o.name === c.name)
            return c.value;
    }
    return;
  }
  for (s = n ? v0 : m0, i = 0; i < a; ++i) this.each(s(r[i], n, e));
  return this;
}
function qs(t, n, e) {
  var r = Os(t), i = r.CustomEvent;
  typeof i == "function" ? i = new i(n, e) : (i = r.document.createEvent("Event"), e ? (i.initEvent(n, e.bubbles, e.cancelable), i.detail = e.detail) : i.initEvent(n, !1, !1)), t.dispatchEvent(i);
}
function b0(t, n) {
  return function() {
    return qs(this, t, n);
  };
}
function x0(t, n) {
  return function() {
    return qs(this, t, n.apply(this, arguments));
  };
}
function M0(t, n) {
  return this.each((typeof n == "function" ? x0 : b0)(t, n));
}
function* A0() {
  for (var t = this._groups, n = 0, e = t.length; n < e; ++n)
    for (var r = t[n], i = 0, a = r.length, o; i < a; ++i)
      (o = r[i]) && (yield o);
}
var Fs = [null];
function U(t, n) {
  this._groups = t, this._parents = n;
}
function Bn() {
  return new U([[document.documentElement]], Fs);
}
function $0() {
  return this;
}
U.prototype = Bn.prototype = {
  constructor: U,
  select: Wp,
  selectAll: nd,
  selectChild: ad,
  selectChildren: ld,
  filter: cd,
  data: _d,
  enter: fd,
  exit: md,
  join: vd,
  merge: wd,
  selection: $0,
  order: bd,
  sort: xd,
  call: Ad,
  nodes: $d,
  node: Nd,
  size: kd,
  empty: Td,
  each: Sd,
  attr: Rd,
  style: Ld,
  property: Xd,
  classed: Vd,
  text: Jd,
  html: e0,
  raise: i0,
  lower: o0,
  append: s0,
  insert: l0,
  remove: f0,
  clone: d0,
  datum: g0,
  on: w0,
  dispatch: M0,
  [Symbol.iterator]: A0
};
function I(t) {
  return typeof t == "string" ? new U([[document.querySelector(t)]], [document.documentElement]) : new U([[t]], Fs);
}
function N0(t) {
  let n;
  for (; n = t.sourceEvent; ) t = n;
  return t;
}
function Hr(t, n) {
  if (t = N0(t), n === void 0 && (n = t.currentTarget), n) {
    var e = n.ownerSVGElement || n;
    if (e.createSVGPoint) {
      var r = e.createSVGPoint();
      return r.x = t.clientX, r.y = t.clientY, r = r.matrixTransform(n.getScreenCTM().inverse()), [r.x, r.y];
    }
    if (n.getBoundingClientRect) {
      var i = n.getBoundingClientRect();
      return [t.clientX - i.left - n.clientLeft, t.clientY - i.top - n.clientTop];
    }
  }
  return [t.pageX, t.pageY];
}
const k0 = { passive: !1 }, En = { capture: !0, passive: !1 };
function mr(t) {
  t.stopImmediatePropagation();
}
function Zt(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function T0(t) {
  var n = t.document.documentElement, e = I(t).on("dragstart.drag", Zt, En);
  "onselectstart" in n ? e.on("selectstart.drag", Zt, En) : (n.__noselect = n.style.MozUserSelect, n.style.MozUserSelect = "none");
}
function S0(t, n) {
  var e = t.document.documentElement, r = I(t).on("dragstart.drag", null);
  n && (r.on("click.drag", Zt, En), setTimeout(function() {
    r.on("click.drag", null);
  }, 0)), "onselectstart" in e ? r.on("selectstart.drag", null) : (e.style.MozUserSelect = e.__noselect, delete e.__noselect);
}
const Jn = (t) => () => t;
function Br(t, {
  sourceEvent: n,
  subject: e,
  target: r,
  identifier: i,
  active: a,
  x: o,
  y: s,
  dx: l,
  dy: u,
  dispatch: c
}) {
  Object.defineProperties(this, {
    type: { value: t, enumerable: !0, configurable: !0 },
    sourceEvent: { value: n, enumerable: !0, configurable: !0 },
    subject: { value: e, enumerable: !0, configurable: !0 },
    target: { value: r, enumerable: !0, configurable: !0 },
    identifier: { value: i, enumerable: !0, configurable: !0 },
    active: { value: a, enumerable: !0, configurable: !0 },
    x: { value: o, enumerable: !0, configurable: !0 },
    y: { value: s, enumerable: !0, configurable: !0 },
    dx: { value: l, enumerable: !0, configurable: !0 },
    dy: { value: u, enumerable: !0, configurable: !0 },
    _: { value: c }
  });
}
Br.prototype.on = function() {
  var t = this._.on.apply(this._, arguments);
  return t === this._ ? this : t;
};
function z0(t) {
  return !t.ctrlKey && !t.button;
}
function P0() {
  return this.parentNode;
}
function E0(t, n) {
  return n ?? { x: t.x, y: t.y };
}
function O0() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function C0() {
  var t = z0, n = P0, e = E0, r = O0, i = {}, a = xi("start", "drag", "end"), o = 0, s, l, u, c, h = 0;
  function f(g) {
    g.on("mousedown.drag", p).filter(r).on("touchstart.drag", w).on("touchmove.drag", y, k0).on("touchend.drag touchcancel.drag", M).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function p(g, v) {
    if (!(c || !t.call(this, g, v))) {
      var T = A(this, n.call(this, g, v), g, v, "mouse");
      T && (I(g.view).on("mousemove.drag", d, En).on("mouseup.drag", _, En), T0(g.view), mr(g), u = !1, s = g.clientX, l = g.clientY, T("start", g));
    }
  }
  function d(g) {
    if (Zt(g), !u) {
      var v = g.clientX - s, T = g.clientY - l;
      u = v * v + T * T > h;
    }
    i.mouse("drag", g);
  }
  function _(g) {
    I(g.view).on("mousemove.drag mouseup.drag", null), S0(g.view, u), Zt(g), i.mouse("end", g);
  }
  function w(g, v) {
    if (t.call(this, g, v)) {
      var T = g.changedTouches, k = n.call(this, g, v), O = T.length, F, R;
      for (F = 0; F < O; ++F)
        (R = A(this, k, g, v, T[F].identifier, T[F])) && (mr(g), R("start", g, T[F]));
    }
  }
  function y(g) {
    var v = g.changedTouches, T = v.length, k, O;
    for (k = 0; k < T; ++k)
      (O = i[v[k].identifier]) && (Zt(g), O("drag", g, v[k]));
  }
  function M(g) {
    var v = g.changedTouches, T = v.length, k, O;
    for (c && clearTimeout(c), c = setTimeout(function() {
      c = null;
    }, 500), k = 0; k < T; ++k)
      (O = i[v[k].identifier]) && (mr(g), O("end", g, v[k]));
  }
  function A(g, v, T, k, O, F) {
    var R = a.copy(), m = Hr(F || T, v), S, $, j;
    if ((j = e.call(g, new Br("beforestart", {
      sourceEvent: T,
      target: f,
      identifier: O,
      active: o,
      x: m[0],
      y: m[1],
      dx: 0,
      dy: 0,
      dispatch: R
    }), k)) != null)
      return S = j.x - m[0] || 0, $ = j.y - m[1] || 0, function Tt(B, Y, V) {
        var C = m, pr;
        switch (B) {
          case "start":
            i[O] = Tt, pr = o++;
            break;
          case "end":
            delete i[O], --o;
          // falls through
          case "drag":
            m = Hr(V || Y, v), pr = o;
            break;
        }
        R.call(
          B,
          g,
          new Br(B, {
            sourceEvent: Y,
            subject: j,
            target: f,
            identifier: O,
            active: pr,
            x: m[0] + S,
            y: m[1] + $,
            dx: m[0] - C[0],
            dy: m[1] - C[1],
            dispatch: R
          }),
          k
        );
      };
  }
  return f.filter = function(g) {
    return arguments.length ? (t = typeof g == "function" ? g : Jn(!!g), f) : t;
  }, f.container = function(g) {
    return arguments.length ? (n = typeof g == "function" ? g : Jn(g), f) : n;
  }, f.subject = function(g) {
    return arguments.length ? (e = typeof g == "function" ? g : Jn(g), f) : e;
  }, f.touchable = function(g) {
    return arguments.length ? (r = typeof g == "function" ? g : Jn(!!g), f) : r;
  }, f.on = function() {
    var g = a.on.apply(a, arguments);
    return g === a ? f : g;
  }, f.clickDistance = function(g) {
    return arguments.length ? (h = (g = +g) * g, f) : Math.sqrt(h);
  }, f;
}
function $i(t, n, e) {
  t.prototype = n.prototype = e, e.constructor = t;
}
function Ls(t, n) {
  var e = Object.create(t.prototype);
  for (var r in n) e[r] = n[r];
  return e;
}
function Xn() {
}
var On = 0.7, ze = 1 / On, Wt = "\\s*([+-]?\\d+)\\s*", Cn = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", it = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", I0 = /^#([0-9a-f]{3,8})$/, R0 = new RegExp(`^rgb\\(${Wt},${Wt},${Wt}\\)$`), j0 = new RegExp(`^rgb\\(${it},${it},${it}\\)$`), q0 = new RegExp(`^rgba\\(${Wt},${Wt},${Wt},${Cn}\\)$`), F0 = new RegExp(`^rgba\\(${it},${it},${it},${Cn}\\)$`), L0 = new RegExp(`^hsl\\(${Cn},${it},${it}\\)$`), D0 = new RegExp(`^hsla\\(${Cn},${it},${it},${Cn}\\)$`), Sa = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
$i(Xn, jt, {
  copy(t) {
    return Object.assign(new this.constructor(), this, t);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: za,
  // Deprecated! Use color.formatHex.
  formatHex: za,
  formatHex8: H0,
  formatHsl: B0,
  formatRgb: Pa,
  toString: Pa
});
function za() {
  return this.rgb().formatHex();
}
function H0() {
  return this.rgb().formatHex8();
}
function B0() {
  return Ds(this).formatHsl();
}
function Pa() {
  return this.rgb().formatRgb();
}
function jt(t) {
  var n, e;
  return t = (t + "").trim().toLowerCase(), (n = I0.exec(t)) ? (e = n[1].length, n = parseInt(n[1], 16), e === 6 ? Ea(n) : e === 3 ? new H(n >> 8 & 15 | n >> 4 & 240, n >> 4 & 15 | n & 240, (n & 15) << 4 | n & 15, 1) : e === 8 ? Qn(n >> 24 & 255, n >> 16 & 255, n >> 8 & 255, (n & 255) / 255) : e === 4 ? Qn(n >> 12 & 15 | n >> 8 & 240, n >> 8 & 15 | n >> 4 & 240, n >> 4 & 15 | n & 240, ((n & 15) << 4 | n & 15) / 255) : null) : (n = R0.exec(t)) ? new H(n[1], n[2], n[3], 1) : (n = j0.exec(t)) ? new H(n[1] * 255 / 100, n[2] * 255 / 100, n[3] * 255 / 100, 1) : (n = q0.exec(t)) ? Qn(n[1], n[2], n[3], n[4]) : (n = F0.exec(t)) ? Qn(n[1] * 255 / 100, n[2] * 255 / 100, n[3] * 255 / 100, n[4]) : (n = L0.exec(t)) ? Ia(n[1], n[2] / 100, n[3] / 100, 1) : (n = D0.exec(t)) ? Ia(n[1], n[2] / 100, n[3] / 100, n[4]) : Sa.hasOwnProperty(t) ? Ea(Sa[t]) : t === "transparent" ? new H(NaN, NaN, NaN, 0) : null;
}
function Ea(t) {
  return new H(t >> 16 & 255, t >> 8 & 255, t & 255, 1);
}
function Qn(t, n, e, r) {
  return r <= 0 && (t = n = e = NaN), new H(t, n, e, r);
}
function X0(t) {
  return t instanceof Xn || (t = jt(t)), t ? (t = t.rgb(), new H(t.r, t.g, t.b, t.opacity)) : new H();
}
function Xr(t, n, e, r) {
  return arguments.length === 1 ? X0(t) : new H(t, n, e, r ?? 1);
}
function H(t, n, e, r) {
  this.r = +t, this.g = +n, this.b = +e, this.opacity = +r;
}
$i(H, Xr, Ls(Xn, {
  brighter(t) {
    return t = t == null ? ze : Math.pow(ze, t), new H(this.r * t, this.g * t, this.b * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? On : Math.pow(On, t), new H(this.r * t, this.g * t, this.b * t, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new H(Ct(this.r), Ct(this.g), Ct(this.b), Pe(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: Oa,
  // Deprecated! Use color.formatHex.
  formatHex: Oa,
  formatHex8: U0,
  formatRgb: Ca,
  toString: Ca
}));
function Oa() {
  return `#${Et(this.r)}${Et(this.g)}${Et(this.b)}`;
}
function U0() {
  return `#${Et(this.r)}${Et(this.g)}${Et(this.b)}${Et((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Ca() {
  const t = Pe(this.opacity);
  return `${t === 1 ? "rgb(" : "rgba("}${Ct(this.r)}, ${Ct(this.g)}, ${Ct(this.b)}${t === 1 ? ")" : `, ${t})`}`;
}
function Pe(t) {
  return isNaN(t) ? 1 : Math.max(0, Math.min(1, t));
}
function Ct(t) {
  return Math.max(0, Math.min(255, Math.round(t) || 0));
}
function Et(t) {
  return t = Ct(t), (t < 16 ? "0" : "") + t.toString(16);
}
function Ia(t, n, e, r) {
  return r <= 0 ? t = n = e = NaN : e <= 0 || e >= 1 ? t = n = NaN : n <= 0 && (t = NaN), new J(t, n, e, r);
}
function Ds(t) {
  if (t instanceof J) return new J(t.h, t.s, t.l, t.opacity);
  if (t instanceof Xn || (t = jt(t)), !t) return new J();
  if (t instanceof J) return t;
  t = t.rgb();
  var n = t.r / 255, e = t.g / 255, r = t.b / 255, i = Math.min(n, e, r), a = Math.max(n, e, r), o = NaN, s = a - i, l = (a + i) / 2;
  return s ? (n === a ? o = (e - r) / s + (e < r) * 6 : e === a ? o = (r - n) / s + 2 : o = (n - e) / s + 4, s /= l < 0.5 ? a + i : 2 - a - i, o *= 60) : s = l > 0 && l < 1 ? 0 : o, new J(o, s, l, t.opacity);
}
function Y0(t, n, e, r) {
  return arguments.length === 1 ? Ds(t) : new J(t, n, e, r ?? 1);
}
function J(t, n, e, r) {
  this.h = +t, this.s = +n, this.l = +e, this.opacity = +r;
}
$i(J, Y0, Ls(Xn, {
  brighter(t) {
    return t = t == null ? ze : Math.pow(ze, t), new J(this.h, this.s, this.l * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? On : Math.pow(On, t), new J(this.h, this.s, this.l * t, this.opacity);
  },
  rgb() {
    var t = this.h % 360 + (this.h < 0) * 360, n = isNaN(t) || isNaN(this.s) ? 0 : this.s, e = this.l, r = e + (e < 0.5 ? e : 1 - e) * n, i = 2 * e - r;
    return new H(
      vr(t >= 240 ? t - 240 : t + 120, i, r),
      vr(t, i, r),
      vr(t < 120 ? t + 240 : t - 120, i, r),
      this.opacity
    );
  },
  clamp() {
    return new J(Ra(this.h), te(this.s), te(this.l), Pe(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const t = Pe(this.opacity);
    return `${t === 1 ? "hsl(" : "hsla("}${Ra(this.h)}, ${te(this.s) * 100}%, ${te(this.l) * 100}%${t === 1 ? ")" : `, ${t})`}`;
  }
}));
function Ra(t) {
  return t = (t || 0) % 360, t < 0 ? t + 360 : t;
}
function te(t) {
  return Math.max(0, Math.min(1, t || 0));
}
function vr(t, n, e) {
  return (t < 60 ? n + (e - n) * t / 60 : t < 180 ? e : t < 240 ? n + (e - n) * (240 - t) / 60 : n) * 255;
}
const Ni = (t) => () => t;
function G0(t, n) {
  return function(e) {
    return t + e * n;
  };
}
function V0(t, n, e) {
  return t = Math.pow(t, e), n = Math.pow(n, e) - t, e = 1 / e, function(r) {
    return Math.pow(t + r * n, e);
  };
}
function K0(t) {
  return (t = +t) == 1 ? Hs : function(n, e) {
    return e - n ? V0(n, e, t) : Ni(isNaN(n) ? e : n);
  };
}
function Hs(t, n) {
  var e = n - t;
  return e ? G0(t, e) : Ni(isNaN(t) ? n : t);
}
const Ee = function t(n) {
  var e = K0(n);
  function r(i, a) {
    var o = e((i = Xr(i)).r, (a = Xr(a)).r), s = e(i.g, a.g), l = e(i.b, a.b), u = Hs(i.opacity, a.opacity);
    return function(c) {
      return i.r = o(c), i.g = s(c), i.b = l(c), i.opacity = u(c), i + "";
    };
  }
  return r.gamma = t, r;
}(1);
function Z0(t, n) {
  n || (n = []);
  var e = t ? Math.min(n.length, t.length) : 0, r = n.slice(), i;
  return function(a) {
    for (i = 0; i < e; ++i) r[i] = t[i] * (1 - a) + n[i] * a;
    return r;
  };
}
function W0(t) {
  return ArrayBuffer.isView(t) && !(t instanceof DataView);
}
function J0(t, n) {
  var e = n ? n.length : 0, r = t ? Math.min(e, t.length) : 0, i = new Array(r), a = new Array(e), o;
  for (o = 0; o < r; ++o) i[o] = ki(t[o], n[o]);
  for (; o < e; ++o) a[o] = n[o];
  return function(s) {
    for (o = 0; o < r; ++o) a[o] = i[o](s);
    return a;
  };
}
function Q0(t, n) {
  var e = /* @__PURE__ */ new Date();
  return t = +t, n = +n, function(r) {
    return e.setTime(t * (1 - r) + n * r), e;
  };
}
function Z(t, n) {
  return t = +t, n = +n, function(e) {
    return t * (1 - e) + n * e;
  };
}
function tg(t, n) {
  var e = {}, r = {}, i;
  (t === null || typeof t != "object") && (t = {}), (n === null || typeof n != "object") && (n = {});
  for (i in n)
    i in t ? e[i] = ki(t[i], n[i]) : r[i] = n[i];
  return function(a) {
    for (i in e) r[i] = e[i](a);
    return r;
  };
}
var Ur = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, wr = new RegExp(Ur.source, "g");
function ng(t) {
  return function() {
    return t;
  };
}
function eg(t) {
  return function(n) {
    return t(n) + "";
  };
}
function Bs(t, n) {
  var e = Ur.lastIndex = wr.lastIndex = 0, r, i, a, o = -1, s = [], l = [];
  for (t = t + "", n = n + ""; (r = Ur.exec(t)) && (i = wr.exec(n)); )
    (a = i.index) > e && (a = n.slice(e, a), s[o] ? s[o] += a : s[++o] = a), (r = r[0]) === (i = i[0]) ? s[o] ? s[o] += i : s[++o] = i : (s[++o] = null, l.push({ i: o, x: Z(r, i) })), e = wr.lastIndex;
  return e < n.length && (a = n.slice(e), s[o] ? s[o] += a : s[++o] = a), s.length < 2 ? l[0] ? eg(l[0].x) : ng(n) : (n = l.length, function(u) {
    for (var c = 0, h; c < n; ++c) s[(h = l[c]).i] = h.x(u);
    return s.join("");
  });
}
function ki(t, n) {
  var e = typeof n, r;
  return n == null || e === "boolean" ? Ni(n) : (e === "number" ? Z : e === "string" ? (r = jt(n)) ? (n = r, Ee) : Bs : n instanceof jt ? Ee : n instanceof Date ? Q0 : W0(n) ? Z0 : Array.isArray(n) ? J0 : typeof n.valueOf != "function" && typeof n.toString != "function" || isNaN(n) ? tg : Z)(t, n);
}
function rg(t, n) {
  return t = +t, n = +n, function(e) {
    return Math.round(t * (1 - e) + n * e);
  };
}
var ja = 180 / Math.PI, Xs = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function Us(t, n, e, r, i, a) {
  var o, s, l;
  return (o = Math.sqrt(t * t + n * n)) && (t /= o, n /= o), (l = t * e + n * r) && (e -= t * l, r -= n * l), (s = Math.sqrt(e * e + r * r)) && (e /= s, r /= s, l /= s), t * r < n * e && (t = -t, n = -n, l = -l, o = -o), {
    translateX: i,
    translateY: a,
    rotate: Math.atan2(n, t) * ja,
    skewX: Math.atan(l) * ja,
    scaleX: o,
    scaleY: s
  };
}
var ne;
function ig(t) {
  const n = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(t + "");
  return n.isIdentity ? Xs : Us(n.a, n.b, n.c, n.d, n.e, n.f);
}
function ag(t) {
  return t == null || (ne || (ne = document.createElementNS("http://www.w3.org/2000/svg", "g")), ne.setAttribute("transform", t), !(t = ne.transform.baseVal.consolidate())) ? Xs : (t = t.matrix, Us(t.a, t.b, t.c, t.d, t.e, t.f));
}
function Ys(t, n, e, r) {
  function i(u) {
    return u.length ? u.pop() + " " : "";
  }
  function a(u, c, h, f, p, d) {
    if (u !== h || c !== f) {
      var _ = p.push("translate(", null, n, null, e);
      d.push({ i: _ - 4, x: Z(u, h) }, { i: _ - 2, x: Z(c, f) });
    } else (h || f) && p.push("translate(" + h + n + f + e);
  }
  function o(u, c, h, f) {
    u !== c ? (u - c > 180 ? c += 360 : c - u > 180 && (u += 360), f.push({ i: h.push(i(h) + "rotate(", null, r) - 2, x: Z(u, c) })) : c && h.push(i(h) + "rotate(" + c + r);
  }
  function s(u, c, h, f) {
    u !== c ? f.push({ i: h.push(i(h) + "skewX(", null, r) - 2, x: Z(u, c) }) : c && h.push(i(h) + "skewX(" + c + r);
  }
  function l(u, c, h, f, p, d) {
    if (u !== h || c !== f) {
      var _ = p.push(i(p) + "scale(", null, ",", null, ")");
      d.push({ i: _ - 4, x: Z(u, h) }, { i: _ - 2, x: Z(c, f) });
    } else (h !== 1 || f !== 1) && p.push(i(p) + "scale(" + h + "," + f + ")");
  }
  return function(u, c) {
    var h = [], f = [];
    return u = t(u), c = t(c), a(u.translateX, u.translateY, c.translateX, c.translateY, h, f), o(u.rotate, c.rotate, h, f), s(u.skewX, c.skewX, h, f), l(u.scaleX, u.scaleY, c.scaleX, c.scaleY, h, f), u = c = null, function(p) {
      for (var d = -1, _ = f.length, w; ++d < _; ) h[(w = f[d]).i] = w.x(p);
      return h.join("");
    };
  };
}
var og = Ys(ig, "px, ", "px)", "deg)"), sg = Ys(ag, ", ", ")", ")"), on = 0, Mn = 0, _n = 0, Gs = 1e3, Oe, An, Ce = 0, qt = 0, Ye = 0, In = typeof performance == "object" && performance.now ? performance : Date, Vs = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(t) {
  setTimeout(t, 17);
};
function Ti() {
  return qt || (Vs(ug), qt = In.now() + Ye);
}
function ug() {
  qt = 0;
}
function Ie() {
  this._call = this._time = this._next = null;
}
Ie.prototype = Ks.prototype = {
  constructor: Ie,
  restart: function(t, n, e) {
    if (typeof t != "function") throw new TypeError("callback is not a function");
    e = (e == null ? Ti() : +e) + (n == null ? 0 : +n), !this._next && An !== this && (An ? An._next = this : Oe = this, An = this), this._call = t, this._time = e, Yr();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Yr());
  }
};
function Ks(t, n, e) {
  var r = new Ie();
  return r.restart(t, n, e), r;
}
function lg() {
  Ti(), ++on;
  for (var t = Oe, n; t; )
    (n = qt - t._time) >= 0 && t._call.call(void 0, n), t = t._next;
  --on;
}
function qa() {
  qt = (Ce = In.now()) + Ye, on = Mn = 0;
  try {
    lg();
  } finally {
    on = 0, fg(), qt = 0;
  }
}
function cg() {
  var t = In.now(), n = t - Ce;
  n > Gs && (Ye -= n, Ce = t);
}
function fg() {
  for (var t, n = Oe, e, r = 1 / 0; n; )
    n._call ? (r > n._time && (r = n._time), t = n, n = n._next) : (e = n._next, n._next = null, n = t ? t._next = e : Oe = e);
  An = t, Yr(r);
}
function Yr(t) {
  if (!on) {
    Mn && (Mn = clearTimeout(Mn));
    var n = t - qt;
    n > 24 ? (t < 1 / 0 && (Mn = setTimeout(qa, t - In.now() - Ye)), _n && (_n = clearInterval(_n))) : (_n || (Ce = In.now(), _n = setInterval(cg, Gs)), on = 1, Vs(qa));
  }
}
function Fa(t, n, e) {
  var r = new Ie();
  return n = n == null ? 0 : +n, r.restart((i) => {
    r.stop(), t(i + n);
  }, n, e), r;
}
var hg = xi("start", "end", "cancel", "interrupt"), pg = [], Zs = 0, La = 1, Gr = 2, he = 3, Da = 4, Vr = 5, pe = 6;
function Ge(t, n, e, r, i, a) {
  var o = t.__transition;
  if (!o) t.__transition = {};
  else if (e in o) return;
  dg(t, e, {
    name: n,
    index: r,
    // For context during callback.
    group: i,
    // For context during callback.
    on: hg,
    tween: pg,
    time: a.time,
    delay: a.delay,
    duration: a.duration,
    ease: a.ease,
    timer: null,
    state: Zs
  });
}
function Si(t, n) {
  var e = nt(t, n);
  if (e.state > Zs) throw new Error("too late; already scheduled");
  return e;
}
function st(t, n) {
  var e = nt(t, n);
  if (e.state > he) throw new Error("too late; already running");
  return e;
}
function nt(t, n) {
  var e = t.__transition;
  if (!e || !(e = e[n])) throw new Error("transition not found");
  return e;
}
function dg(t, n, e) {
  var r = t.__transition, i;
  r[n] = e, e.timer = Ks(a, 0, e.time);
  function a(u) {
    e.state = La, e.timer.restart(o, e.delay, e.time), e.delay <= u && o(u - e.delay);
  }
  function o(u) {
    var c, h, f, p;
    if (e.state !== La) return l();
    for (c in r)
      if (p = r[c], p.name === e.name) {
        if (p.state === he) return Fa(o);
        p.state === Da ? (p.state = pe, p.timer.stop(), p.on.call("interrupt", t, t.__data__, p.index, p.group), delete r[c]) : +c < n && (p.state = pe, p.timer.stop(), p.on.call("cancel", t, t.__data__, p.index, p.group), delete r[c]);
      }
    if (Fa(function() {
      e.state === he && (e.state = Da, e.timer.restart(s, e.delay, e.time), s(u));
    }), e.state = Gr, e.on.call("start", t, t.__data__, e.index, e.group), e.state === Gr) {
      for (e.state = he, i = new Array(f = e.tween.length), c = 0, h = -1; c < f; ++c)
        (p = e.tween[c].value.call(t, t.__data__, e.index, e.group)) && (i[++h] = p);
      i.length = h + 1;
    }
  }
  function s(u) {
    for (var c = u < e.duration ? e.ease.call(null, u / e.duration) : (e.timer.restart(l), e.state = Vr, 1), h = -1, f = i.length; ++h < f; )
      i[h].call(t, c);
    e.state === Vr && (e.on.call("end", t, t.__data__, e.index, e.group), l());
  }
  function l() {
    e.state = pe, e.timer.stop(), delete r[n];
    for (var u in r) return;
    delete t.__transition;
  }
}
function gg(t, n) {
  var e = t.__transition, r, i, a = !0, o;
  if (e) {
    n = n == null ? null : n + "";
    for (o in e) {
      if ((r = e[o]).name !== n) {
        a = !1;
        continue;
      }
      i = r.state > Gr && r.state < Vr, r.state = pe, r.timer.stop(), r.on.call(i ? "interrupt" : "cancel", t, t.__data__, r.index, r.group), delete e[o];
    }
    a && delete t.__transition;
  }
}
function _g(t) {
  return this.each(function() {
    gg(this, t);
  });
}
function yg(t, n) {
  var e, r;
  return function() {
    var i = st(this, t), a = i.tween;
    if (a !== e) {
      r = e = a;
      for (var o = 0, s = r.length; o < s; ++o)
        if (r[o].name === n) {
          r = r.slice(), r.splice(o, 1);
          break;
        }
    }
    i.tween = r;
  };
}
function mg(t, n, e) {
  var r, i;
  if (typeof e != "function") throw new Error();
  return function() {
    var a = st(this, t), o = a.tween;
    if (o !== r) {
      i = (r = o).slice();
      for (var s = { name: n, value: e }, l = 0, u = i.length; l < u; ++l)
        if (i[l].name === n) {
          i[l] = s;
          break;
        }
      l === u && i.push(s);
    }
    a.tween = i;
  };
}
function vg(t, n) {
  var e = this._id;
  if (t += "", arguments.length < 2) {
    for (var r = nt(this.node(), e).tween, i = 0, a = r.length, o; i < a; ++i)
      if ((o = r[i]).name === t)
        return o.value;
    return null;
  }
  return this.each((n == null ? yg : mg)(e, t, n));
}
function zi(t, n, e) {
  var r = t._id;
  return t.each(function() {
    var i = st(this, r);
    (i.value || (i.value = {}))[n] = e.apply(this, arguments);
  }), function(i) {
    return nt(i, r).value[n];
  };
}
function Ws(t, n) {
  var e;
  return (typeof n == "number" ? Z : n instanceof jt ? Ee : (e = jt(n)) ? (n = e, Ee) : Bs)(t, n);
}
function wg(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function bg(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function xg(t, n, e) {
  var r, i = e + "", a;
  return function() {
    var o = this.getAttribute(t);
    return o === i ? null : o === r ? a : a = n(r = o, e);
  };
}
function Mg(t, n, e) {
  var r, i = e + "", a;
  return function() {
    var o = this.getAttributeNS(t.space, t.local);
    return o === i ? null : o === r ? a : a = n(r = o, e);
  };
}
function Ag(t, n, e) {
  var r, i, a;
  return function() {
    var o, s = e(this), l;
    return s == null ? void this.removeAttribute(t) : (o = this.getAttribute(t), l = s + "", o === l ? null : o === r && l === i ? a : (i = l, a = n(r = o, s)));
  };
}
function $g(t, n, e) {
  var r, i, a;
  return function() {
    var o, s = e(this), l;
    return s == null ? void this.removeAttributeNS(t.space, t.local) : (o = this.getAttributeNS(t.space, t.local), l = s + "", o === l ? null : o === r && l === i ? a : (i = l, a = n(r = o, s)));
  };
}
function Ng(t, n) {
  var e = Ue(t), r = e === "transform" ? sg : Ws;
  return this.attrTween(t, typeof n == "function" ? (e.local ? $g : Ag)(e, r, zi(this, "attr." + t, n)) : n == null ? (e.local ? bg : wg)(e) : (e.local ? Mg : xg)(e, r, n));
}
function kg(t, n) {
  return function(e) {
    this.setAttribute(t, n.call(this, e));
  };
}
function Tg(t, n) {
  return function(e) {
    this.setAttributeNS(t.space, t.local, n.call(this, e));
  };
}
function Sg(t, n) {
  var e, r;
  function i() {
    var a = n.apply(this, arguments);
    return a !== r && (e = (r = a) && Tg(t, a)), e;
  }
  return i._value = n, i;
}
function zg(t, n) {
  var e, r;
  function i() {
    var a = n.apply(this, arguments);
    return a !== r && (e = (r = a) && kg(t, a)), e;
  }
  return i._value = n, i;
}
function Pg(t, n) {
  var e = "attr." + t;
  if (arguments.length < 2) return (e = this.tween(e)) && e._value;
  if (n == null) return this.tween(e, null);
  if (typeof n != "function") throw new Error();
  var r = Ue(t);
  return this.tween(e, (r.local ? Sg : zg)(r, n));
}
function Eg(t, n) {
  return function() {
    Si(this, t).delay = +n.apply(this, arguments);
  };
}
function Og(t, n) {
  return n = +n, function() {
    Si(this, t).delay = n;
  };
}
function Cg(t) {
  var n = this._id;
  return arguments.length ? this.each((typeof t == "function" ? Eg : Og)(n, t)) : nt(this.node(), n).delay;
}
function Ig(t, n) {
  return function() {
    st(this, t).duration = +n.apply(this, arguments);
  };
}
function Rg(t, n) {
  return n = +n, function() {
    st(this, t).duration = n;
  };
}
function jg(t) {
  var n = this._id;
  return arguments.length ? this.each((typeof t == "function" ? Ig : Rg)(n, t)) : nt(this.node(), n).duration;
}
function qg(t, n) {
  if (typeof n != "function") throw new Error();
  return function() {
    st(this, t).ease = n;
  };
}
function Fg(t) {
  var n = this._id;
  return arguments.length ? this.each(qg(n, t)) : nt(this.node(), n).ease;
}
function Lg(t, n) {
  return function() {
    var e = n.apply(this, arguments);
    if (typeof e != "function") throw new Error();
    st(this, t).ease = e;
  };
}
function Dg(t) {
  if (typeof t != "function") throw new Error();
  return this.each(Lg(this._id, t));
}
function Hg(t) {
  typeof t != "function" && (t = zs(t));
  for (var n = this._groups, e = n.length, r = new Array(e), i = 0; i < e; ++i)
    for (var a = n[i], o = a.length, s = r[i] = [], l, u = 0; u < o; ++u)
      (l = a[u]) && t.call(l, l.__data__, u, a) && s.push(l);
  return new dt(r, this._parents, this._name, this._id);
}
function Bg(t) {
  if (t._id !== this._id) throw new Error();
  for (var n = this._groups, e = t._groups, r = n.length, i = e.length, a = Math.min(r, i), o = new Array(r), s = 0; s < a; ++s)
    for (var l = n[s], u = e[s], c = l.length, h = o[s] = new Array(c), f, p = 0; p < c; ++p)
      (f = l[p] || u[p]) && (h[p] = f);
  for (; s < r; ++s)
    o[s] = n[s];
  return new dt(o, this._parents, this._name, this._id);
}
function Xg(t) {
  return (t + "").trim().split(/^|\s+/).every(function(n) {
    var e = n.indexOf(".");
    return e >= 0 && (n = n.slice(0, e)), !n || n === "start";
  });
}
function Ug(t, n, e) {
  var r, i, a = Xg(n) ? Si : st;
  return function() {
    var o = a(this, t), s = o.on;
    s !== r && (i = (r = s).copy()).on(n, e), o.on = i;
  };
}
function Yg(t, n) {
  var e = this._id;
  return arguments.length < 2 ? nt(this.node(), e).on.on(t) : this.each(Ug(e, t, n));
}
function Gg(t) {
  return function() {
    var n = this.parentNode;
    for (var e in this.__transition) if (+e !== t) return;
    n && n.removeChild(this);
  };
}
function Vg() {
  return this.on("end.remove", Gg(this._id));
}
function Kg(t) {
  var n = this._name, e = this._id;
  typeof t != "function" && (t = Mi(t));
  for (var r = this._groups, i = r.length, a = new Array(i), o = 0; o < i; ++o)
    for (var s = r[o], l = s.length, u = a[o] = new Array(l), c, h, f = 0; f < l; ++f)
      (c = s[f]) && (h = t.call(c, c.__data__, f, s)) && ("__data__" in c && (h.__data__ = c.__data__), u[f] = h, Ge(u[f], n, e, f, u, nt(c, e)));
  return new dt(a, this._parents, n, e);
}
function Zg(t) {
  var n = this._name, e = this._id;
  typeof t != "function" && (t = Ss(t));
  for (var r = this._groups, i = r.length, a = [], o = [], s = 0; s < i; ++s)
    for (var l = r[s], u = l.length, c, h = 0; h < u; ++h)
      if (c = l[h]) {
        for (var f = t.call(c, c.__data__, h, l), p, d = nt(c, e), _ = 0, w = f.length; _ < w; ++_)
          (p = f[_]) && Ge(p, n, e, _, f, d);
        a.push(f), o.push(c);
      }
  return new dt(a, o, n, e);
}
var Wg = Bn.prototype.constructor;
function Jg() {
  return new Wg(this._groups, this._parents);
}
function Qg(t, n) {
  var e, r, i;
  return function() {
    var a = an(this, t), o = (this.style.removeProperty(t), an(this, t));
    return a === o ? null : a === e && o === r ? i : i = n(e = a, r = o);
  };
}
function Js(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function t_(t, n, e) {
  var r, i = e + "", a;
  return function() {
    var o = an(this, t);
    return o === i ? null : o === r ? a : a = n(r = o, e);
  };
}
function n_(t, n, e) {
  var r, i, a;
  return function() {
    var o = an(this, t), s = e(this), l = s + "";
    return s == null && (l = s = (this.style.removeProperty(t), an(this, t))), o === l ? null : o === r && l === i ? a : (i = l, a = n(r = o, s));
  };
}
function e_(t, n) {
  var e, r, i, a = "style." + n, o = "end." + a, s;
  return function() {
    var l = st(this, t), u = l.on, c = l.value[a] == null ? s || (s = Js(n)) : void 0;
    (u !== e || i !== c) && (r = (e = u).copy()).on(o, i = c), l.on = r;
  };
}
function r_(t, n, e) {
  var r = (t += "") == "transform" ? og : Ws;
  return n == null ? this.styleTween(t, Qg(t, r)).on("end.style." + t, Js(t)) : typeof n == "function" ? this.styleTween(t, n_(t, r, zi(this, "style." + t, n))).each(e_(this._id, t)) : this.styleTween(t, t_(t, r, n), e).on("end.style." + t, null);
}
function i_(t, n, e) {
  return function(r) {
    this.style.setProperty(t, n.call(this, r), e);
  };
}
function a_(t, n, e) {
  var r, i;
  function a() {
    var o = n.apply(this, arguments);
    return o !== i && (r = (i = o) && i_(t, o, e)), r;
  }
  return a._value = n, a;
}
function o_(t, n, e) {
  var r = "style." + (t += "");
  if (arguments.length < 2) return (r = this.tween(r)) && r._value;
  if (n == null) return this.tween(r, null);
  if (typeof n != "function") throw new Error();
  return this.tween(r, a_(t, n, e ?? ""));
}
function s_(t) {
  return function() {
    this.textContent = t;
  };
}
function u_(t) {
  return function() {
    var n = t(this);
    this.textContent = n ?? "";
  };
}
function l_(t) {
  return this.tween("text", typeof t == "function" ? u_(zi(this, "text", t)) : s_(t == null ? "" : t + ""));
}
function c_(t) {
  return function(n) {
    this.textContent = t.call(this, n);
  };
}
function f_(t) {
  var n, e;
  function r() {
    var i = t.apply(this, arguments);
    return i !== e && (n = (e = i) && c_(i)), n;
  }
  return r._value = t, r;
}
function h_(t) {
  var n = "text";
  if (arguments.length < 1) return (n = this.tween(n)) && n._value;
  if (t == null) return this.tween(n, null);
  if (typeof t != "function") throw new Error();
  return this.tween(n, f_(t));
}
function p_() {
  for (var t = this._name, n = this._id, e = Qs(), r = this._groups, i = r.length, a = 0; a < i; ++a)
    for (var o = r[a], s = o.length, l, u = 0; u < s; ++u)
      if (l = o[u]) {
        var c = nt(l, n);
        Ge(l, t, e, u, o, {
          time: c.time + c.delay + c.duration,
          delay: 0,
          duration: c.duration,
          ease: c.ease
        });
      }
  return new dt(r, this._parents, t, e);
}
function d_() {
  var t, n, e = this, r = e._id, i = e.size();
  return new Promise(function(a, o) {
    var s = { value: o }, l = { value: function() {
      --i === 0 && a();
    } };
    e.each(function() {
      var u = st(this, r), c = u.on;
      c !== t && (n = (t = c).copy(), n._.cancel.push(s), n._.interrupt.push(s), n._.end.push(l)), u.on = n;
    }), i === 0 && a();
  });
}
var g_ = 0;
function dt(t, n, e, r) {
  this._groups = t, this._parents = n, this._name = e, this._id = r;
}
function Qs() {
  return ++g_;
}
var lt = Bn.prototype;
dt.prototype = {
  constructor: dt,
  select: Kg,
  selectAll: Zg,
  selectChild: lt.selectChild,
  selectChildren: lt.selectChildren,
  filter: Hg,
  merge: Bg,
  selection: Jg,
  transition: p_,
  call: lt.call,
  nodes: lt.nodes,
  node: lt.node,
  size: lt.size,
  empty: lt.empty,
  each: lt.each,
  on: Yg,
  attr: Ng,
  attrTween: Pg,
  style: r_,
  styleTween: o_,
  text: l_,
  textTween: h_,
  remove: Vg,
  tween: vg,
  delay: Cg,
  duration: jg,
  ease: Fg,
  easeVarying: Dg,
  end: d_,
  [Symbol.iterator]: lt[Symbol.iterator]
};
function __(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var y_ = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: __
};
function m_(t, n) {
  for (var e; !(e = t.__transition) || !(e = e[n]); )
    if (!(t = t.parentNode))
      throw new Error(`transition ${n} not found`);
  return e;
}
function v_(t) {
  var n, e;
  t instanceof dt ? (n = t._id, t = t._name) : (n = Qs(), (e = y_).time = Ti(), t = t == null ? null : t + "");
  for (var r = this._groups, i = r.length, a = 0; a < i; ++a)
    for (var o = r[a], s = o.length, l, u = 0; u < s; ++u)
      (l = o[u]) && Ge(l, t, n, u, o, e || m_(l, n));
  return new dt(r, this._parents, t, n);
}
Bn.prototype.interrupt = _g;
Bn.prototype.transition = v_;
const Kr = Math.PI, Zr = 2 * Kr, zt = 1e-6, w_ = Zr - zt;
function tu(t) {
  this._ += t[0];
  for (let n = 1, e = t.length; n < e; ++n)
    this._ += arguments[n] + t[n];
}
function b_(t) {
  let n = Math.floor(t);
  if (!(n >= 0)) throw new Error(`invalid digits: ${t}`);
  if (n > 15) return tu;
  const e = 10 ** n;
  return function(r) {
    this._ += r[0];
    for (let i = 1, a = r.length; i < a; ++i)
      this._ += Math.round(arguments[i] * e) / e + r[i];
  };
}
class nu {
  constructor(n) {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null, this._ = "", this._append = n == null ? tu : b_(n);
  }
  moveTo(n, e) {
    this._append`M${this._x0 = this._x1 = +n},${this._y0 = this._y1 = +e}`;
  }
  closePath() {
    this._x1 !== null && (this._x1 = this._x0, this._y1 = this._y0, this._append`Z`);
  }
  lineTo(n, e) {
    this._append`L${this._x1 = +n},${this._y1 = +e}`;
  }
  quadraticCurveTo(n, e, r, i) {
    this._append`Q${+n},${+e},${this._x1 = +r},${this._y1 = +i}`;
  }
  bezierCurveTo(n, e, r, i, a, o) {
    this._append`C${+n},${+e},${+r},${+i},${this._x1 = +a},${this._y1 = +o}`;
  }
  arcTo(n, e, r, i, a) {
    if (n = +n, e = +e, r = +r, i = +i, a = +a, a < 0) throw new Error(`negative radius: ${a}`);
    let o = this._x1, s = this._y1, l = r - n, u = i - e, c = o - n, h = s - e, f = c * c + h * h;
    if (this._x1 === null)
      this._append`M${this._x1 = n},${this._y1 = e}`;
    else if (f > zt) if (!(Math.abs(h * l - u * c) > zt) || !a)
      this._append`L${this._x1 = n},${this._y1 = e}`;
    else {
      let p = r - o, d = i - s, _ = l * l + u * u, w = p * p + d * d, y = Math.sqrt(_), M = Math.sqrt(f), A = a * Math.tan((Kr - Math.acos((_ + f - w) / (2 * y * M))) / 2), g = A / M, v = A / y;
      Math.abs(g - 1) > zt && this._append`L${n + g * c},${e + g * h}`, this._append`A${a},${a},0,0,${+(h * p > c * d)},${this._x1 = n + v * l},${this._y1 = e + v * u}`;
    }
  }
  arc(n, e, r, i, a, o) {
    if (n = +n, e = +e, r = +r, o = !!o, r < 0) throw new Error(`negative radius: ${r}`);
    let s = r * Math.cos(i), l = r * Math.sin(i), u = n + s, c = e + l, h = 1 ^ o, f = o ? i - a : a - i;
    this._x1 === null ? this._append`M${u},${c}` : (Math.abs(this._x1 - u) > zt || Math.abs(this._y1 - c) > zt) && this._append`L${u},${c}`, r && (f < 0 && (f = f % Zr + Zr), f > w_ ? this._append`A${r},${r},0,1,${h},${n - s},${e - l}A${r},${r},0,1,${h},${this._x1 = u},${this._y1 = c}` : f > zt && this._append`A${r},${r},0,${+(f >= Kr)},${h},${this._x1 = n + r * Math.cos(a)},${this._y1 = e + r * Math.sin(a)}`);
  }
  rect(n, e, r, i) {
    this._append`M${this._x0 = this._x1 = +n},${this._y0 = this._y1 = +e}h${r = +r}v${+i}h${-r}Z`;
  }
  toString() {
    return this._;
  }
}
function et() {
  return new nu();
}
et.prototype = nu.prototype;
function x_(t) {
  return Math.abs(t = Math.round(t)) >= 1e21 ? t.toLocaleString("en").replace(/,/g, "") : t.toString(10);
}
function Re(t, n) {
  if ((e = (t = n ? t.toExponential(n - 1) : t.toExponential()).indexOf("e")) < 0) return null;
  var e, r = t.slice(0, e);
  return [
    r.length > 1 ? r[0] + r.slice(2) : r,
    +t.slice(e + 1)
  ];
}
function sn(t) {
  return t = Re(Math.abs(t)), t ? t[1] : NaN;
}
function M_(t, n) {
  return function(e, r) {
    for (var i = e.length, a = [], o = 0, s = t[0], l = 0; i > 0 && s > 0 && (l + s + 1 > r && (s = Math.max(1, r - l)), a.push(e.substring(i -= s, i + s)), !((l += s + 1) > r)); )
      s = t[o = (o + 1) % t.length];
    return a.reverse().join(n);
  };
}
function A_(t) {
  return function(n) {
    return n.replace(/[0-9]/g, function(e) {
      return t[+e];
    });
  };
}
var $_ = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function je(t) {
  if (!(n = $_.exec(t))) throw new Error("invalid format: " + t);
  var n;
  return new Pi({
    fill: n[1],
    align: n[2],
    sign: n[3],
    symbol: n[4],
    zero: n[5],
    width: n[6],
    comma: n[7],
    precision: n[8] && n[8].slice(1),
    trim: n[9],
    type: n[10]
  });
}
je.prototype = Pi.prototype;
function Pi(t) {
  this.fill = t.fill === void 0 ? " " : t.fill + "", this.align = t.align === void 0 ? ">" : t.align + "", this.sign = t.sign === void 0 ? "-" : t.sign + "", this.symbol = t.symbol === void 0 ? "" : t.symbol + "", this.zero = !!t.zero, this.width = t.width === void 0 ? void 0 : +t.width, this.comma = !!t.comma, this.precision = t.precision === void 0 ? void 0 : +t.precision, this.trim = !!t.trim, this.type = t.type === void 0 ? "" : t.type + "";
}
Pi.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
function N_(t) {
  t: for (var n = t.length, e = 1, r = -1, i; e < n; ++e)
    switch (t[e]) {
      case ".":
        r = i = e;
        break;
      case "0":
        r === 0 && (r = e), i = e;
        break;
      default:
        if (!+t[e]) break t;
        r > 0 && (r = 0);
        break;
    }
  return r > 0 ? t.slice(0, r) + t.slice(i + 1) : t;
}
var eu;
function k_(t, n) {
  var e = Re(t, n);
  if (!e) return t + "";
  var r = e[0], i = e[1], a = i - (eu = Math.max(-8, Math.min(8, Math.floor(i / 3))) * 3) + 1, o = r.length;
  return a === o ? r : a > o ? r + new Array(a - o + 1).join("0") : a > 0 ? r.slice(0, a) + "." + r.slice(a) : "0." + new Array(1 - a).join("0") + Re(t, Math.max(0, n + a - 1))[0];
}
function Ha(t, n) {
  var e = Re(t, n);
  if (!e) return t + "";
  var r = e[0], i = e[1];
  return i < 0 ? "0." + new Array(-i).join("0") + r : r.length > i + 1 ? r.slice(0, i + 1) + "." + r.slice(i + 1) : r + new Array(i - r.length + 2).join("0");
}
const Ba = {
  "%": (t, n) => (t * 100).toFixed(n),
  b: (t) => Math.round(t).toString(2),
  c: (t) => t + "",
  d: x_,
  e: (t, n) => t.toExponential(n),
  f: (t, n) => t.toFixed(n),
  g: (t, n) => t.toPrecision(n),
  o: (t) => Math.round(t).toString(8),
  p: (t, n) => Ha(t * 100, n),
  r: Ha,
  s: k_,
  X: (t) => Math.round(t).toString(16).toUpperCase(),
  x: (t) => Math.round(t).toString(16)
};
function Xa(t) {
  return t;
}
var Ua = Array.prototype.map, Ya = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function T_(t) {
  var n = t.grouping === void 0 || t.thousands === void 0 ? Xa : M_(Ua.call(t.grouping, Number), t.thousands + ""), e = t.currency === void 0 ? "" : t.currency[0] + "", r = t.currency === void 0 ? "" : t.currency[1] + "", i = t.decimal === void 0 ? "." : t.decimal + "", a = t.numerals === void 0 ? Xa : A_(Ua.call(t.numerals, String)), o = t.percent === void 0 ? "%" : t.percent + "", s = t.minus === void 0 ? "−" : t.minus + "", l = t.nan === void 0 ? "NaN" : t.nan + "";
  function u(h) {
    h = je(h);
    var f = h.fill, p = h.align, d = h.sign, _ = h.symbol, w = h.zero, y = h.width, M = h.comma, A = h.precision, g = h.trim, v = h.type;
    v === "n" ? (M = !0, v = "g") : Ba[v] || (A === void 0 && (A = 12), g = !0, v = "g"), (w || f === "0" && p === "=") && (w = !0, f = "0", p = "=");
    var T = _ === "$" ? e : _ === "#" && /[boxX]/.test(v) ? "0" + v.toLowerCase() : "", k = _ === "$" ? r : /[%p]/.test(v) ? o : "", O = Ba[v], F = /[defgprs%]/.test(v);
    A = A === void 0 ? 6 : /[gprs]/.test(v) ? Math.max(1, Math.min(21, A)) : Math.max(0, Math.min(20, A));
    function R(m) {
      var S = T, $ = k, j, Tt, B;
      if (v === "c")
        $ = O(m) + $, m = "";
      else {
        m = +m;
        var Y = m < 0 || 1 / m < 0;
        if (m = isNaN(m) ? l : O(Math.abs(m), A), g && (m = N_(m)), Y && +m == 0 && d !== "+" && (Y = !1), S = (Y ? d === "(" ? d : s : d === "-" || d === "(" ? "" : d) + S, $ = (v === "s" ? Ya[8 + eu / 3] : "") + $ + (Y && d === "(" ? ")" : ""), F) {
          for (j = -1, Tt = m.length; ++j < Tt; )
            if (B = m.charCodeAt(j), 48 > B || B > 57) {
              $ = (B === 46 ? i + m.slice(j + 1) : m.slice(j)) + $, m = m.slice(0, j);
              break;
            }
        }
      }
      M && !w && (m = n(m, 1 / 0));
      var V = S.length + m.length + $.length, C = V < y ? new Array(y - V + 1).join(f) : "";
      switch (M && w && (m = n(C + m, C.length ? y - $.length : 1 / 0), C = ""), p) {
        case "<":
          m = S + m + $ + C;
          break;
        case "=":
          m = S + C + m + $;
          break;
        case "^":
          m = C.slice(0, V = C.length >> 1) + S + m + $ + C.slice(V);
          break;
        default:
          m = C + S + m + $;
          break;
      }
      return a(m);
    }
    return R.toString = function() {
      return h + "";
    }, R;
  }
  function c(h, f) {
    var p = u((h = je(h), h.type = "f", h)), d = Math.max(-8, Math.min(8, Math.floor(sn(f) / 3))) * 3, _ = Math.pow(10, -d), w = Ya[8 + d / 3];
    return function(y) {
      return p(_ * y) + w;
    };
  }
  return {
    format: u,
    formatPrefix: c
  };
}
var ee, Ve, ru;
S_({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});
function S_(t) {
  return ee = T_(t), Ve = ee.format, ru = ee.formatPrefix, ee;
}
function z_(t) {
  return Math.max(0, -sn(Math.abs(t)));
}
function P_(t, n) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(sn(n) / 3))) * 3 - sn(Math.abs(t)));
}
function E_(t, n) {
  return t = Math.abs(t), n = Math.abs(n) - t, Math.max(0, sn(n) - sn(t)) + 1;
}
function O_(t, n) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(t);
      break;
    default:
      this.range(n).domain(t);
      break;
  }
  return this;
}
function C_(t) {
  return function() {
    return t;
  };
}
function I_(t) {
  return +t;
}
var Ga = [0, 1];
function Vt(t) {
  return t;
}
function Wr(t, n) {
  return (n -= t = +t) ? function(e) {
    return (e - t) / n;
  } : C_(isNaN(n) ? NaN : 0.5);
}
function R_(t, n) {
  var e;
  return t > n && (e = t, t = n, n = e), function(r) {
    return Math.max(t, Math.min(n, r));
  };
}
function j_(t, n, e) {
  var r = t[0], i = t[1], a = n[0], o = n[1];
  return i < r ? (r = Wr(i, r), a = e(o, a)) : (r = Wr(r, i), a = e(a, o)), function(s) {
    return a(r(s));
  };
}
function q_(t, n, e) {
  var r = Math.min(t.length, n.length) - 1, i = new Array(r), a = new Array(r), o = -1;
  for (t[r] < t[0] && (t = t.slice().reverse(), n = n.slice().reverse()); ++o < r; )
    i[o] = Wr(t[o], t[o + 1]), a[o] = e(n[o], n[o + 1]);
  return function(s) {
    var l = qp(t, s, 1, r) - 1;
    return a[l](i[l](s));
  };
}
function F_(t, n) {
  return n.domain(t.domain()).range(t.range()).interpolate(t.interpolate()).clamp(t.clamp()).unknown(t.unknown());
}
function L_() {
  var t = Ga, n = Ga, e = ki, r, i, a, o = Vt, s, l, u;
  function c() {
    var f = Math.min(t.length, n.length);
    return o !== Vt && (o = R_(t[0], t[f - 1])), s = f > 2 ? q_ : j_, l = u = null, h;
  }
  function h(f) {
    return f == null || isNaN(f = +f) ? a : (l || (l = s(t.map(r), n, e)))(r(o(f)));
  }
  return h.invert = function(f) {
    return o(i((u || (u = s(n, t.map(r), Z)))(f)));
  }, h.domain = function(f) {
    return arguments.length ? (t = Array.from(f, I_), c()) : t.slice();
  }, h.range = function(f) {
    return arguments.length ? (n = Array.from(f), c()) : n.slice();
  }, h.rangeRound = function(f) {
    return n = Array.from(f), e = rg, c();
  }, h.clamp = function(f) {
    return arguments.length ? (o = f ? !0 : Vt, c()) : o !== Vt;
  }, h.interpolate = function(f) {
    return arguments.length ? (e = f, c()) : e;
  }, h.unknown = function(f) {
    return arguments.length ? (a = f, h) : a;
  }, function(f, p) {
    return r = f, i = p, c();
  };
}
function D_() {
  return L_()(Vt, Vt);
}
function H_(t, n, e, r) {
  var i = Bp(t, n, e), a;
  switch (r = je(r ?? ",f"), r.type) {
    case "s": {
      var o = Math.max(Math.abs(t), Math.abs(n));
      return r.precision == null && !isNaN(a = P_(i, o)) && (r.precision = a), ru(r, o);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      r.precision == null && !isNaN(a = E_(i, Math.max(Math.abs(t), Math.abs(n)))) && (r.precision = a - (r.type === "e"));
      break;
    }
    case "f":
    case "%": {
      r.precision == null && !isNaN(a = z_(i)) && (r.precision = a - (r.type === "%") * 2);
      break;
    }
  }
  return Ve(r);
}
function B_(t) {
  var n = t.domain;
  return t.ticks = function(e) {
    var r = n();
    return Hp(r[0], r[r.length - 1], e ?? 10);
  }, t.tickFormat = function(e, r) {
    var i = n();
    return H_(i[0], i[i.length - 1], e ?? 10, r);
  }, t.nice = function(e) {
    e == null && (e = 10);
    var r = n(), i = 0, a = r.length - 1, o = r[i], s = r[a], l, u, c = 10;
    for (s < o && (u = o, o = s, s = u, u = i, i = a, a = u); c-- > 0; ) {
      if (u = Lr(o, s, e), u === l)
        return r[i] = o, r[a] = s, n(r);
      if (u > 0)
        o = Math.floor(o / u) * u, s = Math.ceil(s / u) * u;
      else if (u < 0)
        o = Math.ceil(o * u) / u, s = Math.floor(s * u) / u;
      else
        break;
      l = u;
    }
    return t;
  }, t;
}
function un() {
  var t = D_();
  return t.copy = function() {
    return F_(t, un());
  }, O_.apply(t, arguments), B_(t);
}
function $n(t, n, e) {
  this.k = t, this.x = n, this.y = e;
}
$n.prototype = {
  constructor: $n,
  scale: function(t) {
    return t === 1 ? this : new $n(this.k * t, this.x, this.y);
  },
  translate: function(t, n) {
    return t === 0 & n === 0 ? this : new $n(this.k, this.x + this.k * t, this.y + this.k * n);
  },
  apply: function(t) {
    return [t[0] * this.k + this.x, t[1] * this.k + this.y];
  },
  applyX: function(t) {
    return t * this.k + this.x;
  },
  applyY: function(t) {
    return t * this.k + this.y;
  },
  invert: function(t) {
    return [(t[0] - this.x) / this.k, (t[1] - this.y) / this.k];
  },
  invertX: function(t) {
    return (t - this.x) / this.k;
  },
  invertY: function(t) {
    return (t - this.y) / this.k;
  },
  rescaleX: function(t) {
    return t.copy().domain(t.range().map(this.invertX, this).map(t.invert, t));
  },
  rescaleY: function(t) {
    return t.copy().domain(t.range().map(this.invertY, this).map(t.invert, t));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
$n.prototype;
var iu = typeof global == "object" && global && global.Object === Object && global, X_ = typeof self == "object" && self && self.Object === Object && self, yt = iu || X_ || Function("return this")(), at = yt.Symbol, au = Object.prototype, U_ = au.hasOwnProperty, Y_ = au.toString, yn = at ? at.toStringTag : void 0;
function G_(t) {
  var n = U_.call(t, yn), e = t[yn];
  try {
    t[yn] = void 0;
    var r = !0;
  } catch {
  }
  var i = Y_.call(t);
  return r && (n ? t[yn] = e : delete t[yn]), i;
}
var V_ = Object.prototype, K_ = V_.toString;
function Z_(t) {
  return K_.call(t);
}
var W_ = "[object Null]", J_ = "[object Undefined]", Va = at ? at.toStringTag : void 0;
function hn(t) {
  return t == null ? t === void 0 ? J_ : W_ : Va && Va in Object(t) ? G_(t) : Z_(t);
}
function ln(t) {
  return t != null && typeof t == "object";
}
var Q_ = "[object Symbol]";
function Ke(t) {
  return typeof t == "symbol" || ln(t) && hn(t) == Q_;
}
function ou(t, n) {
  for (var e = -1, r = t == null ? 0 : t.length, i = Array(r); ++e < r; )
    i[e] = n(t[e], e, t);
  return i;
}
var Q = Array.isArray, Ka = at ? at.prototype : void 0, Za = Ka ? Ka.toString : void 0;
function su(t) {
  if (typeof t == "string")
    return t;
  if (Q(t))
    return ou(t, su) + "";
  if (Ke(t))
    return Za ? Za.call(t) : "";
  var n = t + "";
  return n == "0" && 1 / t == -1 / 0 ? "-0" : n;
}
var ty = /\s/;
function ny(t) {
  for (var n = t.length; n-- && ty.test(t.charAt(n)); )
    ;
  return n;
}
var ey = /^\s+/;
function ry(t) {
  return t && t.slice(0, ny(t) + 1).replace(ey, "");
}
function cn(t) {
  var n = typeof t;
  return t != null && (n == "object" || n == "function");
}
var Wa = NaN, iy = /^[-+]0x[0-9a-f]+$/i, ay = /^0b[01]+$/i, oy = /^0o[0-7]+$/i, sy = parseInt;
function uy(t) {
  if (typeof t == "number")
    return t;
  if (Ke(t))
    return Wa;
  if (cn(t)) {
    var n = typeof t.valueOf == "function" ? t.valueOf() : t;
    t = cn(n) ? n + "" : n;
  }
  if (typeof t != "string")
    return t === 0 ? t : +t;
  t = ry(t);
  var e = ay.test(t);
  return e || oy.test(t) ? sy(t.slice(2), e ? 2 : 8) : iy.test(t) ? Wa : +t;
}
var ly = 1 / 0, cy = 17976931348623157e292;
function br(t) {
  if (!t)
    return t === 0 ? t : 0;
  if (t = uy(t), t === ly || t === -1 / 0) {
    var n = t < 0 ? -1 : 1;
    return n * cy;
  }
  return t === t ? t : 0;
}
function fy(t) {
  return t;
}
var hy = "[object AsyncFunction]", py = "[object Function]", dy = "[object GeneratorFunction]", gy = "[object Proxy]";
function uu(t) {
  if (!cn(t))
    return !1;
  var n = hn(t);
  return n == py || n == dy || n == hy || n == gy;
}
var xr = yt["__core-js_shared__"], Ja = function() {
  var t = /[^.]+$/.exec(xr && xr.keys && xr.keys.IE_PROTO || "");
  return t ? "Symbol(src)_1." + t : "";
}();
function _y(t) {
  return !!Ja && Ja in t;
}
var yy = Function.prototype, my = yy.toString;
function Ht(t) {
  if (t != null) {
    try {
      return my.call(t);
    } catch {
    }
    try {
      return t + "";
    } catch {
    }
  }
  return "";
}
var vy = /[\\^$.*+?()[\]{}|]/g, wy = /^\[object .+?Constructor\]$/, by = Function.prototype, xy = Object.prototype, My = by.toString, Ay = xy.hasOwnProperty, $y = RegExp(
  "^" + My.call(Ay).replace(vy, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function Ny(t) {
  if (!cn(t) || _y(t))
    return !1;
  var n = uu(t) ? $y : wy;
  return n.test(Ht(t));
}
function ky(t, n) {
  return t == null ? void 0 : t[n];
}
function pn(t, n) {
  var e = ky(t, n);
  return Ny(e) ? e : void 0;
}
var Jr = pn(yt, "WeakMap"), Ty = 9007199254740991, Sy = /^(?:0|[1-9]\d*)$/;
function Ei(t, n) {
  var e = typeof t;
  return n = n ?? Ty, !!n && (e == "number" || e != "symbol" && Sy.test(t)) && t > -1 && t % 1 == 0 && t < n;
}
function Oi(t, n) {
  return t === n || t !== t && n !== n;
}
var zy = 9007199254740991;
function Ci(t) {
  return typeof t == "number" && t > -1 && t % 1 == 0 && t <= zy;
}
function Ze(t) {
  return t != null && Ci(t.length) && !uu(t);
}
function Py(t, n, e) {
  if (!cn(e))
    return !1;
  var r = typeof n;
  return (r == "number" ? Ze(e) && Ei(n, e.length) : r == "string" && n in e) ? Oi(e[n], t) : !1;
}
var Ey = Object.prototype;
function Oy(t) {
  var n = t && t.constructor, e = typeof n == "function" && n.prototype || Ey;
  return t === e;
}
function Cy(t, n) {
  for (var e = -1, r = Array(t); ++e < t; )
    r[e] = n(e);
  return r;
}
var Iy = "[object Arguments]";
function Qa(t) {
  return ln(t) && hn(t) == Iy;
}
var lu = Object.prototype, Ry = lu.hasOwnProperty, jy = lu.propertyIsEnumerable, Ii = Qa(/* @__PURE__ */ function() {
  return arguments;
}()) ? Qa : function(t) {
  return ln(t) && Ry.call(t, "callee") && !jy.call(t, "callee");
};
function qy() {
  return !1;
}
var cu = typeof exports == "object" && exports && !exports.nodeType && exports, to = cu && typeof module == "object" && module && !module.nodeType && module, Fy = to && to.exports === cu, no = Fy ? yt.Buffer : void 0, Ly = no ? no.isBuffer : void 0, Qr = Ly || qy, Dy = "[object Arguments]", Hy = "[object Array]", By = "[object Boolean]", Xy = "[object Date]", Uy = "[object Error]", Yy = "[object Function]", Gy = "[object Map]", Vy = "[object Number]", Ky = "[object Object]", Zy = "[object RegExp]", Wy = "[object Set]", Jy = "[object String]", Qy = "[object WeakMap]", tm = "[object ArrayBuffer]", nm = "[object DataView]", em = "[object Float32Array]", rm = "[object Float64Array]", im = "[object Int8Array]", am = "[object Int16Array]", om = "[object Int32Array]", sm = "[object Uint8Array]", um = "[object Uint8ClampedArray]", lm = "[object Uint16Array]", cm = "[object Uint32Array]", z = {};
z[em] = z[rm] = z[im] = z[am] = z[om] = z[sm] = z[um] = z[lm] = z[cm] = !0;
z[Dy] = z[Hy] = z[tm] = z[By] = z[nm] = z[Xy] = z[Uy] = z[Yy] = z[Gy] = z[Vy] = z[Ky] = z[Zy] = z[Wy] = z[Jy] = z[Qy] = !1;
function fm(t) {
  return ln(t) && Ci(t.length) && !!z[hn(t)];
}
function hm(t) {
  return function(n) {
    return t(n);
  };
}
var fu = typeof exports == "object" && exports && !exports.nodeType && exports, Nn = fu && typeof module == "object" && module && !module.nodeType && module, pm = Nn && Nn.exports === fu, Mr = pm && iu.process, eo = function() {
  try {
    var t = Nn && Nn.require && Nn.require("util").types;
    return t || Mr && Mr.binding && Mr.binding("util");
  } catch {
  }
}(), ro = eo && eo.isTypedArray, hu = ro ? hm(ro) : fm, dm = Object.prototype, gm = dm.hasOwnProperty;
function _m(t, n) {
  var e = Q(t), r = !e && Ii(t), i = !e && !r && Qr(t), a = !e && !r && !i && hu(t), o = e || r || i || a, s = o ? Cy(t.length, String) : [], l = s.length;
  for (var u in t)
    gm.call(t, u) && !(o && // Safari 9 has enumerable `arguments.length` in strict mode.
    (u == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    i && (u == "offset" || u == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    a && (u == "buffer" || u == "byteLength" || u == "byteOffset") || // Skip index properties.
    Ei(u, l))) && s.push(u);
  return s;
}
function ym(t, n) {
  return function(e) {
    return t(n(e));
  };
}
var mm = ym(Object.keys, Object), vm = Object.prototype, wm = vm.hasOwnProperty;
function bm(t) {
  if (!Oy(t))
    return mm(t);
  var n = [];
  for (var e in Object(t))
    wm.call(t, e) && e != "constructor" && n.push(e);
  return n;
}
function Ri(t) {
  return Ze(t) ? _m(t) : bm(t);
}
var xm = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Mm = /^\w*$/;
function ji(t, n) {
  if (Q(t))
    return !1;
  var e = typeof t;
  return e == "number" || e == "symbol" || e == "boolean" || t == null || Ke(t) ? !0 : Mm.test(t) || !xm.test(t) || n != null && t in Object(n);
}
var Rn = pn(Object, "create");
function Am() {
  this.__data__ = Rn ? Rn(null) : {}, this.size = 0;
}
function $m(t) {
  var n = this.has(t) && delete this.__data__[t];
  return this.size -= n ? 1 : 0, n;
}
var Nm = "__lodash_hash_undefined__", km = Object.prototype, Tm = km.hasOwnProperty;
function Sm(t) {
  var n = this.__data__;
  if (Rn) {
    var e = n[t];
    return e === Nm ? void 0 : e;
  }
  return Tm.call(n, t) ? n[t] : void 0;
}
var zm = Object.prototype, Pm = zm.hasOwnProperty;
function Em(t) {
  var n = this.__data__;
  return Rn ? n[t] !== void 0 : Pm.call(n, t);
}
var Om = "__lodash_hash_undefined__";
function Cm(t, n) {
  var e = this.__data__;
  return this.size += this.has(t) ? 0 : 1, e[t] = Rn && n === void 0 ? Om : n, this;
}
function Ft(t) {
  var n = -1, e = t == null ? 0 : t.length;
  for (this.clear(); ++n < e; ) {
    var r = t[n];
    this.set(r[0], r[1]);
  }
}
Ft.prototype.clear = Am;
Ft.prototype.delete = $m;
Ft.prototype.get = Sm;
Ft.prototype.has = Em;
Ft.prototype.set = Cm;
function Im() {
  this.__data__ = [], this.size = 0;
}
function We(t, n) {
  for (var e = t.length; e--; )
    if (Oi(t[e][0], n))
      return e;
  return -1;
}
var Rm = Array.prototype, jm = Rm.splice;
function qm(t) {
  var n = this.__data__, e = We(n, t);
  if (e < 0)
    return !1;
  var r = n.length - 1;
  return e == r ? n.pop() : jm.call(n, e, 1), --this.size, !0;
}
function Fm(t) {
  var n = this.__data__, e = We(n, t);
  return e < 0 ? void 0 : n[e][1];
}
function Lm(t) {
  return We(this.__data__, t) > -1;
}
function Dm(t, n) {
  var e = this.__data__, r = We(e, t);
  return r < 0 ? (++this.size, e.push([t, n])) : e[r][1] = n, this;
}
function mt(t) {
  var n = -1, e = t == null ? 0 : t.length;
  for (this.clear(); ++n < e; ) {
    var r = t[n];
    this.set(r[0], r[1]);
  }
}
mt.prototype.clear = Im;
mt.prototype.delete = qm;
mt.prototype.get = Fm;
mt.prototype.has = Lm;
mt.prototype.set = Dm;
var jn = pn(yt, "Map");
function Hm() {
  this.size = 0, this.__data__ = {
    hash: new Ft(),
    map: new (jn || mt)(),
    string: new Ft()
  };
}
function Bm(t) {
  var n = typeof t;
  return n == "string" || n == "number" || n == "symbol" || n == "boolean" ? t !== "__proto__" : t === null;
}
function Je(t, n) {
  var e = t.__data__;
  return Bm(n) ? e[typeof n == "string" ? "string" : "hash"] : e.map;
}
function Xm(t) {
  var n = Je(this, t).delete(t);
  return this.size -= n ? 1 : 0, n;
}
function Um(t) {
  return Je(this, t).get(t);
}
function Ym(t) {
  return Je(this, t).has(t);
}
function Gm(t, n) {
  var e = Je(this, t), r = e.size;
  return e.set(t, n), this.size += e.size == r ? 0 : 1, this;
}
function vt(t) {
  var n = -1, e = t == null ? 0 : t.length;
  for (this.clear(); ++n < e; ) {
    var r = t[n];
    this.set(r[0], r[1]);
  }
}
vt.prototype.clear = Hm;
vt.prototype.delete = Xm;
vt.prototype.get = Um;
vt.prototype.has = Ym;
vt.prototype.set = Gm;
var Vm = "Expected a function";
function qi(t, n) {
  if (typeof t != "function" || n != null && typeof n != "function")
    throw new TypeError(Vm);
  var e = function() {
    var r = arguments, i = n ? n.apply(this, r) : r[0], a = e.cache;
    if (a.has(i))
      return a.get(i);
    var o = t.apply(this, r);
    return e.cache = a.set(i, o) || a, o;
  };
  return e.cache = new (qi.Cache || vt)(), e;
}
qi.Cache = vt;
var Km = 500;
function Zm(t) {
  var n = qi(t, function(r) {
    return e.size === Km && e.clear(), r;
  }), e = n.cache;
  return n;
}
var Wm = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Jm = /\\(\\)?/g, Qm = Zm(function(t) {
  var n = [];
  return t.charCodeAt(0) === 46 && n.push(""), t.replace(Wm, function(e, r, i, a) {
    n.push(i ? a.replace(Jm, "$1") : r || e);
  }), n;
});
function tv(t) {
  return t == null ? "" : su(t);
}
function pu(t, n) {
  return Q(t) ? t : ji(t, n) ? [t] : Qm(tv(t));
}
function Qe(t) {
  if (typeof t == "string" || Ke(t))
    return t;
  var n = t + "";
  return n == "0" && 1 / t == -1 / 0 ? "-0" : n;
}
function du(t, n) {
  n = pu(n, t);
  for (var e = 0, r = n.length; t != null && e < r; )
    t = t[Qe(n[e++])];
  return e && e == r ? t : void 0;
}
function nv(t, n, e) {
  var r = t == null ? void 0 : du(t, n);
  return r === void 0 ? e : r;
}
function gu(t, n) {
  for (var e = -1, r = n.length, i = t.length; ++e < r; )
    t[i + e] = n[e];
  return t;
}
var io = at ? at.isConcatSpreadable : void 0;
function ev(t) {
  return Q(t) || Ii(t) || !!(io && t && t[io]);
}
function rv(t, n, e, r, i) {
  var a = -1, o = t.length;
  for (e || (e = ev), i || (i = []); ++a < o; ) {
    var s = t[a];
    e(s) ? gu(i, s) : i[i.length] = s;
  }
  return i;
}
function iv(t) {
  var n = t == null ? 0 : t.length;
  return n ? rv(t) : [];
}
function av() {
  this.__data__ = new mt(), this.size = 0;
}
function ov(t) {
  var n = this.__data__, e = n.delete(t);
  return this.size = n.size, e;
}
function sv(t) {
  return this.__data__.get(t);
}
function uv(t) {
  return this.__data__.has(t);
}
var lv = 200;
function cv(t, n) {
  var e = this.__data__;
  if (e instanceof mt) {
    var r = e.__data__;
    if (!jn || r.length < lv - 1)
      return r.push([t, n]), this.size = ++e.size, this;
    e = this.__data__ = new vt(r);
  }
  return e.set(t, n), this.size = e.size, this;
}
function ft(t) {
  var n = this.__data__ = new mt(t);
  this.size = n.size;
}
ft.prototype.clear = av;
ft.prototype.delete = ov;
ft.prototype.get = sv;
ft.prototype.has = uv;
ft.prototype.set = cv;
function fv(t, n) {
  for (var e = -1, r = t == null ? 0 : t.length, i = 0, a = []; ++e < r; ) {
    var o = t[e];
    n(o, e, t) && (a[i++] = o);
  }
  return a;
}
function hv() {
  return [];
}
var pv = Object.prototype, dv = pv.propertyIsEnumerable, ao = Object.getOwnPropertySymbols, gv = ao ? function(t) {
  return t == null ? [] : (t = Object(t), fv(ao(t), function(n) {
    return dv.call(t, n);
  }));
} : hv;
function _v(t, n, e) {
  var r = n(t);
  return Q(t) ? r : gu(r, e(t));
}
function oo(t) {
  return _v(t, Ri, gv);
}
var ti = pn(yt, "DataView"), ni = pn(yt, "Promise"), ei = pn(yt, "Set"), so = "[object Map]", yv = "[object Object]", uo = "[object Promise]", lo = "[object Set]", co = "[object WeakMap]", fo = "[object DataView]", mv = Ht(ti), vv = Ht(jn), wv = Ht(ni), bv = Ht(ei), xv = Ht(Jr), Mt = hn;
(ti && Mt(new ti(new ArrayBuffer(1))) != fo || jn && Mt(new jn()) != so || ni && Mt(ni.resolve()) != uo || ei && Mt(new ei()) != lo || Jr && Mt(new Jr()) != co) && (Mt = function(t) {
  var n = hn(t), e = n == yv ? t.constructor : void 0, r = e ? Ht(e) : "";
  if (r)
    switch (r) {
      case mv:
        return fo;
      case vv:
        return so;
      case wv:
        return uo;
      case bv:
        return lo;
      case xv:
        return co;
    }
  return n;
});
var ho = yt.Uint8Array, Mv = "__lodash_hash_undefined__";
function Av(t) {
  return this.__data__.set(t, Mv), this;
}
function $v(t) {
  return this.__data__.has(t);
}
function qe(t) {
  var n = -1, e = t == null ? 0 : t.length;
  for (this.__data__ = new vt(); ++n < e; )
    this.add(t[n]);
}
qe.prototype.add = qe.prototype.push = Av;
qe.prototype.has = $v;
function Nv(t, n) {
  for (var e = -1, r = t == null ? 0 : t.length; ++e < r; )
    if (n(t[e], e, t))
      return !0;
  return !1;
}
function kv(t, n) {
  return t.has(n);
}
var Tv = 1, Sv = 2;
function _u(t, n, e, r, i, a) {
  var o = e & Tv, s = t.length, l = n.length;
  if (s != l && !(o && l > s))
    return !1;
  var u = a.get(t), c = a.get(n);
  if (u && c)
    return u == n && c == t;
  var h = -1, f = !0, p = e & Sv ? new qe() : void 0;
  for (a.set(t, n), a.set(n, t); ++h < s; ) {
    var d = t[h], _ = n[h];
    if (r)
      var w = o ? r(_, d, h, n, t, a) : r(d, _, h, t, n, a);
    if (w !== void 0) {
      if (w)
        continue;
      f = !1;
      break;
    }
    if (p) {
      if (!Nv(n, function(y, M) {
        if (!kv(p, M) && (d === y || i(d, y, e, r, a)))
          return p.push(M);
      })) {
        f = !1;
        break;
      }
    } else if (!(d === _ || i(d, _, e, r, a))) {
      f = !1;
      break;
    }
  }
  return a.delete(t), a.delete(n), f;
}
function zv(t) {
  var n = -1, e = Array(t.size);
  return t.forEach(function(r, i) {
    e[++n] = [i, r];
  }), e;
}
function Pv(t) {
  var n = -1, e = Array(t.size);
  return t.forEach(function(r) {
    e[++n] = r;
  }), e;
}
var Ev = 1, Ov = 2, Cv = "[object Boolean]", Iv = "[object Date]", Rv = "[object Error]", jv = "[object Map]", qv = "[object Number]", Fv = "[object RegExp]", Lv = "[object Set]", Dv = "[object String]", Hv = "[object Symbol]", Bv = "[object ArrayBuffer]", Xv = "[object DataView]", po = at ? at.prototype : void 0, Ar = po ? po.valueOf : void 0;
function Uv(t, n, e, r, i, a, o) {
  switch (e) {
    case Xv:
      if (t.byteLength != n.byteLength || t.byteOffset != n.byteOffset)
        return !1;
      t = t.buffer, n = n.buffer;
    case Bv:
      return !(t.byteLength != n.byteLength || !a(new ho(t), new ho(n)));
    case Cv:
    case Iv:
    case qv:
      return Oi(+t, +n);
    case Rv:
      return t.name == n.name && t.message == n.message;
    case Fv:
    case Dv:
      return t == n + "";
    case jv:
      var s = zv;
    case Lv:
      var l = r & Ev;
      if (s || (s = Pv), t.size != n.size && !l)
        return !1;
      var u = o.get(t);
      if (u)
        return u == n;
      r |= Ov, o.set(t, n);
      var c = _u(s(t), s(n), r, i, a, o);
      return o.delete(t), c;
    case Hv:
      if (Ar)
        return Ar.call(t) == Ar.call(n);
  }
  return !1;
}
var Yv = 1, Gv = Object.prototype, Vv = Gv.hasOwnProperty;
function Kv(t, n, e, r, i, a) {
  var o = e & Yv, s = oo(t), l = s.length, u = oo(n), c = u.length;
  if (l != c && !o)
    return !1;
  for (var h = l; h--; ) {
    var f = s[h];
    if (!(o ? f in n : Vv.call(n, f)))
      return !1;
  }
  var p = a.get(t), d = a.get(n);
  if (p && d)
    return p == n && d == t;
  var _ = !0;
  a.set(t, n), a.set(n, t);
  for (var w = o; ++h < l; ) {
    f = s[h];
    var y = t[f], M = n[f];
    if (r)
      var A = o ? r(M, y, f, n, t, a) : r(y, M, f, t, n, a);
    if (!(A === void 0 ? y === M || i(y, M, e, r, a) : A)) {
      _ = !1;
      break;
    }
    w || (w = f == "constructor");
  }
  if (_ && !w) {
    var g = t.constructor, v = n.constructor;
    g != v && "constructor" in t && "constructor" in n && !(typeof g == "function" && g instanceof g && typeof v == "function" && v instanceof v) && (_ = !1);
  }
  return a.delete(t), a.delete(n), _;
}
var Zv = 1, go = "[object Arguments]", _o = "[object Array]", re = "[object Object]", Wv = Object.prototype, yo = Wv.hasOwnProperty;
function Jv(t, n, e, r, i, a) {
  var o = Q(t), s = Q(n), l = o ? _o : Mt(t), u = s ? _o : Mt(n);
  l = l == go ? re : l, u = u == go ? re : u;
  var c = l == re, h = u == re, f = l == u;
  if (f && Qr(t)) {
    if (!Qr(n))
      return !1;
    o = !0, c = !1;
  }
  if (f && !c)
    return a || (a = new ft()), o || hu(t) ? _u(t, n, e, r, i, a) : Uv(t, n, l, e, r, i, a);
  if (!(e & Zv)) {
    var p = c && yo.call(t, "__wrapped__"), d = h && yo.call(n, "__wrapped__");
    if (p || d) {
      var _ = p ? t.value() : t, w = d ? n.value() : n;
      return a || (a = new ft()), i(_, w, e, r, a);
    }
  }
  return f ? (a || (a = new ft()), Kv(t, n, e, r, i, a)) : !1;
}
function Fi(t, n, e, r, i) {
  return t === n ? !0 : t == null || n == null || !ln(t) && !ln(n) ? t !== t && n !== n : Jv(t, n, e, r, Fi, i);
}
var Qv = 1, t1 = 2;
function n1(t, n, e, r) {
  var i = e.length, a = i;
  if (t == null)
    return !a;
  for (t = Object(t); i--; ) {
    var o = e[i];
    if (o[2] ? o[1] !== t[o[0]] : !(o[0] in t))
      return !1;
  }
  for (; ++i < a; ) {
    o = e[i];
    var s = o[0], l = t[s], u = o[1];
    if (o[2]) {
      if (l === void 0 && !(s in t))
        return !1;
    } else {
      var c = new ft(), h;
      if (!(h === void 0 ? Fi(u, l, Qv | t1, r, c) : h))
        return !1;
    }
  }
  return !0;
}
function yu(t) {
  return t === t && !cn(t);
}
function e1(t) {
  for (var n = Ri(t), e = n.length; e--; ) {
    var r = n[e], i = t[r];
    n[e] = [r, i, yu(i)];
  }
  return n;
}
function mu(t, n) {
  return function(e) {
    return e == null ? !1 : e[t] === n && (n !== void 0 || t in Object(e));
  };
}
function r1(t) {
  var n = e1(t);
  return n.length == 1 && n[0][2] ? mu(n[0][0], n[0][1]) : function(e) {
    return e === t || n1(e, t, n);
  };
}
function i1(t, n) {
  return t != null && n in Object(t);
}
function a1(t, n, e) {
  n = pu(n, t);
  for (var r = -1, i = n.length, a = !1; ++r < i; ) {
    var o = Qe(n[r]);
    if (!(a = t != null && e(t, o)))
      break;
    t = t[o];
  }
  return a || ++r != i ? a : (i = t == null ? 0 : t.length, !!i && Ci(i) && Ei(o, i) && (Q(t) || Ii(t)));
}
function o1(t, n) {
  return t != null && a1(t, n, i1);
}
var s1 = 1, u1 = 2;
function l1(t, n) {
  return ji(t) && yu(n) ? mu(Qe(t), n) : function(e) {
    var r = nv(e, t);
    return r === void 0 && r === n ? o1(e, t) : Fi(n, r, s1 | u1);
  };
}
function c1(t) {
  return function(n) {
    return n == null ? void 0 : n[t];
  };
}
function f1(t) {
  return function(n) {
    return du(n, t);
  };
}
function h1(t) {
  return ji(t) ? c1(Qe(t)) : f1(t);
}
function p1(t) {
  return typeof t == "function" ? t : t == null ? fy : typeof t == "object" ? Q(t) ? l1(t[0], t[1]) : r1(t) : h1(t);
}
function d1(t) {
  return function(n, e, r) {
    for (var i = -1, a = Object(n), o = r(n), s = o.length; s--; ) {
      var l = o[++i];
      if (e(a[l], l, a) === !1)
        break;
    }
    return n;
  };
}
var g1 = d1();
function _1(t, n) {
  return t && g1(t, n, Ri);
}
function y1(t, n) {
  return function(e, r) {
    if (e == null)
      return e;
    if (!Ze(e))
      return t(e, r);
    for (var i = e.length, a = -1, o = Object(e); ++a < i && r(o[a], a, o) !== !1; )
      ;
    return e;
  };
}
var m1 = y1(_1);
function v1(t, n) {
  var e = -1, r = Ze(t) ? Array(t.length) : [];
  return m1(t, function(i, a, o) {
    r[++e] = n(i, a, o);
  }), r;
}
function mo(t, n) {
  var e = Q(t) ? ou : v1;
  return e(t, p1(n));
}
var w1 = Math.ceil, b1 = Math.max;
function x1(t, n, e, r) {
  for (var i = -1, a = b1(w1((n - t) / (e || 1)), 0), o = Array(a); a--; )
    o[++i] = t, t += e;
  return o;
}
function M1(t) {
  return function(n, e, r) {
    return r && typeof r != "number" && Py(n, e, r) && (e = r = void 0), n = br(n), e === void 0 ? (e = n, n = 0) : e = br(e), r = r === void 0 ? n < e ? 1 : -1 : br(r), x1(n, e, r);
  };
}
var A1 = M1();
const $1 = (t, n, e = 12, r = 12) => {
  const i = un().domain([0, e]).range([0, t]), a = un().domain([0, r]).range([0, n]);
  return {
    points: function() {
      return A1((e + 1) * (r + 1)).map(function(o) {
        return { m: o % (e + 1), n: Math.floor(o / (e + 1)), x: i(o % (e + 1)), y: a(Math.floor(o / (e + 1))) };
      });
    },
    position: function(o, s) {
      typeof o == "number" && (o = [o]), typeof s == "number" && (s = [s]);
      const l = iv(mo(s, function(u) {
        return mo(
          o,
          function(c) {
            return { x: i(c), y: a(u) };
          }
        );
      }));
      return l.length == 1 ? l[0] : l;
    }
  };
}, N1 = "_widget_1aazq_40", k1 = "_label_1aazq_58", T1 = "_lit_1aazq_63", S1 = "_button_1aazq_67", z1 = "_symbol_1aazq_67", P1 = "_radio_1aazq_68", E1 = "_radiobutton_1aazq_68", O1 = "_selected_1aazq_74", C1 = "_toggle_1aazq_75", I1 = "_slider_1aazq_84", R1 = "_track_1aazq_84", j1 = "_track_overlay_1aazq_89", q1 = "_handle_1aazq_97", x = {
  widget: N1,
  label: k1,
  lit: T1,
  button: S1,
  symbol: z1,
  radio: P1,
  radiobutton: E1,
  selected: O1,
  toggle: C1,
  slider: I1,
  track: R1,
  track_overlay: j1,
  handle: q1
}, tr = () => {
  const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890", n = t.length;
  let e = "";
  for (let r = 0; r < 10; ++r)
    e += t[Math.floor(Math.random() * n)];
  return e;
}, Li = (t, n, e) => {
  var r, i, a, o;
  switch (e) {
    case "top":
      r = 0, i = -n / 2 - 5, a = "middle", o = "bottom";
      break;
    case "bottom":
      r = 0, i = n / 2 + 5, a = "middle", o = "hanging";
      break;
    case "left":
      r = -t / 2 - 5, i = 0, a = "end", o = "middle";
      break;
    case "right":
      r = t / 2 + 5, i = 0, a = "start", o = "middle";
      break;
    default:
      r = 0, i = n / 2 + 5, a = "middle", o = "hanging";
  }
  return { x: r, y: i, anchor: a, valign: o };
}, F1 = (t = 1) => {
  const n = et();
  return n.moveTo(t * 1, t * 0), n.lineTo(t * -0.5, t * (Math.sqrt(3) / 2)), n.lineTo(t * -0.5, t * (-Math.sqrt(3) / 2)), n.closePath(), n.toString();
}, L1 = (t = 1) => {
  const n = et(), e = 0.7;
  return n.moveTo(e * t * (1 + 0.75), e * t * 0), n.lineTo(e * t * (-0.5 + 0.75), e * t * (Math.sqrt(3) / 2)), n.lineTo(e * t * (-0.5 + 0.75), e * t * (-Math.sqrt(3) / 2)), n.closePath(), n.moveTo(e * t * (1 - 0.75), e * t * 0), n.lineTo(e * t * (-0.5 - 0.75), e * t * (Math.sqrt(3) / 2)), n.lineTo(e * t * (-0.5 - 0.75), e * t * (-Math.sqrt(3) / 2)), n.closePath(), n.toString();
}, D1 = (t = 1) => {
  const n = et();
  return n.moveTo(-t * 1, t * 0), n.lineTo(t * 0.5, t * (Math.sqrt(3) / 2)), n.lineTo(t * 0.5, t * (-Math.sqrt(3) / 2)), n.closePath(), n.toString();
}, H1 = (t = 1) => {
  const n = 0.3333333333333333, e = 0.9;
  var r = et();
  return r.moveTo(t * e, t * e), r.lineTo(t * e, t * -0.9), r.lineTo(t * (e * n), t * -0.9), r.lineTo(t * (e * n), t * e), r.closePath(), r.moveTo(-t * e, t * e), r.lineTo(-t * e, t * -0.9), r.lineTo(-t * (e * n), t * -0.9), r.lineTo(-t * (e * n), t * e), r.closePath(), r.toString();
}, B1 = (t = 1) => {
  const n = et(), e = Math.PI / 2.5, r = e / 2, i = 2 * Math.PI - e / 2, a = 0.5, o = 0.6, s = 0.6, l = [t * (1 - a / 2) * Math.cos(i), t * (1 - a / 2) * Math.sin(i)], u = [t * s * Math.cos(i + Math.PI / 2), t * s * Math.sin(i + Math.PI / 2)];
  return n.moveTo(t * Math.cos(i), t * Math.sin(i)), n.arc(0, 0, t, i, r, !0), n.lineTo(t * (1 - a) * Math.cos(r), t * (1 - a) * Math.sin(r)), n.arc(0, 0, t * (1 - a), r, i, !1), n.lineTo(t * (1 - o - a / 2) * Math.cos(i), t * (1 - o - a / 2) * Math.sin(i)), n.lineTo(l[0] + u[0], l[1] + u[1]), n.lineTo(t * (1 + o - a / 2) * Math.cos(i), t * (1 + o - a / 2) * Math.sin(i)), n.closePath(), n.toString();
}, X1 = (t = 1) => {
  const n = et(), e = Math.PI / 10, r = t / 2, i = Math.PI - e, a = e, o = -e, s = Math.PI + e;
  return n.arc(0, 0, r, s, o), n.lineTo(t, r * Math.sin(s)), n.lineTo(t, -t), n.lineTo(-t, -t), n.lineTo(-t, r * Math.sin(s)), n.closePath(), n.arc(0, 0, r, a, i), n.lineTo(-t, r * Math.sin(i)), n.lineTo(-t, t), n.lineTo(t, t), n.lineTo(t, r * Math.sin(i)), n.closePath(), n.toString();
}, U1 = (t = 1) => {
  const n = et(), e = Math.PI / 2.5, r = e / 2 + Math.PI, i = 2 * Math.PI - e / 2 + Math.PI, a = 0.5, o = 0.6, s = -0.6;
  n.moveTo(t * Math.cos(r), t * Math.sin(r)), n.arc(0, 0, t, r, i, !1), n.lineTo(t * (1 - a) * Math.cos(i), t * (1 - a) * Math.sin(i)), n.arc(0, 0, t * (1 - a), i, r, !0), n.lineTo(t * (1 - o - a / 2) * Math.cos(r), t * (1 - o - a / 2) * Math.sin(r));
  var l = [t * (1 - a / 2) * Math.cos(r), t * (1 - a / 2) * Math.sin(r)], u = [t * s * Math.cos(r + Math.PI / 2), t * s * Math.sin(r + Math.PI / 2)];
  return n.lineTo(l[0] + u[0], l[1] + u[1]), n.lineTo(t * (1 + o - a / 2) * Math.cos(r), t * (1 + o - a / 2) * Math.sin(r)), n.closePath(), n.toString();
}, Y1 = (t = 1) => {
  var n = et(), e = 0.9;
  return n.moveTo(t * e, t * e), n.lineTo(t * -0.9, t * e), n.lineTo(t * -0.9, t * -0.9), n.lineTo(t * e, t * -0.9), n.closePath(), n.toString();
}, G1 = (t = 1) => {
  const n = et(), e = 0, r = 2 * Math.PI;
  return n.moveTo(t * Math.cos(e), t * Math.sin(e)), n.arc(0, 0, t, e, r, !0), n.closePath(), n.toString();
}, ri = (t) => {
  switch (t) {
    case "play":
      return F1;
    case "forward":
      return L1;
    case "back":
      return D1;
    case "pause":
      return H1;
    case "reload":
      return B1;
    case "capture":
      return X1;
    case "rewind":
      return U1;
    case "stop":
      return Y1;
    case "push":
      return G1;
  }
}, Di = () => {
  const t = "button";
  var n = tr(), e = 50, r = 0.3, i = "round", a = { x: 0, y: 0 }, o = null, s = "bottom", l = null, u = function(f) {
  }, c = ["play"], h = 0;
  return {
    type: t,
    id: function(f) {
      return typeof f > "u" ? n : (n = f, this);
    },
    size: function(f) {
      return typeof f > "u" ? e : (e = f, this);
    },
    symbolsize: function(f) {
      return typeof f > "u" ? r : (r = f, this);
    },
    shape: function(f) {
      return typeof f > "u" ? i : (i = f, this);
    },
    position: function(f) {
      return typeof f > "u" ? a : (a = f, this);
    },
    x: function(f) {
      return typeof f > "u" ? a.x : (a.x = f, this);
    },
    y: function(f) {
      return typeof f > "u" ? a.y : (a.y = f, this);
    },
    label: function(f) {
      return typeof f > "u" ? o : (o = f, this);
    },
    labelposition: function(f) {
      return typeof f > "u" ? s : (s = f, this);
    },
    fontsize: function(f) {
      return typeof f > "u" ? l : (l = f, this);
    },
    update: function(f) {
      if (typeof f == "function")
        return u = f, this;
      u(f);
    },
    actions: function(f) {
      return typeof f > "u" ? c : (c = f, this);
    },
    value: function(f) {
      return typeof f > "u" ? h : (h = f, this);
    },
    click: function() {
      h = (h + 1) % c.length, u(), I(this.parentNode).select("." + x.symbol).attr("d", ri(c[h])(r * e));
    },
    press: function(f) {
      h = (h + 1) % c.length, u(), f.select("#button_" + n).select("." + x.symbol).attr("d", ri(c[h])(r * e));
    }
  };
}, V1 = () => {
  const t = "slider", n = Ve(".3f");
  var e = tr(), r = 100, i = 8, a = 10, o = !1, s = { x: 0, y: 0 }, l = "top-left", u = null, c = function(y) {
  }, h = function(y) {
  }, f = [0, 1], p = 0, d = null, _ = un().domain(f).range([0, r]).clamp(!0);
  const w = function(y, M, A = f) {
    const g = y.select("#slider_" + e);
    _.domain(A), p = M, g.selectAll("." + x.handle).transition().attr("cx", _(M)), o && g.select("." + x.label).text(d + " = " + n(p)), c(), h();
  };
  return {
    type: t,
    scale: _,
    id: function(y) {
      return typeof y > "u" ? e : (e = y, this);
    },
    label: function(y) {
      return typeof y > "u" ? d : (d = y, this);
    },
    size: function(y) {
      return typeof y > "u" ? r : (r = y, this);
    },
    girth: function(y) {
      return typeof y > "u" ? i : (i = y, this);
    },
    knob: function(y) {
      return typeof y > "u" ? a : (a = y, this);
    },
    show: function(y) {
      return typeof y > "u" ? o : (o = y, this);
    },
    position: function(y) {
      return typeof y > "u" ? s : (s = y, this);
    },
    x: function(y) {
      return typeof y > "u" ? s.x : (s.x = y, this);
    },
    y: function(y) {
      return typeof y > "u" ? s.y : (s.y = y, this);
    },
    labelposition: function(y) {
      return typeof y > "u" ? l : (l = y, this);
    },
    fontsize: function(y) {
      return typeof y > "u" ? u : (u = y, this);
    },
    update: function(y) {
      if (typeof y == "function")
        return c = y, this;
      c(y);
    },
    update_end: function(y) {
      if (typeof y == "function")
        return h = y, this;
      h(y);
    },
    range: function(y) {
      return typeof y > "u" ? f : (f = y, this);
    },
    value: function(y) {
      return typeof y > "u" ? p : (p = y, this);
    },
    reset: w,
    click: w
  };
}, K1 = () => {
  const t = "toggle";
  var n = tr(), e = 10, r = { x: 0, y: 0 }, i = null, a = "top", o = null, s = function(u) {
  }, l = 0;
  return {
    type: t,
    id: function(u) {
      return typeof u > "u" ? n : (n = u, this);
    },
    size: function(u) {
      return typeof u > "u" ? e : (e = u, this);
    },
    position: function(u) {
      return typeof u > "u" ? r : (r = u, this);
    },
    x: function(u) {
      return typeof u > "u" ? r.x : (r.x = u, this);
    },
    y: function(u) {
      return typeof u > "u" ? r.y : (r.y = u, this);
    },
    label: function(u) {
      return typeof u > "u" ? i : (i = u, this);
    },
    labelposition: function(u) {
      return typeof u > "u" ? a : (a = u, this);
    },
    fontsize: function(u) {
      return typeof u > "u" ? o : (o = u, this);
    },
    update: function(u) {
      if (typeof u == "function")
        return s = u, this;
      s(u);
    },
    value: function(u) {
      return typeof u > "u" ? l : (l = u, this);
    },
    click: function() {
      l = !l;
      const u = I(this.parentNode);
      u.select("." + x.handle).transition().attr("cx", l ? 2 * e : 0), u.classed(x.selected, l), s();
    },
    reset: function(u, c) {
      l = c;
      const h = u.select("#toggle_" + n);
      h.selectAll("." + x.handle).transition().attr("cx", l ? 2 * e : 0), h.classed(x.selected, l), s();
    }
  };
}, Z1 = () => {
  const t = "radio";
  var n = tr(), e = 100, r = 20, i = 0.3, a = "round", o = "vertical", s = { x: 0, y: 0 }, l = "right", u = null, c = function(p) {
  }, h = [], f = 0;
  return {
    type: t,
    id: function(p) {
      return typeof p > "u" ? n : (n = p, this);
    },
    size: function(p) {
      return typeof p > "u" ? e : (e = p, this);
    },
    buttonsize: function(p) {
      return typeof p > "u" ? r : (r = p, this);
    },
    buttonpadding: function(p) {
      return typeof p > "u" ? i : (i = p, this);
    },
    orientation: function(p) {
      return typeof p > "u" ? o : (o = p, this);
    },
    shape: function(p) {
      return typeof p > "u" ? a : (a = p, this);
    },
    position: function(p) {
      return typeof p > "u" ? s : (s = p, this);
    },
    x: function(p) {
      return typeof p > "u" ? s.x : (s.x = p, this);
    },
    y: function(p) {
      return typeof p > "u" ? s.y : (s.y = p, this);
    },
    labelposition: function(p) {
      return typeof p > "u" ? l : (l = p, this);
    },
    fontsize: function(p) {
      return typeof p > "u" ? u : (u = p, this);
    },
    update: function(p) {
      if (typeof p == "function")
        return c = p, this;
      c(p);
    },
    choices: function(p) {
      return typeof p > "u" ? h : (h = p, this);
    },
    value: function(p) {
      return typeof p > "u" ? f : (f = p, this);
    },
    click: function(p, d) {
      f = d, I(this.parentNode).selectAll("." + x.symbol).classed(x.selected, (_) => _ == f), c();
    },
    reset: function(p, d) {
      f = d, p.select("#radio_" + n).selectAll("." + x.symbol).classed(x.selected, (_) => _ == f), c();
    }
  };
}, W1 = (t, n) => {
  const e = "button_" + t.id(), r = t.label(), i = t.labelposition(), a = document.createElementNS("http://www.w3.org/2000/svg", "g"), o = I(a).attr("class", x.widget + " " + x.button).attr("id", e).attr("transform", "translate(" + t.x() + "," + t.y() + ")");
  var s;
  if (t.shape() == "rect" ? s = o.append("rect").attr("width", t.size()).attr("height", t.size()).attr("transform", "translate(" + -t.size() / 2 + "," + -t.size() / 2 + ")").attr("rx", 5).attr("ry", 5) : s = o.append("circle").attr("r", t.size() / 2), s.attr("class", x.background).on("click", t.click).on("mouseover", function() {
    I(this).classed(x.lit, !0), I(this.parentNode).select("." + x.symbol).classed(x.lit, !0);
  }).on("mouseout", function() {
    I(this).classed(x.lit, !1), I(this.parentNode).select("." + x.symbol).classed(x.lit, !1);
  }), o.append("path").attr("d", ri(t.actions()[t.value()])(t.symbolsize() * t.size())).attr("class", x.symbol), r) {
    const l = Li(t.size(), t.size(), i);
    o.append("text").text(r).attr("class", x.label).style("text-anchor", l.anchor).style("font-size", t.fontsize()).style("alignment-baseline", l.valign).attr("transform", "translate(" + l.x + "," + l.y + ")");
  }
  return a;
}, vu = (t, n) => {
  const e = et();
  return e.moveTo(0, n / 2), e.arc(0, 0, n / 2, Math.PI / 2, 3 * Math.PI / 2, !1), e.lineTo(t, -n / 2), e.arc(t, 0, n / 2, 3 * Math.PI / 2, 2 * Math.PI + Math.PI / 2, !1), e.closePath(), e.toString();
}, J1 = (t, n) => {
  const e = Ve(".3f"), r = "slider_" + t.id();
  t.labelposition();
  const i = t.range, a = t.size();
  t.label();
  const o = t.scale;
  var s;
  const l = document.createElementNS("http://www.w3.org/2000/svg", "g");
  s = I(l).attr("class", x.widget + " " + x.slider).attr("id", r).attr("transform", "translate(" + t.x() + "," + t.y() + ")"), o.domain(i()).range([0, a]).clamp(!0);
  const u = t.knob() > t.girth() ? t.knob() : t.girth() / 2;
  s.append("path").attr("d", vu(t.size(), t.girth())).attr("class", x.track), s.append("circle").attr("class", x.handle).attr("r", t.knob()).attr("cx", o(t.value())), s.append("rect").attr("width", t.size() + 2 * u).attr("height", 2 * u).attr("transform", "translate(" + -u + "," + -u + ")").attr("class", x.track_overlay).on("click", function(d) {
    const _ = Hr(d, this)[0];
    t.value(o.invert(_)), t.update(), t.update_end(), s.selectAll("." + x.handle).attr("cx", o(t.value())), t.show() && s.select("." + x.label).text(t.label() + " = " + e(t.value()));
  }).call(
    C0().on("drag", function(d) {
      t.value(o.invert(d.x)), t.update(), s.selectAll("." + x.handle).attr("cx", o(t.value())), t.show() && s.select("." + x.label).text(t.label() + " = " + e(t.value()));
    }).on("end", function(d) {
      t.update_end();
    })
  );
  var c, h, f, p = "bottom";
  return t.fontsize && (h = t.labelposition().match(/bottom/i) != null ? Wn([t.girth() / 2, t.knob()]) + t.fontsize() / 2 : -Wn([t.girth() / 2, t.knob()]) - t.fontsize() / 2), h = t.labelposition().match(/bottom/i) != null ? Wn([t.girth() / 2, t.knob()]) + 7 : -Wn([t.girth() / 2, t.knob()]) - 7, c = t.labelposition().match(/right/i) != null ? t.size() : t.labelposition().match(/center/i) != null ? t.size() / 2 : 0, f = t.labelposition().match(/right/i) != null ? "end" : t.labelposition().match(/center/i) != null ? "middle" : "start", p = t.labelposition().match(/bottom/i) != null ? "hanging" : "top", s.append("text").text(t.show() ? t.label() + " = " + e(t.value()) : t.label()).attr("class", x.label).style("text-anchor", f).style("alignment-baseline", p).style("font-size", t.fontsize()).style("opacity", 1).attr("transform", "translate(" + c + "," + h + ")"), l;
}, Q1 = (t, n) => {
  const e = "toggle_" + t.id(), r = t.size(), i = t.label(), a = t.labelposition(), o = document.createElementNS("http://www.w3.org/2000/svg", "g"), s = I(o).attr("class", x.widget + " " + x.toggle).attr("id", e).attr("transform", "translate(" + (t.x() - r) + "," + t.y() + ")").classed(x.selected, t.value() == 1);
  if (s.append("path").attr("d", vu(2 * t.size(), 2 * t.size())).attr("class", x.track), s.append("circle").attr("class", x.handle).attr("r", r).attr("cx", t.value() ? 2 * r : 0), s.append("rect").attr("width", 4 * t.size()).attr("height", 2 * t.size()).attr("class", x.track_overlay).attr("transform", "translate(" + -t.size() + "," + -t.size() + ")").on("click", t.click), i) {
    const l = Li(4 * t.size(), 2 * t.size(), a);
    s.append("text").text(i).attr("class", x.label).style("text-anchor", l.anchor).style("font-size", t.fontsize()).style("alignment-baseline", l.valign).attr("transform", "translate(" + (l.x + r) + "," + l.y + ")");
  }
  return o;
}, tw = (t, n) => {
  const e = "radio_" + t.id(), r = t.labelposition(), i = t.buttonsize(), a = t.buttonsize() * (1 - t.buttonpadding()), o = t.choices().length, s = Xp(o), l = un().domain([0, o - 1]).range([0, t.size()]), u = un().domain([0, o - 1]).range([0, t.size()]), c = document.createElementNS("http://www.w3.org/2000/svg", "g"), h = I(c).attr("class", x.widget + " " + x.radio).attr("id", e).attr("transform", "translate(" + t.x() + "," + t.y() + ")").selectAll("." + x.radiobutton).data(s).enter().append("g").attr("class", x.radiobutton).attr("id", (_) => "b" + _).attr("transform", (_) => t.orientation() == "vertical" ? "translate(0," + u(_) + ")" : "translate(" + l(_) + ",0)");
  var f, p;
  t.shape() == "rect" ? (f = h.append("rect").attr("width", i).attr("height", i).attr("rx", 2).attr("ry", 2).attr("transform", "translate(" + -i / 2 + "," + -i / 2 + ")"), p = h.append("rect").attr("width", a).attr("height", a).attr("rx", 2).attr("ry", 2).attr("transform", "translate(" + -a / 2 + "," + -a / 2 + ")")) : (f = h.append("circle").attr("r", i / 2), p = h.append("circle").attr("r", a / 2)), f.attr("class", x.background).on("mouseover", function() {
    I(this).classed(x.lit, !0), I(this.parentNode).select("." + x.symbol).classed(x.lit, !0);
  }).on("mouseout", function() {
    I(this).classed(x.lit, !1), I(this.parentNode).select("." + x.symbol).classed(x.lit, !1);
  }), p.attr("class", x.symbol), p.filter((_) => _ == t.value()).classed(x.selected, !0), h.on("click", t.click);
  const d = Li(t.buttonsize(), t.buttonsize(), r);
  return h.append("text").attr("class", x.label).text(function(_, w) {
    return t.choices()[w];
  }).attr("alignment-baseline", d.valign).attr("transform", "translate(" + d.x + "," + d.y + ")").style("font-size", t.fontsize()).attr("text-anchor", d.anchor), c;
}, ie = (t, n) => {
  switch (t.type) {
    case "button":
      return W1(t);
    case "slider":
      return J1(t);
    case "radio":
      return tw(t);
    case "toggle":
      return Q1(t);
  }
}, nw = "_agent_1wtcj_1", ew = "_inset_1wtcj_7", rw = "_plot_1wtcj_11", iw = "_xaxis_1wtcj_15", aw = "_yaxis_1wtcj_18", ow = "_xlabel_1wtcj_22", sw = "_ylabel_1wtcj_25", uw = "_caxis_1wtcj_28", lw = "_dot_1wtcj_34", cw = "_op_1wtcj_40", fw = "_plotline_1wtcj_46", hw = "_displayPanel_1wtcj_89", pw = "_controlPanel_1wtcj_94", E = {
  agent: nw,
  inset: ew,
  plot: rw,
  xaxis: iw,
  yaxis: aw,
  xlabel: ow,
  ylabel: sw,
  caxis: uw,
  dot: lw,
  op: cw,
  plotline: fw,
  displayPanel: hw,
  controlPanel: pw
}, dw = (t, n) => {
  const e = $1(
    n.controls_size.width,
    n.controls_size.height,
    n.controls_grid.nx,
    n.controls_grid.ny
  ), r = sf("#" + t).classed(t + " " + n.container_class, !0), i = t + "_display", a = t + "_controls", o = r.append("div").attr("id", i).attr("class", E.displayPanel).classed(n.display_class, !0).classed(n.debug_lattice, n.debug).append(n.display_type).attr("width", n.display_type == "canvas" ? n.display_size.width : null).attr("height", n.display_type == "canvas" ? n.display_size.height : null).attr("viewBox", n.display_type == "canvas" ? null : "0 0 " + n.display_size.width + " " + n.display_size.height).style("width", "100%"), s = r.append("div").attr("id", a).attr("class", "d3-widgets " + E.controlPanel).classed(n.controls_class, !0).classed(n.debug_lattice, n.debug).append("svg").attr("viewBox", "0 0 " + n.controls_size.width + " " + n.controls_size.height).style("width", "100%").style("height", "100%");
  return typeof n.controls_border == "string" && n.controls_border.length > 0 && s.style("border", n.controls_border), typeof n.display_border == "string" && n.display_border.length > 0 && o.style("border", n.display_border), n.debug && s.selectAll(null).data(e.points).enter().append("circle").attr("r", 2).attr("transform", (l) => "translate(" + l.x + "," + l.y + ")").style("fill", "black"), { display: o, controls: s, grid: e };
};
var wu = typeof global == "object" && global && global.Object === Object && global, gw = typeof self == "object" && self && self.Object === Object && self, wt = wu || gw || Function("return this")(), kt = wt.Symbol, bu = Object.prototype, _w = bu.hasOwnProperty, yw = bu.toString, mn = kt ? kt.toStringTag : void 0;
function mw(t) {
  var n = _w.call(t, mn), e = t[mn];
  try {
    t[mn] = void 0;
    var r = !0;
  } catch {
  }
  var i = yw.call(t);
  return r && (n ? t[mn] = e : delete t[mn]), i;
}
var vw = Object.prototype, ww = vw.toString;
function bw(t) {
  return ww.call(t);
}
var xw = "[object Null]", Mw = "[object Undefined]", vo = kt ? kt.toStringTag : void 0;
function Bt(t) {
  return t == null ? t === void 0 ? Mw : xw : vo && vo in Object(t) ? mw(t) : bw(t);
}
function Lt(t) {
  return t != null && typeof t == "object";
}
var Aw = "[object Symbol]";
function nr(t) {
  return typeof t == "symbol" || Lt(t) && Bt(t) == Aw;
}
function er(t, n) {
  for (var e = -1, r = t == null ? 0 : t.length, i = Array(r); ++e < r; )
    i[e] = n(t[e], e, t);
  return i;
}
var G = Array.isArray, wo = kt ? kt.prototype : void 0, bo = wo ? wo.toString : void 0;
function xu(t) {
  if (typeof t == "string")
    return t;
  if (G(t))
    return er(t, xu) + "";
  if (nr(t))
    return bo ? bo.call(t) : "";
  var n = t + "";
  return n == "0" && 1 / t == -1 / 0 ? "-0" : n;
}
var $w = /\s/;
function Nw(t) {
  for (var n = t.length; n-- && $w.test(t.charAt(n)); )
    ;
  return n;
}
var kw = /^\s+/;
function Tw(t) {
  return t && t.slice(0, Nw(t) + 1).replace(kw, "");
}
function gt(t) {
  var n = typeof t;
  return t != null && (n == "object" || n == "function");
}
var xo = NaN, Sw = /^[-+]0x[0-9a-f]+$/i, zw = /^0b[01]+$/i, Pw = /^0o[0-7]+$/i, Ew = parseInt;
function Ow(t) {
  if (typeof t == "number")
    return t;
  if (nr(t))
    return xo;
  if (gt(t)) {
    var n = typeof t.valueOf == "function" ? t.valueOf() : t;
    t = gt(n) ? n + "" : n;
  }
  if (typeof t != "string")
    return t === 0 ? t : +t;
  t = Tw(t);
  var e = zw.test(t);
  return e || Pw.test(t) ? Ew(t.slice(2), e ? 2 : 8) : Sw.test(t) ? xo : +t;
}
var Cw = 1 / 0, Iw = 17976931348623157e292;
function $r(t) {
  if (!t)
    return t === 0 ? t : 0;
  if (t = Ow(t), t === Cw || t === -1 / 0) {
    var n = t < 0 ? -1 : 1;
    return n * Iw;
  }
  return t === t ? t : 0;
}
function Mu(t) {
  return t;
}
var Rw = "[object AsyncFunction]", jw = "[object Function]", qw = "[object GeneratorFunction]", Fw = "[object Proxy]";
function Au(t) {
  if (!gt(t))
    return !1;
  var n = Bt(t);
  return n == jw || n == qw || n == Rw || n == Fw;
}
var Nr = wt["__core-js_shared__"], Mo = function() {
  var t = /[^.]+$/.exec(Nr && Nr.keys && Nr.keys.IE_PROTO || "");
  return t ? "Symbol(src)_1." + t : "";
}();
function Lw(t) {
  return !!Mo && Mo in t;
}
var Dw = Function.prototype, Hw = Dw.toString;
function Xt(t) {
  if (t != null) {
    try {
      return Hw.call(t);
    } catch {
    }
    try {
      return t + "";
    } catch {
    }
  }
  return "";
}
var Bw = /[\\^$.*+?()[\]{}|]/g, Xw = /^\[object .+?Constructor\]$/, Uw = Function.prototype, Yw = Object.prototype, Gw = Uw.toString, Vw = Yw.hasOwnProperty, Kw = RegExp(
  "^" + Gw.call(Vw).replace(Bw, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function Zw(t) {
  if (!gt(t) || Lw(t))
    return !1;
  var n = Au(t) ? Kw : Xw;
  return n.test(Xt(t));
}
function Ww(t, n) {
  return t == null ? void 0 : t[n];
}
function Ut(t, n) {
  var e = Ww(t, n);
  return Zw(e) ? e : void 0;
}
var ii = Ut(wt, "WeakMap"), Ao = function() {
  try {
    var t = Ut(Object, "defineProperty");
    return t({}, "", {}), t;
  } catch {
  }
}();
function Jw(t, n) {
  for (var e = -1, r = t == null ? 0 : t.length; ++e < r && n(t[e], e, t) !== !1; )
    ;
  return t;
}
var Qw = 9007199254740991, tb = /^(?:0|[1-9]\d*)$/;
function rr(t, n) {
  var e = typeof t;
  return n = n ?? Qw, !!n && (e == "number" || e != "symbol" && tb.test(t)) && t > -1 && t % 1 == 0 && t < n;
}
function nb(t, n, e) {
  n == "__proto__" && Ao ? Ao(t, n, {
    configurable: !0,
    enumerable: !0,
    value: e,
    writable: !0
  }) : t[n] = e;
}
function ir(t, n) {
  return t === n || t !== t && n !== n;
}
var eb = Object.prototype, rb = eb.hasOwnProperty;
function ib(t, n, e) {
  var r = t[n];
  (!(rb.call(t, n) && ir(r, e)) || e === void 0 && !(n in t)) && nb(t, n, e);
}
var ab = 9007199254740991;
function Hi(t) {
  return typeof t == "number" && t > -1 && t % 1 == 0 && t <= ab;
}
function Un(t) {
  return t != null && Hi(t.length) && !Au(t);
}
function ob(t, n, e) {
  if (!gt(e))
    return !1;
  var r = typeof n;
  return (r == "number" ? Un(e) && rr(n, e.length) : r == "string" && n in e) ? ir(e[n], t) : !1;
}
var sb = Object.prototype;
function $u(t) {
  var n = t && t.constructor, e = typeof n == "function" && n.prototype || sb;
  return t === e;
}
function ub(t, n) {
  for (var e = -1, r = Array(t); ++e < t; )
    r[e] = n(e);
  return r;
}
var lb = "[object Arguments]";
function $o(t) {
  return Lt(t) && Bt(t) == lb;
}
var Nu = Object.prototype, cb = Nu.hasOwnProperty, fb = Nu.propertyIsEnumerable, ku = $o(/* @__PURE__ */ function() {
  return arguments;
}()) ? $o : function(t) {
  return Lt(t) && cb.call(t, "callee") && !fb.call(t, "callee");
};
function hb() {
  return !1;
}
var Tu = typeof exports == "object" && exports && !exports.nodeType && exports, No = Tu && typeof module == "object" && module && !module.nodeType && module, pb = No && No.exports === Tu, ko = pb ? wt.Buffer : void 0, db = ko ? ko.isBuffer : void 0, ai = db || hb, gb = "[object Arguments]", _b = "[object Array]", yb = "[object Boolean]", mb = "[object Date]", vb = "[object Error]", wb = "[object Function]", bb = "[object Map]", xb = "[object Number]", Mb = "[object Object]", Ab = "[object RegExp]", $b = "[object Set]", Nb = "[object String]", kb = "[object WeakMap]", Tb = "[object ArrayBuffer]", Sb = "[object DataView]", zb = "[object Float32Array]", Pb = "[object Float64Array]", Eb = "[object Int8Array]", Ob = "[object Int16Array]", Cb = "[object Int32Array]", Ib = "[object Uint8Array]", Rb = "[object Uint8ClampedArray]", jb = "[object Uint16Array]", qb = "[object Uint32Array]", P = {};
P[zb] = P[Pb] = P[Eb] = P[Ob] = P[Cb] = P[Ib] = P[Rb] = P[jb] = P[qb] = !0;
P[gb] = P[_b] = P[Tb] = P[yb] = P[Sb] = P[mb] = P[vb] = P[wb] = P[bb] = P[xb] = P[Mb] = P[Ab] = P[$b] = P[Nb] = P[kb] = !1;
function Fb(t) {
  return Lt(t) && Hi(t.length) && !!P[Bt(t)];
}
function Lb(t) {
  return function(n) {
    return t(n);
  };
}
var Su = typeof exports == "object" && exports && !exports.nodeType && exports, kn = Su && typeof module == "object" && module && !module.nodeType && module, Db = kn && kn.exports === Su, kr = Db && wu.process, To = function() {
  try {
    var t = kn && kn.require && kn.require("util").types;
    return t || kr && kr.binding && kr.binding("util");
  } catch {
  }
}(), So = To && To.isTypedArray, zu = So ? Lb(So) : Fb, Hb = Object.prototype, Bb = Hb.hasOwnProperty;
function Pu(t, n) {
  var e = G(t), r = !e && ku(t), i = !e && !r && ai(t), a = !e && !r && !i && zu(t), o = e || r || i || a, s = o ? ub(t.length, String) : [], l = s.length;
  for (var u in t)
    (n || Bb.call(t, u)) && !(o && // Safari 9 has enumerable `arguments.length` in strict mode.
    (u == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    i && (u == "offset" || u == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    a && (u == "buffer" || u == "byteLength" || u == "byteOffset") || // Skip index properties.
    rr(u, l))) && s.push(u);
  return s;
}
function Eu(t, n) {
  return function(e) {
    return t(n(e));
  };
}
var Xb = Eu(Object.keys, Object), Ub = Object.prototype, Yb = Ub.hasOwnProperty;
function Gb(t) {
  if (!$u(t))
    return Xb(t);
  var n = [];
  for (var e in Object(t))
    Yb.call(t, e) && e != "constructor" && n.push(e);
  return n;
}
function ar(t) {
  return Un(t) ? Pu(t) : Gb(t);
}
function Vb(t) {
  var n = [];
  if (t != null)
    for (var e in Object(t))
      n.push(e);
  return n;
}
var Kb = Object.prototype, Zb = Kb.hasOwnProperty;
function Wb(t) {
  if (!gt(t))
    return Vb(t);
  var n = $u(t), e = [];
  for (var r in t)
    r == "constructor" && (n || !Zb.call(t, r)) || e.push(r);
  return e;
}
function Jb(t) {
  return Un(t) ? Pu(t, !0) : Wb(t);
}
var Qb = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, tx = /^\w*$/;
function Bi(t, n) {
  if (G(t))
    return !1;
  var e = typeof t;
  return e == "number" || e == "symbol" || e == "boolean" || t == null || nr(t) ? !0 : tx.test(t) || !Qb.test(t) || n != null && t in Object(n);
}
var qn = Ut(Object, "create");
function nx() {
  this.__data__ = qn ? qn(null) : {}, this.size = 0;
}
function ex(t) {
  var n = this.has(t) && delete this.__data__[t];
  return this.size -= n ? 1 : 0, n;
}
var rx = "__lodash_hash_undefined__", ix = Object.prototype, ax = ix.hasOwnProperty;
function ox(t) {
  var n = this.__data__;
  if (qn) {
    var e = n[t];
    return e === rx ? void 0 : e;
  }
  return ax.call(n, t) ? n[t] : void 0;
}
var sx = Object.prototype, ux = sx.hasOwnProperty;
function lx(t) {
  var n = this.__data__;
  return qn ? n[t] !== void 0 : ux.call(n, t);
}
var cx = "__lodash_hash_undefined__";
function fx(t, n) {
  var e = this.__data__;
  return this.size += this.has(t) ? 0 : 1, e[t] = qn && n === void 0 ? cx : n, this;
}
function Dt(t) {
  var n = -1, e = t == null ? 0 : t.length;
  for (this.clear(); ++n < e; ) {
    var r = t[n];
    this.set(r[0], r[1]);
  }
}
Dt.prototype.clear = nx;
Dt.prototype.delete = ex;
Dt.prototype.get = ox;
Dt.prototype.has = lx;
Dt.prototype.set = fx;
function hx() {
  this.__data__ = [], this.size = 0;
}
function or(t, n) {
  for (var e = t.length; e--; )
    if (ir(t[e][0], n))
      return e;
  return -1;
}
var px = Array.prototype, dx = px.splice;
function gx(t) {
  var n = this.__data__, e = or(n, t);
  if (e < 0)
    return !1;
  var r = n.length - 1;
  return e == r ? n.pop() : dx.call(n, e, 1), --this.size, !0;
}
function _x(t) {
  var n = this.__data__, e = or(n, t);
  return e < 0 ? void 0 : n[e][1];
}
function yx(t) {
  return or(this.__data__, t) > -1;
}
function mx(t, n) {
  var e = this.__data__, r = or(e, t);
  return r < 0 ? (++this.size, e.push([t, n])) : e[r][1] = n, this;
}
function bt(t) {
  var n = -1, e = t == null ? 0 : t.length;
  for (this.clear(); ++n < e; ) {
    var r = t[n];
    this.set(r[0], r[1]);
  }
}
bt.prototype.clear = hx;
bt.prototype.delete = gx;
bt.prototype.get = _x;
bt.prototype.has = yx;
bt.prototype.set = mx;
var Fn = Ut(wt, "Map");
function vx() {
  this.size = 0, this.__data__ = {
    hash: new Dt(),
    map: new (Fn || bt)(),
    string: new Dt()
  };
}
function wx(t) {
  var n = typeof t;
  return n == "string" || n == "number" || n == "symbol" || n == "boolean" ? t !== "__proto__" : t === null;
}
function sr(t, n) {
  var e = t.__data__;
  return wx(n) ? e[typeof n == "string" ? "string" : "hash"] : e.map;
}
function bx(t) {
  var n = sr(this, t).delete(t);
  return this.size -= n ? 1 : 0, n;
}
function xx(t) {
  return sr(this, t).get(t);
}
function Mx(t) {
  return sr(this, t).has(t);
}
function Ax(t, n) {
  var e = sr(this, t), r = e.size;
  return e.set(t, n), this.size += e.size == r ? 0 : 1, this;
}
function xt(t) {
  var n = -1, e = t == null ? 0 : t.length;
  for (this.clear(); ++n < e; ) {
    var r = t[n];
    this.set(r[0], r[1]);
  }
}
xt.prototype.clear = vx;
xt.prototype.delete = bx;
xt.prototype.get = xx;
xt.prototype.has = Mx;
xt.prototype.set = Ax;
var $x = "Expected a function";
function Xi(t, n) {
  if (typeof t != "function" || n != null && typeof n != "function")
    throw new TypeError($x);
  var e = function() {
    var r = arguments, i = n ? n.apply(this, r) : r[0], a = e.cache;
    if (a.has(i))
      return a.get(i);
    var o = t.apply(this, r);
    return e.cache = a.set(i, o) || a, o;
  };
  return e.cache = new (Xi.Cache || xt)(), e;
}
Xi.Cache = xt;
var Nx = 500;
function kx(t) {
  var n = Xi(t, function(r) {
    return e.size === Nx && e.clear(), r;
  }), e = n.cache;
  return n;
}
var Tx = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Sx = /\\(\\)?/g, zx = kx(function(t) {
  var n = [];
  return t.charCodeAt(0) === 46 && n.push(""), t.replace(Tx, function(e, r, i, a) {
    n.push(i ? a.replace(Sx, "$1") : r || e);
  }), n;
});
function ur(t) {
  return t == null ? "" : xu(t);
}
function lr(t, n) {
  return G(t) ? t : Bi(t, n) ? [t] : zx(ur(t));
}
function Yn(t) {
  if (typeof t == "string" || nr(t))
    return t;
  var n = t + "";
  return n == "0" && 1 / t == -1 / 0 ? "-0" : n;
}
function Ui(t, n) {
  n = lr(n, t);
  for (var e = 0, r = n.length; t != null && e < r; )
    t = t[Yn(n[e++])];
  return e && e == r ? t : void 0;
}
function Px(t, n, e) {
  var r = t == null ? void 0 : Ui(t, n);
  return r === void 0 ? e : r;
}
function Ou(t, n) {
  for (var e = -1, r = n.length, i = t.length; ++e < r; )
    t[i + e] = n[e];
  return t;
}
var Ex = Eu(Object.getPrototypeOf, Object);
function Ox(t, n, e) {
  var r = -1, i = t.length;
  n < 0 && (n = -n > i ? 0 : i + n), e = e > i ? i : e, e < 0 && (e += i), i = n > e ? 0 : e - n >>> 0, n >>>= 0;
  for (var a = Array(i); ++r < i; )
    a[r] = t[r + n];
  return a;
}
function Cx(t, n, e) {
  var r = t.length;
  return e = e === void 0 ? r : e, Ox(t, n, e);
}
var Ix = "\\ud800-\\udfff", Rx = "\\u0300-\\u036f", jx = "\\ufe20-\\ufe2f", qx = "\\u20d0-\\u20ff", Fx = Rx + jx + qx, Lx = "\\ufe0e\\ufe0f", Dx = "\\u200d", Hx = RegExp("[" + Dx + Ix + Fx + Lx + "]");
function Cu(t) {
  return Hx.test(t);
}
function Bx(t) {
  return t.split("");
}
var Iu = "\\ud800-\\udfff", Xx = "\\u0300-\\u036f", Ux = "\\ufe20-\\ufe2f", Yx = "\\u20d0-\\u20ff", Gx = Xx + Ux + Yx, Vx = "\\ufe0e\\ufe0f", Kx = "[" + Iu + "]", oi = "[" + Gx + "]", si = "\\ud83c[\\udffb-\\udfff]", Zx = "(?:" + oi + "|" + si + ")", Ru = "[^" + Iu + "]", ju = "(?:\\ud83c[\\udde6-\\uddff]){2}", qu = "[\\ud800-\\udbff][\\udc00-\\udfff]", Wx = "\\u200d", Fu = Zx + "?", Lu = "[" + Vx + "]?", Jx = "(?:" + Wx + "(?:" + [Ru, ju, qu].join("|") + ")" + Lu + Fu + ")*", Qx = Lu + Fu + Jx, t2 = "(?:" + [Ru + oi + "?", oi, ju, qu, Kx].join("|") + ")", n2 = RegExp(si + "(?=" + si + ")|" + t2 + Qx, "g");
function e2(t) {
  return t.match(n2) || [];
}
function r2(t) {
  return Cu(t) ? e2(t) : Bx(t);
}
function i2(t) {
  return function(n) {
    n = ur(n);
    var e = Cu(n) ? r2(n) : void 0, r = e ? e[0] : n.charAt(0), i = e ? Cx(e, 1).join("") : n.slice(1);
    return r[t]() + i;
  };
}
var a2 = i2("toUpperCase");
function o2(t) {
  return a2(ur(t).toLowerCase());
}
function s2() {
  this.__data__ = new bt(), this.size = 0;
}
function u2(t) {
  var n = this.__data__, e = n.delete(t);
  return this.size = n.size, e;
}
function l2(t) {
  return this.__data__.get(t);
}
function c2(t) {
  return this.__data__.has(t);
}
var f2 = 200;
function h2(t, n) {
  var e = this.__data__;
  if (e instanceof bt) {
    var r = e.__data__;
    if (!Fn || r.length < f2 - 1)
      return r.push([t, n]), this.size = ++e.size, this;
    e = this.__data__ = new xt(r);
  }
  return e.set(t, n), this.size = e.size, this;
}
function ht(t) {
  var n = this.__data__ = new bt(t);
  this.size = n.size;
}
ht.prototype.clear = s2;
ht.prototype.delete = u2;
ht.prototype.get = l2;
ht.prototype.has = c2;
ht.prototype.set = h2;
function Du(t, n) {
  for (var e = -1, r = t == null ? 0 : t.length, i = 0, a = []; ++e < r; ) {
    var o = t[e];
    n(o, e, t) && (a[i++] = o);
  }
  return a;
}
function Hu() {
  return [];
}
var p2 = Object.prototype, d2 = p2.propertyIsEnumerable, zo = Object.getOwnPropertySymbols, Bu = zo ? function(t) {
  return t == null ? [] : (t = Object(t), Du(zo(t), function(n) {
    return d2.call(t, n);
  }));
} : Hu, g2 = Object.getOwnPropertySymbols, _2 = g2 ? function(t) {
  for (var n = []; t; )
    Ou(n, Bu(t)), t = Ex(t);
  return n;
} : Hu;
function Xu(t, n, e) {
  var r = n(t);
  return G(t) ? r : Ou(r, e(t));
}
function Po(t) {
  return Xu(t, ar, Bu);
}
function y2(t) {
  return Xu(t, Jb, _2);
}
var ui = Ut(wt, "DataView"), li = Ut(wt, "Promise"), ci = Ut(wt, "Set"), Eo = "[object Map]", m2 = "[object Object]", Oo = "[object Promise]", Co = "[object Set]", Io = "[object WeakMap]", Ro = "[object DataView]", v2 = Xt(ui), w2 = Xt(Fn), b2 = Xt(li), x2 = Xt(ci), M2 = Xt(ii), ct = Bt;
(ui && ct(new ui(new ArrayBuffer(1))) != Ro || Fn && ct(new Fn()) != Eo || li && ct(li.resolve()) != Oo || ci && ct(new ci()) != Co || ii && ct(new ii()) != Io) && (ct = function(t) {
  var n = Bt(t), e = n == m2 ? t.constructor : void 0, r = e ? Xt(e) : "";
  if (r)
    switch (r) {
      case v2:
        return Ro;
      case w2:
        return Eo;
      case b2:
        return Oo;
      case x2:
        return Co;
      case M2:
        return Io;
    }
  return n;
});
var jo = wt.Uint8Array, A2 = "__lodash_hash_undefined__";
function $2(t) {
  return this.__data__.set(t, A2), this;
}
function N2(t) {
  return this.__data__.has(t);
}
function Fe(t) {
  var n = -1, e = t == null ? 0 : t.length;
  for (this.__data__ = new xt(); ++n < e; )
    this.add(t[n]);
}
Fe.prototype.add = Fe.prototype.push = $2;
Fe.prototype.has = N2;
function k2(t, n) {
  for (var e = -1, r = t == null ? 0 : t.length; ++e < r; )
    if (n(t[e], e, t))
      return !0;
  return !1;
}
function T2(t, n) {
  return t.has(n);
}
var S2 = 1, z2 = 2;
function Uu(t, n, e, r, i, a) {
  var o = e & S2, s = t.length, l = n.length;
  if (s != l && !(o && l > s))
    return !1;
  var u = a.get(t), c = a.get(n);
  if (u && c)
    return u == n && c == t;
  var h = -1, f = !0, p = e & z2 ? new Fe() : void 0;
  for (a.set(t, n), a.set(n, t); ++h < s; ) {
    var d = t[h], _ = n[h];
    if (r)
      var w = o ? r(_, d, h, n, t, a) : r(d, _, h, t, n, a);
    if (w !== void 0) {
      if (w)
        continue;
      f = !1;
      break;
    }
    if (p) {
      if (!k2(n, function(y, M) {
        if (!T2(p, M) && (d === y || i(d, y, e, r, a)))
          return p.push(M);
      })) {
        f = !1;
        break;
      }
    } else if (!(d === _ || i(d, _, e, r, a))) {
      f = !1;
      break;
    }
  }
  return a.delete(t), a.delete(n), f;
}
function Yu(t) {
  var n = -1, e = Array(t.size);
  return t.forEach(function(r, i) {
    e[++n] = [i, r];
  }), e;
}
function P2(t) {
  var n = -1, e = Array(t.size);
  return t.forEach(function(r) {
    e[++n] = r;
  }), e;
}
var E2 = 1, O2 = 2, C2 = "[object Boolean]", I2 = "[object Date]", R2 = "[object Error]", j2 = "[object Map]", q2 = "[object Number]", F2 = "[object RegExp]", L2 = "[object Set]", D2 = "[object String]", H2 = "[object Symbol]", B2 = "[object ArrayBuffer]", X2 = "[object DataView]", qo = kt ? kt.prototype : void 0, Tr = qo ? qo.valueOf : void 0;
function U2(t, n, e, r, i, a, o) {
  switch (e) {
    case X2:
      if (t.byteLength != n.byteLength || t.byteOffset != n.byteOffset)
        return !1;
      t = t.buffer, n = n.buffer;
    case B2:
      return !(t.byteLength != n.byteLength || !a(new jo(t), new jo(n)));
    case C2:
    case I2:
    case q2:
      return ir(+t, +n);
    case R2:
      return t.name == n.name && t.message == n.message;
    case F2:
    case D2:
      return t == n + "";
    case j2:
      var s = Yu;
    case L2:
      var l = r & E2;
      if (s || (s = P2), t.size != n.size && !l)
        return !1;
      var u = o.get(t);
      if (u)
        return u == n;
      r |= O2, o.set(t, n);
      var c = Uu(s(t), s(n), r, i, a, o);
      return o.delete(t), c;
    case H2:
      if (Tr)
        return Tr.call(t) == Tr.call(n);
  }
  return !1;
}
var Y2 = 1, G2 = Object.prototype, V2 = G2.hasOwnProperty;
function K2(t, n, e, r, i, a) {
  var o = e & Y2, s = Po(t), l = s.length, u = Po(n), c = u.length;
  if (l != c && !o)
    return !1;
  for (var h = l; h--; ) {
    var f = s[h];
    if (!(o ? f in n : V2.call(n, f)))
      return !1;
  }
  var p = a.get(t), d = a.get(n);
  if (p && d)
    return p == n && d == t;
  var _ = !0;
  a.set(t, n), a.set(n, t);
  for (var w = o; ++h < l; ) {
    f = s[h];
    var y = t[f], M = n[f];
    if (r)
      var A = o ? r(M, y, f, n, t, a) : r(y, M, f, t, n, a);
    if (!(A === void 0 ? y === M || i(y, M, e, r, a) : A)) {
      _ = !1;
      break;
    }
    w || (w = f == "constructor");
  }
  if (_ && !w) {
    var g = t.constructor, v = n.constructor;
    g != v && "constructor" in t && "constructor" in n && !(typeof g == "function" && g instanceof g && typeof v == "function" && v instanceof v) && (_ = !1);
  }
  return a.delete(t), a.delete(n), _;
}
var Z2 = 1, Fo = "[object Arguments]", Lo = "[object Array]", ae = "[object Object]", W2 = Object.prototype, Do = W2.hasOwnProperty;
function J2(t, n, e, r, i, a) {
  var o = G(t), s = G(n), l = o ? Lo : ct(t), u = s ? Lo : ct(n);
  l = l == Fo ? ae : l, u = u == Fo ? ae : u;
  var c = l == ae, h = u == ae, f = l == u;
  if (f && ai(t)) {
    if (!ai(n))
      return !1;
    o = !0, c = !1;
  }
  if (f && !c)
    return a || (a = new ht()), o || zu(t) ? Uu(t, n, e, r, i, a) : U2(t, n, l, e, r, i, a);
  if (!(e & Z2)) {
    var p = c && Do.call(t, "__wrapped__"), d = h && Do.call(n, "__wrapped__");
    if (p || d) {
      var _ = p ? t.value() : t, w = d ? n.value() : n;
      return a || (a = new ht()), i(_, w, e, r, a);
    }
  }
  return f ? (a || (a = new ht()), K2(t, n, e, r, i, a)) : !1;
}
function Yi(t, n, e, r, i) {
  return t === n ? !0 : t == null || n == null || !Lt(t) && !Lt(n) ? t !== t && n !== n : J2(t, n, e, r, Yi, i);
}
var Q2 = 1, tM = 2;
function nM(t, n, e, r) {
  var i = e.length, a = i;
  if (t == null)
    return !a;
  for (t = Object(t); i--; ) {
    var o = e[i];
    if (o[2] ? o[1] !== t[o[0]] : !(o[0] in t))
      return !1;
  }
  for (; ++i < a; ) {
    o = e[i];
    var s = o[0], l = t[s], u = o[1];
    if (o[2]) {
      if (l === void 0 && !(s in t))
        return !1;
    } else {
      var c = new ht(), h;
      if (!(h === void 0 ? Yi(u, l, Q2 | tM, r, c) : h))
        return !1;
    }
  }
  return !0;
}
function Gu(t) {
  return t === t && !gt(t);
}
function eM(t) {
  for (var n = ar(t), e = n.length; e--; ) {
    var r = n[e], i = t[r];
    n[e] = [r, i, Gu(i)];
  }
  return n;
}
function Vu(t, n) {
  return function(e) {
    return e == null ? !1 : e[t] === n && (n !== void 0 || t in Object(e));
  };
}
function rM(t) {
  var n = eM(t);
  return n.length == 1 && n[0][2] ? Vu(n[0][0], n[0][1]) : function(e) {
    return e === t || nM(e, t, n);
  };
}
function iM(t, n) {
  return t != null && n in Object(t);
}
function Ku(t, n, e) {
  n = lr(n, t);
  for (var r = -1, i = n.length, a = !1; ++r < i; ) {
    var o = Yn(n[r]);
    if (!(a = t != null && e(t, o)))
      break;
    t = t[o];
  }
  return a || ++r != i ? a : (i = t == null ? 0 : t.length, !!i && Hi(i) && rr(o, i) && (G(t) || ku(t)));
}
function aM(t, n) {
  return t != null && Ku(t, n, iM);
}
var oM = 1, sM = 2;
function uM(t, n) {
  return Bi(t) && Gu(n) ? Vu(Yn(t), n) : function(e) {
    var r = Px(e, t);
    return r === void 0 && r === n ? aM(e, t) : Yi(n, r, oM | sM);
  };
}
function lM(t) {
  return function(n) {
    return n == null ? void 0 : n[t];
  };
}
function cM(t) {
  return function(n) {
    return Ui(n, t);
  };
}
function fM(t) {
  return Bi(t) ? lM(Yn(t)) : cM(t);
}
function cr(t) {
  return typeof t == "function" ? t : t == null ? Mu : typeof t == "object" ? G(t) ? uM(t[0], t[1]) : rM(t) : fM(t);
}
function hM(t) {
  return function(n, e, r) {
    for (var i = -1, a = Object(n), o = r(n), s = o.length; s--; ) {
      var l = o[++i];
      if (e(a[l], l, a) === !1)
        break;
    }
    return n;
  };
}
var pM = hM();
function dM(t, n) {
  return t && pM(t, n, ar);
}
function gM(t, n) {
  return function(e, r) {
    if (e == null)
      return e;
    if (!Un(e))
      return t(e, r);
    for (var i = e.length, a = -1, o = Object(e); ++a < i && r(o[a], a, o) !== !1; )
      ;
    return e;
  };
}
var Gi = gM(dM);
function _M(t) {
  return typeof t == "function" ? t : Mu;
}
function Nt(t, n) {
  var e = G(t) ? Jw : Gi;
  return e(t, _M(n));
}
function yM(t, n) {
  return er(n, function(e) {
    return [e, t[e]];
  });
}
function mM(t) {
  var n = -1, e = Array(t.size);
  return t.forEach(function(r) {
    e[++n] = [r, r];
  }), e;
}
var vM = "[object Map]", wM = "[object Set]";
function bM(t) {
  return function(n) {
    var e = ct(n);
    return e == vM ? Yu(n) : e == wM ? mM(n) : yM(n, t(n));
  };
}
var Zu = bM(ar);
function xM(t, n) {
  var e = [];
  return Gi(t, function(r, i, a) {
    n(r, i, a) && e.push(r);
  }), e;
}
function Wu(t, n) {
  var e = G(t) ? Du : xM;
  return e(t, cr(n));
}
function MM(t, n) {
  var e = -1, r = Un(t) ? Array(t.length) : [];
  return Gi(t, function(i, a, o) {
    r[++e] = n(i, a, o);
  }), r;
}
function dn(t, n) {
  var e = G(t) ? er : MM;
  return e(t, cr(n));
}
var AM = Object.prototype, $M = AM.hasOwnProperty;
function NM(t, n) {
  return t != null && $M.call(t, n);
}
function Ju(t, n) {
  return t != null && Ku(t, n, NM);
}
var kM = "[object Boolean]";
function TM(t) {
  return t === !0 || t === !1 || Lt(t) && Bt(t) == kM;
}
function SM(t, n) {
  for (var e, r = -1, i = t.length; ++r < i; ) {
    var a = n(t[r]);
    a !== void 0 && (e = e === void 0 ? a : e + a);
  }
  return e;
}
var zM = NaN;
function PM(t, n) {
  var e = t == null ? 0 : t.length;
  return e ? SM(t, n) / e : zM;
}
function fn(t, n) {
  return PM(t, cr(n));
}
function EM(t, n, e, r) {
  if (!gt(t))
    return t;
  n = lr(n, t);
  for (var i = -1, a = n.length, o = a - 1, s = t; s != null && ++i < a; ) {
    var l = Yn(n[i]), u = e;
    if (l === "__proto__" || l === "constructor" || l === "prototype")
      return t;
    if (i != o) {
      var c = s[l];
      u = void 0, u === void 0 && (u = gt(c) ? c : rr(n[i + 1]) ? [] : {});
    }
    ib(s, l, u), s = s[l];
  }
  return t;
}
function OM(t, n, e) {
  for (var r = -1, i = n.length, a = {}; ++r < i; ) {
    var o = n[r], s = Ui(t, o);
    e(s, o) && EM(a, lr(o, t), s);
  }
  return a;
}
function Vi(t, n) {
  if (t == null)
    return {};
  var e = er(y2(t), function(r) {
    return [r];
  });
  return n = cr(n), OM(t, e, function(r, i) {
    return n(r, i[0]);
  });
}
var CM = Math.ceil, IM = Math.max;
function RM(t, n, e, r) {
  for (var i = -1, a = IM(CM((n - t) / (e || 1)), 0), o = Array(a); a--; )
    o[++i] = t, t += e;
  return o;
}
function jM(t) {
  return function(n, e, r) {
    return r && typeof r != "number" && ob(n, e, r) && (e = r = void 0), n = $r(n), e === void 0 ? (e = n, n = 0) : e = $r(e), r = r === void 0 ? n < e ? 1 : -1 : $r(r), RM(n, e, r);
  };
}
var fi = jM();
function qM() {
  var t = arguments, n = ur(t[0]);
  return t.length < 3 ? n : n.replace(t[1], t[2]);
}
const N = {
  widgets: {
    slider_size: 200,
    slider_gap: 1.5,
    slider_anchor: { x: 6, y: 1 },
    toggle_anchor: { x: 6, y: 8 },
    toggle_label_pos: "right",
    toggle_gap: 1.5,
    playbutton_size: 120,
    playbutton_anchor: { x: 3, y: 2 },
    backbutton_anchor: { x: 4, y: 5 },
    resetbutton_anchor: { x: 2, y: 5 },
    radio_anchor: { x: 1, y: 6.5 },
    radio_size: 40,
    radio_label_position: "right",
    radio_shape: "rect"
  },
  simulation: {
    delay: 10
  },
  plot: {
    anchor: { x: 1, y: 11 },
    width: 150,
    domain: [0, 1e3],
    xlabel: "time",
    ylabel: "order parameter"
  }
}, b = {
  dt: 5e-3,
  L: 1,
  agentsize: [6, 3],
  omega_0: 1,
  omega_var: 0.2,
  r_var: 0.2,
  orderparametersize: 6,
  orderparameterlength: 0.5,
  angular_speed: {
    range: [1, 4],
    default: 3
  },
  coupling_strength: {
    range: [0, 2],
    default: 0
  },
  number_of_oscillators: {
    range: [1, 200],
    default: 100
  },
  angular_speed_variability: {
    range: [0, 1],
    default: 0.672
  },
  initial_conditions: {
    choices: ["random init. cond.", "identical init. cond."],
    default: 0
  },
  show_order_parameter: {
    default: !0
  },
  comoving_reference_frame: {
    default: !1
  },
  comoving_reference_frame: {
    default: !1
  },
  orlis_magic_switch: {
    default: !1,
    label: "Orli's Magic Switch"
  }
}, Ki = (t) => dn(Zu(t), (n) => {
  n[1].id = n[0], n[1].label == null && (n[1].label = qM(o2(n[0]), /_/g, " "));
}), Zi = (t) => dn(Zu(t), (n) => n[1]), Wi = (t, n) => Nt(t, (e, r) => e.widget = n[r]), FM = (t) => Vi(t, (n) => Ju(n, "range")), LM = (t) => Vi(t, (n) => TM(n.default)), DM = (t) => Vi(t, (n) => Ju(n, "choices"));
_t().domain([0, 360]).range([0, 2 * Math.PI]);
_t().range([0, 360]).domain([0, 2 * Math.PI]);
const Ji = FM(b), Qi = LM(b), ta = DM(b);
Ki(Ji);
Ki(Qi);
Ki(ta);
const Qu = Zi(Ji), tl = Zi(Qi), nl = Zi(ta), de = dn(
  Qu,
  (t) => V1().id(t.id).label(t.label).range(t.range).value(t.default).size(N.widgets.slider_size)
), ge = dn(
  tl,
  (t) => K1().id(t.id).label(t.label).value(t.default).labelposition(N.widgets.toggle_label_pos)
), hi = dn(
  nl,
  (t) => Z1().choices(t.choices).id(t.id).value(t.default).labelposition(N.widgets.radio_label_position)
);
Wi(tl, ge);
Wi(Qu, de);
Wi(nl, hi);
const At = Di().actions(["play", "pause"]), fr = Di().actions(["back"]), hr = Di().actions(["rewind"]), HM = [At, fr, hr], BM = (t, n) => {
  const e = n.position(N.widgets.slider_anchor.x, fi(de.length).map((a) => N.widgets.slider_anchor.y + N.widgets.slider_gap * a)), r = n.position(N.widgets.toggle_anchor.x, fi(ge.length).map((a) => N.widgets.toggle_anchor.y + N.widgets.toggle_gap * a)), i = n.position(N.widgets.radio_anchor.x, N.widgets.radio_anchor.y);
  de.forEach((a, o) => a.position(e[o])), ge.forEach((a, o) => a.position(r[o])), hi[0].position(i).size(N.widgets.radio_size).shape(N.widgets.radio_shape), At.position(n.position(N.widgets.playbutton_anchor.x, N.widgets.playbutton_anchor.y)).size(N.widgets.playbutton_size), hr.position(n.position(N.widgets.backbutton_anchor.x, N.widgets.backbutton_anchor.y)), fr.position(n.position(N.widgets.resetbutton_anchor.x, N.widgets.resetbutton_anchor.y)), t.selectAll(null).data(de).enter().append(ie), t.selectAll(null).data(ge).enter().append(ie), t.selectAll(null).data(HM).enter().append(ie), t.selectAll(null).data(hi).enter().append(ie);
}, XM = (t) => {
  Nt(Ji, (n) => n.widget.reset(t, n.default)), Nt(Qi, (n) => n.widget.reset(t, n.default)), Nt(ta, (n) => n.widget.reset(t, n.default));
}, UM = b.dt, YM = b.L, Ho = b.r_var;
var L = [], $t = [], Jt, q;
const GM = pp(0, b.omega_var), VM = 2 * b.number_of_oscillators.range[1];
function el(t) {
  return {
    x: fn(t, "x"),
    y: fn(t, "y")
  };
}
const KM = () => {
  b.timer = {}, b.tick = 0, L = dn(fi(VM), (t) => {
    const n = GM(), e = b.initial_conditions.widget.value() ? 0 : 2 * Math.PI * Math.random();
    return {
      id: t,
      r: YM - Ho + Ho * (Math.random() - 0.5),
      theta: e,
      domega: n,
      omega: b.omega_0 + n * b.angular_speed_variability.widget.value(),
      x: Math.cos(e),
      y: Math.sin(e)
    };
  });
  for (let t = 0; t < L.length / 2; t++)
    L[t].domega = -L[L.length - t - 1].domega, L[L.length - t - 1].id = L[t].id;
  Nt(L, (t) => {
    t.active = t.id < b.number_of_oscillators.widget.value() ? 1 : 0;
  }), $t = Wu(L, (t) => t.active == 1), q = el($t), Jt = [{ x: b.tick, y: Math.sqrt(q.x * q.x + q.y * q.y) }];
}, ZM = () => {
  b.tick++, $t = Wu(L, (n) => n.active == 1);
  const t = { x: fn($t, "x"), y: fn($t, "y") };
  Nt(L, (n) => {
    n.dx = n.active == 1 ? Math.cos(n.theta) * t.y - Math.sin(n.theta) * t.x : 0;
  }), Nt(L, (n) => {
    n.omega = b.omega_0 + n.domega * b.angular_speed_variability.widget.value(), n.omega = b.omega_0 + n.domega * b.angular_speed_variability.widget.value(), n.dtheta = UM * b.angular_speed.widget.value() * (n.omega + b.coupling_strength.widget.value() * n.dx), n.theta += n.dtheta, n.x = Math.cos(n.theta), n.y = Math.sin(n.theta);
  }), q = el($t), Jt.push({ x: b.tick, y: Math.sqrt(q.x * q.x + q.y * q.y) });
}, WM = () => {
  Nt(L, (t) => {
    t.active = t.id < b.number_of_oscillators.widget.value() ? 1 : 0;
  });
}, Le = b.L, JM = 2 * b.number_of_oscillators.range[1], Qt = _t().domain([-Le, Le]), tn = _t().domain([-Le, Le]), na = _t().domain([0, JM / 2]).range(b.agentsize), ea = _t().range([0, 0.9]).domain([b.omega_0 - b.omega_var, b.omega_0 + b.omega_var]), ra = (t) => b.orlis_magic_switch.widget.value() ? Np(t) : Tp(t), _e = Ns().x(function(t) {
  return Qt(t.x);
}).y(function(t) {
  return tn(t.y);
});
var ye = 0;
const QM = (t, n) => {
  const e = n.display_size.width, r = n.display_size.height;
  Qt.range([-e / 2, e / 2]), tn.range([r / 2, -r / 2]), t.selectAll("#zero").remove(), ye = 0;
  const a = t.append("g").attr("id", "zero").attr("transform", "translate(" + e / 2 + "," + r / 2 + ")").append("g").attr("id", "origin");
  a.selectAll("." + E.agent).data(L).enter().append("circle").attr("class", E.agent).attr("r", function(s) {
    return na(b.number_of_oscillators.widget.value());
  }).style("fill", function(s) {
    return ra(ea(s.omega));
  }).attr("transform", function(s) {
    return "translate(" + Qt(s.r * Math.cos(s.theta)) + "," + tn(s.r * Math.sin(s.theta)) + ")";
  }).style("opacity", function(s) {
    return s.active ? 1 : 0;
  });
  const o = a.append("g").attr("class", E.inset).style("opacity", b.show_order_parameter.widget.value() ? 1 : 0);
  o.append("path").datum([{ x: -b.orderparameterlength, y: 0 }, { x: b.orderparameterlength, y: 0 }]).attr("d", _e).attr("class", E.caxis), o.append("path").datum([{ x: 0, y: -b.orderparameterlength }, { x: 0, y: b.orderparameterlength }]).attr("d", _e).attr("class", E.caxis), o.append("circle").attr("class", E.dot).attr("r", b.orderparametersize).attr("transform", "translate(" + Qt(b.orderparameterlength * q.x) + "," + tn(b.orderparameterlength * q.y) + ")"), o.append("path").datum(
    [
      { x: 0, y: 0 },
      { x: b.orderparameterlength * q.x, y: b.orderparameterlength * q.y }
    ]
  ).attr("class", E.op).attr("d", _e);
}, tA = (t, n) => {
  t.selectAll("." + E.agent).attr("r", function(e) {
    return na(b.number_of_oscillators.widget.value());
  }).style("opacity", function(e) {
    return e.active ? 1 : 0;
  }).attr("transform", function(e) {
    return "translate(" + Qt(e.r * Math.cos(e.theta)) + "," + tn(e.r * Math.sin(e.theta)) + ")";
  }).style("fill", function(e) {
    return ra(ea(e.omega));
  }), fn($t, "omega"), b.comoving_reference_frame.widget.value() ? ye += b.dt * b.angular_speed.widget.value() * fn($t, "omega") / Math.PI * 180 : ye += 0, t.select("." + E.dot).attr("transform", "translate(" + Qt(b.orderparameterlength * q.x) + "," + tn(b.orderparameterlength * q.y) + ")"), t.select("." + E.op).datum(
    [
      { x: 0, y: 0 },
      { x: b.orderparameterlength * q.x, y: b.orderparameterlength * q.y }
    ]
  ).attr("class", E.op).attr("d", _e), t.selectAll("#origin").attr("transform", "rotate(" + ye + ")");
}, nA = (t, n) => {
  t.selectAll("." + E.agent).attr("r", function(e) {
    return na(b.number_of_oscillators.widget.value());
  }).style("opacity", function(e) {
    return e.active ? 1 : 0;
  }).style("fill", function(e) {
    return ra(ea(e.omega));
  });
}, Ln = _t().domain(N.plot.domain).range([0, N.plot.width]), ia = _t().domain([0, 1]).range([0, -100]), rl = Ml(Ln).tickFormat(""), eA = Al(ia).tickFormat(""), il = Ns().x(function(t) {
  return Ln(t.x);
}).y(function(t) {
  return ia(t.y);
}), rA = (t, n) => {
  Ln.domain(N.plot.domain);
  const e = n.position(N.plot.anchor.x, N.plot.anchor.y);
  t.select("#plot").remove();
  const r = t.append("g").attr("class", E.plot).attr("transform", "translate(" + e.x + "," + e.y + ")").attr("id", "plot");
  r.append("text").text(N.plot.xlabel).attr("transform", "translate(" + Ln(N.plot.domain[1] / 2) + ",25)").attr("class", E.xlabel), r.append("text").text(N.plot.ylabel).attr("transform", "translate(-20," + ia(0.5) + ")rotate(-90)").attr("class", E.ylabel), r.append("g").call(rl).attr("class", E.xaxis), r.append("g").call(eA).attr("class", E.yaxis), r.append("path").datum(Jt).attr("d", il).attr("class", E.plotline);
}, al = (t) => {
  t.select("." + E.plotline).datum(Jt).attr("d", il), Jt.length > N.plot.domain[1] && (Ln.domain([b.tick - N.plot.domain[1], b.tick]), t.select("." + E.xaxis).call(rl), Jt.shift());
};
function iA(t, n, e) {
  ZM(), tA(t), al(n);
}
function pi(t, n, e, r) {
  KM(), QM(t, r), rA(n, e);
}
function Bo(t, n, e) {
  WM(), nA(t), al(n);
}
var Xo = {};
const aA = (t, n, e) => {
  At.value() == 1 ? Xo = Bf(() => iA(t, n), N.simulation.delay) : Xo.stop();
}, oA = (t, n, e, r) => {
  hr.update(() => XM(n)), At.update(() => aA(t, n)), fr.update(() => pi(t, n, e, r)), b.number_of_oscillators.widget.update(() => Bo(t, n)), b.orlis_magic_switch.widget.update(() => Bo(t, n)), b.initial_conditions.widget.update(() => pi(t, n, e, r)), b.show_order_parameter.widget.update(() => {
    t.selectAll("." + E.inset).transition().duration(1e3).style("opacity", b.show_order_parameter.widget.value() ? 1 : 0), n.selectAll("." + E.plot).transition().duration(1e3).style("opacity", b.show_order_parameter.widget.value() ? 1 : 0);
  });
}, sA = {
  name: "@explorables/ride_my_kuramotocycle",
  title: "Ride my Kuramotocycle!",
  subtitle: "Synchronization of Phase-Coupled Oscillators - The Kuramoto Model",
  description: "This explorable illustrates the Kuramoto model for phase coupled oscillators. This model is used to describe synchronization phenomena in natural systems, e.g. the flash synchronization of fire flies or wall-mounted clocks.",
  author: "Dirk Brockmann (https://synosy.github.io)"
};
function uA(t, n = ol) {
  const e = dw(t, n), r = e.display, i = e.controls, a = e.grid;
  return BM(i, a), oA(r, i, a, n), pi(r, i, a, n), {
    halt() {
      At.value() === 1 && At.press(i);
    },
    reset() {
      At.value() === 1 && At.press(i), hr.press(i), fr.press(i);
    },
    config: n,
    meta: sA
  };
}
export {
  ol as config,
  uA as default,
  uA as load,
  sA as meta
};
