// Raheja Resident & Admin App - Master Controller

import {
  DEFAULT_CONFIG,
  GROCERY_CATEGORIES,
  RESTAURANT_CATEGORIES
} from './data.js';

import { state } from './state.js';
import {
  buildGroceryOrderMessage,
  buildRestaurantOrderMessage,
  buildClubHouseEnquiryMessage,
  getWhatsAppUrl,
  formatDateTime
} from './whatsapp.js';

// Application State Variables
let activeTab = 'home';
let adminSubTab = 'orders'; // 'orders' | 'catalog'
let groceryCategory = 'all';
let grocerySearch = '';
let restoCategory = 'all';
let restoVegFilter = 'all';
let restoSearch = '';
let adminCatalogSearch = '';
let selectedMainRole = 'resident';
let selectedAdminSubRole = 'grocery_admin';
let selectedAuthAdminRole = 'grocery_admin';
let currentVerifyingOrderId = null;
let currentModalWhatsAppUrl = '';
let currentModalMessage = '';

// DOM Elements Cache
const elements = {
  // Shell
  deviceWrapper: document.getElementById('device-wrapper'),
  toggleFrameBtn: document.getElementById('toggle-frame-btn'),
  frameModeText: document.getElementById('frame-mode-text'),
  frameModeIcon: document.getElementById('frame-mode-icon'),

  // Header & Roles
  headerSocietyName: document.getElementById('header-society-name'),
  headerRoleIndicator: document.getElementById('header-role-indicator'),
  headerTowerBadge: document.getElementById('header-tower-badge'),
  headerSubtitleSep: document.getElementById('header-subtitle-sep'),
  headerFlatBadge: document.getElementById('header-flat-badge'),
  openProfileChip: document.getElementById('open-profile-chip'),
  adminBannerStrip: document.getElementById('admin-banner-strip'),
  adminBannerText: document.getElementById('admin-banner-text'),
  btnExitAdmin: document.getElementById('btn-exit-admin'),
  btnHeaderLogout: document.getElementById('btn-header-logout'),

  // Navigation Bars
  residentSwitchBar: document.getElementById('resident-switch-bar'),
  adminSwitchBar: document.getElementById('admin-switch-bar'),
  residentBottomNav: document.getElementById('resident-bottom-nav'),
  adminBottomNav: document.getElementById('admin-bottom-nav'),
  subTabs: document.querySelectorAll('#resident-switch-bar .switch-tab-btn'),
  adminSubTabs: document.querySelectorAll('#admin-switch-bar .switch-tab-btn'),
  bottomNavBtns: document.querySelectorAll('#resident-bottom-nav .nav-item-btn'),
  viewPanels: document.querySelectorAll('.view-panel'),
  subTabActiveOrdersDot: document.getElementById('sub-tab-active-orders-dot'),
  ordersNavBadge: document.getElementById('orders-nav-badge'),

  // Home View
  welcomeResidentName: document.getElementById('welcome-resident-name'),
  welcomeLocationText: document.getElementById('welcome-location-text'),
  homeActiveDeliveryAlert: document.getElementById('home-active-delivery-alert'),
  homeCardGrocery: document.getElementById('home-card-grocery'),
  homeCardRestaurant: document.getElementById('home-card-restaurant'),
  homeCardClub: document.getElementById('home-card-club'),

  // Grocery View
  groceryPhoneChip: document.getElementById('grocery-phone-chip'),
  groceryDisplayPhone: document.getElementById('grocery-display-phone'),
  grocerySearchInput: document.getElementById('grocery-search-input'),
  groceryCategoriesContainer: document.getElementById('grocery-categories-container'),
  groceryItemsContainer: document.getElementById('grocery-items-container'),
  groceryCustomNote: document.getElementById('grocery-custom-note'),
  groceryCheckoutBar: document.getElementById('grocery-checkout-bar'),
  groceryCartCount: document.getElementById('grocery-cart-count'),
  groceryCartTotal: document.getElementById('grocery-cart-total'),
  btnGroceryCheckout: document.getElementById('btn-grocery-checkout'),
  groceryNavBadge: document.getElementById('grocery-nav-badge'),

  // Restaurant View
  restaurantPhoneChip: document.getElementById('restaurant-phone-chip'),
  restaurantDisplayPhone: document.getElementById('restaurant-display-phone'),
  restaurantSearchInput: document.getElementById('restaurant-search-input'),
  filterAllFood: document.getElementById('filter-all-food'),
  filterVegOnly: document.getElementById('filter-veg-only'),
  filterNonvegOnly: document.getElementById('filter-nonveg-only'),
  foodCountLabel: document.getElementById('food-count-label'),
  restoCategoriesContainer: document.getElementById('restaurant-categories-container'),
  restoItemsContainer: document.getElementById('restaurant-items-container'),
  restoSpecialNote: document.getElementById('restaurant-special-note'),
  restoCheckoutBar: document.getElementById('restaurant-checkout-bar'),
  restoCartCount: document.getElementById('restaurant-cart-count'),
  restoCartTotal: document.getElementById('restaurant-cart-total'),
  btnRestoCheckout: document.getElementById('btn-restaurant-checkout'),
  restoNavBadge: document.getElementById('resto-nav-badge'),

  // My Orders View (Resident)
  residentActiveOrdersList: document.getElementById('resident-active-orders-list'),
  residentCompletedOrdersList: document.getElementById('resident-completed-orders-list'),

  // Club House View
  clubAmenitiesContainer: document.getElementById('club-amenities-container'),

  // Profile View
  profileAvatarLetter: document.getElementById('profile-avatar-letter'),
  profileDisplayName: document.getElementById('profile-display-name'),
  profileDisplayDetails: document.getElementById('profile-display-details'),
  profileDisplayPhone: document.getElementById('profile-display-phone'),
  profileForm: document.getElementById('profile-form'),
  inputSocietyName: document.getElementById('input-society-name'),
  inputTowerSelect: document.getElementById('input-tower-select'),
  inputFlatNo: document.getElementById('input-flat-no'),
  inputResidentName: document.getElementById('input-resident-name'),
  inputResidentPhone: document.getElementById('input-resident-phone'),
  residentViewGroceryPhone: document.getElementById('resident-view-grocery-phone'),
  residentViewRestoPhone: document.getElementById('resident-view-resto-phone'),
  residentViewClubPhone: document.getElementById('resident-view-club-phone'),
  btnProfileLogout: document.getElementById('btn-profile-logout'),
  btnAuthInstallApp: document.getElementById('btn-auth-install-app'),
  btnProfileInstallApp: document.getElementById('btn-profile-install-app'),

  // Admin View Elements
  adminViewTitle: document.getElementById('admin-view-title'),
  adminViewSub: document.getElementById('admin-view-sub'),
  btnAdminAddItem: document.getElementById('btn-admin-add-item'),
  adminTabOrders: document.getElementById('admin-tab-orders'),
  adminTabCatalog: document.getElementById('admin-tab-catalog'),
  adminTabPhone: document.getElementById('admin-tab-phone'),
  adminPendingOrdersList: document.getElementById('admin-pending-orders-list'),
  adminCompletedOrdersList: document.getElementById('admin-completed-orders-list'),
  adminCatalogCountLabel: document.getElementById('admin-catalog-count-label'),
  adminCatalogSearch: document.getElementById('admin-catalog-search'),
  adminItemsList: document.getElementById('admin-items-list'),
  adminNavOrdersBtn: document.getElementById('admin-nav-orders-btn'),
  adminNavCatalogBtn: document.getElementById('admin-nav-catalog-btn'),
  adminNavPhoneBtn: document.getElementById('admin-nav-phone-btn'),
  adminNavExitBtn: document.getElementById('admin-nav-logout-btn') || document.getElementById('admin-nav-exit-btn'),
  adminNavLogoutBtn: document.getElementById('admin-nav-logout-btn') || document.getElementById('admin-nav-exit-btn'),
  adminSinglePhoneForm: document.getElementById('admin-single-phone-form'),
  adminPhoneCardIcon: document.getElementById('admin-phone-card-icon'),
  adminPhoneCardTitle: document.getElementById('admin-phone-card-title'),
  adminPhoneCardDesc: document.getElementById('admin-phone-card-desc'),
  adminPhoneInputLabel: document.getElementById('admin-phone-input-label'),
  adminStorePhoneInput: document.getElementById('admin-store-phone-input'),

  // Modals
  verifyPinModal: document.getElementById('verify-pin-modal'),
  closePinModalBtn: document.getElementById('close-pin-modal-btn'),
  verifyModalOrderTitle: document.getElementById('verify-modal-order-title'),
  verifyModalFlatText: document.getElementById('verify-modal-flat-text'),
  verifyPinInput: document.getElementById('verify-pin-input'),
  btnSubmitPinVerify: document.getElementById('btn-submit-pin-verify'),

  itemEditorModal: document.getElementById('item-editor-modal'),
  closeItemEditorBtn: document.getElementById('close-item-editor-btn'),
  itemEditorTitle: document.getElementById('item-editor-title'),
  itemEditorForm: document.getElementById('item-editor-form'),
  editorItemId: document.getElementById('editor-item-id'),
  editorItemType: document.getElementById('editor-item-type'),
  editorName: document.getElementById('editor-name'),
  editorPrice: document.getElementById('editor-price'),
  editorCategory: document.getElementById('editor-category'),
  editorGroceryFields: document.getElementById('editor-grocery-fields'),
  editorPack: document.getElementById('editor-pack'),
  editorRestoFields: document.getElementById('editor-resto-fields'),
  editorDesc: document.getElementById('editor-desc'),
  editorIsVeg: document.getElementById('editor-isveg'),
  editorBadge: document.getElementById('editor-badge'),
  editorImgUrl: document.getElementById('editor-img-url'),
  editorImgPreview: document.getElementById('editor-img-preview'),
  editorStockQty: document.getElementById('editor-stock-qty'),
  btnTriggerFileUpload: document.getElementById('btn-trigger-file-upload'),
  editorFileInput: document.getElementById('editor-file-input'),
  uploadFileStatus: document.getElementById('upload-file-status'),

  onboardingModal: document.getElementById('onboarding-modal'),
  onboardingForm: document.getElementById('onboarding-form'),
  onboardingSociety: document.getElementById('onboarding-society'),
  onboardingTower: document.getElementById('onboarding-tower'),
  onboardingFlat: document.getElementById('onboarding-flat'),
  onboardingName: document.getElementById('onboarding-name'),
  onboardingPhone: document.getElementById('onboarding-phone'),

  waPreviewModal: document.getElementById('wa-preview-modal'),
  closeWaModalBtn: document.getElementById('close-wa-modal-btn'),
  waModalAvatar: document.getElementById('wa-modal-avatar'),
  waModalVendorName: document.getElementById('wa-modal-vendor-name'),
  waModalVendorPhone: document.getElementById('wa-modal-vendor-phone'),
  waModalPinCode: document.getElementById('wa-modal-pin-code'),
  waModalMsgBubble: document.getElementById('wa-modal-msg-bubble'),
  waModalLaunchBtn: document.getElementById('wa-modal-launch-btn'),
  waModalCopyBtn: document.getElementById('wa-modal-copy-btn'),

  // Auth Screen Elements
  authScreen: document.getElementById('auth-screen'),
  tabAuthResident: document.getElementById('tab-auth-resident'),
  tabAuthAdmin: document.getElementById('tab-auth-admin'),
  authResidentSection: document.getElementById('auth-resident-section'),
  authAdminSection: document.getElementById('auth-admin-section'),
  resSubSwitcher: document.getElementById('res-sub-switcher'),
  btnShowResLogin: document.getElementById('btn-show-res-login'),
  btnShowResSignup: document.getElementById('btn-show-res-signup'),
  residentLoginForm: document.getElementById('resident-login-form'),
  resLoginPhone: document.getElementById('res-login-phone'),
  resLoginPassword: document.getElementById('res-login-password'),
  linkForgotResPass: document.getElementById('link-forgot-res-pass'),
  residentSignupForm: document.getElementById('resident-signup-form'),
  resSignupSociety: document.getElementById('res-signup-society'),
  resSignupTower: document.getElementById('res-signup-tower'),
  resSignupFlat: document.getElementById('res-signup-flat'),
  resSignupName: document.getElementById('res-signup-name'),
  resSignupPhone: document.getElementById('res-signup-phone'),
  resSignupPassword: document.getElementById('res-signup-password'),
  residentResetForm: document.getElementById('resident-reset-form'),
  resResetPhone: document.getElementById('res-reset-phone'),
  resResetFlat: document.getElementById('res-reset-flat'),
  resResetNewPass: document.getElementById('res-reset-new-pass'),
  btnCancelResReset: document.getElementById('btn-cancel-res-reset'),
  adminLoginForm: document.getElementById('admin-login-form'),
  adminAuthCards: document.querySelectorAll('.admin-auth-card'),
  adminLoginPin: document.getElementById('admin-login-pin'),
  adminAuthDemoHint: document.getElementById('admin-auth-demo-hint'),
  linkForgotAdminPin: document.getElementById('link-forgot-admin-pin'),
  btnAdminAuthSubmit: document.getElementById('btn-admin-auth-submit'),
  adminResetForm: document.getElementById('admin-reset-form'),
  adminResetRoleSelect: document.getElementById('admin-reset-role-select'),
  adminResetRecoveryCode: document.getElementById('admin-reset-recovery-code'),
  adminResetNewPin: document.getElementById('admin-reset-new-pin'),
  btnCancelAdminReset: document.getElementById('btn-cancel-admin-reset'),

  // Toast
  appToast: document.getElementById('app-toast'),
  toastIcon: document.getElementById('toast-icon'),
  toastMessage: document.getElementById('toast-message')
};

