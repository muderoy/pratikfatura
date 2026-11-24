<?php
/**
 * PRATİKFATURA REST API Router & Controller
 * Tüm /api/... isteklerini karşılar, JSON yanıt döner.
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/services.php';

// CORS & JSON Başlıkları
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Gelen İstek Bilgileri
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Query string veya alt klasör öneklerini temizle
$basePrefix = '/api';
$pos = strpos($uri, $basePrefix);
$path = ($pos !== false) ? substr($uri, $pos) : $uri;

// JSON Gövdesini Oku
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: [];

// Yetkilendirme Kontrolü
function getAuthUser(): ?array {
    $authHeader = '';
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
        return Security::verifyToken($matches[1]);
    }
    return null;
}

function requireAuth(array $allowedRoles = []): array {
    $user = getAuthUser();
    if (!$user) {
        http_response_code(401);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['success' => false, 'error' => 'Oturum süreniz doldu veya yetkisiz erişim.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles)) {
        http_response_code(403);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['success' => false, 'error' => 'Bu işlem için yetkiniz bulunmamaktadır.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    return $user;
}

function jsonResponse(array $data, int $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// ====================================================================
// ROTA YÖNLENDİRME (ROUTING)
// ====================================================================

try {
    // 1. AUTH: LOGIN
    if ($path === '/api/auth/login' && $method === 'POST') {
        $email = strtolower(trim($body['email'] ?? ''));
        $password = $body['password'] ?? '';

        if (!$email || !$password) {
            jsonResponse(['success' => false, 'error' => 'E-posta ve parola gereklidir.'], 400);
        }

        $user = Database::get('SELECT * FROM users WHERE email = ?', [$email]);
        if (!$user || !Security::verifyPassword($password, $user['password_hash'])) {
            jsonResponse(['success' => false, 'error' => 'E-posta veya parola hatalı.'], 401);
        }

        if (!(int)$user['is_active']) {
            jsonResponse(['success' => false, 'error' => 'Hesabınız askıya alınmıştır.'], 403);
        }

        $tenant = null;
        if ($user['tenant_id']) {
            $tenant = Database::get('SELECT * FROM tenants WHERE id = ?', [$user['tenant_id']]);
        }

        $token = Security::generateToken([
            'id'       => $user['id'],
            'email'    => $user['email'],
            'role'     => $user['role'],
            'tenantId' => $user['tenant_id'],
            'name'     => $user['name']
        ]);

        jsonResponse([
            'success' => true,
            'token'   => $token,
            'user'    => [
                'id'       => $user['id'],
                'name'     => $user['name'],
                'email'    => $user['email'],
                'role'     => $user['role'],
                'tenantId' => $user['tenant_id']
            ],
            'tenant'  => $tenant ? [
                'id'        => $tenant['id'],
                'name'      => $tenant['name'],
                'taxNumber' => $tenant['tax_number'],
                'taxOffice' => $tenant['tax_office'],
                'city'      => $tenant['city'],
                'phone'     => $tenant['phone'],
                'email'     => $tenant['email'],
                'iban'      => $tenant['iban'],
                'invoicePrefix' => $tenant['invoice_prefix']
            ] : null
        ]);
    }

    // 2. AUTH: ME
    if ($path === '/api/auth/me' && $method === 'GET') {
        $u = requireAuth();
        $user = Database::get('SELECT id, name, email, role, phone, tenant_id FROM users WHERE id = ?', [$u['id']]);
        $tenant = null;
        if ($user['tenant_id']) {
            $tenant = Database::get('SELECT * FROM tenants WHERE id = ?', [$user['tenant_id']]);
        }
        jsonResponse(['success' => true, 'user' => $user, 'tenant' => $tenant]);
    }

    // 3. PRODUCTS & 8 QUICK CARDS
    if ($path === '/api/products/quick-cards' && $method === 'GET') {
        $u = requireAuth(['BUSINESS_USER']);
        $cards = Database::query(
            'SELECT * FROM products WHERE tenant_id = ? AND is_quick_card = 1 ORDER BY quick_card_order ASC, name ASC LIMIT 8',
            [$u['tenantId']]
        );
        jsonResponse(['success' => true, 'cards' => $cards]);
    }

    if ($path === '/api/products' && $method === 'GET') {
        $u = requireAuth(['BUSINESS_USER']);
        $products = Database::query(
            'SELECT * FROM products WHERE tenant_id = ? ORDER BY is_quick_card DESC, name ASC',
            [$u['tenantId']]
        );
        jsonResponse(['success' => true, 'products' => $products]);
    }

    // Ürün Güncelleme (PUT /api/products/:id)
    if (preg_match('#^/api/products/([a-zA-Z0-9-]+)$#', $path, $m) && ($method === 'PUT' || $method === 'POST')) {
        $u = requireAuth(['BUSINESS_USER']);
        $productId = $m[1];
        $name = trim($body['name'] ?? '');
        $unit = trim($body['unit'] ?? 'Adet');
        $vatRate = (float)($body['vatRate'] ?? $body['vat_rate'] ?? 20);
        $defaultPrice = (float)($body['defaultPrice'] ?? $body['default_price'] ?? 0);
        $code = trim($body['code'] ?? '');
        $description = trim($body['description'] ?? '');
        $isQuickCard = !empty($body['isQuickCard']) ? 1 : 0;

        Database::run(
            "UPDATE products SET name = ?, unit = ?, vat_rate = ?, default_price = ?, code = ?, description = ?, is_quick_card = ? WHERE id = ? AND tenant_id = ?",
            [$name, $unit, $vatRate, $defaultPrice, $code, $description, $isQuickCard, $productId, $u['tenantId']]
        );

        $updatedProduct = Database::get('SELECT * FROM products WHERE id = ?', [$productId]);
        jsonResponse(['success' => true, 'product' => $updatedProduct]);
    }

    // Ürün Favori Durumunu Değiştir (POST /api/products/:id/toggle-quick)
    if (preg_match('#^/api/products/([a-zA-Z0-9-]+)/toggle-quick$#', $path, $m) && $method === 'POST') {
        $u = requireAuth(['BUSINESS_USER']);
        $productId = $m[1];
        $isQuick = !empty($body['isQuickCard']) ? 1 : 0;
        Database::run('UPDATE products SET is_quick_card = ? WHERE id = ? AND tenant_id = ?', [$isQuick, $productId, $u['tenantId']]);
        jsonResponse(['success' => true]);
    }

    // 4. CUSTOMERS
    if ($path === '/api/customers' && $method === 'GET') {
        $u = requireAuth(['BUSINESS_USER']);
        $query = trim($_GET['q'] ?? '');
        if ($query) {
            $searchTerm = "%{$query}%";
            $customers = Database::query(
                "SELECT * FROM customers WHERE tenant_id = ? AND is_archived = 0 AND (
                    company_name LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR tax_number LIKE ? OR phone LIKE ?
                ) ORDER BY created_at DESC LIMIT 20",
                [$u['tenantId'], $searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm]
            );
        } else {
            $customers = Database::query(
                'SELECT * FROM customers WHERE tenant_id = ? AND is_archived = 0 ORDER BY created_at DESC',
                [$u['tenantId']]
            );
        }
        jsonResponse(['success' => true, 'customers' => $customers]);
    }

    if ($path === '/api/customers' && $method === 'POST') {
        $u = requireAuth(['BUSINESS_USER']);
        $id = Security::generateUUID();
        $customerType = $body['customerType'] ?? $body['customer_type'] ?? 'CORPORATE';
        $taxNumber = trim($body['taxNumber'] ?? $body['tax_number'] ?? '');

        if (!$taxNumber) {
            jsonResponse(['success' => false, 'error' => 'VKN/TCKN zorunludur.'], 400);
        }

        Database::run(
            "INSERT INTO customers (id, tenant_id, customer_type, first_name, last_name, company_name, tax_number, tax_office, phone, email, city, district, address, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $id, $u['tenantId'], $customerType,
                $body['firstName'] ?? $body['first_name'] ?? null,
                $body['lastName'] ?? $body['last_name'] ?? null,
                $body['companyName'] ?? $body['company_name'] ?? null,
                $taxNumber,
                $body['taxOffice'] ?? $body['tax_office'] ?? null,
                $body['phone'] ?? null,
                $body['email'] ?? null,
                $body['city'] ?? null,
                $body['district'] ?? null,
                $body['address'] ?? null,
                $body['notes'] ?? null
            ]
        );
        $cust = Database::get('SELECT * FROM customers WHERE id = ?', [$id]);
        jsonResponse(['success' => true, 'customer' => $cust]);
    }

    // 5. INVOICES: PREVIEW DRAFT
    if ($path === '/api/invoices/preview' && $method === 'POST') {
        $u = requireAuth(['BUSINESS_USER']);
        $tenant = Database::get('SELECT * FROM tenants WHERE id = ?', [$u['tenantId']]);
        $items = $body['items'] ?? [];
        $customerId = $body['customerId'] ?? 'retail';

        $customer = Database::get('SELECT * FROM customers WHERE id = ? AND tenant_id = ?', [$customerId, $u['tenantId']])
            ?: [
                'company_name' => 'Nihai Tüketici',
                'customer_type'=> 'INDIVIDUAL',
                'first_name'   => 'Nihai',
                'last_name'    => 'Tüketici',
                'tax_number'   => '11111111111',
                'tax_office'   => '',
                'address'      => 'Perakende Müşteri',
                'city'         => 'İstanbul',
                'district'     => ''
            ];

        $totals = CalculationService::calculateInvoice($items);
        $tempInvoice = [
            'invoice_number' => 'TASLAK-ÖNİZLEME',
            'invoice_date'   => date('Y-m-d'),
            'invoice_time'   => date('H:i:s'),
            'receiver_title' => $customer['customer_type'] === 'INDIVIDUAL' ? "{$customer['first_name']} {$customer['last_name']}" : $customer['company_name'],
            'receiver_tax_number' => $customer['tax_number'],
            'receiver_address'    => $customer['address'],
            'receiver_city'       => $customer['city'],
            'receiver_district'   => $customer['district'],
            'subtotal'       => $totals['subtotal'],
            'vat_total'      => $totals['vat_total'],
            'grand_total'    => $totals['grand_total'],
            'notes'          => $body['notes'] ?? ''
        ];

        $a4Html = PdfHtmlService::renderA4($tempInvoice, $totals['items'], $tenant);
        $thermalHtml = PdfHtmlService::renderThermal($tempInvoice, $totals['items'], $tenant);

        jsonResponse([
            'success'     => true,
            'a4Html'      => $a4Html,
            'thermalHtml' => $thermalHtml
        ]);
    }

    // 6. INVOICES: CREATE
    if ($path === '/api/invoices' && $method === 'POST') {
        $u = requireAuth(['BUSINESS_USER']);
        $items = $body['items'] ?? [];
        if (empty($items)) {
            jsonResponse(['success' => false, 'error' => 'Fatura kalemleri boş olamaz.'], 400);
        }

        $customerId = $body['customerId'] ?? 'retail';
        $customer = Database::get('SELECT * FROM customers WHERE id = ? AND tenant_id = ?', [$customerId, $u['tenantId']]);
        if (!$customer && $customerId === 'retail') {
            $customer = [
                'customer_type'=> 'INDIVIDUAL',
                'first_name'   => 'Nihai',
                'last_name'    => 'Tüketici',
                'tax_number'   => '11111111111',
                'tax_office'   => '',
                'address'      => 'Perakende Müşteri',
                'city'         => 'İstanbul',
                'district'     => ''
            ];
        }

        $calc = CalculationService::calculateInvoice($items);
        $invoiceId = Security::generateUUID();
        $invoiceNum = InvoiceNumberService::generateNextNumber($u['tenantId']);
        $receiverTitle = $customer['customer_type'] === 'INDIVIDUAL' ? "{$customer['first_name']} {$customer['last_name']}" : $customer['company_name'];

        Database::run(
            "INSERT INTO invoices (id, tenant_id, customer_id, invoice_mode, invoice_number, invoice_date, invoice_time, status, subtotal, discount_total, vat_total, grand_total, notes, receiver_title, receiver_tax_number, receiver_tax_office, receiver_address, receiver_city, receiver_district, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'TASLAK', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $invoiceId, $u['tenantId'], $customerId, $body['invoiceMode'] ?? 'QUICK',
                $invoiceNum, date('Y-m-d'), date('H:i:s'),
                $calc['subtotal'], $calc['discount_total'], $calc['vat_total'], $calc['grand_total'],
                $body['notes'] ?? '', $receiverTitle, $customer['tax_number'],
                $customer['tax_office'] ?? '', $customer['address'] ?? '',
                $customer['city'] ?? '', $customer['district'] ?? '', $u['id']
            ]
        );

        foreach ($calc['items'] as $it) {
            Database::run(
                "INSERT INTO invoice_items (id, invoice_id, name, quantity, unit, unit_price, vat_rate, vat_amount, line_total)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    Security::generateUUID(), $invoiceId, $it['name'],
                    $it['quantity'], $it['unit'] ?? 'Adet', $it['unit_price'],
                    $it['vat_rate'], $it['vat_amount'], $it['line_total']
                ]
            );
        }

        $inv = Database::get('SELECT * FROM invoices WHERE id = ?', [$invoiceId]);
        jsonResponse(['success' => true, 'invoice' => $inv]);
    }

    // 7. INVOICES: LIST
    if ($path === '/api/invoices' && $method === 'GET') {
        $u = requireAuth(['BUSINESS_USER']);
        $invoices = Database::query(
            'SELECT * FROM invoices WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50',
            [$u['tenantId']]
        );
        jsonResponse(['success' => true, 'invoices' => $invoices]);
    }

    // 8. INVOICE GİB SMS İŞLEMLERİ
    if (preg_match('#^/api/invoices/([a-zA-Z0-9-]+)/request-sms$#', $path, $m) && $method === 'POST') {
        $u = requireAuth(['BUSINESS_USER']);
        $invId = $m[1];
        $invoice = Database::get('SELECT * FROM invoices WHERE id = ? AND tenant_id = ?', [$invId, $u['tenantId']]);
        $tenant = Database::get('SELECT * FROM tenants WHERE id = ?', [$u['tenantId']]);

        if (!$invoice) jsonResponse(['success' => false, 'error' => 'Fatura bulunamadı.'], 404);

        $res = GibService::requestSms($invId, $tenant, $invoice);
        Database::run("UPDATE invoices SET status = 'SMS_BEKLENIYOR' WHERE id = ?", [$invId]);
        jsonResponse($res);
    }

    if (preg_match('#^/api/invoices/([a-zA-Z0-9-]+)/verify-sms$#', $path, $m) && $method === 'POST') {
        $u = requireAuth(['BUSINESS_USER']);
        $invId = $m[1];
        $code = $body['smsCode'] ?? '';
        $invoice = Database::get('SELECT * FROM invoices WHERE id = ? AND tenant_id = ?', [$invId, $u['tenantId']]);
        $tenant = Database::get('SELECT * FROM tenants WHERE id = ?', [$u['tenantId']]);

        $res = GibService::verifySms($invId, $code, $tenant, $invoice);
        Database::run(
            "UPDATE invoices SET status = 'BASARILI', gib_uuid = ?, gib_document_number = ? WHERE id = ?",
            [$res['gibUuid'], $res['gibDocumentNumber'], $invId]
        );

        $updated = Database::get('SELECT * FROM invoices WHERE id = ?', [$invId]);
        jsonResponse(['success' => true, 'invoice' => $updated, 'message' => $res['message']]);
    }

    // 9. HTML & THERMAL ÇIKTILAR
    if (preg_match('#^/api/invoices/([a-zA-Z0-9-]+)/html$#', $path, $m)) {
        $invId = $m[1];
        $inv = Database::get('SELECT * FROM invoices WHERE id = ?', [$invId]);
        if (!$inv) { echo 'Fatura bulunamadı.'; exit; }
        $tenant = Database::get('SELECT * FROM tenants WHERE id = ?', [$inv['tenant_id']]);
        $items = Database::query('SELECT * FROM invoice_items WHERE invoice_id = ?', [$invId]);

        header('Content-Type: text/html; charset=UTF-8');
        echo PdfHtmlService::renderA4($inv, $items, $tenant);
        exit;
    }

    if (preg_match('#^/api/invoices/([a-zA-Z0-9-]+)/thermal$#', $path, $m)) {
        $invId = $m[1];
        $inv = Database::get('SELECT * FROM invoices WHERE id = ?', [$invId]);
        if (!$inv) { echo 'Fatura bulunamadı.'; exit; }
        $tenant = Database::get('SELECT * FROM tenants WHERE id = ?', [$inv['tenant_id']]);
        $items = Database::query('SELECT * FROM invoice_items WHERE invoice_id = ?', [$invId]);

        header('Content-Type: text/html; charset=UTF-8');
        echo PdfHtmlService::renderThermal($inv, $items, $tenant);
        exit;
    }

    // 10. ADMIN ROTALAR
    // Admin: Dashboard İstatistikleri
    if ($path === '/api/admin/dashboard' && $method === 'GET') {
        $u = requireAuth(['ADMIN']);
        $stats = Database::get("SELECT
            (SELECT COUNT(*) FROM tenants) AS totalTenants,
            (SELECT COUNT(*) FROM tenants WHERE is_active = 1) AS activeTenants,
            (SELECT COUNT(*) FROM users WHERE role = 'RESELLER') AS totalResellers,
            (SELECT COUNT(*) FROM invoices) AS totalInvoices,
            (SELECT COALESCE(SUM(grand_total), 0) FROM invoices WHERE status = 'BASARILI') AS totalVolume
        ", []);
        $recentInvoices = Database::query(
            "SELECT i.*, t.name AS tenant_name FROM invoices i
             LEFT JOIN tenants t ON i.tenant_id = t.id
             ORDER BY i.created_at DESC LIMIT 20",
            []
        );
        jsonResponse(['success' => true, 'stats' => $stats, 'recentInvoices' => $recentInvoices, 'recentLogs' => []]);
    }

    // Admin: Tüm İşletmeler (Tenants)
    if ($path === '/api/admin/tenants' && $method === 'GET') {
        $u = requireAuth(['ADMIN']);
        $tenants = Database::query(
            "SELECT t.*,
                (SELECT COUNT(*) FROM invoices WHERE tenant_id = t.id) AS invoice_count,
                (SELECT COALESCE(SUM(grand_total), 0) FROM invoices WHERE tenant_id = t.id AND status = 'BASARILI') AS total_sales,
                (SELECT COUNT(*) FROM gib_settings WHERE tenant_id = t.id AND portal_username_enc IS NOT NULL) AS has_gib_configured,
                u2.name AS reseller_name
             FROM tenants t
             LEFT JOIN users u2 ON (u2.id = t.reseller_id OR u2.id = CONCAT('usr-', t.reseller_id)) AND u2.role = 'RESELLER'
             ORDER BY t.created_at DESC",
            []
        );
        jsonResponse(['success' => true, 'tenants' => $tenants]);
    }

    // Admin: Tenant Durum Değiştir
    if (preg_match('#^/api/admin/tenants/([a-zA-Z0-9-]+)/status$#', $path, $m) && ($method === 'POST' || $method === 'PATCH')) {
        $u = requireAuth(['ADMIN']);
        $tenantId = $m[1];
        $tenant = Database::get('SELECT * FROM tenants WHERE id = ?', [$tenantId]);
        if (!$tenant) jsonResponse(['success' => false, 'error' => 'İşletme bulunamadı.'], 404);
        $newStatus = (int)$tenant['is_active'] ? 0 : 1;
        Database::run('UPDATE tenants SET is_active = ? WHERE id = ?', [$newStatus, $tenantId]);
        jsonResponse(['success' => true]);
    }

    // Admin: Bayiler (Resellers)
    if ($path === '/api/admin/resellers' && $method === 'GET') {
        $u = requireAuth(['ADMIN']);
        $resellers = Database::query(
            "SELECT u.*,
                (SELECT COUNT(*) FROM tenants WHERE reseller_id = u.id OR reseller_id = REPLACE(u.id, 'usr-', '')) AS tenant_count,
                (SELECT COALESCE(SUM(i.grand_total), 0) FROM invoices i
                 JOIN tenants t ON i.tenant_id = t.id WHERE (t.reseller_id = u.id OR t.reseller_id = REPLACE(u.id, 'usr-', '')) AND i.status = 'BASARILI') AS total_volume
             FROM users u
             WHERE u.role = 'RESELLER'
             ORDER BY u.created_at DESC",
            []
        );
        jsonResponse(['success' => true, 'resellers' => $resellers]);
    }

    // Admin: Yeni Bayi Oluştur
    if ($path === '/api/admin/resellers' && $method === 'POST') {
        $u = requireAuth(['ADMIN']);
        $name = trim($body['name'] ?? '');
        $email = strtolower(trim($body['email'] ?? ''));
        $password = $body['password'] ?? '';
        $phone = trim($body['phone'] ?? '');
        if (!$name || !$email || !$password) {
            jsonResponse(['success' => false, 'error' => 'Ad, e-posta ve parola zorunludur.'], 400);
        }
        $exists = Database::get('SELECT id FROM users WHERE email = ?', [$email]);
        if ($exists) jsonResponse(['success' => false, 'error' => 'Bu e-posta zaten kayıtlı.'], 409);
        $id = Security::generateUUID();
        $hash = Security::hashPassword($password);
        Database::run(
            "INSERT INTO users (id, name, email, password_hash, role, phone, is_active) VALUES (?, ?, ?, ?, 'RESELLER', ?, 1)",
            [$id, $name, $email, $hash, $phone]
        );
        jsonResponse(['success' => true]);
    }

    // Admin: Bayi Durum Değiştir
    if (preg_match('#^/api/admin/resellers/([a-zA-Z0-9-]+)/status$#', $path, $m) && ($method === 'POST' || $method === 'PATCH')) {
        $u = requireAuth(['ADMIN']);
        $resellerId = $m[1];
        $reseller = Database::get("SELECT * FROM users WHERE id = ? AND role = 'RESELLER'", [$resellerId]);
        if (!$reseller) jsonResponse(['success' => false, 'error' => 'Bayi bulunamadı.'], 404);
        $newStatus = (int)$reseller['is_active'] ? 0 : 1;
        Database::run('UPDATE users SET is_active = ? WHERE id = ?', [$newStatus, $resellerId]);
        jsonResponse(['success' => true]);
    }

    // Admin: Bayi Sil
    if (preg_match('#^/api/admin/resellers/([a-zA-Z0-9-]+)$#', $path, $m) && $method === 'DELETE') {
        $u = requireAuth(['ADMIN']);
        $resellerId = $m[1];
        Database::run("DELETE FROM users WHERE id = ? AND role = 'RESELLER'", [$resellerId]);
        jsonResponse(['success' => true]);
    }

    // Admin: Sistem Logları
    if ($path === '/api/admin/logs' && $method === 'GET') {
        $u = requireAuth(['ADMIN']);
        // Basit log tablosu yoksa boş döndür
        $logs = [];
        try {
            $logs = Database::query(
                "SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 100",
                []
            );
        } catch (Exception $ex) {
            // system_logs tablosu yoksa boş döndür
            $logs = [];
        }
        jsonResponse(['success' => true, 'logs' => $logs]);
    }

    // 11. RAPORLAR / DASHBOARD SUMMARY
    if ($path === '/api/reports/summary' && $method === 'GET') {
        $u = requireAuth(['BUSINESS_USER']);
        $totalInvoices = Database::get('SELECT COUNT(*) as cnt, COALESCE(SUM(grand_total), 0) as total FROM invoices WHERE tenant_id = ?', [$u['tenantId']]);
        $todayInvoices = Database::get('SELECT COUNT(*) as cnt, COALESCE(SUM(grand_total), 0) as total FROM invoices WHERE tenant_id = ? AND invoice_date = ?', [$u['tenantId'], date('Y-m-d')]);

        jsonResponse([
            'success' => true,
            'summary' => [
                'totalInvoices' => (int)$totalInvoices['cnt'],
                'totalVolume'   => (float)$totalInvoices['total'],
                'todayInvoices' => (int)$todayInvoices['cnt'],
                'todayVolume'   => (float)$todayInvoices['total']
            ]
        ]);
    }

    // Bilinmeyen Rota
    jsonResponse(['success' => false, 'error' => "Rota bulunamadı: {$method} {$path}"], 404);

} catch (Exception $e) {
    jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
