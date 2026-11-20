/**
 * PRATİKFATURA Bayi (Reseller) Portalı Görünümü
 */

const ResellerView = {
  stats: {},
  customers: [],

  async render() {
    try {
      const dash = await API.getResellerDashboard();
      this.stats = dash.stats || {};
      const custRes = await API.getResellerCustomers();
      this.customers = custRes.customers || [];
    } catch (e) {
      console.error(e);
    }

    const s = this.stats || {};

    return `
      <div class="content-area">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a;">🤝 Bayi Yönetim Portalı</h1>
            <p style="font-size: 13px; color: #64748b;">Müşteri işletmelerinizi tanımlayın, fatura kullanım istatistiklerini izleyin.</p>
          </div>
          <button type="button" id="btn-reseller-add-customer" class="btn btn-primary">
            ➕ Yeni Müşteri İşletme Tanımla
          </button>
        </div>

        <!-- 3 Özet Metrik -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div class="card" style="padding: 20px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Bağlı Müşteri Sayısı</div>
            <div style="font-size: 28px; font-weight: 900; color: #1e3a8a; margin-top: 4px;">${s.total_customers || 0} İşletme</div>
            <div style="font-size: 11px; color: #10b981;">${s.active_customers || 0} Aktif Müşteri</div>
          </div>
          <div class="card" style="padding: 20px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Müşterilerinizin Toplam Faturası</div>
            <div style="font-size: 28px; font-weight: 900; color: #b45309; margin-top: 4px;">${s.total_invoices || 0} Adet</div>
          </div>
          <div class="card" style="padding: 20px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Müşterilerinizin Satış Hacmi</div>
            <div style="font-size: 28px; font-weight: 900; color: #047857; margin-top: 4px;">${State.formatCurrency(s.total_sales || 0)}</div>
          </div>
        </div>

        <!-- Müşteri İşletmeler Tablosu -->
        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); font-weight: 700;">
            Müşteri İşletmelerim
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>İşletme Adı</th>
                  <th>VKN / TCKN</th>
                  <th>Kullanıcı E-Postası</th>
                  <th>Şehir</th>
                  <th style="text-align: center;">Fatura Adedi</th>
                  <th style="text-align: right;">Ciro Toplamı</th>
                  <th style="text-align: center;">Durum</th>
                  <th style="text-align: right;">İşlem</th>
                </tr>
              </thead>
              <tbody>
                ${this.customers.map(c => `
                  <tr>
                    <td><strong>${c.name}</strong></td>
                    <td><code>${c.tax_number}</code></td>
                    <td>${c.user_email || '-'}</td>
                    <td>${c.city || '-'}</td>
                    <td style="text-align: center;"><strong>${c.invoice_count}</strong></td>
                    <td style="text-align: right; font-weight: 700; color: #0f172a;">${State.formatCurrency(c.total_sales)}</td>
                    <td style="text-align: center;">
                      <span class="badge ${c.is_active ? 'badge-success' : 'badge-danger'}">
                        ${c.is_active ? 'AKTİF' : 'PASİF'}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-outline btn-sm btn-reseller-invoices" data-id="${c.id}" data-name="${c.name}">
                        Faturaları İncele
                      </button>
                      <button class="btn btn-outline btn-sm btn-toggle-my-customer" data-id="${c.id}" style="margin-left: 4px;">
                        ${c.is_active ? 'Durdur' : 'Aktifleştir'}
                      </button>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="8" style="text-align: center; padding: 24px; color: #94a3b8;">Henüz kayıtlı müşteriniz bulunmuyor.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById('btn-reseller-add-customer')?.addEventListener('click', () => {
      this.showAddCustomerModal();
    });

    document.querySelectorAll('.btn-toggle-my-customer').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await API.toggleResellerCustomerStatus(btn.dataset.id);
          Toast.success('Müşteri durumu güncellendi.');
          App.render();
        } catch (err) {
          Toast.error(err.message);
        }
      });
    });

    document.querySelectorAll('.btn-reseller-invoices').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        try {
          const res = await API.getResellerCustomerInvoices(id);
          this.showInvoicesModal(name, res.invoices || []);
        } catch (err) {
          Toast.error(err.message);
        }
      });
    });
  },

  showAddCustomerModal() {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    backdrop.innerHTML = `
      <div class="modal-card" style="max-width: 580px;">
        <div class="modal-header">
          <h3 style="font-size: 16px; font-weight: 700;">➕ Yeni Müşteri İşletme Tanımla</h3>
          <button type="button" class="btn btn-outline btn-sm modal-close">✕</button>
        </div>
        <form id="form-reseller-create-cust">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Firma Unvanı *</label>
              <input type="text" name="companyName" class="form-input" placeholder="Örn: Akdeniz Nakliyat Lojistik Ltd." required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">VKN / TCKN *</label>
                <input type="text" name="taxNumber" class="form-input" maxlength="11" placeholder="10 Haneli VKN veya 11 Haneli TCKN" required>
              </div>
              <div class="form-group">
                <label class="form-label">Vergi Dairesi</label>
                <input type="text" name="taxOffice" class="form-input" placeholder="Vergi Dairesi">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">İl</label>
                <input type="text" name="city" class="form-input" placeholder="İl">
              </div>
              <div class="form-group">
                <label class="form-label">İlçe</label>
                <input type="text" name="district" class="form-input" placeholder="İlçe">
              </div>
            </div>

            <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 12px; margin-bottom: 12px;">
              <div style="font-weight: 700; font-size: 13px; color: #1e3a8a; margin-bottom: 8px;">👤 İşletme Kullanıcı Giriş Bilgileri</div>
              
              <div class="form-group">
                <label class="form-label">Yetkili Adı Soyadı</label>
                <input type="text" name="userName" class="form-input" placeholder="Yetkili Kişi">
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Giriş E-Postası *</label>
                  <input type="email" name="userEmail" class="form-input" placeholder="yetkili@firma.com" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Giriş Parolası *</label>
                  <input type="password" name="userPassword" class="form-input" placeholder="••••••••" required>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close">İptal</button>
            <button type="submit" class="btn btn-primary">İşletmeyi Kaydet</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);
    backdrop.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => backdrop.remove()));

    const form = backdrop.querySelector('#form-reseller-create-cust');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        await API.createResellerCustomer({
          companyName: fd.get('companyName'),
          taxNumber: fd.get('taxNumber'),
          taxOffice: fd.get('taxOffice'),
          city: fd.get('city'),
          district: fd.get('district'),
          userName: fd.get('userName'),
          userEmail: fd.get('userEmail'),
          userPassword: fd.get('userPassword')
        });
        Toast.success('Müşteri işletme başarıyla kaydedildi.');
        backdrop.remove();
        App.render();
      } catch (err) {
        Toast.error(err.message);
      }
    });
  },

  showInvoicesModal(tenantName, invoices) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    backdrop.innerHTML = `
      <div class="modal-card" style="max-width: 750px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700;">${tenantName} - Fatura Geçmişi</h3>
            <div style="font-size: 11px; color: #64748b;">(Yalnızca Okuma - Değişiklik Yapılamaz)</div>
          </div>
          <button type="button" class="btn btn-outline btn-sm modal-close">✕</button>
        </div>
        <div class="modal-body" style="padding: 0;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fatura No</th>
                  <th>Tarih</th>
                  <th>Alıcı</th>
                  <th style="text-align: right;">Tutar</th>
                  <th style="text-align: center;">Durum</th>
                </tr>
              </thead>
              <tbody>
                ${invoices.map(i => `
                  <tr>
                    <td><strong>${i.invoice_number}</strong></td>
                    <td>${State.formatDate(i.invoice_date)}</td>
                    <td>${i.receiver_title}</td>
                    <td style="text-align: right; font-weight: 700;">${State.formatCurrency(i.grand_total)}</td>
                    <td style="text-align: center;"><span class="badge badge-success">${i.status}</span></td>
                  </tr>
                `).join('') || '<tr><td colspan="5" style="text-align: center; padding: 20px;">Henüz fatura kesilmemiş.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline modal-close">Kapat</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    backdrop.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => backdrop.remove()));
  }
};

window.ResellerView = ResellerView;