// ----------------------------------------------------
// Toast & Order Notification Helpers
// ----------------------------------------------------
let toastTimeout = null;
function showToast(message, icon = '✅', duration = 3200, onClick = null) {
  if (toastTimeout) clearTimeout(toastTimeout);
  elements.toastIcon.textContent = icon;
  elements.toastMessage.textContent = message;
  elements.appToast.classList.add('show');
  elements.appToast.style.cursor = onClick ? 'pointer' : 'default';
  elements.appToast.onclick = onClick ? () => {
    onClick();
    elements.appToast.classList.remove('show');
    elements.appToast.onclick = null;
  } : null;
  toastTimeout = setTimeout(() => {
    elements.appToast.classList.remove('show');
    elements.appToast.onclick = null;
  }, duration);
}

// Native Web Audio Synthesizer for notifications
function playNotificationSound(type = 'default') {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    if (type === 'new_order') {
      // Upbeat 2-tone chime (F5 -> A5)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(698.46, now);
      osc.frequency.setValueAtTime(880.00, now + 0.12);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } else if (type === 'order_completed') {
      // 3-tone celebration fanfare (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.1;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.26, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.24);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.24);
      });
    }
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

function showSystemNotification(title, body) {
  try {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/uploads/favicon.png'
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  } catch (e) {}
}

function requestNotificationPermission() {
  try {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  } catch (e) {}
}

// ----------------------------------------------------
// Universal Logout Helper
// ----------------------------------------------------
function handleLogout() {
  state.logout();
  if (elements.authScreen) {
    elements.authScreen.classList.remove('hidden');
  }
  if (elements.resLoginPassword) elements.resLoginPassword.value = '';
  if (elements.adminLoginPin) elements.adminLoginPin.value = '';
  if (elements.itemEditorModal) elements.itemEditorModal.classList.remove('show');
  if (elements.verifyPinModal) elements.verifyPinModal.classList.remove('show');
  if (elements.waPreviewModal) elements.waPreviewModal.classList.remove('show');
  showToast('Logged out successfully', '🚪');
}

// ----------------------------------------------------
// Role & Tab Switching
// ----------------------------------------------------
function applyRoleUI(role) {
  const isResident = role === 'resident';

  // Toggle Bars
  elements.residentSwitchBar.style.display = isResident ? 'flex' : 'none';
  elements.adminSwitchBar.style.display = isResident ? 'none' : 'flex';
  elements.residentBottomNav.style.display = isResident ? 'flex' : 'none';
  elements.adminBottomNav.style.display = isResident ? 'none' : 'flex';
  elements.adminBannerStrip.style.display = isResident ? 'none' : 'flex';

  // Flat & Tower visibility: only show for residents, hide when in Admin Mode
  if (elements.openProfileChip) {
    elements.openProfileChip.style.display = isResident ? 'flex' : 'none';
  }
  if (elements.headerTowerBadge) {
    elements.headerTowerBadge.style.display = isResident ? 'inline' : 'none';
  }
  if (elements.headerSubtitleSep) {
    elements.headerSubtitleSep.style.display = isResident ? 'inline' : 'none';
  }

  // Role Indicator in Header
  if (elements.headerRoleIndicator) {
    if (role === 'resident') {
      elements.headerRoleIndicator.textContent = 'Resident Mode';
    } else if (role === 'grocery_admin') {
      elements.headerRoleIndicator.textContent = 'Grocery Store Portal';
      if (elements.adminBannerText) elements.adminBannerText.textContent = '🛒 Grocery Admin Panel Active';
    } else if (role === 'restaurant_admin') {
      elements.headerRoleIndicator.textContent = 'Restaurant Portal';
      if (elements.adminBannerText) elements.adminBannerText.textContent = '🍽️ Restaurant Admin Panel Active';
    } else if (role === 'club_admin') {
      elements.headerRoleIndicator.textContent = 'Club House Portal';
      if (elements.adminBannerText) elements.adminBannerText.textContent = '🏛️ Club House Admin Panel Active';
    }
  }

  // Update Admin Phone Tab Card details for respective admin
  if (elements.adminPhoneCardTitle) {
    if (role === 'grocery_admin') {
      elements.adminPhoneCardIcon.textContent = '🛒';
      elements.adminPhoneCardTitle.textContent = 'Grocery Store WhatsApp Number';
      elements.adminPhoneCardDesc.textContent = 'Incoming resident grocery orders will be dispatched directly to this WhatsApp mobile number. Only Grocery Store Admin can update this.';
      elements.adminPhoneInputLabel.textContent = 'Grocery Store WhatsApp Number:';
    } else if (role === 'restaurant_admin') {
      elements.adminPhoneCardIcon.textContent = '🍽️';
      elements.adminPhoneCardTitle.textContent = 'Restaurant Kitchen WhatsApp Number';
      elements.adminPhoneCardDesc.textContent = 'Incoming resident food orders will be dispatched directly to this WhatsApp mobile number. Only Restaurant Admin can update this.';
      elements.adminPhoneInputLabel.textContent = 'Restaurant Kitchen WhatsApp Number:';
    } else if (role === 'club_admin') {
      elements.adminPhoneCardIcon.textContent = '🏛️';
      elements.adminPhoneCardTitle.textContent = 'Club House Desk WhatsApp Number';
      elements.adminPhoneCardDesc.textContent = 'Resident amenity enquiries and booking requests will be sent to this WhatsApp mobile number. Only Club Admin can update this.';
      elements.adminPhoneInputLabel.textContent = 'Club House Desk WhatsApp Number:';
    }
  }
  syncStorePhonesUI();

  if (isResident) {
    switchTab('home');
  } else {
    // Open Admin Dashboard View
    switchAdminTab('orders');
  }
}

function switchTab(tabName) {
  activeTab = tabName;

  elements.subTabs.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  elements.bottomNavBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  elements.viewPanels.forEach(panel => {
    panel.classList.toggle('active', panel.id === `view-${tabName}`);
  });

  const content = document.querySelector('.app-content');
  if (content) content.scrollTop = 0;

  updateGroceryCartSummary();
  updateRestoCartSummary();

  if (tabName === 'my-orders') {
    renderResidentOrders();
  }
  if (tabName === 'profile') {
    syncResidentUI();
  }
}

function switchAdminTab(adminTabName) {
  adminSubTab = adminTabName;

  elements.viewPanels.forEach(panel => {
    panel.classList.toggle('active', panel.id === 'view-admin-dashboard');
  });

  elements.adminSubTabs.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.adminTab === adminTabName);
  });

  if (elements.adminNavOrdersBtn) {
    elements.adminNavOrdersBtn.classList.toggle('active', adminTabName === 'orders');
  }
  if (elements.adminNavCatalogBtn) {
    elements.adminNavCatalogBtn.classList.toggle('active', adminTabName === 'catalog');
  }
  if (elements.adminNavPhoneBtn) {
    elements.adminNavPhoneBtn.classList.toggle('active', adminTabName === 'phone');
  }

  if (elements.adminTabOrders) {
    elements.adminTabOrders.classList.toggle('active', adminTabName === 'orders');
  }
  if (elements.adminTabCatalog) {
    elements.adminTabCatalog.classList.toggle('active', adminTabName === 'catalog');
  }
  if (elements.adminTabPhone) {
    elements.adminTabPhone.classList.toggle('active', adminTabName === 'phone');
  }

  const content = document.querySelector('.app-content');
  if (content) content.scrollTop = 0;

  renderAdminView();

  if (adminTabName === 'phone' && elements.adminStorePhoneInput) {
    setTimeout(() => elements.adminStorePhoneInput.focus(), 150);
  }
}

// ----------------------------------------------------
// Resident Profile Sync
// ----------------------------------------------------
function syncResidentUI() {
  const profile = state.getResidentProfile();
  if (!profile) return;

  const society = profile.societyName || DEFAULT_CONFIG.societyName;
  const tower = profile.tower || 'Tower B';
  const rawFlat = (profile.flatNo || '').trim();
  const flat = rawFlat ? (/^(flat|villa|unit)/i.test(rawFlat) ? rawFlat : `Flat/Villa ${rawFlat}`) : 'Select Flat/Villa';
  const name = profile.name || 'Resident';
  const phone = profile.phone ? `+91 ${profile.phone}` : '';

  elements.headerSocietyName.textContent = society;
  elements.headerTowerBadge.textContent = tower;
  elements.headerFlatBadge.textContent = flat;
  elements.welcomeResidentName.textContent = `Hello, ${name}!`;
  elements.welcomeLocationText.textContent = `${flat}, ${tower} • ${society}`;

  elements.profileAvatarLetter.textContent = name.charAt(0).toUpperCase() || 'R';
  elements.profileDisplayName.textContent = name;
  elements.profileDisplayDetails.textContent = `${flat}, ${tower} • ${society}`;
  elements.profileDisplayPhone.textContent = phone;

  elements.inputSocietyName.value = society;
  elements.inputTowerSelect.value = tower;
  elements.inputFlatNo.value = profile.flatNo || '';
  elements.inputResidentName.value = name;
  elements.inputResidentPhone.value = profile.phone || '';
}

function syncStorePhonesUI() {
  const phones = state.storePhones;
  if (elements.groceryDisplayPhone) elements.groceryDisplayPhone.textContent = `+${phones.grocery}`;
  if (elements.restaurantDisplayPhone) elements.restaurantDisplayPhone.textContent = `+${phones.restaurant}`;

  // Read-only contact display in Resident Profile
  if (elements.residentViewGroceryPhone) elements.residentViewGroceryPhone.textContent = `+${phones.grocery}`;
  if (elements.residentViewRestoPhone) elements.residentViewRestoPhone.textContent = `+${phones.restaurant}`;
  if (elements.residentViewClubPhone) elements.residentViewClubPhone.textContent = `+${phones.clubHouse}`;

  // Respective Store Phone Input in Admin Dashboard
  const role = state.getActiveRole();
  if (elements.adminStorePhoneInput) {
    if (role === 'grocery_admin') {
      elements.adminStorePhoneInput.value = phones.grocery || '';
    } else if (role === 'restaurant_admin') {
      elements.adminStorePhoneInput.value = phones.restaurant || '';
    } else if (role === 'club_admin') {
      elements.adminStorePhoneInput.value = phones.clubHouse || '';
    }
  }
}

