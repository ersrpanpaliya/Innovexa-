/**
 * Ration Saathi - Main Application Controller
 * Handles 5-step wizard, real-time validations, accessibility announcements,
 * tilt effects, count-up animations, delivery logging, and discrepancy report generation.
 */

import { store, type BeneficiaryProfile } from './store';
import { ENTITLEMENTS, type CommodityType } from '../data/entitlements';
import { i18n } from './i18n';
import { initTheme, applyTheme } from './theme';
import { PASSWORD_REGEX, MOBILE_REGEX, MAX_FILE_SIZE_BYTES } from '../data/constants';

// Toast Notification Utility
export function showToast(message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const iconSpan = document.createElement('span');
  iconSpan.style.display = 'inline-flex';
  iconSpan.style.flexShrink = '0';

  if (type === 'success') {
    iconSpan.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (type === 'danger') {
    iconSpan.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else if (type === 'warning') {
    iconSpan.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else {
    iconSpan.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  toast.appendChild(iconSpan);
  toast.appendChild(textSpan);
  container.appendChild(toast);

  // Trigger reveal
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// Inline Field Error Utility
function setFieldError(fieldId: string, errorId: string, message: string | null) {
  const input = document.getElementById(fieldId) as HTMLInputElement | HTMLSelectElement | null;
  const errorEl = document.getElementById(errorId);
  if (!errorEl) return;

  if (message) {
    errorEl.textContent = message;
    errorEl.classList.add('active');
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', errorId);
    }
  } else {
    errorEl.textContent = '';
    errorEl.classList.remove('active');
    if (input) {
      input.removeAttribute('aria-invalid');
    }
  }
}

// Count-up animation for numbers
function animateValue(element: HTMLElement, start: number, end: number, duration = 800) {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (end - start) * easeOut);
    element.textContent = current.toString();
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = end.toString();
    }
  };
  requestAnimationFrame(step);
}

// 3D Pointer Tilt for cards
function initTiltCards() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const tiltCards = document.querySelectorAll<HTMLElement>('.tilt-card');
  tiltCards.forEach(card => {
    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
    };

    const handleLeave = () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
  });
}

