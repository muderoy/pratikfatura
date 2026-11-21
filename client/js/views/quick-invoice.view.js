/**
 * KESFATURA.COM - Hızlı Fatura Kesme (Adım Adım Sihirbaz)
 * Adım 1: Fatura Tarihi Belirleme Ekranı
 */

const QuickInvoiceView = {
  currentStep: 1,

  async render() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate();

    // Ayların Türkçe İsimleri
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

    // Gün Seçenekleri (1-31)
    let daysOptionsHtml = '<option value="">Gün Seçiniz</option>';
    for (let d = 1; d <= 31; d++) {
      const val = d < 10 ? '0' + d : '' + d;
      const isSelected = d === currentDay ? 'selected' : '';
      daysOptionsHtml += `<option value="${val}" ${isSelected}>${d}</option>`;
    }

    // Ay Seçenekleri (1-12)
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

        <!-- 1. Adım: Fatura Tarihi Kartı -->
        <div class="card" style="background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
            <div style="font-size: 16px; font-weight: 700; color: #f1f5f9; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-flex; width: 24px; height: 24px; background: #3b82f6; color: #fff; border-radius: 50%; font-size: 12px; align-items: center; justify-content: center; font-weight: 800;">1</span>
              Fatura Tarihi Giriniz
            </div>
            <span style="font-size: 12px; color: #64748b; font-weight: 600;">Adım 1 / 4</span>
          </div>

          <!-- Gün ve Ay Seçimi (Aşağı Doğru Çoktan Seçmeli) -->
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

          <!-- Yıl Bilgisi (Gün ve Ayın Altında - Sistemden Otomatik) -->
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
  },

  bindEvents() {
    const today = new Date();
    const currentYear = today.getFullYear();

    // 1. "Bugün Tarihli Kes" Butonu -> Doğrudan bugünün tarihini alıp 2. Adıma geçer
    document.getElementById('btn-today-invoice')?.addEventListener('click', () => {
      const d = today.getDate();
      const m = today.getMonth() + 1;
      const dayStr = d < 10 ? '0' + d : '' + d;
      const monthStr = m < 10 ? '0' + m : '' + m;
      const invoiceDate = `${currentYear}-${monthStr}-${dayStr}`;

      State.invoiceDraftDate = invoiceDate;
      Toast.success(`Fatura Tarihi: ${dayStr}.${monthStr}.${currentYear} olarak belirlendi.`);
      
      // 2. Adıma geçiş (Fatura Alıcısı)
      this.goToNextStep(2);
    });

    // 2. "Seçilen Tarih ile Devam Et" Butonu
    document.getElementById('btn-submit-date')?.addEventListener('click', () => {
      const day = document.getElementById('select-invoice-day')?.value;
      const month = document.getElementById('select-invoice-month')?.value;

      if (!day || !month) {
        Toast.error('Lütfen fatura günü ve ayını seçiniz.');
        return;
      }

      const invoiceDate = `${currentYear}-${month}-${day}`;
      State.invoiceDraftDate = invoiceDate;
      Toast.success(`Fatura Tarihi: ${day}.${month}.${currentYear} kaydedildi.`);

      // 2. Adıma geçiş
      this.goToNextStep(2);
    });

    // Gün ve Ay değiştiğinde otomatik kaydetme / hazırlık
    const daySelect = document.getElementById('select-invoice-day');
    const monthSelect = document.getElementById('select-invoice-month');
    
    [daySelect, monthSelect].forEach(sel => {
      sel?.addEventListener('change', () => {
        const d = daySelect.value;
        const m = monthSelect.value;
        if (d && m) {
          State.invoiceDraftDate = `${currentYear}-${m}-${d}`;
        }
      });
    });
  },

  goToNextStep(stepNumber) {
    this.currentStep = stepNumber;
    if (stepNumber === 2) {
      Toast.info('2. Adım: Fatura Alıcısının Girilmesi ekranı hazırlanıyor...');
    }
  }
};

window.QuickInvoiceView = QuickInvoiceView;
