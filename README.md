# Ration Saathi (रेशन साथी / राशन साथी)
> **Public Distribution System (PDS) Citizen Entitlement & Grievance Redressal Portal**  
> *Department of Food, Civil Supplies and Consumer Protection, Government of Maharashtra*

Ration Saathi is a digital public service web application designed to empower ration card beneficiaries across Maharashtra. Citizens can verify their statutory foodgrain entitlements (Wheat, Rice, Sugar) by card category, log actual grain received at Fair Price Shops (FPS), and generate formal, printable discrepancy reports for official grievance redressal.

---

## 🌟 Key Features

- **🏛️ Calm, Authoritative, GIGW & WCAG 2.1 AA Compliant Design**:
  - Color tokens tested for high contrast in both Light and Dark themes.
  - Native **View Transitions API** circular reveal theme toggle with 200ms fallback.
  - Zero FOUC / pre-paint theme script.
  - Fluid typography with self-hosted fonts (`@fontsource/inter` and `@fontsource/noto-sans-devanagari`).
  - Strict tabular numbers (`font-variant-numeric: tabular-nums`) for measurements, weights, and docket IDs.
  - Consistent inline SVG icon system replacing emoji.

- **🌐 Multilingual Support (English, मराठी, हिन्दी)**:
  - Instant client-side switching between English, Marathi, and Hindi without page reloads.
  - Externalized strings in `src/i18n/{en,mr,hi}.json`.

- **🎨 3D Interactive Hero Scene (Three.js)**:
  - Softly lit, slowly rotating procedural 3D ration smart card with orbiting low-poly wheat stalks, rice grains, and sugar cubes.
  - Real-time mouse and touch parallax.
  - Live re-theming of lighting, materials, and accents when toggling dark/light modes.
  - Lazy-loaded via dynamic import and `IntersectionObserver` (~130 KB gzipped).
  - Pauses execution on hidden tabs (`document.hidden`) or off-screen scroll.
  - Graceful fallback to static CSS-3D/SVG for devices with reduced motion, data-saver mode, low CPU cores, or low RAM.

- **📋 5-Step Guided Citizen Flow**:
  1. **Sign In**: Split 2-column layout with 3D hero, live password criteria checklist, caps-lock indicator, password visibility toggle, NFSA Consumer Rights cards, and FAQ accordion.
  2. **Beneficiary Profile**: Name, 10-digit mobile number, Ration ID, and selectable card category tile group with color chips.
  3. **Statutory Entitlements**: Real-time monthly quotas (Orange, Yellow / BPL, White / APL, AAY) with animated count-up numbers and circular progress rings.
  4. **Record Deliveries & Evidence**: Delivery logging form, duplicate entry alerts, live "Received vs Entitled" progress side panel, and drag-and-drop receipt image upload (<= 3 MB).
  5. **Discrepancy Grievance Report**: Official docket format with automated reference code (`RS-YYYYMMDD-XXXX`), entitlement comparison table, finding status chips, visual comparison bar chart, and print-ready stylesheet (A4 optimized).

- **🔒 Client-Side Privacy Guarantee**:
  - Zero PII (Personally Identifiable Information) stored in `localStorage`.
  - All citizen input rendered safely with `textContent` (XSS immune).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/ration-saathi.git

# Navigate to project directory
cd ration-saathi

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev

# Open http://localhost:4321 in your browser
```

### Build & Preview

```bash
# Type check and Astro diagnostics (0 errors, 0 warnings)
npm run check

# Create production build
npm run build

# Preview production build locally
npm run preview
```

---

## ☁️ Deployment on Vercel

### Option 1: One-Click GitHub Integration (Recommended)

1. Push this repository to your **GitHub** account.
2. Log in to [Vercel](https://vercel.com).
3. Click **"Add New"** > **"Project"**.
4. Import your `ration-saathi` repository.
5. Vercel automatically detects **Astro**:
   - **Framework Preset**: Astro
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Your site will be live on an HTTPS URL in seconds!

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy to Vercel
vercel
```

---

## 📜 Statutory Information

- **PDS National & State Toll-Free Helpline**: `1967`
- **National Consumer Helpline**: `1915`
- **Government of Maharashtra Food & Civil Supplies Portal**: [mahaepos.gov.in](https://mahaepos.gov.in)
- **CPGRAMS Public Grievance Portal**: [pgportal.gov.in](https://pgportal.gov.in)

---

## 📄 License

This project is licensed under the MIT License.