// Application Initializer
export function initApp() {
  if (typeof document === 'undefined') return;

  initTheme();
  i18n.translateDOM();
  initTiltCards();

  // Lazy load 3D Hero
  const heroWrapper = document.getElementById('three-hero-container');
  if (heroWrapper) {
    const heroObserver = new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) {
        obs.disconnect();
        import('./hero3d').then(mod => {
          mod.initHero3D(heroWrapper);
        }).catch(err => {
          console.warn('Could not load 3D hero module:', err);
          heroWrapper.classList.add('fallback-mode');
        });
      }
    }, { threshold: 0.1 });
    heroObserver.observe(heroWrapper);
  }

  // Setup Stepper & Wizard transitions
  const stepperItems = document.querySelectorAll<HTMLElement>('.step-item');
  const stepperProgressBar = document.getElementById('stepper-progress-fill');

  const updateWizardView = (currentStep: number) => {
    // 1. Hide all steps, reveal current step
    for (let s = 1; s <= 5; s++) {
      const stepEl = document.getElementById(`step-${s}`);
      if (stepEl) {
        if (s === currentStep) {
          stepEl.classList.add('active');
          stepEl.removeAttribute('hidden');
          stepEl.setAttribute('aria-hidden', 'false');
        } else {
          stepEl.classList.remove('active');
          stepEl.setAttribute('hidden', 'true');
          stepEl.setAttribute('aria-hidden', 'true');
        }
      }
    }

    // 2. Update Stepper UI
    stepperItems.forEach((item, idx) => {
      const stepNumber = idx + 1;
      const button = item.querySelector<HTMLButtonElement>('.step-btn');
      if (stepNumber === currentStep) {
        item.classList.add('active');
        item.classList.remove('completed');
        button?.setAttribute('aria-current', 'step');
      } else if (stepNumber < currentStep) {
        item.classList.add('completed');
        item.classList.remove('active');
        button?.removeAttribute('aria-current');
      } else {
        item.classList.remove('active', 'completed');
        button?.removeAttribute('aria-current');
      }
    });

    if (stepperProgressBar) {
      const percentage = ((currentStep - 1) / 4) * 100;
      stepperProgressBar.style.width = `${percentage}%`;
    }

    // Step-specific updates
    if (currentStep === 3) {
      renderEntitlements();
    } else if (currentStep === 4) {
      renderDeliveriesTable();
      renderLiveComparisonPanel();
    } else if (currentStep === 5) {
      renderReport();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Subscribe store changes
  store.subscribe(state => {
    updateWizardView(state.currentStep);
  });

  // Stepper Click Handlers (Navigate to visited steps)
  stepperItems.forEach((item, idx) => {
    const stepNumber = idx + 1;
    const btn = item.querySelector<HTMLButtonElement>('.step-btn');
    btn?.addEventListener('click', () => {
      const state = store.getState();
      if (stepNumber <= state.currentStep || (stepNumber === 2 && state.signedIn) || (stepNumber === 3 && state.profile.name)) {
        store.setStep(stepNumber);
      }
    });
  });

  // Step 1: Password Show/Hide Toggle & Rules Live Checklist
  setupStep1Controls();

  // Step 2: Profile inputs and card category tile radios
  setupStep2Controls();

  // Step 3: Entitlement controls
  setupStep3Controls();

  // Step 4: Deliveries, live progress bar, file upload & tabs
  setupStep4Controls();

  // Step 5: Report actions (Print, Reset Dialog)
  setupStep5Controls();

  // Global Header navigation links
  setupHeaderNav();

  // Listen to hash on load
  store.handleHashChange();
}

/**
 * Step 1: Sign In Controls
 */
function setupStep1Controls() {
  const usernameInput = document.getElementById('login-username') as HTMLInputElement | null;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement | null;
  const togglePassBtn = document.getElementById('toggle-password-btn') as HTMLButtonElement | null;
  const capsLockHint = document.getElementById('caps-lock-hint');
  const signinBtn = document.getElementById('btn-signin') as HTMLButtonElement | null;

  // Password Checklist indicators
  const ruleLen = document.getElementById('rule-length');
  const ruleUpper = document.getElementById('rule-uppercase');
  const ruleSpecial = document.getElementById('rule-special');

  if (passwordInput) {
    // Show / Hide password
    togglePassBtn?.addEventListener('click', () => {
      const isPass = passwordInput.type === 'password';
      passwordInput.type = isPass ? 'text' : 'password';
      togglePassBtn.setAttribute('aria-label', isPass ? i18n.t('signin_password_hide') : i18n.t('signin_password_show'));
      togglePassBtn.classList.toggle('showing', isPass);
    });

    // Caps Lock indicator
    const checkCapsLock = (e: KeyboardEvent) => {
      if (capsLockHint && e.getModifierState) {
        if (e.getModifierState('CapsLock')) {
          capsLockHint.classList.add('active');
        } else {
          capsLockHint.classList.remove('active');
        }
      }
    };
    passwordInput.addEventListener('keydown', checkCapsLock);
    passwordInput.addEventListener('keyup', checkCapsLock);

    // Live password rules checklist
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      const isLen = val.length >= 8;
      const isUpper = /[A-Z]/.test(val);
      const isSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);

      ruleLen?.classList.toggle('valid', isLen);
      ruleUpper?.classList.toggle('valid', isUpper);
      ruleSpecial?.classList.toggle('valid', isSpecial);

      setFieldError('login-password', 'error-login-password', null);
    });
  }

  usernameInput?.addEventListener('input', () => {
    setFieldError('login-username', 'error-login-username', null);
  });

  signinBtn?.addEventListener('click', () => {
    const username = usernameInput?.value.trim() || '';
    const password = passwordInput?.value || '';

    let hasError = false;
    if (!username) {
      setFieldError('login-username', 'error-login-username', 'Please enter your username or ration ID.');
      hasError = true;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setFieldError('login-password', 'error-login-password', 'Password must meet all 3 criteria listed below.');
      hasError = true;
    }

    if (hasError) {
      showToast('Please fix the highlighted errors to continue.', 'danger');
      return;
    }

    store.setAuth(username);
    showToast(`Signed in as ${username}`, 'success');
    store.setStep(2);
  });
}

/**
 * Step 2: Profile Controls
 */
