// State management for Raheja Resident & Admin App

import { DEFAULT_CONFIG } from './data.js';

const STORAGE_KEYS = {
  RESIDENT: 'raheja_resident_profile',
  ACTIVE_ROLE: 'raheja_active_role', // 'resident' | 'grocery_admin' | 'restaurant_admin' | 'club_admin'
  STORE_PHONES: 'raheja_store_phones',
  GROCERY_CART: 'raheja_grocery_cart',
  GROCERY_NOTE: 'raheja_grocery_note',
  RESTAURANT_CART: 'raheja_restaurant_cart',
  RESTAURANT_NOTE: 'raheja_restaurant_note'
};

class AppState {
  constructor() {
    this.init();
  }

  init() {
    // 1. Resident Profile & Current Auth User
    const savedResident = localStorage.getItem(STORAGE_KEYS.RESIDENT);
    this.resident = savedResident ? JSON.parse(savedResident) : null;
    const savedUser = localStorage.getItem('raheja_auth_user');
    this.currentUser = savedUser ? JSON.parse(savedUser) : (this.resident || null);

    // 2. Active Role (null when logged out)
    this.activeRole = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) || null;

    // 3. Store Phone numbers
    const savedPhones = localStorage.getItem(STORAGE_KEYS.STORE_PHONES);
    this.storePhones = savedPhones ? JSON.parse(savedPhones) : {
      grocery: DEFAULT_CONFIG.defaultGroceryPhone,
      restaurant: DEFAULT_CONFIG.defaultRestaurantPhone,
      clubHouse: DEFAULT_CONFIG.defaultClubHousePhone
    };

    // 4. Cart States
    this.groceryCart = this._loadJSON(STORAGE_KEYS.GROCERY_CART, {});
    this.groceryNote = localStorage.getItem(STORAGE_KEYS.GROCERY_NOTE) || '';
    this.customGroceryItems = this._loadJSON('raheja_custom_grocery', []);
    this.restaurantCart = this._loadJSON(STORAGE_KEYS.RESTAURANT_CART, {});
    this.restaurantNote = localStorage.getItem(STORAGE_KEYS.RESTAURANT_NOTE) || '';
    this.customRestoItems = this._loadJSON('raheja_custom_resto', []);

    // 5. Server Synchronized Data (Catalog, Orders, Amenities)
    this.groceryItems = [];
    this.restaurantItems = [];
    this.clubAmenities = [];
    this.orders = [];
    this.adminPins = {
      grocery: '1111',
      restaurant: '2222',
      club: '3333'
    };

