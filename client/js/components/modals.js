/**
 * PRATİKFATURA Interactive Modals Component
 * - Customer Creation Modal
 * - POS Amount Entry Modal
 * - GİB SMS Verification Modal (CRITICAL)
 * - Invoice Print / Preview Modal (A4 & Thermal)
 */

const Modals = {
  // --- 1. Quick Customer Creation Modal ---
  showCustomerModal(onSuccess) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'modal-customer';

    backdrop.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="font-size: 17px; font-weight: 800; color: #f8fafc; letter-spacing: -0.3px;">➕ Yeni Müşteri Ekle</h3>
          <button type="button" class="btn btn-outline btn-sm modal-close" style="padding: 4px 10px; border-color: #334155; color: #94a3b8;">✕</button>
        </div>
        <form id="form-new-customer">
          <div class="modal-body">
            <div class="form-group" style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; padding: 12px 14px; margin-bottom: 18px;">
              <label class="form-label" style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">MÜŞTERİ TÜRÜ</label>
              <div style="display: flex; gap: 24px; color: #f8fafc; font-weight: 600; font-size: 14px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="radio" name="customerType" value="CORPORATE" checked id="cust-type-corp" style="accent-color: #3b82f6; width: 16px; height: 16px;"> Kurumsal (Şirket)
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="radio" name="customerType" value="INDIVIDUAL" id="cust-type-ind" style="accent-color: #3b82f6; width: 16px; height: 16px;"> Bireysel (Şahıs)
                </label>
              </div>
            </div>

            <div class="form-group" id="group-company">
              <label class="form-label">Firma Unvanı *</label>
              <input type="text" name="companyName" class="form-input" placeholder="Örn: Anadolu Lojistik Ltd. Şti.">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; display: none;" id="group-individual">
              <div class="form-group">
                <label class="form-label">Ad *</label>
                <input type="text" name="firstName" class="form-input" placeholder="Müşterinin Adı">
              </div>
              <div class="form-group">
                <label class="form-label">Soyad *</label>
                <input type="text" name="lastName" class="form-input" placeholder="Soyadı">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label" id="label-tax">VKN (10 Haneli) *</label>
                <input type="text" name="taxNumber" class="form-input" maxlength="11" placeholder="Vergi / TC Kimlik No" required>
              </div>
              <div class="form-group" id="group-tax-office">
                <label class="form-label">Vergi Dairesi</label>
                <input type="text" name="taxOffice" class="form-input" placeholder="Örn: Kadıköy V.D.">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Telefon</label>
                <input type="tel" name="phone" class="form-input" placeholder="05XX XXX XX XX">
              </div>
              <div class="form-group">
                <label class="form-label">E-Posta</label>
                <input type="email" name="email" class="form-input" placeholder="musteri@firma.com">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">İl</label>
                <input type="text" name="city" class="form-input" placeholder="Örn: İstanbul">
              </div>
              <div class="form-group">
                <label class="form-label">İlçe</label>
                <input type="text" name="district" class="form-input" placeholder="Örn: Kadıköy">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Açık Adres</label>
              <textarea name="address" class="form-textarea" rows="2" placeholder="Fatura teslim adresi"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close">İptal</button>
            <button type="submit" class="btn btn-primary">Kaydet ve Seç</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Toggle customer type fields
    const radCorp = backdrop.querySelector('#cust-type-corp');
    const radInd = backdrop.querySelector('#cust-type-ind');
    const groupCorp = backdrop.querySelector('#group-company');
    const groupInd = backdrop.querySelector('#group-individual');
    const labelTax = backdrop.querySelector('#label-tax');

    function updateFormType() {
      if (radInd.checked) {
        groupCorp.style.display = 'none';
        groupInd.style.display = 'grid';
        labelTax.textContent = 'TCKN (11 Haneli) *';
      } else {
        groupCorp.style.display = 'block';
        groupInd.style.display = 'none';
        labelTax.textContent = 'VKN (10 Haneli) *';
      }
    }

    radCorp.addEventListener('change', updateFormType);
    radInd.addEventListener('change', updateFormType);

    // Close buttons
    backdrop.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => backdrop.remove());
    });

    // Submit handler
    const form = backdrop.querySelector('#form-new-customer');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const payload = {
        customerType: formData.get('customerType'),
        companyName: formData.get('companyName'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        taxNumber: formData.get('taxNumber'),
        taxOffice: formData.get('taxOffice'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        city: formData.get('city'),
        district: formData.get('district'),
        address: formData.get('address')
      };

      try {
        const res = await API.createCustomer(payload);
        Toast.success('Müşteri başarıyla kaydedildi.');
        backdrop.remove();
        if (onSuccess && res.customer) {
          onSuccess(res.customer);
        }
      } catch (err) {
        Toast.error(err.message);
      }
    });
  },

  // --- 2. POS Card Amount Entry Modal ---
  showAmountModal(card, onAdd) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'modal-amount';

    backdrop.innerHTML = `
      <div class="modal-card" style="max-width: 440px; background: #131b2e; border: 1px solid #1e293b;">
        <div class="modal-header" style="background: #0f172a; border-bottom: 1px solid #1e293b;">
          <div>
            <div style="font-weight: 800; font-size: 16px; color: #f8fafc;">${card.name}</div>
            <div style="font-size: 11px; color: #94a3b8;">KDV: %${card.vat_rate} &bull; Birim: ${card.unit}</div>
          </div>
          <button type="button" class="btn btn-outline btn-sm modal-close" style="padding: 4px 10px; border-color: #334155; color: #94a3b8;">✕</button>
        </div>
        <form id="form-pos-amount">
          <div class="modal-body" style="padding: 20px;">
            <div class="form-group" style="margin-bottom: 20px;">
              <label class="form-label" style="font-size: 13px; color: #f1f5f9; font-weight: 700; margin-bottom: 8px;">FATURA TUTARI (KDV DAHİL) *</label>
              <div style="position: relative;">
                <input type="number" step="0.01" min="1" id="input-amount" name="amount" 
                  value="${card.default_price || ''}" 
                  class="form-input" 
                  style="font-size: 26px; font-weight: 900; color: #38bdf8; height: 58px; padding-right: 48px; background: #0b0f19; border: 2px solid #1e293b; border-radius: 12px;" 
                  placeholder="0.00" 
                  required 
                  inputmode="decimal" 
                  autofocus>
                <span style="position: absolute; right: 16px; top: 14px; font-size: 24px; font-weight: 800; color: #64748b;">₺</span>
              </div>
              <div style="font-size: 11px; color: #10b981; font-weight: 600; margin-top: 6px;">
                ✓ Girilen tutara %${card.vat_rate} KDV dahildir. Matrah sistem tarafından hesaplanır.
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 12px; color: #94a3b8;">Miktar</label>
                <input type="number" step="1" min="1" name="quantity" value="1" class="form-input" style="background: #0b0f19; border: 1px solid #1e293b; color: #f8fafc;" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 12px; color: #94a3b8;">Birim</label>
                <input type="text" name="unit" value="${card.unit || 'Sefer'}" class="form-input" style="background: #0b0f19; border: 1px solid #1e293b; color: #f8fafc;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label" style="font-size: 12px; color: #94a3b8;">Hizmet / Açıklama Notu (İsteğe Bağlı)</label>
              <input type="text" name="customName" value="${card.name}" class="form-input" style="background: #0b0f19; border: 1px solid #1e293b; color: #f8fafc;">
            </div>
          </div>
          <div class="modal-footer" style="background: #0f172a; border-top: 1px solid #1e293b;">
            <button type="button" class="btn btn-outline modal-close" style="border-color: #334155; color: #94a3b8;">İptal</button>
            <button type="submit" class="btn btn-success" style="flex: 1; height: 44px; font-weight: 700;">Faturaya Ekle ➔</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);
    setTimeout(() => {
      const inp = backdrop.querySelector('#input-amount');
      if (inp) inp.select();
    }, 100);

    backdrop.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => backdrop.remove());
    });

    const form = backdrop.querySelector('#form-pos-amount');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const amount = parseFloat(formData.get('amount'));
      const quantity = parseFloat(formData.get('quantity')) || 1;
      const unit = formData.get('unit');
      const name = formData.get('customName') || card.name;

      if (!amount || amount <= 0) {
        Toast.error('Lütfen geçerli bir tutar giriniz.');
        return;
      }

      onAdd({
        name,
        quantity,
        unit,
        unitPrice: amount,
        isVatInclusive: true,
        vatRate: card.vat_rate
      });

      backdrop.remove();
      Toast.success(`"${name}" faturaya eklendi.`);
    });
  },

  // --- 3. GİB Official SMS Verification Modal ---
  showSmsModal(invoiceId, smsInfo, onFinalized) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'modal-sms-verify';

    let remainingSeconds = smsInfo.expiresInSeconds || 180;

    backdrop.innerHTML = `
      <div class="modal-card" style="max-width: 480px; border-top: 4px solid #10b981;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">📱</span>
            <div>
              <h3 style="font-size: 16px; font-weight: 800; color: #0f172a;">GİB SMS Doğrulama</h3>
              <div style="font-size: 11px; color: #64748b;">e-Arşiv Resmî Onay Aşaması</div>
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-sm modal-close" style="padding: 4px 8px;">✕</button>
        </div>
        <form id="form-gib-sms">
          <div class="modal-body" style="text-align: center;">
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px; color: #065f46;">
              <strong>Gelir İdaresi Başkanlığı</strong> kayıtlı telefonunuza doğrulama şifresi gönderdi.<br>
              <span style="font-size: 12px; color: #047857;">(Telefon Sonu: <strong>...${smsInfo.phoneLastDigits || '..'}</strong>)</span>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-size: 14px; margin-bottom: 8px;">SMS Doğrulama Kodunu Giriniz</label>
              <input type="text" id="sms-code-input" name="smsCode" maxlength="6" 
                class="form-input" 
                style="text-align: center; font-size: 28px; font-weight: 900; letter-spacing: 8px; height: 56px; border: 2px solid #10b981;" 
                placeholder="000000" 
                inputmode="numeric" 
                required 
                autofocus>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 12px; color: #64748b;">
              <span>Kalan Süre:</span>
              <span id="sms-timer" style="font-weight: 700; color: #dc2626; font-size: 14px;">03:00</span>
            </div>

            <div style="margin-top: 16px; font-size: 11px; color: #94a3b8; line-height: 1.4;">
              * SMS kodu doğrudan GİB portalı üzerinde onaylanacaktır. Kod sistem veritabanında saklanmaz.
            </div>
          </div>
          <div class="modal-footer" style="flex-direction: column; gap: 8px;">
            <button type="submit" id="btn-submit-sms" class="btn btn-success btn-block" style="font-size: 15px;">
              🛡️ SMS Kodunu Doğrula ve Resmî Faturayı Kes
            </button>
            <button type="button" class="btn btn-outline btn-block modal-close">İptal Et</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Live countdown timer
    const timerElem = backdrop.querySelector('#sms-timer');
    const timerInterval = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerElem.textContent = 'Süre Doldu';
        timerElem.style.color = '#dc2626';
        const submitBtn = backdrop.querySelector('#btn-submit-sms');
        if (submitBtn) submitBtn.disabled = true;
        Toast.error('SMS doğrulama süresi doldu. Lütfen işlemi yeniden başlatınız.');
      } else {
        const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const secs = String(remainingSeconds % 60).padStart(2, '0');
        timerElem.textContent = `${mins}:${secs}`;
      }
    }, 1000);

    backdrop.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        clearInterval(timerInterval);
        backdrop.remove();
      });
    });

    const form = backdrop.querySelector('#form-gib-sms');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = backdrop.querySelector('#sms-code-input').value.trim();
      if (!code || code.length < 4) {
        Toast.error('Lütfen geçerli 6 haneli SMS kodunu giriniz.');
        return;
      }

      const submitBtn = backdrop.querySelector('#btn-submit-sms');
      submitBtn.disabled = true;
      submitBtn.textContent = 'GİB Portalı Doğruluyor... Lütfen Bekleyiniz...';

      try {
        const res = await API.verifyGibSms(invoiceId, code);
        clearInterval(timerInterval);
        backdrop.remove();
        Toast.success(res.message || 'Faturanız GİB üzerinde başarıyla onaylandı!');
        if (onFinalized) {
          onFinalized(res.invoice);
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = '🛡️ SMS Kodunu Doğrula ve Resmî Faturayı Kes';
        Toast.error(err.message);
      }
    });
  },

  // --- 4. Print & Preview Modal ---
  showPrintModal(invoiceId, invoiceNumber) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'modal-print';

    const token = API.getToken();
    const a4Url = `/api/invoices/${invoiceId}/html`;
    const thermalUrl = `/api/invoices/${invoiceId}/thermal`;

    backdrop.innerHTML = `
      <div class="modal-card" style="max-width: 900px; width: 95%; height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: #0f172a;">Belge Yazdır & Görüntüle</h3>
            <div style="font-size: 11px; color: #64748b;">Fatura No: ${invoiceNumber}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-tab-a4" class="btn btn-primary btn-sm">A4 Resmî Format</button>
            <button id="btn-tab-thermal" class="btn btn-outline btn-sm">80mm Termal POS Fişi</button>
            <button type="button" class="btn btn-outline btn-sm modal-close" style="padding: 4px 8px;">✕</button>
          </div>
        </div>
        <div class="modal-body" style="flex: 1; padding: 0; background: #e2e8f0;">
          <iframe id="print-iframe" src="${a4Url}" style="width: 100%; height: 100%; border: none; background: #fff;"></iframe>
        </div>
        <div class="modal-footer" style="justify-content: space-between;">
          <span style="font-size: 12px; color: #64748b;">* Tarayıcınızın Yazdır (Ctrl+P) komutu ile doğrudan çıktı alabilirsiniz.</span>
          <div style="display: flex; gap: 8px;">
            <button id="btn-do-print" class="btn btn-success btn-sm">
              🖨️ Doğrudan Yazdır
            </button>
            <button type="button" class="btn btn-outline btn-sm modal-close">Kapat</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const iframe = backdrop.querySelector('#print-iframe');
    const tabA4 = backdrop.querySelector('#btn-tab-a4');
    const tabThermal = backdrop.querySelector('#btn-tab-thermal');

    tabA4.addEventListener('click', () => {
      iframe.src = a4Url;
      tabA4.className = 'btn btn-primary btn-sm';
      tabThermal.className = 'btn btn-outline btn-sm';
    });

    tabThermal.addEventListener('click', () => {
      iframe.src = thermalUrl;
      tabThermal.className = 'btn btn-primary btn-sm';
      tabA4.className = 'btn btn-outline btn-sm';
    });

    backdrop.querySelector('#btn-do-print').addEventListener('click', () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        window.open(iframe.src, '_blank');
      }
    });

    backdrop.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => backdrop.remove());
    });
  },

  // --- 5. Live Draft Preview Modal (A4 & Thermal HTML) ---
  showLiveHtmlModal(title, a4Html, thermalHtml, onSaveAction) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'modal-live-preview';

    backdrop.innerHTML = `
      <div class="modal-card" style="max-width: 920px; width: 95%; height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: #0f172a;">${title || 'Canlı Fatura Önizleme'}</h3>
            <div style="font-size: 11px; color: #059669; font-weight: 600;">✓ Taslak & Şablon Önizlemesi</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-live-a4" class="btn btn-primary btn-sm">A4 Resmî Format</button>
            <button id="btn-live-thermal" class="btn btn-outline btn-sm">80mm Termal POS Fişi</button>
            <button type="button" class="btn btn-outline btn-sm modal-close" style="padding: 4px 8px;">✕</button>
          </div>
        </div>
        <div class="modal-body" style="flex: 1; padding: 0; background: #cbd5e1; display: flex; justify-content: center; overflow: hidden;">
          <iframe id="live-iframe" style="width: 100%; height: 100%; border: none; background: #fff;"></iframe>
        </div>
        <div class="modal-footer" style="justify-content: space-between;">
          <button type="button" class="btn btn-outline btn-sm modal-close">Kapat</button>
          <div style="display: flex; gap: 8px;">
            ${onSaveAction ? `
              <button id="btn-live-save" class="btn btn-success btn-sm">
                💾 Taslağı Kaydet ve Kapat
              </button>
            ` : ''}
            <button id="btn-live-print" class="btn btn-primary btn-sm">
              🖨️ Yazdır (Ctrl+P)
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const iframe = backdrop.querySelector('#live-iframe');
    const tabA4 = backdrop.querySelector('#btn-live-a4');
    const tabThermal = backdrop.querySelector('#btn-live-thermal');

    iframe.srcdoc = a4Html;

    tabA4.addEventListener('click', () => {
      iframe.srcdoc = a4Html;
      tabA4.className = 'btn btn-primary btn-sm';
      tabThermal.className = 'btn btn-outline btn-sm';
    });

    tabThermal.addEventListener('click', () => {
      iframe.srcdoc = thermalHtml;
      tabThermal.className = 'btn btn-primary btn-sm';
      tabA4.className = 'btn btn-outline btn-sm';
    });

    backdrop.querySelector('#btn-live-print').addEventListener('click', () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        console.error(e);
      }
    });

    if (onSaveAction) {
      backdrop.querySelector('#btn-live-save')?.addEventListener('click', async () => {
        backdrop.remove();
        await onSaveAction();
      });
    }

    backdrop.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => backdrop.remove());
    });
  }
};

window.Modals = Modals;