function setupStep2Controls() {
  const nameInput = document.getElementById('profile-name') as HTMLInputElement | null;
  const mobileInput = document.getElementById('profile-mobile') as HTMLInputElement | null;
  const rationInput = document.getElementById('profile-ration-id') as HTMLInputElement | null;
  const continueBtn = document.getElementById('btn-profile-continue') as HTMLButtonElement | null;
  const backBtn = document.getElementById('btn-profile-back') as HTMLButtonElement | null;
  const categoryTiles = document.querySelectorAll<HTMLInputElement>('input[name="card-category-radio"]');

  // Strict digits-only on mobile input
  mobileInput?.addEventListener('input', () => {
    mobileInput.value = mobileInput.value.replace(/\D/g, '').slice(0, 10);
    setFieldError('profile-mobile', 'error-profile-mobile', null);
  });

  nameInput?.addEventListener('input', () => setFieldError('profile-name', 'error-profile-name', null));
  rationInput?.addEventListener('input', () => setFieldError('profile-ration-id', 'error-profile-ration-id', null));

  categoryTiles.forEach(radio => {
    radio.addEventListener('change', () => {
      setFieldError('category-radiogroup', 'error-card-category', null);
    });
  });

  backBtn?.addEventListener('click', () => store.setStep(1));

  continueBtn?.addEventListener('click', () => {
    const name = nameInput?.value.trim() || '';
    const mobile = mobileInput?.value.trim() || '';
    const rationId = rationInput?.value.trim() || '';
    const selectedRadio = document.querySelector<HTMLInputElement>('input[name="card-category-radio"]:checked');
    const category = selectedRadio?.value as BeneficiaryProfile['category'] || '';

    let hasError = false;
    if (!name) {
      setFieldError('profile-name', 'error-profile-name', 'Beneficiary full name is required.');
      hasError = true;
    }

    if (!MOBILE_REGEX.test(mobile)) {
      setFieldError('profile-mobile', 'error-profile-mobile', 'Phone number must be exactly 10 digits.');
      hasError = true;
    }

    if (!rationId) {
      setFieldError('profile-ration-id', 'error-profile-ration-id', 'Ration Card ID is required.');
      hasError = true;
    }

    if (!category) {
      setFieldError('category-radiogroup', 'error-card-category', 'Please select your ration card category tile.');
      hasError = true;
    }

    if (hasError) {
      showToast('Please complete all required profile fields.', 'danger');
      return;
    }

    store.setProfile({ name, mobile, rationId, category });
    showToast('Profile saved successfully.', 'success');
    store.setStep(3);
  });
}

/**
 * Step 3: Entitlements Rendering & Controls
 */
function setupStep3Controls() {
  const continueBtn = document.getElementById('btn-entitlement-continue');
  const backBtn = document.getElementById('btn-entitlement-back');

  backBtn?.addEventListener('click', () => store.setStep(2));
  continueBtn?.addEventListener('click', () => store.setStep(4));
}

function renderEntitlements() {
  const state = store.getState();
  const categoryConfig = ENTITLEMENTS[state.profile.category];
  if (!categoryConfig) return;

  // Header chip & summary
  const summaryChip = document.getElementById('entitlement-card-chip');
  const summaryName = document.getElementById('entitlement-beneficiary-name');
  if (summaryChip) {
    summaryChip.textContent = categoryConfig.defaultLabel;
    summaryChip.style.backgroundColor = categoryConfig.chipColor;
    summaryChip.style.color = '#FFFFFF';
  }
  if (summaryName) {
    summaryName.textContent = state.profile.name || state.username;
  }

  // Count up numbers
  const wheatVal = document.getElementById('entitlement-qty-wheat');
  const riceVal = document.getElementById('entitlement-qty-rice');
  const sugarVal = document.getElementById('entitlement-qty-sugar');

  if (wheatVal) animateValue(wheatVal, 0, categoryConfig.wheat, 600);
  if (riceVal) animateValue(riceVal, 0, categoryConfig.rice, 600);
  if (sugarVal) animateValue(sugarVal, 0, categoryConfig.sugar, 600);

  // Animate progress rings or bars
  const wheatRing = document.getElementById('ring-wheat-fill') as SVGCircleElement | null;
  const riceRing = document.getElementById('ring-rice-fill') as SVGCircleElement | null;
  const sugarRing = document.getElementById('ring-sugar-fill') as SVGCircleElement | null;

  // Circumference for r=38 is 2 * PI * 38 ≈ 238.76
  const circ = 238.76;
  if (wheatRing) {
    const offset = circ - (categoryConfig.wheat / 25) * circ;
    wheatRing.style.strokeDashoffset = `${Math.max(0, offset)}`;
  }
  if (riceRing) {
    const offset = circ - (categoryConfig.rice / 25) * circ;
    riceRing.style.strokeDashoffset = `${Math.max(0, offset)}`;
  }
  if (sugarRing) {
    const offset = circ - (categoryConfig.sugar / 10) * circ;
    sugarRing.style.strokeDashoffset = `${Math.max(0, offset)}`;
  }
}