    this._pollTimer = null;
    this.listeners = [];
  }

  _loadJSON(key, defaultVal) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event, data) {
    this.listeners.forEach(cb => cb(event, data));
  }

  // Sync with Server API
  async syncWithServer() {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        this.groceryItems = data.groceryItems || [];
        this.restaurantItems = data.restaurantItems || [];
        this.clubAmenities = data.clubAmenities || [];
        this.orders = data.orders || [];
        if (data.adminPins) this.adminPins = data.adminPins;
        if (data.config) {
          this.storePhones = {
            grocery: data.config.groceryPhone || this.storePhones.grocery,
            restaurant: data.config.restaurantPhone || this.storePhones.restaurant,
            clubHouse: data.config.clubHousePhone || this.storePhones.clubHouse
          };
        }
        if (data.residents && (this.resident || (this.currentUser && this.activeRole === 'resident'))) {
          const myId = (this.resident && this.resident.id) || (this.currentUser && this.currentUser.id);
          const myPhone = (this.resident && this.resident.phone) || (this.currentUser && this.currentUser.phone);
          const match = data.residents.find(r => (myId && r.id === myId) || (myPhone && r.phone === myPhone));
          if (match) {
            this.resident = { ...(this.resident || {}), ...match };
            if (this.currentUser && this.activeRole === 'resident') {
              this.currentUser = { ...this.currentUser, ...match };
              localStorage.setItem('raheja_auth_user', JSON.stringify(this.currentUser));
            }
            localStorage.setItem(STORAGE_KEYS.RESIDENT, JSON.stringify(this.resident));
            this.notify('resident:updated', this.resident);
          }
        }
        this.notify('server:synced', data);
        return true;
      }
    } catch (e) {
      console.warn('Could not sync with /api/data, using memory state:', e);
    }
    return false;
  }

  // Active Role Management
  setActiveRole(role) {
    this.activeRole = role;
    if (role) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
    }
    this.notify('role:changed', role);
  }

  getActiveRole() {
    return this.activeRole;
  }

  isAuthenticated() {
    return !!(this.activeRole && (this.activeRole !== 'resident' || this.resident || this.currentUser));
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async loginResident(phone, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleType: 'resident', phone, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.currentUser = data.user;
        this.resident = data.user;
        this.activeRole = 'resident';
        localStorage.setItem('raheja_auth_user', JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEYS.RESIDENT, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, 'resident');
        this.notify('auth:login', { role: 'resident', user: data.user });
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async registerResident(residentData) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(residentData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.currentUser = data.user;
        this.resident = data.user;
        this.activeRole = 'resident';
        localStorage.setItem('raheja_auth_user', JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEYS.RESIDENT, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, 'resident');
        this.notify('auth:register', { role: 'resident', user: data.user });
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async resetResidentPassword(phone, flatNo, newPassword) {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleType: 'resident', phone, flatNo, newPassword })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async loginAdmin(adminRole, pin) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleType: 'admin', adminRole, pin })
      });
      const data = await res.json();
      if (data.success) {
        this.activeRole = adminRole;
        this.currentUser = { role: adminRole, name: data.user?.name || adminRole };
        localStorage.setItem('raheja_auth_user', JSON.stringify(this.currentUser));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, adminRole);
        this.notify('auth:login', { role: adminRole, user: this.currentUser });
        return { success: true, role: adminRole };
      }
      return { success: false, message: data.message || 'Incorrect PIN' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async resetAdminPin(adminRole, recoveryCode, newPin) {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleType: 'admin', adminRole, recoveryCode, newPassword: newPin })
      });
      const data = await res.json();
      if (data.success) {
        const roleKey = adminRole === 'grocery_admin' ? 'grocery' :
                        adminRole === 'restaurant_admin' ? 'restaurant' : 'club';
        this.adminPins[roleKey] = newPin;
      }
      return data;
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  logout() {
    this.activeRole = null;
    this.currentUser = null;
    localStorage.removeItem('raheja_auth_user');
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
    this.notify('auth:logout', null);
  }

  verifyAdminPin(role, pin) {
    const targetRoleKey = role === 'grocery_admin' ? 'grocery' :
                          role === 'restaurant_admin' ? 'restaurant' :
                          role === 'club_admin' ? 'club' : '';
    const validPin = this.adminPins[targetRoleKey] || '1234';
    return (pin || '').trim() === validPin;
  }

  // Resident Profile Methods
  async saveResidentProfile(profile) {
    const currentId = (this.resident && this.resident.id) || (this.currentUser && this.currentUser.id);
    const currentPhone = (this.resident && this.resident.phone) || (this.currentUser && this.currentUser.phone);

    const cleanNewPhone = profile.phone ? String(profile.phone).replace(/[^0-9]/g, '') : (currentPhone || '');

    const updatedProfile = {
      ...(this.resident || {}),
      societyName: (profile.societyName !== undefined ? profile.societyName : (this.resident?.societyName || DEFAULT_CONFIG.societyName)).trim(),
      tower: (profile.tower !== undefined ? profile.tower : (this.resident?.tower || 'Tower A')).trim(),
      flatNo: (profile.flatNo !== undefined ? profile.flatNo : (this.resident?.flatNo || '')).trim(),
      name: (profile.name !== undefined ? profile.name : (this.resident?.name || 'Resident')).trim(),
      phone: cleanNewPhone,
      updatedAt: new Date().toISOString()
    };
    if (currentId) updatedProfile.id = currentId;

    // Persist locally immediately
    this.resident = updatedProfile;
    if (this.currentUser && (this.activeRole === 'resident' || !this.activeRole)) {
      this.currentUser = { ...this.currentUser, ...updatedProfile };
      localStorage.setItem('raheja_auth_user', JSON.stringify(this.currentUser));
    }
    localStorage.setItem(STORAGE_KEYS.RESIDENT, JSON.stringify(this.resident));
    this.notify('resident:updated', this.resident);

    // Call server API to persist profile in backend database
    try {
      const res = await fetch('/api/residents/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentId,
          currentPhone: currentPhone,
          societyName: updatedProfile.societyName,
          tower: updatedProfile.tower,
          flatNo: updatedProfile.flatNo,
          name: updatedProfile.name,
          phone: updatedProfile.phone
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.resident = { ...data.user };
        if (this.currentUser && (this.activeRole === 'resident' || !this.activeRole)) {
          this.currentUser = { ...data.user };
          localStorage.setItem('raheja_auth_user', JSON.stringify(this.currentUser));
        }
        localStorage.setItem(STORAGE_KEYS.RESIDENT, JSON.stringify(this.resident));
        this.notify('resident:updated', this.resident);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || 'Failed to update profile on server' };
      }
    } catch (err) {
      console.warn('Could not persist profile to server:', err);
      return { success: true, user: this.resident, offline: true };
    }
  }

  getResidentProfile() {
    return this.resident;
  }

  hasCompletedOnboarding() {
    return !!(this.resident && this.resident.flatNo && this.resident.tower);
  }

  // Respective Store Phone Management
  async updateStorePhone(role, phone) {
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    if (role === 'grocery_admin') {
      this.storePhones.grocery = cleanPhone;
    } else if (role === 'restaurant_admin') {
      this.storePhones.restaurant = cleanPhone;
    } else if (role === 'club_admin') {
      this.storePhones.clubHouse = cleanPhone;
    }
    localStorage.setItem(STORAGE_KEYS.STORE_PHONES, JSON.stringify(this.storePhones));
    this.notify('store_phones:updated', this.storePhones);

    try {
      const res = await fetch('/api/config/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, phone: cleanPhone })
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.warn('Could not persist phone to server:', err);
      return true;
    }
  }

  // Grocery Cart
  setGroceryQty(itemId, qty) {
    if (qty <= 0) {
      delete this.groceryCart[itemId];
    } else {
      this.groceryCart[itemId] = qty;
    }
    localStorage.setItem(STORAGE_KEYS.GROCERY_CART, JSON.stringify(this.groceryCart));
    this.notify('grocery_cart:updated', this.groceryCart);
  }

  getGroceryQty(itemId) {
    return this.groceryCart[itemId] || 0;
  }

  setGroceryNote(note) {
    this.groceryNote = note;
    localStorage.setItem(STORAGE_KEYS.GROCERY_NOTE, note);
  }

  clearGroceryCart() {
    this.groceryCart = {};
    this.groceryNote = '';
    this.clearCustomGroceryItems();
    localStorage.removeItem(STORAGE_KEYS.GROCERY_CART);
    localStorage.removeItem(STORAGE_KEYS.GROCERY_NOTE);
    this.notify('grocery_cart:updated', this.groceryCart);
  }

  // Custom Unlisted Grocery Items
  addCustomGroceryItem(name, qty = 1) {
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    const existing = this.customGroceryItems.find(i => i.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      existing.quantity += Number(qty) || 1;
    } else {
      this.customGroceryItems.push({
        id: 'cg_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        name: cleanName,
        quantity: Math.max(1, Number(qty) || 1),
        price: null,
        pack: 'Custom / Unlisted'
      });
    }
    localStorage.setItem('raheja_custom_grocery', JSON.stringify(this.customGroceryItems));
    this.notify('grocery_cart:updated', this.groceryCart);
  }

  removeCustomGroceryItem(id) {
    this.customGroceryItems = this.customGroceryItems.filter(i => i.id !== id);
    localStorage.setItem('raheja_custom_grocery', JSON.stringify(this.customGroceryItems));
    this.notify('grocery_cart:updated', this.groceryCart);
  }

  clearCustomGroceryItems() {
    this.customGroceryItems = [];
    localStorage.removeItem('raheja_custom_grocery');
  }

  // Restaurant Cart
  setRestaurantQty(itemId, qty) {
    if (qty <= 0) {
      delete this.restaurantCart[itemId];
    } else {
      this.restaurantCart[itemId] = qty;
    }
    localStorage.setItem(STORAGE_KEYS.RESTAURANT_CART, JSON.stringify(this.restaurantCart));
    this.notify('restaurant_cart:updated', this.restaurantCart);
  }

  getRestaurantQty(itemId) {
    return this.restaurantCart[itemId] || 0;
  }

  setRestaurantNote(note) {
    this.restaurantNote = note;
    localStorage.setItem(STORAGE_KEYS.RESTAURANT_NOTE, note);
  }

  clearRestaurantCart() {
    this.restaurantCart = {};
    this.restaurantNote = '';
    this.clearCustomRestoItems();
    localStorage.removeItem(STORAGE_KEYS.RESTAURANT_CART);
    localStorage.removeItem(STORAGE_KEYS.RESTAURANT_NOTE);
    this.notify('restaurant_cart:updated', this.restaurantCart);
  }

  // Custom Unlisted Restaurant Items
  addCustomRestoItem(name, qty = 1) {
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    const existing = this.customRestoItems.find(i => i.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      existing.quantity += Number(qty) || 1;
    } else {
      this.customRestoItems.push({
        id: 'cr_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        name: cleanName,
        quantity: Math.max(1, Number(qty) || 1),
        price: null,
        isVeg: true,
        desc: 'Special Request'
      });
    }
    localStorage.setItem('raheja_custom_resto', JSON.stringify(this.customRestoItems));
    this.notify('restaurant_cart:updated', this.restaurantCart);
  }

  removeCustomRestoItem(id) {
    this.customRestoItems = this.customRestoItems.filter(i => i.id !== id);
    localStorage.setItem('raheja_custom_resto', JSON.stringify(this.customRestoItems));
    this.notify('restaurant_cart:updated', this.restaurantCart);
  }

  clearCustomRestoItems() {
    this.customRestoItems = [];
    localStorage.removeItem('raheja_custom_resto');
  }

  // Order Operations (Create with Server Delivery PIN & Verify)
  async placeOrder(orderData) {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.order) {
          this.orders.unshift(json.order);
          this.notify('orders:new', json.order);
          this.notify('orders:updated', this.orders);
          return json.order;
        }
      }
    } catch (e) {
      console.warn('API call failed, generating local order fallback:', e);
    }

    // Local fallback
    const now = new Date();
    const getOrderDateKey = (isoStr) => {
      try {
        return new Date(isoStr).toLocaleDateString('en-CA');
      } catch {
        return new Date(isoStr).toISOString().slice(0, 10);
      }
    };
    const todayKey = getOrderDateKey(now);
    const ordersToday = (this.orders || []).filter(o => getOrderDateKey(o.createdAt) === todayKey);
    const dailySerialNo = ordersToday.length + 1;

    const fallbackPin = Math.floor(1000 + Math.random() * 9000).toString();
    const localOrder = {
      id: 'ORD-' + Date.now().toString().slice(-6),
      type: orderData.type,
      items: orderData.items,
      customNote: orderData.customNote || '',
      totalAmount: orderData.totalAmount || 0,
      resident: orderData.resident || {},
      deliveryPin: fallbackPin,
      dailySerialNo: dailySerialNo,
      status: 'pending',
      createdAt: now.toISOString()
    };
    this.orders.unshift(localOrder);
    this.notify('orders:new', localOrder);
    this.notify('orders:updated', this.orders);
    return localOrder;
  }

  async verifyDeliveryPin(orderId, pin) {
    try {
      const res = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, pin })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const idx = this.orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
          const oldStatus = this.orders[idx].status;
          this.orders[idx].status = 'completed';
          this.orders[idx].completedAt = new Date().toISOString();
          this.notify('orders:status_changed', { order: this.orders[idx], oldStatus, newStatus: 'completed' });
        }
        this.notify('orders:updated', this.orders);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Incorrect PIN' };
      }
    } catch (e) {
      // Local fallback verify
      const order = this.orders.find(o => o.id === orderId);
      if (order && order.deliveryPin === pin.trim()) {
        const oldStatus = order.status;
        order.status = 'completed';
        order.completedAt = new Date().toISOString();
        this.notify('orders:status_changed', { order, oldStatus, newStatus: 'completed' });
        this.notify('orders:updated', this.orders);
        return { success: true, message: 'Delivery PIN verified!' };
      }
      return { success: false, message: 'Incorrect PIN! Ask resident for code.' };
    }
  }

  // Real-time Background Order Polling & Event Detection
  startOrderPolling(intervalMs = 3000) {
    if (this._pollTimer) return;
    this._pollTimer = setInterval(() => {
      this.pollOrders();
    }, intervalMs);
  }

  stopOrderPolling() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  }

  async pollOrders() {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) return;
      const freshOrders = await res.json();
      if (!Array.isArray(freshOrders)) return;

      const oldOrdersMap = new Map((this.orders || []).map(o => [o.id, o]));
      const newOrders = [];
      const statusChanges = [];

      for (const fresh of freshOrders) {
        const old = oldOrdersMap.get(fresh.id);
        if (!old) {
          newOrders.push(fresh);
        } else if (old.status !== fresh.status) {
          statusChanges.push({ order: fresh, oldStatus: old.status, newStatus: fresh.status });
        }
      }

      this.orders = freshOrders;

      if (newOrders.length > 0) {
        newOrders.forEach(order => {
          this.notify('orders:new', order);
        });
      }

      if (statusChanges.length > 0) {
        statusChanges.forEach(change => {
          this.notify('orders:status_changed', change);
        });
      }

      if (newOrders.length > 0 || statusChanges.length > 0) {
        this.notify('orders:updated', this.orders);
      }
    } catch (e) {
      // Transient network or offline state
    }
  }

  // Admin Catalog CRUD
  async addGroceryItem(itemData) {
    const res = await fetch('/api/items/grocery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (res.ok) {
      const { item } = await res.json();
      this.groceryItems.unshift(item);
      this.notify('grocery_catalog:updated', this.groceryItems);
      return item;
    }
  }

  async updateGroceryItem(id, itemData) {
    const res = await fetch(`/api/items/grocery/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (res.ok) {
      const { item } = await res.json();
      const idx = this.groceryItems.findIndex(i => i.id === id);
      if (idx !== -1) this.groceryItems[idx] = item;
      this.notify('grocery_catalog:updated', this.groceryItems);
      return item;
    }
  }

  async deleteGroceryItem(id) {
    const res = await fetch(`/api/items/grocery/${id}`, { method: 'DELETE' });
    if (res.ok) {
      this.groceryItems = this.groceryItems.filter(i => i.id !== id);
      this.notify('grocery_catalog:updated', this.groceryItems);
      return true;
    }
  }

  async addRestaurantItem(itemData) {
    const res = await fetch('/api/items/restaurant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (res.ok) {
      const { item } = await res.json();
      this.restaurantItems.unshift(item);
      this.notify('resto_catalog:updated', this.restaurantItems);
      return item;
    }
  }

  async updateRestaurantItem(id, itemData) {
    const res = await fetch(`/api/items/restaurant/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (res.ok) {
      const { item } = await res.json();
      const idx = this.restaurantItems.findIndex(i => i.id === id);
      if (idx !== -1) this.restaurantItems[idx] = item;
      this.notify('resto_catalog:updated', this.restaurantItems);
      return item;
    }
  }

  async deleteRestaurantItem(id) {
    const res = await fetch(`/api/items/restaurant/${id}`, { method: 'DELETE' });
    if (res.ok) {
      this.restaurantItems = this.restaurantItems.filter(i => i.id !== id);
      this.notify('resto_catalog:updated', this.restaurantItems);
      return true;
    }
  }
}

export const state = new AppState();
