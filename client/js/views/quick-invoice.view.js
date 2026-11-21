/**
 * KESFATURA.COM - Hızlı Fatura Kesme (Adım Adım Sihirbaz)
 * Adım 1: Fatura Tarihi
 * Adım 2: Fatura Alıcısı (Müşteri Seçimi / Arama / Ekleme)
 * Adım 3: Mal / Hizmet Kartı Seçimi ve Fatura Özeti
 * Adım 4: Tam Fatura Önizleme Ekranı (Düzelt / Onayla)
 */

const QuickInvoiceView = {
  currentStep: 1,
  searchTimeout: null,
  quickCards: [],

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

          <div class="card" style="background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
              <div style="font-size: 16px; font-weight: 700; color: #f1f5f9; display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-flex; width: 24px; height: 24px; background: #3b82f6; color: #fff; border-radius: 50%; font-size: 12px; align-items: center; justify-content: center; font-weight: 800;">1</span>
                Fatura Tarihi Giriniz
              </div>
              <span style="font-size: 12px; color: #64748b; font-weight: 600;">Adım 1 / 4</span>
            </div>

            <!-- Gün ve Ay Seçimi -->
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

            <!-- Fatura Yılı -->
            <div style="margin-bottom: 24px;">
              <label style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; display: block;">
                Fatura Yılı
              </label>
              <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; padding: 12px 16px; font-size: 16px; font-weight: 700; color: #60a5fa; display: flex; justify-content: space-between; align-items: center;">
                <span>${currentYear}</span>
                <span style="font-size: 11px; background: #1e293b; color: #94a3b8; padding: 3px 8px; border-radius: 6px;">Sistemden Otomatik</span>
              </div>
            </div>

            <button type="button" id="btn-submit-date" class="btn btn-primary btn-block" style="height: 50px; font-size: 15px; font-weight: 700; border-radius: 10px; margin-bottom: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>Seçilen Tarih ile Devam Et</span>
              <span>➔</span>
            </button>

            <button type="button" id="btn-today-invoice" class="btn btn-block" style="height: 50px; font-size: 15px; font-weight: 700; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; border: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25); display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
              <span>⚡ Bugün Tarihli Kes</span>
              <span style="font-size: 12px; opacity: 0.9; font-weight: normal;">(${currentDay < 10 ? '0' + currentDay : currentDay}.${currentMonth < 10 ? '0' + currentMonth : currentMonth}.${currentYear})</span>
            </button>
          </div>
        </div>
      `;
    }

    // =========================================================================
    // 2. ADIM: FATURA ALICISI EKRANI
    // =========================================================================
    if (this.currentStep === 2) {
      const selectedCust = State.selectedCustomer;

      return `
        <div class="content-area" style="max-width: 600px; margin: 0 auto; padding-top: 24px;">
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

          <div class="card" style="background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
              <div style="font-size: 16px; font-weight: 700; color: #f1f5f9; display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-flex; width: 24px; height: 24px; background: #3b82f6; color: #fff; border-radius: 50%; font-size: 12px; align-items: center; justify-content: center; font-weight: 800;">2</span>
                Fatura Alıcısını Giriniz
              </div>
              <span style="font-size: 12px; color: #64748b; font-weight: 600;">Adım 2 / 4</span>
            </div>

            ${selectedCust ? `
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

              <button type="button" id="btn-proceed-to-step3" class="btn btn-primary btn-block" style="height: 50px; font-size: 15px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>Alıcı Onaylandı, 3. Adıma Geç</span>
                <span>➔</span>
              </button>
            ` : `
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

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <button 
                  type="button" 
                  id="btn-quick-retail-customer" 
                  class="btn" 
                  style="height: 48px; background: #064e3b; border: 1px solid #059669; color: #6ee7b7; font-size: 13px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;"
                >
                  <span>⚡ Nihai Tüketici</span>
                  <span style="font-size: 11px; opacity: 0.8; font-weight: normal;">(Bireysel)</span>
                </button>

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
    }

    // =========================================================================
    // 3. ADIM: MAL / HİZMET KARTI VE FATURA ÖZETİ
    // =========================================================================
    if (this.currentStep === 3) {
      try {
        const res = await API.getQuickCards();
        this.quickCards = (res.cards || []).slice(0, 6);
      } catch (e) {
        console.error('Quick cards fetch error:', e);
      }

      const selectedCust = State.selectedCustomer;
      const custTitle = selectedCust ? (selectedCust.customer_type === 'INDIVIDUAL' ? `${selectedCust.first_name || ''} ${selectedCust.last_name || ''}` : selectedCust.company_name) : 'Nihai Tüketici';
      const cartItems = State.cartItems;
      const totals = State.getCartTotals();

      const cardsHtml = this.quickCards.map(c => `
        <div class="pos-card-btn" data-card-id="${c.id}" data-card-name="${c.name}" data-card-vat="${c.vat_rate}" data-card-price="${c.default_price || 0}" data-card-unit="${c.unit || 'Adet'}" style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.15s ease; min-height: 85px; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="font-weight: 700; font-size: 14px; color: #f8fafc; line-height: 1.3;">
            ${c.name}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <span style="font-size: 11px; background: #1e293b; color: #60a5fa; padding: 2px 6px; border-radius: 4px; font-weight: 600;">%${c.vat_rate} KDV</span>
            <span style="font-size: 11px; color: #94a3b8;">${c.unit || 'Adet'}</span>
          </div>
        </div>
      `).join('');

      let cartLinesHtml = '';
      if (cartItems.length === 0) {
        cartLinesHtml = `
          <div style="text-align: center; padding: 20px 10px; color: #64748b; font-size: 13px;">
            Yukarıdaki kartlara dokunarak hizmet ve tutar ekleyiniz.
          </div>
        `;
      } else {
        cartLinesHtml = cartItems.map((it, idx) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #0b0f19; border: 1px solid #1e293b; border-radius: 8px; margin-bottom: 8px;">
            <div>
              <div style="font-size: 13px; font-weight: 700; color: #f8fafc;">${it.name}</div>
              <div style="font-size: 11px; color: #94a3b8;">${it.quantity} ${it.unit} &nbsp;|&nbsp; %${it.vatRate} KDV Dahil</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="font-size: 14px; font-weight: 700; color: #60a5fa;">${State.formatCurrency(it.unitPrice * it.quantity)}</div>
              <button type="button" class="btn-remove-item" data-index="${idx}" style="background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer;" title="Sil">✕</button>
            </div>
          </div>
        `).join('');
      }

      return `
        <div class="content-area" style="max-width: 600px; margin: 0 auto; padding-top: 20px;">
          <!-- Sayfa Üst Bilgisi (Küçük Özet) -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 10px 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; flex-wrap: wrap; gap: 6px;">
            <div style="color: #94a3b8; display: flex; align-items: center; gap: 6px;">
              <span>📅 Tarih: <strong style="color: #f8fafc;">${State.invoiceDraftDate}</strong></span>
              <span>&bull;</span>
              <span>👤 Alıcı: <strong style="color: #60a5fa;">${custTitle}</strong></span>
            </div>
            <button type="button" id="btn-back-to-step2" class="btn btn-outline btn-sm" style="font-size: 11px; padding: 3px 8px; border-color: #334155; color: #94a3b8;">
              ← Değiştir
            </button>
          </div>

          <!-- 3. Adım: Mal/Hizmet Kartı Seçiniz -->
          <div class="card" style="background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); margin-bottom: 20px;">
            <div style="font-size: 15px; font-weight: 700; color: #f1f5f9; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-flex; width: 22px; height: 22px; background: #3b82f6; color: #fff; border-radius: 50%; font-size: 11px; align-items: center; justify-content: center; font-weight: 800;">3</span>
              Mal / Hizmet Kartı Seçiniz
            </div>

            <!-- 6 Adet Buton Şeklinde Hizmet Kartı -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 8px;">
              ${cardsHtml}
            </div>
          </div>

          <!-- Fatura Özeti -->
          <div class="card" style="background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); margin-bottom: 20px;">
            <div style="font-size: 15px; font-weight: 700; color: #f1f5f9; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
              Fatura Özeti
            </div>

            <!-- Eklenen Kalemler -->
            <div style="margin-bottom: 14px;">
              ${cartLinesHtml}
            </div>

            <!-- Toplam Rakamlar -->
            ${cartItems.length > 0 ? `
              <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
                  <span>KDV Matrahı:</span>
                  <strong style="color: #f8fafc;">${State.formatCurrency(totals.subtotal)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 8px;">
                  <span>Hesaplanan KDV:</span>
                  <strong style="color: #f8fafc;">${State.formatCurrency(totals.vatTotal)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #38bdf8; border-top: 1px solid #1e293b; padding-top: 8px;">
                  <span>GENEL TOPLAM:</span>
                  <span>${State.formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            ` : ''}

            <!-- Fatura Açıklaması -->
            <div style="margin-bottom: 18px;">
              <label style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; display: block;">
                Fatura Açıklaması / Not (İsteğe Bağlı)
              </label>
              <input type="text" id="invoice-notes-input" class="form-input" value="${State.invoiceDraftNotes || ''}" placeholder="Örn: 34 ABC 123 plakalı araç taşıma bedeli" style="height: 42px; font-size: 13px; background: #0b0f19; border: 1px solid #1e293b; color: #f8fafc; border-radius: 8px; width: 100%;">
            </div>

            <!-- Fatura Önizleme Butonu -->
            <button type="button" id="btn-preview-invoice-step" class="btn btn-primary btn-block" style="height: 52px; font-size: 15px; font-weight: 800; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
              <span>👁️ Fatura Önizleme</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      `;
    }

    // =========================================================================
    // 4. ADIM: TAM FATURA ÖNİZLEME SAYFASI (OKUNAKLI A4 / RESMÎ FORMAT)
    // =========================================================================
    if (this.currentStep === 4) {
      const selectedCust = State.selectedCustomer;
      const tenant = State.tenant || {
        name: 'Öz Nakliyat Lojistik Ltd. Şti.',
        tax_number: '1234567890',
        tax_office: 'Kadıköy V.D.',
        address: 'Bağdat Cad. No: 120/4 Kadıköy',
        city: 'İstanbul',
        district: 'Kadıköy',
        phone: '0216 555 10 20'
      };

      const custTitle = selectedCust ? (selectedCust.customer_type === 'INDIVIDUAL' ? `${selectedCust.first_name || ''} ${selectedCust.last_name || ''}` : selectedCust.company_name) : 'Nihai Tüketici';
      const custTax = selectedCust ? selectedCust.tax_number : '11111111111';
      const custAddr = selectedCust ? `${selectedCust.address || ''} ${selectedCust.district || ''}/${selectedCust.city || ''}` : 'Perakende Müşteri';
      const cartItems = State.cartItems;
      const totals = State.getCartTotals();
      const notes = State.invoiceDraftNotes || '';

      const itemsTableRows = cartItems.map((it, idx) => `
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 12px 10px; color: #94a3b8; font-size: 12px; text-align: center;">${idx + 1}</td>
          <td style="padding: 12px 10px; color: #f8fafc; font-size: 13px; font-weight: 700;">${it.name}</td>
          <td style="padding: 12px 10px; color: #f8fafc; font-size: 13px; text-align: center;">${it.quantity} ${it.unit}</td>
          <td style="padding: 12px 10px; color: #f8fafc; font-size: 13px; text-align: right;">${State.formatCurrency(it.unitPrice)}</td>
          <td style="padding: 12px 10px; color: #60a5fa; font-size: 12px; text-align: center; font-weight: 600;">%${it.vatRate}</td>
          <td style="padding: 12px 10px; color: #38bdf8; font-size: 14px; text-align: right; font-weight: 800;">${State.formatCurrency(it.unitPrice * it.quantity)}</td>
        </tr>
      `).join('');

      return `
        <div class="content-area" style="max-width: 680px; margin: 0 auto; padding-top: 20px;">
          <!-- Başlık -->
          <div style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="font-size: 22px; font-weight: 800; color: #f8fafc; margin-bottom: 4px;">
                FATURA ÖNİZLEME
              </h1>
              <div style="font-size: 12px; color: #94a3b8;">Lütfen fatura bilgilerini kontrol ediniz.</div>
            </div>
            <span style="font-size: 12px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; padding: 4px 10px; border-radius: 6px; font-weight: 700; border: 1px solid rgba(59, 130, 246, 0.3);">
              Adım 4 / 4
            </span>
          </div>

          <!-- Okunaklı Fatura Kağıdı / Önizleme Kartı -->
          <div class="card" style="background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 24px;">
            <!-- Fatura Tarih Bilgisi (Yazılar temizlendi) -->
            <div style="display: flex; justify-content: flex-end; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 18px;">
              <div style="font-size: 13px; color: #94a3b8;">
                Fatura Tarihi: <strong style="color: #60a5fa; font-size: 14px;">${State.invoiceDraftDate}</strong>
              </div>
            </div>

            <!-- Satıcı & Alıcı Bilgileri (2 Sütun Kutu) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
              <!-- Satıcı (Biz) -->
              <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;">
                <div style="font-size: 11px; font-weight: 700; color: #60a5fa; text-transform: uppercase; margin-bottom: 4px;">DÜZENLEYEN (SATICI)</div>
                <div style="font-size: 13px; font-weight: 800; color: #f8fafc; margin-bottom: 4px;">${tenant.name || 'İşletme'}</div>
                <div style="font-size: 11px; color: #94a3b8;">VKN: ${tenant.tax_number || '-'}</div>
                <div style="font-size: 11px; color: #94a3b8;">${tenant.city || ''}</div>
              </div>

              <!-- Alıcı (Müşteri) -->
              <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;">
                <div style="font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase; margin-bottom: 4px;">ALICI (MÜŞTERİ)</div>
                <div style="font-size: 13px; font-weight: 800; color: #f8fafc; margin-bottom: 4px;">${custTitle}</div>
                <div style="font-size: 11px; color: #94a3b8;">VKN/TCKN: ${custTax}</div>
                <div style="font-size: 11px; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${custAddr}</div>
              </div>
            </div>

            <!-- Kalemler Tablosu -->
            <div style="overflow-x: auto; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="background: #0b0f19; border-bottom: 1px solid #1e293b;">
                    <th style="padding: 10px; font-size: 11px; color: #94a3b8; text-transform: uppercase; text-align: center;">#</th>
                    <th style="padding: 10px; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Mal / Hizmet Açıklaması</th>
                    <th style="padding: 10px; font-size: 11px; color: #94a3b8; text-transform: uppercase; text-align: center;">Miktar</th>
                    <th style="padding: 10px; font-size: 11px; color: #94a3b8; text-transform: uppercase; text-align: right;">B. Fiyat</th>
                    <th style="padding: 10px; font-size: 11px; color: #94a3b8; text-transform: uppercase; text-align: center;">KDV</th>
                    <th style="padding: 10px; font-size: 11px; color: #94a3b8; text-transform: uppercase; text-align: right;">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsTableRows}
                </tbody>
              </table>
            </div>

            <!-- Fatura Notu Varsa -->
            ${notes ? `
              <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 12px; margin-bottom: 18px; font-size: 12px; color: #94a3b8;">
                <strong style="color: #f8fafc;">Fatura Notu:</strong> ${notes}
              </div>
            ` : ''}

            <!-- Toplam Tutarlar Tablosu -->
            <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; padding: 14px 18px; margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: #94a3b8; margin-bottom: 6px;">
                <span>KDV Matrahı (Net Tutar):</span>
                <strong style="color: #f8fafc;">${State.formatCurrency(totals.subtotal)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: #94a3b8; margin-bottom: 8px;">
                <span>Hesaplanan Toplam KDV:</span>
                <strong style="color: #f8fafc;">${State.formatCurrency(totals.vatTotal)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 800; color: #38bdf8; border-top: 1px solid #1e293b; padding-top: 10px;">
                <span style="font-size: 14px; font-weight: 700;">ÖDENECEK GENEL TOPLAM:</span>
                <span style="font-size: 16px;">${State.formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>

          <!-- Alt İşlem Butonları (Düzelt / Onayla) -->
          <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 14px; margin-bottom: 30px;">
            <!-- Düzelt Butonu (3. Adıma Geri Döner) -->
            <button type="button" id="btn-edit-invoice-draft" class="btn btn-outline" style="height: 52px; font-size: 15px; font-weight: 700; border-radius: 12px; border-color: #334155; color: #f8fafc; background: #1e293b; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
              <span>✏️ Düzelt</span>
            </button>

            <!-- Onayla Butonu (SMS Onay Sayfasına Yönlendirir) -->
            <button type="button" id="btn-confirm-and-send-sms" class="btn btn-success" style="height: 52px; font-size: 16px; font-weight: 800; border-radius: 12px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border: none; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35); display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
              <span>🛡️ Onayla (SMS Doğrula) ➔</span>
            </button>
          </div>
        </div>
      `;
    }
  },

  bindEvents() {
    const today = new Date();
    const currentYear = today.getFullYear();

    // =========================================================================
    // 1. ADIM OLAYLARI
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
    // 2. ADIM OLAYLARI
    // =========================================================================
    if (this.currentStep === 2) {
      document.getElementById('btn-back-to-step1')?.addEventListener('click', () => {
        this.currentStep = 1;
        App.render();
      });

      document.getElementById('btn-change-selected-customer')?.addEventListener('click', () => {
        State.setSelectedCustomer(null);
        App.render();
      });

      document.getElementById('btn-proceed-to-step3')?.addEventListener('click', () => {
        this.currentStep = 3;
        App.render();
      });

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
        this.currentStep = 3;
        App.render();
      });

      document.getElementById('btn-quick-new-customer')?.addEventListener('click', () => {
        Modals.showCustomerModal((newCust) => {
          State.setSelectedCustomer(newCust);
          this.currentStep = 3;
          App.render();
        });
      });

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
                    this.currentStep = 3;
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
                      this.currentStep = 3;
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

      return;
    }

    // =========================================================================
    // 3. ADIM OLAYLARI
    // =========================================================================
    if (this.currentStep === 3) {
      document.getElementById('btn-back-to-step2')?.addEventListener('click', () => {
        this.currentStep = 2;
        App.render();
      });

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

      document.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index, 10);
          State.removeCartItem(idx);
          App.render();
        });
      });

      // "Fatura Önizleme" Butonu -> 4. Adıma (Tam Önizleme Ekranına) Geçer
      document.getElementById('btn-preview-invoice-step')?.addEventListener('click', () => {
        if (State.cartItems.length === 0) {
          Toast.error('Önizleme yapabilmek için lütfen en az bir hizmet kartı ekleyiniz.');
          return;
        }

        const notes = document.getElementById('invoice-notes-input')?.value || '';
        State.invoiceDraftNotes = notes;

        // 4. Adıma geç
        this.currentStep = 4;
        App.render();
      });

      return;
    }

    // =========================================================================
    // 4. ADIM OLAYLARI (ÖNİZLEME: DÜZELT / ONAYLA)
    // =========================================================================
    if (this.currentStep === 4) {
      // 1. "Düzelt" Butonu -> 3. Adıma geri döner, bilgiler kaybolmaz
      document.getElementById('btn-edit-invoice-draft')?.addEventListener('click', () => {
        this.currentStep = 3;
        App.render();
      });

      // 2. "Onayla" Butonu -> Faturayı kaydeder ve GİB SMS Onay Ekranını açar
      document.getElementById('btn-confirm-and-send-sms')?.addEventListener('click', async () => {
        const confirmBtn = document.getElementById('btn-confirm-and-send-sms');
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span>GİB Portala Bağlanıyor... Lütfen Bekleyiniz...</span>';

        try {
          // 1. Taslak Fatura Oluştur
          const draftRes = await API.createInvoice({
            customerId: State.selectedCustomer ? State.selectedCustomer.id : 'retail',
            invoiceMode: 'QUICK',
            notes: State.invoiceDraftNotes || '',
            items: State.cartItems
          });

          const invoiceId = draftRes.invoice.id;

          // 2. GİB SMS Kodu İste
          const smsRes = await API.requestGibSms(invoiceId);

          confirmBtn.disabled = false;
          confirmBtn.innerHTML = '<span>🛡️ Onayla (SMS Doğrula) ➔</span>';

          // 3. Kullanıcıya GİB SMS Doğrulama Ekranını Aç
          Modals.showSmsModal(invoiceId, smsRes, (finalizedInvoice) => {
            State.clearCart();
            State.invoiceDraftNotes = '';
            Modals.showPrintModal(finalizedInvoice.id, finalizedInvoice.invoice_number);
            window.location.hash = '#/invoices';
          });
        } catch (err) {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = '<span>🛡️ Onayla (SMS Doğrula) ➔</span>';
          Toast.error(err.message || 'SMS kodu istenirken bir hata oluştu.');
        }
      });
    }
  }
};

window.QuickInvoiceView = QuickInvoiceView;