/**
 * Step 4: Records, Side Panel, Drag & Drop Upload
 */
let editingDeliveryId: string | null = null;

function setupStep4Controls() {
  const dateInput = document.getElementById('del-date') as HTMLInputElement | null;
  const vendorInput = document.getElementById('del-vendor') as HTMLInputElement | null;
  const commodityInput = document.getElementById('del-commodity') as HTMLSelectElement | null;
  const qtyInput = document.getElementById('del-qty') as HTMLInputElement | null;
  const addBtn = document.getElementById('btn-add-delivery') as HTMLButtonElement | null;
  const cancelEditBtn = document.getElementById('btn-cancel-edit') as HTMLButtonElement | null;
  const clearAllBtn = document.getElementById('btn-clear-deliveries') as HTMLButtonElement | null;
  const generateReportBtn = document.getElementById('btn-goto-report') as HTMLButtonElement | null;
  const backBtn = document.getElementById('btn-records-back') as HTMLButtonElement | null;
  const dupWarningBanner = document.getElementById('delivery-duplicate-warning');

  // Enforce max date = today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.max = today;
    dateInput.value = today;
  }

  // Clear errors on change
  dateInput?.addEventListener('input', () => setFieldError('del-date', 'error-del-date', null));
  vendorInput?.addEventListener('input', () => setFieldError('del-vendor', 'error-del-vendor', null));
  qtyInput?.addEventListener('input', () => setFieldError('del-qty', 'error-del-qty', null));

  // Add / Update Entry
  addBtn?.addEventListener('click', () => {
    const date = dateInput?.value.trim() || '';
    const vendorId = vendorInput?.value.trim() || '';
    const commodity = commodityInput?.value as CommodityType || 'Wheat';
    const qtyVal = qtyInput?.value.trim() || '';
    const qty = Number(qtyVal);

    let hasError = false;
    if (!date) {
      setFieldError('del-date', 'error-del-date', 'Distribution date is required.');
      hasError = true;
    }
    if (!vendorId) {
      setFieldError('del-vendor', 'error-del-vendor', 'Fair Price Shop / Vendor ID is required.');
      hasError = true;
    }
    if (qtyVal === '' || !Number.isFinite(qty) || qty < 0) {
      setFieldError('del-qty', 'error-del-qty', 'Please enter a valid quantity >= 0 kg.');
      hasError = true;
    }

    if (hasError) return;

    if (editingDeliveryId) {
      store.updateDelivery(editingDeliveryId, { date, vendorId, commodity, qty });
      showToast('Delivery entry updated.', 'success');
      editingDeliveryId = null;
      if (addBtn) addBtn.textContent = i18n.t('btn_add_entry');
      if (cancelEditBtn) cancelEditBtn.style.display = 'none';
    } else {
      const res = store.addDelivery({ date, vendorId, commodity, qty });
      if (res.duplicate) {
        if (dupWarningBanner) dupWarningBanner.style.display = 'flex';
        showToast('Duplicate delivery logged for this commodity and vendor.', 'warning');
      } else {
        if (dupWarningBanner) dupWarningBanner.style.display = 'none';
        showToast('Delivery entry added.', 'success');
      }
    }

    // Reset inputs
    if (qtyInput) qtyInput.value = '';
    renderDeliveriesTable();
    renderLiveComparisonPanel();
  });

  cancelEditBtn?.addEventListener('click', () => {
    editingDeliveryId = null;
    if (addBtn) addBtn.textContent = i18n.t('btn_add_entry');
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
    if (qtyInput) qtyInput.value = '';
    if (dupWarningBanner) dupWarningBanner.style.display = 'none';
  });

  clearAllBtn?.addEventListener('click', () => {
    if (store.getState().deliveries.length === 0) return;
    if (confirm('Are you sure you want to clear all delivery logs?')) {
      store.clearDeliveries();
      renderDeliveriesTable();
      renderLiveComparisonPanel();
      showToast('All delivery entries cleared.', 'info');
    }
  });

  // Complaint Evidence Tabs & Drag and Drop
  setupEvidenceTabsAndUpload();

  backBtn?.addEventListener('click', () => store.setStep(3));

  generateReportBtn?.addEventListener('click', () => {
    const state = store.getState();
    if (!state.profile.name || !state.profile.rationId || !state.profile.category) {
      showToast('Please complete your profile first.', 'warning');
      store.setStep(2);
      return;
    }
    store.generateReport();
    store.setStep(5);
  });
}

