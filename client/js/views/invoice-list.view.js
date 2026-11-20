/**
 * PRATİKFATURA Fatura Geçmişi ve Listeleme Görünümü
 */

const InvoiceListView = {
  invoices: [],

  async render() {
    return `
      <div class="content-area">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a;">📑 Faturalarım</h1>
            <p style="font-size: 13px; color: #64748b;">Düzenlenen e-Arşiv faturaları, durumları ve yazdırma seçenekleri.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <a href="#/pos" class="btn btn-primary btn-sm">⚡ Hızlı Fatura Kes</a>
            <a href="#/detailed-invoice" class="btn btn-outline btn-sm">📝 Detaylı Fatura</a>
          </div>
        </div>

        <!-- Filtreler -->
        <div class="card" style="padding: 16px; margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 180px 180px auto; gap: 12px; align-items: end;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Arama</label>
              <input type="text" id="filter-search" class="form-input" placeholder="Fatura no, müşteri adı veya VKN...">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Durum</label>
              <select id="filter-status" class="form-select">
                <option value="">Tüm Durumlar</option>
                <option value="BASARILI">GİB Onaylı (Başarılı)</option>
                <option value="TASLAK">Taslak</option>
                <option value="SMS_BEKLENIYOR">SMS Bekliyor</option>
                <option value="IPTAL_EDILDI">İptal Edildi</option>
                <option value="HATA">Hata Oluştu</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Tarih Aralığı</label>
              <input type="date" id="filter-start-date" class="form-input">
            </div>
            <div>
              <button type="button" id="btn-apply-filters" class="btn btn-primary" style="height: 42px;">Filtrele</button>
            </div>
          </div>
        </div>

        <!-- Fatura Tablosu -->
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fatura No</th>
                  <th>Tarih / Saat</th>
                  <th>Müşteri (Alıcı)</th>
                  <th>VKN / TCKN</th>
                  <th style="text-align: right;">KDV</th>
                  <th style="text-align: right;">Toplam Tutar</th>
                  <th style="text-align: center;">Durum</th>
                  <th style="text-align: right;">İşlemler</th>
                </tr>
              </thead>
              <tbody id="invoices-tbody">
                <tr>
                  <td colspan="8" style="text-align: center; padding: 24px; color: #94a3b8;">
                    Yükleniyor...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    await this.loadInvoices();

    document.getElementById('btn-apply-filters')?.addEventListener('click', () => {
      this.loadInvoices();
    });

    document.getElementById('filter-search')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.loadInvoices();
    });
  },

  async loadInvoices() {
    const q = document.getElementById('filter-search')?.value || '';
    const status = document.getElementById('filter-status')?.value || '';
    const startDate = document.getElementById('filter-start-date')?.value || '';

    const tbody = document.getElementById('invoices-tbody');
    try {
      const res = await API.getInvoices({ q, status, startDate });
      this.invoices = res.invoices || [];

      if (this.invoices.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 32px; color: #94a3b8;">
              Kayıtlı fatura bulunamadı.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = this.invoices.map(inv => {
        let statusBadge = '';
        if (inv.status === 'BASARILI') {
          statusBadge = '<span class="badge badge-success">GİB ONAYLI</span>';
        } else if (inv.status === 'TASLAK') {
          statusBadge = '<span class="badge badge-warning">TASLAK</span>';
        } else if (inv.status === 'SMS_BEKLENIYOR') {
          statusBadge = '<span class="badge badge-info">SMS BEKLİYOR</span>';
        } else if (inv.status === 'IPTAL_EDILDI') {
          statusBadge = '<span class="badge badge-danger">İPTAL EDİLDİ</span>';
        } else {
          statusBadge = `<span class="badge badge-danger">${inv.status}</span>`;
        }

        return `
          <tr>
            <td>
              <strong style="color: #1e3a8a;">${inv.invoice_number}</strong>
              ${inv.gib_uuid ? `<div style="font-size: 10px; color: #64748b;">ETTN: ${inv.gib_uuid.substring(0, 13)}...</div>` : ''}
            </td>
            <td>
              <div>${State.formatDate(inv.invoice_date)}</div>
              <div style="font-size: 11px; color: #94a3b8;">${inv.invoice_time || ''}</div>
            </td>
            <td>
              <div style="font-weight: 600; color: #0f172a;">${inv.receiver_title}</div>
            </td>
            <td>
              <code>${inv.receiver_tax_number}</code>
            </td>
            <td style="text-align: right; color: #64748b;">
              ${State.formatCurrency(inv.vat_total, inv.currency)}
            </td>
            <td style="text-align: right; font-weight: 800; color: #0f172a; font-size: 15px;">
              ${State.formatCurrency(inv.grand_total, inv.currency)}
            </td>
            <td style="text-align: center;">
              ${statusBadge}
            </td>
            <td style="text-align: right; white-space: nowrap;">
              <button class="btn btn-outline btn-sm btn-view-invoice" data-id="${inv.id}" data-num="${inv.invoice_number}" title="Yazdır / Görüntüle">
                🖨️ Yazdır
              </button>
              ${inv.status === 'TASLAK' || inv.status === 'SMS_BEKLENIYOR' ? `
                <button class="btn btn-success btn-sm btn-sign-invoice" data-id="${inv.id}" style="margin-left: 4px;" title="GİB SMS Onayı Al">
                  🛡️ Resmîleştir
                </button>
              ` : ''}
              ${inv.status === 'BASARILI' ? `
                <button class="btn btn-outline btn-sm btn-cancel-invoice" data-id="${inv.id}" style="margin-left: 4px; color: #ef4444;" title="Faturayı İptal Et">
                  İptal
                </button>
              ` : ''}
            </td>
          </tr>
        `;
      }).join('');

      // Bind action buttons
      tbody.querySelectorAll('.btn-view-invoice').forEach(btn => {
        btn.addEventListener('click', () => {
          Modals.showPrintModal(btn.dataset.id, btn.dataset.num);
        });
      });

      tbody.querySelectorAll('.btn-sign-invoice').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            btn.disabled = true;
            btn.textContent = 'GİB Bağlanıyor...';
            const smsRes = await API.requestGibSms(btn.dataset.id);
            Modals.showSmsModal(btn.dataset.id, smsRes, () => {
              this.loadInvoices();
            });
          } catch (err) {
            Toast.error(err.message);
          } finally {
            btn.disabled = false;
            btn.textContent = '🛡️ Resmîleştir';
          }
        });
      });

      tbody.querySelectorAll('.btn-cancel-invoice').forEach(btn => {
        btn.addEventListener('click', async () => {
          const reason = prompt('Lütfen iptal gerekçesini belirtiniz:');
          if (reason) {
            try {
              await API.cancelInvoice(btn.dataset.id, reason);
              Toast.success('Fatura iptal edildi.');
              this.loadInvoices();
            } catch (err) {
              Toast.error(err.message);
            }
          }
        });
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="8" style="color: red; text-align: center; padding: 20px;">Hata: ${err.message}</td></tr>`;
    }
  }
};

window.InvoiceListView = InvoiceListView;
