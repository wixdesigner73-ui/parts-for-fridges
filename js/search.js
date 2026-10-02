/* Universal search resolution. Pure functions, no DOM – portable to a Velo backend module.
 *
 * Rules (Final Development Scope §7):
 *  - case-insensitive; ordinary spaces ignored; hyphens ignored
 *  - "/" is preserved so /00 and /02 stay distinct
 *  - complete identifier only – never prefix / fuzzy matching
 *  - if a normalised key would match more than one distinct record it is treated as no match
 */
(function (root) {
  function normalize(value) {
    return String(value == null ? '' : value)
      .normalize('NFKC')
      .toUpperCase()
      .replace(/[\s ]+/g, '')
      .replace(/[-‐-―]/g, '');
  }

  function add(map, key, ref) {
    if (!key) return;
    (map[key] = map[key] || []).push(ref);
  }

  function buildIndex(data) {
    var models = {}, parts = {}, missing = {};
    data.models.forEach(function (m) { add(models, normalize(m.number), m); });
    data.parts.forEach(function (p) { add(parts, normalize(p.mpn), p); });
    (data.notCarried || []).forEach(function (n) { add(missing, normalize(n), n); });
    // compatibility-only models referenced only from a part
    data.parts.forEach(function (p) {
      (p.compat || []).forEach(function (c) {
        var k = normalize(c);
        if (!models[k]) add(models, k, { number: c, active: false, slug: null });
      });
    });
    return { models: models, parts: parts, missing: missing };
  }

  function unique(list) {
    var seen = {}, out = [];
    (list || []).forEach(function (x) {
      var id = x.slug || x.number || String(x);
      if (!seen[id]) { seen[id] = 1; out.push(x); }
    });
    return out;
  }

  /** @returns {{type:string, query:string, model?:object, part?:object}}
   *  type: empty | model | model-inactive | part | part-unavailable | none */
  function resolve(query, data, index) {
    var q = String(query || '').trim();
    var key = normalize(q);
    if (!key) return { type: 'empty', query: q };
    index = index || buildIndex(data);

    var m = unique(index.models[key]);
    var p = unique(index.parts[key]);
    var x = unique(index.missing[key]);

    // ambiguous across record kinds → never guess
    if (m.length + p.length > 1 || m.length > 1 || p.length > 1) return { type: 'none', query: q };

    if (m.length === 1) {
      return m[0].active && m[0].slug
        ? { type: 'model', query: q, model: m[0] }
        : { type: 'model-inactive', query: q, model: m[0] };
    }
    if (p.length === 1) return { type: 'part', query: q, part: p[0] };
    if (x.length) return { type: 'part-unavailable', query: q };
    return { type: 'none', query: q };
  }

  var api = { normalize: normalize, buildIndex: buildIndex, resolve: resolve };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PFFSearch = api;
})(typeof window !== 'undefined' ? window : globalThis);