function renderDeliveriesTable() {
  const tbody = document.getElementById('deliveries-tbody');
  if (!tbody) return;
  tbody.replaceChildren();

  const state = store.getState();
  if (state.deliveries.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.style.textAlign = 'center';
    td.style.padding = '1.5rem';
    td.className = 'text-muted';
    td.textContent = i18n.t('table_empty');
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  state.deliveries.forEach(del => {
    const tr = document.createElement('tr');

    const tdDate = document.createElement('td');
    tdDate.textContent = del.date;

    const tdVendor = document.createElement('td');
    tdVendor.textContent = del.vendorId;

    const tdItem = document.createElement('td');
    tdItem.textContent = del.commodity;

    const tdQty = document.createElement('td');
    tdQty.className = 'tabular-nums';
    tdQty.textContent = `${del.qty.toFixed(2)} kg`;

    const tdActions = document.createElement('td');
    tdActions.style.display = 'flex';
    tdActions.style.gap = '0.5rem';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-action btn-action-edit';
    editBtn.setAttribute('aria-label', `Edit delivery of ${del.commodity}`);
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => {
      editingDeliveryId = del.id;
      const dateInput = document.getElementById('del-date') as HTMLInputElement | null;
      const vendorInput = document.getElementById('del-vendor') as HTMLInputElement | null;
      const commodityInput = document.getElementById('del-commodity') as HTMLSelectElement | null;
      const qtyInput = document.getElementById('del-qty') as HTMLInputElement | null;
      const addBtn = document.getElementById('btn-add-delivery') as HTMLButtonElement | null;
      const cancelEditBtn = document.getElementById('btn-cancel-edit') as HTMLButtonElement | null;

      if (dateInput) dateInput.value = del.date;
      if (vendorInput) vendorInput.value = del.vendorId;
      if (commodityInput) commodityInput.value = del.commodity;
      if (qtyInput) qtyInput.value = del.qty.toString();

      if (addBtn) addBtn.textContent = i18n.t('btn_update_entry');
      if (cancelEditBtn) cancelEditBtn.style.display = 'inline-flex';
      dateInput?.focus();
    });

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn-action btn-action-delete';
    delBtn.setAttribute('aria-label', `Delete delivery of ${del.commodity}`);
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => {
      store.deleteDelivery(del.id);
      renderDeliveriesTable();
      renderLiveComparisonPanel();
      showToast('Delivery entry removed.', 'info');
    });

    tdActions.appendChild(editBtn);
    tdActions.appendChild(delBtn);

    tr.appendChild(tdDate);
    tr.appendChild(tdVendor);
    tr.appendChild(tdItem);
    tr.appendChild(tdQty);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
}

function renderLiveComparisonPanel() {
  const state = store.getState();
  const cat = ENTITLEMENTS[state.profile.category] || { wheat: 10, rice: 9, sugar: 5 };

  const totals: Record<CommodityType, number> = { Wheat: 0, Rice: 0, Sugar: 0 };
  state.deliveries.forEach(d => {
    totals[d.commodity] = (totals[d.commodity] || 0) + d.qty;
  });

  const commodities: Array<{ id: CommodityType; quota: number }> = [
    { id: 'Wheat', quota: cat.wheat },
    { id: 'Rice', quota: cat.rice },
    { id: 'Sugar', quota: cat.sugar }
  ];

  commodities.forEach(item => {
    const received = totals[item.id] || 0;
    const quota = item.quota;
    const pct = Math.min(Math.round((received / quota) * 100), 100);

    const barFill = document.getElementById(`live-progress-${item.id.toLowerCase()}`);
    const statText = document.getElementById(`live-stat-${item.id.toLowerCase()}`);
    const badge = document.getElementById(`live-badge-${item.id.toLowerCase()}`);

    if (barFill) {
      barFill.style.width = `${pct}%`;
    }
    if (statText) {
      statText.textContent = `${received.toFixed(1)} / ${quota} kg (${pct}%)`;
    }
    if (badge) {
      if (received < quota) {
        badge.className = 'status-chip status-warning';
        badge.textContent = `Shortage (${(quota - received).toFixed(1)} kg)`;
      } else if (received === quota) {
        badge.className = 'status-chip status-success';
        badge.textContent = 'Quota Met';
      } else {
        badge.className = 'status-chip status-info';
        badge.textContent = `Exceeded (+${(received - quota).toFixed(1)} kg)`;
      }
    }
  });
}

function setupEvidenceTabsAndUpload() {
  const tabImg = document.getElementById('tab-ev-img');
  const tabId = document.getElementById('tab-ev-id');
  const boxImg = document.getElementById('box-ev-img');
  const boxId = document.getElementById('box-ev-id');

  const fileInput = document.getElementById('ev-file-input') as HTMLInputElement | null;
  const dropZone = document.getElementById('ev-drop-zone');
  const previewBox = document.getElementById('ev-preview-box');
  const previewImg = document.getElementById('ev-preview-img') as HTMLImageElement | null;
  const previewName = document.getElementById('ev-preview-name');
  const removeFileBtn = document.getElementById('btn-remove-evidence-file');
  const evRationInput = document.getElementById('ev-ration-id-input') as HTMLInputElement | null;
  const remarksTextarea = document.getElementById('comp-remarks') as HTMLTextAreaElement | null;

  // Tabs switching
  tabImg?.addEventListener('click', () => {
    tabImg.setAttribute('aria-selected', 'true');
    tabId?.setAttribute('aria-selected', 'false');
    boxImg?.removeAttribute('hidden');
    boxId?.setAttribute('hidden', 'true');
    store.setEvidence({ mode: 'img' });
  });

  tabId?.addEventListener('click', () => {
    tabId.setAttribute('aria-selected', 'true');
    tabImg?.setAttribute('aria-selected', 'false');
    boxId?.removeAttribute('hidden');
    boxImg?.setAttribute('hidden', 'true');
    store.setEvidence({ mode: 'id' });
  });

  // Handle File Input
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).', 'danger');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast('Image exceeds maximum 3 MB size limit.', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      store.setEvidence({
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl
        }
      });

      if (previewImg) previewImg.src = dataUrl;
      if (previewName) previewName.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
      if (previewBox) previewBox.style.display = 'flex';
      showToast('Evidence image uploaded.', 'success');
    };
    reader.readAsDataURL(file);
  };

  fileInput?.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      processFile(fileInput.files[0]);
    }
  });

  removeFileBtn?.addEventListener('click', () => {
    store.setEvidence({ file: null });
    if (fileInput) fileInput.value = '';
    if (previewBox) previewBox.style.display = 'none';
    if (previewImg) previewImg.src = '';
  });

  // Drag and drop events
  ['dragenter', 'dragover'].forEach(name => {
    dropZone?.addEventListener(name, e => {
      e.preventDefault();
      dropZone.classList.add('drag-active');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropZone?.addEventListener(name, e => {
      e.preventDefault();
      dropZone.classList.remove('drag-active');
    });
  });

  dropZone?.addEventListener('drop', e => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  });

  evRationInput?.addEventListener('input', () => {
    store.setEvidence({ rationId: evRationInput.value.trim() });
  });

  remarksTextarea?.addEventListener('input', () => {
    store.setEvidence({ remarks: remarksTextarea.value.trim() });
  });
}

