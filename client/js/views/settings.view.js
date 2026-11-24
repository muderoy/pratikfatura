/**
 * PRATİKFATURA Firma Bilgileri, GİB Entegrasyon & Ayarlar Görünümü
 */

const SettingsView = {
  company: null,
  gib: null,

  async render() {
    try {
      const compRes = await API.getCompanySettings();
      this.company = compRes.company || {};
      const gibRes = await API.getGibSettings();
      this.gib = gibRes.gib || {};
    } catch (e) {
      console.error(e);
    }

    const c = this.company || {};
    const g = this.gib || {};

    let gibStatusBadge = '';
    if (g.lastTestStatus === 'SUCCESS') {
      gibStatusBadge = '<span class="badge badge-success">✓ BAĞLANTI BAŞARILI</span>';
    } else if (g.lastTestStatus === 'FAILED') {
      gibStatusBadge = '<span class="badge badge-danger">✕ BAĞLANTI HATASI</span>';
    } else {
      gibStatusBadge = '<span class="badge badge-warning">TEST EDİLMEDİ</span>';
    }

    return `
      <div class="content-area">
        <div style="margin-bottom: 24px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #f8fafc;">⚙️ Ayarlar ve Entegrasyon</h1>
          <p style="font-size: 13px; color: #94a3b8;">Firma bilgileri, resmî e-Arşiv portal erişim anahtarları ve yazdırma tercihleri.</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- 1. Firma Bilgileri Formu -->
          <div class="card">
            <div class="card-title">🏢 Firma / İşletme Bilgileri</div>
            <form id="form-company-settings">
              <div class="form-group">
                <label class="form-label">Firma Resmî Unvanı *</label>
                <input type="text" name="name" class="form-input" value="${c.name || ''}" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">VKN / TCKN *</label>
                  <input type="text" name="taxNumber" class="form-input" value="${c.taxNumber || ''}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Vergi Dairesi</label>
                  <input type="text" name="taxOffice" class="form-input" value="${c.taxOffice || ''}">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Telefon</label>
                  <input type="text" name="phone" class="form-input" value="${c.phone || ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">E-Posta</label>
                  <input type="email" name="email" class="form-input" value="${c.email || ''}">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">İl</label>
                  <input type="text" name="city" class="form-input" value="${c.city || ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">İlçe</label>
                  <input type="text" name="district" class="form-input" value="${c.district || ''}">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Açık Adres</label>
                <textarea name="address" class="form-textarea" rows="2">${c.address || ''}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Banka IBAN Numarası</label>
                <input type="text" id="company-iban-input" name="iban" class="form-input" value="${c.iban || localStorage.getItem('pf_company_iban') || ''}" placeholder="TR00 0000 0000 0000 0000 0000 00">
              </div>

              <div class="form-group" style="margin-top: -4px; margin-bottom: 20px;">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none;">
                  <input type="checkbox" id="check-include-iban" name="includeIbanInNotes" value="1" ${(c.includeIbanInNotes || localStorage.getItem('pf_include_iban_in_notes') === '1') ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer;">
                  <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">IBAN fatura açıklamasına eklensin</span>
                </label>
                <div style="font-size: 11px; color: #94a3b8; margin-left: 28px; margin-top: 3px;">
                  İşaretlendiğinde, fatura oluştururken açıklama / not alanına banka IBAN bilginiz otomatik olarak eklenir.
                </div>
              </div>

              <button type="submit" class="btn btn-primary btn-block">
                Firma Bilgilerini Kaydet
              </button>
            </form>
          </div>

          <!-- 2. GİB e-Arşiv Entegrasyon Ayarları (AES-256-GCM Şifrelenmiş) -->
          <div>
            <div class="card" style="border-top: 4px solid #1e3a8a;">
              <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                <span>🛡️ GİB e-Arşiv Portal Entegrasyonu</span>
                ${gibStatusBadge}
              </div>

              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 12px; color: #475569;">
                Gelir İdaresi Başkanlığı İnteraktif Vergi Dairesi / e-Arşiv Fatura Portalı kullanıcı kodu ve parolanız <strong>AES-256-GCM</strong> algoritması ile şifrelenerek saklanır.
              </div>

              <form id="form-gib-settings">
                <div class="form-group">
                  <label class="form-label">GİB Portal Kullanıcı Kodu *</label>
                  <input type="text" name="gibUsername" class="form-input" value="${g.maskedUsername || ''}" placeholder="GİB Kullanıcı Kodu" required>
                  ${g.isConfigured ? `<div style="font-size: 11px; color: #10b981; margin-top: 4px;">✓ Kayıtlı: ${g.maskedUsername}</div>` : ''}
                </div>

                <div class="form-group">
                  <label class="form-label">GİB Portal Parolası *</label>
                  <input type="password" name="gibPassword" class="form-input" placeholder="${g.hasPassword ? '•••••••• (Değiştirmek için yeni şifre yazın)' : 'GİB Şifreniz'}">
                </div>

                <div class="form-group">
                  <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" name="isTestMode" value="1" ${g.isTestMode ? 'checked' : ''}>
                    <div>
                      <span style="font-weight: 700; font-size: 13px;">GİB Test Portalı Modu (Geliştirme / Deneme)</span>
                      <div style="font-size: 11px; color: #64748b;">Açık olduğunda test portalına bağlanır ve gerçek mükellef kayıtlarına dokunmaz.</div>
                    </div>
                  </label>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                  <button type="submit" class="btn btn-primary" style="flex: 1;">
                    Entegrasyon Bilgilerini Kaydet
                  </button>
                  <button type="button" id="btn-test-gib" class="btn btn-outline" style="white-space: nowrap;">
                    🔌 Bağlantıyı Test Et
                  </button>
                </div>
              </form>
            </div>

            <!-- Parola Değiştirme -->
            <div class="card" style="margin-top: 24px;">
              <div class="card-title">🔐 PratikFatura Panel Şifremi Değiştir</div>
              <form id="form-change-password">
                <div class="form-group">
                  <label class="form-label">Mevcut Şifre</label>
                  <input type="password" name="currentPassword" class="form-input" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Yeni Şifre (En az 6 karakter)</label>
                  <input type="password" name="newPassword" class="form-input" required>
                </div>
                <button type="submit" class="btn btn-outline btn-block">Şifreyi Güncelle</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    // 1. Company settings save
    const formComp = document.getElementById('form-company-settings');
    if (formComp) {
      // Checkbox tıklandığında anında kaydet
      const checkIban = document.getElementById('check-include-iban');
      checkIban?.addEventListener('change', () => {
        const isChecked = checkIban.checked;
        const ibanVal = (document.getElementById('company-iban-input')?.value || '').trim();
        localStorage.setItem('pf_include_iban_in_notes', isChecked ? '1' : '0');
        if (ibanVal) localStorage.setItem('pf_company_iban', ibanVal);
        if (State.tenant) {
          State.tenant.includeIbanInNotes = isChecked;
          if (ibanVal) State.tenant.iban = ibanVal;
        }
        Toast.info(isChecked ? 'IBAN fatura açıklamasına otomatik eklenecektir.' : 'IBAN otomatik ekleme kapatıldı.');
      });

      formComp.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(formComp);
        const isChecked = fd.get('includeIbanInNotes') === '1';
        const ibanVal = (fd.get('iban') || '').trim();

        localStorage.setItem('pf_include_iban_in_notes', isChecked ? '1' : '0');
        if (ibanVal) localStorage.setItem('pf_company_iban', ibanVal);
        if (State.tenant) {
          State.tenant.iban = ibanVal;
          State.tenant.includeIbanInNotes = isChecked;
        }

        const payload = {
          name: fd.get('name'),
          taxNumber: fd.get('taxNumber'),
          taxOffice: fd.get('taxOffice'),
          phone: fd.get('phone'),
          email: fd.get('email'),
          city: fd.get('city'),
          district: fd.get('district'),
          address: fd.get('address'),
          iban: ibanVal,
          includeIbanInNotes: isChecked
        };
        try {
          await API.updateCompanySettings(payload);
          Toast.success('Firma bilgileri başarıyla güncellendi.');
        } catch (err) {
          Toast.error(err.message);
        }
      });
    }

    // 2. GİB settings save
    const formGib = document.getElementById('form-gib-settings');
    if (formGib) {
      formGib.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(formGib);
        const payload = {
          username: fd.get('gibUsername'),
          password: fd.get('gibPassword'),
          isTestMode: fd.get('isTestMode') === '1'
        };
        try {
          await API.updateGibSettings(payload);
          Toast.success('GİB entegrasyon ayarları şifrelenerek kaydedildi.');
          App.render();
        } catch (err) {
          Toast.error(err.message);
        }
      });
    }

    // 3. Test GİB Connection button
    document.getElementById('btn-test-gib')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-test-gib');
      btn.disabled = true;
      btn.textContent = 'Test Ediliyor...';
      try {
        const res = await API.testGibConnection();
        Toast.success(res.message);
        App.render();
      } catch (err) {
        Toast.error(err.message);
        App.render();
      } finally {
        btn.disabled = false;
        btn.textContent = '🔌 Bağlantıyı Test Et';
      }
    });

    // 4. Change Password
    const formPass = document.getElementById('form-change-password');
    if (formPass) {
      formPass.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(formPass);
        try {
          await API.changePassword(fd.get('currentPassword'), fd.get('newPassword'));
          Toast.success('Parolanız başarıyla güncellendi.');
          formPass.reset();
        } catch (err) {
          Toast.error(err.message);
        }
      });
    }
  }
};

window.SettingsView = SettingsView;
