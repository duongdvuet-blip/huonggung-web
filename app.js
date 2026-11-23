/* ==========================================================================
   Hương Gừng — Đọc dữ liệu từ data.js & xử lý đặt hàng thật qua Zalo
   ========================================================================== */

(function () {
  "use strict";

  var DATA = window.HUONGGUNG_DATA || {};
  var SHOP = DATA.shop || {};
  var CATEGORIES = Array.isArray(DATA.categories) ? DATA.categories : [];
  var PRODUCTS = Array.isArray(DATA.products) ? DATA.products : [];
  var ARTICLES = Array.isArray(DATA.articles) ? DATA.articles : [];
  var FAQS = Array.isArray(DATA.faqs) ? DATA.faqs : [];

  var SHIPPING_FEE = typeof SHOP.shippingFee === "number" ? SHOP.shippingFee : 30000;
  var FREE_SHIP_THRESHOLD =
    typeof SHOP.freeShipThreshold === "number" ? SHOP.freeShipThreshold : 350000;
  var SHOP_PHONE = (SHOP.phone || "0369482927").replace(/\D/g, "");
  var SHOP_PHONE_DISPLAY = SHOP.phoneDisplay || "0369 482 927";
  var ZALO_URL = "https://zalo.me/" + SHOP_PHONE;
  var STORAGE_KEY = "huonggung_cart_v1";

  var defaultVariants = {};
  for (var pIdx = 0; pIdx < PRODUCTS.length; pIdx++) {
    var prodItem = PRODUCTS[pIdx];
    if (Array.isArray(prodItem.variants) && prodItem.variants.length > 0) {
      defaultVariants[prodItem.id] = prodItem.variants[0].id;
    }
  }

  var state = {
    filter: "all",
    selectedVariants: defaultVariants,
    cart: loadCart(),
    draftOrderCode: generateOrderCode(),
    submittedOrder: null
  };

  var toastTimer = null;

  var filterTabsEl = document.getElementById("filter-tabs");
  var menuGridEl = document.getElementById("menu-grid");
  var upcomingOnlyNoteEl = document.getElementById("upcoming-only-note");
  var upcomingBoxEl = document.getElementById("upcoming-box");
  var upcomingGridEl = document.getElementById("upcoming-grid");
  var articleGridEl = document.getElementById("article-grid");
  var faqListEl = document.getElementById("faq-list");
  var cartCountEl = document.getElementById("cart-count");
  var openCartBtn = document.getElementById("open-cart-btn");

  var detailBackdrop = document.getElementById("detail-backdrop");
  var detailCodeEl = document.getElementById("detail-code");
  var detailTitleEl = document.getElementById("detail-title");
  var detailBodyEl = document.getElementById("detail-body");
  var closeDetailBtn = document.getElementById("close-detail-btn");

  var articleBackdrop = document.getElementById("article-backdrop");
  var articleModalMetaEl = document.getElementById("article-modal-meta");
  var articleModalTitleEl = document.getElementById("article-modal-title");
  var articleModalBodyEl = document.getElementById("article-modal-body");
  var closeArticleBtn = document.getElementById("close-article-btn");

  var cartBackdrop = document.getElementById("cart-backdrop");
  var cartBodyEl = document.getElementById("cart-body");
  var closeCartBtn = document.getElementById("close-cart-btn");

  var toastEl = document.getElementById("toast-note");
  var toastTextEl = document.getElementById("toast-text");
  var toastOpenCartBtn = document.getElementById("toast-open-cart");
  var toastZaloLink = document.getElementById("toast-zalo-link");

  function formatVnd(amount) {
    return Number(amount || 0)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function generateOrderCode() {
    return "HG-" + Math.floor(1000 + Math.random() * 9000);
  }

  function loadCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
    } catch (e) {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  }

  function copyTextToClipboard(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          if (onDone) onDone(true);
        },
        function () {
          fallbackCopy(text, onDone);
        }
      );
      return;
    }
    fallbackCopy(text, onDone);
  }

  function fallbackCopy(text, onDone) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (onDone) onDone(!!ok);
    } catch (e) {
      if (onDone) onDone(false);
    }
  }

  function getCategoryLabel(catId) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === catId) return CATEGORIES[i].label;
    }
    return catId;
  }

  function findProduct(productId) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === productId) return PRODUCTS[i];
    }
    return null;
  }

  function findArticle(articleId) {
    for (var i = 0; i < ARTICLES.length; i++) {
      if (ARTICLES[i].id === articleId) return ARTICLES[i];
    }
    return null;
  }

  function findVariant(product, variantId) {
    var list = Array.isArray(product.variants) ? product.variants : [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === variantId) return list[i];
    }
    return list[0] || { id: "default", label: "Tiêu chuẩn", price: 0 };
  }

  function getCartTotals() {
    var count = 0;
    var subtotal = 0;
    for (var i = 0; i < state.cart.length; i++) {
      var item = state.cart[i];
      count += item.qty;
      subtotal += item.price * item.qty;
    }
    var shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;
    return {
      count: count,
      subtotal: subtotal,
      shipping: shipping,
      total: subtotal + shipping
    };
  }

  function updateCartBadge() {
    var totals = getCartTotals();
    cartCountEl.textContent = String(totals.count);
    if (totals.count > 0) {
      openCartBtn.classList.add("has-items");
    } else {
      openCartBtn.classList.remove("has-items");
    }
  }

  function hideToast() {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
    toastEl.hidden = true;
  }

  function showToast(message, mode) {
    toastTextEl.textContent = message;
    if (mode === "zalo") {
      toastOpenCartBtn.hidden = true;
      toastZaloLink.hidden = false;
      toastZaloLink.href = ZALO_URL;
      toastZaloLink.textContent = "Mở Zalo " + SHOP_PHONE_DISPLAY + " →";
    } else {
      toastOpenCartBtn.hidden = false;
      toastZaloLink.hidden = true;
    }
    toastEl.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.hidden = true;
    }, 4000);
  }

  // Đồng bộ thông tin cửa hàng từ data.js vào giao diện
  function applyShopInfo() {
    var brandEl = document.getElementById("brand-name-text");
    var stampEl = document.getElementById("brand-stamp-text");
    var eyebrowEl = document.getElementById("hero-eyebrow");
    var titleEl = document.getElementById("hero-title");
    var letterEl = document.getElementById("hero-letter");
    var heroImgEl = document.getElementById("hero-img");
    var heroCaptionEl = document.getElementById("hero-caption");

    if (brandEl && SHOP.brandName) brandEl.textContent = SHOP.brandName;
    if (stampEl && SHOP.stampText) stampEl.textContent = SHOP.stampText;
    if (eyebrowEl && SHOP.eyebrow) eyebrowEl.textContent = SHOP.eyebrow;

    if (titleEl && SHOP.heroTitle) {
      var fullTitle = SHOP.heroTitle;
      var hl = SHOP.heroHighlight || "";
      if (hl && fullTitle.indexOf(hl) !== -1) {
        var parts = fullTitle.split(hl);
        titleEl.innerHTML =
          escapeHtml(parts[0]) + "<em>" + escapeHtml(hl) + "</em>" + escapeHtml(parts.slice(1).join(hl));
      } else {
        titleEl.textContent = fullTitle;
      }
    }

    if (letterEl && Array.isArray(SHOP.heroParagraphs) && SHOP.heroParagraphs.length > 0) {
      var pHtml = "";
      for (var i = 0; i < SHOP.heroParagraphs.length; i++) {
        pHtml += "<p>" + escapeHtml(SHOP.heroParagraphs[i]) + "</p>";
      }
      letterEl.innerHTML = pHtml;
    }

    if (heroImgEl && SHOP.heroImage) heroImgEl.src = SHOP.heroImage;
    if (heroCaptionEl && SHOP.heroCaption) heroCaptionEl.textContent = SHOP.heroCaption;

    var heroZalo = document.getElementById("hero-zalo-btn");
    var contactZalo = document.getElementById("contact-zalo-btn");
    var contactTel = document.getElementById("contact-tel-btn");
    var phoneEl = document.getElementById("shop-phone");
    var addrEl = document.getElementById("shop-address");
    var schedEl = document.getElementById("shop-schedule");
    var shipEl = document.getElementById("shop-ship");
    var policyEl = document.getElementById("shop-policy");
    var footerSubEl = document.getElementById("footer-sub");

    if (heroZalo) {
      heroZalo.href = ZALO_URL;
      heroZalo.textContent = "Nhắn Zalo " + SHOP_PHONE_DISPLAY;
    }
    if (contactZalo) contactZalo.href = ZALO_URL;
    if (contactTel) {
      contactTel.href = "tel:" + SHOP_PHONE;
      contactTel.textContent = "Gọi " + SHOP_PHONE_DISPLAY;
    }
    if (phoneEl) phoneEl.textContent = SHOP_PHONE_DISPLAY;
    if (addrEl && SHOP.address) addrEl.textContent = SHOP.address;
    if (schedEl && SHOP.schedule) schedEl.textContent = SHOP.schedule;
    if (shipEl) {
      shipEl.textContent =
        "Đồng giá " + formatVnd(SHIPPING_FEE) + " · Miễn ship từ " + formatVnd(FREE_SHIP_THRESHOLD);
    }
    if (policyEl && SHOP.policy) policyEl.textContent = SHOP.policy;
    if (footerSubEl) {
      footerSubEl.innerHTML =
        escapeHtml(SHOP.address || "Phường Phố Hiến, Thành phố Hưng Yên") +
        ' · <span class="nowrap">Zalo ' +
        escapeHtml(SHOP_PHONE_DISPLAY) +
        "</span>";
    }
    toastZaloLink.href = ZALO_URL;
  }

  function renderFilterTabs() {
    var html =
      '<button type="button" class="filter-tab' +
      (state.filter === "all" ? " is-active" : "") +
      '" data-filter="all" role="tab" aria-selected="' +
      (state.filter === "all" ? "true" : "false") +
      '">Tất cả</button>';

    for (var i = 0; i < CATEGORIES.length; i++) {
      var cat = CATEGORIES[i];
      var isAct = state.filter === cat.id;
      html +=
        '<button type="button" class="filter-tab' +
        (isAct ? " is-active" : "") +
        '" data-filter="' +
        escapeHtml(cat.id) +
        '" role="tab" aria-selected="' +
        (isAct ? "true" : "false") +
        '">' +
        escapeHtml(cat.label) +
        "</button>";
    }
    filterTabsEl.innerHTML = html;
  }

  function renderMenu() {
    var activeProducts = [];
    var upcomingProducts = [];

    for (var i = 0; i < PRODUCTS.length; i++) {
      var prod = PRODUCTS[i];
      if (state.filter !== "all" && prod.category !== state.filter) continue;
      if (prod.statusType === "upcoming") {
        upcomingProducts.push(prod);
      } else {
        activeProducts.push(prod);
      }
    }

    if (activeProducts.length === 0) {
      menuGridEl.innerHTML = "";
    } else {
      var html = "";
      for (var j = 0; j < activeProducts.length; j++) {
        var p = activeProducts[j];
        var variants = Array.isArray(p.variants) ? p.variants : [];
        var activeVariantId = state.selectedVariants[p.id] || (variants[0] && variants[0].id);
        var activeVariant = findVariant(p, activeVariantId);
        var isOut = p.statusType === "out_of_stock";

        var variantButtonsHtml = "";
        for (var v = 0; v < variants.length; v++) {
          var vr = variants[v];
          var isSelected = vr.id === activeVariant.id;
          variantButtonsHtml +=
            '<button type="button" class="variant-btn' +
            (isSelected ? " is-selected" : "") +
            '" data-action="select-variant" data-product="' +
            escapeHtml(p.id) +
            '" data-variant="' +
            escapeHtml(vr.id) +
            '">' +
            escapeHtml(vr.label) +
            " — " +
            formatVnd(vr.price) +
            "</button>";
        }

        var actionButtonHtml = isOut
          ? '<button type="button" class="btn-add is-muted" data-action="notify-upcoming" data-upcoming-name="' +
            escapeHtml(p.name) +
            '">Tạm hết mẻ · Nhắn Zalo đặt trước</button>'
          : '<button type="button" class="btn-add" data-action="add-to-cart" data-product="' +
            escapeHtml(p.id) +
            '">Thêm vào giỏ</button>';

        html +=
          '<article class="product-card" data-product-id="' +
          escapeHtml(p.id) +
          '">' +
          '<div class="product-photo">' +
          '<img src="' +
          escapeHtml(p.image || "assets/hero-gung.jpg") +
          '" alt="' +
          escapeHtml(p.imageAlt || p.name) +
          '" loading="lazy" />' +
          "</div>" +
          '<div class="product-body">' +
          '<div class="product-meta">' +
          '<span class="product-code">' +
          escapeHtml(p.code) +
          "</span>" +
          "<span>·</span>" +
          "<span>" +
          escapeHtml(p.status) +
          "</span>" +
          "</div>" +
          '<div class="product-head">' +
          '<h3 class="product-name">' +
          escapeHtml(p.name) +
          "</h3>" +
          '<span class="product-price" data-price-for="' +
          escapeHtml(p.id) +
          '">' +
          formatVnd(activeVariant.price) +
          "</span>" +
          "</div>" +
          '<p class="product-desc">' +
          escapeHtml(p.shortDesc) +
          "</p>" +
          (variantButtonsHtml
            ? '<div class="variant-row"><span class="variant-label">Dung tích:</span>' +
              variantButtonsHtml +
              "</div>"
            : "") +
          '<div class="product-actions">' +
          actionButtonHtml +
          '<button type="button" class="link-underline" data-action="open-detail" data-product="' +
          escapeHtml(p.id) +
          '">Đọc kỹ thành phần &amp; cách dùng</button>' +
          "</div>" +
          "</div>" +
          "</article>";
      }
      menuGridEl.innerHTML = html;
    }

    upcomingOnlyNoteEl.hidden = !(activeProducts.length === 0 && upcomingProducts.length > 0);

    if (upcomingProducts.length > 0) {
      upcomingBoxEl.hidden = false;
      var upHtml = "";
      for (var k = 0; k < upcomingProducts.length; k++) {
        var up = upcomingProducts[k];
        upHtml +=
          '<div class="upcoming-card">' +
          '<span class="upcoming-cat">' +
          escapeHtml(up.code) +
          " · " +
          escapeHtml(getCategoryLabel(up.category)) +
          "</span>" +
          '<h3 class="upcoming-name">' +
          escapeHtml(up.name) +
          "</h3>" +
          '<p class="upcoming-meta">' +
          escapeHtml(up.meta || up.status) +
          "</p>" +
          '<p class="upcoming-note">' +
          escapeHtml(up.shortDesc) +
          "</p>" +
          '<button type="button" class="upcoming-link" data-action="notify-upcoming" data-upcoming-name="' +
          escapeHtml(up.name) +
          '">Nhắn Zalo báo mình khi có</button>' +
          "</div>";
      }
      upcomingGridEl.innerHTML = upHtml;
    } else {
      upcomingBoxEl.hidden = true;
    }
  }

  function renderArticles() {
    if (!articleGridEl) return;
    if (ARTICLES.length === 0) {
      articleGridEl.innerHTML =
        '<p class="section-intro">Chưa có bài viết nào. Bạn có thể thêm bài trong trang quản trị.</p>';
      return;
    }
    var html = "";
    for (var i = 0; i < ARTICLES.length; i++) {
      var art = ARTICLES[i];
      html +=
        '<article class="article-card">' +
        (art.image
          ? '<div class="article-thumb"><img src="' +
            escapeHtml(art.image) +
            '" alt="' +
            escapeHtml(art.title) +
            '" loading="lazy" /></div>'
          : "") +
        '<div class="article-card-body">' +
        '<p class="article-date">Sổ tay · ' +
        escapeHtml(art.date || "") +
        "</p>" +
        '<h3 class="article-title">' +
        escapeHtml(art.title) +
        "</h3>" +
        '<p class="article-summary">' +
        escapeHtml(art.summary) +
        "</p>" +
        '<button type="button" class="article-read-btn" data-action="open-article" data-article="' +
        escapeHtml(art.id) +
        '">Đọc bài viết →</button>' +
        "</div>" +
        "</article>";
    }
    articleGridEl.innerHTML = html;
  }

  function renderFaqs() {
    var html = "";
    for (var i = 0; i < FAQS.length; i++) {
      var item = FAQS[i];
      var isOpen = i === 0;
      var paragraphs = "";
      var answers = Array.isArray(item.a) ? item.a : [item.a];
      for (var k = 0; k < answers.length; k++) {
        paragraphs += "<p>" + escapeHtml(answers[k]) + "</p>";
      }
      html +=
        '<div class="faq-item">' +
        '<button type="button" class="faq-btn" aria-expanded="' +
        (isOpen ? "true" : "false") +
        '" data-faq-index="' +
        i +
        '">' +
        "<span>" +
        escapeHtml(item.q) +
        "</span>" +
        '<span class="faq-sign" aria-hidden="true">' +
        (isOpen ? "−" : "+") +
        "</span>" +
        "</button>" +
        '<div class="faq-panel"' +
        (isOpen ? "" : " hidden") +
        ">" +
        paragraphs +
        "</div>" +
        "</div>";
    }
    faqListEl.innerHTML = html;
  }

  function addToCart(productId, variantId) {
    var product = findProduct(productId);
    if (!product || product.statusType === "upcoming" || product.statusType === "out_of_stock") return;
    var variant = findVariant(product, variantId || state.selectedVariants[productId]);

    var found = false;
    for (var i = 0; i < state.cart.length; i++) {
      var row = state.cart[i];
      if (row.productId === product.id && row.variantId === variant.id) {
        row.qty += 1;
        found = true;
        break;
      }
    }
    if (!found) {
      state.cart.push({
        productId: product.id,
        code: product.code,
        name: product.name,
        variantId: variant.id,
        variantLabel: variant.label,
        price: variant.price,
        qty: 1
      });
    }
    state.submittedOrder = null;
    saveCart();
    updateCartBadge();
    showToast("Đã thêm " + product.name + " (" + variant.label + ") vào giỏ.", "cart");
  }

  function updateCartQty(index, delta) {
    var item = state.cart[index];
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      state.cart.splice(index, 1);
    }
    saveCart();
    updateCartBadge();
    renderCartDrawer();
  }

  function removeCartItem(index) {
    state.cart.splice(index, 1);
    saveCart();
    updateCartBadge();
    renderCartDrawer();
  }

  function closeDrawers() {
    detailBackdrop.hidden = true;
    articleBackdrop.hidden = true;
    cartBackdrop.hidden = true;
    document.body.classList.remove("sheet-open");
  }

  function openDetailDrawer(productId) {
    var product = findProduct(productId);
    if (!product) return;
    hideToast();
    var variants = Array.isArray(product.variants) ? product.variants : [];
    var activeVariantId = state.selectedVariants[product.id] || (variants[0] && variants[0].id);
    var activeVariant = findVariant(product, activeVariantId);

    detailCodeEl.textContent = product.code + " · " + getCategoryLabel(product.category);
    detailTitleEl.textContent = product.name;

    var useItems = "";
    var howList = Array.isArray(product.howToUse) ? product.howToUse : [];
    for (var i = 0; i < howList.length; i++) {
      useItems += "<li>" + escapeHtml(howList[i]) + "</li>";
    }

    var variantBtns = "";
    for (var v = 0; v < variants.length; v++) {
      var vr = variants[v];
      variantBtns +=
        '<button type="button" class="variant-btn' +
        (vr.id === activeVariant.id ? " is-selected" : "") +
        '" data-detail-variant="' +
        escapeHtml(vr.id) +
        '">' +
        escapeHtml(vr.label) +
        " — " +
        formatVnd(vr.price) +
        "</button>";
    }

    detailBodyEl.innerHTML =
      (product.image
        ? '<div class="detail-photo"><div class="photo-frame"><img src="' +
          escapeHtml(product.image) +
          '" alt="' +
          escapeHtml(product.imageAlt || product.name) +
          '" /></div></div>'
        : "") +
      '<p style="margin:0 0 14px; color: var(--ink-soft);">' +
      escapeHtml(product.shortDesc) +
      "</p>" +
      '<div class="detail-block"><h4>Thành phần chi tiết</h4><p>' +
      escapeHtml(product.ingredients) +
      "</p></div>" +
      (useItems
        ? '<div class="detail-block"><h4>Cách dùng từng trường hợp</h4><ul>' + useItems + "</ul></div>"
        : "") +
      '<div class="detail-block"><h4>Bảo quản sau khi mở nắp</h4><p>' +
      escapeHtml(product.storage) +
      "</p></div>" +
      '<div class="detail-warning"><strong>Lưu ý an toàn:</strong> ' +
      escapeHtml(product.safety) +
      "</div>" +
      '<div class="detail-footer-bar">' +
      '<div class="variant-row" style="margin-bottom:0;">' +
      variantBtns +
      "</div>" +
      (product.statusType === "out_of_stock"
        ? '<button type="button" class="btn-outline" data-action="notify-upcoming" data-upcoming-name="' +
          escapeHtml(product.name) +
          '">Tạm hết · Nhắn Zalo</button>'
        : '<button type="button" id="detail-add-btn" class="btn-primary" data-product="' +
          escapeHtml(product.id) +
          '">Thêm vào giỏ (' +
          formatVnd(activeVariant.price) +
          ")</button>") +
      "</div>";

    detailBackdrop.hidden = false;
    articleBackdrop.hidden = true;
    cartBackdrop.hidden = true;
    document.body.classList.add("sheet-open");
  }

  function openArticleDrawer(articleId) {
    var art = findArticle(articleId);
    if (!art) return;
    hideToast();

    articleModalMetaEl.textContent = "Sổ tay · " + (art.date || "");
    articleModalTitleEl.textContent = art.title;

    var paras = Array.isArray(art.content) ? art.content : String(art.content || "").split("\n");
    var bodyHtml = "";
    for (var i = 0; i < paras.length; i++) {
      var line = String(paras[i]).trim();
      if (line) bodyHtml += "<p>" + escapeHtml(line) + "</p>";
    }

    articleModalBodyEl.innerHTML =
      (art.image
        ? '<div class="detail-photo"><div class="photo-frame"><img src="' +
          escapeHtml(art.image) +
          '" alt="' +
          escapeHtml(art.title) +
          '" /></div></div>'
        : "") +
      '<div class="article-body-text">' +
      bodyHtml +
      "</div>";

    articleBackdrop.hidden = false;
    detailBackdrop.hidden = true;
    cartBackdrop.hidden = true;
    document.body.classList.add("sheet-open");
  }

  function buildOrderMessage(ord) {
    var lines = ["ĐƠN HÀNG HƯƠNG GỪNG — MÃ " + ord.code];
    for (var i = 0; i < ord.items.length; i++) {
      var it = ord.items[i];
      lines.push(
        "- " + it.name + " (" + it.variantLabel + ") x " + it.qty + ": " + formatVnd(it.price * it.qty)
      );
    }
    lines.push("Phí giao hàng: " + (ord.shipping === 0 ? "Miễn phí" : formatVnd(ord.shipping)));
    lines.push("Tổng cộng (COD): " + formatVnd(ord.total));
    lines.push("---");
    lines.push("Người nhận: " + ord.name + " - " + ord.phone);
    lines.push("Địa chỉ: " + ord.address);
    if (ord.note) lines.push("Ghi chú: " + ord.note);
    return lines.join("\n");
  }

  function renderCartDrawer() {
    if (state.submittedOrder) {
      var ord = state.submittedOrder;
      cartBodyEl.innerHTML =
        '<div class="receipt-box">' +
        '<p class="receipt-code">MÃ ĐƠN: ' +
        escapeHtml(ord.code) +
        "</p>" +
        '<h4 class="receipt-title">Đã tạo sẵn tin nhắn đơn hàng</h4>' +
        '<p class="receipt-demo-note">Mình đã chép sẵn nội dung đơn dưới đây. Bạn bấm <strong>Mở Zalo</strong> rồi Dán (Paste) gửi cho Hương để mình chốt đơn nhé.</p>' +
        '<textarea id="order-msg-preview" class="order-msg-preview" readonly>' +
        escapeHtml(ord.messageText) +
        "</textarea>" +
        '<div class="receipt-actions">' +
        '<a href="' +
        escapeHtml(ZALO_URL) +
        '" target="_blank" rel="noopener" class="btn-primary">Mở Zalo gửi cho Hương (' +
        escapeHtml(SHOP_PHONE_DISPLAY) +
        ")</a>" +
        '<button type="button" id="copy-order-msg-btn" class="btn-outline">Chép nội dung đơn</button>' +
        "</div>" +
        '<button type="button" id="new-order-btn" class="link-underline">Đặt thêm đơn khác</button>' +
        "</div>";
      return;
    }

    if (state.cart.length === 0) {
      cartBodyEl.innerHTML =
        '<div class="cart-empty">' +
        "<p>Phiếu đặt hàng hiện đang trống. Bạn xem qua các mẻ trong thực đơn rồi chọn dung tích phù hợp nhé.</p>" +
        '<button type="button" id="empty-back-menu" class="btn-primary">Quay lại danh sách sản phẩm</button>' +
        "</div>";
      return;
    }

    var totals = getCartTotals();
    var rowsHtml = "";
    for (var idx = 0; idx < state.cart.length; idx++) {
      var c = state.cart[idx];
      rowsHtml +=
        '<div class="cart-row">' +
        "<div>" +
        '<p class="cart-row-name">' +
        escapeHtml(c.name) +
        "</p>" +
        '<p class="cart-row-sub">' +
        escapeHtml(c.variantLabel) +
        " · " +
        formatVnd(c.price) +
        "</p>" +
        "</div>" +
        '<div class="cart-row-controls">' +
        '<div class="qty-box">' +
        '<button type="button" class="qty-btn" data-cart-dec="' +
        idx +
        '" aria-label="Giảm số lượng">−</button>' +
        '<span class="qty-val">' +
        c.qty +
        "</span>" +
        '<button type="button" class="qty-btn" data-cart-inc="' +
        idx +
        '" aria-label="Tăng số lượng">+</button>' +
        "</div>" +
        '<button type="button" class="remove-link" data-cart-remove="' +
        idx +
        '">Bỏ món này</button>' +
        "</div>" +
        "</div>";
    }

    var shipGapNote =
      totals.shipping === 0
        ? "Đơn từ " + formatVnd(FREE_SHIP_THRESHOLD) + " đã được miễn phí giao hàng."
        : "Thêm " +
          formatVnd(FREE_SHIP_THRESHOLD - totals.subtotal) +
          " nữa để được miễn phí giao hàng.";

    var hasBank = SHOP.bankName && SHOP.bankAccount && SHOP.bankOwner;
    var payBoxHtml =
      '<div class="cod-note-box">' +
      "<p><strong>Thanh toán khi nhận hàng (COD):</strong> Mở hộp kiểm tra chai nguyên vẹn rồi trả tiền cho người giao.</p>" +
      (hasBank
        ? "<p>Hoặc chuyển khoản: <strong>" +
          escapeHtml(SHOP.bankName) +
          " — " +
          escapeHtml(SHOP.bankAccount) +
          " (" +
          escapeHtml(SHOP.bankOwner) +
          ")</strong> · Nội dung: <strong>" +
          escapeHtml(state.draftOrderCode) +
          "</strong></p>"
        : "<p>Nếu bạn muốn chuyển khoản trước, nhắn mình qua Zalo mình gửi số tài khoản nhé.</p>") +
      "</div>";

    cartBodyEl.innerHTML =
      '<div class="cart-items">' +
      rowsHtml +
      "</div>" +
      '<div class="cart-summary">' +
      '<div class="summary-line">' +
      "<span>Tạm tính (" +
      totals.count +
      " chai)</span>" +
      '<span style="font-family:var(--font-mono);">' +
      formatVnd(totals.subtotal) +
      "</span>" +
      "</div>" +
      '<div class="summary-line">' +
      "<span>Phí giao hàng</span>" +
      '<span style="font-family:var(--font-mono);">' +
      (totals.shipping === 0 ? "Miễn phí" : formatVnd(totals.shipping)) +
      "</span>" +
      "</div>" +
      '<div class="summary-line summary-total">' +
      "<span>Tổng cộng</span>" +
      '<span style="font-family:var(--font-mono);">' +
      formatVnd(totals.total) +
      "</span>" +
      "</div>" +
      '<p class="summary-note">' +
      escapeHtml(shipGapNote) +
      "</p>" +
      "</div>" +
      '<form id="order-form" class="order-form" novalidate>' +
      '<p class="form-heading">Thông tin nhận hàng</p>' +
      '<div class="field-group">' +
      '<label class="field-label" for="cus-name">Tên của bạn *</label>' +
      '<input id="cus-name" name="name" type="text" class="field-input" placeholder="Ví dụ: Chị Lan / Anh Minh" required />' +
      "</div>" +
      '<div class="field-group">' +
      '<label class="field-label" for="cus-phone">Số điện thoại hoặc Zalo *</label>' +
      '<input id="cus-phone" name="phone" type="tel" class="field-input" placeholder="Để mình gọi xác nhận trước khi gửi" required />' +
      "</div>" +
      '<div class="field-group">' +
      '<label class="field-label" for="cus-address">Địa chỉ nhận hàng *</label>' +
      '<textarea id="cus-address" name="address" class="field-input" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" required></textarea>' +
      "</div>" +
      '<div class="field-group">' +
      '<label class="field-label" for="cus-note">Lời nhắn thêm (nếu có)</label>' +
      '<input id="cus-note" name="note" type="text" class="field-input" placeholder="Ví dụ: Giao giờ hành chính / mua tặng mẹ sau sinh" />' +
      "</div>" +
      payBoxHtml +
      '<p id="form-error" class="form-error" hidden></p>' +
      '<button type="submit" class="submit-order-btn">Tạo đơn &amp; gửi qua Zalo (' +
      formatVnd(totals.total) +
      ")</button>" +
      "</form>";
  }

  function openCartDrawer() {
    hideToast();
    renderCartDrawer();
    cartBackdrop.hidden = false;
    detailBackdrop.hidden = true;
    articleBackdrop.hidden = true;
    document.body.classList.add("sheet-open");
  }

  document.addEventListener("click", function (e) {
    var target = e.target;

    var filterTab = target.closest(".filter-tab");
    if (filterTab) {
      state.filter = filterTab.getAttribute("data-filter");
      renderFilterTabs();
      renderMenu();
      return;
    }

    var variantBtn = target.closest('[data-action="select-variant"]');
    if (variantBtn) {
      var pId = variantBtn.getAttribute("data-product");
      var vId = variantBtn.getAttribute("data-variant");
      state.selectedVariants[pId] = vId;
      var prod = findProduct(pId);
      var vr = findVariant(prod, vId);
      var card = variantBtn.closest(".product-card");
      if (card) {
        var btns = card.querySelectorAll(".variant-btn");
        for (var b = 0; b < btns.length; b++) {
          btns[b].classList.toggle("is-selected", btns[b] === variantBtn);
        }
        var priceEl = card.querySelector('[data-price-for="' + pId + '"]');
        if (priceEl) priceEl.textContent = formatVnd(vr.price);
      }
      return;
    }

    var addBtn = target.closest('[data-action="add-to-cart"]');
    if (addBtn) {
      var addProdId = addBtn.getAttribute("data-product");
      addToCart(addProdId);
      var originalLabel = addBtn.textContent;
      addBtn.textContent = "Đã thêm ✓";
      addBtn.classList.add("is-added");
      setTimeout(function () {
        addBtn.textContent = originalLabel;
        addBtn.classList.remove("is-added");
      }, 950);
      return;
    }

    var notifyBtn = target.closest('[data-action="notify-upcoming"]');
    if (notifyBtn) {
      var upName = notifyBtn.getAttribute("data-upcoming-name") || "sản phẩm mới";
      var msg = "Chào Hương, khi nào có mẻ " + upName + " thì nhắn báo mình nhé.";
      copyTextToClipboard(msg, function () {
        showToast("Đã chép lời nhắn hỏi món “" + upName + "”.", "zalo");
      });
      return;
    }

    var detailBtn = target.closest('[data-action="open-detail"]');
    if (detailBtn) {
      openDetailDrawer(detailBtn.getAttribute("data-product"));
      return;
    }

    var articleBtn = target.closest('[data-action="open-article"]');
    if (articleBtn) {
      openArticleDrawer(articleBtn.getAttribute("data-article"));
      return;
    }

    var detailVarBtn = target.closest("[data-detail-variant]");
    if (detailVarBtn) {
      var detailAdd = document.getElementById("detail-add-btn");
      if (detailAdd) {
        var dProdId = detailAdd.getAttribute("data-product");
        var dVarId = detailVarBtn.getAttribute("data-detail-variant");
        state.selectedVariants[dProdId] = dVarId;
        var dProd = findProduct(dProdId);
        var dVar = findVariant(dProd, dVarId);
        var siblings = detailBodyEl.querySelectorAll("[data-detail-variant]");
        for (var s = 0; s < siblings.length; s++) {
          siblings[s].classList.toggle("is-selected", siblings[s] === detailVarBtn);
        }
        detailAdd.textContent = "Thêm vào giỏ (" + formatVnd(dVar.price) + ")";
        renderMenu();
      }
      return;
    }

    if (target.id === "detail-add-btn") {
      addToCart(target.getAttribute("data-product"));
      closeDrawers();
      return;
    }

    var decBtn = target.closest("[data-cart-dec]");
    if (decBtn) {
      updateCartQty(parseInt(decBtn.getAttribute("data-cart-dec"), 10), -1);
      return;
    }
    var incBtn = target.closest("[data-cart-inc]");
    if (incBtn) {
      updateCartQty(parseInt(incBtn.getAttribute("data-cart-inc"), 10), 1);
      return;
    }
    var remBtn = target.closest("[data-cart-remove]");
    if (remBtn) {
      removeCartItem(parseInt(remBtn.getAttribute("data-cart-remove"), 10));
      return;
    }

    if (target.id === "empty-back-menu") {
      closeDrawers();
      var menuSection = document.getElementById("thuc-don");
      if (menuSection) menuSection.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (target.id === "copy-order-msg-btn" && state.submittedOrder) {
      copyTextToClipboard(state.submittedOrder.messageText, function () {
        target.textContent = "Đã chép ✓";
      });
      return;
    }

    if (target.id === "new-order-btn") {
      state.submittedOrder = null;
      state.draftOrderCode = generateOrderCode();
      closeDrawers();
      return;
    }

    var faqBtn = target.closest(".faq-btn");
    if (faqBtn) {
      var expanded = faqBtn.getAttribute("aria-expanded") === "true";
      faqBtn.setAttribute("aria-expanded", expanded ? "false" : "true");
      var sign = faqBtn.querySelector(".faq-sign");
      if (sign) sign.textContent = expanded ? "+" : "−";
      var panel = faqBtn.nextElementSibling;
      if (panel) panel.hidden = expanded;
    }
  });

  cartBodyEl.addEventListener("submit", function (e) {
    if (!e.target || e.target.id !== "order-form") return;
    e.preventDefault();

    var form = e.target;
    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var address = form.address.value.trim();
    var note = form.note.value.trim();
    var errEl = document.getElementById("form-error");

    if (!name || !phone || !address) {
      errEl.textContent = "Bạn điền giúp mình Tên, Số điện thoại/Zalo và Địa chỉ nhận hàng nhé.";
      errEl.hidden = false;
      return;
    }
    if (phone.replace(/\D/g, "").length < 8) {
      errEl.textContent = "Số điện thoại có vẻ thiếu chữ số, bạn kiểm tra lại giúp mình nha.";
      errEl.hidden = false;
      return;
    }

    var totals = getCartTotals();
    var orderObj = {
      code: state.draftOrderCode,
      name: name,
      phone: phone,
      address: address,
      note: note,
      items: state.cart.slice(),
      shipping: totals.shipping,
      total: totals.total
    };
    orderObj.messageText = buildOrderMessage(orderObj);
    state.submittedOrder = orderObj;

    copyTextToClipboard(orderObj.messageText);

    state.cart = [];
    state.draftOrderCode = generateOrderCode();
    saveCart();
    updateCartBadge();
    renderCartDrawer();
  });

  openCartBtn.addEventListener("click", openCartDrawer);
  toastOpenCartBtn.addEventListener("click", function () {
    toastEl.hidden = true;
    openCartDrawer();
  });

  closeDetailBtn.addEventListener("click", closeDrawers);
  closeArticleBtn.addEventListener("click", closeDrawers);
  closeCartBtn.addEventListener("click", closeDrawers);

  detailBackdrop.addEventListener("click", function (e) {
    if (e.target === detailBackdrop) closeDrawers();
  });
  articleBackdrop.addEventListener("click", function (e) {
    if (e.target === articleBackdrop) closeDrawers();
  });
  cartBackdrop.addEventListener("click", function (e) {
    if (e.target === cartBackdrop) closeDrawers();
  });

  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      (!detailBackdrop.hidden || !articleBackdrop.hidden || !cartBackdrop.hidden)
    ) {
      closeDrawers();
    }
  });

  var navLinks = document.querySelectorAll(".nav-link");
  window.addEventListener(
    "scroll",
    function () {
      var scrollY = window.scrollY + 120;
      var currentId = "thuc-don";
      var ids = ["thuc-don", "cach-lam", "bai-viet", "hoi-dap"];
      for (var i = 0; i < ids.length; i++) {
        var sec = document.getElementById(ids[i]);
        if (sec && sec.offsetTop <= scrollY) {
          currentId = ids[i];
        }
      }
      for (var n = 0; n < navLinks.length; n++) {
        var href = navLinks[n].getAttribute("href");
        navLinks[n].classList.toggle("is-active", href === "#" + currentId);
      }
    },
    { passive: true }
  );

  applyShopInfo();
  renderFilterTabs();
  renderMenu();
  renderArticles();
  renderFaqs();
  updateCartBadge();
})();
