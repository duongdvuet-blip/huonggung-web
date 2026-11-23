/* ==========================================================================
   Hương Gừng (huonggung.com) — Dữ liệu thực đơn & tương tác sổ tay
   Viết theo ES5/ES6 thuần, chạy trực tiếp qua file:// không cần server/build
   ========================================================================== */

(function () {
  "use strict";

  var SHIPPING_FEE = 30000;
  var FREE_SHIP_THRESHOLD = 350000;
  var STORAGE_KEY = "huonggung_cart_v1";

  var PRODUCTS = [
    {
      id: "cot-khong-ruou",
      code: "№ 01",
      category: "xoa-bop",
      categoryLabel: "Cốt gừng xoa bóp",
      name: "Cốt Gừng Không Rượu",
      status: "Đang có sẵn · Mẻ mới đóng tuần này",
      image: "assets/sp-khong-ruou.jpg",
      imageAlt: "Chai thủy tinh nâu đựng cốt gừng không rượu cùng chén nước cốt vàng trong và lát gừng tươi",
      shortDesc:
        "Dành cho bạn ngại mùi rượu hoặc da dễ khô rát (mẹ sau sinh, ngồi điều hòa nhiều, người lớn tuổi). Đã lắng tách tinh bột ở tủ mát 2–4°C và thanh trùng kín ở 82–85°C nên thoa thấm êm, không bết trắng, không phồng chai chua ga.",
      variants: [
        { id: "200ml", label: "200ml", price: 185000 },
        { id: "500ml", label: "500ml", price: 390000 }
      ],
      ingredients:
        "Nước cốt ép từ gừng sẻ già 8–10 tháng tuổi đã tách sạch tinh bột, giấm gạo tự nhiên & chanh tươi hạ pH dưới 3.8, tinh chất chiết từ sả tươi, quế chi, đinh hương, xuyên khung và địa liền. 0% rượu, 0% chất bảo quản hóa học.",
      howToUse: [
        "Thoa cổ vai gáy, lưng, bắp chân hoặc bàn chân: lấy lượng vừa đủ xoa đều rồi day ấn 5–10 phút cho ấm dần vào trong.",
        "Chăm sóc mẹ sau sinh: pha loãng 30–40ml vào chậu nước ấm để lau người nơi kín gió, không cần tắm lại nước lạnh.",
        "Ngâm chân buổi tối: pha 20–30ml vào chậu nước ấm 40°C cùng chút muối hạt, ngâm 15–20 phút rồi lau thật khô chân."
      ],
      storage:
        "Chưa mở nắp: để nơi thoáng mát tránh nắng trong 4–6 tháng. Sau khi vặn nắp: cất ngăn mát tủ lạnh (2–4°C) và dùng hết trong 3–4 tuần.",
      safety:
        "Chỉ dùng ngoài da, tuyệt đối không uống. Không bôi cho trẻ sơ sinh, trẻ nhỏ hay vết thương hở. Da nhạy cảm nên thử 1 giọt ở mặt trong cổ tay đợi 15–30 phút trước khi dùng rộng."
    },
    {
      id: "cot-xuyen-khung",
      code: "№ 02",
      category: "xoa-bop",
      categoryLabel: "Cốt gừng xoa bóp",
      name: "Cốt Gừng Xuyên Khung · Địa Liền",
      status: "Đang có sẵn · Ủ đủ ngày",
      image: "assets/sp-xuyen-khung.jpg",
      imageAlt: "Chai thủy tinh nâu đựng cốt gừng xuyên khung bên lát xuyên khung khô, củ gừng và ngải cứu",
      shortDesc:
        "Hệ rượu nếp 45° ngâm ủ đủ ngày cùng gừng sẻ già, xuyên khung và địa liền. Nồng ấm sâu, hợp xoa bóp cổ vai gáy, lưng, khớp gối khi đau mỏi hay gặp lạnh. Chỉ dùng ngoài da.",
      variants: [
        { id: "250ml", label: "250ml", price: 210000 },
        { id: "500ml", label: "500ml", price: 380000 }
      ],
      ingredients:
        "Gừng sẻ già để ráo kiệt nước, xuyên khung thái lát, địa liền, ngải cứu khô, muối hạt sạch và rượu nếp trắng nấu thủ công 40–45° ngâm ủ trong hũ thủy tinh tối thiểu 1–3 tháng.",
      howToUse: [
        "Xoa bóp vai gáy, thắt lưng, đầu gối: lấy 1 lượng nhỏ ra lòng bàn tay, xoa ấm rồi miết day vùng đau mỏi ngày 2–3 lần.",
        "Rửa tay sạch bằng xà phòng sau khi xoa xong để tránh vô tình dụi lên mắt.",
        "Có thể pha 20–30ml vào chậu nước ấm để ngâm chân những hôm trời trở lạnh hoặc tê bì bàn chân."
      ],
      storage:
        "Nhờ độ cồn tự nhiên kết hợp muối và thảo mộc, chai giữ ổn định ở nhiệt độ phòng 1–2 năm. Đậy kín nắp ngay sau khi rót để tinh dầu và cồn không bay hơi.",
      safety:
        "Tuyệt đối không uống. Không dùng cho trẻ nhỏ, phụ nữ đang mang thai (tránh xoa vùng bụng, lưng dưới) và không bôi lên vết thương hở, vùng da đang trầy xước."
    },
    {
      id: "cot-ngam-chan",
      code: "№ 03",
      category: "ngam-chan",
      categoryLabel: "Ngâm chân",
      name: "Cốt Gừng Ngải Cứu Ngâm Chân",
      status: "Đang có sẵn",
      image: "assets/sp-ngam-chan.jpg",
      imageAlt: "Chai thủy tinh nâu cạnh bát gốm muối hạt hồng, nhánh sả tươi cắt chéo và thanh quế",
      shortDesc:
        "Pha 20–30ml vào chậu nước ấm 40°C thêm chút muối hạt, ngâm chân 15–20 phút buổi tối giúp ấm bàn chân, dễ ngủ. Thơm ấm mùi gừng sẻ, ngải cứu, quế chi và sả.",
      variants: [
        { id: "250ml", label: "250ml", price: 165000 },
        { id: "500ml", label: "500ml", price: 300000 }
      ],
      ingredients:
        "Nước cốt gừng sẻ già, ngải cứu ủ chiết ấm, sả tươi đập dập, quế chi, vỏ quýt khô và một chút muối biển sạch giúp dẫn ấm xuống lòng bàn chân.",
      howToUse: [
        "Đổ nước ấm khoảng 40–42°C ngập mắt cá chân vào chậu gỗ hoặc chậu nhựa dày.",
        "Pha 20–30ml cốt gừng (tương đương 2–3 nắp chai) kèm 1 thìa muối hạt, khuấy đều rồi ngâm 15–20 phút trước khi ngủ.",
        "Ngâm xong thấm khô chân bằng khăn bông, đi tất mỏng giữ ấm, tránh bước chân trần xuống nền gạch lạnh."
      ],
      storage:
        "Đậy kín nắp để nơi thoáng mát. Nếu ít dùng hoặc mở nắp lâu ngày ở vùng nóng ẩm, giữ ở ngăn mát tủ lạnh sẽ thơm bền hơn.",
      safety:
        "Chỉ dùng pha nước ngâm hoặc lau ngoài da. Người bị suy giãn tĩnh mạch nặng hoặc tiểu đường mất cảm giác nhiệt ở bàn chân cần kiểm tra độ ấm nước bằng tay trước khi ngâm."
    }
  ];

  var UPCOMING = [
    {
      code: "№ 04",
      name: "Muối Gừng Thảo Mộc Ngâm Chân",
      meta: "Hũ thủy tinh 400g · Đang thử mẻ nhỏ",
      note: "Muối hạt rang giòn cùng gừng sẻ băm, ngải cứu và sả khô để bạn múc 1 thìa thả thẳng vào chậu nước nóng cho tiện."
    },
    {
      code: "№ 05",
      name: "Cốt Gừng Sả Quế Mật Ong (pha uống ấm)",
      meta: "Chai 300ml · Đang hoàn thiện",
      note: "Mình đang chỉnh độ ngọt và kiểm tra độ ổn định nhiệt độ phòng trước khi mở bán."
    }
  ];

  var FAQS = [
    {
      q: "Mình nên chọn chai Không Rượu hay chai Xuyên Khung Địa Liền?",
      a: [
        "Nếu bạn đang tìm cho mẹ sau sinh, người lớn tuổi da khô mỏng, nhân viên văn phòng ngồi điều hòa không muốn ám mùi rượu: chọn № 01 Cốt Gừng Không Rượu. Thoa rất êm và không rát.",
        "Nếu bạn cần xoa bóp tập trung cho người đau mỏi cổ vai gáy, đau lưng, khớp gối hoặc quen cảm giác ấm sâu nhanh của rượu thuốc: chọn № 02 Cốt Gừng Xuyên Khung · Địa Liền."
      ]
    },
    {
      q: "Tại sao chai nhỏ 200ml–250ml lại có giá gần 200 nghìn?",
      a: [
        "Để ép ra nước cốt thật, mỗi mẻ mình đều chọn gừng sẻ, gừng dé già 8–10 tháng tuổi rồi tách nhánh rửa sạch từng kẽ củ, bỏ phần thâm xơ và gạn bỏ lớp tinh bột trắng bên dưới.",
        "Mẻ nào cũng dùng chai thủy tinh tối màu luộc tiệt trùng kỹ (tránh chai nhựa phồng mềm và tránh ánh nắng làm hỏng hoạt chất), đóng mẻ nhỏ hàng tuần chứ không sản xuất công nghiệp số lượng lớn."
      ]
    },
    {
      q: "Nhận chai về thấy dưới đáy có chút cặn mỏng thì có phải bị hỏng không?",
      a: [
        "Nếu là lớp phấn thảo mộc mịn lắng rất mỏng ở đáy và nước phía trên vẫn trong, mở nắp thơm ấm mùi gừng quế sả, không xì bọt ga thì hoàn toàn bình thường — bạn chỉ cần lắc nhẹ trước khi thoa.",
        "Ngược lại, nếu thấy chai bị trào bọt ga, mùi chua như giấm thiu hoặc nổi váng trắng trên mặt, bạn chụp ảnh gửi Zalo cho mình ngay để mình đổi chai mới hoàn toàn."
      ]
    },
    {
      q: "Giao hàng bọc thế nào, có được kiểm tra khi nhận không?",
      a: [
        "Mỗi chai thủy tinh đều được bọc xốp chống sốc riêng trong hộp giấy cứng. Bạn nhận hàng cứ mở hộp kiểm tra xem nắp có nguyên vẹn, có vỡ đổ hay không rồi mới thanh toán cho người giao.",
        "Nếu không may vỡ trong lúc vận chuyển, bạn nhắn mình một tiếng là mình gửi bù ngay chai mới, không tính thêm bất kỳ khoản nào."
      ]
    },
    {
      q: "Những ai KHÔNG nên dùng các chai cốt gừng này?",
      a: [
        "Cả 3 sản phẩm hiện tại đều là cốt NGOẠI DỤNG dùng ngoài da, tuyệt đối không uống.",
        "Không dùng cho trẻ sơ sinh và trẻ nhỏ (da trẻ rất mỏng, tinh dầu cay nóng dễ gây rát đỏ). Không bôi lên vết thương hở, vùng da trầy xước hoặc gần mắt. Phụ nữ đang mang thai tránh xoa lên bụng và thắt lưng."
      ]
    }
  ];

  // Trạng thái ứng dụng
  var state = {
    filter: "all",
    selectedVariants: {
      "cot-khong-ruou": "200ml",
      "cot-xuyen-khung": "250ml",
      "cot-ngam-chan": "250ml"
    },
    cart: loadCart(),
    paymentMethod: "cod",
    draftOrderCode: generateOrderCode(),
    submittedOrder: null
  };

  var toastTimer = null;

  // Các phần tử DOM
  var menuListEl = document.getElementById("menu-list");
  var upcomingBoxEl = document.getElementById("upcoming-box");
  var upcomingListEl = document.getElementById("upcoming-list");
  var faqListEl = document.getElementById("faq-list");
  var cartCountEl = document.getElementById("cart-count");
  var openCartBtn = document.getElementById("open-cart-btn");

  var detailBackdrop = document.getElementById("detail-backdrop");
  var detailCodeEl = document.getElementById("detail-code");
  var detailTitleEl = document.getElementById("detail-title");
  var detailBodyEl = document.getElementById("detail-body");
  var closeDetailBtn = document.getElementById("close-detail-btn");

  var cartBackdrop = document.getElementById("cart-backdrop");
  var cartBodyEl = document.getElementById("cart-body");
  var closeCartBtn = document.getElementById("close-cart-btn");

  var toastEl = document.getElementById("toast-note");
  var toastTextEl = document.getElementById("toast-text");
  var toastOpenCartBtn = document.getElementById("toast-open-cart");

  function formatVnd(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function generateOrderCode() {
    var num = Math.floor(1000 + Math.random() * 9000);
    return "HG-" + num;
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
      // Bỏ qua nếu trình duyệt chặn localStorage ở chế độ file://
    }
  }

  function findProduct(productId) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === productId) return PRODUCTS[i];
    }
    return null;
  }

  function findVariant(product, variantId) {
    for (var i = 0; i < product.variants.length; i++) {
      if (product.variants[i].id === variantId) return product.variants[i];
    }
    return product.variants[0];
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

  function showToast(message) {
    toastTextEl.textContent = message;
    toastEl.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.hidden = true;
    }, 3200);
  }

  // Vẽ danh sách sản phẩm và món sắp ra lò theo bộ lọc
  function renderMenu() {
    var showUpcoming = state.filter === "all" || state.filter === "sap-ra-lo";
    var filtered = [];
    if (state.filter !== "sap-ra-lo") {
      for (var i = 0; i < PRODUCTS.length; i++) {
        if (state.filter === "all" || PRODUCTS[i].category === state.filter) {
          filtered.push(PRODUCTS[i]);
        }
      }
    }

    if (filtered.length === 0) {
      menuListEl.innerHTML = "";
    } else {
      var html = "";
      for (var j = 0; j < filtered.length; j++) {
        var p = filtered[j];
        var activeVariantId = state.selectedVariants[p.id] || p.variants[0].id;
        var activeVariant = findVariant(p, activeVariantId);

        var variantButtonsHtml = "";
        for (var v = 0; v < p.variants.length; v++) {
          var vr = p.variants[v];
          var isSelected = vr.id === activeVariant.id;
          variantButtonsHtml +=
            '<button type="button" class="variant-btn' +
            (isSelected ? " is-selected" : "") +
            '" data-action="select-variant" data-product="' +
            p.id +
            '" data-variant="' +
            vr.id +
            '">' +
            escapeHtml(vr.label) +
            " — " +
            formatVnd(vr.price) +
            "</button>";
        }

        html +=
          '<article class="menu-item" data-product-id="' +
          p.id +
          '">' +
          '<div class="menu-item-layout">' +
          '<div class="menu-photo">' +
          '<div class="photo-frame">' +
          '<img src="' +
          escapeHtml(p.image) +
          '" alt="' +
          escapeHtml(p.imageAlt) +
          '" loading="lazy" />' +
          "</div>" +
          "</div>" +
          "<div>" +
          '<div class="menu-meta-row">' +
          '<span class="menu-code">' +
          escapeHtml(p.code) +
          "</span>" +
          "<span>·</span>" +
          '<span class="menu-status">' +
          escapeHtml(p.status) +
          "</span>" +
          "</div>" +
          '<div class="menu-head">' +
          '<h3 class="menu-name">' +
          escapeHtml(p.name) +
          "</h3>" +
          '<span class="menu-dots" aria-hidden="true"></span>' +
          '<span class="menu-price" data-price-for="' +
          p.id +
          '">' +
          formatVnd(activeVariant.price) +
          "</span>" +
          "</div>" +
          '<p class="menu-desc">' +
          escapeHtml(p.shortDesc) +
          "</p>" +
          '<div class="variant-row">' +
          '<span class="variant-label">Dung tích:</span>' +
          variantButtonsHtml +
          "</div>" +
          '<div class="menu-actions">' +
          '<button type="button" class="btn-add" data-action="add-to-cart" data-product="' +
          p.id +
          '">Thêm vào giỏ</button>' +
          '<button type="button" class="link-underline" data-action="open-detail" data-product="' +
          p.id +
          '">Đọc kỹ thành phần &amp; cách dùng</button>' +
          "</div>" +
          "</div>" +
          "</div>" +
          "</article>";
      }
      menuListEl.innerHTML = html;
    }

    if (showUpcoming) {
      upcomingBoxEl.hidden = false;
      var upHtml = "";
      for (var u = 0; u < UPCOMING.length; u++) {
        var up = UPCOMING[u];
        upHtml +=
          '<div class="upcoming-item">' +
          '<div class="upcoming-head">' +
          '<h3 class="upcoming-name">' +
          escapeHtml(up.code) +
          " — " +
          escapeHtml(up.name) +
          "</h3>" +
          '<span class="upcoming-tag">' +
          escapeHtml(up.meta) +
          "</span>" +
          "</div>" +
          '<p class="upcoming-note">' +
          escapeHtml(up.note) +
          "</p>" +
          '<a href="#lien-he" class="upcoming-link">Nhắn mình báo khi có</a>' +
          "</div>";
      }
      upcomingListEl.innerHTML = upHtml;
    } else {
      upcomingBoxEl.hidden = true;
    }
  }

  // Vẽ mục hỏi đáp
  function renderFaqs() {
    var html = "";
    for (var i = 0; i < FAQS.length; i++) {
      var item = FAQS[i];
      var isOpen = i === 0;
      var paragraphs = "";
      for (var k = 0; k < item.a.length; k++) {
        paragraphs += "<p>" + escapeHtml(item.a[k]) + "</p>";
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
    if (!product) return;
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
    showToast("Đã thêm " + product.name + " (" + variant.label + ") vào giỏ.");
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

  // Mở tờ chi tiết sản phẩm
  function openDetailDrawer(productId) {
    var product = findProduct(productId);
    if (!product) return;
    hideToast();
    var activeVariantId = state.selectedVariants[product.id] || product.variants[0].id;
    var activeVariant = findVariant(product, activeVariantId);

    detailCodeEl.textContent = product.code + " · " + product.categoryLabel;
    detailTitleEl.textContent = product.name;

    var useItems = "";
    for (var i = 0; i < product.howToUse.length; i++) {
      useItems += "<li>" + escapeHtml(product.howToUse[i]) + "</li>";
    }

    var variantBtns = "";
    for (var v = 0; v < product.variants.length; v++) {
      var vr = product.variants[v];
      variantBtns +=
        '<button type="button" class="variant-btn' +
        (vr.id === activeVariant.id ? " is-selected" : "") +
        '" data-detail-variant="' +
        vr.id +
        '">' +
        escapeHtml(vr.label) +
        " — " +
        formatVnd(vr.price) +
        "</button>";
    }

    detailBodyEl.innerHTML =
      '<div class="detail-photo">' +
      '<div class="photo-frame">' +
      '<img src="' +
      escapeHtml(product.image) +
      '" alt="' +
      escapeHtml(product.imageAlt) +
      '" />' +
      "</div>" +
      "</div>" +
      '<p style="margin:0 0 14px; color: var(--ink-soft);">' +
      escapeHtml(product.shortDesc) +
      "</p>" +
      '<div class="detail-block">' +
      "<h4>Thành phần chi tiết</h4>" +
      "<p>" +
      escapeHtml(product.ingredients) +
      "</p>" +
      "</div>" +
      '<div class="detail-block">' +
      "<h4>Cách dùng từng trường hợp</h4>" +
      "<ul>" +
      useItems +
      "</ul>" +
      "</div>" +
      '<div class="detail-block">' +
      "<h4>Bảo quản sau khi mở nắp</h4>" +
      "<p>" +
      escapeHtml(product.storage) +
      "</p>" +
      "</div>" +
      '<div class="detail-warning">' +
      "<strong>Lưu ý an toàn:</strong> " +
      escapeHtml(product.safety) +
      "</div>" +
      '<div class="detail-footer-bar">' +
      '<div class="variant-row" style="margin-bottom:0;">' +
      variantBtns +
      "</div>" +
      '<button type="button" id="detail-add-btn" class="btn-ink" data-product="' +
      product.id +
      '">' +
      "Thêm vào giỏ (" +
      formatVnd(activeVariant.price) +
      ")" +
      "</button>" +
      "</div>";

    detailBackdrop.hidden = false;
    cartBackdrop.hidden = true;
    document.body.classList.add("sheet-open");
  }

  function closeDrawers() {
    detailBackdrop.hidden = true;
    cartBackdrop.hidden = true;
    document.body.classList.remove("sheet-open");
  }

  // Sinh mã QR SVG minh họa gọn gàng cho giao diện phiếu VietQR (không gọi ảnh ngoài)
  function buildSampleQrSvg() {
    var size = 21;
    var rects = "";
    function isFinder(r, c) {
      return (
        (r < 7 && c < 7) ||
        (r < 7 && c >= size - 7) ||
        (r >= size - 7 && c < 7)
      );
    }
    function finderFilled(r, c) {
      var lr = r < 7 ? r : r - (size - 7);
      var lc = c < 7 ? c : c - (size - 7);
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    }
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        var fill = false;
        if (isFinder(r, c)) {
          fill = finderFilled(r, c);
        } else if (r === 6 || c === 6) {
          fill = (r + c) % 2 === 0;
        } else {
          fill = ((r * 7 + c * 13 + r * c) % 5) < 2;
        }
        if (fill) {
          rects += '<rect x="' + c + '" y="' + r + '" width="1" height="1" />';
        }
      }
    }
    return (
      '<svg viewBox="0 0 ' +
      size +
      " " +
      size +
      '" width="108" height="108" shape-rendering="crispEdges" role="img" aria-label="Mã VietQR mẫu">' +
      '<rect width="' +
      size +
      '" height="' +
      size +
      '" fill="#FFFFFF" />' +
      '<g fill="#2A211B">' +
      rects +
      "</g></svg>"
    );
  }

  // Vẽ phiếu đặt hàng / giỏ hàng
  function renderCartDrawer() {
    if (state.submittedOrder) {
      var ord = state.submittedOrder;
      var linesHtml = "";
      for (var i = 0; i < ord.items.length; i++) {
        var it = ord.items[i];
        linesHtml +=
          '<div class="receipt-line">' +
          "<span>" +
          escapeHtml(it.name) +
          " (" +
          escapeHtml(it.variantLabel) +
          ") × " +
          it.qty +
          "</span>" +
          '<span style="font-family:var(--font-mono);">' +
          formatVnd(it.price * it.qty) +
          "</span>" +
          "</div>";
      }

      cartBodyEl.innerHTML =
        '<div class="receipt-box">' +
        '<p class="receipt-code">MÃ ĐƠN: ' +
        escapeHtml(ord.code) +
        "</p>" +
        '<h4 class="receipt-title">Mình đã ghi nhận đơn hàng của bạn</h4>' +
        '<p style="margin:0 0 8px; font-size:14px; color:var(--ink-soft);">' +
        "Người nhận: <strong>" +
        escapeHtml(ord.name) +
        "</strong> · " +
        escapeHtml(ord.phone) +
        "<br/>Địa chỉ: " +
        escapeHtml(ord.address) +
        (ord.note ? "<br/>Ghi chú: " + escapeHtml(ord.note) : "") +
        "</p>" +
        '<div class="receipt-list">' +
        linesHtml +
        '<div class="receipt-line" style="margin-top:6px; padding-top:6px; border-top:1px solid var(--rule);">' +
        "<span>Phí giao hàng</span>" +
        '<span style="font-family:var(--font-mono);">' +
        (ord.shipping === 0 ? "Miễn phí" : formatVnd(ord.shipping)) +
        "</span>" +
        "</div>" +
        '<div class="receipt-line" style="font-weight:600;">' +
        "<span>Tổng thanh toán (" +
        (ord.paymentMethod === "vietqr" ? "Chuyển khoản VietQR" : "COD khi nhận") +
        ")</span>" +
        '<span style="font-family:var(--font-mono);">' +
        formatVnd(ord.total) +
        "</span>" +
        "</div>" +
        "</div>" +
        '<div class="receipt-demo-note">' +
        "(Đây là bản nháp giao diện chạy trên máy bạn — khi đưa lên huonggung.com, đơn này sẽ gửi thẳng về Google Sheet và báo Zalo/Telegram cho bạn)." +
        "</div>" +
        '<button type="button" id="new-order-btn" class="btn-outline" style="width:100%;">Đặt thêm đơn khác</button>' +
        "</div>";
      return;
    }

    if (state.cart.length === 0) {
      cartBodyEl.innerHTML =
        '<div class="cart-empty">' +
        "<p>Phiếu đặt hàng hiện đang trống. Bạn xem qua các mẻ trong thực đơn rồi chọn dung tích phù hợp nhé.</p>" +
        '<button type="button" id="empty-back-menu" class="btn-ink">Quay lại tờ thực đơn</button>' +
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
        ? "Đơn từ 350.000đ đã được miễn phí giao hàng."
        : "Thêm " + formatVnd(FREE_SHIP_THRESHOLD - totals.subtotal) + " nữa để được miễn phí giao hàng.";

    var isVietQr = state.paymentMethod === "vietqr";
    var transferMemo = state.draftOrderCode;

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
      '<div class="field-group">' +
      '<span class="field-label">Cách thanh toán</span>' +
      '<div class="pay-options">' +
      '<label class="pay-option">' +
      '<input type="radio" name="payment" value="cod"' +
      (!isVietQr ? " checked" : "") +
      " />" +
      "<div><strong>Trả tiền khi nhận (COD)</strong><span>Kiểm tra chai nguyên vẹn rồi trả tiền</span></div>" +
      "</label>" +
      '<label class="pay-option">' +
      '<input type="radio" name="payment" value="vietqr"' +
      (isVietQr ? " checked" : "") +
      " />" +
      "<div><strong>Chuyển khoản (VietQR)</strong><span>Tự điền sẵn số tiền &amp; mã đơn</span></div>" +
      "</label>" +
      "</div>" +
      "</div>" +
      '<div id="vietqr-panel" class="vietqr-box"' +
      (isVietQr ? "" : " hidden") +
      ">" +
      '<div class="vietqr-svg-wrap">' +
      buildSampleQrSvg() +
      "</div>" +
      '<div class="vietqr-info">' +
      "<p><strong>Phiếu chuyển khoản mẫu (VietQR)</strong></p>" +
      "<p>Ngân hàng: <strong>[Tên ngân hàng]</strong><br/>Số TK: <strong style='font-family:var(--font-mono);'>0000 1234 5678</strong> — <strong>[Chủ TK]</strong></p>" +
      "<p>Số tiền: <strong style='font-family:var(--font-mono);'>" +
      formatVnd(totals.total) +
      "</strong><br/>Nội dung CK: <strong id='vietqr-memo' style='font-family:var(--font-mono);'>" +
      escapeHtml(transferMemo) +
      "</strong></p>" +
      '<button type="button" id="copy-memo-btn" class="copy-btn">Chép nội dung ' +
      escapeHtml(transferMemo) +
      "</button>" +
      "</div>" +
      "</div>" +
      '<p id="form-error" class="form-error" hidden></p>' +
      '<button type="submit" class="submit-order-btn">Gửi đơn cho Hương (' +
      formatVnd(totals.total) +
      ")</button>" +
      "</form>";
  }

  function openCartDrawer() {
    hideToast();
    renderCartDrawer();
    cartBackdrop.hidden = false;
    detailBackdrop.hidden = true;
    document.body.classList.add("sheet-open");
  }

  // Bắt sự kiện trên toàn trang
  document.addEventListener("click", function (e) {
    var target = e.target;

    // Tab lọc danh mục
    var filterTab = target.closest(".filter-tab");
    if (filterTab) {
      var nextFilter = filterTab.getAttribute("data-filter");
      state.filter = nextFilter;
      var allTabs = document.querySelectorAll(".filter-tab");
      for (var t = 0; t < allTabs.length; t++) {
        var active = allTabs[t] === filterTab;
        allTabs[t].classList.toggle("is-active", active);
        allTabs[t].setAttribute("aria-selected", active ? "true" : "false");
      }
      renderMenu();
      return;
    }

    // Chọn dung tích trên thẻ thực đơn
    var variantBtn = target.closest('[data-action="select-variant"]');
    if (variantBtn) {
      var pId = variantBtn.getAttribute("data-product");
      var vId = variantBtn.getAttribute("data-variant");
      state.selectedVariants[pId] = vId;
      var prod = findProduct(pId);
      var vr = findVariant(prod, vId);
      var card = variantBtn.closest(".menu-item");
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

    // Thêm vào giỏ từ tờ thực đơn
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

    // Mở tờ chi tiết sản phẩm
    var detailBtn = target.closest('[data-action="open-detail"]');
    if (detailBtn) {
      openDetailDrawer(detailBtn.getAttribute("data-product"));
      return;
    }

    // Đổi dung tích bên trong tờ chi tiết
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

    // Nút thêm vào giỏ bên trong tờ chi tiết
    if (target.id === "detail-add-btn") {
      addToCart(target.getAttribute("data-product"));
      closeDrawers();
      return;
    }

    // Nút điều chỉnh giỏ hàng
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

    // Nút quay lại thực đơn khi giỏ trống
    if (target.id === "empty-back-menu") {
      closeDrawers();
      var menuSection = document.getElementById("thuc-don");
      if (menuSection) menuSection.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Nút chép nội dung chuyển khoản VietQR
    if (target.id === "copy-memo-btn") {
      var memo = state.draftOrderCode;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(memo).then(
          function () {
            target.textContent = "Đã chép: " + memo;
          },
          function () {
            target.textContent = "Mã đơn: " + memo;
          }
        );
      } else {
        target.textContent = "Mã đơn: " + memo;
      }
      return;
    }

    // Đặt thêm đơn mới sau khi hoàn tất phiếu xác nhận
    if (target.id === "new-order-btn") {
      state.submittedOrder = null;
      state.draftOrderCode = generateOrderCode();
      closeDrawers();
      return;
    }

    // Accordion hỏi đáp
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

  // Đổi phương thức thanh toán COD / VietQR trong giỏ
  cartBodyEl.addEventListener("change", function (e) {
    if (e.target && e.target.name === "payment") {
      state.paymentMethod = e.target.value;
      var qrPanel = document.getElementById("vietqr-panel");
      if (qrPanel) {
        qrPanel.hidden = state.paymentMethod !== "vietqr";
      }
    }
  });

  // Gửi phiếu đặt hàng
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
    state.submittedOrder = {
      code: state.draftOrderCode,
      name: name,
      phone: phone,
      address: address,
      note: note,
      paymentMethod: state.paymentMethod,
      items: state.cart.slice(),
      shipping: totals.shipping,
      total: totals.total
    };

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
  closeCartBtn.addEventListener("click", closeDrawers);

  detailBackdrop.addEventListener("click", function (e) {
    if (e.target === detailBackdrop) closeDrawers();
  });
  cartBackdrop.addEventListener("click", function (e) {
    if (e.target === cartBackdrop) closeDrawers();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && (!detailBackdrop.hidden || !cartBackdrop.hidden)) {
      closeDrawers();
    }
  });

  // Đánh dấu mục đang đọc trên thanh điều hướng dính
  var navLinks = document.querySelectorAll(".nav-link");
  window.addEventListener(
    "scroll",
    function () {
      var scrollY = window.scrollY + 110;
      var currentId = "thuc-don";
      var ids = ["thuc-don", "cach-lam", "hoi-dap"];
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

  // Khởi tạo giao diện ban đầu
  renderMenu();
  renderFaqs();
  updateCartBadge();
})();
