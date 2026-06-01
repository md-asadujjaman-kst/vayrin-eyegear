/**
 * VAYRIN EYE GEAR — main.js
 * ─────────────────────────────────────────────────────────────────
 * DEVELOPER NOTES:
 *
 * This file handles:
 *   1. Navigation (sticky scroll, mobile menu)
 *   2. Scroll reveal animations
 *   3. Product 3D Viewer (drag-to-rotate)
 *   4. Tab system
 *   5. Order form (validation + WhatsApp submit)
 *   6. Quantity controls
 *   7. Toast notifications
 *   8. Smooth page-transition effect
 *
 * TO CUSTOMIZE ORDER SUBMISSION:
 *   → Search for "ORDER_SUBMIT_CONFIG" below
 *   → Replace phone number and form fields as needed
 *   → For backend integration, replace sendOrderViaWhatsApp()
 *     with a fetch() POST call to your API.
 *
 * DEPENDENCIES: None (vanilla JS, no jQuery needed)
 * ─────────────────────────────────────────────────────────────────
 */

'use strict';

/* ================================================================
   CONFIG — Change these values to match the client
   ================================================================ */
const CONFIG = {
  // ORDER_SUBMIT_CONFIG: Phone number (with country code, no + or spaces)
  whatsappNumber: '8801930744595',  // BD: 880 + local number without leading 0

  // Product details for WhatsApp order message
  productName: 'Premium Ray-Ban Blue Cut Eyeglasses',
  productPrice: 1100,
  deliveryInDhaka: 70,
  deliveryOutsideDhaka: 120,

  // Facebook Pixel ID — replace 'XXXXXXXXXXXXXXXXXX' with actual ID
  // fbPixelId: 'XXXXXXXXXXXXXXXXXX',

  // Google Analytics — replace with actual GA4 measurement ID
  // gaId: 'G-XXXXXXXXXX',
};

/* ================================================================
   1. NAVIGATION
   ================================================================ */
(function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.nav__mobile-menu');

  if (!nav) return;

  // Sticky scroll effect
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu toggle
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });
  }

  // Highlight active nav link based on current page
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    if (link.getAttribute('href') === current) link.classList.add('active');
  });
})();

/* ================================================================
   2. SCROLL REVEAL
   ================================================================ */
(function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(el => observer.observe(el));
})();

/* ================================================================
   3. 3D PRODUCT VIEWER
   ================================================================ */
class ProductViewer3D {
  /**
   * Creates a draggable 3D product viewer
   * @param {HTMLElement} stageEl - The .viewer-stage element
   * @param {HTMLElement} objectEl - The .viewer-object element inside stage
   *
   * DEVELOPER: To add more product angles, push image paths into
   * this.angles array and call this.updateImage(index)
   */
  constructor(stageEl, objectEl) {
    this.stage   = stageEl;
    this.object  = objectEl;
    this.img     = objectEl.querySelector('.viewer-product-img');

    // Initial rotation state
    this.rotX = -8;
    this.rotY = 22;

    // Drag state
    this.isDragging   = false;
    this.lastX        = 0;
    this.lastY        = 0;
    this.velocityX    = 0;
    this.velocityY    = 0;

    // Auto-rotate
    this.autoAngle    = 22;
    this.isAutoRotating = true;
    this.autoRafId    = null;

    this.init();
  }

  init() {
    this.bindMouse();
    this.bindTouch();
    this.startAutoRotate();
    this.updateTransform();
  }

  bindMouse() {
    this.stage.addEventListener('mousedown', e => this.onDragStart(e.clientX, e.clientY));
    document.addEventListener('mousemove', e => this.onDragMove(e.clientX, e.clientY));
    document.addEventListener('mouseup',   () => this.onDragEnd());
  }

