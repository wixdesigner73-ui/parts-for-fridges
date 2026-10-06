/* Parts For Fridges – front-end prototype (hash router, vanilla JS).
 * Catalogue/search behaviour follows the Final Development Scope; on Wix the same rules live in CMS + Velo. */
(function () {
  var D = window.PFF_DATA, S = window.PFFSearch, A = window.PFFArt;
  var INDEX = S.buildIndex(D);
  var app = document.getElementById('app');
  var prefill = { model: '', mpn: '' };

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function brandBy(slug) { return D.brands.filter(function (b) { return b.slug === slug; })[0]; }
  function modelBy(slug) { return D.models.filter(function (m) { return m.slug === slug && m.active; })[0]; }
  function partBy(slug) { return D.parts.filter(function (p) { return p.slug === slug; })[0]; }
  function partsOf(model) { return D.parts.filter(function (p) { return (p.models || []).indexOf(model.slug) > -1; }); }
  function money(n) { try { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: D.currency }).format(n); } catch (e) { return '$' + n; } }
  function inStock(p) { return Number(p.stock) > 0; }
  var ICON = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2l2 11h10.4l2-8H6.3"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/></svg>',
    model: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M6 10h12M9 5.5v2M9 13v3"/></svg>',
    part: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M8 9v6M11 9v6M14 9v6M17 9v6"/></svg>',
    compat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><rect x="3.5" y="3.5" width="17" height="17" rx="4"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>'
  };

  /* ---------- cart (prototype stand-in for Wix Stores cart) ---------- */
  var cart = (function () { try { return JSON.parse(localStorage.getItem('pff_cart') || '[]'); } catch (e) { return []; } })();
  function saveCart() { try { localStorage.setItem('pff_cart', JSON.stringify(cart)); } catch (e) {} renderCartCount(); }
  function cartQty() { return cart.reduce(function (n, i) { return n + i.qty; }, 0); }
  function renderCartCount() { var el = document.querySelector('.cart-count'); if (!el) return; var n = cartQty(); el.textContent = n; el.hidden = !n; }
  function addToCart(slug, qty) {
    var p = partBy(slug); if (!p || !inStock(p)) return;
    var line = cart.filter(function (i) { return i.slug === slug; })[0];
    var max = Number(p.stock);
    if (line) line.qty = Math.min(max, line.qty + qty); else cart.push({ slug: slug, qty: Math.min(max, qty) });
    saveCart(); openCart();
  }
  function openCart() {
    var el = document.getElementById('cart-panel');
    var total = 0;
    var items = cart.map(function (i) {
      var p = partBy(i.slug); if (!p) return ''; total += p.price * i.qty;
      return '<div class="cart-item"><strong>' + esc(p.title) + '</strong><span>' + money(p.price * i.qty) + '</span><small>Qty ' + i.qty + '</small><button data-remove="' + esc(i.slug) + '">Remove</button></div>';
    }).join('');
    el.innerHTML = '<header><h2>Your Cart</h2><button class="x" data-close-cart aria-label="Close cart">✕</button></header>' +
      (items || '<p class="no-results">Your cart is empty.</p>') +
      (items ? '<div class="cart-item"><strong>Subtotal</strong><strong>' + money(total) + '</strong></div>' : '') +
      '<p class="cart-note">Preview cart. Checkout, payment and stock are handled by Wix Stores in the live build.</p>';
    el.hidden = false;
  }

  /* ---------- shared UI ---------- */
  function searchForm(opts) {
    opts = opts || {};
    return '<form class="search ' + (opts.lg ? 'search-lg' : '') + '" role="search" data-search aria-label="' + esc(opts.label || 'Search') + '">' + ICON.search +
      '<input type="search" name="q" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="' + esc(opts.ph) + '" aria-label="' + esc(opts.ph) + '"' + (opts.value ? ' value="' + esc(opts.value) + '"' : '') + '>' +
      '<button class="btn ' + (opts.gold ? 'btn-gold' : 'btn-primary') + '" type="submit">' + esc(opts.cta || 'Search') + '</button></form>';
  }
  function requestBtn(kind, value, label) {
    return '<button class="btn btn-primary" type="button" data-request="' + kind + '" data-value="' + esc(value || '') + '">' + esc(label || 'Request a Part') + '</button>';
  }
  function brandCard(b, i) {
        return '<a class="brand-card reveal" style="--d:' + (i % 3) * 0.07 + 's" href="#/brand/' + b.slug + '" aria-label="' + esc(b.name) + ' refrigerator parts">' +
      '<span class="brand-logo">' + esc(b.name) + '</span>' +
      '<span class="brand-meta"><span>Refrigerator Parts</span><span class="arrow">' + ICON.arrow + '</span></span></a>';
  }
  function crumbs(items) {
    return '<nav class="crumbs" aria-label="Breadcrumb">' + items.map(function (c, i) {
      var last = i === items.length - 1;
      return (i ? '<span aria-hidden="true">→</span>' : '') + (last || !c.href ? '<span aria-current="page">' + esc(c.label) + '</span>' : '<a href="' + c.href + '">' + esc(c.label) + '</a>');
    }).join('') + '</nav>';
  }
  function partCard(p, model) {
    var href = '#/product/' + p.slug + (model ? '?model=' + model.slug : '');
    return '<a class="part-card reveal" href="' + href + '"><div class="part-img">' + A.part(p.type) + '</div><div class="part-body"><h3>' + esc(p.title) + '</h3>' +
      '<span class="mpn">Part No. ' + esc(p.mpn) + '</span><div class="part-foot"><span class="price">' + money(p.price) + '</span>' +
      '<span class="avail ' + (inStock(p) ? 'in' : 'out') + '">' + (inStock(p) ? 'In Stock' : 'Out of Stock') + '</span></div></div></a>';
  }
  function emptyState(art, h, t) {
    return '<div class="empty reveal">' + art + '<h2>' + esc(h) + '</h2><p>' + esc(t) + '</p>' + requestBtn('', '', 'Request a Part') + '</div>';
  }

  /* ---------- header / footer ---------- */
  function megaMenu() {
    var cols = D.brands.filter(function (b) { return b.active; }).map(function (b) {
      var ms = D.models.filter(function (m) { return m.brand === b.slug && m.active; });
      return '<div class="mega-col"><a class="mega-brand" href="#/brand/' + b.slug + '">' + esc(b.name) + '<span class="arrow">' + ICON.arrow + '</span></a>' +
        (ms.length ? '<ul>' + ms.map(function (m) { return '<li><a href="#/model/' + m.slug + '">' + esc(m.number) + '</a></li>'; }).join('') + '</ul>' : '<p>Parts being added</p>') + '</div>';
    }).join('');
    return '<div class="mega" id="mega" hidden><div class="mega-in"><div class="mega-main"><div class="mega-head"><span class="eyebrow">Shop by Brand</span><a class="mega-all" href="#/brands">All Brands ' + ICON.arrow + '</a></div><div class="mega-grid">' + cols + '</div></div>' +
      '<aside class="mega-side"><img src="img/dispenser-detail.jpg" alt="" loading="lazy"><div class="mega-side-in"><h4>Customer Information</h4><ul>' +
      '<li><a href="#/shipping-returns">Shipping &amp; Returns</a></li><li><a href="#/warranty">Warranty</a></li><li><a href="#/privacy">Privacy Policy</a></li><li><a href="#/terms">Terms &amp; Conditions</a></li></ul>' +
      '<button class="btn btn-gold" type="button" data-request="" data-value="">Request a Part</button></div></aside></div></div>';
  }
  function setMega(open) {
    var m = document.getElementById('mega'), t = document.querySelector('[data-mega-toggle]'); if (!m) return;
    m.hidden = !open; t.setAttribute('aria-expanded', open ? 'true' : 'false'); document.body.classList.toggle('mega-open', open);
  }
  function renderHeader() {
        document.getElementById('header').innerHTML = '<div class="wrap"><div class="hd-top">' +
      '<a class="logo" href="#/" aria-label="Parts For Fridges – Home"><img src="img/logo.png" alt="Parts For Fridges" width="200" height="38"></a>' +
      '<div class="hd-search">' + searchForm({ ph: 'Search by model number or part number', label: 'Site search' }) + '</div>' +
      '<button class="cart-btn" type="button" data-open-cart aria-label="Open cart">' + ICON.cart + '<span class="cart-count" hidden>0</span></button></div>' +
      '<nav class="hd-nav" aria-label="Main"><a href="#/" data-nav="home">Home</a><span class="nav-mega"><a href="#/brands" data-nav="brands">Brands</a><button class="mega-toggle" type="button" data-mega-toggle aria-expanded="false" aria-controls="mega" aria-label="Show all brands and models"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m2.5 4.5 3.5 3.5 3.5-3.5"/></svg></button></span></nav>' + megaMenu() + '</div>';
    renderCartCount();
  }
  function renderFooter() {
    document.getElementById('footer').innerHTML = '<div class="wrap"><div class="ft-grid">' +
      '<div class="ft-brand"><a class="logo" href="#/"><img src="img/logo.png" alt="Parts For Fridges" width="200" height="38"></a><p>Find refrigerator replacement parts by brand, model number or manufacturer part number.</p></div>' +
      '<div><h4>Navigation</h4><ul><li><a href="#/">Home</a></li><li><a href="#/brands">Brands</a></li></ul></div>' +
      '<div><h4>Customer Information</h4><ul><li><a href="#/shipping-returns">Shipping &amp; Returns</a></li><li><a href="#/warranty">Warranty</a></li><li><a href="#/privacy">Privacy Policy</a></li><li><a href="#/terms">Terms &amp; Conditions</a></li></ul></div>' +
      '<div><h4>Catalogue</h4><ul class="ft-cat">' + D.brands.filter(function (b) { return b.active; }).map(function (b) { return '<li><a href="#/brand/' + b.slug + '">' + esc(b.name) + '</a></li>'; }).join('') + '</ul></div>' +
      '</div><div class="ft-bottom">© ' + new Date().getFullYear() + ' Parts For Fridges</div></div>';
  }

  /* ---------- pages ---------- */
  function homePage() {
    var stepArt = [A.fridge(), A.bin(), A.drawer(), A.filter()];
    var steps = [
      ['Choose Your Brand', 'Select the manufacturer of your refrigerator.'],
      ['Select Your Model', 'Choose your exact refrigerator model from the available catalogue.'],
      ['Find Your Part', 'Browse parts associated with that specific refrigerator model.'],
      ['Order Your Part', 'Select the required part and purchase it through the online store.']
    ];
    var ben = [
      [ICON.model, 'Exact Model Search', 'Find parts associated with your specific refrigerator model.'],
      [ICON.part, 'Manufacturer Part Numbers', 'Search directly using the manufacturer\'s part number.'],
      [ICON.compat, 'Compatibility Information', 'View compatible refrigerator models on applicable product pages.'],
      [ICON.bag, 'Online Ordering', 'Select your part and purchase through the online store.']
    ];
    return '' +
    '<section class="hero"><div class="wrap hero-grid"><div class="hero-copy">' +
      '<span class="eyebrow hero-in">Refrigerator Replacement Parts</span>' +
      '<h1 class="hero-in" style="--d:.08s">Find the Right Part for Your <em>Refrigerator</em></h1>' +
      '<p class="lead hero-in" style="--d:.16s">Search by your refrigerator model number or manufacturer part number to find the parts available for your appliance.</p>' +
      '<div class="hero-in" style="--d:.24s">' + searchForm({ lg: true, ph: 'Search by model number or part number', cta: 'Search', label: 'Primary search' }) +
      '<p class="field-note">Enter the complete model number or manufacturer part number.</p>' +
      '<div class="hero-actions"><a class="btn btn-ghost" href="#/brands">Browse Brands</a></div></div></div>' +
      '<div class="hero-visual hero-in" style="--d:.2s" aria-hidden="true"><div class="hv-shape"></div><img class="hv-photo" src="img/hero-kitchen.jpg" alt="" fetchpriority="high">' +
      '<div class="fl a">' + A.drawer() + '</div><div class="fl b">' + A.filter() + '</div></div></div></section>' +

    '<section class="section" id="brands"><div class="wrap"><div class="sec-head reveal"><span class="eyebrow">Shop by Brand</span><h2 class="h2">Find Parts by Refrigerator Brand</h2>' +
      '<p class="lead">Select your refrigerator brand to explore available models and compatible replacement parts.</p></div>' +
      '<div class="brand-grid">' + D.brands.filter(function (b) { return b.active; }).map(brandCard).join('') + '</div></div></section>' +

    '<section class="section steps-sec"><div class="wrap"><div class="sec-head reveal"><span class="eyebrow">Simple Part Finding</span><h2 class="h2">Find Your Part in Four Steps</h2></div>' +
      '<div class="steps">' + steps.map(function (s, i) {
        return '<div class="step reveal" style="--d:' + i * .08 + 's"><span class="step-no">0' + (i + 1) + '</span><div class="step-art" aria-hidden="true">' + stepArt[i] + '</div><h3>' + s[0] + '</h3><p>' + s[1] + '</p></div>';
      }).join('') + '</div></div></section>' +

    '<section class="section search-sec"><div class="wrap">' +
      '<div class="panel reveal"><div><span class="eyebrow">Model Search</span><h2 class="h2">Know Your Model Number? Start Here.</h2>' +
        '<p class="lead">Enter your complete refrigerator model number to find the available parts associated with your appliance.</p>' +
        searchForm({ lg: true, ph: 'Enter refrigerator model number', cta: 'Find Parts', label: 'Model number search' }) +
        '<p class="field-note">Use the complete model number for the most accurate result.</p></div>' +
        '<div class="panel-art photo" aria-hidden="true"><img src="img/dispenser-detail.jpg" alt="" loading="lazy"><div class="fl pf">' + A.filter() + '</div></div></div>' +
      '<div class="panel alt flip reveal" style="margin-top:clamp(16px,3vw,32px)"><div><span class="eyebrow">Part Number Search</span><h2 class="h2">Already Have a Part Number?</h2>' +
        '<p class="lead">Search by manufacturer part number to quickly find the matching part in our catalogue.</p>' +
        searchForm({ lg: true, ph: 'Enter manufacturer part number', cta: 'Search Part', label: 'Part number search', gold: true }) + '</div>' +
        '<div class="panel-art photo" aria-hidden="true"><img src="img/open-fridge.jpg" alt="" loading="lazy" style="object-position:60% 55%"><div class="fl pf">' + A.bin() + '</div></div></div>' +
    '</div></section>' +

    '<section class="section request" id="request"><div class="wrap request-grid"><div class="reveal"><span class="eyebrow">Can\'t Find Your Part?</span><h2 class="h2">Request a Part</h2>' +
      '<p class="lead">Can\'t find your refrigerator model or the part you need? Send us the details and we\'ll have your request available for the appropriate follow-up.</p></div>' +
      requestForm() + '</div></section>' +

    '<section class="section"><div class="wrap"><div class="sec-head reveal"><span class="eyebrow">A Clearer Way to Find Parts</span><h2 class="h2">Search With Confidence</h2></div>' +
      '<div class="benefits trust">' + ben.map(function (b, i) { return '<div class="benefit reveal" style="--d:' + i * .08 + 's"><div class="b-ico">' + b[0] + '</div><h3>' + b[1] + '</h3><p>' + b[2] + '</p></div>'; }).join('') + '</div></div></section>' +

    '<section class="section featured"><div class="wrap feat-grid"><div class="reveal"><span class="eyebrow">Catalogue</span><h2 class="h2">The Parts You Need, Clearly Presented</h2>' +
      '<p class="lead">Explore refrigerator replacement parts with product information and compatibility details designed to help you identify the right part for your appliance.</p></div>' +
      '<div class="feat-stage reveal" aria-hidden="true"><img class="feat-photo" src="img/open-fridge.jpg" alt="" loading="lazy"><div class="fl p1">' + A.drawer() + '</div><div class="fl p2">' + A.shelf() + '</div><div class="fl p3">' + A.filter() + '</div></div></div></section>' +

    '<section class="section final"><div class="wrap"><div class="final-card on-dark reveal"><div class="deco l" aria-hidden="true">' + A.drawer() + '</div><div class="deco r" aria-hidden="true">' + A.filter() + '</div>' +
      '<h2>Looking for a Specific Refrigerator Part?</h2><p>Search by model number or manufacturer part number to find the parts available for your refrigerator.</p>' +
      '<div class="row"><button class="btn btn-primary" data-focus-search>Search Parts</button><a class="btn btn-ghost" href="#/brands">Browse Brands</a></div></div></div></section>';
  }

  function requestForm() {
    var opts = '<option value="">Select a brand</option>' + D.brands.map(function (b) { return '<option>' + esc(b.name) + '</option>'; }).join('') + '<option>Other</option>';
    var prefilled = prefill.model || prefill.mpn;
    return '<div class="form-card reveal"><h3>Tell Us What You Need</h3>' +
      (prefilled ? '<p class="prefill-note">We\'ve filled in what you searched for: ' + esc(prefill.model || prefill.mpn) + '</p>' : '') +
      '<form data-request-form novalidate><div class="fgrid">' +
      '<div class="f"><label for="rq-name">Name</label><input id="rq-name" name="name" required autocomplete="name"></div>' +
      '<div class="f"><label for="rq-email">Email</label><input id="rq-email" name="email" type="email" required autocomplete="email"></div>' +
      '<div class="f"><label for="rq-brand">Refrigerator Brand</label><select id="rq-brand" name="brand">' + opts + '</select></div>' +
      '<div class="f"><label for="rq-model">Refrigerator Model Number</label><input id="rq-model" name="model" value="' + esc(prefill.model) + '"></div>' +
      '<div class="f full"><label for="rq-mpn">Manufacturer Part Number</label><input id="rq-mpn" name="mpn" value="' + esc(prefill.mpn) + '"></div>' +
      '<div class="f full"><label for="rq-desc">Part Description</label><input id="rq-desc" name="desc"></div>' +
      '<div class="f full"><label for="rq-msg">Message</label><textarea id="rq-msg" name="msg"></textarea></div></div>' +
      '<button class="btn btn-primary" type="submit">Submit Part Request</button><div data-form-status role="status"></div></form></div>';
  }

  function brandsPage() {
    return '<section class="page-hero"><div class="wrap"><span class="eyebrow">Our Brands</span><h1>Find Parts by Brand</h1><p class="lead">Choose your refrigerator manufacturer to explore available models and replacement parts.</p></div></section>' +
      '<section class="section"><div class="wrap"><div class="brand-grid">' + D.brands.filter(function (b) { return b.active; }).map(brandCard).join('') + '</div></div></section>';
  }

  function brandPage(slug) {
    var b = brandBy(slug); if (!b || !b.active) return notFound();
    var models = D.models.filter(function (m) { return m.brand === b.slug && m.active; });
    var N = esc(b.name);
    var body = models.length
      ? '<div class="model-list">' + models.map(function (m, i) {
          return '<a class="model-card reveal" style="--d:' + i * .06 + 's" href="#/model/' + m.slug + '"><small>' + N + '</small><span class="num">' + esc(m.number) + '</span><span class="brand-meta" style="margin:0"><span>View parts</span><span class="arrow">' + ICON.arrow + '</span></span></a>';
        }).join('') + '</div>'
      : emptyState(A.fridge(), 'Parts for this brand are being added', 'There are currently no active refrigerator models available for this brand. If you need a specific part, you can submit a Request a Part.');
    return '<section class="page-hero"><div class="wrap">' + crumbs([{ label: 'Brands', href: '#/brands' }, { label: b.name }]) +
      '<span class="eyebrow">' + N + ' Refrigerator Parts</span><h1>' + N + ' Refrigerator Parts</h1>' +
      '<p class="lead">Explore available replacement parts for ' + N + ' refrigerator models in our catalogue. Select your refrigerator model to view the parts associated with it.</p></div></section>' +
      '<section class="section"><div class="wrap"><div class="sec-head reveal"><h2 class="h2" style="font-size:clamp(1.6rem,3vw,2.3rem)">Available Refrigerator Models</h2>' +
      '<p class="lead">Select your exact refrigerator model to browse its available parts.</p></div>' + body + '</div></section>';
  }

  function modelPage(slug, q) {
    var m = modelBy(slug); if (!m) return notFound();
    var b = brandBy(m.brand), parts = partsOf(m);
    var NUM = esc(m.number);
    var shown = parts;
    if (q) {
      var nq = S.normalize(q), lq = q.trim().toLowerCase();
      shown = parts.filter(function (p) { return S.normalize(p.mpn) === nq || (lq && p.title.toLowerCase().indexOf(lq) > -1); });
    }
    var body;
    if (!parts.length) body = emptyState(A.drawer(), 'Parts Are Currently Unavailable', 'There are currently no available parts listed for this refrigerator model. If you need a specific part, you can submit a Request a Part.');
    else {
      body = '<div class="sec-head reveal"><h2 class="h2" style="font-size:clamp(1.6rem,3vw,2.3rem)">Available Parts</h2><p class="lead">Explore the available replacement parts for this refrigerator model.</p></div>' +
        (shown.length ? '<div class="parts-grid">' + shown.map(function (p) { return partCard(p, m); }).join('') + '</div>' : '<p class="no-results">No parts for this model match “' + esc(q) + '”.</p>');
    }
    var search = parts.length ? '<div class="model-search reveal"><h2>Search Parts for This Model</h2><p>Search only within the parts associated with this refrigerator model.</p>' +
      '<form class="search" data-model-search="' + m.slug + '" role="search">' + ICON.search + '<input type="search" name="q" value="' + esc(q || '') + '" placeholder="Search by part number or part name" aria-label="Search by part number or part name" autocomplete="off"><button class="btn btn-primary" type="submit">Search</button></form></div>' : '';
    return '<section class="page-hero"><div class="wrap">' + crumbs([{ label: 'Brands', href: '#/brands' }, { label: b.name, href: '#/brand/' + b.slug }, { label: m.number }]) +
      '<span class="eyebrow">' + esc(b.name) + ' Refrigerator Parts</span><h1>' + NUM + ' Refrigerator Parts</h1>' +
      '<p class="lead">Browse replacement parts associated with the ' + NUM + ' refrigerator model.</p></div></section>' +
      '<section class="section"><div class="wrap">' + search + body + '</div></section>';
  }

  function productPage(slug, q) {
    var p = partBy(slug); if (!p) return notFound();
    var active = (p.models || []).map(modelBy).filter(Boolean);
    // breadcrumb keeps the active model the customer came through; neutral fallback otherwise
    var via = q.model && active.filter(function (m) { return m.slug === q.model; })[0];
    var trail = [{ label: 'Brands', href: '#/brands' }];
    if (via) { var vb = brandBy(via.brand); trail.push({ label: vb.name, href: '#/brand/' + vb.slug }, { label: via.number, href: '#/model/' + via.slug }); }
    trail.push({ label: p.title });
    var compatOnly = (p.compat || []);
    var chips = active.map(function (m) { return '<a class="chip" href="#/model/' + m.slug + '">' + esc(m.number) + '</a>'; }).join('') +
      compatOnly.map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('');
    var ok = inStock(p);
    return '<div class="wrap">' + '<div style="padding-top:28px">' + crumbs(trail) + '</div>' +
      '<div class="product" style="padding-top:0"><div class="product-img" aria-hidden="true">' + A.part(p.type) + '</div><div>' +
      '<span class="avail ' + (ok ? 'in' : 'out') + '">' + (ok ? 'In Stock' : 'Out of Stock') + '</span><h1>' + esc(p.title) + '</h1><div class="price">' + money(p.price) + '</div>' +
      (p.description ? '<p class="lead">' + esc(p.description) + '</p>' : '') +
      '<div class="buy"><div class="qty"><button type="button" data-qty="-1" aria-label="Decrease quantity">−</button><input id="qty" type="number" min="1" max="' + Math.max(1, p.stock) + '" value="1" aria-label="Quantity"><button type="button" data-qty="1" aria-label="Increase quantity">+</button></div>' +
      '<button class="btn btn-primary" data-add="' + esc(p.slug) + '"' + (ok ? '' : ' disabled') + '>Add to Cart</button></div>' +
      '<div class="detail-block"><h2>Part Details</h2><dl class="dl"><dt>Manufacturer Part Number</dt><dd>' + esc(p.mpn) + '</dd><dt>Parts For Fridges SKU</dt><dd>' + esc(p.sku) + '</dd><dt>Availability</dt><dd>' + (ok ? 'In Stock' : 'Out of Stock') + '</dd></dl></div>' +
      '<div class="detail-block"><h2>Compatible Refrigerator Models</h2><p class="compat-note">This part is associated with the following refrigerator models in our catalogue.</p><div class="chips">' + (chips || '<span class="compat-note">No models listed yet.</span>') + '</div></div>' +
      '</div></div></div>';
  }

  function searchPage(q) {
    var r = S.resolve(q, D, INDEX);
    var tag = q ? '<span class="query-tag">' + esc(q) + '</span>' : '';
    var h, extra = '', kind = '', val = q;
    if (r.type === 'model-inactive') { h = 'We don’t currently have a dedicated parts page for ' + esc(r.model.number) + '.'; kind = 'model'; val = r.model.number; }
    else if (r.type === 'part-unavailable') { h = 'We don’t currently have part ' + esc(q) + ' available.'; kind = 'mpn'; }
    else if (r.type === 'empty') { return '<div class="wrap"><div class="result"><h1>Search by model number or part number</h1><p>Enter the complete model number or manufacturer part number.</p></div></div>'; }
    else { h = 'We couldn\'t find an exact match for your search.'; extra = '<p>Please check the complete model or part number, or submit a Request a Part request.</p>'; }
    return '<div class="wrap"><div class="result">' + tag + '<h1>' + h + '</h1>' + extra + requestBtn(kind, val) + '</div></div>';
  }

  var INFO = {
    'shipping-returns': ['Shipping & Returns', 'Information about shipping, returns and refunds for Parts For Fridges orders will be provided here.', ['Shipping Information', 'Returns & Refunds', 'Order Information', 'Contact / Request Assistance']],
    'warranty': ['Warranty', 'Warranty information for Parts For Fridges products will be provided here.', []],
    'privacy': ['Privacy Policy', '', []],
    'terms': ['Terms & Conditions', '', []]
  };
  function infoPage(key) {
    var i = INFO[key];
    return '<section class="page-hero"><div class="wrap"><h1>' + esc(i[0]) + '</h1>' + (i[1] ? '<p class="lead">' + esc(i[1]) + '</p>' : '') + '</div></section>' +
      '<div class="wrap"><div class="info">' + (i[2].length ? i[2].map(function (s) { return '<section><h2>' + esc(s) + '</h2><span class="pending">Client-approved content to be added</span></section>'; }).join('') : '<section><span class="pending">Client-approved content to be added</span></section>') + '</div></div>';
  }
  function notFound() {
    return '<div class="wrap"><div class="result"><h1>Page not found</h1><p>The page you are looking for isn\'t available.</p><a class="btn btn-primary" href="#/">Back to Home</a></div></div>';
  }

  /* ---------- router ---------- */
  function parse() {
    var h = location.hash.replace(/^#/, '') || '/';
    var qi = h.indexOf('?'), path = qi > -1 ? h.slice(0, qi) : h, qs = {};
    if (qi > -1) h.slice(qi + 1).split('&').forEach(function (kv) { var a = kv.split('='); if (a[0]) qs[a[0]] = decodeURIComponent((a[1] || '').replace(/\+/g, ' ')); });
    return { path: path.replace(/\/+$/, '') || '/', parts: path.split('/').filter(Boolean), q: qs };
  }
  var TITLES = { '': 'Refrigerator Replacement Parts' };
  function route() {
    var r = parse(), p = r.parts, html, title = 'Parts For Fridges', nav = '';
    if (!p.length) { html = homePage(); nav = 'home'; }
    else if (p[0] === 'brands') { html = brandsPage(); nav = 'brands'; title = 'Find Parts by Brand'; }
    else if (p[0] === 'brand') { html = brandPage(p[1]); nav = 'brands'; var b = brandBy(p[1]); if (b) title = b.name + ' Refrigerator Parts'; }
    else if (p[0] === 'model') { html = modelPage(p[1], r.q.q); nav = 'brands'; var m = modelBy(p[1]); if (m) title = m.number + ' Refrigerator Parts'; }
    else if (p[0] === 'product') { html = productPage(p[1], r.q); nav = 'brands'; var pr = partBy(p[1]); if (pr) title = pr.title; }
    else if (p[0] === 'search') { html = searchPage(r.q.q || ''); title = 'Search'; }
    else if (INFO[p[0]]) { html = infoPage(p[0]); title = INFO[p[0]][0]; }
    else { html = notFound(); title = 'Page not found'; }
    setMega(false);
    app.innerHTML = html;
    document.title = title + (title === 'Parts For Fridges' ? '' : ' | Parts For Fridges');
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.toggleAttribute('aria-current', a.dataset.nav === nav); if (a.dataset.nav === nav) a.setAttribute('aria-current', 'page'); });
    if (pendingScroll) { var t = pendingScroll; pendingScroll = null; setTimeout(function () { var el = document.getElementById(t); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60); }
    else window.scrollTo(0, 0);
    initReveal();
    initParallax();
  }
  var pendingScroll = null;

  function initReveal() {
    var els = app.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }
  function initParallax() {
    var st = document.getElementById('hero-stage');
    if (!st || matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(hover: none)').matches) return;
    var layers = st.querySelectorAll('[data-depth]');
    st.parentNode.addEventListener('mousemove', function (e) {
      var r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      layers.forEach(function (l) { var d = +l.dataset.depth; l.style.transform = 'translate(' + (-x * d).toFixed(1) + 'px,' + (-y * d).toFixed(1) + 'px)'; });
    });
  }

  function goSearch(q) { location.hash = '#/search?q=' + encodeURIComponent(q); }
  function runSearch(q) {
    var r = S.resolve(q, D, INDEX);
    if (r.type === 'model') location.hash = '#/model/' + r.model.slug;
    else if (r.type === 'part') location.hash = '#/product/' + r.part.slug;
    else goSearch(q);   // controlled message states – never guess or silently redirect
  }
  function openRequest(kind, value) {
    prefill = { model: kind === 'model' ? value : '', mpn: kind === 'mpn' ? value : '' };
    pendingScroll = 'request';
    if (location.hash === '#/' || location.hash === '' || location.hash === '#') route(); else location.hash = '#/';
  }

  /* ---------- events ---------- */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.matches('[data-search]')) { e.preventDefault(); var v = f.q.value; if (v.trim()) runSearch(v); else f.q.focus(); }
    else if (f.matches('[data-model-search]')) { e.preventDefault(); location.hash = '#/model/' + f.dataset.modelSearch + (f.q.value.trim() ? '?q=' + encodeURIComponent(f.q.value.trim()) : ''); }
    else if (f.matches('[data-request-form]')) {
      e.preventDefault();
      var st = f.querySelector('[data-form-status]');
      if (!f.name.value.trim() || !/^\S+@\S+\.\S+$/.test(f.email.value)) { st.innerHTML = '<p class="form-ok" style="background:#fbeae6;color:#8a2f1c">Please enter your name and a valid email address.</p>'; return; }
      // Prototype: stored locally. On Wix this inserts into a "PartRequests" CMS collection via Velo.
      try { var all = JSON.parse(localStorage.getItem('pff_requests') || '[]'); all.push({ at: new Date().toISOString(), name: f.name.value, email: f.email.value, brand: f.brand.value, model: f.model.value, mpn: f.mpn.value, desc: f.desc.value, msg: f.msg.value }); localStorage.setItem('pff_requests', JSON.stringify(all)); } catch (x) {}
      st.innerHTML = '<p class="form-ok">Thank you. Your part request has been submitted.</p>'; f.reset(); prefill = { model: '', mpn: '' };
    }
  });
  document.addEventListener('click', function (e) {
    var tg = e.target.closest('[data-mega-toggle]');
    if (tg) { setMega(tg.getAttribute('aria-expanded') !== 'true'); return; }
    if (!e.target.closest('#mega, .nav-mega')) setMega(false); else if (e.target.closest('#mega a, #mega button')) setMega(false);
    var t = e.target.closest('[data-request],[data-open-cart],[data-close-cart],[data-remove],[data-add],[data-qty],[data-focus-search]');
    if (!t) { var cp = document.getElementById('cart-panel'); if (!cp.hidden && !e.target.closest('#cart-panel')) cp.hidden = true; return; }
    if (t.hasAttribute('data-request')) openRequest(t.dataset.request, t.dataset.value);
    else if (t.hasAttribute('data-open-cart')) { e.stopPropagation(); openCart(); }
    else if (t.hasAttribute('data-close-cart')) document.getElementById('cart-panel').hidden = true;
    else if (t.hasAttribute('data-remove')) { cart = cart.filter(function (i) { return i.slug !== t.dataset.remove; }); saveCart(); openCart(); }
    else if (t.hasAttribute('data-add')) addToCart(t.dataset.add, Math.max(1, parseInt(document.getElementById('qty').value, 10) || 1));
    else if (t.hasAttribute('data-qty')) { var i = document.getElementById('qty'); i.value = Math.min(+i.max, Math.max(1, (+i.value || 1) + +t.dataset.qty)); }
    else if (t.hasAttribute('data-focus-search')) { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(function () { var i = document.querySelector('.hd-search input'); if (i) i.focus(); }, 350); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { document.getElementById('cart-panel').hidden = true; setMega(false); } });
  // hover-open on pointer devices
  var hoverT;
  document.addEventListener('mouseover', function (e) {
    if (!matchMedia('(hover: hover)').matches) return;
    var inside = e.target.closest('.nav-mega, #mega');
    clearTimeout(hoverT);
    if (inside) hoverT = setTimeout(function () { setMega(true); }, 80);
    else if (document.body.classList.contains('mega-open')) hoverT = setTimeout(function () { setMega(false); }, 220);
  });
  window.addEventListener('hashchange', route);

  A && (document.getElementById('art-defs').innerHTML = A.defs);
  renderHeader(); renderFooter(); route();
})();
