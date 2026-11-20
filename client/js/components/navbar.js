/**
 * PRATİKFATURA Top Navigation Bar Component
 */

const Navbar = {
  render() {
    const user = State.user;
    const tenant = State.tenant;

    if (!user) return '';

    let roleBadge = '';
    if (user.role === 'ADMIN') {
      roleBadge = '<span class="badge badge-danger">SİSTEM YÖNETİCİSİ</span>';
    } else if (user.role === 'RESELLER') {
      roleBadge = '<span class="badge badge-warning">BAYİ (RESELLER)</span>';
    } else {
      roleBadge = `<span class="badge badge-info">${tenant?.name || 'İŞLETME'}</span>`;
    }

    return `
      <header class="top-navbar">
        <div class="brand-badge">
          <div class="brand-logo-icon">PF</div>
          <div>
            <div class="brand-text">PRATİKFATURA</div>
            <div class="brand-subtext">${user.role === 'BUSINESS_USER' ? 'Hızlı e-Arşiv POS' : 'Yönetim Portalı'}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px;">
          ${roleBadge}
          <div style="text-align: right; font-size: 13px;" class="hidden-mobile">
            <div style="font-weight: 700; color: #0f172a;">${user.name}</div>
            <div style="color: #64748b; font-size: 11px;">${user.email}</div>
          </div>
          <button id="btn-logout" class="btn btn-outline btn-sm" title="Çıkış Yap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span class="hidden-mobile">Çıkış</span>
          </button>
        </div>
      </header>
    `;
  },

  bindEvents() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        API.setToken(null);
        State.setUser(null, null);
        window.location.hash = '#/login';
        Toast.info('Güvenli çıkış yapıldı.');
      });
    }
  }
};

window.Navbar = Navbar;
