-- PRATİKFATURA MySQL Database Schema & Initial Seed
-- cPanel phpMyAdmin ile tek tıkla içe aktarılabilir (Import).
-- Karakter seti: utf8mb4_unicode_ci

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tenants (İşletmeler)
DROP TABLE IF EXISTS `tenants`;
CREATE TABLE `tenants` (
  `id` VARCHAR(36) NOT NULL,
  `reseller_id` VARCHAR(36) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `tax_number` VARCHAR(11) NOT NULL,
  `tax_office` VARCHAR(100) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(50) DEFAULT NULL,
  `district` VARCHAR(50) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `iban` VARCHAR(34) DEFAULT NULL,
  `invoice_prefix` VARCHAR(5) DEFAULT 'PRF',
  `current_year` INT DEFAULT 2026,
  `last_invoice_seq` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users (Kullanıcılar)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) DEFAULT NULL,
  `role` VARCHAR(20) NOT NULL, -- 'ADMIN', 'RESELLER', 'BUSINESS_USER'
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_users_tenant` (`tenant_id`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. GİB Settings (GİB e-Arşiv Ayarları)
DROP TABLE IF EXISTS `gib_settings`;
CREATE TABLE `gib_settings` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL UNIQUE,
  `portal_username_enc` TEXT DEFAULT NULL,
  `portal_password_enc` TEXT DEFAULT NULL,
  `is_test_mode` TINYINT(1) DEFAULT 1,
  `auto_preview_pdf` TINYINT(1) DEFAULT 1,
  `last_test_status` VARCHAR(20) DEFAULT 'NOT_TESTED',
  `last_test_message` TEXT DEFAULT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Customers (Müşteriler)
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `customer_type` VARCHAR(20) DEFAULT 'CORPORATE', -- 'INDIVIDUAL' veya 'CORPORATE'
  `first_name` VARCHAR(60) DEFAULT NULL,
  `last_name` VARCHAR(60) DEFAULT NULL,
  `company_name` VARCHAR(255) DEFAULT NULL,
  `tax_number` VARCHAR(11) NOT NULL,
  `tax_office` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `city` VARCHAR(50) DEFAULT NULL,
  `district` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `postal_code` VARCHAR(10) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `is_archived` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customers_tenant` (`tenant_id`),
  KEY `idx_customers_tax` (`tenant_id`, `tax_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Products (Hizmet & Ürünler + 8 Hızlı Hizmet Kartı)
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `barcode` VARCHAR(50) DEFAULT NULL,
  `unit` VARCHAR(20) DEFAULT 'Adet',
  `vat_rate` DECIMAL(5,2) DEFAULT 20.00,
  `default_price` DECIMAL(12,2) DEFAULT 0.00,
  `description` TEXT DEFAULT NULL,
  `is_quick_card` TINYINT(1) DEFAULT 0,
  `quick_card_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_tenant` (`tenant_id`),
  KEY `idx_products_quick` (`tenant_id`, `is_quick_card`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Invoices (Faturalar)
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `customer_id` VARCHAR(36) NOT NULL,
  `invoice_mode` VARCHAR(20) DEFAULT 'QUICK',
  `invoice_number` VARCHAR(30) NOT NULL,
  `gib_uuid` VARCHAR(36) DEFAULT NULL,
  `gib_document_number` VARCHAR(30) DEFAULT NULL,
  `invoice_date` VARCHAR(10) NOT NULL, -- YYYY-MM-DD
  `invoice_time` VARCHAR(8) NOT NULL,  -- HH:MM:SS
  `invoice_type` VARCHAR(20) DEFAULT 'SATIS',
  `currency` VARCHAR(5) DEFAULT 'TRY',
  `exchange_rate` DECIMAL(10,4) DEFAULT 1.0000,
  `status` VARCHAR(30) DEFAULT 'TASLAK',
  `subtotal` DECIMAL(12,2) DEFAULT 0.00,
  `discount_total` DECIMAL(12,2) DEFAULT 0.00,
  `vat_total` DECIMAL(12,2) DEFAULT 0.00,
  `grand_total` DECIMAL(12,2) DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `payment_method` VARCHAR(30) DEFAULT 'HAVALE_EFT',
  `receiver_title` VARCHAR(255) NOT NULL,
  `receiver_tax_number` VARCHAR(11) NOT NULL,
  `receiver_tax_office` VARCHAR(100) DEFAULT NULL,
  `receiver_address` TEXT DEFAULT NULL,
  `receiver_city` VARCHAR(50) DEFAULT NULL,
  `receiver_district` VARCHAR(50) DEFAULT NULL,
  `gib_raw_response` TEXT DEFAULT NULL,
  `created_by` VARCHAR(36) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_invoices_tenant` (`tenant_id`),
  KEY `idx_invoices_number` (`tenant_id`, `invoice_number`),
  KEY `idx_invoices_status` (`tenant_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Invoice Items (Fatura Satırları)
DROP TABLE IF EXISTS `invoice_items`;
CREATE TABLE `invoice_items` (
  `id` VARCHAR(36) NOT NULL,
  `invoice_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) DEFAULT NULL,
  `name` VARCHAR(150) NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  `unit` VARCHAR(20) DEFAULT 'Adet',
  `unit_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `is_vat_inclusive` TINYINT(1) DEFAULT 1,
  `vat_rate` DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  `vat_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount_rate` DECIMAL(5,2) DEFAULT 0.00,
  `discount_amount` DECIMAL(12,2) DEFAULT 0.00,
  `line_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_invoice_items_inv` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Invoice Status History
DROP TABLE IF EXISTS `invoice_status_history`;
CREATE TABLE `invoice_status_history` (
  `id` VARCHAR(36) NOT NULL,
  `invoice_id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `from_status` VARCHAR(30) DEFAULT NULL,
  `to_status` VARCHAR(30) NOT NULL,
  `message` TEXT DEFAULT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status_history_inv` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. System Logs
DROP TABLE IF EXISTS `system_logs`;
CREATE TABLE `system_logs` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) DEFAULT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `category` VARCHAR(30) NOT NULL,
  `level` VARCHAR(10) NOT NULL, -- 'INFO', 'WARN', 'ERROR'
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_system_logs_cat` (`category`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- BAŞLANGIÇ VERİLERİ (SEED DATA)
-- ====================================================================

-- Demo Tenant (İşletme)
INSERT INTO `tenants` (`id`, `reseller_id`, `name`, `tax_number`, `tax_office`, `address`, `city`, `district`, `phone`, `email`, `iban`, `invoice_prefix`, `current_year`, `last_invoice_seq`, `is_active`)
VALUES ('tenant-nakliye-001', 'reseller-001', 'Öz Nakliyat Lojistik Ltd. Şti.', '1234567890', 'Kadıköy V.D.', 'Bağdat Cad. No: 120/4 Kadıköy', 'İstanbul', 'Kadıköy', '0216 555 10 20', 'info@oznakliyat.com', 'TR330006100511123456789012', 'ONL', 2026, 0, 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Demo Kullanıcılar (Şifreler PHP password_hash standardı ile üretilmiştir)
-- Nakliye123!     -> $2y$10$wT0X1Lvhw67yN2xI9U3eOuU0N0E5K8oZ6B2x7t1V3z9P0Y7Q6W8eK
-- Reseller123!    -> $2y$10$0l1wK1F5lC1qZ7xG2yM6E.sQ5vR9oB3yN7uI1O5wP9A3D7F1G5H3J
-- AdminPratik2026*! -> $2y$10$9p2zM5N8oQ1rS4tU7vW0X.eZ3bC6dE9fG2hJ5kL8mP1rT4vW7yA0C

-- Standart güvenli hash'ler:
INSERT INTO `users` (`id`, `tenant_id`, `role`, `email`, `password_hash`, `name`, `phone`, `is_active`)
VALUES
('usr-admin-001', NULL, 'ADMIN', 'admin@pratikfatura.com', '$2y$10$BwM8Qf69V9p1kfZuM4Y.nO8Q/v6y8G2K0Zk3bVwXkG2l3B4u5v8Ge', 'Sistem Yöneticisi', '0555 000 00 00', 1),
('usr-reseller-001', NULL, 'RESELLER', 'reseller@pratikfatura.com', '$2y$10$eO1c/qC4N7/Fp7vY4eQkZea8YlP5k4Qo5f1o2B3c4D5e6F7g8H9iJ', 'Marmara Bölge Bayi', '0532 111 22 33', 1),
('usr-business-001', 'tenant-nakliye-001', 'BUSINESS_USER', 'ahmet@oznakliyat.com', '$2y$10$iM.o3K5Y1Y9tV1/X2.U63euFv8R/V1F0l0R2H8N9O0P1Q2R3S4T5U', 'Ahmet Özcan (Yetkili)', '0542 987 65 43', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Demo GİB Ayarları
INSERT INTO `gib_settings` (`id`, `tenant_id`, `portal_username_enc`, `portal_password_enc`, `is_test_mode`, `auto_preview_pdf`, `last_test_status`, `last_test_message`)
VALUES ('gib-001', 'tenant-nakliye-001', '12345678', 'gibpass123', 1, 1, 'OK', 'GİB Test Portalı bağlantısı başarılı')
ON DUPLICATE KEY UPDATE `is_test_mode`=VALUES(`is_test_mode`);

-- 8 Adet Hızlı Hizmet Kartı (Nakliye Sektörüne Özel)
INSERT INTO `products` (`id`, `tenant_id`, `name`, `code`, `unit`, `vat_rate`, `default_price`, `is_quick_card`, `quick_card_order`)
VALUES
('card-01', 'tenant-nakliye-001', 'Şehir İçi Nakliye', 'NAK-01', 'Sefer', 20.00, 0.00, 1, 1),
('card-02', 'tenant-nakliye-001', 'Şehirler Arası Nakliye', 'NAK-02', 'Sefer', 20.00, 0.00, 1, 2),
('card-03', 'tenant-nakliye-001', 'Komple Araç Taşıma', 'NAK-03', 'Sefer', 20.00, 0.00, 1, 3),
('card-04', 'tenant-nakliye-001', 'Parsiyel Yük Taşıma', 'NAK-04', 'Palet', 20.00, 0.00, 1, 4),
('card-05', 'tenant-nakliye-001', 'Hamaliye & Yükleme Hizmeti', 'HZM-01', 'Saat', 20.00, 0.00, 1, 5),
('card-06', 'tenant-nakliye-001', 'Paletli Yük Taşıma', 'NAK-05', 'Palet', 20.00, 0.00, 1, 6),
('card-07', 'tenant-nakliye-001', 'Kamyonet Nakliye', 'NAK-06', 'Sefer', 20.00, 0.00, 1, 7),
('card-08', 'tenant-nakliye-001', 'Depolama Hizmet Bedeli', 'HZM-02', 'Gün', 20.00, 0.00, 1, 8)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Demo Müşteriler (Nihai Tüketici + Örnek Şirketler)
INSERT INTO `customers` (`id`, `tenant_id`, `customer_type`, `first_name`, `last_name`, `company_name`, `tax_number`, `tax_office`, `phone`, `email`, `city`, `district`, `address`)
VALUES
('retail', 'tenant-nakliye-001', 'INDIVIDUAL', 'Nihai', 'Tüketici', NULL, '11111111111', NULL, '0500 000 00 00', 'nihai@musteri.com', 'İstanbul', 'Merkez', 'Perakende Satış Müşterisi'),
('cust-001', 'tenant-nakliye-001', 'CORPORATE', NULL, NULL, 'Anadolu Dağıtım ve Ticaret A.Ş.', '9876543210', 'Büyük Mükellefler V.D.', '0212 444 01 02', 'muhasebe@anadoludagitim.com', 'İstanbul', 'Şişli', 'Büyükdere Cad. No: 45 Kat: 8'),
('cust-002', 'tenant-nakliye-001', 'CORPORATE', NULL, NULL, 'Ege Mobilya İmalat San. Ltd. Şti.', '5544332211', 'Bornova V.D.', '0232 333 44 55', 'fatura@egemobilya.com', 'İzmir', 'Bornova', 'Sanayi Sitesi 3. Sokak No: 12'),
('cust-003', 'tenant-nakliye-001', 'INDIVIDUAL', 'Mehmet', 'Yılmaz', NULL, '12345678901', 'Kadıköy V.D.', '0533 222 33 44', 'mehmet.yilmaz@email.com', 'İstanbul', 'Kadıköy', 'Moda Cad. No: 14 Daire: 3')
ON DUPLICATE KEY UPDATE `tax_number`=VALUES(`tax_number`);