// ----------------------------------------------------
// Grocery Sub-Page Rendering
// ----------------------------------------------------
function renderGroceryCategories() {
  elements.groceryCategoriesContainer.innerHTML = GROCERY_CATEGORIES.map(cat => `
    <button class="category-chip ${groceryCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
      <span>${getCategoryEmoji(cat.id)}</span>
      <span>${cat.label}</span>
    </button>
  `).join('');

  elements.groceryCategoriesContainer.querySelectorAll('.category-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      groceryCategory = btn.dataset.cat;
      renderGroceryCategories();
      renderGroceryItems();
    });
  });
}

function getCategoryEmoji(catId) {
  switch (catId) {
    case 'all': return '✨';
    case 'dairy': return '🥛';
    case 'veggies': return '🥕';
    case 'staples': return '🌾';
    case 'snacks': return '🍪';
    case 'household': return '🧼';
    default: return '📦';
  }
}

function renderGroceryItems() {
  let items = state.groceryItems;

  if (groceryCategory !== 'all') {
    items = items.filter(item => item.category === groceryCategory);
  }

  if (grocerySearch.trim()) {
    const q = grocerySearch.toLowerCase().trim();
    items = items.filter(item =>
      item.name.toLowerCase().includes(q) || (item.pack && item.pack.toLowerCase().includes(q))
    );
  }

  if (items.length === 0) {
    elements.groceryItemsContainer.innerHTML = `
      <div class="empty-catalog-state">
        <div class="empty-catalog-icon">🔍</div>
        <p>No grocery items matched "<strong>${grocerySearch}</strong>"</p>
        <p style="font-size: 12px; margin-top: 6px;">You can type and add it below in the custom item box!</p>
      </div>
    `;
    return;
  }

  elements.groceryItemsContainer.innerHTML = items.map(item => {
    const qty = state.getGroceryQty(item.id);
    return `
      <div class="item-card" data-id="${item.id}">
        <div class="item-thumbnail-wrap">
          <img src="${item.img}" alt="${item.name}" class="item-thumbnail" loading="lazy" />
        </div>
        <div class="item-info">
          <div class="item-name-row">
            <h4 class="item-title">${item.name}</h4>
            ${item.popular ? '<span class="item-badge-pill">Popular</span>' : ''}
          </div>
          <div class="item-pack-size">${item.pack || 'Standard pack'}</div>
          <div class="item-pricing-row">
            <div class="item-price">₹${item.price}</div>
            <div class="qty-action-box">
              ${qty === 0 ? `
                <button class="add-btn" onclick="window.app.changeGroceryQty('${item.id}', 1)">+ ADD</button>
              ` : `
                <div class="stepper-control">
                  <button class="stepper-btn" onclick="window.app.changeGroceryQty('${item.id}', ${qty - 1})">−</button>
                  <span class="stepper-qty">${qty}</span>
                  <button class="stepper-btn" onclick="window.app.changeGroceryQty('${item.id}', ${qty + 1})">+</button>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateGroceryCartSummary() {
  const cart = state.groceryCart;
  let totalCount = 0;
  let totalPrice = 0;

  Object.entries(cart).forEach(([itemId, qty]) => {
    const item = state.groceryItems.find(i => i.id === itemId);
    if (item && qty > 0) {
      totalCount += qty;
      totalPrice += item.price * qty;
    }
  });

  if (totalCount > 0) {
    elements.groceryNavBadge.textContent = totalCount;
    elements.groceryNavBadge.style.display = 'flex';
  } else {
    elements.groceryNavBadge.style.display = 'none';
  }

  elements.groceryCartCount.textContent = `${totalCount} ${totalCount === 1 ? 'ITEM' : 'ITEMS'}`;
  elements.groceryCartTotal.textContent = `₹${totalPrice}`;

  if (activeTab === 'grocery' && totalCount > 0) {
    elements.groceryCheckoutBar.style.display = 'flex';
  } else {
    elements.groceryCheckoutBar.style.display = 'none';
  }
}

// ----------------------------------------------------
// Restaurant Sub-Page Rendering
// ----------------------------------------------------
function renderRestoCategories() {
  elements.restoCategoriesContainer.innerHTML = RESTAURANT_CATEGORIES.map(cat => `
    <button class="category-chip ${restoCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
      <span>${getRestoCategoryEmoji(cat.id)}</span>
      <span>${cat.label}</span>
    </button>
  `).join('');

  elements.restoCategoriesContainer.querySelectorAll('.category-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      restoCategory = btn.dataset.cat;
      renderRestoCategories();
      renderRestoItems();
    });
  });
}

function getRestoCategoryEmoji(catId) {
  switch (catId) {
    case 'all': return '🍽️';
    case 'breakfast': return '☕';
    case 'mains': return '🍲';
    case 'chinese': return '🥢';
    case 'breads': return '🫓';
    case 'beverages': return '🥤';
    default: return '🍛';
  }
}

