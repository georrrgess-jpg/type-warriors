/* anim_guard.js - motion audit for Type Warriors (8.7 tool, plan sections 3 and 6).
 *
 * Self-contained. Inject it into the page (page.evaluate of this file's text, or paste into the console) and call
 *
 *     window.__animGuard()     ->  { infinite, nonCompositor, transitions, counts, groups, info }
 *
 * Everything is read from document.getAnimations(), so it sees CSS animations, CSS transitions and Web Animations alike.
 * Only RUNNING animations count (finished, paused and idle ones are ignored).
 *
 *   nonCompositor   running FINITE animations whose keyframes animate anything other than transform, opacity or
 *                   offset-* (offsetPath, offsetDistance, offsetRotate, offsetAnchor, offsetPosition). The individual
 *                   transform properties translate, rotate and scale are compositor friendly and are allowed
 *                   (pass {strict:true} to report them too).
 *   infinite        the same test, but iterations = Infinity. This is the list the M6 motion work must empty.
 *   transitions     running CSS transitions on box-shadow, filter, width, height, left or top.
 *   counts          {infinite, nonCompositor, transitions, bad, compositorInfinite, running}; bad = the first three added.
 *   groups          the three lists folded by (kind, animation name, properties) with a count and one sample element,
 *                   which is what to read when 40 identical cards each report the same thing.
 *   info            compositorInfinite: infinite transform/opacity animations (allowed, listed for cost awareness).
 *
 * Entry: { el: 'button#dkcont.dkgo', pseudo: '::after'|'', name, type, props:[...], iterations: 'infinite'|n,
 *          duration, delay, visible, path }.
 *
 * Protected animations are skipped. The Celestial chest opening (85d_cxopen.js) and the Graveyard chest opening
 * (84f_gy_crate.js) are canvas scenes; their only DOM is the result panel `.cxres` and the `cxov` class that
 * 85d puts on #ov while it is showing. So anything inside `.cxov` or `.cxres` is excluded, and so is the whole page
 * while a Celestial or Graveyard opening is running (S.mode === 'crate' and S.cr2.cx / S.cr2.hw). Note that the
 * Owned-crates hub cards (.chub.cx2 .cc, animation cxhas) are ordinary UI and ARE reported. Extra roots can be added
 * with  window.__animGuard.exclude.push('.some-root')  or  __animGuard({exclude:['.some-root']}).
 */
(function () {
  'use strict';
  var COMPOSITOR = /^(transform|opacity|translate|rotate|scale|offset[A-Za-z]*)$/;
  var STRICT = /^(transform|opacity|offset[A-Za-z]*)$/;
  var META = { offset: 1, computedOffset: 1, easing: 1, composite: 1 };
  var BAD_TRANSITIONS = ['box-shadow', 'filter', 'width', 'height', 'left', 'top'];
  var EXCLUDE = ['.cxov', '.cxres'];

  function cls(el) {
    var c = el.className;
    if (c && c.baseVal !== undefined) c = c.baseVal;
    return String(c || '').trim().split(/\s+/).filter(Boolean).slice(0, 3);
  }
  function sel(el) {
    if (!el || !el.tagName) return '?';
    var s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    var c = cls(el);
    if (c.length) s += '.' + c.join('.');
    return s;
  }
  function where(el) {
    var a = el && el.parentElement;
    while (a && a !== document.body) {
      if (a.id) return '#' + a.id;
      a = a.parentElement;
    }
    return 'body';
  }
  function visible(el) {
    try {
      if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    } catch (e) {}
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  }
  function chestOpening() {
    try {
      return typeof S !== 'undefined' && S.mode === 'crate' && S.cr2 && (S.cr2.cx || S.cr2.hw);
    } catch (e) {
      return false;
    }
  }
  function protectedEl(el, roots) {
    if (chestOpening()) return true;
    try {
      return !!(el.closest && el.closest(roots.join(',')));
    } catch (e) {
      return false;
    }
  }
  function kebab(s) {
    return String(s).replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); });
  }

  function guard(opts) {
    opts = opts || {};
    var roots = EXCLUDE.concat(guard.exclude || [], opts.exclude || []);
    var okRe = opts.strict ? STRICT : COMPOSITOR;
    var badTr = opts.transitions || BAD_TRANSITIONS;
    var res = { infinite: [], nonCompositor: [], transitions: [], counts: {}, groups: [], info: { compositorInfinite: [] } };
    var anims = [];
    try { anims = document.getAnimations(); } catch (e) { res.error = String(e); return res; }
    var running = 0, skipped = 0;
    for (var i = 0; i < anims.length; i++) {
      var a = anims[i];
      if (a.playState !== 'running') continue;
      var ef = a.effect;
      if (!ef || !ef.target) continue;
      var el = ef.target;
      if (protectedEl(el, roots)) { skipped++; continue; }
      running++;
      var kf = [];
      try { kf = ef.getKeyframes(); } catch (e) {}
      var props = {};
      kf.forEach(function (k) { for (var p in k) if (!META[p]) props[p] = 1; });
      props = Object.keys(props);
      var tm = {};
      try { tm = ef.getComputedTiming(); } catch (e) {}
      var inf = tm.iterations === Infinity;
      var isTr = typeof a.transitionProperty === 'string';
      var entry = {
        el: sel(el), pseudo: ef.pseudoElement || '',
        name: isTr ? 'transition:' + a.transitionProperty : (a.animationName || a.id || 'waapi'),
        type: isTr ? 'CSSTransition' : (typeof a.animationName === 'string' ? 'CSSAnimation' : 'Animation'),
        props: props, iterations: inf ? 'infinite' : (tm.iterations == null ? null : tm.iterations),
        duration: typeof tm.duration === 'number' ? Math.round(tm.duration) : null, delay: tm.delay || 0,
        visible: visible(el), path: where(el)
      };
      if (isTr) {
        var tp = a.transitionProperty;
        if (badTr.indexOf(tp) >= 0 || props.some(function (p) { return badTr.indexOf(kebab(p)) >= 0; })) res.transitions.push(entry);
        continue;
      }
      var bad = props.filter(function (p) { return !okRe.test(p); });
      if (bad.length) {
        entry.badProps = bad;
        (inf ? res.infinite : res.nonCompositor).push(entry);
      } else if (inf) {
        res.info.compositorInfinite.push(entry);
      }
    }
    var gm = {};
    [['infinite', res.infinite], ['nonCompositor', res.nonCompositor], ['transition', res.transitions]].forEach(function (kv) {
      kv[1].forEach(function (e) {
        var key = kv[0] + '|' + e.name + '|' + e.props.join(',');
        var g = gm[key];
        if (!g) g = gm[key] = { kind: kv[0], name: e.name, props: e.props, iterations: e.iterations, count: 0, visible: 0, sample: e.el + (e.pseudo || ''), path: e.path };
        g.count++;
        if (e.visible) g.visible++;
      });
    });
    res.groups = Object.keys(gm).map(function (k) { return gm[k]; }).sort(function (a, b) { return b.count - a.count; });
    res.counts = {
      infinite: res.infinite.length, nonCompositor: res.nonCompositor.length, transitions: res.transitions.length,
      bad: res.infinite.length + res.nonCompositor.length + res.transitions.length,
      compositorInfinite: res.info.compositorInfinite.length, running: running, skippedProtected: skipped
    };
    return res;
  }
  guard.exclude = [];
  guard.version = 1;
  window.__animGuard = guard;
})();
