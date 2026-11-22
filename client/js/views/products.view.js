/**
 * PRATİKFATURA Ürün & Hizmet Yönetimi ve 8 Hızlı POS Kartı Yapılandırması
 */

const ProductsView = {
  products: [],

  async render() {
    return `
      <div class="content-area">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: #f8fafc;">📦 Ürün ve Hizmet Yönetimi</h1>
            <p style="font-size: 13px; color: #94a3b8;">Hizmetlerinizi yönetin ve Hızlı Fatura ekranında görünecek 8 favori kartı belirleyin.</p>
          </div>
          <button type="button" id="btn-create-product" class="btn btn-primary">
            ➕ Yeni Hizmet / Ürün Ekle
          </button>
        </div>

        <div class="card" style="background: #0f172a; border: 1px solid #1e293b; padding: 16px; margin-bottom: 20px; border-radius: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">💡</span>
            <div style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">
              <strong style="color: #60a5fa;">8 Adet Hızlı Kart:</strong> İşletmenizde en sık kestiğiniz 8 Ürün/Hizmeti "Favori Kart" olarak işaretleyiniz. Bu kartlar Hızlı Fatura ana ekranında büyük butonlar olarak yer alır.
            </div>
          </div>
        </div>

        <div class="card" style="padding: 0; overflow: hidden; background: #131b2e; border: 1px solid #1e293b; border-radius: 14px;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr style="background: #0b0f19; border-bottom: 1px solid #1e293b;">
                  <th style="color: #94a3b8;">Hizmet / Mal Adı</th>
                  <th style="color: #94a3b8;">Kodu</th>
                  <th style="color: #94a3b8;">Birim</th>
                  <th style="color: #94a3b8;">KDV Oranı</th>
                  <th style="text-align: right; color: #94a3b8;">Varsayılan Tutar</th>
                  <th style="text-align: center; color: #94a3b8;">Hızlı Kart (Maks. 8)</th>
                  <th style="text-align: right; color: #94a3b8;">İşlemler</th>
                </tr>
              </thead>
              <tbody id="products-tbody">
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
    await this.loadProducts();

    document.getElementById('btn-create-product')?.addEventListener('click', () => {
      this.showProductModal();
    });
  },

  async loadProducts() {
    const tbody = document.getElementById('products-tbody');
    try {
      const res = await API.getProducts();
      this.products = res.products || [];

      tbody.innerHTML = this.products.map(p => `
        <tr style="border-bottom: 1px solid #1e293b;">
          <td>
            <strong style="color: #f8fafc; font-size: 14px; font-weight: 700;">${p.name}</strong>
            ${p.description ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">${p.description}</div>` : ''}
          </td>
          <td><code style="color: #60a5fa; background: #0b0f19; padding: 2px 6px; border-radius: 4px; border: 1px solid #1e293b;">${p.code || '-'}</code></td>
          <td style="color: #cbd5e1; font-weight: 600;">${p.unit || 'Adet'}</td>
          <td><span class="badge badge-info">%${p.vat_rate} KDV</span></td>
          <td style="text-align: right; font-weight: 800; color: #38bdf8; font-size: 14px;">
            ${p.default_price > 0 ? State.formatCurrency(p.default_price) : '-'}
          </td>
          <td style="text-align: center;">
            <button class="btn btn-sm ${p.is_quick_card ? 'btn-success' : 'btn-outline'} btn-toggle-card" data-id="${p.id}" data-active="${p.is_quick_card}" style="font-size: 11px; padding: 4px 10px;">
              ${p.is_quick_card ? '⭐ Favori Kart (Aktif)' : '☆ Favoriye Ekle'}
            </button>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-outline btn-sm btn-edit-product" data-id="${p.id}" style="font-size: 12px; border-color: #334155; color: #f8fafc;">Düzenle</button>
          </td>
        </tr>
      `).join('');

      // Toggle quick card listener
      tbody.querySelectorAll('.btn-toggle-card').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const current = btn.dataset.active === '1';
          try {
            await API.toggleQuickCard(id, !current, 1);
            Toast.success(!current ? 'Hızlı karta eklendi.' : 'Hızlı kartlardan kaldırıldı.');
            this.loadProducts();
          } catch (err) {
            Toast.error(err.message);
          }
        });
      });

      // Edit product listener
      tbody.querySelectorAll('.btn-edit-product').forEach(btn => {
        btn.addEventListener('click', () => {
          const prod = this.products.find(x => x.id === btn.dataset.id);
          if (prod) this.showProductModal(prod);
        });
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="color: red; text-align: center;">Hata: ${err.message}</td></tr>`;
    }
  },

  showProductModal(product = null) {
    const isEdit = !!product;
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    backdrop.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="font-size: 16px; font-weight: 700;">${isEdit ? 'Hizmet / Ürün Düzenle' : '➕ Yeni Hizmet / Ürün Ekle'}</h3>
          <button type="button" class="btn btn-outline btn-sm modal-close">✕</button>
        </div>
        <form id="form-product">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Mal veya Hizmet Adı *</label>
              <input type="text" name="name" class="form-input" value="${product?.name || ''}" placeholder="Örn: Şehirler Arası Nakliye Geliri" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">KDV Oranı *</label>
                <select name="vatRate" class="form-select">
                  <option value="20" ${product?.vat_rate === 20 ? 'selected' : ''}>%20 KDV</option>
                  <option value="10" ${product?.vat_rate === 10 ? 'selected' : ''}>%10 KDV</option>
                  <option value="1" ${product?.vat_rate === 1 ? 'selected' : ''}>%1 KDV</option>
                  <option value="0" ${product?.vat_rate === 0 ? 'selected' : ''}>%0 KDV</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Birim *</label>
                <select name="unit" class="form-select" style="height: 44px; background: #0b0f19; border: 1px solid #1e293b; color: #f8fafc; font-size: 14px; font-weight: 600; border-radius: 8px; width: 100%; outline: none; padding: 0 10px;">
                  ${[
                    'Adet', 'Kilogram', 'gram', 'Ton', 'litre', 'Mililitre', 
                    'metre', 'santimetre', 'Milimetre', 'kilometre', 'metrekare', 
                    'Metreküp', 'kilowatsaat', 'dakika', 'saat', 'gün', 'ay', 'yıl', 
                    'çift', 'düzine', 'set', 'paket', 'kutu', 'Sefer', 'Palet'
                  ].map(u => `<option value="${u}" ${(product?.unit || 'Adet').toLowerCase() === u.toLowerCase() ? 'selected' : ''}>${u}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Varsayılan Tutar (KDV Dahil)</label>
                <input type="number" step="0.01" name="defaultPrice" class="form-input" value="${product?.default_price || ''}" placeholder="0.00">
              </div>
              <div class="form-group">
                <label class="form-label">Hizmet / Ürün Kodu</label>
                <input type="text" name="code" class="form-input" value="${product?.code || ''}" placeholder="NAK-001">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Açıklama</label>
              <textarea name="description" class="form-textarea" rows="2" placeholder="Hizmet detay açıklaması">${product?.description || ''}</textarea>
            </div>

            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="isQuickCard" value="1" ${product?.is_quick_card ? 'checked' : ''} style="accent-color: #3b82f6; width: 16px; height: 16px;">
                <span style="font-weight: 600; font-size: 13px; color: #f8fafc;">Hızlı Fatura Ekranında Favori Kart Olarak Göster (Maks 8)</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline modal-close">İptal</button>
            <button type="submit" class="btn btn-primary">Kaydet</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);

    backdrop.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => backdrop.remove()));

    const form = backdrop.querySelector('#form-product');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        name: fd.get('name'),
        vatRate: parseFloat(fd.get('vatRate')),
        unit: fd.get('unit'),
        defaultPrice: parseFloat(fd.get('defaultPrice')) || 0,
        code: fd.get('code'),
        description: fd.get('description'),
        isQuickCard: fd.get('isQuickCard') === '1'
      };

      try {
        if (isEdit) {
          await API.updateProduct(product.id, payload);
          Toast.success('Ürün güncellendi.');
        } else {
          await API.createProduct(payload);
          Toast.success('Yeni ürün eklendi.');
        }
        backdrop.remove();
        this.loadProducts();
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }
};

window.ProductsView = ProductsView;
