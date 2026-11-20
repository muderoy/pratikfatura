/**
 * PRATİKFATURA Client API Service
 */

const API = {
  getToken() {
    return localStorage.getItem('pf_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('pf_token', token);
    } else {
      localStorage.removeItem('pf_token');
    }
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers
      });

      // Handle 401 Unauthorized
      if (response.status === 401 && !endpoint.includes('/api/auth/login')) {
        this.setToken(null);
        window.location.hash = '#/login';
        throw new Error('Oturum süreniz doldu. Lütfen tekrar giriş yapınız.');
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'İşlem sırasında bir hata oluştu.');
        }
        return data;
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(text || 'İşlem başarısız.');
        }
        return text;
      }
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  },

  // Auth
  login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  getProfile() {
    return this.request('/api/auth/me');
  },

  changePassword(currentPassword, newPassword) {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  // Invoices
  getInvoices(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/invoices${qs ? '?' + qs : ''}`);
  },

  getInvoiceById(id) {
    return this.request(`/api/invoices/${id}`);
  },

  createInvoice(payload) {
    return this.request('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  previewInvoiceDraft(payload) {
    return this.request('/api/invoices/preview', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  requestGibSms(id) {
    return this.request(`/api/invoices/${id}/request-sms`, {
      method: 'POST'
    });
  },

  verifyGibSms(id, smsCode) {
    return this.request(`/api/invoices/${id}/verify-sms`, {
      method: 'POST',
      body: JSON.stringify({ smsCode })
    });
  },

  cancelInvoice(id, reason) {
    return this.request(`/api/invoices/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // Customers
  getCustomers(q = '') {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.request(`/api/customers${qs}`);
  },

  getCustomerById(id) {
    return this.request(`/api/customers/${id}`);
  },

  createCustomer(payload) {
    return this.request('/api/customers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateCustomer(id, payload) {
    return this.request(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  // Products & Quick Cards
  getProducts(q = '') {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.request(`/api/products${qs}`);
  },

  getQuickCards() {
    return this.request('/api/products/quick-cards');
  },

  createProduct(payload) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateProduct(id, payload) {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  toggleQuickCard(id, isQuickCard, order) {
    return this.request(`/api/products/${id}/toggle-quick`, {
      method: 'POST',
      body: JSON.stringify({ isQuickCard, order })
    });
  },

  // Reports & Dashboard
  getDashboardSummary() {
    return this.request('/api/reports/summary');
  },

  getFullReport(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/reports/full${qs ? '?' + qs : ''}`);
  },

  // Settings
  getCompanySettings() {
    return this.request('/api/settings/company');
  },

  updateCompanySettings(payload) {
    return this.request('/api/settings/company', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  getGibSettings() {
    return this.request('/api/settings/gib');
  },

  updateGibSettings(payload) {
    return this.request('/api/settings/gib', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  testGibConnection() {
    return this.request('/api/settings/gib/test-connection', {
      method: 'POST'
    });
  },

  // Admin
  getAdminDashboard() {
    return this.request('/api/admin/dashboard');
  },

  getAdminResellers() {
    return this.request('/api/admin/resellers');
  },

  createAdminReseller(payload) {
    return this.request('/api/admin/resellers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  toggleAdminResellerStatus(id) {
    return this.request(`/api/admin/resellers/${id}/status`, {
      method: 'PATCH'
    });
  },

  deleteAdminReseller(id) {
    return this.request(`/api/admin/resellers/${id}`, {
      method: 'DELETE'
    });
  },

  getAdminTenants() {
    return this.request('/api/admin/tenants');
  },

  toggleAdminTenantStatus(id) {
    return this.request(`/api/admin/tenants/${id}/status`, {
      method: 'PATCH'
    });
  },

  getAdminLogs(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/admin/logs${qs ? '?' + qs : ''}`);
  },

  // Reseller
  getResellerDashboard() {
    return this.request('/api/reseller/dashboard');
  },

  getResellerCustomers() {
    return this.request('/api/reseller/customers');
  },

  createResellerCustomer(payload) {
    return this.request('/api/reseller/customers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  toggleResellerCustomerStatus(id) {
    return this.request(`/api/reseller/customers/${id}/status`, {
      method: 'PATCH'
    });
  },

  getResellerCustomerInvoices(id) {
    return this.request(`/api/reseller/customers/${id}/invoices`);
  }
};

window.API = API;