function renderRestoItems() {
  let items = state.restaurantItems;

  if (restoCategory !== 'all') {
    items = items.filter(item => item.category === restoCategory);
  }

  if (restoVegFilter === 'veg') {
    items = items.filter(item => item.isVeg === true);
  } else if (restoVegFilter === 'nonveg') {
    items = items.filter(item => item.isVeg === false);
  }

  if (restoSearch.trim()) {
    const q = restoSearch.toLowerCase().trim();
    items = items.filter(item =>
      item.name.toLowerCase().includes(q) || (item.desc && item.desc.toLowerCase().includes(q))
    );
  }

  elements.foodCountLabel.textContent = `${items.length} dishes`;

  if (items.length === 0) {
    elements.restoItemsContainer.innerHTML = `
      <div class="empty-catalog-state">
        <div class="empty-catalog-icon">🍽️</div>
        <p>No dishes matched your filters.</p>
        <p style="font-size: 12px; margin-top: 6px;">Try clearing search or switching to 'All' dishes.</p>
      </div>
    `;
    return;
  }

  elements.restoItemsContainer.innerHTML = items.map(item => {
    const qty = state.getRestaurantQty(item.id);
    return `
      <div class="item-card resto-card" data-id="${item.id}">
        <div class="item-thumbnail-wrap">
          <img src="${item.img}" alt="${item.name}" class="item-thumbnail" loading="lazy" />
        </div>
        <div class="item-info">
          <div class="item-name-row">
            ${item.isVeg ? '<span class="veg-symbol" title="Vegetarian"></span>' : '<span class="nonveg-symbol" title="Non-Vegetarian"></span>'}
            <h4 class="item-title">${item.name}</h4>
            ${item.badge ? `<span class="item-badge-pill">${item.badge}</span>` : ''}
          </div>
          <p class="item-desc-text">${item.desc || ''}</p>
          <div class="item-pricing-row">
            <div class="item-price">₹${item.price}</div>
            <div class="qty-action-box">
              ${qty === 0 ? `
                <button class="add-btn" onclick="window.app.changeRestoQty('${item.id}', 1)">+ ADD</button>
              ` : `
                <div class="stepper-control">
                  <button class="stepper-btn" onclick="window.app.changeRestoQty('${item.id}', ${qty - 1})">−</button>
                  <span class="stepper-qty">${qty}</span>
                  <button class="stepper-btn" onclick="window.app.changeRestoQty('${item.id}', ${qty + 1})">+</button>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateRestoCartSummary() {
  const cart = state.restaurantCart;
  let totalCount = 0;
  let totalPrice = 0;

  Object.entries(cart).forEach(([itemId, qty]) => {
    const item = state.restaurantItems.find(i => i.id === itemId);
    if (item && qty > 0) {
      totalCount += qty;
      totalPrice += item.price * qty;
    }
  });

  if (totalCount > 0) {
    elements.restoNavBadge.textContent = totalCount;
    elements.restoNavBadge.style.display = 'flex';
  } else {
    elements.restoNavBadge.style.display = 'none';
  }

  elements.restoCartCount.textContent = `${totalCount} ${totalCount === 1 ? 'ITEM' : 'ITEMS'}`;
  elements.restoCartTotal.textContent = `₹${totalPrice}`;

  if (activeTab === 'restaurant' && totalCount > 0) {
    elements.restoCheckoutBar.style.display = 'flex';
  } else {
    elements.restoCheckoutBar.style.display = 'none';
  }
}

// ----------------------------------------------------
// Resident "My Orders" Tab Rendering with 4-Digit PIN
// ----------------------------------------------------
function renderResidentOrders() {
  const profile = state.getResidentProfile();
  const currentFlat = profile ? profile.flatNo : '';
  const currentTower = profile ? profile.tower : '';

  // Filter orders for current flat
  const allOrders = state.orders;
  const residentOrders = allOrders.filter(o => 
    o.resident && o.resident.flatNo === currentFlat && o.resident.tower === currentTower
  );

  const pendingOrders = residentOrders.filter(o => o.status === 'pending');
  const completedOrders = residentOrders.filter(o => o.status === 'completed');

  // Update nav badges
  if (pendingOrders.length > 0) {
    elements.ordersNavBadge.textContent = pendingOrders.length;
    elements.ordersNavBadge.style.display = 'flex';
    elements.subTabActiveOrdersDot.style.display = 'block';

    // Show banner on Home screen
    elements.homeActiveDeliveryAlert.style.display = 'block';
    const topOrder = pendingOrders[0];
    elements.homeActiveDeliveryAlert.innerHTML = `
      <div class="delivery-pin-highlight-card" style="cursor: pointer;" onclick="window.app.openMyOrdersTab()">
        <div class="pin-highlight-label">🔔 ACTIVE DELIVERY IN PROGRESS</div>
        <div class="pin-highlight-code">${topOrder.deliveryPin}</div>
        <div class="pin-highlight-tip">Share this 4-digit code with delivery boy at ${/^(flat|villa)/i.test(topOrder.resident.flatNo) ? topOrder.resident.flatNo : `Flat/Villa ${topOrder.resident.flatNo}`}, ${topOrder.resident.tower}. Click to view details →</div>
      </div>
    `;
  } else {
    elements.ordersNavBadge.style.display = 'none';
    elements.subTabActiveOrdersDot.style.display = 'none';
    elements.homeActiveDeliveryAlert.style.display = 'none';
  }

  // Render Active Orders
  if (pendingOrders.length === 0) {
    elements.residentActiveOrdersList.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px; background: var(--surface-card); border-radius: var(--radius-md); border: 1px solid var(--surface-border);">
        <p>No active deliveries right now.</p>
        <p style="font-size: 11px; margin-top: 4px;">Orders placed via WhatsApp will appear here with your Delivery PIN.</p>
      </div>
    `;
  } else {
    elements.residentActiveOrdersList.innerHTML = pendingOrders.map(order => `
      <div class="order-ticket-card pending">
        <div class="ticket-header">
          <span class="ticket-id">Order #${order.id} • S.No: #${order.dailySerialNo || 1} • ${order.type === 'grocery' ? '🛒 Grocery' : '🍽️ Restaurant'}</span>
          <span class="status-badge pending">🟡 Out for Delivery</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">
          🕒 Placed: <strong>${formatDateTime(new Date(order.createdAt))}</strong> (Today's S.No: #${order.dailySerialNo || 1})
        </div>
        <div class="resident-pin-box">
          <div>
            <div style="font-size: 10px; font-weight: 800; color: #166534; text-transform: uppercase;">
              🔐 YOUR SECRET DELIVERY PIN:
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">
              Share with delivery boy only at doorstep (Kept private)
            </div>
          </div>
          <div class="resident-pin-code-large">${order.deliveryPin}</div>
        </div>
        <div class="ticket-items-list">
          ${order.items.map(i => `• ${i.name} (x${i.quantity})`).join('<br>')}
          ${order.customNote ? `<div style="margin-top: 4px; font-style: italic;">Note: "${order.customNote}"</div>` : ''}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--surface-border); padding-top: 8px; margin-top: 6px;">
          <span style="font-size: 11px; color: var(--text-muted);">S.No: #${order.dailySerialNo || 1} • ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span style="font-size: 14px; font-weight: 800; color: var(--text-main);">₹${order.totalAmount}</span>
        </div>
      </div>
    `).join('');
  }

  // Render Completed Orders
  if (completedOrders.length === 0) {
    elements.residentCompletedOrdersList.innerHTML = `
      <div style="text-align: center; padding: 14px; color: var(--text-muted); font-size: 12px;">
        No completed orders yet.
      </div>
    `;
  } else {
    elements.residentCompletedOrdersList.innerHTML = completedOrders.slice(0, 8).map(order => `
      <div class="order-ticket-card completed">
        <div class="ticket-header">
          <span class="ticket-id">Order #${order.id} • S.No: #${order.dailySerialNo || 1} • ${order.type === 'grocery' ? '🛒 Grocery' : '🍽️ Restaurant'}</span>
          <span class="status-badge completed">🟢 Delivered</span>
        </div>
        <div class="ticket-items-list" style="font-size: 11px;">
          ${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--surface-border); padding-top: 6px; margin-top: 4px;">
          <span style="font-size: 10px; color: var(--text-muted);">Placed: ${formatDateTime(new Date(order.createdAt))} | Delivered: ${order.completedAt ? formatDateTime(new Date(order.completedAt)) : 'Verified'}</span>
          <span style="font-size: 13px; font-weight: 800; color: var(--text-main);">₹${order.totalAmount}</span>
        </div>
      </div>
    `).join('');
  }
}

// ----------------------------------------------------
// Admin Dashboard Rendering (Grocery / Restaurant / Club)
// ----------------------------------------------------
function updateAdminOrderBadges() {
  const role = state.getActiveRole();
  if (role === 'resident' || !role) return;

  const targetType = role === 'grocery_admin' ? 'grocery' :
                     role === 'restaurant_admin' ? 'restaurant' : null;

  let orders = state.orders || [];
  if (targetType) {
    orders = orders.filter(o => o.type === targetType);
  }

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const subTabBadge = document.getElementById('admin-sub-tab-orders-badge');
  if (subTabBadge) {
    if (pendingCount > 0) {
      subTabBadge.textContent = pendingCount;
      subTabBadge.style.display = 'inline-flex';
    } else {
      subTabBadge.style.display = 'none';
    }
  }

  const bottomNavBadge = document.getElementById('admin-nav-orders-badge');
  if (bottomNavBadge) {
    if (pendingCount > 0) {
      bottomNavBadge.textContent = pendingCount;
      bottomNavBadge.style.display = 'flex';
    } else {
      bottomNavBadge.style.display = 'none';
    }
  }
}

function renderAdminView() {
  const role = state.getActiveRole();
  const isGrocery = role === 'grocery_admin';
  const isResto = role === 'restaurant_admin';
  const isClub = role === 'club_admin';

  const deptName = isGrocery ? 'Grocery Store' : isResto ? 'Restaurant Kitchen' : 'Club House';

  if (adminSubTab === 'orders') {
    elements.adminViewTitle.textContent = `📦 ${deptName} Orders & Deliveries`;
    elements.adminViewSub.textContent = 'Verify 4-digit delivery PINs at resident doorstep and track live orders.';
    elements.btnAdminAddItem.style.display = 'none';
  } else if (adminSubTab === 'catalog') {
    elements.adminViewTitle.textContent = isClub ? '🏛️ Club Amenities Management' : `⚙️ Manage ${deptName} Items & Photos`;
    elements.adminViewSub.textContent = isClub ? 'Update amenity schedules and booking descriptions.' : 'Add new items, update prices, stock quantities, and upload photos from device.';
    elements.btnAdminAddItem.style.display = isClub ? 'none' : 'flex';
    elements.btnAdminAddItem.innerHTML = `<span>➕ Add New ${isGrocery ? 'Grocery Item' : 'Dish'}</span>`;
  } else if (adminSubTab === 'phone') {
    elements.adminViewTitle.textContent = `📱 ${deptName} WhatsApp Settings`;
    elements.adminViewSub.textContent = 'Orders from residents are dispatched directly to this WhatsApp number.';
    elements.btnAdminAddItem.style.display = 'none';
  }

  renderAdminOrders();
  renderAdminCatalog();
  syncStorePhonesUI();
  updateAdminOrderBadges();
}

function renderAdminOrders() {
  const role = state.getActiveRole();
  const targetType = role === 'grocery_admin' ? 'grocery' :
                     role === 'restaurant_admin' ? 'restaurant' : null;

  let orders = state.orders;
  if (targetType) {
    orders = orders.filter(o => o.type === targetType);
  }

  const pending = orders.filter(o => o.status === 'pending');
  const completed = orders.filter(o => o.status === 'completed');

  // Pending Orders
  if (pending.length === 0) {
    elements.adminPendingOrdersList.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px; background: var(--surface-card); border-radius: var(--radius-md); border: 1px solid var(--surface-border);">
        <p>✅ All orders delivered! No pending deliveries.</p>
      </div>
    `;
  } else {
    elements.adminPendingOrdersList.innerHTML = pending.map(order => `
      <div class="admin-order-card">
        <div class="admin-order-header">
          <span class="admin-order-location">📍 ${/^(flat|villa)/i.test(order.resident?.flatNo) ? order.resident?.flatNo : `Flat/Villa ${order.resident?.flatNo || 'N/A'}`}, ${order.resident?.tower || 'N/A'}</span>
          <span style="font-size: 11px; font-weight: 700; color: #b45309;">Order #${order.id} • Today's S.No: #${order.dailySerialNo || 1}</span>
        </div>
        <div style="font-size: 12px; font-weight: 600; color: var(--text-main); margin-top: 4px;">
          Resident: ${order.resident?.name || 'Resident'} (${order.resident?.phone || ''})
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
          🕒 Order Placed: <strong>${formatDateTime(new Date(order.createdAt))}</strong> (S.No: #${order.dailySerialNo || 1})
        </div>
        <div class="admin-order-items-summary">
          ${order.items.map(i => `<strong>${i.name}</strong> × ${i.quantity} (₹${i.price * i.quantity})`).join('<br>')}
          ${order.customNote ? `<div style="margin-top: 4px; color: #4338ca; font-style: italic;">Request: "${order.customNote}"</div>` : ''}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 6px 0;">
          <span style="font-size: 11px; color: var(--text-muted);">S.No: #${order.dailySerialNo || 1} • ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span style="font-size: 15px; font-weight: 800; color: var(--text-main);">Bill: ₹${order.totalAmount}</span>
        </div>
        <button class="btn-verify-pin-action" onclick="window.app.openPinVerificationModal('${order.id}', '${order.resident?.flatNo || ''}', '${order.resident?.tower || ''}', '${order.totalAmount}')">
          <span>🔑 Enter Resident's 4-Digit Code & Complete</span>
        </button>
      </div>
    `).join('');
  }

  // Completed Orders
  if (completed.length === 0) {
    elements.adminCompletedOrdersList.innerHTML = `
      <div style="text-align: center; padding: 14px; color: var(--text-muted); font-size: 12px;">
        No completed deliveries recorded yet.
      </div>
    `;
  } else {
    elements.adminCompletedOrdersList.innerHTML = completed.slice(0, 10).map(order => `
      <div class="admin-order-card" style="opacity: 0.85;">
        <div class="admin-order-header">
          <span style="font-size: 12px; font-weight: 700; color: #166534;">✅ ${/^(flat|villa)/i.test(order.resident?.flatNo) ? order.resident?.flatNo : `Flat/Villa ${order.resident?.flatNo || ''}`}, ${order.resident?.tower || ''}</span>
          <span style="font-size: 11px; color: var(--text-muted);">Order #${order.id} • S.No #${order.dailySerialNo || 1} • Verified</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
          ${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 11px;">
          <span>🕒 Placed: ${formatDateTime(new Date(order.createdAt))} | Delivered: ${order.completedAt ? formatDateTime(new Date(order.completedAt)) : 'Delivered'}</span>
          <strong style="color: var(--text-main);">₹${order.totalAmount}</strong>
        </div>
      </div>
    `).join('');
  }
}

function renderAdminCatalog() {
  const role = state.getActiveRole();
  let items = [];
  let isGrocery = role === 'grocery_admin';

  if (isGrocery) {
    items = state.groceryItems;
  } else if (role === 'restaurant_admin') {
    items = state.restaurantItems;
  } else {
    // Club Admin
    renderAdminAmenities();
    return;
  }

  if (adminCatalogSearch.trim()) {
    const q = adminCatalogSearch.toLowerCase().trim();
    items = items.filter(i => i.name.toLowerCase().includes(q));
  }

  elements.adminCatalogCountLabel.textContent = `${items.length} ${isGrocery ? 'Grocery Products' : 'Food Dishes'}`;

  elements.adminItemsList.innerHTML = items.map(item => `
    <div class="admin-item-manage-card">
      <img src="${item.img}" alt="${item.name}" class="admin-item-thumb" />
      <div class="admin-item-info">
        <div style="display: flex; align-items: center; gap: 4px;">
          ${item.isVeg !== undefined ? (item.isVeg ? '<span class="veg-symbol"></span>' : '<span class="nonveg-symbol"></span>') : ''}
          <div style="font-size: 13px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
        </div>
        <div style="font-size: 11px; color: var(--text-muted);">${item.pack || item.desc || ''}</div>
        <div style="font-size: 13px; font-weight: 800; color: var(--text-main); margin-top: 2px;">
          ₹${item.price}
          <span style="font-size: 10px; font-weight: 700; color: ${item.availableQty > 0 ? '#059669' : '#dc2626'}; margin-left: 6px; background: ${item.availableQty > 0 ? '#ecfdf5' : '#fef2f2'}; padding: 1px 6px; border-radius: 4px;">
            Stock: ${item.availableQty !== undefined ? item.availableQty : 20}
          </span>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="btn-item-edit" onclick="window.app.openEditItemModal('${item.id}', '${isGrocery ? 'grocery' : 'restaurant'}')">✏️ Edit</button>
        <button class="btn-item-delete" onclick="window.app.deleteItem('${item.id}', '${isGrocery ? 'grocery' : 'restaurant'}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function renderAdminAmenities() {
  elements.adminCatalogCountLabel.textContent = `${state.clubAmenities.length} Club Amenities`;
  elements.adminItemsList.innerHTML = state.clubAmenities.map(a => `
    <div class="admin-item-manage-card">
      <img src="${a.img}" alt="${a.name}" class="admin-item-thumb" />
      <div class="admin-item-info">
        <div style="font-size: 13px; font-weight: 700; color: var(--text-main);">${a.name}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${a.timing}</div>
      </div>
      <div class="admin-item-actions">
        <button class="btn-item-edit" onclick="window.app.openEditAmenityModal('${a.id}')">✏️ Edit</button>
      </div>
    </div>
  `).join('');
}

// ----------------------------------------------------
// Club House Sub-Page Rendering (Resident)
// ----------------------------------------------------
function renderClubHouseAmenities() {
  elements.clubAmenitiesContainer.innerHTML = state.clubAmenities.map(amenity => `
    <div class="amenity-card">
      <div class="amenity-img-wrapper">
        <img src="${amenity.img}" alt="${amenity.name}" class="amenity-img" loading="lazy" />
        <span class="amenity-badge">${amenity.badge || 'Open'}</span>
      </div>
      <div class="amenity-body">
        <div class="amenity-title-row">
          <h3 class="amenity-name">${amenity.name}</h3>
        </div>
        <div class="amenity-timing">
          <span>🕒</span>
          <span>${amenity.timing}</span>
        </div>
        <p class="amenity-desc">${amenity.desc}</p>
        <div class="amenity-features-list">
          ${(amenity.features || []).map(f => `<span class="amenity-feature-pill">${f}</span>`).join('')}
        </div>
        <button class="amenity-enquire-btn" onclick="window.app.enquireClubAmenity('${amenity.name}')">
          <span>💬 Enquire / Book Slot on WhatsApp</span>
        </button>
      </div>
    </div>
  `).join('');
}

// ----------------------------------------------------
// WhatsApp Order Execution & Dispatch (With 4-Digit PIN)
// ----------------------------------------------------
async function executeGroceryOrder() {
  const resident = state.getResidentProfile();
  if (!resident || !resident.flatNo) {
    elements.onboardingModal.classList.add('show');
    showToast('Please confirm your Flat & Tower first', '📍');
    return;
  }

  const cart = state.groceryCart;
  const itemsToOrder = [];
  let totalAmount = 0;

  Object.entries(cart).forEach(([id, qty]) => {
    const item = state.groceryItems.find(i => i.id === id);
    if (item && qty > 0) {
      itemsToOrder.push({ ...item, quantity: qty });
      totalAmount += item.price * qty;
    }
  });

  const customNote = elements.groceryCustomNote.value || state.groceryNote;

  if (itemsToOrder.length === 0 && (!customNote || !customNote.trim())) {
    showToast('Please select grocery items or add a note', '⚠️');
    return;
  }

  // Create Order in Server Backend (generates deliveryPin and dailySerialNo)
  const savedOrder = await state.placeOrder({
    type: 'grocery',
    items: itemsToOrder,
    customNote: customNote,
    totalAmount: totalAmount,
    resident: resident
  });

  const deliveryPin = savedOrder.deliveryPin;

  // Build message with dailySerialNo, orderId, orderTimestamp (PIN code is kept private, NOT in WhatsApp)
  const message = buildGroceryOrderMessage({
    resident,
    items: itemsToOrder,
    customNote,
    totalAmount,
    deliveryPin,
    dailySerialNo: savedOrder.dailySerialNo,
    orderId: savedOrder.id,
    orderTimestamp: savedOrder.createdAt
  });

  const phones = state.storePhones;
  const phone = phones.grocery || DEFAULT_CONFIG.defaultGroceryPhone;
  const waUrl = getWhatsAppUrl(phone, message);

  // Open WhatsApp Preview Modal with highlighted PIN
  openWhatsAppPreviewModal({
    avatar: '🛒',
    vendorName: 'Society Grocery Shop',
    phone: phone,
    pin: deliveryPin,
    message: message,
    url: waUrl,
    onSent: () => {
      state.clearGroceryCart();
      elements.groceryCustomNote.value = '';
      showToast(`Order #${savedOrder.id} created! (Today's S.No: #${savedOrder.dailySerialNo || 1})`, '🛒');
      switchTab('my-orders');
    }
  });
}

async function executeRestaurantOrder() {
  const resident = state.getResidentProfile();
  if (!resident || !resident.flatNo) {
    elements.onboardingModal.classList.add('show');
    showToast('Please confirm your Flat & Tower first', '📍');
    return;
  }

  const cart = state.restaurantCart;
  const itemsToOrder = [];
  let totalAmount = 0;

  Object.entries(cart).forEach(([id, qty]) => {
    const item = state.restaurantItems.find(i => i.id === id);
    if (item && qty > 0) {
      itemsToOrder.push({ ...item, quantity: qty });
      totalAmount += item.price * qty;
    }
  });

  const instructions = elements.restoSpecialNote.value || state.restaurantNote;

  if (itemsToOrder.length === 0) {
    showToast('Please add dishes to your food cart', '⚠️');
    return;
  }

  // Create Order in Server Backend (generates deliveryPin and dailySerialNo)
  const savedOrder = await state.placeOrder({
    type: 'restaurant',
    items: itemsToOrder,
    customNote: instructions,
    totalAmount: totalAmount,
    resident: resident
  });

  const deliveryPin = savedOrder.deliveryPin;

  // Build message with dailySerialNo, orderId, orderTimestamp (PIN code is kept private, NOT in WhatsApp)
  const message = buildRestaurantOrderMessage({
    resident,
    items: itemsToOrder,
    specialInstructions: instructions,
    totalAmount,
    deliveryPin,
    dailySerialNo: savedOrder.dailySerialNo,
    orderId: savedOrder.id,
    orderTimestamp: savedOrder.createdAt
  });

  const phones = state.storePhones;
  const phone = phones.restaurant || DEFAULT_CONFIG.defaultRestaurantPhone;
  const waUrl = getWhatsAppUrl(phone, message);

  openWhatsAppPreviewModal({
    avatar: '🍽️',
    vendorName: 'Society Bistro & Restaurant',
    phone: phone,
    pin: deliveryPin,
    message: message,
    url: waUrl,
    onSent: () => {
      state.clearRestaurantCart();
      elements.restoSpecialNote.value = '';
      showToast(`Food order #${savedOrder.id} created! (Today's S.No: #${savedOrder.dailySerialNo || 1})`, '🍽️');
      switchTab('my-orders');
    }
  });
}

function openWhatsAppPreviewModal({ avatar, vendorName, phone, pin, message, url, onSent }) {
  currentModalWhatsAppUrl = url;
  currentModalMessage = message;

  elements.waModalAvatar.textContent = avatar;
  elements.waModalVendorName.textContent = vendorName;
  elements.waModalVendorPhone.textContent = `+${phone}`;
  elements.waModalPinCode.textContent = pin || '----';
  elements.waModalMsgBubble.textContent = message;
  elements.waModalLaunchBtn.href = url;

  elements.waPreviewModal.classList.add('show');

  elements.waModalLaunchBtn.onclick = () => {
    if (onSent) onSent();
    setTimeout(() => {
      elements.waPreviewModal.classList.remove('show');
    }, 400);
  };
}

function enquireClubAmenity(amenityName) {
  const resident = state.getResidentProfile();
  if (!resident || !resident.flatNo) {
    elements.onboardingModal.classList.add('show');
    return;
  }

  const message = buildClubHouseEnquiryMessage({ resident, amenityName });
  const phone = state.storePhones.clubHouse || DEFAULT_CONFIG.defaultClubHousePhone;
  const waUrl = getWhatsAppUrl(phone, message);

  openWhatsAppPreviewModal({
    avatar: '🏛️',
    vendorName: 'Club House Desk',
    phone: phone,
    pin: null,
    message: message,
    url: waUrl
  });
}

// ----------------------------------------------------
// Global Exposed Helpers for Inline HTML Events
// ----------------------------------------------------
window.app = {
  changeGroceryQty: (itemId, newQty) => {
    const item = state.groceryItems.find(i => i.id === itemId);
    const available = item && item.availableQty !== undefined ? item.availableQty : 999;
    
    if (newQty > available) {
      showToast(`⚠️ Only ${available} available in stock! Cannot add more.`, '📦');
      return;
    }
    if (available <= 0 && newQty > 0) {
      showToast(`⚠️ Item is currently out of stock!`, '🚫');
      return;
    }

    state.setGroceryQty(itemId, newQty);
    renderGroceryItems();
    updateGroceryCartSummary();
  },
  changeRestoQty: (itemId, newQty) => {
    const item = state.restaurantItems.find(i => i.id === itemId);
    const available = item && item.availableQty !== undefined ? item.availableQty : 999;
    
    if (newQty > available) {
      showToast(`⚠️ Only ${available} portions available with the kitchen! Cannot add more.`, '🍛');
      return;
    }
    if (available <= 0 && newQty > 0) {
      showToast(`⚠️ Dish is currently sold out!`, '🚫');
      return;
    }

    state.setRestaurantQty(itemId, newQty);
    renderRestoItems();
    updateRestoCartSummary();
  },
  openMyOrdersTab: () => {
    switchTab('my-orders');
  },
  enquireClubAmenity,

  // Admin PIN verification modal
  openPinVerificationModal: (orderId, flatNo, tower, total) => {
    currentVerifyingOrderId = orderId;
    elements.verifyModalOrderTitle.textContent = `Order #${orderId}`;
    const unitText = /^(flat|villa)/i.test(flatNo) ? flatNo : `Flat/Villa ${flatNo}`;
    elements.verifyModalFlatText.textContent = `${unitText}, ${tower} • Bill: ₹${total}`;
    elements.verifyPinInput.value = '';
    elements.verifyPinModal.classList.add('show');
    setTimeout(() => elements.verifyPinInput.focus(), 200);
  },

  // Admin Item Edit Modal
  openEditItemModal: (itemId, type) => {
    const isGrocery = type === 'grocery';
    const item = isGrocery ?
      state.groceryItems.find(i => i.id === itemId) :
      state.restaurantItems.find(i => i.id === itemId);

    if (!item) return;

    elements.editorItemId.value = item.id;
    elements.editorItemType.value = type;
    elements.itemEditorTitle.textContent = `✏️ Edit ${isGrocery ? 'Grocery Item' : 'Food Dish'}`;

    elements.editorName.value = item.name;
    elements.editorPrice.value = item.price;
    elements.editorImgUrl.value = item.img || '';
    elements.editorImgPreview.src = item.img || (isGrocery ?
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80' :
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80');
    if (elements.editorStockQty) {
      elements.editorStockQty.value = item.availableQty !== undefined ? item.availableQty : 20;
    }
    elements.uploadFileStatus.textContent = 'Current photo loaded (Tap to choose new photo from device)';
    if (elements.editorFileInput) elements.editorFileInput.value = '';

    // Populate categories
    const categories = isGrocery ? GROCERY_CATEGORIES : RESTAURANT_CATEGORIES;
    elements.editorCategory.innerHTML = categories
      .filter(c => c.id !== 'all')
      .map(c => `<option value="${c.id}" ${c.id === item.category ? 'selected' : ''}>${c.label}</option>`)
      .join('');

    if (isGrocery) {
      elements.editorGroceryFields.style.display = 'block';
      elements.editorRestoFields.style.display = 'none';
      elements.editorPack.value = item.pack || '';
    } else {
      elements.editorGroceryFields.style.display = 'none';
      elements.editorRestoFields.style.display = 'block';
      elements.editorDesc.value = item.desc || '';
      elements.editorIsVeg.value = item.isVeg ? 'true' : 'false';
      elements.editorBadge.value = item.badge || '';
    }

    elements.itemEditorModal.classList.add('show');
  },

  // Admin Delete Item
  deleteItem: async (itemId, type) => {
    if (!confirm('Are you sure you want to delete this item from the catalog?')) return;
    if (type === 'grocery') {
      await state.deleteGroceryItem(itemId);
    } else {
      await state.deleteRestaurantItem(itemId);
    }
    showToast('Item removed from catalog', '🗑️');
    renderAdminCatalog();
    renderGroceryItems();
    renderRestoItems();
  },

  // Admin Edit Amenity
  openEditAmenityModal: (amenityId) => {
    const a = state.clubAmenities.find(item => item.id === amenityId);
    if (!a) return;
    const newTiming = prompt('Enter updated operational timings:', a.timing);
    if (newTiming !== null && newTiming.trim()) {
      a.timing = newTiming.trim();
      fetch(`/api/amenities/${a.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timing: a.timing })
      });
      showToast('Amenity updated!', '✅');
      renderAdminAmenities();
      renderClubHouseAmenities();
    }
  }
};

// ----------------------------------------------------
// Event Listeners Setup
// ----------------------------------------------------
function setupEventListeners() {
  // Desktop Frame Toggle
  let isFullView = false;
  if (elements.toggleFrameBtn && elements.deviceWrapper) {
    elements.toggleFrameBtn.addEventListener('click', () => {
      isFullView = !isFullView;
      elements.deviceWrapper.classList.toggle('full-width', isFullView);
      if (elements.frameModeText) elements.frameModeText.textContent = isFullView ? 'Mobile Shell' : 'Fit View';
      if (elements.frameModeIcon) elements.frameModeIcon.textContent = isFullView ? '📱' : '🖥️';
    });
  }

  // Resident Tabs & Bottom Nav
  if (elements.subTabs) {
    elements.subTabs.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
  }

  if (elements.bottomNavBtns) {
    elements.bottomNavBtns.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
  }

  // Admin Sub-tabs & Bottom Nav
  if (elements.adminSubTabs) {
    elements.adminSubTabs.forEach(btn => {
      btn.addEventListener('click', () => switchAdminTab(btn.dataset.adminTab));
    });
  }

  if (elements.adminNavOrdersBtn) {
    elements.adminNavOrdersBtn.addEventListener('click', () => switchAdminTab('orders'));
  }
  if (elements.adminNavCatalogBtn) {
    elements.adminNavCatalogBtn.addEventListener('click', () => switchAdminTab('catalog'));
  }
  if (elements.adminNavPhoneBtn) {
    elements.adminNavPhoneBtn.addEventListener('click', () => switchAdminTab('phone'));
  }

  // Admin Single Phone Form Submit (Respective admin only)
  if (elements.adminSinglePhoneForm) {
    elements.adminSinglePhoneForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentRole = state.getActiveRole();
      if (currentRole === 'resident') return;

      const newPhone = elements.adminStorePhoneInput ? elements.adminStorePhoneInput.value.trim() : '';
      if (!newPhone || newPhone.length < 8) {
        showToast('Please enter a valid phone number with country code', '⚠️');
        return;
      }

      const success = await state.updateStorePhone(currentRole, newPhone);
      syncStorePhonesUI();
      if (success) {
        showToast('Store WhatsApp number updated!', '📱');
      } else {
        showToast('WhatsApp number saved locally', '📱');
      }
    });
  }

  // Universal Logout Handlers
  if (elements.btnHeaderLogout) {
    elements.btnHeaderLogout.addEventListener('click', handleLogout);
  }
  if (elements.btnProfileLogout) {
    elements.btnProfileLogout.addEventListener('click', handleLogout);
  }
  if (elements.btnExitAdmin) {
    elements.btnExitAdmin.addEventListener('click', handleLogout);
  }
  if (elements.adminNavLogoutBtn) {
    elements.adminNavLogoutBtn.addEventListener('click', handleLogout);
  } else if (elements.adminNavExitBtn) {
    elements.adminNavExitBtn.addEventListener('click', handleLogout);
  }

  // PWA Mobile App Installation
  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });

  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('Installing Raheja Exotica App on your phone!', '📲');
      }
      deferredInstallPrompt = null;
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        showToast('On iPhone: Tap Share (⬆️) -> Tap "Add to Home Screen"', '📲', 5000);
      } else {
        showToast('On Android: Tap Chrome Menu (⋮) -> Tap "Install App" or "Add to Home Screen"', '📲', 5000);
      }
    }
  };

  if (elements.btnAuthInstallApp) {
    elements.btnAuthInstallApp.addEventListener('click', handleInstallApp);
  }
  if (elements.btnProfileInstallApp) {
    elements.btnProfileInstallApp.addEventListener('click', handleInstallApp);
  }

  // Submit PIN Verification
  if (elements.btnSubmitPinVerify) {
    elements.btnSubmitPinVerify.addEventListener('click', async () => {
      const pin = elements.verifyPinInput ? elements.verifyPinInput.value : '';
      if (!pin || pin.trim().length !== 4) {
        showToast('Please enter the 4-digit code', '⚠️');
        return;
      }

      const result = await state.verifyDeliveryPin(currentVerifyingOrderId, pin);
      if (result.success) {
        playNotificationSound('order_completed');
        showToast(`Delivery Certified & Marked Completed for Order #${currentVerifyingOrderId}!`, '🎉');
        if (elements.verifyPinModal) elements.verifyPinModal.classList.remove('show');
        renderAdminOrders();
        renderResidentOrders();
        updateAdminOrderBadges();
      } else {
        showToast(result.message, '❌');
      }
    });
  }

  if (elements.closePinModalBtn) {
    elements.closePinModalBtn.addEventListener('click', () => {
      if (elements.verifyPinModal) elements.verifyPinModal.classList.remove('show');
    });
  }

  // Admin Add Item Button
  if (elements.btnAdminAddItem) {
    elements.btnAdminAddItem.addEventListener('click', () => {
      const role = state.getActiveRole();
      const isGrocery = role === 'grocery_admin';
      const type = isGrocery ? 'grocery' : 'restaurant';

      if (elements.editorItemId) elements.editorItemId.value = '';
      if (elements.editorItemType) elements.editorItemType.value = type;
      if (elements.itemEditorTitle) elements.itemEditorTitle.textContent = `➕ Add New ${isGrocery ? 'Grocery Item' : 'Food Dish'}`;

      if (elements.editorName) elements.editorName.value = '';
      if (elements.editorPrice) elements.editorPrice.value = '';
      if (elements.editorStockQty) {
        elements.editorStockQty.value = isGrocery ? '25' : '20';
      }
      if (elements.editorImgUrl) {
        elements.editorImgUrl.value = isGrocery ?
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80' :
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80';
      }
      if (elements.editorImgPreview && elements.editorImgUrl) {
        elements.editorImgPreview.src = elements.editorImgUrl.value;
      }
      if (elements.uploadFileStatus) elements.uploadFileStatus.textContent = 'Tap to select photo from device or gallery';
      if (elements.editorFileInput) elements.editorFileInput.value = '';

      const categories = isGrocery ? GROCERY_CATEGORIES : RESTAURANT_CATEGORIES;
      if (elements.editorCategory) {
        elements.editorCategory.innerHTML = categories
          .filter(c => c.id !== 'all')
          .map(c => `<option value="${c.id}">${c.label}</option>`)
          .join('');
      }

      if (isGrocery) {
        if (elements.editorGroceryFields) elements.editorGroceryFields.style.display = 'block';
        if (elements.editorRestoFields) elements.editorRestoFields.style.display = 'none';
        if (elements.editorPack) elements.editorPack.value = '1 unit';
      } else {
        if (elements.editorGroceryFields) elements.editorGroceryFields.style.display = 'none';
        if (elements.editorRestoFields) elements.editorRestoFields.style.display = 'block';
        if (elements.editorDesc) elements.editorDesc.value = '';
        if (elements.editorIsVeg) elements.editorIsVeg.value = 'true';
        if (elements.editorBadge) elements.editorBadge.value = '';
      }

      if (elements.itemEditorModal) elements.itemEditorModal.classList.add('show');
    });
  }

  if (elements.closeItemEditorBtn) {
    elements.closeItemEditorBtn.addEventListener('click', () => {
      if (elements.itemEditorModal) elements.itemEditorModal.classList.remove('show');
    });
  }

  // Image URL input preview sync
  if (elements.editorImgUrl && elements.editorImgPreview) {
    elements.editorImgUrl.addEventListener('input', (e) => {
      elements.editorImgPreview.src = e.target.value || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
    });
  }

  // Preset Buttons for quick photo selection
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (elements.editorImgUrl) elements.editorImgUrl.value = btn.dataset.url;
      if (elements.editorImgPreview) elements.editorImgPreview.src = btn.dataset.url;
      if (elements.uploadFileStatus) elements.uploadFileStatus.textContent = 'Using selected preset photo';
    });
  });

  // Local File Upload Handlers (from device / gallery / camera)
  if (elements.btnTriggerFileUpload && elements.editorFileInput) {
    elements.btnTriggerFileUpload.addEventListener('click', () => {
      elements.editorFileInput.click();
    });

    elements.editorFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', '⚠️');
        return;
      }

      if (elements.uploadFileStatus) elements.uploadFileStatus.textContent = `⏳ Uploading ${file.name}...`;

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        if (elements.editorImgPreview) elements.editorImgPreview.src = base64Data;

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, data: base64Data })
          });
          const json = await res.json();
          if (json.success && json.url) {
            if (elements.editorImgUrl) elements.editorImgUrl.value = json.url;
            if (elements.uploadFileStatus) elements.uploadFileStatus.textContent = `✅ ${file.name} (${Math.round(file.size / 1024)} KB)`;
            showToast('Photo uploaded from local device!', '📷');
          } else {
            if (elements.editorImgUrl) elements.editorImgUrl.value = base64Data;
            if (elements.uploadFileStatus) elements.uploadFileStatus.textContent = `✅ ${file.name} loaded`;
          }
        } catch (err) {
          if (elements.editorImgUrl) elements.editorImgUrl.value = base64Data;
          if (elements.uploadFileStatus) elements.uploadFileStatus.textContent = `✅ ${file.name} loaded`;
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Item Editor Form Submit
  if (elements.itemEditorForm) {
    elements.itemEditorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = elements.editorItemId ? elements.editorItemId.value : '';
      const type = elements.editorItemType ? elements.editorItemType.value : 'grocery';
      const isGrocery = type === 'grocery';

      const fallbackImg = isGrocery ?
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80' :
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80';

      const itemData = {
        name: elements.editorName ? elements.editorName.value.trim() : '',
        price: Number(elements.editorPrice ? elements.editorPrice.value : 0),
        category: elements.editorCategory ? elements.editorCategory.value : 'all',
        img: (elements.editorImgUrl && elements.editorImgUrl.value.trim()) || fallbackImg,
        availableQty: Number(elements.editorStockQty ? elements.editorStockQty.value : 20)
      };

      if (isGrocery) {
        itemData.pack = (elements.editorPack ? elements.editorPack.value.trim() : '') || '1 unit';
      } else {
        itemData.desc = elements.editorDesc ? elements.editorDesc.value.trim() : '';
        itemData.isVeg = elements.editorIsVeg ? elements.editorIsVeg.value === 'true' : true;
        itemData.badge = elements.editorBadge ? elements.editorBadge.value.trim() : '';
      }

      if (id) {
        // Update
        if (isGrocery) {
          await state.updateGroceryItem(id, itemData);
        } else {
          await state.updateRestaurantItem(id, itemData);
        }
        showToast('Item updated successfully!', '✏️');
      } else {
        // Add
        if (isGrocery) {
          await state.addGroceryItem(itemData);
        } else {
          await state.addRestaurantItem(itemData);
        }
        showToast('New item added to catalog!', '➕');
      }

      if (elements.itemEditorModal) elements.itemEditorModal.classList.remove('show');
      renderAdminCatalog();
      renderGroceryItems();
      renderRestoItems();
    });
  }

  // Admin Catalog Search
  if (elements.adminCatalogSearch) {
    elements.adminCatalogSearch.addEventListener('input', (e) => {
      adminCatalogSearch = e.target.value;
      renderAdminCatalog();
    });
  }

  // Resident Header chip & Home cards
  if (elements.openProfileChip) elements.openProfileChip.addEventListener('click', () => switchTab('profile'));
  if (elements.homeCardGrocery) elements.homeCardGrocery.addEventListener('click', () => switchTab('grocery'));
  if (elements.homeCardRestaurant) elements.homeCardRestaurant.addEventListener('click', () => switchTab('restaurant'));
  if (elements.homeCardClub) elements.homeCardClub.addEventListener('click', () => switchTab('clubhouse'));

  // Grocery search & custom note
  if (elements.grocerySearchInput) {
    elements.grocerySearchInput.addEventListener('input', (e) => {
      grocerySearch = e.target.value;
      renderGroceryItems();
    });
  }
  if (elements.groceryCustomNote) {
    elements.groceryCustomNote.addEventListener('input', (e) => {
      state.setGroceryNote(e.target.value);
    });
  }
  if (elements.btnGroceryCheckout) {
    elements.btnGroceryCheckout.addEventListener('click', executeGroceryOrder);
  }

  // Restaurant search & veg filter
  if (elements.restaurantSearchInput) {
    elements.restaurantSearchInput.addEventListener('input', (e) => {
      restoSearch = e.target.value;
      renderRestoItems();
    });
  }

  if (elements.filterAllFood) {
    elements.filterAllFood.addEventListener('click', () => {
      restoVegFilter = 'all';
      elements.filterAllFood.className = 'veg-pill-btn active-all';
      if (elements.filterVegOnly) elements.filterVegOnly.className = 'veg-pill-btn';
      if (elements.filterNonvegOnly) elements.filterNonvegOnly.className = 'veg-pill-btn';
      renderRestoItems();
    });
  }

  if (elements.filterVegOnly) {
    elements.filterVegOnly.addEventListener('click', () => {
      restoVegFilter = 'veg';
      if (elements.filterAllFood) elements.filterAllFood.className = 'veg-pill-btn';
      elements.filterVegOnly.className = 'veg-pill-btn active-veg';
      if (elements.filterNonvegOnly) elements.filterNonvegOnly.className = 'veg-pill-btn';
      renderRestoItems();
    });
  }

  if (elements.filterNonvegOnly) {
    elements.filterNonvegOnly.addEventListener('click', () => {
      restoVegFilter = 'nonveg';
      if (elements.filterAllFood) elements.filterAllFood.className = 'veg-pill-btn';
      if (elements.filterVegOnly) elements.filterVegOnly.className = 'veg-pill-btn';
      elements.filterNonvegOnly.className = 'veg-pill-btn active-nonveg';
      renderRestoItems();
    });
  }

  if (elements.restoSpecialNote) {
    elements.restoSpecialNote.addEventListener('input', (e) => {
      state.setRestaurantNote(e.target.value);
    });
  }
  if (elements.btnRestoCheckout) {
    elements.btnRestoCheckout.addEventListener('click', executeRestaurantOrder);
  }

  // Profile forms
  if (elements.profileForm) {
    elements.profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = elements.profileForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Update Address Info';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Saving...</span>';
      }

      const res = await state.saveResidentProfile({
        societyName: elements.inputSocietyName ? elements.inputSocietyName.value : '',
        tower: elements.inputTowerSelect ? elements.inputTowerSelect.value : '',
        flatNo: elements.inputFlatNo ? elements.inputFlatNo.value : '',
        name: elements.inputResidentName ? elements.inputResidentName.value : '',
        phone: elements.inputResidentPhone ? elements.inputResidentPhone.value : ''
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }

      if (res && res.success === false) {
        showToast(res.message || 'Could not update profile', '❌');
      } else {
        syncResidentUI();
        showToast('Resident address details updated successfully!', '✅');
      }
    });
  }

  // Onboarding Form
  if (elements.onboardingForm) {
    elements.onboardingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await state.saveResidentProfile({
        societyName: elements.onboardingSociety ? elements.onboardingSociety.value : '',
        tower: elements.onboardingTower ? elements.onboardingTower.value : '',
        flatNo: elements.onboardingFlat ? elements.onboardingFlat.value : '',
        name: elements.onboardingName ? elements.onboardingName.value : '',
        phone: elements.onboardingPhone ? elements.onboardingPhone.value : ''
      });
      syncResidentUI();
      if (elements.onboardingModal) elements.onboardingModal.classList.remove('show');
      showToast('Welcome to Raheja Resident App!', '🎉');
    });
  }

  // WhatsApp Preview Modal Close & Copy
  if (elements.closeWaModalBtn) {
    elements.closeWaModalBtn.addEventListener('click', () => {
      if (elements.waPreviewModal) elements.waPreviewModal.classList.remove('show');
    });
  }

  if (elements.waModalCopyBtn) {
    elements.waModalCopyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(currentModalMessage);
        showToast('Order text & code copied!', '📋');
      } catch {
        const ta = document.createElement('textarea');
        ta.value = currentModalMessage;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Order text copied!', '📋');
      }
    });
  }

  // State Subscriptions with Real-Time Notifications
  state.subscribe((event, data) => {
    if (event === 'auth:logout') {
      if (elements.authScreen) elements.authScreen.classList.remove('hidden');
    } else if (event === 'orders:new') {
      const order = data;
      const role = state.getActiveRole();
      const isGroceryAdmin = role === 'grocery_admin';
      const isRestoAdmin = role === 'restaurant_admin';

      // Alert relevant admin about new order
      if ((isGroceryAdmin && order.type === 'grocery') || (isRestoAdmin && order.type === 'restaurant')) {
        playNotificationSound('new_order');
        const unit = /^(flat|villa)/i.test(order.resident?.flatNo) ? order.resident?.flatNo : `Flat/Villa ${order.resident?.flatNo || ''}`;
        const location = `${unit}, ${order.resident?.tower || ''}`;
        showToast(`🔔 New Order #${order.id} received from ${location}! (₹${order.totalAmount})`, '🔔', 5500, () => {
          switchAdminTab('orders');
        });
        showSystemNotification('New Order Received!', `Order #${order.id} from ${location} (₹${order.totalAmount})`);
        renderAdminOrders();
        updateAdminOrderBadges();
      }
    } else if (event === 'orders:status_changed') {
      const { order, oldStatus, newStatus } = data;
      const role = state.getActiveRole();

      // Alert resident if their order was delivered & completed
      if (role === 'resident' && newStatus === 'completed') {
        const myProfile = state.getResidentProfile();
        const myPhone = myProfile?.phone ? String(myProfile.phone).replace(/[^0-9]/g, '') : '';
        const orderPhone = order.resident?.phone ? String(order.resident.phone).replace(/[^0-9]/g, '') : '';

        if (!myPhone || myPhone === orderPhone) {
          playNotificationSound('order_completed');
          showToast(`🎉 Order #${order.id} verified & delivered to your flat! Thank you!`, '🎉', 5500, () => {
            switchTab('my-orders');
          });
          showSystemNotification('Order Delivered!', `Your Order #${order.id} has been verified and marked Delivered.`);
          renderResidentOrders();
        }
      }

      if (role !== 'resident') {
        renderAdminOrders();
        updateAdminOrderBadges();
      }
    } else if (event.startsWith('resident:')) {
      syncResidentUI();
      renderResidentOrders();
    } else if (event.startsWith('grocery_cart:')) {
      renderGroceryItems();
      updateGroceryCartSummary();
    } else if (event.startsWith('restaurant_cart:')) {
      renderRestoItems();
      updateRestoCartSummary();
    } else if (event.startsWith('orders:')) {
      renderResidentOrders();
      if (state.getActiveRole() !== 'resident') {
        renderAdminOrders();
        updateAdminOrderBadges();
      }
    } else if (event.startsWith('grocery_catalog:')) {
      renderGroceryItems();
      if (state.getActiveRole() === 'grocery_admin') renderAdminCatalog();
    } else if (event.startsWith('resto_catalog:')) {
      renderRestoItems();
      if (state.getActiveRole() === 'restaurant_admin') renderAdminCatalog();
    } else if (event.startsWith('store_phones:')) {
      syncStorePhonesUI();
    }
  });
}

