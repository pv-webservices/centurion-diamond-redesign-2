/* ============================================================
   STORE LOCATOR — Leaflet 1.9.4 over OpenStreetMap tiles.
   The same behaviour as the locator on centuriondiamond.com:
     - search by store name, city, state or ZIP
     - a five-digit ZIP is geocoded (zippopotam.us) and the list re-sorts
       by distance from it; so does "Use my location"
     - a state filter
     - list and map stay in step: picking either flies to the store
   Plus directions and click-to-call in every result.
   Data: CD.STORES (assets/js/locator/stores.js).
   ============================================================ */
window.CD = window.CD || {};

CD.pageInits = CD.pageInits || [];
CD.pageInits.push(function initLocator() {
  'use strict';
  var root = document.getElementById('locator');
  if (!root || typeof L === 'undefined' || !CD.STORES) return;

  var STORES = CD.STORES;
  var el = {
    map: root.querySelector('[data-loc-map]'),
    input: root.querySelector('[data-loc-search]'),
    state: root.querySelector('[data-loc-state]'),
    locate: root.querySelector('[data-loc-locate]'),
    hint: root.querySelector('[data-loc-hint]'),
    count: root.querySelector('[data-loc-count]'),
    list: root.querySelector('[data-loc-list]')
  };
  var US_VIEW = { center: [39.5, -98.35], zoom: 4 };
  var ZIP_RE = /^(\d{5})(?:-\d{4})?$/;
  var MILES = 3958.8;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function addressLine(s, sep) {
    return [s.address, [s.city, s.state].filter(Boolean).join(', '), s.zip].filter(Boolean).join(sep);
  }
  function directionsUrl(s) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(s.name + ', ' + addressLine(s, ', '));
  }
  function telHref(phone) { return 'tel:' + phone.replace(/[^\d+]/g, ''); }
  function haversine(lat1, lon1, lat2, lon2) {
    var r = Math.PI / 180, dLat = (lat2 - lat1) * r, dLon = (lon2 - lon1) * r;
    var a = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.pow(Math.sin(dLon / 2), 2);
    return MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* ---------- map ---------- */
  var map = L.map(el.map, { zoomControl: true, scrollWheelZoom: false, worldCopyJump: true })
    .setView(US_VIEW.center, US_VIEW.zoom);   // until the first search frames the stores
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  /* the page scrolls with the wheel until the map is clicked into */
  map.on('click focus', function () { map.scrollWheelZoom.enable(); });
  map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

  function pinIcon(active) {
    return L.divIcon({ className: '', html: '<span class="loc-pin' + (active ? ' is-active' : '') + '"><i></i></span>',
      iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -12] });
  }
  function popupHtml(s) {
    return '<div class="loc-pop__name">' + esc(s.name) + '</div>' +
      (s.subtitle ? '<div class="loc-pop__sub">' + esc(s.subtitle) + '</div>' : '') +
      '<div class="loc-pop__addr">' + esc(addressLine(s, ' · ')) + '</div>' +
      '<div class="loc-pop__acts"><a href="' + esc(directionsUrl(s)) + '" target="_blank" rel="noopener">Directions</a>' +
      (s.phone ? '<a href="' + esc(telHref(s.phone)) + '">' + esc(s.phone) + '</a>' : '') + '</div>';
  }

  var layer = L.layerGroup().addTo(map);
  var markers = STORES.map(function (s, i) {
    var m = L.marker([s.lat, s.lon], { icon: pinIcon(false), title: s.name, keyboard: true });
    m.bindPopup(popupHtml(s), { maxWidth: 280 });
    m.on('click', function () { setActive(i, { fly: false, scroll: true }); });
    return m;
  });
  var you = null;

  /* ---------- state filter ---------- */
  Array.from(new Set(STORES.map(function (s) { return s.state; }).filter(Boolean))).sort().forEach(function (st) {
    var o = document.createElement('option');
    o.value = st; o.textContent = st;
    el.state.appendChild(o);
  });

  /* ---------- list ---------- */
  var active = -1, current = [];
  function render(rows, nearLabel) {
    current = rows;
    el.count.textContent = rows.length + ' retailer' + (rows.length === 1 ? '' : 's') + (nearLabel ? ' · nearest to ' + nearLabel : '');
    layer.clearLayers();
    rows.forEach(function (r) { layer.addLayer(markers[r.idx]); });
    if (!rows.length) {
      el.list.innerHTML = '<li class="loc__empty">No retailers match your search. Try a city, a state, or a ZIP code.</li>';
      return;
    }
    el.list.innerHTML = rows.map(function (r) {
      var s = STORES[r.idx];
      return '<li><button type="button" class="loc-item' + (r.idx === active ? ' is-active' : '') + '" data-idx="' + r.idx + '">' +
        (typeof r.dist === 'number' ? '<span class="loc-item__dist">' + r.dist.toFixed(1) + ' mi away</span>' : '') +
        '<span class="loc-item__name">' + esc(s.name) + '</span>' +
        (s.subtitle ? '<span class="loc-item__sub">' + esc(s.subtitle) + '</span>' : '') +
        '<span class="loc-item__addr">' + esc(addressLine(s, ' · ')) + '</span>' +
        (s.phone ? '<span class="loc-item__phone">' + esc(s.phone) + '</span>' : '') +
        '</button></li>';
    }).join('');
  }
  el.list.addEventListener('click', function (e) {
    var b = e.target.closest('.loc-item');
    if (b) setActive(+b.dataset.idx, { fly: true, scroll: false });
  });

  function setActive(idx, opts) {
    if (active > -1) markers[active].setIcon(pinIcon(false));
    active = idx;
    markers[idx].setIcon(pinIcon(true));
    Array.prototype.forEach.call(el.list.querySelectorAll('.loc-item'), function (b) {
      var on = +b.dataset.idx === idx;
      b.classList.toggle('is-active', on);
      if (on && opts.scroll) b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    var s = STORES[idx];
    if (opts.fly) map.flyTo([s.lat, s.lon], 13, { duration: 0.7 });
    markers[idx].openPopup();
  }

  function fitTo(rows) {
    if (!rows.length) return;
    if (rows.length === 1) { map.flyTo([STORES[rows[0].idx].lat, STORES[rows[0].idx].lon], 13, { duration: 0.7 }); return; }
    map.fitBounds(L.latLngBounds(rows.map(function (r) { return [STORES[r.idx].lat, STORES[r.idx].lon]; })), { padding: [40, 40], maxZoom: 12 });
  }

  /* ---------- nearest to a point (ZIP or the visitor) ---------- */
  function showNearest(lat, lon, label, markerLabel) {
    var st = el.state.value;
    var rows = STORES.map(function (s, idx) { return { idx: idx, dist: haversine(lat, lon, s.lat, s.lon) }; })
      .filter(function (r) { return !st || STORES[r.idx].state === st; })
      .sort(function (a, b) { return a.dist - b.dist; });
    render(rows, label);
    if (you) map.removeLayer(you);
    you = L.marker([lat, lon], { icon: L.divIcon({ className: '', html: '<span class="loc-you"></span>', iconSize: [16, 16], iconAnchor: [8, 8] }) })
      .addTo(map).bindPopup(esc(markerLabel || 'You are here'));
    /* frame the visitor with the nearest few stores */
    var near = rows.slice(0, 3).map(function (r) { return [STORES[r.idx].lat, STORES[r.idx].lon]; });
    map.fitBounds(L.latLngBounds(near.concat([[lat, lon]])), { padding: [50, 50], maxZoom: 11 });
  }

  var zipCache = {}, token = 0;
  function geocodeZip(zip) {
    if (zipCache[zip]) return Promise.resolve(zipCache[zip]);
    return fetch('https://api.zippopotam.us/us/' + zip).then(function (res) {
      if (!res.ok) throw new Error('not found');
      return res.json();
    }).then(function (data) {
      var p = data.places && data.places[0];
      if (!p) throw new Error('not found');
      zipCache[zip] = { lat: parseFloat(p.latitude), lon: parseFloat(p.longitude), label: p['place name'] + ', ' + p['state abbreviation'] + ' ' + zip };
      return zipCache[zip];
    });
  }

  function apply() {
    var raw = el.input.value.trim(), zip = raw.match(ZIP_RE);
    var mine = ++token;
    el.hint.textContent = '';
    if (zip) {
      el.hint.textContent = 'Looking up ' + zip[1] + '…';
      geocodeZip(zip[1]).then(function (g) {
        if (mine !== token) return;
        el.hint.textContent = '';
        showNearest(g.lat, g.lon, zip[1], g.label);
      }).catch(function () {
        if (mine !== token) return;
        el.hint.textContent = 'We could not find ZIP code ' + zip[1] + '.';
        render([]);
      });
      return;
    }
    if (you) { map.removeLayer(you); you = null; }
    var q = raw.toLowerCase(), st = el.state.value;
    var rows = [];
    STORES.forEach(function (s, idx) {
      if (st && s.state !== st) return;
      if (q && (s.name + ' ' + (s.subtitle || '') + ' ' + s.address + ' ' + s.city + ' ' + s.state + ' ' + s.zip).toLowerCase().indexOf(q) < 0) return;
      rows.push({ idx: idx });
    });
    render(rows);
    fitTo(rows);                       // with no filter, that frames every store
  }

  var debounce;
  el.input.addEventListener('input', function () { clearTimeout(debounce); debounce = setTimeout(apply, 220); });
  el.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(debounce); apply(); } });
  el.state.addEventListener('change', apply);

  el.locate.addEventListener('click', function () {
    if (!navigator.geolocation) { el.hint.textContent = 'Location is not available in this browser.'; return; }
    el.hint.textContent = 'Finding your location…';
    navigator.geolocation.getCurrentPosition(function (pos) {
      el.hint.textContent = '';
      el.input.value = '';
      showNearest(pos.coords.latitude, pos.coords.longitude, 'you', 'You are here');
    }, function () {
      el.hint.textContent = 'We could not get your location. Try a city or ZIP code instead.';
    }, { timeout: 10000, maximumAge: 300000 });
  });

  /* a search passed in the URL (store-locator.html?q=10001) runs on arrival */
  var preset = new URLSearchParams(location.search).get('q');
  if (preset) el.input.value = preset.slice(0, 80);
  apply();
  /* the map was measured before the page's fonts and curtain settled */
  setTimeout(function () { map.invalidateSize(); }, 400);
  window.addEventListener('resize', function () { map.invalidateSize(); }, { passive: true });
});
