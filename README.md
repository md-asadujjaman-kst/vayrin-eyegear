# Vayrin Eye Gear — Developer README

## Project Overview
Multi-page e-commerce site for Vayrin Eye Gear (Blue Cut Eyeglasses, Bangladesh).  
Built with pure HTML + CSS + Vanilla JS — no frameworks, no build step needed.

---

## File Structure
```
vayrin-eyegear/
│
├── index.html        → Homepage (hero, features, testimonials, CTA)
├── product.html      → Product detail page with 3D viewer
├── order.html        → Order / checkout page
├── about.html        → About us page
├── contact.html      → Contact + FAQ page
│
├── style.css         → Global design system (all CSS variables + components)
├── main.js           → Global JavaScript (3D viewer, form, animations)
│
├── sitemap.xml       → SEO sitemap (submit to Google Search Console)
├── robots.txt        → Search crawler instructions
│
└── assets/           → CREATE THIS FOLDER and add:
    ├── glasses-hero.png       (hero section floating image, transparent PNG)
    ├── glasses-front.png      (3D viewer main — transparent PNG)
    ├── glasses-side.png       (3D viewer thumb 2)
    ├── glasses-case.png       (3D viewer thumb 3 — glasses case)
    ├── glasses-detail.png     (3D viewer thumb 4 — detail shot)
    ├── og-image.jpg           (1200x630px — Facebook/WhatsApp link preview)
    ├── og-product.jpg         (1200x630px — Product page OG image)
    ├── favicon.svg            (SVG favicon)
    └── apple-touch-icon.png   (180x180px)
```

---

## Quick Start (No Build Needed)

```bash
# Option 1: Python simple server
cd vayrin-eyegear
python3 -m http.server 8000
# Open http://localhost:8000

# Option 2: Node (if installed)
npx serve .

# Option 3: VS Code Live Server extension — just right-click index.html → Open with Live Server
```

---

## Configuration (main.js → CONFIG object)

```js
const CONFIG = {
  whatsappNumber: '8801930744595',  // Change phone number here
  productName:    'Premium Ray-Ban Blue Cut Eyeglasses',
  productPrice:   1100,             // Base price in BDT
  deliveryInDhaka: 70,
  deliveryOutsideDhaka: 120,
};
```

---

## Adding Product Images
Replace placeholder `src` attributes in these elements:
- `index.html`   → `.hero__visual-img` (hero floating image)
- `product.html` → `.viewer-product-img` (3D viewer main)
- `product.html` → `.viewer-thumb img` (thumbnail strip × 4)
- `product.html` → `.viewer-reflection img` (reflection layer)

**Best formats:**
- Transparent PNG for glasses-only shots (enables the float + reflection effect)
- WebP for photos
- Min 800px wide for 3D viewer; 72×72px for thumbnails

---

## SEO Setup Checklist

- [ ] Update domain in `sitemap.xml` (`https://vayrineyegear.com` → your domain)
- [ ] Update domain in `robots.txt`
- [ ] Update domain in all `<link rel="canonical">` and `<meta property="og:url">` tags
- [ ] Create and upload `og-image.jpg` (1200×630px) for social sharing
- [ ] Submit `sitemap.xml` to [Google Search Console](https://search.google.com/search-console)
- [ ] Add real `aggregateRating.reviewCount` in Schema.org JSON-LD (index.html bottom)
- [ ] Set up Google Analytics 4 — add GA4 snippet before `</head>` in all pages
- [ ] Set up Facebook Pixel — uncomment and add your Pixel ID in all pages
- [ ] Register on [Google My Business](https://business.google.com) for local SEO

---

## Facebook Pixel Setup

In each HTML file, find the commented `<!-- FACEBOOK PIXEL -->` block and:
1. Uncomment it
2. Replace `YOUR_PIXEL_ID_HERE` with your actual Pixel ID

Event tracking is pre-wired:
- `PageView` — fires on every page
- `InitiateCheckout` — fires on `order.html` (uncomment in order.html)
- `Purchase` — fires after WhatsApp order submission (uncomment in main.js)

---

## Order Form Integration Options

### A. WhatsApp (Current — works out of the box)
The form builds a structured WhatsApp message and opens wa.me in a new tab.
No backend needed. See `sendOrderViaWhatsApp()` in `main.js`.

### B. Backend API (PHP/Node)
Replace `sendOrderViaWhatsApp()` in main.js with:
```js
const res = await fetch('/api/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, phone, address, delivery, note }),
});
const data = await res.json();
if (data.success) showOrderSuccessPage();
```

### C. Formspree (Free, no backend)
```html
<form id="orderForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

### D. bKash Payment Integration
- Sandbox: https://developer.bka.sh/
- Add payment radio to the order form (already has a commented block)
- Call bKash Checkout API after form validation
- On payment success, submit the order to your backend

---

## Adding More Products
1. Duplicate `product.html` → `product-2.html`
2. Update all text, images, price, SKU
3. Update `CONFIG.productName` and `CONFIG.productPrice` in main.js  
   (or make it page-specific by reading from a `data-*` attribute on `<body>`)
4. Add to `sitemap.xml`
5. Add Schema.org Product markup at the bottom

---

## Performance Tips
- Convert all PNG/JPG images to WebP (use: https://squoosh.app/)
- Add `loading="lazy"` to all below-the-fold images (already done where applicable)
- Host on a CDN (Cloudflare Pages, Vercel, or Netlify — all free for static sites)
- Add `<link rel="preload">` for the hero image

---

## Deployment (Free Static Hosting)

### Netlify (Recommended)
```bash
# Drag-and-drop the entire folder at netlify.com/drop
# Or use Netlify CLI:
npm install -g netlify-cli
netlify deploy --dir . --prod
```

### Vercel
```bash
npm install -g vercel
vercel --name vayrin-eyegear
```

### GitHub Pages
1. Push to GitHub repo
2. Settings → Pages → Source: Deploy from branch → main / root
3. Your site is live at `https://USERNAME.github.io/vayrin-eyegear/`

---

## Local SEO Keywords (Target These)
- `blue cut glasses Bangladesh` / `ব্লু কাট চশমা`
- `blue light glasses Dhaka buy online`
- `Ray-Ban blue cut price Bangladesh`
- `computer glasses Bangladesh`
- `চোখের চশমা অনলাইন কিনুন ঢাকা`
- `digital eye protection glasses BD`

---

## Contact / Business Info to Update
Search for these strings and replace with real data:
- `01930744595` → real phone number
- `8801930744595` → real WhatsApp number (880 + number without leading 0)
- `vayrineyegear.com` → real domain
- `fb.com/vayrineyegear` → real Facebook page URL
- `Dhaka, Bangladesh` → specific address if desired

---

*Built with ❤️ for Vayrin Eye Gear — Bangladesh*