// ----------------------------------------------------
// Auth Screen Functions & Fast Mobile Event Handlers
// ----------------------------------------------------
export function showResidentAuth() {
  const tabRes = document.getElementById('tab-auth-resident');
  const tabAdmin = document.getElementById('tab-auth-admin');
  const secRes = document.getElementById('auth-resident-section');
  const secAdmin = document.getElementById('auth-admin-section');
  if (tabRes) tabRes.classList.add('active');
  if (tabAdmin) tabAdmin.classList.remove('active');
  if (secRes) secRes.style.display = 'block';
  if (secAdmin) secAdmin.style.display = 'none';
}

export function showAdminAuth() {
  const tabRes = document.getElementById('tab-auth-resident');
  const tabAdmin = document.getElementById('tab-auth-admin');
  const secRes = document.getElementById('auth-resident-section');
  const secAdmin = document.getElementById('auth-admin-section');
  const pinInput = document.getElementById('admin-login-pin');
  if (tabAdmin) tabAdmin.classList.add('active');
  if (tabRes) tabRes.classList.remove('active');
  if (secRes) secRes.style.display = 'none';
  if (secAdmin) secAdmin.style.display = 'block';
  if (pinInput) setTimeout(() => pinInput.focus(), 50);
}

export function showResidentLogin() {
  const btnLogin = document.getElementById('btn-show-res-login');
  const btnSignup = document.getElementById('btn-show-res-signup');
  const formLogin = document.getElementById('resident-login-form');
  const formSignup = document.getElementById('resident-signup-form');
  const formReset = document.getElementById('resident-reset-form');
  if (btnLogin) btnLogin.classList.add('active');
  if (btnSignup) btnSignup.classList.remove('active');
  if (formLogin) formLogin.style.display = 'block';
  if (formSignup) formSignup.style.display = 'none';
  if (formReset) formReset.style.display = 'none';
}

