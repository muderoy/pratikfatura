/**
 * PRATİKFATURA Desktop Sidebar Navigation Component
 */

const Sidebar = {
  render() {
    const user = State.user;
    if (!user) return '';

    const currentHash = window.location.hash || (user.role === 'BUSINESS_USER' ? '#/pos' : '#/dashboard');

    let menuItems = [];

    if (user.role === 'BUSINESS_USER') {
      menuItems = [
        { hash: '#/pos', label: '⚡ Hızlı Fatura', icon: '⚡', highlight: true },
        { hash: '#/dashboard', label: '📊 Dashboard', icon: '📊' },
        { hash: '#/detailed-invoice', label: '📝 Detaylı Fatura Kes', icon: '📝' },
        { hash: '#/invoices', label: '📑 Faturalarım', icon: '📑' },
        { hash: '#/customers', label: '👥 Müşterilerim', icon: '👥' },
        { hash: '#/products', label: '📦 Hizmet ve Kartlar', icon: '📦' },
        { hash: '#/reports', label: '📈 Satış & KDV Raporu', icon: '📈' },
        { hash: '#/settings', label: '⚙️ Firma Bilgileri & GİB', icon: '⚙️' }
      ];
    } else if (user.role === 'RESELLER') {
      menuItems = [
        { hash: '#/reseller', label: '📊 Bayi Özeti', icon: '📊' },
        { hash: '#/reseller-customers', label: '🏢 Müşteri İşletmelerim', icon: '🏢' },
        { hash: '#/reseller-new-customer', label: '➕ Yeni Müşteri Tanımla', icon: '➕' }
      ];
    } else if (user.role === 'ADMIN') {
      menuItems = [
        { hash: '#/admin', label: '📊 Sistem Genel Bakış', icon: '📊' },
        { hash: '#/admin-resellers', label: '🤝 Bayi (Reseller) Yönetimi', icon: '🤝' },
        { hash: '#/admin-tenants', label: '🏢 Tüm İşletmeler', icon: '🏢' },
        { hash: '#/admin-logs', label: '🛡️ Güvenlik ve Sistem Logları', icon: '🛡️' }
      ];
    }

    const itemsHtml = menuItems.map(item => {
      const isActive = (item.hash === '#/admin' || item.hash === '#/reseller')
        ? currentHash === item.hash
        : currentHash.startsWith(item.hash);
      const classes = ['nav-link'];
      if (item.highlight) classes.push('highlight');
      if (isActive && !item.highlight) classes.push('active');

      return `
        <a href="${item.hash}" class="${classes.join(' ')}">
          <span style="font-size: 16px;">${item.icon}</span>
          <span>${item.label}</span>
        </a>
      `;
    }).join('');

    return `
      <aside class="layout-sidebar">
        <div class="sidebar-header">
          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">
            MENÜ
          </div>
        </div>
        <nav class="sidebar-nav">
          ${itemsHtml}
        </nav>
        <div style="padding: 16px; border-top: 1px solid var(--border); font-size: 11px; color: #94a3b8; text-align: center;">
          PRATİKFATURA v1.0.0<br>GİB e-Arşiv Uyumlu
        </div>
      </aside>
    `;
  }
};

window.Sidebar = Sidebar;
