/*
  The ball on the homepage's loss landscape (images/landscape-*.svg). It follows
  heavy-ball dynamics on the bowl, q'' = -grad f(q) - gamma q', from a random spot
  near the rim down to the minimum, rests, and starts again somewhere else.
  A click on the bowl drops it there.
*/
(function () {
  // BEGIN geometry, written by scripts/make_landscape.py
  var G = {"A": 190.0, "B": 150.0, "DEPTH": 80.0, "AZ": -8.0, "EL": 40.0, "R_MAX": 1.1, "R_START": 0.92, "BALL_R": 10.0, "VIEW": [-199.1, -107.4, 398.2, 222.0]};
  // END geometry

  var PERIOD = 1.9;                 // seconds per swing along the bowl's long axis
  var GAMMA = 1.6;                  // friction, 1/s
  var SETTLED = 3;                  // a run ends once its swing is below this (world units)
  var APPEAR = 0.45, HOLD = 0.35, REST = 1.6, VANISH = 0.45;   // seconds

  var art = document.querySelector(".research__art");
  if (!art || !G || !window.requestAnimationFrame) return;

  var deg = Math.PI / 180;
  var cAz = Math.cos(G.AZ * deg), sAz = Math.sin(G.AZ * deg);
  var cEl = Math.cos(G.EL * deg), sEl = Math.sin(G.EL * deg);
  var toCam = [-cEl * sAz, -cEl * cAz, sEl];
  var wx = 2 * Math.PI / PERIOD, wy = wx * G.A / G.B;   // steeper across the short axis

  // ------------------------------------------------ geometry (as in make_landscape.py)
  function height(x, y) {
    return G.DEPTH * (x * x / (G.A * G.A) + y * y / (G.B * G.B));
  }

  function project(x, y, z) {
    var xr = x * cAz - y * sAz, yr = x * sAz + y * cAz;
    return [xr, -yr * sEl - (z - G.DEPTH) * cEl];
  }

  function hidden(x, y, z) {
    for (var k = 1; k < 400; k++) {
      var px = x + k * toCam[0], py = y + k * toCam[1], pz = z + k * toCam[2];
      if (px * px / (G.A * G.A) + py * py / (G.B * G.B) > G.R_MAX * G.R_MAX) return false;
      if (height(px, py) > pz + 0.5) return true;
    }
    return false;
  }

  // the point of the bowl seen at screen point (sx, sy), in radii of the r = 1 level set
  function unproject(sx, sy) {
    var A2 = G.A * G.A, B2 = G.B * G.B, D = G.DEPTH;
    var qa = D * (sAz * sAz / A2 + cAz * cAz / B2);
    var qb = 2 * D * sx * cAz * sAz * (1 / A2 - 1 / B2);
    var qc = D * sx * sx * (cAz * cAz / A2 + sAz * sAz / B2);
    var a2 = qa * cEl, a1 = qb * cEl + sEl, a0 = (qc - D) * cEl + sy;
    var disc = a1 * a1 - 4 * a2 * a0;
    if (disc < 0) return null;
    var best = null, nearest = Infinity;
    [-1, 1].forEach(function (sign) {
      var yr = (-a1 + sign * Math.sqrt(disc)) / (2 * a2);
      var x = sx * cAz + yr * sAz, y = yr * cAz - sx * sAz;
      var u = x / G.A, v = y / G.B, d = yr * cEl - height(x, y) * sEl;
      if (u * u + v * v <= G.R_MAX * G.R_MAX && d < nearest) {
        nearest = d;
        best = [u, v];
      }
    });
    return best;
  }

  // ------------------------------------------------------------------ dynamics
  // one axis of q'' = -w^2 q - GAMMA q' from position q0 and speed p0, in closed form
  function axis(q0, p0, w) {
    var wd = Math.sqrt(w * w - GAMMA * GAMMA / 4);
    return { a: q0, b: (p0 + GAMMA * q0 / 2) / wd, wd: wd };
  }

  function along(ax, t) {
    return Math.exp(-GAMMA * t / 2) * (ax.a * Math.cos(ax.wd * t) + ax.b * Math.sin(ax.wd * t));
  }

  function makeRun(u0, v0, pu, pv) {
    var run = { u: axis(u0, pu, wx), v: axis(v0, pv, wy) };
    var swing = Math.max(G.A * Math.sqrt(run.u.a * run.u.a + run.u.b * run.u.b),
                         G.B * Math.sqrt(run.v.a * run.v.a + run.v.b * run.v.b));
    run.length = 2 * Math.log(Math.max(swing, SETTLED) / SETTLED) / GAMMA;
    return run;
  }

  function position(run, t) {
    var x = G.A * along(run.u, t), y = G.B * along(run.v, t);
    return [x, y, height(x, y)];
  }

  // the whole run stays inside the start radius and in front of the near rim
  function inView(run) {
    for (var t = 0; t < run.length; t += 0.03) {
      var p = position(run, t);
      var r2 = p[0] * p[0] / (G.A * G.A) + p[1] * p[1] / (G.B * G.B);
      if (r2 > G.R_START * G.R_START * 1.06 || hidden(p[0], p[1], p[2] + 1.5)) return false;
    }
    return true;
  }

  function randomRun() {
    for (var i = 0; i < 50; i++) {
      var th = 2 * Math.PI * Math.random(), r = G.R_START * (0.86 + 0.14 * Math.random());
      var s = 0.9 * (Math.random() - 0.5) * Math.sqrt(wx * wy) * r;   // a sideways push curves the path
      var run = makeRun(r * Math.cos(th), r * Math.sin(th), -s * Math.sin(th), s * Math.cos(th));
      if (inView(run)) return run;
    }
    return makeRun(0.9 * Math.cos(163 * deg), 0.9 * Math.sin(163 * deg), 0, 0);
  }

  function dropAt(u, v) {
    var r = Math.sqrt(u * u + v * v);
    if (r > G.R_START) {
      u *= G.R_START / r;
      v *= G.R_START / r;
    }
    for (var i = 0; i < 12; i++, u *= 0.92, v *= 0.92) {
      var run = makeRun(u, v, 0, 0);
      if (inView(run)) return run;
    }
    return makeRun(0, 0, 0, 0);
  }

  // ------------------------------------------------------------------- drawing
  art.insertAdjacentHTML("beforeend",
    '<svg class="bowl" viewBox="' + G.VIEW.join(" ") + '">' +
    "<title>Click to drop the ball</title>" +
    '<defs><radialGradient id="bowl-ball" cx=".36" cy=".32" r=".75">' +
    '<stop offset="0" style="stop-color: var(--ball-0)"/>' +
    '<stop offset=".45" style="stop-color: var(--ball-1)"/>' +
    '<stop offset="1" style="stop-color: var(--ball-2)"/></radialGradient>' +
    '<filter id="bowl-soft" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="2"/></filter></defs>' +
    '<polyline class="bowl__trail" points=""/>' +
    '<ellipse class="bowl__ripple" opacity="0"/><ellipse class="bowl__ripple" opacity="0"/>' +
    '<g class="bowl__ball" opacity="0">' +
    '<ellipse class="bowl__shadow" rx="' + 1.05 * G.BALL_R + '" ry="' + 0.42 * G.BALL_R + '" filter="url(#bowl-soft)"/>' +
    '<circle r="' + G.BALL_R + '" fill="url(#bowl-ball)"/></g></svg>');

  var svg = art.querySelector(".bowl");
  var trail = svg.querySelector(".bowl__trail");
  var ripples = svg.querySelectorAll(".bowl__ripple");
  var ball = svg.querySelector(".bowl__ball");
  var shadow = ball.querySelector("ellipse");
  var circle = ball.querySelector("circle");
  var bottom = project(0, 0, 0);

  function place(p, alpha) {
    var c = project(p[0], p[1], p[2]);
    shadow.setAttribute("cx", c[0].toFixed(2));
    shadow.setAttribute("cy", (c[1] + 1).toFixed(2));
    circle.setAttribute("cx", c[0].toFixed(2));
    circle.setAttribute("cy", (c[1] - G.BALL_R + 0.5).toFixed(2));
    ball.setAttribute("opacity", alpha.toFixed(3));
    return c;
  }

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    place([0, 0, 0], 1);
    svg.style.cursor = "default";
    return;
  }

  // --------------------------------------------------------------------- loop
  var run, clock, quick, points, lastPoint;
  var frame = null, last = null;

  function start(next, fast) {
    run = next;
    quick = fast;
    clock = 0;
    points = "";
    lastPoint = null;
    trail.setAttribute("points", "");
  }

  function step() {
    var appear = quick ? 0.2 : APPEAR;
    var t0 = appear + (quick ? 0.1 : HOLD);           // release
    var t1 = t0 + run.length, t2 = t1 + REST, t3 = t2 + VANISH;
    var alpha = clock < appear ? clock / appear : clock > t2 ? Math.max(0, 1 - (clock - t2) / VANISH) : 1;
    var c = place(position(run, Math.max(0, clock - t0)), alpha);

    if (clock >= t0 && clock < t1 &&
        (!lastPoint || Math.abs(c[0] - lastPoint[0]) + Math.abs(c[1] - lastPoint[1]) > 1.5)) {
      points += (points ? " " : "") + c[0].toFixed(1) + "," + c[1].toFixed(1);
      trail.setAttribute("points", points);
      lastPoint = c;
    }
    trail.setAttribute("opacity", Math.max(0, Math.min(1, (t2 - clock) / 1.2)).toFixed(3));

    // two ripples at the minimum once the ball has arrived
    for (var i = 0; i < ripples.length; i++) {
      var s = (clock - t1 - 0.5 * i) / 1.4, on = s > 0 && s < 1, rx = 9 * (1 + 2.2 * s);
      ripples[i].setAttribute("opacity", on ? (0.65 * (1 - s)).toFixed(3) : "0");
      if (on) {
        ripples[i].setAttribute("cx", bottom[0].toFixed(2));
        ripples[i].setAttribute("cy", bottom[1].toFixed(2));
        ripples[i].setAttribute("rx", rx.toFixed(2));
        ripples[i].setAttribute("ry", (rx * sEl).toFixed(2));
      }
    }

    if (clock >= t3) start(randomRun(), false);
  }

  function tick(now) {
    clock += last === null ? 0 : Math.min((now - last) / 1000, 0.05);
    last = now;
    step();
    frame = requestAnimationFrame(tick);
  }

  function play() {
    if (frame === null) {
      last = null;
      frame = requestAnimationFrame(tick);
    }
  }

  function pause() {
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }

  svg.addEventListener("click", function (e) {
    var m = svg.getScreenCTM();
    if (!m) return;
    var pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    pt = pt.matrixTransform(m.inverse());
    var uv = unproject(pt.x, pt.y + G.BALL_R - 0.5);   // the click marks the ball's centre
    if (!uv) return;
    start(dropAt(uv[0], uv[1]), true);
    play();
  });

  start(randomRun(), false);
  // only roll while the bowl is on screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) play();
      else pause();
    }).observe(art);
  } else {
    play();
  }
})();
