/**
 * PRATİKFATURA Hızlı Fatura (POS / Dijital Yazar Kasa) Ekranı
 * Ana hedef: Minimum tıklama ve veri girişiyle anında resmî e-Arşiv faturası düzenleme.
 */

const QuickInvoiceView = {
  quickCards: [],
  searchTimeout: null,

  async render() {
    // Load 8 quick cards if not loaded
    try {
      const res = await API.getQuickCards();
      this.quickCards = res.cards || [];
    } catch (e) {
      console.error('Quick cards fetch error:', e);
    }

    const selectedCust = State.selectedCustomer;
    const cartItems = State.cartItems;
    const totals = State.getCartTotals();

    // Render Quick Service Cards (8 Cards)
    const cardsHtml = this.quickCards.map(c => `
      <div class="pos-card-btn" data-card-id="${c.id}" data-card-name="${c.name}" data-card-vat="${c.vat_rate}" data-card-price="${c.default_price || 0}" data-card-unit="${c.unit || 'Sefer'}">
        <div>
          <div class="pos-card-title">${c.name}</div>
          <span class="pos-card-vat">%${c.vat_rate} KDV</span>
        </div>
        <div class="pos-card-price"></div>
      </div>
    `).join('');

    // Render Cart Lines
    let cartLinesHtml = '';
    if (cartItems.length === 0) {
      cartLinesHtml = `
        <div style="text-align: center; padding: 32px 16px; color: #94a3b8;">
          <div style="font-size: 32px; margin-bottom: 8px;">🛒</div>
          <div style="font-size: 14px; font-weight: 600;">Fatura satırı henüz eklenmedi</div>
          <div style="font-size: 12px; margin-top: 4px;">Soldaki hızlı hizmet kartlarına dokunarak tutar giriniz.</div>
        </div>
      `;
    } else {
      cartLinesHtml = cartItems.map((it, idx) => `
        <div class="cart-item-row">
          <div class="cart-item-info">
            <div class="cart-item-name">${it.name}</div>
            <div class="cart-item-meta">${it.quantity} ${it.unit} &nbsp;|&nbsp; %${it.vatRate} KDV Dahil</div>
          </div>
          <div style="display: flex; align-items: center;">
            <div class="cart-item-price">${State.formatCurrency(it.unitPrice * it.quantity)}</div>
            <button type="button" class="btn-remove-item" data-index="${idx}" title="Satırı Sil">✕</button>
          </div>
        </div>
      `).join('');
    }

    return `
      <div class="content-area">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
              ⚡ Hızlı Fatura Kes (POS)
            </h1>
            <p style="font-size: 13px; color: #64748b;">Müşteri seçin, hizmet kartına dokunun, tutarı girip faturayı resmîleştirin.</p>
          </div>
          <a href="#/detailed-invoice" class="btn btn-outline btn-sm">
            📝 Detaylı Fatura Moduna Geç
          </a>
        </div>

        <div class="pos-container">
          <!-- Sol Bölüm: Müşteri Arama & 8 Hızlı Hizmet Kartı -->
          <div>
            <!-- Müşteri Seçimi Kartı -->
            <div class="card" style="padding: 16px; margin-bottom: 20px;">
              ${selectedCust ? `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px 16px;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="badge ${selectedCust.customer_type === 'INDIVIDUAL' ? 'badge-info' : 'badge-success'}">
                        ${selectedCust.customer_type === 'INDIVIDUAL' ? 'Bireysel' : 'Kurumsal'}
                      </span>
                      <strong style="font-size: 15px; color: #1e3a8a;">
                        ${selectedCust.customer_type === 'INDIVIDUAL' ? `${selectedCust.first_name} ${selectedCust.last_name}` : selectedCust.company_name}
                      </strong>
                    </div>
                    <div style="font-size: 12px; color: #475569; margin-top: 4px;">
                      <strong>VKN/TCKN:</strong> ${selectedCust.tax_number} 
                      ${selectedCust.tax_office ? `&nbsp;|&nbsp; <strong>V.D.:</strong> ${selectedCust.tax_office}` : ''}
                      ${selectedCust.city ? `&nbsp;|&nbsp; ${selectedCust.district || ''}/${selectedCust.city}` : ''}
                    </div>
                  </div>
                  <button type="button" id="btn-change-customer" class="btn btn-outline btn-sm">Değiştir</button>
                </div>
              ` : `
                <div class="customer-search-box">
                  <span class="search-icon-pos">🔍</span>
                  <input type="text" id="customer-search-input" class="search-input-large" placeholder="Müşteri adı, telefon, VKN veya TCKN yazın..." autocomplete="off">
                  <div id="customer-search-results" class="dropdown-results" style="display: none;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b; flex-wrap: wrap; gap: 8px;">
                  <span>Kayıtlı müşterilerden anında seçin veya hızlı butonları kullanın:</span>
                  <div style="display: flex; gap: 8px;">
                    <button type="button" id="btn-quick-retail-customer" class="btn btn-outline btn-sm" style="color: #059669; border-color: #a7f3d0; background-color: #ecfdf5; font-weight: 600;">
                      ⚡ Nihai Tüketici (Bireysel)
                    </button>
                    <button type="button" id="btn-quick-new-customer" class="btn btn-outline btn-sm" style="color: #2563eb; border-color: #bfdbfe;">
                      ➕ Yeni Müşteri Ekle
                    </button>
                  </div>
                </div>
              `}
            </div>

            <!-- Hızlı Hizmet Kartları (8 Kart) -->
            <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
              <h2 style="font-size: 15px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">
                Hızlı Hizmet Kartları (Dokun & Tutar Gir)
              </h2>
              <a href="#/products" style="font-size: 12px; color: #2563eb; text-decoration: none; font-weight: 600;">
                Kartları Özelleştir ⚙️
              </a>
            </div>

            <div class="quick-cards-grid">
              ${cardsHtml}
            </div>

            <!-- Hızlı Açıklama Ekleme (İsteğe Bağlı) -->
            <div class="card" style="padding: 16px;">
              <label class="form-label" style="font-size: 12px; color: #64748b;">Fatura Açıklaması / Notu (İsteğe Bağlı)</label>
              <input type="text" id="invoice-notes-input" class="form-input" placeholder="Örn: 34 ABC 123 plakalı araç ile gerçekleştirilen nakliye bedeli" value="">
            </div>
          </div>

          <!-- Sağ Bölüm: Fatura Sepeti / Toplamlar & Resmî Düzenle Butonu -->
          <div>
            <div class="cart-card">
              <div class="cart-header">
                <div>
                  <h3 style="font-size: 16px; font-weight: 800; color: #0f172a;">Fatura Özeti</h3>
                  <div style="font-size: 11px; color: #64748b;">${cartItems.length} Kalem Hizmet Eklendi</div>
                </div>
                ${cartItems.length > 0 ? `
                  <button type="button" id="btn-clear-cart" class="btn btn-outline btn-sm" style="color: #ef4444; border-color: #fee2e2;">
                    Temizle
                  </button>
                ` : ''}
              </div>

              <div class="cart-items-list">
                ${cartLinesHtml}
              </div>

              ${cartItems.length > 0 ? `
              <div class="cart-summary">
                <div class="summary-row">
                  <span>KDV Matrahı:</span>
                  <span style="font-weight: 600;">${State.formatCurrency(totals.subtotal)}</span>
                </div>
                <div class="summary-row">
                  <span>Hesaplanan KDV:</span>
                  <span style="font-weight: 600;">${State.formatCurrency(totals.vatTotal)}</span>
                </div>
                <div class="summary-row total">
                  <span>GENEL TOPLAM:</span>
                  <span>${State.formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>` : ''}

              <div class="cart-actions">
                <button type="button" id="btn-official-submit" class="btn btn-success btn-block" style="font-size: 15px;">
                  🛡️ Faturayı Resmî Olarak Düzenle
                </button>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <button type="button" id="btn-save-draft" class="btn btn-outline btn-sm" style="font-weight: 600;">
                    💾 Taslak Kaydet
                  </button>
                  <button type="button" id="btn-preview-slip" class="btn btn-outline btn-sm" style="font-weight: 600;">
                    👁️ Önizleme
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    // 1. Customer Search with Live Autocomplete
    const searchInput = document.getElementById('customer-search-input');
    const searchResults = document.getElementById('customer-search-results');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchTimeout);
        const query = e.target.value.trim();
        if (!query) {
          searchResults.style.display = 'none';
          return;
        }

        this.searchTimeout = setTimeout(async () => {
          try {
            const res = await API.getCustomers(query);
            const customers = res.customers || [];
            if (customers.length === 0) {
              searchResults.innerHTML = `
                <div style="padding: 12px 16px; font-size: 13px; color: #94a3b8; text-align: center;">
                  Müşteri bulunamadı. <a href="javascript:void(0)" id="link-create-from-search" style="color: #2563eb; font-weight: 600;">Yeni Ekle</a>
                </div>
              `;
              searchResults.style.display = 'block';
              document.getElementById('link-create-from-search')?.addEventListener('click', () => {
                Modals.showCustomerModal((newCust) => {
                  State.setSelectedCustomer(newCust);
                  App.render();
                });
              });
            } else {
              searchResults.innerHTML = customers.map(c => `
                <div class="dropdown-item" data-cust-id="${c.id}">
                  <div>
                    <div style="font-weight: 700; font-size: 14px; color: #0f172a;">
                      ${c.customer_type === 'INDIVIDUAL' ? `${c.first_name} ${c.last_name}` : c.company_name}
                    </div>
                    <div style="font-size: 11px; color: #64748b;">
                      ${c.tax_number} &nbsp;|&nbsp; ${c.phone || '-'} &nbsp;|&nbsp; ${c.city || ''}
                    </div>
                  </div>
                  <span class="badge ${c.customer_type === 'INDIVIDUAL' ? 'badge-info' : 'badge-success'}">
                    ${c.customer_type === 'INDIVIDUAL' ? 'Bireysel' : 'Kurumsal'}
                  </span>
                </div>
              `).join('');
              searchResults.style.display = 'block';

              // Bind selection
              searchResults.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                  const cust = customers.find(x => x.id === item.dataset.custId);
                  if (cust) {
                    State.setSelectedCustomer(cust);
                    App.render();
                  }
                });
              });
            }
          } catch (err) {
            console.error('Customer search error:', err);
          }
        }, 200);
      });
    }

    // 2. Change Customer Button
    document.getElementById('btn-change-customer')?.addEventListener('click', () => {
      State.setSelectedCustomer(null);
      App.render();
    });

    // 3. Quick New Customer Button
    document.getElementById('btn-quick-new-customer')?.addEventListener('click', () => {
      Modals.showCustomerModal((newCust) => {
        State.setSelectedCustomer(newCust);
        App.render();
      });
    });

    // 3.1. One-click Retail / Nihai Tüketici Customer Button
    document.getElementById('btn-quick-retail-customer')?.addEventListener('click', () => {
      State.setSelectedCustomer({
        id: 'retail',
        customer_type: 'INDIVIDUAL',
        first_name: 'Nihai',
        last_name: 'Tüketici',
        tax_number: '11111111111',
        city: 'İstanbul',
        district: '',
        address: 'Perakende Satış Müşterisi'
      });
      Toast.success('Nihai Tüketici (Bireysel) müşteri olarak seçildi.');
      App.render();
    });

    // 4. Click on POS Service Cards -> Opens Amount Entry Modal
    document.querySelectorAll('.pos-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = {
          id: btn.dataset.cardId,
          name: btn.dataset.cardName,
          vat_rate: parseFloat(btn.dataset.cardVat),
          default_price: parseFloat(btn.dataset.cardPrice),
          unit: btn.dataset.cardUnit
        };

        Modals.showAmountModal(card, (item) => {
          State.addCartItem(item);
          App.render();
        });
      });
    });

    // 5. Delete Cart Item Line
    document.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        State.removeCartItem(idx);
        App.render();
      });
    });

    // 6. Clear Cart
    document.getElementById('btn-clear-cart')?.addEventListener('click', () => {
      if (confirm('Fatura sepetindeki tüm satırlar silinsin mi?')) {
        State.cartItems = [];
        State.notify();
        App.render();
      }
    });

    // 7. Save Draft
    document.getElementById('btn-save-draft')?.addEventListener('click', async () => {
      if (State.cartItems.length === 0) {
        Toast.error('Lütfen önce bir hizmet kartına dokunarak tutar ekleyiniz.');
        return;
      }

      if (!State.selectedCustomer) {
        // Auto-assign Retail customer if none selected to make draft saving effortless
        State.setSelectedCustomer({
          id: 'retail',
          customer_type: 'INDIVIDUAL',
          first_name: 'Nihai',
          last_name: 'Tüketici',
          tax_number: '11111111111',
          city: 'İstanbul',
          district: '',
          address: 'Perakende Satış'
        });
        Toast.info('Müşteri seçilmediği için "Nihai Tüketici" olarak atandı.');
      }

      const notes = document.getElementById('invoice-notes-input')?.value || '';
      const saveBtn = document.getElementById('btn-save-draft');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Kaydediliyor...';

      try {
        const payload = {
          customerId: State.selectedCustomer.id,
          invoiceMode: 'QUICK',
          notes,
          items: State.cartItems
        };
        const res = await API.createInvoice(payload);
        Toast.success(`Fatura taslağı oluşturuldu: ${res.invoice.invoice_number}`);
        const invoiceId = res.invoice.id;
        const invoiceNum = res.invoice.invoice_number;
        State.clearCart();
        App.render();
        // Immediately open preview & print modal for the saved draft
        Modals.showPrintModal(invoiceId, invoiceNum);
      } catch (err) {
        Toast.error(err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Taslak Kaydet';
      }
    });

    // 8. Official GİB Submit (Triggers GİB SMS Verification Flow!)
    document.getElementById('btn-official-submit')?.addEventListener('click', async () => {
      if (State.cartItems.length === 0) {
        Toast.error('Lütfen önce bir hizmet kartına dokunarak fatura tutarını giriniz.');
        return;
      }

      if (!State.selectedCustomer) {
        Toast.error('Lütfen faturanın düzenleneceği müşteriyi seçiniz (veya ⚡ Nihai Tüketici butonuna basınız).');
        document.getElementById('customer-search-input')?.focus();
        return;
      }

      const submitBtn = document.getElementById('btn-official-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'GİB e-Arşiv Bağlanıyor... Lütfen Bekleyiniz...';

      const notes = document.getElementById('invoice-notes-input')?.value || '';

      try {
        // Step 1: Create draft invoice in backend
        const draftRes = await API.createInvoice({
          customerId: State.selectedCustomer.id,
          invoiceMode: 'QUICK',
          notes,
          items: State.cartItems
        });

        const invoiceId = draftRes.invoice.id;

        // Step 2: Request GİB SMS verification code
        const smsRes = await API.requestGibSms(invoiceId);

        submitBtn.disabled = false;
        submitBtn.textContent = '🛡️ Faturayı Resmî Olarak Düzenle';

        // Step 3: Open SMS modal for user to enter code received on phone
        Modals.showSmsModal(invoiceId, smsRes, (finalizedInvoice) => {
          State.clearCart();
          Modals.showPrintModal(finalizedInvoice.id, finalizedInvoice.invoice_number);
          window.location.hash = '#/invoices';
        });
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = '🛡️ Faturayı Resmî Olarak Düzenle';
        Toast.error(err.message);
      }
    });

    // 9. Live Preview (A4 & 80mm Thermal Receipt)
    document.getElementById('btn-preview-slip')?.addEventListener('click', async () => {
      if (State.cartItems.length === 0) {
        Toast.error('Önizleme yapabilmek için lütfen önce bir hizmet kartına dokunarak tutar giriniz.');
        return;
      }

      const notes = document.getElementById('invoice-notes-input')?.value || '';
      const previewBtn = document.getElementById('btn-preview-slip');
      previewBtn.disabled = true;
      previewBtn.textContent = 'Hazırlanıyor...';

      try {
        const res = await API.previewInvoiceDraft({
          customerId: State.selectedCustomer?.id,
          items: State.cartItems,
          notes
        });

        Modals.showLiveHtmlModal(
          'Fatura Önizlemesi (A4 Resmî Format & 80mm Termal POS Fişi)',
          res.a4Html,
          res.thermalHtml,
          async () => {
            // Save draft callback from within preview modal
            if (!State.selectedCustomer) {
              State.setSelectedCustomer({
                id: 'retail',
                customer_type: 'INDIVIDUAL',
                first_name: 'Nihai',
                last_name: 'Tüketici',
                tax_number: '11111111111',
                city: 'İstanbul',
                district: '',
                address: 'Perakende Satış Müşterisi'
              });
            }
            const saveRes = await API.createInvoice({
              customerId: State.selectedCustomer.id,
              invoiceMode: 'QUICK',
              notes,
              items: State.cartItems
            });
            Toast.success(`Fatura taslağı kaydedildi: ${saveRes.invoice.invoice_number}`);
            State.clearCart();
            App.render();
          }
        );
      } catch (err) {
        Toast.error(err.message || 'Önizleme oluşturulamadı.');
      } finally {
        previewBtn.disabled = false;
        previewBtn.textContent = '👁️ Önizleme';
      }
    });
  }
};

window.QuickInvoiceView = QuickInvoiceView;
