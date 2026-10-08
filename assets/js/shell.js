/* Shared page chrome: New York clock, sound switch, works menu. */
(function () {
  "use strict";

  // the accent hue a visitor set on the home controls follows them through the site
  try {
    var hue = localStorage.getItem("grnch-hue");
    if (hue !== null) document.documentElement.style.setProperty("--accent-h", hue);
  } catch (e) {}

  var clock = document.getElementById("clock");
  if (clock) {
    var fmt;
    try { fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: false }); } catch (e) { fmt = null; }
    var tick = function () {
      var d = new Date();
      clock.textContent = fmt ? fmt.format(d) : d.toTimeString().slice(0, 5);
      clock.setAttribute("datetime", d.toISOString());
    };
    tick();
    setInterval(tick, 15000);
  }

  var btn = document.getElementById("soundBtn");
  if (btn) {
    var label = btn.querySelector("b");
    btn.addEventListener("click", function () {
      if (!window.GRNCH_SOUND) return;
      var state = window.GRNCH_SOUND.toggle();
      btn.setAttribute("aria-pressed", state ? "true" : "false");
      label.textContent = state ? "on" : "off";
    });
  }

  var works = document.querySelector(".works");
  if (works) {
    document.addEventListener("click", function (e) { if (works.open && !works.contains(e.target)) works.open = false; });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && works.open) { works.open = false; works.querySelector("summary").focus(); }
    });
  }

  // Releases: the Bandcamp player loads only when asked, so the cover always shows
  Array.prototype.forEach.call(document.querySelectorAll("[data-embed]"), function (btn) {
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = btn.dataset.embed;
      f.title = btn.dataset.title;
      f.setAttribute("seamless", "");
      f.allow = "autoplay";
      btn.replaceWith(f);
      f.focus();
    });
  });
})();