/**
 * Step 5: Discrepancy Grievance Report
 */
function setupStep5Controls() {
  const printBtn = document.getElementById('btn-print-report');
  const newReportBtn = document.getElementById('btn-new-report');
  const resetDialog = document.getElementById('reset-dialog') as HTMLDialogElement | null;
  const confirmResetBtn = document.getElementById('btn-confirm-reset');
  const cancelResetBtn = document.getElementById('btn-cancel-reset');

  printBtn?.addEventListener('click', () => window.print());

  newReportBtn?.addEventListener('click', () => {
    if (resetDialog) {
      resetDialog.showModal();
    } else {
      if (confirm('Start a new report? This will clear current deliveries.')) {
        store.resetReportState();
      }
    }
  });

  confirmResetBtn?.addEventListener('click', () => {
    resetDialog?.close();
    store.resetReportState();
    showToast('New report initialized. Profile retained.', 'info');
  });

  cancelResetBtn?.addEventListener('click', () => {
    resetDialog?.close();
  });
}

function renderReport() {
  const state = store.getState();
  const categoryConfig = ENTITLEMENTS[state.profile.category] || ENTITLEMENTS.Orange;

  // Metadata block
  const refEl = document.getElementById('rep-meta-ref');
  const dateEl = document.getElementById('rep-meta-date');
  if (refEl) refEl.textContent = state.reportRef;
  if (dateEl) dateEl.textContent = state.reportTimestamp;

  // Beneficiary block
  const repName = document.getElementById('rep-beneficiary-name');
  const repId = document.getElementById('rep-beneficiary-id');
  const repMobile = document.getElementById('rep-beneficiary-mobile');
  const repCat = document.getElementById('rep-beneficiary-category');

  if (repName) repName.textContent = state.profile.name;
  if (repId) repId.textContent = state.profile.rationId;
  if (repMobile) repMobile.textContent = state.profile.mobile;
  if (repCat) repCat.textContent = categoryConfig.defaultLabel;

  // Transaction Logs table
  const txTbody = document.getElementById('rep-tx-tbody');
  if (txTbody) {
    txTbody.replaceChildren();
    if (state.deliveries.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 4;
      td.textContent = 'No delivery records logged.';
      tr.appendChild(td);
      txTbody.appendChild(tr);
    } else {
      state.deliveries.forEach(del => {
        const tr = document.createElement('tr');
        [del.date, del.vendorId, del.commodity, `${del.qty.toFixed(2)} kg`].forEach(text => {
          const td = document.createElement('td');
          td.textContent = text;
          tr.appendChild(td);
        });
        txTbody.appendChild(tr);
      });
    }
  }

  // Calculate totals and discrepancies
  const totals: Record<CommodityType, number> = { Wheat: 0, Rice: 0, Sugar: 0 };
  state.deliveries.forEach(d => {
    totals[d.commodity] = (totals[d.commodity] || 0) + d.qty;
  });

  const compTbody = document.getElementById('rep-comp-tbody');
  if (compTbody) {
    compTbody.replaceChildren();

    const items: Array<{ name: CommodityType; expected: number }> = [
      { name: 'Wheat', expected: categoryConfig.wheat },
      { name: 'Rice', expected: categoryConfig.rice },
      { name: 'Sugar', expected: categoryConfig.sugar }
    ];

    items.forEach(item => {
      const recorded = totals[item.name] || 0;
      const difference = item.expected - recorded;
      const tr = document.createElement('tr');

      const tdItem = document.createElement('td');
      tdItem.textContent = item.name;

      const tdExp = document.createElement('td');
      tdExp.className = 'tabular-nums';
      tdExp.textContent = `${item.expected.toFixed(2)} kg`;

      const tdRec = document.createElement('td');
      tdRec.className = 'tabular-nums';
      tdRec.textContent = `${recorded.toFixed(2)} kg`;

      const tdDiff = document.createElement('td');
      tdDiff.className = 'tabular-nums';
      tdDiff.textContent = `${difference > 0 ? '+' : ''}${difference.toFixed(2)} kg`;

      const tdStatus = document.createElement('td');
      const chip = document.createElement('span');
      chip.className = 'status-chip';

      if (difference > 0) {
        chip.classList.add('status-danger');
        chip.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Shortage indicated`;
      } else if (difference === 0) {
        chip.classList.add('status-success');
        chip.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Matches`;
      } else {
        chip.classList.add('status-info');
        chip.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> Above expected`;
      }

      tdStatus.appendChild(chip);

      tr.appendChild(tdItem);
      tr.appendChild(tdExp);
      tr.appendChild(tdRec);
      tr.appendChild(tdDiff);
      tr.appendChild(tdStatus);

      compTbody.appendChild(tr);
    });
  }

  // Render SVG Comparison Bar Chart
  renderReportChart(totals, categoryConfig);

  // Evidence Block
  const evSection = document.getElementById('rep-evidence-section');
  const evImgWrap = document.getElementById('rep-ev-img-wrap');
  const evImg = document.getElementById('rep-ev-img') as HTMLImageElement | null;
  const evIdWrap = document.getElementById('rep-ev-id-wrap');
  const repEvId = document.getElementById('rep-ev-id-val');
  const evRemarksWrap = document.getElementById('rep-ev-remarks-wrap');
  const repRemarks = document.getElementById('rep-ev-remarks-val');

  let hasEvidence = false;
  if (state.evidence.mode === 'img' && state.evidence.file) {
    if (evImg) evImg.src = state.evidence.file.dataUrl;
    if (evImgWrap) evImgWrap.style.display = 'block';
    hasEvidence = true;
  } else {
    if (evImgWrap) evImgWrap.style.display = 'none';
  }

  if (state.evidence.mode === 'id' && state.evidence.rationId) {
    if (repEvId) repEvId.textContent = state.evidence.rationId;
    if (evIdWrap) evIdWrap.style.display = 'block';
    hasEvidence = true;
  } else {
    if (evIdWrap) evIdWrap.style.display = 'none';
  }

  if (state.evidence.remarks) {
    if (repRemarks) repRemarks.textContent = state.evidence.remarks;
    if (evRemarksWrap) evRemarksWrap.style.display = 'block';
    hasEvidence = true;
  } else {
    if (evRemarksWrap) evRemarksWrap.style.display = 'none';
  }

  if (evSection) {
    evSection.style.display = hasEvidence ? 'block' : 'none';
  }
}

function renderReportChart(totals: Record<CommodityType, number>, categoryConfig: any) {
  const chartWrapper = document.getElementById('report-comparison-chart');
  if (!chartWrapper) return;
  chartWrapper.replaceChildren();

  const maxVal = Math.max(categoryConfig.wheat, categoryConfig.rice, categoryConfig.sugar, totals.Wheat, totals.Rice, totals.Sugar, 15);

  const commodities: Array<{ name: CommodityType; exp: number; rec: number }> = [
    { name: 'Wheat', exp: categoryConfig.wheat, rec: totals.Wheat },
    { name: 'Rice', exp: categoryConfig.rice, rec: totals.Rice },
    { name: 'Sugar', exp: categoryConfig.sugar, rec: totals.Sugar }
  ];

  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-bars-container';

  commodities.forEach(c => {
    const barRow = document.createElement('div');
    barRow.className = 'chart-bar-row';

    const label = document.createElement('div');
    label.className = 'chart-bar-label';
    label.textContent = c.name;

    const barsGroup = document.createElement('div');
    barsGroup.className = 'chart-bars-group';

    // Expected bar
    const expBar = document.createElement('div');
    expBar.className = 'chart-bar chart-bar-exp';
    const expPct = Math.min((c.exp / maxVal) * 100, 100);
    expBar.style.width = `${expPct}%`;
    expBar.textContent = `Entitled: ${c.exp}kg`;

    // Recorded bar
    const recBar = document.createElement('div');
    recBar.className = `chart-bar chart-bar-rec ${c.rec < c.exp ? 'bar-shortage' : 'bar-matches'}`;
    const recPct = Math.min((c.rec / maxVal) * 100, 100);
    recBar.style.width = `${recPct}%`;
    recBar.textContent = `Received: ${c.rec}kg`;

    barsGroup.appendChild(expBar);
    barsGroup.appendChild(recBar);

    barRow.appendChild(label);
    barRow.appendChild(barsGroup);
    chartContainer.appendChild(barRow);
  });

  chartWrapper.appendChild(chartContainer);
}

/**
 * Header & Global Navigation
 */
function setupHeaderNav() {
  const themeToggle = document.getElementById('theme-toggle-btn');
  themeToggle?.addEventListener('click', (e) => {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(cur === 'dark' ? 'light' : 'dark', e as MouseEvent);
  });

  const langSelect = document.getElementById('lang-select') as HTMLSelectElement | null;
  langSelect?.addEventListener('change', () => {
    const lang = langSelect.value as any;
    i18n.setLang(lang);
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('header-nav-menu');
  mobileMenuBtn?.addEventListener('click', () => {
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    navMenu?.classList.toggle('nav-open', !isExpanded);
  });

  // Nav links
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('[data-nav-step]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const step = Number(link.getAttribute('data-nav-step'));
      if (step) {
        store.setStep(step);
        navMenu?.classList.remove('nav-open');
        mobileMenuBtn?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Prototype banner dismiss
  const bannerDismiss = document.getElementById('prototype-dismiss-btn');
  const banner = document.getElementById('prototype-banner');
  bannerDismiss?.addEventListener('click', () => {
    if (banner) banner.style.display = 'none';
  });
}
