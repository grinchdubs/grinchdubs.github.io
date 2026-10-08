/* Home hero: a quaternion Julia set, raymarched in WebGL2, played from the control panel.
   GRNCH has worked with Julia sets before (Digital Art: "Julia fractal spinning in space"; plots: "Julia Xperiments"). */
(function () {
  "use strict";

  var canvas = document.getElementById("julia");
  var panel = document.getElementById("panel");
  if (!canvas) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var root = document.documentElement;

  var PRESETS = [
    [-0.291, -0.399, 0.339, 0.437],
    [-0.2, 0.6, 0.2, 0.2],
    [-0.137, -0.63, -0.475, -0.046],
    [-0.218, -0.113, -0.181, -0.496]
  ];

  var params = { cx: PRESETS[0][0], cy: PRESETS[0][1], cz: PRESETS[0][2], cw: PRESETS[0][3], morph: 0.5, spin: 0.25, detail: 0.6, hue: 5 };
  try { var savedHue = localStorage.getItem("grnch-hue"); if (savedHue !== null) params.hue = +savedHue; } catch (e) {}

  /* ---------- controls ---------- */

  var inputs = panel ? Array.prototype.slice.call(panel.querySelectorAll("input[data-param]")) : [];
  var presetBtns = panel ? Array.prototype.slice.call(panel.querySelectorAll("[data-preset]")) : [];

  function fmt(name, v) {
    if (name === "hue") return Math.round(v) + "°";
    if (name.charAt(0) === "c") return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(3);
    return Math.round(v * 100) + "%";
  }

  function syncInputs() {
    inputs.forEach(function (inp) {
      var n = inp.dataset.param;
      inp.value = params[n];
      inp.nextElementSibling.textContent = fmt(n, params[n]);
    });
  }

  function applyHue() {
    root.style.setProperty("--accent-h", Math.round(params.hue));
    try { localStorage.setItem("grnch-hue", String(Math.round(params.hue))); } catch (e) {}
  }

  inputs.forEach(function (inp) {
    inp.addEventListener("input", function () {
      var n = inp.dataset.param;
      params[n] = parseFloat(inp.value);
      inp.nextElementSibling.textContent = fmt(n, params[n]);
      if (n === "hue") applyHue();
      if (n.charAt(0) === "c") {
        presetBtns.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        tween = null;
      }
      requestFrame();
    });
  });

  var tween = null;
  presetBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var i = +btn.dataset.preset, to = PRESETS[i];
      presetBtns.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      tween = { from: [params.cx, params.cy, params.cz, params.cw], to: to, t0: performance.now(), dur: reduced.matches ? 1 : 1400 };
      if (window.GRNCH_SOUND) window.GRNCH_SOUND.select(i);
      requestFrame();
    });
  });

  var tab = document.getElementById("panelTab");
  if (tab) {
    var narrow = window.matchMedia("(max-width: 52rem)");
    var setOpen = function (open) {
      panel.classList.toggle("is-closed", !open);
      tab.setAttribute("aria-expanded", open ? "true" : "false");
    };
    setOpen(!narrow.matches);
    tab.addEventListener("click", function () { setOpen(panel.classList.contains("is-closed")); });
  }

  syncInputs();
  applyHue();

  /* ---------- WebGL ---------- */

  var gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "high-performance" });
  if (!gl) { root.classList.add("no-webgl"); return; }

  var VERT = "#version 300 es\nin vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }";
  var FRAG = [
    "#version 300 es",
    "precision highp float;",
    "uniform vec2 uRes; uniform float uTime; uniform vec4 uC; uniform float uAng;",
    "uniform float uDetail; uniform vec3 uAccent; uniform float uLevel; uniform float uShift; uniform float uZoom;",
    "out vec4 outColor;",

    "vec4 qsqr(vec4 a){ return vec4(a.x*a.x - a.y*a.y - a.z*a.z - a.w*a.w, 2.0*a.x*a.y, 2.0*a.x*a.z, 2.0*a.x*a.w); }",

    "float map(vec3 p, out vec4 trap){",
    "  vec4 z = vec4(p, 0.0);",
    "  float md2 = 1.0, mz2 = dot(z, z);",
    "  trap = vec4(abs(z.xyz), mz2);",
    "  for (int i = 0; i < 11; i++){",
    "    md2 *= 4.0 * mz2;",
    "    z = qsqr(z) + uC;",
    "    mz2 = dot(z, z);",
    "    trap = min(trap, vec4(abs(z.xyz), mz2));",
    "    if (mz2 > 4.0) break;",
    "  }",
    "  return 0.25 * sqrt(mz2 / md2) * log(mz2);",
    "}",

    "vec3 normalAt(vec3 p){",
    "  vec4 t; const vec2 k = vec2(1.0, -1.0); float e = 0.0008;",
    "  return normalize(k.xyy * map(p + k.xyy * e, t) + k.yyx * map(p + k.yyx * e, t) + k.yxy * map(p + k.yxy * e, t) + k.xxx * map(p + k.xxx * e, t));",
    "}",

    "void main(){",
    "  vec2 uv = (2.0 * gl_FragCoord.xy - uRes) / uRes.y;",
    "  uv.x -= uShift;",
    "  uv /= uZoom;",
    "  float ca = cos(uAng), sa = sin(uAng);",
    "  vec3 ro = vec3(3.1 * sa, 0.9, 3.1 * ca);",
    "  vec3 fw = normalize(-ro), rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0))), up = cross(rt, fw);",
    "  vec3 rd = normalize(uv.x * rt + uv.y * up + 2.1 * fw);",

    "  vec3 bg = vec3(0.043, 0.043, 0.047) + uAccent * 0.05 * exp(-dot(uv, uv) * 0.9);",
    "  vec3 col = bg;",

    "  float b = dot(ro, rd), c = dot(ro, ro) - 2.6;",   // bounding sphere r^2 = 2.6
    "  float h = b * b - c;",
    "  float glow = 0.0;",
    "  if (h > 0.0){",
    "    float t = max(0.0, -b - sqrt(h)), tmax = -b + sqrt(h);",
    "    vec4 trap; bool hit = false;",
    "    int steps = int(mix(110.0, 260.0, uDetail));",
    "    float eps = mix(0.0016, 0.0003, uDetail);",
    "    for (int i = 0; i < 260; i++){",
    "      if (i >= steps) break;",
    "      vec3 p = ro + rd * t;",
    "      float d = map(p, trap);",
    "      glow += exp(-d * 40.0) * 0.012;",
    "      if (d < eps * t){ hit = true; break; }",
    "      t += d * 0.85;",
    "      if (t > tmax) break;",
    "    }",
    "    if (hit){",
    "      vec3 p = ro + rd * t, n = normalAt(p);",
    "      vec3 L = normalize(vec3(0.6, 0.8, -0.4));",
    "      float dif = clamp(dot(n, L), 0.0, 1.0);",
    "      float spec = pow(clamp(dot(reflect(rd, n), L), 0.0, 1.0), 28.0);",
    "      float fres = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);",
    "      float occ = clamp(trap.w * 2.2, 0.0, 1.0);",
    "      vec3 base = mix(vec3(0.82, 0.80, 0.76), uAccent, smoothstep(0.15, 0.75, trap.y));",
    "      base = mix(base, vec3(0.11, 0.11, 0.12), smoothstep(0.55, 0.0, trap.x) * 0.6);",
    "      col = base * (0.08 + 0.85 * dif * occ) + spec * 0.6 * occ + uAccent * fres * 0.8;",
    "      col = mix(col, bg, 1.0 - exp(-0.02 * t * t));",
    "    }",
    "  }",
    "  col += uAccent * glow * (0.35 + uLevel * 1.5);",
    "  vec2 q = gl_FragCoord.xy / uRes - 0.5;",
    "  col *= 1.0 - dot(q, q) * 0.7;",
    "  col = pow(col, vec3(0.92));",
    "  outColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { root.classList.add("no-webgl"); return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "aPos");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); root.classList.add("no-webgl"); return; }
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  ["uRes", "uTime", "uC", "uAng", "uDetail", "uAccent", "uLevel", "uShift", "uZoom"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  function hslToRgb(h, s, l) {
    var a = s * Math.min(l, 1 - l);
    function f(n) { var k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }
    return [f(0), f(8), f(4)];
  }

  var W = 0, H = 0, shift = 0, zoom = 1;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cw = canvas.clientWidth, ch = canvas.clientHeight;
    var s = dpr * 0.8, maxPx = 1500000;
    if (cw * ch * s * s > maxPx) s = Math.sqrt(maxPx / (cw * ch));
    W = Math.max(1, Math.round(cw * s)); H = Math.max(1, Math.round(ch * s));
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H);
    layout();
    requestFrame();
  }
  window.addEventListener("resize", resize);

  // On wide screens the fractal is centred in the open space between the copy and the control
  // panel, and scaled down if needed so neither of them covers it.
  var FRACTAL_R = 0.74;   // on-screen radius of the set plus its glow, in units of half the canvas height
  function layout() {
    var cr = canvas.getBoundingClientRect(), half = cr.height / 2;
    var copy = document.querySelector(".hero-copy");
    var sideBySide = panel && getComputedStyle(panel).position === "absolute";
    if (!copy || !sideBySide || !half) { shift = 0; zoom = 1; requestFrame(); return; }
    var gap = 24;
    var left = copy.getBoundingClientRect().right + gap;
    var right = panel.getBoundingClientRect().left - gap;
    var free = Math.max(80, right - left);
    shift = ((left + right) / 2 - (cr.left + cr.width / 2)) / half;
    zoom = Math.min(1, (free / 2) / (FRACTAL_R * half), (half * 0.92) / (FRACTAL_R * half));
    requestFrame();
  }
  if (tab) tab.addEventListener("click", function () { setTimeout(layout, 0); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  var raf = 0, visible = true, start = performance.now(), ang = 0.6, last = performance.now();

  function draw(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    var t = (now - start) / 1000;
    var still = reduced.matches;

    if (tween) {
      var k = Math.min(1, (now - tween.t0) / tween.dur), e = 1 - Math.pow(1 - k, 4);
      params.cx = tween.from[0] + (tween.to[0] - tween.from[0]) * e;
      params.cy = tween.from[1] + (tween.to[1] - tween.from[1]) * e;
      params.cz = tween.from[2] + (tween.to[2] - tween.from[2]) * e;
      params.cw = tween.from[3] + (tween.to[3] - tween.from[3]) * e;
      syncInputs();
      if (k >= 1) tween = null;
    }

    var level = window.GRNCH_SOUND ? window.GRNCH_SOUND.level() : 0;
    var m = still ? 0 : params.morph * 0.12;
    gl.uniform4f(U.uC,
      params.cx + m * Math.sin(t * 0.31) + level * 0.04,
      params.cy + m * Math.cos(t * 0.23),
      params.cz + m * Math.sin(t * 0.17 + 1.3),
      params.cw + m * Math.cos(t * 0.29 + 0.7));
    if (!still) ang += dt * params.spin * 0.9;
    gl.uniform1f(U.uAng, ang);
    gl.uniform2f(U.uRes, W, H);
    gl.uniform1f(U.uTime, t);
    gl.uniform1f(U.uDetail, params.detail);
    gl.uniform1f(U.uLevel, level);
    gl.uniform1f(U.uShift, shift);
    gl.uniform1f(U.uZoom, zoom);
    var rgb = hslToRgb(params.hue, 0.62, 0.56);
    gl.uniform3f(U.uAccent, rgb[0], rgb[1], rgb[2]);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!still || tween) requestFrame();
  }

  function requestFrame() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(draw); }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) { last = performance.now(); requestFrame(); } }).observe(canvas);
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { last = performance.now(); requestFrame(); } });
  reduced.addEventListener && reduced.addEventListener("change", requestFrame);

  resize();
})();
