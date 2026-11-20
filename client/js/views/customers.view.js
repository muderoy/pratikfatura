/**
 * PRATİKFATURA Müşteri Yönetimi Görünümü
 */

const CustomersView = {
  customers: [],

  async render() {
    return `
      <div class="content-area">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a;">👥 Müşterilerim</h1>
            <p style="font-size: 13px; color: #64748b;">Kayıtlı cari müşteriler, VKN/TCKN bilgileri ve satış geçmişleri.</p>
          </div>
          <button type="button" id="btn-create-customer" class="btn btn-primary">
            ➕ Yeni Müşteri Tanımla
          </button>
        </div>

        <div class="card" style="padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; gap: 12px;">
            <input type="text" id="cust-search-input" class="form-input" placeholder="Müşteri adı, unvan, VKN, TCKN veya telefon ile ara...">
            <button type="button" id="btn-search-cust" class="btn btn-primary" style="white-space: nowrap;">Ara</button>
          </div>
        </div>

        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Müşteri / Firma Unvanı</th>
                  <th>Tür</th>
                  <th>VKN / TCKN</th>
                  <th>Vergi Dairesi</th>
                  <th>Telefon / E-Posta</th>
                  <th>Şehir</th>
                  <th style="text-align: right;">İşlemler</th>
                </tr>
              </thead>
              <tbody id="customers-tbody">
                <tr>
                  <td colspan="7" style="text-align: center; padding: 24px; color: #94a3b8;">Yükleniyor...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    await this.loadCustomers();

    document.getElementById('btn-create-customer')?.addEventListener('click', () => {
      Modals.showCustomerModal(() => this.loadCustomers());
    });

    document.getElementById('btn-search-cust')?.addEventListener('click', () => {
      this.loadCustomers();
    });

    document.getElementById('cust-search-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.loadCustomers();
    });
  },

  async loadCustomers() {
    const q = document.getElementById('cust-search-input')?.value || '';
    const tbody = document.getElementById('customers-tbody');

    try {
      const res = await API.getCustomers(q);
      this.customers = res.customers || [];

      if (this.customers.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 32px; color: #94a3b8;">
              Kayıtlı müşteri bulunamadı.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = this.customers.map(c => {
        const title = c.customer_type === 'INDIVIDUAL' ? `${c.first_name} ${c.last_name}` : c.company_name;
        return `
          <tr>
            <td>
              <strong style="color: #0f172a; font-size: 14px;">${title}</strong>
              ${c.address ? `<div style="font-size: 11px; color: #64748b;">${c.address}</div>` : ''}
            </td>
            <td>
              <span class="badge ${c.customer_type === 'INDIVIDUAL' ? 'badge-info' : 'badge-success'}">
                ${c.customer_type === 'INDIVIDUAL' ? 'Bireysel' : 'Kurumsal'}
              </span>
            </td>
            <td><code>${c.tax_number}</code></td>
            <td>${c.tax_office || '-'}</td>
            <td>
              <div>${c.phone || '-'}</div>
              <div style="font-size: 11px; color: #94a3b8;">${c.email || ''}</div>
            </td>
            <td>${c.city ? `${c.district ? c.district + '/' : ''}${c.city}` : '-'}</td>
            <td style="text-align: right;">
              <button class="btn btn-outline btn-sm btn-select-pos" data-id="${c.id}" title="Hızlı Fatura Kes">
                ⚡ Fatura Kes
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Bind Fast Invoicing
      tbody.querySelectorAll('.btn-select-pos').forEach(btn => {
        btn.addEventListener('click', () => {
          const cust = this.customers.find(x => x.id === btn.dataset.id);
          if (cust) {
            State.setSelectedCustomer(cust);
            window.location.hash = '#/pos';
          }
        });
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="color: red; text-align: center;">Hata: ${err.message}</td></tr>`;
    }
  }
};

window.CustomersView = CustomersView;
