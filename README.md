<<<<<<< HEAD
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
=======
SOLUTION EXPLAINED

# Ration Assistant Know what you're owed.

A phone-friendly tool that tells a ration cardholder their monthly entitlement, records what the shop actually delivered, and produces a printable discrepancy report for a complaint.

[See how it works ↓](#flow)

**RATION CARD**

### Orange Card

Wheat 10 · Rice 9 · Sugar 5 kg

🌾

## The problem

Beneficiaries often don't know their exact entitlement, rarely keep records, and have no organised evidence when a shop short-changes them. Complaints fail for lack of proof.

❓Unknown entitlement

Card category sets exact monthly kg per commodity.

📒No records

Date, vendor and quantity logged per delivery.

🧾No proof

Attach a receipt photo or ration ID as evidence.

📣Hard to report

One report to print or save as PDF; helpline 1967.

## The 5-step journey

Move your cursor over a card — each step is a screen in the app.

1🔐

### Sign in

Username plus password (8+ chars, one capital, one special). Rights & card rules shown. Prototype only — no real account check.

2👤

### Profile

Name, 10-digit phone, Ration ID, and card category: Orange, Yellow, White or AAY.

3⚖️

### Entitlement

Looks up monthly Wheat, Rice and Sugar quantities for the chosen category.

4📝

### Record

Add deliveries (date, vendor ID, item, kg). Attach image evidence (max 3 MB) or Ration ID, plus remarks.

5📄

### Report

Expected vs recorded, difference and status, with logs and evidence. Print / save as PDF.

## Entitlements in 3D

Pick a card category. Quantities are sample values for the prototype; real amounts depend on state rules.

## Try the discrepancy engine

This is the same logic as the report: Difference = Expected − Recorded. Enter kg received this month for the selected card above.

Wheat received

Rice received

Sugar received

Classifications use only recorded data and are pending verification.

## Details at a glance

### 🛡️ Validation

Password pattern check, 10-digit phone, required delivery fields, non-negative quantities, image type and 3 MB size limit.

### 🔒 Privacy

One self-contained file with no server calls. Data lives only in the browser tab and is gone on reload or "New Report".

### 📱 Mobile first

Single-column layout, 16px inputs, 48px tap targets, dark theme, works offline once opened.

### 🖨️ Print ready

Print styles hide everything except the report, switching to a clean black-on-white layout for PDF.

### 🧮 Status labels

**Shortage indicated** if difference > 0, **Matches** if 0, **Above expected** if \< 0.

### ⚖️ Your rights

Food, correct quantity, fair price, information, and complaint — summarised on every report.

Ration complaints & shortages

Helpline 1967
>>>>>>> cd743cfcb42dfef8c0b1018dad7cd5f8c4b1a7b3
