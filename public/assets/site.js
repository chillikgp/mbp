(function () {
  const isNext = typeof window !== "undefined" && (
    !!window.__NEXT_DATA__ || 
    !!document.querySelector('script[src*="/_next/"]') || 
    !!document.querySelector('link[href*="/_next/"]') || 
    !!document.querySelector('meta[name="next-head-count"]')
  );

  if (!isNext) {
    const analyticsId = "G-LW6GNLQ3KH";
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", analyticsId, { send_page_view: true });
  }

  window.mbpTrack = function mbpTrack(eventName, params) {
    const pagePath = window.location.pathname;
    
    // Auto-extract category slug from URL paths
    let pathCategory = "";
    if (pagePath.indexOf("/categories/") === 0 || pagePath.indexOf("/portfolio/") === 0 || pagePath.indexOf("/pricing/") === 0) {
      const parts = pagePath.split("/");
      pathCategory = parts[2] || "";
    }

    // Auto-extract product slug from URL path
    let pathProduct = "";
    if (pagePath.indexOf("/shop/") === 0) {
      const parts = pagePath.split("/");
      pathProduct = parts[2] || "";
    }

    const payload = Object.assign({
      site: "mybabypictures.in",
      page: pagePath,
      category: pathCategory || undefined,
      product: pathProduct || undefined
    }, params || {});

    // Clean up empty/undefined values so they don't bloat the payload
    Object.keys(payload).forEach(function (key) {
      if (payload[key] === undefined || payload[key] === "") {
        delete payload[key];
      }
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
    }
    window.dispatchEvent(new CustomEvent("mbp:track", { detail: { eventName, payload } }));
  };

  function getSourceOf(element) {
    if (!element) return "body";
    if (element.closest("header, .site-header")) return "header";
    if (element.closest("footer, .site-footer")) return "footer";
    const section = element.closest("section, #contact, #categories, #portfolio");
    if (section) {
      const src = section.id || section.className || "section";
      return src.replace(/\s+/g, "-").split("-")[0];
    }
    return "body";
  }

  document.addEventListener("click", function (event) {
    const clickable = event.target.closest("a, button");
    if (!clickable) return;

    const href = clickable.tagName === "A" ? clickable.getAttribute("href") || "" : "";
    const textContent = clickable.textContent.trim();
    const label = clickable.dataset.trackLabel || textContent;
    const cleanText = label.toLowerCase();
    const source = getSourceOf(clickable);

    // 1. WhatsApp Click Tracking
    if (href.includes("wa.me") || href.includes("api.whatsapp.com")) {
      window.mbpTrack("whatsapp_click", {
        label: label || "WhatsApp Link",
        href: href,
        source: source
      });
    }

    // 2. Phone Click Tracking
    if (href.startsWith("tel:")) {
      window.mbpTrack("phone_click", {
        label: label || href,
        phone: href.replace("tel:", ""),
        source: source
      });
    }

    // 3. Book Now Click Tracking
    if (cleanText.includes("book now") || cleanText.includes("book a session")) {
      window.mbpTrack("book_now_click", {
        label: label,
        href: href,
        source: source
      });
    }
  });

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll("[data-track]").forEach((element) => {
    element.addEventListener("click", () => {
      window.mbpTrack(element.dataset.track, {
        label: element.dataset.trackLabel || element.textContent.trim(),
        href: element.getAttribute("href") || "",
        category: element.dataset.category || "",
        source: getSourceOf(element)
      });
    });
  });

  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxClose = document.querySelector("[data-lightbox-close]");

  function closeLightbox() {
    if (!lightbox || !lightboxImage) return;
    lightbox.classList.remove("is-open");
    lightboxImage.removeAttribute("src");
    lightboxImage.removeAttribute("alt");
  }

  document.querySelectorAll("[data-gallery-image]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!lightbox || !lightboxImage) return;
      const img = button.querySelector("img");
      lightboxImage.src = button.dataset.galleryImage;
      lightboxImage.alt = img ? img.alt : "My Baby Pictures portfolio image";
      lightbox.classList.add("is-open");
      window.mbpTrack("gallery_image_open", {
        category: button.dataset.category || "",
        image: button.dataset.galleryImage
      });
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.querySelectorAll("[data-portfolio-tabs]").forEach((tabs) => {
    const grid = tabs.parentElement?.querySelector(".portfolio-grid");
    if (!grid) return;
    tabs.querySelectorAll("[data-portfolio-tab]").forEach((tabButton) => {
      tabButton.addEventListener("click", () => {
        const theme = tabButton.dataset.portfolioTab;
        tabs.querySelectorAll("[data-portfolio-tab]").forEach((button) => {
          button.classList.toggle("is-active", button === tabButton);
        });
        grid.querySelectorAll(".portfolio-item").forEach((item) => {
          const matches = theme === "all" || item.dataset.theme === theme;
          item.classList.toggle("is-hidden", !matches);
        });
        window.mbpTrack("portfolio_theme_filter", { theme });
      });
    });
  });

  const SOUND_ON_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M19 6a9 9 0 0 1 0 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const SOUND_OFF_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  document.querySelectorAll("[data-hero-video]").forEach((video) => {
    const toggle = video.parentElement?.querySelector("[data-hero-sound-toggle]");

    function syncToggle() {
      if (!toggle) return;
      toggle.innerHTML = video.muted ? SOUND_OFF_ICON : SOUND_ON_ICON;
      toggle.setAttribute("aria-label", video.muted ? "Unmute video" : "Mute video");
    }

    // Try to autoplay with sound; browsers that block audible autoplay will
    // reject this, so fall back to a muted (guaranteed-allowed) autoplay.
    video.muted = false;
    video
      .play()
      .catch(() => {
        video.muted = true;
        return video.play().catch(() => {});
      })
      .finally(syncToggle);

    toggle?.addEventListener("click", () => {
      video.muted = !video.muted;
      if (!video.muted) video.play().catch(() => {});
      syncToggle();
      window.mbpTrack("hero_video_sound_toggle", { muted: video.muted });
    });
  });

  document.querySelectorAll("video, iframe[data-video]").forEach((video) => {
    video.addEventListener("play", () => {
      window.mbpTrack("video_play", {
        label: video.getAttribute("title") || video.currentSrc || video.src || "video"
      });
    }, { once: true });
  });

  document.querySelectorAll("form[data-track-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const category = formData.get("category") || form.dataset.category || "";
      window.mbpTrack("generate_lead", {
        form: form.dataset.trackForm,
        category
      });
      const message = encodeURIComponent(
        `Hi My Baby Pictures, I want to inquire about ${category || "a photography session"}. My name is ${formData.get("name") || ""}. Phone: ${formData.get("phone") || ""}.`
      );
      window.location.href = `https://wa.me/917042926912?text=${message}`;
    });
  });

  const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  const orderKey = (slug) => `mbp-shop-order-${slug}`;

  function getProductFrom(element) {
    if (!element?.dataset.product) return null;
    try {
      return JSON.parse(element.dataset.product);
    } catch {
      return null;
    }
  }

  function selectedOptions(root) {
    const options = {};
    root.querySelectorAll(".variant-group").forEach((group) => {
      const checked = group.querySelector("input:checked");
      if (checked) {
        options[group.dataset.variantGroup] = {
          label: checked.value,
          price: Number(checked.dataset.price || 0)
        };
      }
    });
    return options;
  }

  function personalization(root) {
    const fields = {};
    root.querySelectorAll(".product-fields input").forEach((input) => {
      fields[input.name] = input.value.trim();
    });
    return fields;
  }

  function quantity(root) {
    const input = root.querySelector("[data-quantity]");
    return Math.max(1, Number(input?.value || 1));
  }

  function productTotal(product, root) {
    const variantTotal = Object.values(selectedOptions(root)).reduce((sum, option) => sum + option.price, 0);
    return variantTotal * quantity(root);
  }

  document.querySelectorAll("[data-product-gallery]").forEach((gallery) => {
    const main = gallery.querySelector("[data-product-main-image]");
    gallery.querySelectorAll("[data-product-thumb]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!main) return;
        main.src = button.dataset.productThumb;
        gallery.querySelectorAll("[data-product-thumb]").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
      });
    });
  });

  document.querySelectorAll("[data-product-detail]").forEach((root) => {
    const product = getProductFrom(root);
    if (!product) return;

    // Track product view (GA4 standard view_item)
    window.mbpTrack("view_item", {
      id: product.id,
      product: product.name,
      slug: product.slug,
      value: product.startingPrice || 0,
      currency: "INR"
    });

    const price = root.querySelector("[data-product-price]");
    const checkout = root.querySelector("[data-product-checkout]");

    if (checkout) {
      checkout.addEventListener("click", () => {
        window.mbpTrack("customize_start", {
          id: product.id,
          product: product.name,
          slug: product.slug,
          quantity: quantity(root),
          value: productTotal(product, root),
          currency: "INR",
          source: getSourceOf(checkout)
        });
      });
    }

    function update() {
      const total = productTotal(product, root);
      if (price) price.textContent = money(total);
      if (checkout) {
        const params = new URLSearchParams();
        params.set("quantity", String(quantity(root)));
        Object.entries(selectedOptions(root)).forEach(([key, option]) => params.set(key, option.label));
        Object.entries(personalization(root)).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
        checkout.href = `/shop/${product.slug}/checkout/?${params.toString()}`;
      }
    }

    root.addEventListener("change", update);
    root.addEventListener("input", update);
    root.querySelector("[data-qty-minus]")?.addEventListener("click", () => {
      const input = root.querySelector("[data-quantity]");
      input.value = String(Math.max(1, Number(input.value || 1) - 1));
      update();
    });
    root.querySelector("[data-qty-plus]")?.addEventListener("click", () => {
      const input = root.querySelector("[data-quantity]");
      input.value = String(Math.max(1, Number(input.value || 1) + 1));
      update();
    });
    update();
  });

  document.querySelectorAll("[data-product-checkout-page]").forEach((root) => {
    const product = getProductFrom(root);
    if (!product) return;
    const params = new URLSearchParams(window.location.search);
    const uploadInput = root.querySelector("[data-photo-upload]");
    const uploadPreview = root.querySelector("[data-upload-preview]");
    const summaryLines = root.querySelector("[data-summary-lines]");
    const summaryTotal = root.querySelector("[data-summary-total]");
    const previewCopy = root.querySelector("[data-preview-copy]");
    const customerForm = root.querySelector("[data-customer-form]");
    const uploaded = [];

    root.querySelectorAll(".variant-group").forEach((group) => {
      const wanted = params.get(group.dataset.variantGroup);
      if (!wanted) return;
      group.querySelectorAll("input").forEach((input) => {
        input.checked = input.value === wanted;
      });
    });
    root.querySelectorAll(".product-fields input").forEach((input) => {
      input.value = params.get(input.name) || "";
    });
    const qtyInput = root.querySelector("[data-quantity]");
    if (qtyInput && params.get("quantity")) qtyInput.value = params.get("quantity");

    function renderUploads() {
      if (!uploadPreview) return;
      uploadPreview.innerHTML = uploaded
        .map(
          (photo, index) => `
            <div class="upload-thumb">
              <img src="${photo.url}" alt="${photo.name}">
              <button type="button" data-remove-photo="${index}" aria-label="Remove ${photo.name}">×</button>
            </div>`
        )
        .join("");
      uploadPreview.querySelectorAll("[data-remove-photo]").forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.removePhoto);
          const [removed] = uploaded.splice(index, 1);
          if (removed) URL.revokeObjectURL(removed.url);
          renderUploads();
          updateSummary();
        });
      });
    }

    function updateSummary() {
      const options = selectedOptions(root);
      const details = personalization(root);
      const total = productTotal(product, root);
      const lines = [
        ...Object.entries(options).map(([key, option]) => [key, option.label]),
        ["Quantity", quantity(root)],
        ["Photos", `${uploaded.length} uploaded`],
        ...Object.entries(details).filter(([, value]) => value).map(([key, value]) => [key, value])
      ];
      if (summaryLines) {
        summaryLines.innerHTML = lines.map(([label, value]) => `<div class="summary-line"><span>${label}</span><strong>${value}</strong></div>`).join("");
      }
      if (summaryTotal) summaryTotal.textContent = money(total);
      if (previewCopy) {
        previewCopy.textContent = `${Object.values(options).map((option) => option.label).join(", ")}. ${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} uploaded.`;
      }
    }

    uploadInput?.addEventListener("change", () => {
      const max = Number(uploadInput.dataset.max || product.upload?.max || 1);
      [...uploadInput.files].slice(0, Math.max(0, max - uploaded.length)).forEach((file) => {
        uploaded.push({ name: file.name, url: URL.createObjectURL(file) });
      });
      uploadInput.value = "";
      renderUploads();
      updateSummary();
    });

    root.addEventListener("change", updateSummary);
    root.addEventListener("input", updateSummary);
    root.querySelector("[data-qty-minus]")?.addEventListener("click", () => {
      const input = root.querySelector("[data-quantity]");
      input.value = String(Math.max(1, Number(input.value || 1) - 1));
      updateSummary();
    });
    root.querySelector("[data-qty-plus]")?.addEventListener("click", () => {
      const input = root.querySelector("[data-quantity]");
      input.value = String(Math.max(1, Number(input.value || 1) + 1));
      updateSummary();
    });

    root.querySelector("[data-pay-cashfree]")?.addEventListener("click", () => {
      const min = Number(uploadInput?.dataset.min || product.upload?.min || 1);
      if (uploaded.length < min) {
        alert(`Please upload at least ${min} photo${min === 1 ? "" : "s"} before payment.`);
        return;
      }
      if (customerForm && !customerForm.reportValidity()) return;
      const customer = Object.fromEntries(new FormData(customerForm).entries());
      const orderId = `MBP-${Date.now().toString(36).toUpperCase()}`;
      const order = {
        orderId,
        status: "success-placeholder",
        product: { slug: product.slug, name: product.name },
        options: selectedOptions(root),
        personalization: personalization(root),
        quantity: quantity(root),
        uploadedPhotos: uploaded.map((photo) => photo.name),
        customer,
        total: productTotal(product, root),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(orderKey(product.slug), JSON.stringify(order));
      window.mbpTrack("cashfree_placeholder_pay", { product: product.slug, value: order.total });
      window.location.href = `/shop/${product.slug}/confirmation/?order=${encodeURIComponent(orderId)}&status=success`;
    });

    updateSummary();
  });

  document.querySelectorAll("[data-order-confirmation]").forEach((root) => {
    const product = getProductFrom(root);
    if (!product) return;
    const summary = root.querySelector("[data-confirmation-summary]");
    let order = null;
    try {
      order = JSON.parse(localStorage.getItem(orderKey(product.slug)) || "null");
    } catch {
      order = null;
    }
    if (!summary || !order) return;
    summary.innerHTML = `
      <article class="content-card"><h3>Order ID</h3><p>${order.orderId}</p></article>
      <article class="content-card"><h3>Payment status</h3><p>${order.status}</p></article>
      <article class="content-card"><h3>Total</h3><p>${money(order.total)}</p></article>
      <article class="content-card"><h3>Product</h3><p>${order.product.name} × ${order.quantity}</p></article>
      <article class="content-card"><h3>Photos</h3><p>${order.uploadedPhotos.length} uploaded file${order.uploadedPhotos.length === 1 ? "" : "s"}</p></article>
      <article class="content-card"><h3>Next steps</h3><p>Design check, print preparation, safe packaging and WhatsApp updates.</p></article>`;
  });
})();
