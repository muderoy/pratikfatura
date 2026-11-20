/**
 * PRATİKFATURA Raporlama ve Dışa Aktarma (Excel/CSV) Görünümü
 */

const ReportsView = {
  async render() {
    return `
      <div class="content-area">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a;">📈 Satış ve KDV Raporları</h1>
            <p style="font-size: 13px; color: #64748b;">Dönemsel satış hacmi, matrah dökümleri ve Excel/CSV dışa aktarma.</p>
          </div>
          <button type="button" id="btn-export-csv" class="btn btn-success">
            📥 Excel / CSV İndir
          </button>
        </div>

        <div class="card" style="padding: 16px; margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: end;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Başlangıç Tarihi</label>
              <input type="date" id="rep-start" class="form-input">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Bitiş Tarihi</label>
              <input type="date" id="rep-end" class="form-input">
            </div>
            <div>
              <button type="button" id="btn-query-report" class="btn btn-primary" style="height: 42px;">
                Raporu Getir
              </button>
            </div>
          </div>
        </div>

        <div id="report-summary-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <!-- Dynamically populated -->
        </div>

        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fatura No</th>
                  <th>Tarih</th>
                  <th>Müşteri Unvanı</th>
                  <th>VKN/TCKN</th>
                  <th style="text-align: right;">Matrah</th>
                  <th style="text-align: right;">KDV</th>
                  <th style="text-align: right;">Genel Toplam</th>
                  <th style="text-align: center;">Durum</th>
                </tr>
              </thead>
              <tbody id="report-tbody">
                <tr>
                  <td colspan="8" style="text-align: center; padding: 24px; color: #94a3b8;">Rapor yükleniyor...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    await this.loadReport();

    document.getElementById('btn-query-report')?.addEventListener('click', () => {
      this.loadReport();
    });

    document.getElementById('btn-export-csv')?.addEventListener('click', () => {
      const s = document.getElementById('rep-start')?.value || '';
      const e = document.getElementById('rep-end')?.value || '';
      const token = API.getToken();
      const url = `/api/reports/full?format=csv&startDate=${encodeURIComponent(s)}&endDate=${encodeURIComponent(e)}`;
      
      // Trigger download
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.blob())
        .then(blob => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `pratikfatura-rapor-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          Toast.success('Rapor CSV formatında indirildi.');
        })
        .catch(err => Toast.error(err.message));
    });
  },

  async loadReport() {
    const startDate = document.getElementById('rep-start')?.value || '';
    const endDate = document.getElementById('rep-end')?.value || '';
    const tbody = document.getElementById('report-tbody');
    const cards = document.getElementById('report-summary-cards');

    try {
      const res = await API.getFullReport({ startDate, endDate });
      const rows = res.rows || [];

      let totalMatrah = 0;
      let totalVat = 0;
      let totalGrand = 0;

      for (const r of rows) {
        totalMatrah += (r.subtotal || 0);
        totalVat += (r.vat_total || 0);
        totalGrand += (r.grand_total || 0);
      }

      cards.innerHTML = `
        <div class="card" style="padding: 16px; margin-bottom: 0;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Toplam Fatura</div>
          <div style="font-size: 22px; font-weight: 900; color: #1e3a8a; margin-top: 4px;">${rows.length} Adet</div>
        </div>
        <div class="card" style="padding: 16px; margin-bottom: 0;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Toplam Matrah</div>
          <div style="font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px;">${State.formatCurrency(totalMatrah)}</div>
        </div>
        <div class="card" style="padding: 16px; margin-bottom: 0;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Hesaplanan KDV</div>
          <div style="font-size: 22px; font-weight: 900; color: #2563eb; margin-top: 4px;">${State.formatCurrency(totalVat)}</div>
        </div>
        <div class="card" style="padding: 16px; margin-bottom: 0;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Genel Satış Toplamı</div>
          <div style="font-size: 22px; font-weight: 900; color: #047857; margin-top: 4px;">${State.formatCurrency(totalGrand)}</div>
        </div>
      `;

      if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 24px; color: #94a3b8;">Seçilen kriterlere uygun fatura bulunamadı.</td></tr>';
        return;
      }

      tbody.innerHTML = rows.map(r => `
        <tr>
          <td><strong>${r.invoice_number}</strong></td>
          <td>${State.formatDate(r.invoice_date)}</td>
          <td>${r.receiver_title}</td>
          <td><code>${r.receiver_tax_number}</code></td>
          <td style="text-align: right;">${State.formatCurrency(r.subtotal)}</td>
          <td style="text-align: right; color: #64748b;">${State.formatCurrency(r.vat_total)}</td>
          <td style="text-align: right; font-weight: 700; color: #0f172a;">${State.formatCurrency(r.grand_total)}</td>
          <td style="text-align: center;">
            <span class="badge ${r.status === 'BASARILI' ? 'badge-success' : 'badge-warning'}">${r.status}</span>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="8" style="color: red; text-align: center;">Hata: ${err.message}</td></tr>`;
    }
  }
};

window.ReportsView = ReportsView;
