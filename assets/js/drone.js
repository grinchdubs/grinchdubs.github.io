/* GRNCH drone: opt-in generative sound. Nothing is created until the visitor turns sound on.
   Every musical choice comes from _data/sound.yml (window.GRNCH_SOUND_SETTINGS); the values
   below are only the fallbacks for lines that file leaves out. */
(function () {
  "use strict";

  /* ---------- settings ---------- */

  var S = window.GRNCH_SOUND_SETTINGS || {};
  function get(obj, key, fallback) { return obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : fallback; }
  function num(v, fallback, lo, hi) {
    v = parseFloat(v);
    if (!isFinite(v)) return fallback;
    if (lo !== undefined) v = Math.max(lo, v);
    if (hi !== undefined) v = Math.min(hi, v);
    return v;
  }

  var SCALES = {
    minor_pentatonic: [0, 3, 5, 7, 10],
    major_pentatonic: [0, 2, 4, 7, 9],
    minor: [0, 2, 3, 5, 7, 8, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    hirajoshi: [0, 2, 3, 7, 8],
    whole_tone: [0, 2, 4, 6, 8, 10]
  };
  var NOTES = { C: 0, "C#": 1, DB: 1, D: 2, "D#": 3, EB: 3, E: 4, F: 5, "F#": 6, GB: 6, G: 7, "G#": 8, AB: 8, A: 9, "A#": 10, BB: 10, B: 11 };

  function noteToHz(name) {
    var m = /^([A-Ga-g])([#b]?)(-?\d)$/.exec(String(name).trim());
    if (!m) return 73.42;
    var key = m[1].toUpperCase() + (m[2] === "#" ? "#" : m[2] === "b" ? "B" : "");
    var midi = (parseInt(m[3], 10) + 1) * 12 + NOTES[key];
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  var scaleSetting = get(S, "scale", "minor_pentatonic");
  var SCALE = Array.isArray(scaleSetting) && scaleSetting.length
    ? scaleSetting.map(function (v) { return num(v, 0); })
    : (SCALES[String(scaleSetting).toLowerCase()] || SCALES.minor_pentatonic);

  var ROOT = noteToHz(get(S, "root", "D2"));
  var TEMPO = num(get(S, "tempo", 122), 122, 30, 240);
  var BEAT = 60 / TEMPO;
  var PRESET_STEPS = Array.isArray(S.preset_steps) ? S.preset_steps : [0, 2, 3, 4];

  var D = S.drone || {}, F = S.filter || {}, R = S.reverb || {}, B = S.bells || {}, P = S.pulse || {};
  var WAVES = ["sine", "triangle", "sawtooth", "square"];
  var droneWave = WAVES.indexOf(get(D, "wave", "sawtooth")) >= 0 ? get(D, "wave", "sawtooth") : "sawtooth";
  var bellEvery = Array.isArray(B.every_beats) ? B.every_beats : [8, 20];

  var CFG = {
    droneVol: num(get(D, "volume", 0.16), 0.16, 0, 1),
    detune: num(get(D, "detune", 0.66), 0.66, 0, 10) / 100,
    sub: num(get(D, "sub", 0.9), 0.9, 0, 2),
    fifth: num(get(D, "fifth", 0.18), 0.18, 0, 2),
    glide: num(get(D, "glide", 1.2), 1.2, 0.01, 20),
    cutoff: num(get(F, "cutoff", 320), 320, 40, 12000),
    q: num(get(F, "resonance", 5), 5, 0.1, 30),
    sweepDepth: num(get(F, "sweep_depth", 190), 190, 0, 6000),
    sweepSeconds: num(get(F, "sweep_seconds", 32), 32, 1, 600),
    reverbSeconds: num(get(R, "seconds", 3.4), 3.4, 0.2, 12),
    reverbMix: num(get(R, "mix", 0.55), 0.55, 0, 1),
    sand: num(get(S, "sand", 0.18), 0.18, 0, 1),
    bellsOn: get(B, "on", true) !== false,
    bellMin: num(bellEvery[0], 8, 1, 256),
    bellMax: num(bellEvery[1], 20, 1, 256),
    bellOctave: num(get(B, "octave", 2), 2, -2, 5),
    bellBright: num(get(B, "brightness", 0.35), 0.35, 0, 1),
    bellVol: num(get(B, "volume", 0.08), 0.08, 0, 1),
    pulseOn: get(P, "on", false) === true,
    pulseVol: num(get(P, "volume", 0.35), 0.35, 0, 1),
    pulseEvery: num(get(P, "every_beats", 1), 1, 0.25, 16),
    pulsePitch: num(get(P, "pitch", 52), 52, 20, 200)
  };
  if (CFG.bellMax < CFG.bellMin) CFG.bellMax = CFG.bellMin;

  /* ---------- engine ---------- */

  var ctx = null, master, comp, analyser, reverb, droneBus, filter, sandGain;
  var oscs = [], timers = [], on = false, levelValue = 0, buf = null, motion = 0, step = 0;
  var pulseTimer = 0, nextPulse = 0;

  function semis(n) { return Math.pow(2, n / 12); }
  function scaleNote(i) {
    var n = SCALE.length, oct = Math.floor(i / n);
    return SCALE[((i % n) + n) % n] + oct * 12;
  }

  function impulse(seconds, decay) {
    var rate = ctx.sampleRate, len = Math.floor(seconds * rate);
    var b = ctx.createBuffer(2, len, rate);
    for (var c = 0; c < 2; c++) {
      var d = b.getChannelData(c);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  function noiseBuffer(seconds) {
    var len = Math.floor(seconds * ctx.sampleRate), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; last = (last + 0.04 * w) / 1.04; d[i] = w * 0.6 + last * 3; }
    return b;
  }

  function build() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    master = ctx.createGain(); master.gain.value = 0.0001;
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3.5;
    analyser = ctx.createAnalyser(); analyser.fftSize = 512;
    master.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);
    buf = new Float32Array(analyser.fftSize);

    reverb = ctx.createConvolver(); reverb.buffer = impulse(CFG.reverbSeconds, 2.6);
    var wet = ctx.createGain(); wet.gain.value = CFG.reverbMix;
    reverb.connect(wet); wet.connect(master);

    droneBus = ctx.createGain(); droneBus.gain.value = CFG.droneVol;
    filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = CFG.cutoff; filter.Q.value = CFG.q;
    filter.connect(droneBus); droneBus.connect(master); droneBus.connect(reverb);

    [[1, droneWave, 0.5], [1 + CFG.detune, droneWave, 0.5], [0.5, "sine", CFG.sub], [1.5, "triangle", CFG.fifth]].forEach(function (v) {
      if (v[2] <= 0) return;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = v[1]; o.frequency.value = ROOT * v[0]; g.gain.value = v[2];
      o.connect(g); g.connect(filter); o.start();
      oscs.push({ osc: o, ratio: v[0] });
    });

    var lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    lfo.frequency.value = 1 / CFG.sweepSeconds; lfoGain.gain.value = CFG.sweepDepth;
    lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start();

    if (CFG.sand > 0) {
      var sand = ctx.createBufferSource(); sand.buffer = noiseBuffer(4); sand.loop = true;
      var sandFilter = ctx.createBiquadFilter(); sandFilter.type = "bandpass"; sandFilter.frequency.value = 2200; sandFilter.Q.value = 0.6;
      sandGain = ctx.createGain(); sandGain.gain.value = 0;
      sand.connect(sandFilter); sandFilter.connect(sandGain); sandGain.connect(master); sandGain.connect(reverb);
      sand.start();
    }
    return true;
  }

  function bell(freq, peak, length) {
    if (!ctx || !on) return;
    var t = ctx.currentTime, g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + length);
    [[1, 1], [2.76, CFG.bellBright], [5.4, CFG.bellBright * 0.35]].forEach(function (p) {
      if (p[1] <= 0) return;
      var o = ctx.createOscillator(), og = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq * p[0]; og.gain.value = p[1];
      o.connect(og); og.connect(g); o.start(t); o.stop(t + length + 0.1);
    });
    g.connect(master); g.connect(reverb);
  }

  function click() {
    if (!ctx || !on) return;
    var t = ctx.currentTime, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = ctx.__click || (ctx.__click = noiseBuffer(0.05));
    f.type = "bandpass"; f.frequency.value = 1400 + Math.random() * 500; f.Q.value = 6;
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    src.connect(f); f.connect(g); g.connect(master); g.connect(reverb);
    src.start(t); src.stop(t + 0.07);
  }

  function thump(t) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(CFG.pulsePitch * 2.4, t);
    o.frequency.exponentialRampToValueAtTime(CFG.pulsePitch, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(CFG.pulseVol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.45);
  }

  // look-ahead scheduler so the pulse stays on tempo even when the tab is busy
  function schedulePulse() {
    if (!on || !CFG.pulseOn) return;
    var interval = BEAT * CFG.pulseEvery;
    while (nextPulse < ctx.currentTime + 0.15) { thump(nextPulse); nextPulse += interval; }
    pulseTimer = setTimeout(schedulePulse, 50);
  }

  function shiftTo(presetIndex) {
    if (!ctx) return;
    step = num(PRESET_STEPS[presetIndex % PRESET_STEPS.length], 0);
    var t = ctx.currentTime, target = semis(scaleNote(step));
    oscs.forEach(function (o) { o.osc.frequency.setTargetAtTime(ROOT * o.ratio * target, t, CFG.glide / 3); });
  }

  function ambient() {
    if (!on) return;
    if (CFG.bellsOn) {
      var n = scaleNote(step + Math.floor(Math.random() * SCALE.length));
      bell(ROOT * Math.pow(2, CFG.bellOctave) * semis(n), CFG.bellVol * (0.6 + Math.random() * 0.5), 4 + Math.random() * 2);
    }
    var beats = CFG.bellMin + Math.random() * (CFG.bellMax - CFG.bellMin);
    timers.push(setTimeout(ambient, beats * BEAT * 1000));
  }

  function setOn(next) {
    if (next && !ctx && !build()) return false;
    on = next;
    var t = ctx.currentTime;
    if (on) {
      ctx.resume();
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
      master.gain.exponentialRampToValueAtTime(0.9, t + 2.5);
      timers.push(setTimeout(ambient, 2500));
      if (CFG.pulseOn) { nextPulse = t + 2.5; schedulePulse(); }
    } else {
      timers.forEach(clearTimeout); timers = [];
      clearTimeout(pulseTimer);
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
      master.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      setTimeout(function () { if (!on && ctx) ctx.suspend(); }, 900);
    }
    return true;
  }

  var lastMove = null;
  window.addEventListener("pointermove", function (e) {
    if (!on || !sandGain) return;
    var now = performance.now();
    if (lastMove) {
      var dt = Math.max(1, now - lastMove.t);
      var speed = Math.hypot(e.clientX - lastMove.x, e.clientY - lastMove.y) / dt; // px per ms
      motion = Math.min(1, motion * 0.7 + speed * 0.12);
      sandGain.gain.setTargetAtTime(motion * CFG.sand, ctx.currentTime, 0.05);
      sandGain.gain.setTargetAtTime(0, ctx.currentTime + 0.12, 0.35);
    }
    lastMove = { x: e.clientX, y: e.clientY, t: now };
  }, { passive: true });

  window.GRNCH_SOUND = {
    isOn: function () { return on; },
    toggle: function () { return setOn(!on) ? on : false; },
    click: click,
    select: function (presetIndex) {
      shiftTo(presetIndex);
      bell(ROOT * Math.pow(2, CFG.bellOctave) * semis(scaleNote(step)), CFG.bellVol * 1.7, 5);
    },
    hover: function (i) { bell(ROOT * Math.pow(2, CFG.bellOctave + 1) * semis(scaleNote(step + i)), CFG.bellVol * 0.4, 1.6); },
    level: function () {
      if (!on || !analyser) { levelValue *= 0.9; return levelValue; }
      analyser.getFloatTimeDomainData(buf);
      var sum = 0;
      for (var i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      var rms = Math.sqrt(sum / buf.length);
      levelValue = levelValue * 0.85 + Math.min(1, rms * 4) * 0.15;
      return levelValue;
    }
  };
})();
