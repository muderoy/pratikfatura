/**
 * PRATİKFATURA İşletme Kullanıcı Dashboard Görünümü
 */

const DashboardView = {
  async render() {
    let summary = {
      today: { count: 0, total: 0 },
      thisMonth: { count: 0, total: 0 },
      recentInvoices: [],
      topCustomers: [],
      topProducts: [],
      vatDistribution: []
    };

    try {
      summary = await API.getDashboardSummary();
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    }

    const recentInvoicesRows = (summary.recentInvoices || []).map(inv => `
      <tr>
        <td><strong>${inv.invoice_number}</strong></td>
        <td>${State.formatDate(inv.invoice_date)}</td>
        <td>${inv.receiver_title}</td>
        <td style="text-align: right; font-weight: 700;">${State.formatCurrency(inv.grand_total)}</td>
        <td style="text-align: center;">
          <span class="badge ${inv.status === 'BASARILI' ? 'badge-success' : 'badge-warning'}">${inv.status}</span>
        </td>
      </tr>
    `).join('');

    const topCustRows = (summary.topCustomers || []).map((c, i) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
        <div>
          <span style="font-weight: 700; color: #1e3a8a; margin-right: 8px;">#${i + 1}</span>
          <span style="font-weight: 600; color: #0f172a;">${c.receiver_title}</span>
          <div style="font-size: 11px; color: #64748b;">${c.invoice_count} Fatura Düzenlendi</div>
        </div>
        <div style="font-weight: 800; color: #0f172a;">${State.formatCurrency(c.total_amount)}</div>
      </div>
    `).join('');

    const topProdRows = (summary.topProducts || []).map((p, i) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
        <div>
          <span style="font-weight: 700; color: #2563eb; margin-right: 8px;">#${i + 1}</span>
          <span style="font-weight: 600; color: #0f172a;">${p.name}</span>
          <div style="font-size: 11px; color: #64748b;">${p.count} Kez Kullanıldı</div>
        </div>
        <div style="font-weight: 800; color: #0f172a;">${State.formatCurrency(p.total_amount)}</div>
      </div>
    `).join('');

    return `
      <div class="content-area">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a;">📊 Genel Bakış</h1>
            <p style="font-size: 13px; color: #64748b;">Satış hacmi, fatura istatistikleri ve anlık durum.</p>
          </div>
          <a href="#/pos" class="btn btn-success" style="font-size: 15px; padding: 12px 24px;">
            ⚡ YENİ FATURA KES (POS)
          </a>
        </div>

        <!-- 4 Özet Metrik Kartı -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div class="card" style="padding: 20px; border-left: 4px solid #2563eb;">
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Bugünkü Fatura Sayısı</div>
            <div style="font-size: 28px; font-weight: 900; color: #1e3a8a; margin-top: 6px;">${summary.today?.count || 0} Adet</div>
          </div>
          <div class="card" style="padding: 20px; border-left: 4px solid #10b981;">
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Bugünkü Satış Toplamı</div>
            <div style="font-size: 28px; font-weight: 900; color: #047857; margin-top: 6px;">${State.formatCurrency(summary.today?.total || 0)}</div>
          </div>
          <div class="card" style="padding: 20px; border-left: 4px solid #f59e0b;">
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Bu Ay Kesilen Fatura</div>
            <div style="font-size: 28px; font-weight: 900; color: #b45309; margin-top: 6px;">${summary.thisMonth?.count || 0} Adet</div>
          </div>
          <div class="card" style="padding: 20px; border-left: 4px solid #8b5cf6;">
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Bu Ay Satış Hacmi</div>
            <div style="font-size: 28px; font-weight: 900; color: #6d28d9; margin-top: 6px;">${State.formatCurrency(summary.thisMonth?.total || 0)}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
          <!-- Son Kesilen Faturalar -->
          <div class="card" style="padding: 0; overflow: hidden;">
            <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 15px; font-weight: 700; color: #0f172a;">Son Kesilen Faturalar</h3>
              <a href="#/invoices" style="font-size: 12px; color: #2563eb; text-decoration: none; font-weight: 600;">Tümünü Gör →</a>
            </div>
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
                  ${recentInvoicesRows || '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">Henüz fatura bulunmuyor.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <!-- En Çok Çalışılan Müşteriler -->
          <div class="card">
            <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">En Çok Çalışılan Müşteriler</h3>
            ${topCustRows || '<div style="color: #94a3b8; font-size: 13px; text-align: center; padding: 20px;">Veri yok</div>'}
          </div>
        </div>

        <!-- En Çok Satılan Hizmetler & KDV Dağılımı -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div class="card">
            <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">En Çok Tercih Edilen Hizmetler</h3>
            ${topProdRows || '<div style="color: #94a3b8; font-size: 13px; text-align: center; padding: 20px;">Veri yok</div>'}
          </div>

          <div class="card">
            <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">KDV Matrah ve Vergi Dağılımı</h3>
            ${(summary.vatDistribution || []).map(v => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                <div>
                  <span class="badge badge-info">%${v.vat_rate} KDV</span>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Matrah: ${State.formatCurrency(v.total_matrah)}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 800; color: #0f172a;">${State.formatCurrency(v.total_vat)}</div>
                  <div style="font-size: 10px; color: #64748b;">Hesaplanan Vergi</div>
                </div>
              </div>
            `).join('') || '<div style="color: #94a3b8; font-size: 13px; text-align: center; padding: 20px;">Veri yok</div>'}
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {}
};

window.DashboardView = DashboardView;
