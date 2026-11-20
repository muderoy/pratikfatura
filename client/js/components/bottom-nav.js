/**
 * PRATİKFATURA Mobile Bottom Navigation Component
 */

const BottomNav = {
  render() {
    const user = State.user;
    if (!user || user.role !== 'BUSINESS_USER') return '';

    const currentHash = window.location.hash || '#/pos';

    return `
      <nav class="bottom-nav">
        <a href="#/pos" class="bottom-nav-item ${currentHash === '#/pos' ? 'active' : ''}">
          <span style="font-size: 20px;">⚡</span>
          <span>Hızlı POS</span>
        </a>
        <a href="#/invoices" class="bottom-nav-item ${currentHash.startsWith('#/invoices') ? 'active' : ''}">
          <span style="font-size: 20px;">📑</span>
          <span>Faturalar</span>
        </a>
        <a href="#/customers" class="bottom-nav-item ${currentHash.startsWith('#/customers') ? 'active' : ''}">
          <span style="font-size: 20px;">👥</span>
          <span>Müşteriler</span>
        </a>
        <a href="#/dashboard" class="bottom-nav-item ${currentHash === '#/dashboard' ? 'active' : ''}">
          <span style="font-size: 20px;">📊</span>
          <span>Özet</span>
        </a>
        <a href="#/settings" class="bottom-nav-item ${currentHash.startsWith('#/settings') ? 'active' : ''}">
          <span style="font-size: 20px;">⚙️</span>
          <span>Ayarlar</span>
        </a>
      </nav>
    `;
  }
};

window.BottomNav = BottomNav;
