# PRATİKFATURA cPanel Kurulum Kılavuzu (guzel.net.tr / Paylaşımlı Hosting)

Bu kılavuz, **PRATİKFATURA** uygulamasını paylaşımlı Linux/cPanel hosting hesabınıza yükleyip yayına almanız için hazırlanmıştır.

---

## 1. Adım: Veritabanını Oluşturma ve İçe Aktarma

1. **cPanel'e giriş yapın.**
2. **MySQL Veritabanları (MySQL Databases)** bölümüne girin:
   - Yeni bir veritabanı oluşturun (Örn: `kullanici_pratikfatura`).
   - Yeni bir veritabanı kullanıcısı oluşturun ve güçlü bir şifre belirleyin.
   - Oluşturduğunuz kullanıcıyı veritabanına ekleyin ve **TÜM YETKİLERİ (ALL PRIVILEGES)** verin.
3. cPanel ana sayfasına dönüp **phpMyAdmin**'i açın.
4. Sol menüden yeni açtığınız veritabanına tıklayın.
5. Üst menüden **İçe Aktar (Import)** sekmesine tıklayın.
6. `php_backend/database.sql` dosyasını seçip **Git (Go)** butonuna basarak tabloları ve hazır başlangıç verilerini yükleyin.

---

## 2. Adım: Veritabanı Bilgilerini Ayarlama (`config.php`)

`php_backend/config.php` dosyasını açıp cPanel'de oluşturduğunuz bilgileri yazın:

```php
'db' => [
    'host'     => 'localhost',
    'database' => 'kullanici_pratikfatura', // cPanel veritabanı adınız
    'username' => 'kullanici_dbuser',       // cPanel veritabanı kullanıcınız
    'password' => 'BelirlediginizSifre',    // cPanel veritabanı şifreniz
    'charset'  => 'utf8mb4',
    'port'     => 3306
],
```

---

## 3. Adım: Dosyaları Hostinginize Yükleme

cPanel **Dosya Yöneticisi (File Manager)** veya FileZilla (FTP) ile:

- **Eğer ana alan adınızda çalışacaksa:** `public_html/` içerisine yükleyin.
- **Eğer alt alanda (subdomain) çalışacaksa (örn: fatura.siteniz.com):** İlgili alt alanın klasörüne yükleyin.

Yüklenecek temel dosya ve klasörler:
```text
public_html/
├── client/              (Arayüz dosyaları: HTML, CSS, JS)
├── php_backend/         (PHP API backend motoru)
├── .htaccess            (Otomatik yönlendirme kuralları)
```

---

## 4. Adım: Giriş Bilgileri

Veritabanını içe aktardığınızda sistemde hazır tanımlı hesaplar:

| Rol | E-posta | Parola | Açıklama |
|---|---|---|---|
| **İşletme (Nakliye)** | `ahmet@oznakliyat.com` | `Nakliye123!` | Hızlı fatura kesme ve e-Arşiv paneli |
| **Bayi (Reseller)** | `reseller@pratikfatura.com` | `Reseller123!` | Müşteri işletmeleri yönetme |
| **Sistem Yöneticisi** | `admin@pratikfatura.com` | `AdminPratik2026*!` | Genel sistem yönetimi |

---

## Önemli Avantajlar:
- ✅ **Node.js zorunluluğu yoktur:** Paylaşımlı hostinginizin standart PHP 7.4 / 8.x + MySQL altyapısında sorunsuz çalışır.
- ✅ **Kapanma / Uyuma Riski Yoktur:** Arka planda sunucu çalıştırma gerektirmez.
- ✅ **Sıfır Ekstra Kütüphane:** Saf PHP ve modern JavaScript ile en yüksek hızda çalışır.
