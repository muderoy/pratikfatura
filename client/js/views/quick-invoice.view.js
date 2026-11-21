/**
 * KESFATURA.COM - Hızlı Fatura Kesme (Adım Adım Sihirbaz)
 * Adım 1: Fatura Tarihi
 * Adım 2: Fatura Alıcısı (Müşteri Seçimi / Arama / Ekleme)
 */

const QuickInvoiceView = {
  currentStep: 1,
  searchTimeout: null,

  async render() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate();

    // Seçili fatura tarihi (varsayılan bugün)
    if (!State.invoiceDraftDate) {
      const dStr = currentDay < 10 ? '0' + currentDay : '' + currentDay;
      const mStr = currentMonth < 10 ? '0' + currentMonth : '' + currentMonth;
      State.invoiceDraftDate = `${currentYear}-${mStr}-${dStr}`;
    }

    // =========================================================================
    // 1. ADIM: FATURA TARİHİ EKRANI
    // =========================================================================
    if (this.currentStep === 1) {
      const months = [
        { num: 1, name: 'Ocak' },
        { num: 2, name: 'Şubat' },
        { num: 3, name: 'Mart' },
        { num: 4, name: 'Nisan' },
        { num: 5, name: 'Mayıs' },
        { num: 6, name: 'Haziran' },
        { num: 7, name: 'Temmuz' },
        { num: 8, name: 'Ağustos' },
        { num: 9, name: 'Eylül' },
        { num: 10, name: 'Ekim' },
        { num: 11, name: 'Kasım' },
        { num: 12, name: 'Aralık' }
      ];

      let daysOptionsHtml = '<option value="">Gün Seçiniz</option>';
      for (let d = 1; d <= 31; d++) {
        const val = d < 10 ? '0' + d : '' + d;
        const isSelected = d === currentDay ? 'selected' : '';
        daysOptionsHtml += `<option value="${val}" ${isSelected}>${d}</option>`;
      }

      let monthsOptionsHtml = '<option value="">Ay Seçiniz</option>';
      months.forEach(m => {
        const val = m.num < 10 ? '0' + m.num : '' + m.num;
        const isSelected = m.num === currentMonth ? 'selected' : '';
        monthsOptionsHtml += `<option value="${val}" ${isSelected}>${m.num} - ${m.name}</option>`;
      });

      return `
        <div class="content-area" style="max-width: 600px; margin: 0 auto; padding-top: 24px;">
          <!-- Sayfa Başlığı ve Bilgilendirme -->
          <div style="margin-bottom: 24px;">
            <h1 style="font-size: 26px; font-weight: 800; color: #f8fafc; letter-spacing: -0.5px; margin-bottom: 6px;">
              HIZLI FATURA KES
            </h1>
            <div style="font-size: 13px; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
              <span>Son Kesilen Fatura Tarihi:</span>
              <strong style="color: #60a5fa; background: rgba(59, 130, 246, 0.15); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.3);">
                18.11.2026
              </strong>
            </div>
          </div>

          <!-- 1. Adım Kartı -->
          <div class="card" style="background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
              <div style="font-size: 16px; font-weight: 700; color: #f1f5f9; display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-flex; width: 24px; height: 24px; background: #3b82f6; color: #fff; border-radius: 50%; font-size: 12px; align-items: center; justify-content: center; font-weight: 800;">1</span>
                Fatura Tarihi Giriniz
              </div>
              <span style="font-size: 12px; color: #64748b; font-weight: 600;">Adım 1 / 4</span>
            </div>

            <!-- Gün ve Ay Seçimi (Yan Yana) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
              <div>
                <label for="select-invoice-day" style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; display: block;">
                  Fatura Günü
                </label>
                <select id="select-invoice-day" class="form-input" style="height: 48px; background: #0b0f19; border: 1px solid #1e293b; color: #f8fafc; font-size: 15px; font-weight: 600; border-radius: 10px; padding: 0 12px; width: 100%; outline: none;">
                  ${daysOptionsHtml}
                </select>
              </div>

              <div>
                <label for="select-invoice-month" style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; display: block;">
                  Fatura Ayı
                </label>
                <select id="select-invoice-month" class="form-input" style="height: 48px; background: #0b0f19; border: 1px solid #1e293b; color: #f8fafc; font-size: 15px; font-weight: 600; border-radius: 10px; padding: 0 12px; width: 100%; outline: none;">
                  ${monthsOptionsHtml}
                </select>
              </div>
            </div>

            <!-- Fatura Yılı (Gün ve Ayın Altında) -->
            <div style="margin-bottom: 24px;">
              <label style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; display: block;">
                Fatura Yılı
              </label>
              <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; padding: 12px 16px; font-size: 16px; font-weight: 700; color: #60a5fa; display: flex; justify-content: space-between; align-items: center;">
                <span>${currentYear}</span>
                <span style="font-size: 11px; background: #1e293b; color: #94a3b8; padding: 3px 8px; border-radius: 6px;">Sistemden Otomatik</span>
              </div>
            </div>

            <!-- Devam Et Butonu -->
            <button type="button" id="btn-submit-date" class="btn btn-primary btn-block" style="height: 50px; font-size: 15px; font-weight: 700; border-radius: 10px; margin-bottom: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>Seçilen Tarih ile Devam Et</span>
              <span>➔</span>
            </button>

            <!-- Bugün Tarihli Kes Butonu -->
            <button type="button" id="btn-today-invoice" class="btn btn-block" style="height: 50px; font-size: 15px; font-weight: 700; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; border: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25); display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
              <span>⚡ Bugün Tarihli Kes</span>
              <span style="font-size: 12px; opacity: 0.9; font-weight: normal;">(${currentDay < 10 ? '0' + currentDay : currentDay}.${currentMonth < 10 ? '0' + currentMonth : currentMonth}.${currentYear})</span>
            </button>
          </div>
        </div>
      `;
    }

    // =========================================================================
    // 2. ADIM: FATURA ALICISI (MÜŞTERİ SEÇİMİ) EKRANI
    // =========================================================================
    const selectedCust = State.selectedCustomer;

    return `
      <div class="content-area" style="max-width: 600px; margin: 0 auto; padding-top: 24px;">
        <!-- Sayfa Başlığı ve Seçilen Tarih Özeti -->
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: #f8fafc; letter-spacing: -0.5px; margin-bottom: 4px;">
              HIZLI FATURA KES
            </h1>
            <div style="font-size: 13px; color: #94a3b8;">
              Fatura Tarihi: <strong style="color: #60a5fa;">${State.invoiceDraftDate || 'Bugün'}</strong>
            </div>
          </div>
          <button type="button" id="btn-back-to-step1" class="btn btn-outline btn-sm" style="border-color: #334155; color: #94a3b8; font-size: 12px;">
            ← Tarihi Değiştir
          </button>
        </div>

        <!-- 2. Adım Kartı: Fatura Alıcısını Giriniz -->
        <div class="card" style="background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
            <div style="font-size: 16px; font-weight: 700; color: #f1f5f9; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-flex; width: 24px; height: 24px; background: #3b82f6; color: #fff; border-radius: 50%; font-size: 12px; align-items: center; justify-content: center; font-weight: 800;">2</span>
              Fatura Alıcısını Giriniz
            </div>
            <span style="font-size: 12px; color: #64748b; font-weight: 600;">Adım 2 / 4</span>
          </div>

          ${selectedCust ? `
            <!-- Seçilen Müşteri Özeti -->
            <div style="background: #0b0f19; border: 1px solid #3b82f6; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <span class="badge ${selectedCust.customer_type === 'INDIVIDUAL' ? 'badge-info' : 'badge-success'}" style="margin-bottom: 8px;">
                    ${selectedCust.customer_type === 'INDIVIDUAL' ? 'Bireysel Müşteri' : 'Kurumsal Şirket'}
                  </span>
                  <div style="font-size: 16px; font-weight: 800; color: #f8fafc; margin-bottom: 4px;">
                    ${selectedCust.customer_type === 'INDIVIDUAL' ? `${selectedCust.first_name || ''} ${selectedCust.last_name || ''}` : selectedCust.company_name}
                  </div>
                  <div style="font-size: 12px; color: #94a3b8;">
                    <strong>VKN/TCKN:</strong> ${selectedCust.tax_number}
                    ${selectedCust.city ? ` &nbsp;|&nbsp; ${selectedCust.district || ''}/${selectedCust.city}` : ''}
                  </div>
                </div>
                <button type="button" id="btn-change-selected-customer" class="btn btn-outline btn-sm" style="font-size: 11px; border-color: #334155; color: #94a3b8;">
                  Değiştir
                </button>
              </div>
            </div>

            <!-- Seçilen Müşteri ile İleri Butonu -->
            <button type="button" id="btn-proceed-to-step3" class="btn btn-primary btn-block" style="height: 50px; font-size: 15px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>Alıcı Onaylandı, 3. Adıma Geç</span>
              <span>➔</span>
            </button>
          ` : `
            <!-- Müşteri Arama Metin Kutusu -->
            <div style="position: relative; margin-bottom: 18px;">
              <label style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; display: block;">
                Müşteri Ara veya Seç
              </label>
              <div style="position: relative;">
                <span style="position: absolute; left: 14px; top: 14px; color: #64748b; font-size: 16px;">🔍</span>
                <input 
                  type="text" 
                  id="customer-search-input" 
                  class="form-input" 
                  placeholder="Müşteri TC No, Vergi no, adı veya telefonu..." 
                  autocomplete="off"
                  style="height: 50px; background: #0b0f19; border: 1px solid #1e293b; color: #f8fafc; font-size: 14px; border-radius: 10px; padding-left: 44px; width: 100%; outline: none;"
                >
              </div>
              <div id="customer-search-results" class="dropdown-results" style="display: none; background: #0f172a; border-color: #1e293b;"></div>
            </div>

            <!-- İki Adet Yan Yana Hızlı Buton -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <!-- 1. Buton: Nihai Tüketici (Bireysel) -->
              <button 
                type="button" 
                id="btn-quick-retail-customer" 
                class="btn" 
                style="height: 48px; background: #064e3b; border: 1px solid #059669; color: #6ee7b7; font-size: 13px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;"
              >
                <span>⚡ Nihai Tüketici</span>
                <span style="font-size: 11px; opacity: 0.8; font-weight: normal;">(Bireysel)</span>
              </button>

              <!-- 2. Buton: + Yeni Müşteri Ekle -->
              <button 
                type="button" 
                id="btn-quick-new-customer" 
                class="btn" 
                style="height: 48px; background: #1e293b; border: 1px solid #3b82f6; color: #60a5fa; font-size: 13px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;"
              >
                <span>➕ Yeni Müşteri Ekle</span>
              </button>
            </div>
          `}
        </div>
      </div>
    `;
  },

  bindEvents() {
    const today = new Date();
    const currentYear = today.getFullYear();

    // =========================================================================
    // 1. ADIM OLAYLARI (EVENTS)
    // =========================================================================
    if (this.currentStep === 1) {
      document.getElementById('btn-today-invoice')?.addEventListener('click', () => {
        const d = today.getDate();
        const m = today.getMonth() + 1;
        const dayStr = d < 10 ? '0' + d : '' + d;
        const monthStr = m < 10 ? '0' + m : '' + m;
        State.invoiceDraftDate = `${currentYear}-${monthStr}-${dayStr}`;

        this.currentStep = 2;
        App.render();
      });

      document.getElementById('btn-submit-date')?.addEventListener('click', () => {
        const day = document.getElementById('select-invoice-day')?.value;
        const month = document.getElementById('select-invoice-month')?.value;

        if (!day || !month) {
          Toast.error('Lütfen fatura günü ve ayını seçiniz.');
          return;
        }

        State.invoiceDraftDate = `${currentYear}-${month}-${day}`;
        this.currentStep = 2;
        App.render();
      });

      return;
    }

    // =========================================================================
    // 2. ADIM OLAYLARI (EVENTS)
    // =========================================================================
    if (this.currentStep === 2) {
      // 1. Adıma Geri Dön
      document.getElementById('btn-back-to-step1')?.addEventListener('click', () => {
        this.currentStep = 1;
        App.render();
      });

      // Seçili Müşteriyi Değiştir
      document.getElementById('btn-change-selected-customer')?.addEventListener('click', () => {
        State.setSelectedCustomer(null);
        App.render();
      });

      // 3. Adıma İlerle
      document.getElementById('btn-proceed-to-step3')?.addEventListener('click', () => {
        Toast.info('3. Adım: Hizmet / Ürün ve Tutar Girilmesi ekranı hazırlanıyor...');
      });

      // Hızlı Nihai Tüketici Butonu (Tek tıkla atar)
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
        Toast.success('Nihai Tüketici (Bireysel) alıcı olarak seçildi.');
        App.render();
      });

      // Yeni Müşteri Ekle Modalını Aç
      document.getElementById('btn-quick-new-customer')?.addEventListener('click', () => {
        Modals.showCustomerModal((newCust) => {
          State.setSelectedCustomer(newCust);
          App.render();
        });
      });

      // Canlı Müşteri Arama (TCKN, VKN, İsim, Tel)
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
                    Müşteri bulunamadı. <a href="javascript:void(0)" id="link-create-from-search" style="color: #60a5fa; font-weight: 600;">Yeni Ekle</a>
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
                  <div class="dropdown-item" data-cust-id="${c.id}" style="padding: 12px 14px; border-bottom: 1px solid #1e293b; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-weight: 700; font-size: 14px; color: #f8fafc;">
                        ${c.customer_type === 'INDIVIDUAL' ? `${c.first_name || ''} ${c.last_name || ''}` : c.company_name}
                      </div>
                      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                        ${c.tax_number} &nbsp;|&nbsp; ${c.phone || '-'} &nbsp;|&nbsp; ${c.city || ''}
                      </div>
                    </div>
                    <span class="badge ${c.customer_type === 'INDIVIDUAL' ? 'badge-info' : 'badge-success'}">
                      ${c.customer_type === 'INDIVIDUAL' ? 'Bireysel' : 'Kurumsal'}
                    </span>
                  </div>
                `).join('');
                searchResults.style.display = 'block';

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
    }
  }
};

window.QuickInvoiceView = QuickInvoiceView;
