/**
 * KESFATURA.COM Multi-Role Secure Login View
 */

const LoginView = {
  render() {
    return `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 20px;">
        <div style="max-width: 440px; width: 100%; background: #ffffff; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25); overflow: hidden;">
          <div style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #f1f5f9;">
            <div style="width: 58px; height: 58px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); color: #fff; border-radius: 16px; margin: 0 auto 14px auto; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);">
              ⚡
            </div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.5px;">
              KES<span style="color: #2563eb;">FATURA</span><span style="font-size: 14px; color: #059669; font-weight: 700;">.COM</span>
            </h1>
            <p style="font-size: 13px; color: #64748b; margin-top: 2px;">Yeni Nesil Hızlı e-Arşiv Fatura Portalı</p>
          </div>

          <form id="form-login" style="padding: 24px 32px 32px 32px;">
            <div class="form-group">
              <label class="form-label">E-Posta Adresi</label>
              <input type="email" id="login-email" name="email" class="form-input" placeholder="ad@sirketiniz.com" required autofocus>
            </div>

            <div class="form-group">
              <label class="form-label">Giriş Parolası</label>
              <input type="password" id="login-password" name="password" class="form-input" placeholder="••••••••" required>
            </div>

            <button type="submit" id="btn-login-submit" class="btn btn-primary btn-block" style="padding: 12px; font-size: 15px; margin-top: 8px;">
              Güvenli Giriş Yap
            </button>

            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px dashed #e2e8f0;">
              <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; text-align: center;">
                Hızlı Test Girişleri
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button type="button" class="btn btn-outline btn-sm quick-demo-btn" data-email="ahmet@oznakliyat.com" data-pass="Nakliye123!" style="justify-content: flex-start;">
                  🚚 <strong>İşletme:</strong> Öz Nakliyat Lojistik
                </button>
                <button type="button" class="btn btn-outline btn-sm quick-demo-btn" data-email="reseller@pratikfatura.com" data-pass="Reseller123!" style="justify-content: flex-start;">
                  🤝 <strong>Bayi:</strong> Marmara Bilişim Reseller
                </button>
                <button type="button" class="btn btn-outline btn-sm quick-demo-btn" data-email="admin@pratikfatura.com" data-pass="AdminPratik2026*!" style="justify-content: flex-start;">
                  👑 <strong>Yönetici:</strong> Sistem Admin
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const form = document.getElementById('form-login');
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('btn-login-submit');

    // Quick demo accounts
    document.querySelectorAll('.quick-demo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        emailInput.value = btn.dataset.email;
        passInput.value = btn.dataset.pass;
        submitBtn.click();
      });
    });

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Doğrulanıyor...';

        try {
          const res = await API.login(emailInput.value, passInput.value);
          API.setToken(res.token);
          State.setUser(res.user, res.tenant);
          Toast.success(`Hoş geldiniz, ${res.user.name}`);

          // Role-based routing
          if (res.user.role === 'ADMIN') {
            window.location.hash = '#/admin';
          } else if (res.user.role === 'RESELLER') {
            window.location.hash = '#/reseller';
          } else {
            window.location.hash = '#/pos';
          }
        } catch (err) {
          Toast.error(err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Güvenli Giriş Yap';
        }
      });
    }
  }
};

window.LoginView = LoginView;
