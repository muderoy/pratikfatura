/**
 * PRATİKFATURA İade ve İptal İşlemleri Görünümü
 */

const RefundsView = {
  async render() {
    return `
      <div class="content-area">
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #0f172a;">🔄 İade ve İptal İşlemleri</h1>
          <p style="font-size: 13px; color: #64748b;">Mevzuata uygun iptal kayıtları ve işlem denetim geçmişi.</p>
        </div>

        <div class="card" style="background: #fffbeb; border-color: #fde68a; padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <span style="font-size: 24px;">⚖️</span>
            <div style="font-size: 13px; color: #92400e; line-height: 1.5;">
              <strong>Yasal Mevzuat Hatırlatması (213 Sayılı V.U.K.):</strong><br>
              Resmîleşmiş e-Arşiv faturaları veritabanından kalıcı olarak silinemez. İptal veya iade durumunda fatura durumu "İptal Edildi" olarak işaretlenir, gerekçe kaydedilir ve GİB portalı denetim kayıtlarına işlenir.
            </div>
          </div>
        </div>

        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); font-weight: 700; color: #0f172a;">
            İptal Edilen ve İade Sürecindeki Faturalar
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fatura No</th>
                  <th>İptal Tarihi</th>
                  <th>Alıcı Müşteri</th>
                  <th style="text-align: right;">Fatura Tutarı</th>
                  <th style="text-align: center;">Durum</th>
                  <th style="text-align: right;">İşlemler</th>
                </tr>
              </thead>
              <tbody id="refunds-tbody">
                <tr>
                  <td colspan="6" style="text-align: center; padding: 24px; color: #94a3b8;">Yükleniyor...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    const tbody = document.getElementById('refunds-tbody');
    try {
      const res = await API.getInvoices({ status: 'IPTAL_EDILDI' });
      const invoices = res.invoices || [];

      if (invoices.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 32px; color: #94a3b8;">
              İptal edilmiş herhangi bir fatura kaydı bulunmamaktadır.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = invoices.map(inv => `
        <tr>
          <td><strong style="color: #dc2626;">${inv.invoice_number}</strong></td>
          <td>${State.formatDate(inv.invoice_date)}</td>
          <td>${inv.receiver_title}</td>
          <td style="text-align: right; font-weight: 700;">${State.formatCurrency(inv.grand_total)}</td>
          <td style="text-align: center;">
            <span class="badge badge-danger">İPTAL EDİLDİ</span>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-outline btn-sm btn-print-refund" data-id="${inv.id}" data-num="${inv.invoice_number}">
              🖨️ Fiş Görüntüle
            </button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.btn-print-refund').forEach(btn => {
        btn.addEventListener('click', () => {
          Modals.showPrintModal(btn.dataset.id, btn.dataset.num);
        });
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="color: red; text-align: center;">Hata: ${err.message}</td></tr>`;
    }
  }
};

window.RefundsView = RefundsView;
