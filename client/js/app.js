/**
 * PRATİKFATURA Single Page Application (SPA) Bootstrapper
 */

const App = {
  async init() {
    // 1. Verify user session if token exists
    const token = API.getToken();
    if (token) {
      try {
        const res = await API.getProfile();
        State.setUser(res.user, res.tenant);
      } catch (e) {
        API.setToken(null);
        State.setUser(null, null);
      }
    }

    // 2. Hash Change Listener
    window.addEventListener('hashchange', () => this.render());

    // 3. Default route resolution
    if (!API.getToken() || !State.user) {
      window.location.hash = '#/login';
    } else if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
      if (State.user.role === 'ADMIN') {
        window.location.hash = '#/admin';
      } else if (State.user.role === 'RESELLER') {
        window.location.hash = '#/reseller';
      } else {
        // DEFAULT IS HIZLI FATURA (POS)
        window.location.hash = '#/pos';
      }
    }

    // 4. Initial Render
    await this.render();
  },

  async render() {
    const root = document.getElementById('app');
    const hash = window.location.hash || '#/login';

    // If not logged in, enforce login view
    if (!State.user && hash !== '#/login') {
      window.location.hash = '#/login';
      return;
    }

    if (hash === '#/login') {
      root.innerHTML = LoginView.render();
      LoginView.bindEvents();
      return;
    }

    // Determine target view
    let view = QuickInvoiceView;
    let viewName = 'QuickInvoiceView';

    if (hash.startsWith('#/pos')) {
      view = QuickInvoiceView;
      viewName = 'QuickInvoiceView';
    } else if (hash.startsWith('#/detailed-invoice')) {
      view = DetailedInvoiceView;
      viewName = 'DetailedInvoiceView';
    } else if (hash.startsWith('#/invoices')) {
      view = InvoiceListView;
      viewName = 'InvoiceListView';
    } else if (hash.startsWith('#/customers')) {
      view = CustomersView;
      viewName = 'CustomersView';
    } else if (hash.startsWith('#/products')) {
      view = ProductsView;
      viewName = 'ProductsView';
    } else if (hash.startsWith('#/dashboard')) {
      view = DashboardView;
      viewName = 'DashboardView';
    } else if (hash.startsWith('#/reports')) {
      view = ReportsView;
      viewName = 'ReportsView';
    } else if (hash.startsWith('#/settings')) {
      view = SettingsView;
      viewName = 'SettingsView';
    } else if (hash.startsWith('#/admin')) {
      if (State.user.role !== 'ADMIN') {
        window.location.hash = '#/pos';
        return;
      }
      view = AdminView;
      viewName = 'AdminView';
      if (hash.includes('resellers')) AdminView.activeTab = 'resellers';
      else if (hash.includes('tenants')) AdminView.activeTab = 'tenants';
      else if (hash.includes('logs')) AdminView.activeTab = 'logs';
      else AdminView.activeTab = 'stats';
    } else if (hash.startsWith('#/reseller')) {
      if (State.user.role !== 'RESELLER' && State.user.role !== 'ADMIN') {
        window.location.hash = '#/pos';
        return;
      }
      view = ResellerView;
      viewName = 'ResellerView';
    }

    // Render App Layout
    const sidebarHtml = Sidebar.render();
    const navbarHtml = Navbar.render();
    const bottomNavHtml = BottomNav.render();
    const contentHtml = await view.render();

    root.innerHTML = `
      ${sidebarHtml}
      <div class="layout-main">
        ${navbarHtml}
        <main id="main-content">
          ${contentHtml}
        </main>
      </div>
      ${bottomNavHtml}
    `;

    // Bind event handlers
    Navbar.bindEvents();
    if (view.bindEvents) {
      await view.bindEvents();
    }
  }
};

window.App = App;

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
