/* Product-render style illustrations (inline SVG, shared gradient defs in index.html).
 * Placeholders for photographic 3D renders – swap for real renders by replacing these functions
 * with <img> tags; layout classes stay the same. */
window.PFFArt = (function () {
  var defs = '' +
  '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
  '<linearGradient id="g-steel" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#7d888f"/><stop offset=".12" stop-color="#c9d1d5"/><stop offset=".3" stop-color="#eef2f3"/><stop offset=".5" stop-color="#b4bec3"/><stop offset=".72" stop-color="#e3e8ea"/><stop offset=".9" stop-color="#9aa5ab"/><stop offset="1" stop-color="#6d787f"/></linearGradient>' +
  '<linearGradient id="g-steelv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1d2a31" stop-opacity=".22"/></linearGradient>' +
  '<linearGradient id="g-dark" x1="0" x2="1"><stop offset="0" stop-color="#1b252b"/><stop offset=".5" stop-color="#46535a"/><stop offset="1" stop-color="#151d22"/></linearGradient>' +
  '<linearGradient id="g-glass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".85"/><stop offset=".45" stop-color="#cfe6ee" stop-opacity=".35"/><stop offset="1" stop-color="#9fc4d1" stop-opacity=".55"/></linearGradient>' +
  '<linearGradient id="g-frost" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#d7e6eb" stop-opacity=".6"/></linearGradient>' +
  '<linearGradient id="g-blue" x1="0" x2="1"><stop offset="0" stop-color="#6fa3b8"/><stop offset=".4" stop-color="#cfe8f1"/><stop offset="1" stop-color="#5f93a9"/></linearGradient>' +
  '<linearGradient id="g-rubber" x1="0" x2="1"><stop offset="0" stop-color="#232b30"/><stop offset=".5" stop-color="#3b464c"/><stop offset="1" stop-color="#1b2226"/></linearGradient>' +
  '<radialGradient id="g-shadow"><stop offset="0" stop-color="#0e1a21" stop-opacity=".45"/><stop offset="1" stop-color="#0e1a21" stop-opacity="0"/></radialGradient>' +
  '</defs></svg>';

  function wrap(vb, body, cls) {
    return '<svg class="art ' + (cls || '') + '" viewBox="' + vb + '" role="img" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function fridge(cls) {
    return wrap('0 0 320 570',
      '<ellipse cx="160" cy="548" rx="128" ry="14" fill="url(#g-shadow)"/>' +
      '<rect x="62" y="528" width="26" height="12" rx="3" fill="#2a353b"/><rect x="232" y="528" width="26" height="12" rx="3" fill="#2a353b"/>' +
      '<rect x="40" y="18" width="240" height="514" rx="20" fill="url(#g-steel)"/>' +
      '<rect x="40" y="18" width="240" height="514" rx="20" fill="url(#g-steelv)"/>' +
      '<rect x="40" y="18" width="240" height="514" rx="20" fill="none" stroke="#fff" stroke-opacity=".5"/>' +
      // door seams
      '<path d="M160 30V334" stroke="#4f5b62" stroke-width="2.4" stroke-opacity=".75"/>' +
      '<path d="M44 338H276" stroke="#4f5b62" stroke-width="2.6" stroke-opacity=".8"/>' +
      '<path d="M45 340H275" stroke="#fff" stroke-opacity=".6"/>' +
      // brushed streaks
      '<g stroke="#fff" stroke-opacity=".14">' + [70, 98, 120, 200, 224, 250].map(function (x) { return '<path d="M' + x + ' 34V326"/><path d="M' + x + ' 352V520"/>'; }).join('') + '</g>' +
      // handles
      '<rect x="141" y="108" width="9" height="150" rx="4.5" fill="url(#g-dark)"/><rect x="170" y="108" width="9" height="150" rx="4.5" fill="url(#g-dark)"/>' +
      '<rect x="142.5" y="112" width="2" height="142" rx="1" fill="#fff" fill-opacity=".45"/><rect x="171.5" y="112" width="2" height="142" rx="1" fill="#fff" fill-opacity=".45"/>' +
      '<rect x="104" y="356" width="112" height="9" rx="4.5" fill="url(#g-dark)"/><rect x="106" y="358" width="108" height="2" rx="1" fill="#fff" fill-opacity=".45"/>' +
      // dispenser
      '<rect x="70" y="110" width="44" height="76" rx="8" fill="#1b252b" fill-opacity=".92"/><rect x="76" y="118" width="32" height="6" rx="3" fill="#7fd0e6" fill-opacity=".8"/>' +
      '<rect x="40" y="18" width="30" height="514" rx="20" fill="#fff" fill-opacity=".18"/>' +
      '<rect x="252" y="18" width="28" height="514" rx="20" fill="#0e1a21" fill-opacity=".16"/>',
      cls);
  }

  function drawer(cls) {
    return wrap('0 0 220 160',
      '<ellipse cx="110" cy="146" rx="84" ry="8" fill="url(#g-shadow)"/>' +
      '<path d="M26 54 L56 30 H182 L198 54 Z" fill="url(#g-glass)" stroke="#fff" stroke-opacity=".8"/>' +
      '<path d="M26 54 L40 126 Q42 134 52 134 H170 Q180 134 182 126 L198 54 Z" fill="url(#g-frost)" stroke="#bcd3da"/>' +
      '<path d="M32 70H192" stroke="#9fc4d1" stroke-opacity=".7"/>' +
      '<rect x="52" y="60" width="116" height="9" rx="4.5" fill="url(#g-dark)"/>' +
      '<rect x="54" y="62" width="112" height="2" rx="1" fill="#fff" fill-opacity=".5"/>' +
      '<path d="M40 100H180" stroke="#fff" stroke-opacity=".7"/>' +
      '<path d="M26 54 L56 30 L56 38" fill="none" stroke="#fff" stroke-opacity=".8"/>', cls);
  }

  function shelf(cls) {
    return wrap('0 0 220 160',
      '<ellipse cx="110" cy="132" rx="86" ry="8" fill="url(#g-shadow)"/>' +
      '<path d="M20 78 L58 42 H200 L170 90 H20 Z" fill="url(#g-glass)" stroke="#fff" stroke-opacity=".9"/>' +
      '<path d="M20 78 H170 V100 Q170 106 164 106 H26 Q20 106 20 100 Z" fill="url(#g-steel)"/>' +
      '<path d="M170 90 L200 42 V62 L170 106 Z" fill="url(#g-blue)" fill-opacity=".85"/>' +
      '<path d="M40 66 L70 50" stroke="#fff" stroke-width="3" stroke-opacity=".7" stroke-linecap="round"/>' +
      '<rect x="20" y="80" width="150" height="3" fill="#fff" fill-opacity=".6"/>', cls);
  }

  function filter(cls) {
    return wrap('0 0 160 190',
      '<ellipse cx="80" cy="176" rx="46" ry="8" fill="url(#g-shadow)"/>' +
      '<path d="M42 46 V150 Q42 168 80 168 Q118 168 118 150 V46 Z" fill="url(#g-blue)" stroke="#fff" stroke-opacity=".7"/>' +
      '<ellipse cx="80" cy="46" rx="38" ry="9" fill="#e9f4f8" stroke="#fff"/>' +
      '<g stroke="#3f7389" stroke-opacity=".28">' + [64, 78, 92, 106, 120, 134, 148].map(function (y) { return '<path d="M44 ' + y + ' Q80 ' + (y + 8) + ' 116 ' + y + '"/>'; }).join('') + '</g>' +
      '<rect x="56" y="18" width="48" height="30" rx="6" fill="url(#g-steel)"/>' +
      '<rect x="64" y="8" width="32" height="14" rx="4" fill="url(#g-dark)"/>' +
      '<rect x="48" y="52" width="9" height="104" rx="4.5" fill="#fff" fill-opacity=".6"/>', cls);
  }

  function bin(cls) {
    return wrap('0 0 220 160',
      '<ellipse cx="110" cy="140" rx="82" ry="8" fill="url(#g-shadow)"/>' +
      '<path d="M24 52 H196 L184 128 Q182 136 174 136 H46 Q38 136 36 128 Z" fill="url(#g-glass)" stroke="#fff" stroke-opacity=".85"/>' +
      '<path d="M24 52 H196 L192 74 H28 Z" fill="url(#g-frost)"/>' +
      '<rect x="20" y="44" width="180" height="12" rx="6" fill="url(#g-rubber)"/>' +
      '<rect x="24" y="46" width="172" height="2.5" rx="1" fill="#fff" fill-opacity=".25"/>' +
      '<path d="M60 74 V132M110 74 V132M160 74 V132" stroke="#9fc4d1" stroke-opacity=".6"/>', cls);
  }

  var byType = { drawer: drawer, shelf: shelf, filter: filter, bin: bin };
  function part(type, cls) { return (byType[type] || shelf)(cls); }

  return { defs: defs, fridge: fridge, drawer: drawer, shelf: shelf, filter: filter, bin: bin, part: part };
})();