export function showResidentSignup() {
  const btnLogin = document.getElementById('btn-show-res-login');
  const btnSignup = document.getElementById('btn-show-res-signup');
  const formLogin = document.getElementById('resident-login-form');
  const formSignup = document.getElementById('resident-signup-form');
  const formReset = document.getElementById('resident-reset-form');
  if (btnSignup) btnSignup.classList.add('active');
  if (btnLogin) btnLogin.classList.remove('active');
  if (formSignup) formSignup.style.display = 'block';
  if (formLogin) formLogin.style.display = 'none';
  if (formReset) formReset.style.display = 'none';
}

export function showResidentForgot() {
  const formLogin = document.getElementById('resident-login-form');
  const formSignup = document.getElementById('resident-signup-form');
  const formReset = document.getElementById('resident-reset-form');
  const btnLogin = document.getElementById('btn-show-res-login');
  const btnSignup = document.getElementById('btn-show-res-signup');
  if (formLogin) formLogin.style.display = 'none';
  if (formSignup) formSignup.style.display = 'none';
  if (formReset) formReset.style.display = 'block';
  if (btnLogin) btnLogin.classList.remove('active');
  if (btnSignup) btnSignup.classList.remove('active');
}

export function selectAdminDepartment(role) {
  selectedAuthAdminRole = role;
  const cards = document.querySelectorAll('.admin-auth-card');
  cards.forEach(c => {
    if (c.dataset.adminSelect === role || c.dataset.adminRole === role) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });
  const adminHintMap = {
    grocery_admin: { hint: 'Demo PIN: Grocery = 1111', color: '#059669', title: 'Login to Grocery Admin Panel' },
    restaurant_admin: { hint: 'Demo PIN: Restaurant = 2222', color: '#ea580c', title: 'Login to Restaurant Admin Panel' },
    club_admin: { hint: 'Demo PIN: Club = 3333', color: '#2563eb', title: 'Login to Club House Admin Panel' }
  };
  const info = adminHintMap[role] || adminHintMap.grocery_admin;
  const hintEl = document.getElementById('admin-auth-demo-hint');
  const submitBtn = document.getElementById('btn-admin-auth-submit');
  const pinInput = document.getElementById('admin-login-pin');
  if (hintEl) hintEl.innerHTML = `Demo PIN: <strong style="color: ${info.color};">${info.hint.replace('Demo PIN: ', '')}</strong>`;
  if (submitBtn) submitBtn.innerHTML = `<span>🔓 ${info.title}</span>`;
  if (pinInput) { pinInput.value = ''; pinInput.focus(); }
}

