/**
 * PRATİKFATURA Admin Portal Görünümü
 */

const AdminView = {
  activeTab: 'stats', // 'stats', 'resellers', 'tenants', 'logs'

  async render() {
    let data = { stats: {}, recentLogs: [], recentInvoices: [] };
    let resellers = [];
    let tenants = [];
    let logs = [];

    try {
      if (this.activeTab === 'stats') {
        const res = await API.getAdminDashboard();
        data = res;
      } else if (this.activeTab === 'resellers') {
        const res = await API.getAdminResellers();
        resellers = res.resellers || [];
      } else if (this.activeTab === 'tenants') {
        const res = await API.getAdminTenants();
        tenants = res.tenants || [];
      } else if (this.activeTab === 'logs') {
        const res = await API.getAdminLogs();
        logs = res.logs || [];
      }
    } catch (e) {
      console.error(e);
    }

    return `
      <div class="content-area">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
              👑 Sistem Yönetim Paneli (Admin)
            </h1>
            <p style="font-size: 13px; color: #64748b;">Sistem geneli bayiler, işletmeler, GİB entegrasyon sağlığı ve denetim kayıtları.</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm ${this.activeTab === 'stats' ? 'btn-primary' : 'btn-outline'} tab-btn" data-tab="stats">Genel İstatistikler</button>
            <button class="btn btn-sm ${this.activeTab === 'resellers' ? 'btn-primary' : 'btn-outline'} tab-btn" data-tab="resellers">Bayi (Reseller) Yönetimi</button>
            <button class="btn btn-sm ${this.activeTab === 'tenants' ? 'btn-primary' : 'btn-outline'} tab-btn" data-tab="tenants">İşletmeler (Tenants)</button>
            <button class="btn btn-sm ${this.activeTab === 'logs' ? 'btn-primary' : 'btn-outline'} tab-btn" data-tab="logs">Sistem & Güvenlik Logları</button>
          </div>
        </div>

        ${this.renderTabContent(data, resellers, tenants, logs)}
      </div>
    `;
  },

  renderTabContent(data, resellers, tenants, logs) {
    if (this.activeTab === 'stats') {
      const s = data.stats || {};
      return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div class="card" style="padding: 20px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 700;">TOPLAM İŞLETME</div>
            <div style="font-size: 28px; font-weight: 900; color: #1e3a8a; margin-top: 4px;">${s.totalTenants || 0}</div>
            <div style="font-size: 11px; color: #10b981;">${s.activeTenants || 0} Aktif İşletme</div>
          </div>
          <div class="card" style="padding: 20px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 700;">KAYITLI BAYİ (RESELLER)</div>
            <div style="font-size: 28px; font-weight: 900; color: #b45309; margin-top: 4px;">${s.totalResellers || 0}</div>
          </div>
          <div class="card" style="padding: 20px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 700;">TOPLAM DÜZENLENEN FATURA</div>
            <div style="font-size: 28px; font-weight: 900; color: #047857; margin-top: 4px;">${s.totalInvoices || 0} Adet</div>
          </div>
          <div class="card" style="padding: 20px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 700;">TOPLAM RESMÎ CİRO</div>
            <div style="font-size: 28px; font-weight: 900; color: #0f172a; margin-top: 4px;">${State.formatCurrency(s.totalVolume || 0)}</div>
          </div>
        </div>

        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); font-weight: 700;">
            Sistem Genelinde Düzenlenen Son Faturalar
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fatura No</th>
                  <th>İşletme (Tenant)</th>
                  <th>Tarih</th>
                  <th>Alıcı</th>
                  <th style="text-align: right;">Tutar</th>
                  <th style="text-align: center;">Durum</th>
                </tr>
              </thead>
              <tbody>
                ${(data.recentInvoices || []).map(i => `
                  <tr>
                    <td><strong>${i.invoice_number}</strong></td>
                    <td><span class="badge badge-info">${i.tenant_name}</span></td>
                    <td>${State.formatDate(i.invoice_date)}</td>
                    <td>${i.receiver_title}</td>
                    <td style="text-align: right; font-weight: 700;">${State.formatCurrency(i.grand_total)}</td>
                    <td style="text-align: center;"><span class="badge badge-success">${i.status}</span></td>
                  </tr>
                `).join('') || '<tr><td colspan="6" style="text-align: center; padding: 20px;">Fatura bulunmuyor.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'resellers') {
      return `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
          <button id="btn-create-reseller" class="btn btn-primary btn-sm">➕ Yeni Bayi (Reseller) Tanımla</button>
        </div>
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Bayi Adı</th>
                  <th>E-Posta</th>
                  <th>Telefon</th>
                  <th style="text-align: center;">Kayıtlı Müşteri</th>
                  <th style="text-align: right;">Müşterilerinin Satış Hacmi</th>
                  <th style="text-align: center;">Durum</th>
                  <th style="text-align: right;">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                ${resellers.map(r => `
                  <tr>
                    <td><strong>${r.name}</strong></td>
                    <td>${r.email}</td>
                    <td>${r.phone || '-'}</td>
                    <td style="text-align: center;"><strong>${r.tenant_count}</strong> İşletme</td>
                    <td style="text-align: right; font-weight: 700;">${State.formatCurrency(r.total_volume)}</td>
                    <td style="text-align: center;">
                      <span class="badge ${r.is_active ? 'badge-success' : 'badge-danger'}">
                        ${r.is_active ? 'AKTİF' : 'PASİF'}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-outline btn-sm btn-toggle-reseller" data-id="${r.id}">
                        ${r.is_active ? 'Pasife Al' : 'Aktifleştir'}
                      </button>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="7" style="text-align: center; padding: 20px;">Bayi bulunamadı.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'tenants') {
      return `
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>İşletme Adı</th>
                  <th>VKN / TCKN</th>
                  <th>Bağlı Bayi</th>
                  <th>Şehir</th>
                  <th style="text-align: center;">Fatura Sayısı</th>
                  <th style="text-align: right;">Toplam Satış</th>
                  <th style="text-align: center;">GİB Entegrasyonu</th>
                  <th style="text-align: center;">Durum</th>
                  <th style="text-align: right;">İşlem</th>
                </tr>
              </thead>
              <tbody>
                ${tenants.map(t => `
                  <tr>
                    <td><strong>${t.name}</strong></td>
                    <td><code>${t.tax_number}</code></td>
                    <td>${t.reseller_name ? `<span class="badge badge-warning">${t.reseller_name}</span>` : 'Doğrudan'}</td>
                    <td>${t.city || '-'}</td>
                    <td style="text-align: center;">${t.invoice_count}</td>
                    <td style="text-align: right; font-weight: 700;">${State.formatCurrency(t.total_sales)}</td>
                    <td style="text-align: center;">
                      <span class="badge ${t.has_gib_configured ? 'badge-success' : 'badge-warning'}">
                        ${t.has_gib_configured ? '✓ Tanımlı' : 'Eksik'}
                      </span>
                    </td>
                    <td style="text-align: center;">
                      <span class="badge ${t.is_active ? 'badge-success' : 'badge-danger'}">
                        ${t.is_active ? 'AKTİF' : 'PASİF'}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-outline btn-sm btn-toggle-tenant" data-id="${t.id}">
                        ${t.is_active ? 'Durdur' : 'Aktif Et'}
                      </button>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="9" style="text-align: center; padding: 20px;">İşletme bulunamadı.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'logs') {
      return `
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Tarih / Saat</th>
                  <th>Kategori</th>
                  <th>Seviye</th>
                  <th>Aksiyon</th>
                  <th>Detaylar</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(l => {
                  let badge = 'badge-info';
                  if (l.level === 'WARN') badge = 'badge-warning';
                  if (l.level === 'ERROR') badge = 'badge-danger';
                  return `
                    <tr>
                      <td style="font-size: 11px; white-space: nowrap;">${l.created_at}</td>
                      <td><span class="badge badge-info">${l.category}</span></td>
                      <td><span class="badge ${badge}">${l.level}</span></td>
                      <td><code>${l.action}</code></td>
                      <td style="font-size: 12px; color: #475569;">${l.details || '-'}</td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="5" style="text-align: center; padding: 20px;">Log kaydı bulunamadı.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return '';
  },

  bindEvents() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        App.render();
      });
    });

    // Create Reseller button
    document.getElementById('btn-create-reseller')?.addEventListener('click', () => {
      this.showCreateResellerModal();
    });

    // Toggle Reseller
    document.querySelectorAll('.btn-toggle-reseller').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await API.toggleAdminResellerStatus(btn.dataset.id);
          Toast.success('Bayi durumu güncellendi.');
          App.render();
        } catch (err) {
          Toast.error(err.message);
        }
      });
    });

    // Toggle Tenant
    document.querySelectorAll('.btn-toggle-tenant').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await API.toggleAdminTenantStatus(btn.dataset.id);
          Toast.success('İşletme durumu güncellendi.');
          App.render();
        } catch (err) {
          Toast.error(err.message);
        }
      });
    });
  },

  showCreateResellerModal() {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    backdrop.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="font-size: 16px; font-weight: 700;">➕ Yeni Bayi (Reseller) Oluştur</h3>
          <button type="button" class="btn btn-outline btn-sm modal-close">✕</button>
        </div>
        <form id="form-create-reseller">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Bayi Firma / Kişi Adı *</label>
              <input type="text" name="name" class="form-input" placeholder="Örn: Ege Bölge Dağıtım Ltd." required>
            </div>
            <div class="form-group">
              <label class="form-label">Giriş E-Postası *</label>
              <input type="email" name="email" class="form-input" placeholder="bayi@firma.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Giriş Parolası *</label>
              <input type="password" name="password" class="form-input" placeholder="••••••••" required>
            </div>
            <div class="form-group">
              <label class="form-label">Telefon Numarası</label>
              <input type="tel" name="phone" class="form-input" placeholder="05XX XXX XX XX">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close">İptal</button>
            <button type="submit" class="btn btn-primary">Bayi Oluştur</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);
    backdrop.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => backdrop.remove()));

    const form = backdrop.querySelector('#form-create-reseller');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        await API.createAdminReseller({
          name: fd.get('name'),
          email: fd.get('email'),
          password: fd.get('password'),
          phone: fd.get('phone')
        });
        Toast.success('Bayi başarıyla oluşturuldu.');
        backdrop.remove();
        App.render();
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }
};

window.AdminView = AdminView;
