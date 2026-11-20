/**
 * PRATİKFATURA Global Reactive State
 */

const State = {
  user: null,
  tenant: null,
  currentRoute: '',
  selectedCustomer: null,
  cartItems: [],
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this); } catch (e) { console.error('State listener error:', e); }
    });
  },

  setUser(user, tenant) {
    this.user = user;
    this.tenant = tenant;
    this.notify();
  },

  setSelectedCustomer(customer) {
    this.selectedCustomer = customer;
    this.notify();
  },

  addCartItem(item) {
    this.cartItems.push({
      id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: item.name,
      quantity: Number(item.quantity) || 1,
      unit: item.unit || 'Adet',
      unitPrice: Number(item.unitPrice) || 0,
      isVatInclusive: Boolean(item.isVatInclusive),
      vatRate: Number(item.vatRate) || 20,
      discountRate: Number(item.discountRate) || 0,
      discountAmount: Number(item.discountAmount) || 0
    });
    this.notify();
  },

  removeCartItem(index) {
    this.cartItems.splice(index, 1);
    this.notify();
  },

  clearCart() {
    this.cartItems = [];
    this.selectedCustomer = null;
    this.notify();
  },

  // Calculate live totals on frontend (for immediate visual feedback before submit)
  getCartTotals() {
    let subtotal = 0;
    let vatTotal = 0;
    let grandTotal = 0;

    for (const it of this.cartItems) {
      const qty = it.quantity || 1;
      const price = it.unitPrice || 0;
      const rate = it.vatRate || 0;

      if (it.isVatInclusive) {
        const lineTot = Math.round(qty * price * 100) / 100;
        const matrah = Math.round((lineTot / (1 + rate / 100)) * 100) / 100;
        const vat = Math.round((lineTot - matrah) * 100) / 100;
        subtotal += matrah;
        vatTotal += vat;
        grandTotal += lineTot;
      } else {
        const matrah = Math.round(qty * price * 100) / 100;
        const vat = Math.round(matrah * (rate / 100) * 100) / 100;
        const lineTot = Math.round((matrah + vat) * 100) / 100;
        subtotal += matrah;
        vatTotal += vat;
        grandTotal += lineTot;
      }
    }

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      vatTotal: Math.round(vatTotal * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100
    };
  },

  formatCurrency(val, currency = 'TRY') {
    const symbol = currency === 'TRY' ? '₺' : currency;
    const num = Number(val) || 0;
    return `${num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }
};

window.State = State;