// Window global bridges for inline onclick attributes
window.switchAuthTab = function(role) {
  if (role === 'admin') showAdminAuth();
  else showResidentAuth();
};
window.switchResSub = function(sub) {
  if (sub === 'signup') showResidentSignup();
  else showResidentLogin();
};

// Standalone App Detection & Dynamic Install Banner Control
export function isRunningInApp() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://') ||
    window.location.search.includes('source=pwa') ||
    window.location.search.includes('mode=standalone')
  );
}

export function updateInstallBannerVisibility() {
  const inApp = isRunningInApp();
  const authBanner = document.getElementById('auth-install-banner');
  const profileBanner = document.getElementById('profile-install-banner');

  if (inApp) {
    document.body.classList.add('is-in-app');
    if (authBanner) authBanner.style.display = 'none';
    if (profileBanner) profileBanner.style.display = 'none';
  } else {
    document.body.classList.remove('is-in-app');
    if (authBanner) authBanner.style.display = 'block';
    if (profileBanner) profileBanner.style.display = 'block';
  }
}

let authEventListenersAttached = false;
function setupAuthEventListeners() {
  if (authEventListenersAttached) return;
  authEventListenersAttached = true;

  // Auto-hide or show install banners based on whether running in browser or app
  updateInstallBannerVisibility();
  try {
    window.matchMedia('(display-mode: standalone)').addEventListener('change', updateInstallBannerVisibility);
  } catch {}

  // 1. Direct Click Listeners
  const tabRes = document.getElementById('tab-auth-resident');
  const tabAdmin = document.getElementById('tab-auth-admin');
  if (tabRes) tabRes.addEventListener('click', () => showResidentAuth());
  if (tabAdmin) tabAdmin.addEventListener('click', () => showAdminAuth());

  const btnLogin = document.getElementById('btn-show-res-login');
  const btnSignup = document.getElementById('btn-show-res-signup');
  if (btnLogin) btnLogin.addEventListener('click', () => showResidentLogin());
  if (btnSignup) btnSignup.addEventListener('click', () => showResidentSignup());

  const linkForgot = document.getElementById('link-forgot-res-pass');
  if (linkForgot) {
    linkForgot.addEventListener('click', (e) => {
      e.preventDefault();
      showResidentForgot();
    });
  }

  const btnCancelReset = document.getElementById('btn-cancel-res-reset');
  if (btnCancelReset) {
    btnCancelReset.addEventListener('click', () => showResidentLogin());
  }

  // Admin Department Cards
  const adminCards = document.querySelectorAll('.admin-auth-card');
  adminCards.forEach(card => {
    card.addEventListener('click', () => {
      const role = card.dataset.adminSelect || card.dataset.adminRole;
      if (role) selectAdminDepartment(role);
    });
  });

  const linkForgotPin = document.getElementById('link-forgot-admin-pin');
  if (linkForgotPin) {
    linkForgotPin.addEventListener('click', (e) => {
      e.preventDefault();
      const loginForm = document.getElementById('admin-login-form');
      const resetForm = document.getElementById('admin-reset-form');
      const roleSelect = document.getElementById('admin-reset-role-select');
      if (loginForm) loginForm.style.display = 'none';
      if (resetForm) resetForm.style.display = 'block';
      if (roleSelect) roleSelect.value = selectedAuthAdminRole;
    });
  }

  const btnCancelAdminReset = document.getElementById('btn-cancel-admin-reset');
  if (btnCancelAdminReset) {
    btnCancelAdminReset.addEventListener('click', () => {
      const loginForm = document.getElementById('admin-login-form');
      const resetForm = document.getElementById('admin-reset-form');
      if (resetForm) resetForm.style.display = 'none';
      if (loginForm) loginForm.style.display = 'block';
    });
  }

  // 2. Delegated Document Click Handler (ensures touches anywhere on mobile are captured)
  document.addEventListener('click', (e) => {
    const roleTab = e.target.closest('.auth-role-tab');
    if (roleTab) {
      const role = roleTab.dataset.mainRole || (roleTab.id === 'tab-auth-admin' ? 'admin' : 'resident');
      if (role === 'admin') showAdminAuth();
      else showResidentAuth();
      return;
    }

    const subPill = e.target.closest('.sub-switch-pill');
    if (subPill) {
      if (subPill.id === 'btn-show-res-signup' || subPill.textContent.trim().toLowerCase().includes('sign up')) {
        showResidentSignup();
      } else {
        showResidentLogin();
      }
      return;
    }

    const card = e.target.closest('.admin-auth-card');
    if (card) {
      const role = card.dataset.adminSelect || card.dataset.adminRole;
      if (role) selectAdminDepartment(role);
      return;
    }
  });

  // 3. Form Submissions
  // Resident Login
  const resLoginForm = document.getElementById('resident-login-form');
  if (resLoginForm) {
    resLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const phoneInput = document.getElementById('res-login-phone');
      const passInput = document.getElementById('res-login-password');
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const password = passInput ? passInput.value.trim() : '';

      if (!phone || !password) {
        showToast('Please enter mobile number and password', '⚠️');
        return;
      }

      const res = await state.loginResident(phone, password);
      if (res.success) {
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.classList.add('hidden');
        applyRoleUI('resident');
        syncResidentUI();
        showToast(`Welcome back, ${res.user?.name || 'Resident'}!`, '🎉');
      } else {
        showToast(res.message || 'Invalid mobile number or password', '❌');
      }
    });
  }

  // Resident Sign Up
  const resSignupForm = document.getElementById('resident-signup-form');
  if (resSignupForm) {
    resSignupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const socInput = document.getElementById('res-signup-society');
      const towerInput = document.getElementById('res-signup-tower');
      const flatInput = document.getElementById('res-signup-flat');
      const nameInput = document.getElementById('res-signup-name');
      const phoneInput = document.getElementById('res-signup-phone');
      const passInput = document.getElementById('res-signup-password');

      const signupData = {
        societyName: (socInput ? socInput.value.trim() : '') || 'Raheja Exotica',
        tower: towerInput ? towerInput.value : 'Tower B',
        flatNo: flatInput ? flatInput.value.trim() : '',
        name: nameInput ? nameInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        password: passInput ? passInput.value.trim() : ''
      };

      if (!signupData.flatNo || !signupData.name || !signupData.phone || !signupData.password) {
        showToast('Please fill all sign up details', '⚠️');
        return;
      }

      const res = await state.registerResident(signupData);
      if (res.success) {
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.classList.add('hidden');
        applyRoleUI('resident');
        syncResidentUI();
        showToast(`Account created! Welcome, ${signupData.name}!`, '🎉');
      } else {
        showToast(res.message || 'Could not register account', '❌');
      }
    });
  }

  // Resident Reset Password
  const resResetForm = document.getElementById('resident-reset-form');
  if (resResetForm) {
    resResetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const phoneInput = document.getElementById('res-reset-phone');
      const flatInput = document.getElementById('res-reset-flat');
      const passInput = document.getElementById('res-reset-new-pass');
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const flatNo = flatInput ? flatInput.value.trim() : '';
      const newPassword = passInput ? passInput.value.trim() : '';

      if (!phone || !flatNo || !newPassword) {
        showToast('Please fill all fields to reset password', '⚠️');
        return;
      }

      const res = await state.resetResidentPassword(phone, flatNo, newPassword);
      if (res.success) {
        showToast(res.message || 'Password reset successfully!', '✅');
        showResidentLogin();
        const loginPhone = document.getElementById('res-login-phone');
        const loginPass = document.getElementById('res-login-password');
        if (loginPhone) loginPhone.value = phone;
        if (loginPass) { loginPass.value = ''; loginPass.focus(); }
      } else {
        showToast(res.message || 'Password reset failed', '❌');
      }
    });
  }

  // Admin Login
  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pinInput = document.getElementById('admin-login-pin');
      const pin = pinInput ? pinInput.value.trim() : '';
      if (!pin) {
        showToast('Please enter the 4-digit Security PIN', '⚠️');
        return;
      }

      const res = await state.loginAdmin(selectedAuthAdminRole, pin);
      if (res.success) {
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.classList.add('hidden');
        applyRoleUI(selectedAuthAdminRole);
        showToast(`Logged in as ${selectedAuthAdminRole.replace('_', ' ').toUpperCase()}`, '🔓');
      } else {
        showToast(res.message || 'Incorrect Security PIN!', '❌');
        if (pinInput) pinInput.focus();
      }
    });
  }

  // Admin Reset PIN
  const adminResetForm = document.getElementById('admin-reset-form');
  if (adminResetForm) {
    adminResetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const roleSelect = document.getElementById('admin-reset-role-select');
      const recInput = document.getElementById('admin-reset-recovery-code');
      const pinInput = document.getElementById('admin-reset-new-pin');
      const dept = roleSelect ? roleSelect.value : selectedAuthAdminRole;
      const recoveryCode = recInput ? recInput.value.trim() : '';
      const newPin = pinInput ? pinInput.value.trim() : '';

      if (!recoveryCode || !newPin) {
        showToast('Please enter Master Recovery Code and New PIN', '⚠️');
        return;
      }

      const res = await state.resetAdminPin(dept, recoveryCode, newPin);
      if (res.success) {
        showToast(res.message || 'Admin PIN updated successfully!', '✅');
        const loginForm = document.getElementById('admin-login-form');
        if (adminResetForm) adminResetForm.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        const loginPin = document.getElementById('admin-login-pin');
        if (loginPin) { loginPin.value = ''; loginPin.focus(); }
      } else {
        showToast(res.message || 'PIN reset failed', '❌');
      }
    });
  }
}