  bindTouch() {
    this.stage.addEventListener('touchstart', e => {
      const t = e.touches[0];
      this.onDragStart(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      const t = e.touches[0];
      this.onDragMove(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener('touchend', () => this.onDragEnd());
  }

  onDragStart(x, y) {
    this.isDragging = true;
    this.isAutoRotating = false;
    cancelAnimationFrame(this.autoRafId);
    this.lastX = x;
    this.lastY = y;
    this.object.classList.remove('animating');
  }

  onDragMove(x, y) {
    if (!this.isDragging) return;
    const dx = x - this.lastX;
    const dy = y - this.lastY;
    this.rotY += dx * 0.5;
    this.rotX -= dy * 0.3;
    // Clamp vertical rotation to prevent full flip
    this.rotX = Math.max(-35, Math.min(35, this.rotX));
    this.velocityX = dx;
    this.velocityY = dy;
    this.lastX = x;
    this.lastY = y;
    this.updateTransform();
  }

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    // Inertia glide after release
    this.applyInertia();
    // Resume auto-rotate after 3 seconds of inactivity
    setTimeout(() => {
      if (!this.isDragging) {
        this.autoAngle = this.rotY;
        this.startAutoRotate();
      }
    }, 3000);
  }

  applyInertia() {
    const decay = 0.92;
    const tick = () => {
      if (this.isDragging) return;
      this.velocityX *= decay;
      this.velocityY *= decay;
      this.rotY += this.velocityX * 0.3;
      this.rotX -= this.velocityY * 0.2;
      this.rotX = Math.max(-35, Math.min(35, this.rotX));
      this.updateTransform();
      if (Math.abs(this.velocityX) > 0.2 || Math.abs(this.velocityY) > 0.2) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }

  startAutoRotate() {
    this.isAutoRotating = true;
    const tick = (time) => {
      if (!this.isAutoRotating) return;
      this.autoAngle += 0.3;
      this.rotY = this.autoAngle;
      this.updateTransform();
      this.autoRafId = requestAnimationFrame(tick);
    };
    this.autoRafId = requestAnimationFrame(tick);
  }

  /** Snap to a preset angle */
  snapTo(rotX, rotY) {
    this.isAutoRotating = false;
    cancelAnimationFrame(this.autoRafId);
    this.object.classList.add('animating');
    this.rotX = rotX;
    this.rotY = rotY;
    this.updateTransform();
    setTimeout(() => this.object.classList.remove('animating'), 800);
    // Resume auto-rotate after 4 seconds
    setTimeout(() => {
      this.autoAngle = this.rotY;
      this.startAutoRotate();
    }, 4000);
  }

  updateTransform() {
    this.object.style.transform = `rotateX(${this.rotX}deg) rotateY(${this.rotY}deg)`;
  }
}

/* Initialize viewer if present */
(function initViewer() {
  const stage  = document.querySelector('.viewer-stage');
  const object = document.querySelector('.viewer-object');
  if (!stage || !object) return;

  const viewer = new ProductViewer3D(stage, object);

  // Angle preset buttons
  document.querySelectorAll('.viewer-angle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.viewer-angle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.dataset.angle;
      const presets = {
        front: [-8, 0],
        side:  [-8, 90],
        top:   [45, 0],
        detail:[-8, 180],
      };
      if (presets[preset]) viewer.snapTo(presets[preset][0], presets[preset][1]);
    });
  });

  // Thumbnail switching
  document.querySelectorAll('.viewer-thumb').forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.viewer-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const src = thumb.querySelector('img')?.src;
      const mainImg = document.querySelector('.viewer-product-img');
      if (mainImg && src) mainImg.src = src;
    });
  });
})();

/* ================================================================
   4. TAB SYSTEM
   ================================================================ */
(function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const buttons = tabGroup.querySelectorAll('.tab-btn');
    const panels  = document.querySelectorAll('.tab-panel');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p  => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
      });
    });
  });
})();

/* ================================================================
   5. QUANTITY CONTROLS
   ================================================================ */
(function initQtyControls() {
  document.querySelectorAll('.qty-control').forEach(el => {
    const minus = el.querySelector('.qty-minus');
    const plus  = el.querySelector('.qty-plus');
    const input = el.querySelector('.qty-input');
    if (!input) return;

    const update = (delta) => {
      const min = parseInt(input.min) || 1;
      const max = parseInt(input.max) || 10;
      const val = Math.min(max, Math.max(min, parseInt(input.value) + delta));
      input.value = val;
      input.dispatchEvent(new Event('change'));
    };

    minus?.addEventListener('click', () => update(-1));
    plus?.addEventListener('click',  () => update(1));
  });
})();

/* ================================================================
   6. ORDER FORM — WhatsApp Integration
   ================================================================ */
