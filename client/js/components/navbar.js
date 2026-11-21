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
          <div class="brand-logo-icon" style="background: linear-gradient(135deg, #059669 0%, #2563eb 100%);">⚡</div>
          <div>
            <div class="brand-text">Kes Fatura</div>
            <div class="brand-subtext">Hızlı E-Arşiv</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="text-align: right; font-size: 14px; font-weight: 700; color: #f1f5f9;">
            ${user.name}
          </div>
          <button id="btn-logout" class="btn btn-outline btn-sm" title="Çıkış Yap" style="border-color: #334155; color: #94a3b8;">
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