// ----------------------------------------------------
// App Initialization
// ----------------------------------------------------
async function initApp() {
  // 1. Ensure auth listeners are active immediately
  setupAuthEventListeners();

  // 2. Authentication & Initial Screen Check (instant, no waiting for network)
  if (state.isAuthenticated()) {
    if (elements.authScreen) elements.authScreen.classList.add('hidden');
    applyRoleUI(state.getActiveRole());
  } else {
    if (elements.authScreen) elements.authScreen.classList.remove('hidden');
    applyRoleUI('resident');
  }

  // 3. Setup application event listeners
  setupEventListeners();

  // 4. Populate Local UI from Cache/Memory
  syncResidentUI();
  syncStorePhonesUI();

  if (state.groceryNote && elements.groceryCustomNote) elements.groceryCustomNote.value = state.groceryNote;
  if (state.restaurantNote && elements.restoSpecialNote) elements.restoSpecialNote.value = state.restaurantNote;

  // 5. Render Catalogs & Orders
  renderGroceryCategories();
  renderGroceryItems();
  updateGroceryCartSummary();

  renderRestoCategories();
  renderRestoItems();
  updateRestoCartSummary();

  renderClubHouseAmenities();
  renderResidentOrders();

  // 6. Asynchronously sync with server in background (non-blocking)
  state.syncWithServer().then(() => {
    syncResidentUI();
    syncStorePhonesUI();
    renderGroceryItems();
    renderRestoItems();
  }).catch(err => console.warn('Background sync note:', err));

  // 7. Start background real-time order polling
  state.startOrderPolling(3000);

  // 8. Register Service Worker for PWA installation
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.update().catch(() => {});
    }).catch(() => {});
  }

  // 9. Request browser desktop notification permission on user interaction
  document.addEventListener('click', requestNotificationPermission, { once: true });
}

// Immediately wire auth event listeners so buttons work without delay
setupAuthEventListeners();

// Robust initialization handling (fires even if DOM is already ready)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