(function initOrderForm() {
  const form = document.getElementById('orderForm');
  if (!form) return;

  const deliveryRadios = form.querySelectorAll('input[name="delivery"]');
  const totalEl        = document.getElementById('orderTotal');
  const subtotalEl     = document.getElementById('orderSubtotal');
  const deliveryEl     = document.getElementById('orderDeliveryFee');

  // Update total when delivery changes
  const updateTotal = () => {
    const delivery = form.querySelector('input[name="delivery"]:checked');
    const fee      = delivery ? parseInt(delivery.dataset.fee) : CONFIG.deliveryInDhaka;
    const subtotal = CONFIG.productPrice;
    const total    = subtotal + fee;

    if (subtotalEl)  subtotalEl.textContent  = `৳ ${subtotal.toLocaleString()}`;
    if (deliveryEl)  deliveryEl.textContent  = `৳ ${fee}`;
    if (totalEl)     totalEl.textContent     = `৳ ${total.toLocaleString()}`;

    // Update sticky button total too
    const stickyTotal = document.querySelectorAll('.js-total-display');
    stickyTotal.forEach(el => el.textContent = `৳ ${total.toLocaleString()}`);
  };

  deliveryRadios.forEach(r => r.addEventListener('change', updateTotal));
  updateTotal(); // init

  // Form submission → WhatsApp
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name    = form.querySelector('[name="customerName"]')?.value.trim();
    const phone   = form.querySelector('[name="phone"]')?.value.trim();
    const address = form.querySelector('[name="address"]')?.value.trim();

    if (!name || !phone || !address) {
      showToast('সব তথ্য পূরণ করুন / Please fill all required fields', 'error');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      showToast('সঠিক মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)', 'error');
      return;
    }

    sendOrderViaWhatsApp(form);
  });

  function sendOrderViaWhatsApp(form) {
    /**
     * DEVELOPER NOTE:
     * This builds a WhatsApp message from the form and opens it.
     * For a backend order API, replace this with a fetch() POST
     * to your endpoint, then show a success screen.
     *
     * To add bKash/Nagad payment, add a payment method radio group
     * to the form HTML, and append it to the message below.
     */
    const name     = form.querySelector('[name="customerName"]')?.value.trim();
    const phone    = form.querySelector('[name="phone"]')?.value.trim();
    const address  = form.querySelector('[name="address"]')?.value.trim();
    const note     = form.querySelector('[name="note"]')?.value.trim() || '';
    const delivery = form.querySelector('input[name="delivery"]:checked');
    const zone     = delivery?.dataset.zone || 'ঢাকার মধ্যে';
    const fee      = delivery ? parseInt(delivery.dataset.fee) : CONFIG.deliveryInDhaka;
    const total    = CONFIG.productPrice + fee;

    const message = [
      '🛒 *নতুন অর্ডার — Vayrin Eye Gear*',
      '─────────────────────',
      `📦 পণ্য: ${CONFIG.productName}`,
      `💰 মূল্য: ৳${CONFIG.productPrice}`,
      `🚚 ডেলিভারি (${zone}): ৳${fee}`,
      `💳 মোট: ৳${total}`,
      `💵 পেমেন্ট: ক্যাশ অন ডেলিভারি`,
      '─────────────────────',
      `👤 নাম: ${name}`,
      `📞 মোবাইল: ${phone}`,
      `📍 ঠিকানা: ${address}`,
      note ? `📝 নোট: ${note}` : '',
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');

    // Optionally track as FB pixel event:
    // if (typeof fbq !== 'undefined') fbq('track', 'Purchase', { value: total, currency: 'BDT' });
  }
})();

/* ================================================================
   7. TOAST NOTIFICATIONS
   ================================================================ */
function showToast(message, type = 'info') {
  /**
   * Creates a temporary notification at the bottom of the screen.
   * Types: 'success', 'error', 'info'
   */
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.style.cssText = `
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      z-index: 9999; display: flex; flex-direction: column; gap: 8px;
      align-items: center; pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const colors = {
    success: '#10B981',
    error:   '#EF4444',
    info:    '#0EA5E9',
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: #0E1E2E; border: 1px solid ${colors[type]};
    color: #F1F5F9; padding: 12px 24px; border-radius: 12px;
    font-family: 'Hind Siliguri', sans-serif; font-size: 0.9rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5); pointer-events: auto;
    animation: toastIn 0.3s ease;
  `;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Add toast animation
const toastStyle = document.createElement('style');
toastStyle.textContent = `@keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }`;
document.head.appendChild(toastStyle);

/* ================================================================
   8. COUNTER ANIMATION (for stats)
   ================================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseFloat(el.dataset.counter);
      const dec = (el.dataset.counter.includes('.')) ? 1 : 0;
      let start = 0;
      const duration = 1800;
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        const val      = start + (end - start) * eased;
        el.textContent = val.toFixed(dec) + (el.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
})();

/* ================================================================
   9. SMOOTH PAGE ENTRY ANIMATION
   ================================================================ */
(function pageEntry() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });
  // Fallback: show body after 500ms regardless
  setTimeout(() => { document.body.style.opacity = '1'; }, 500);
})();

/* ================================================================
   10. ACTIVE SECTION BREADCRUMB (auto-highlight in nav)
   ================================================================ */
(function initSectionHighlight() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => obs.observe(s));
})();
