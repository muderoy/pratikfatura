/**
 * PRATİKFATURA Detaylı Fatura Kesme Görünümü (Mode B)
 */

const DetailedInvoiceView = {
  items: [],
  selectedCustomer: null,

  isIbanAutoAddEnabled() {
    return (State.tenant && State.tenant.includeIbanInNotes) || (localStorage.getItem('pf_include_iban_in_notes') === '1');
  },

  getCompanyIban() {
    return (State.tenant && State.tenant.iban) || localStorage.getItem('pf_company_iban') || '';
  },

  getInitialNotes() {
    if (this.isIbanAutoAddEnabled()) {
      const iban = this.getCompanyIban();
      if (iban) return `IBAN: ${iban}`;
    }
    return '';
  },

  async render() {
    this.selectedCustomer = this.selectedCustomer || State.selectedCustomer;

    const itemsHtml = this.items.length === 0 ? `
      <tr>
        <td colspan="8" style="text-align: center; padding: 24px; color: #94a3b8;">
          Henüz fatura kalemi eklenmedi. Aşağıdaki "+ Yeni Satır Ekle" butonunu kullanınız.
        </td>
      </tr>
    ` : this.items.map((it, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <input type="text" class="form-input form-input-sm it-name" data-idx="${idx}" value="${it.name}">
        </td>
        <td style="width: 80px;">
          <input type="number" step="0.01" min="0.01" class="form-input form-input-sm it-qty" data-idx="${idx}" value="${it.quantity}">
        </td>
        <td style="width: 100px;">
          <select class="form-select form-input-sm it-unit" data-idx="${idx}">
            <option value="Adet" ${it.unit === 'Adet' ? 'selected' : ''}>Adet</option>
            <option value="Sefer" ${it.unit === 'Sefer' ? 'selected' : ''}>Sefer</option>
            <option value="Gün" ${it.unit === 'Gün' ? 'selected' : ''}>Gün</option>
            <option value="KG" ${it.unit === 'KG' ? 'selected' : ''}>KG</option>
            <option value="Ton" ${it.unit === 'Ton' ? 'selected' : ''}>Ton</option>
            <option value="Saat" ${it.unit === 'Saat' ? 'selected' : ''}>Saat</option>
            <option value="Km" ${it.unit === 'Km' ? 'selected' : ''}>Km</option>
          </select>
        </td>
        <td style="width: 120px;">
          <input type="number" step="0.01" class="form-input form-input-sm it-price" data-idx="${idx}" value="${it.unitPrice}">
        </td>
        <td style="width: 90px;">
          <select class="form-select form-input-sm it-vat" data-idx="${idx}">
            <option value="20" ${it.vatRate === 20 ? 'selected' : ''}>%20</option>
            <option value="10" ${it.vatRate === 10 ? 'selected' : ''}>%10</option>
            <option value="1" ${it.vatRate === 1 ? 'selected' : ''}>%1</option>
            <option value="0" ${it.vatRate === 0 ? 'selected' : ''}>%0</option>
          </select>
        </td>
        <td style="width: 80px;">
          <input type="number" min="0" max="100" class="form-input form-input-sm it-disc" data-idx="${idx}" value="${it.discountRate || 0}" placeholder="%">
        </td>
        <td style="width: 50px; text-align: center;">
          <button type="button" class="btn-remove-line" data-idx="${idx}" style="color: #ef4444; background: none; border: none; cursor: pointer; font-size: 16px;">✕</button>
        </td>
      </tr>
    `).join('');

    // Calculate totals
    let rawSubtotal = 0;
    let rawVat = 0;
    let rawTotal = 0;
    for (const line of this.items) {
      const q = line.quantity || 1;
      const p = line.unitPrice || 0;
      const v = line.vatRate || 20;
      const d = line.discountRate || 0;

      const base = q * p * (1 - d / 100);
      const vat = base * (v / 100);
      rawSubtotal += base;
      rawVat += vat;
      rawTotal += (base + vat);
    }

    return `
      <div class="content-area">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a;">📝 Detaylı Fatura Kes</h1>
            <p style="font-size: 13px; color: #64748b;">Kurumsal B2B işlemler, kalem bazlı iskonto ve çoklu KDV oranları.</p>
          </div>
          <a href="#/pos" class="btn btn-outline btn-sm">
            ⚡ Hızlı Fatura (POS) Ekranına Dön
          </a>
        </div>

        <div class="card">
          <div class="card-title">1. Müşteri (Alıcı) Bilgileri</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <div class="form-group">
                <label class="form-label">Müşteri Seçin *</label>
                <div style="display: flex; gap: 8px;">
                  <select id="detailed-customer-select" class="form-select">
                    <option value="">-- Kayıtlı Müşteri Seçiniz --</option>
                  </select>
                  <button type="button" id="btn-add-cust-detailed" class="btn btn-outline" style="white-space: nowrap;">
                    ➕ Yeni Ekle
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div id="cust-preview-box" style="padding: 12px; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; font-size: 12px; color: #475569;">
                Müşteri seçildiğinde bilgileri burada görüntülenecektir.
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title" style="display: flex; justify-content: space-between;">
            <span>2. Mal ve Hizmet Kalemleri</span>
            <button type="button" id="btn-add-line" class="btn btn-primary btn-sm">
              ➕ Yeni Satır Ekle
            </button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 30px;">#</th>
                  <th>Hizmet / Mal Adı</th>
                  <th>Miktar</th>
                  <th>Birim</th>
                  <th>Birim Fiyat (KDV Hariç)</th>
                  <th>KDV</th>
                  <th>İskonto %</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 400px; gap: 24px;">
          <div class="card">
            <div class="card-title">3. Fatura Notu ve Ödeme</div>
            <div class="form-group">
              <label class="form-label">Fatura Açıklaması</label>
              <textarea id="detailed-notes" class="form-textarea" rows="3" placeholder="Fatura altı açıklaması, taşıma irsaliye numarası veya banka hesap detayları...">${this.getInitialNotes()}</textarea>
              ${this.isIbanAutoAddEnabled() && this.getCompanyIban() ? `
                <div style="font-size: 11px; color: #60a5fa; margin-top: 4px;">ℹ️ Ayarlardan IBAN otomatik ekleme aktif.</div>
              ` : ''}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Ödeme Yöntemi</label>
                <select id="detailed-payment-method" class="form-select">
                  <option value="HAVALE_EFT">Banka Havale / EFT</option>
                  <option value="KREDI_KARTI">Kredi Kartı</option>
                  <option value="NAKIT">Nakit</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Para Birimi</label>
                <select id="detailed-currency" class="form-select">
                  <option value="TRY">Türk Lirası (₺)</option>
                  <option value="USD">Amerikan Doları ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="card" style="background: #f8fafc;">
            <div class="card-title">Fatura Toplamları</div>
            <div class="summary-row">
              <span>Mal / Hizmet Toplamı:</span>
              <span id="txt-subtotal" style="font-weight: 700;">${State.formatCurrency(rawSubtotal)}</span>
            </div>
            <div class="summary-row">
              <span>Toplam KDV:</span>
              <span id="txt-vat" style="font-weight: 700;">${State.formatCurrency(rawVat)}</span>
            </div>
            <div class="summary-row total">
              <span>GENEL TOPLAM:</span>
              <span id="txt-grand">${State.formatCurrency(rawTotal)}</span>
            </div>

            <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
              <button type="button" id="btn-detailed-submit" class="btn btn-success btn-block" style="font-size: 15px;">
                🛡️ Faturayı Resmî Olarak Düzenle (GİB)
              </button>
              <button type="button" id="btn-detailed-draft" class="btn btn-outline btn-block">
                💾 Taslak Olarak Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async bindEvents() {
    // 1. Load Customers into dropdown
    const custSelect = document.getElementById('detailed-customer-select');
    const custPreview = document.getElementById('cust-preview-box');

    let allCustomers = [];
    try {
      const res = await API.getCustomers();
      allCustomers = res.customers || [];
      allCustomers.forEach(c => {
        const title = c.customer_type === 'INDIVIDUAL' ? `${c.first_name} ${c.last_name}` : c.company_name;
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${title} (${c.tax_number})`;
        if (this.selectedCustomer && this.selectedCustomer.id === c.id) {
          opt.selected = true;
          this.updateCustPreview(c);
        }
        custSelect.appendChild(opt);
      });
    } catch (err) {
      console.error(err);
    }

    custSelect.addEventListener('change', () => {
      const selected = allCustomers.find(x => x.id === custSelect.value);
      this.selectedCustomer = selected || null;
      this.updateCustPreview(selected);
    });

    document.getElementById('btn-add-cust-detailed')?.addEventListener('click', () => {
      Modals.showCustomerModal((newCust) => {
        this.selectedCustomer = newCust;
        App.render();
      });
    });

    // 2. Add line
    document.getElementById('btn-add-line')?.addEventListener('click', () => {
      this.items.push({
        name: 'Taşımacılık Hizmet Bedeli',
        quantity: 1,
        unit: 'Sefer',
        unitPrice: 5000,
        vatRate: 20,
        discountRate: 0,
        isVatInclusive: false
      });
      App.render();
    });

    // 3. Remove line
    document.querySelectorAll('.btn-remove-line').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        this.items.splice(idx, 1);
        App.render();
      });
    });

    // 4. Update inputs on change
    document.querySelectorAll('.it-name').forEach(inp => {
      inp.addEventListener('input', (e) => {
        this.items[e.target.dataset.idx].name = e.target.value;
      });
    });

    document.querySelectorAll('.it-qty').forEach(inp => {
      inp.addEventListener('input', (e) => {
        this.items[e.target.dataset.idx].quantity = parseFloat(e.target.value) || 1;
        this.refreshTotals();
      });
    });

    document.querySelectorAll('.it-unit').forEach(inp => {
      inp.addEventListener('change', (e) => {
        this.items[e.target.dataset.idx].unit = e.target.value;
      });
    });

    document.querySelectorAll('.it-price').forEach(inp => {
      inp.addEventListener('input', (e) => {
        this.items[e.target.dataset.idx].unitPrice = parseFloat(e.target.value) || 0;
        this.refreshTotals();
      });
    });

    document.querySelectorAll('.it-vat').forEach(inp => {
      inp.addEventListener('change', (e) => {
        this.items[e.target.dataset.idx].vatRate = parseFloat(e.target.value) || 20;
        this.refreshTotals();
      });
    });

    document.querySelectorAll('.it-disc').forEach(inp => {
      inp.addEventListener('input', (e) => {
        this.items[e.target.dataset.idx].discountRate = parseFloat(e.target.value) || 0;
        this.refreshTotals();
      });
    });

    // 5. Submit Draft
    document.getElementById('btn-detailed-draft')?.addEventListener('click', async () => {
      await this.saveInvoice(false);
    });

    // 6. Submit Official GİB
    document.getElementById('btn-detailed-submit')?.addEventListener('click', async () => {
      await this.saveInvoice(true);
    });
  },

  updateCustPreview(c) {
    const box = document.getElementById('cust-preview-box');
    if (!c || !box) return;
    const title = c.customer_type === 'INDIVIDUAL' ? `${c.first_name} ${c.last_name}` : c.company_name;
    box.innerHTML = `
      <strong>${title}</strong><br>
      VKN/TCKN: ${c.tax_number} ${c.tax_office ? ` - V.D.: ${c.tax_office}` : ''}<br>
      ${c.address || ''} ${c.district || ''}/${c.city || ''}
    `;
  },

  refreshTotals() {
    let rawSubtotal = 0;
    let rawVat = 0;
    let rawTotal = 0;
    for (const line of this.items) {
      const q = line.quantity || 1;
      const p = line.unitPrice || 0;
      const v = line.vatRate || 20;
      const d = line.discountRate || 0;

      const base = q * p * (1 - d / 100);
      const vat = base * (v / 100);
      rawSubtotal += base;
      rawVat += vat;
      rawTotal += (base + vat);
    }
    const txtSub = document.getElementById('txt-subtotal');
    const txtVat = document.getElementById('txt-vat');
    const txtGrand = document.getElementById('txt-grand');
    if (txtSub) txtSub.textContent = State.formatCurrency(rawSubtotal);
    if (txtVat) txtVat.textContent = State.formatCurrency(rawVat);
    if (txtGrand) txtGrand.textContent = State.formatCurrency(rawTotal);
  },

  async saveInvoice(isOfficial) {
    if (!this.selectedCustomer) {
      Toast.error('Lütfen bir müşteri seçiniz.');
      return;
    }
    if (this.items.length === 0) {
      Toast.error('En az bir fatura satırı eklemelisiniz.');
      return;
    }

    let notes = document.getElementById('detailed-notes')?.value || '';
    if (this.isIbanAutoAddEnabled()) {
      const iban = this.getCompanyIban();
      if (iban && !notes.includes(iban)) {
        notes = notes.trim() ? `${notes.trim()} - IBAN: ${iban}` : `IBAN: ${iban}`;
      }
    }
    const paymentMethod = document.getElementById('detailed-payment-method')?.value || 'HAVALE_EFT';
    const currency = document.getElementById('detailed-currency')?.value || 'TRY';

    const payload = {
      customerId: this.selectedCustomer.id,
      invoiceMode: 'DETAILED',
      paymentMethod,
      currency,
      notes,
      items: this.items
    };

    try {
      const res = await API.createInvoice(payload);
      const invoiceId = res.invoice.id;

      if (!isOfficial) {
        Toast.success(`Fatura taslak olarak kaydedildi: ${res.invoice.invoice_number}`);
        this.items = [];
        window.location.hash = '#/invoices';
      } else {
        // Trigger GİB SMS Flow
        const smsRes = await API.requestGibSms(invoiceId);
        Modals.showSmsModal(invoiceId, smsRes, (finalized) => {
          this.items = [];
          Modals.showPrintModal(finalized.id, finalized.invoice_number);
          window.location.hash = '#/invoices';
        });
      }
    } catch (err) {
      Toast.error(err.message);
    }
  }
};

window.DetailedInvoiceView = DetailedInvoiceView;
