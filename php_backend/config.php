<?php
/**
 * PRATİKFATURA Yapılandırma Dosyası
 * cPanel veritabanı bilgilerinizi buraya giriniz.
 */

return [
    'db' => [
        'host'     => 'localhost',
        'database' => 'kesfattura_fevrifatura', // cPanel veritabanı adınız
        'username' => 'kesfattura_fevrifaturauser', // cPanel veritabanı kullanıcınız
        'password' => '0+Hel-fevri',                // cPanel'de belirlediğiniz şifre
        'charset'  => 'utf8mb4',
        'port'     => 3306
    ],
    'jwt' => [
        'secret'     => 'pratikfatura_jwt_super_secret_key_2026_guvenli_anahtar',
        'expires_in' => 86400 * 7 // 7 gün geçerli
    ],
    'gib' => [
        'test_url' => 'https://earsivportaltest.efatura.gov.tr',
        'prod_url' => 'https://earsivportal.efatura.gov.tr',
        'timeout'  => 15
    ],
    'app' => [
        'name'     => 'PRATİKFATURA',
        'version'  => '1.0.0',
        'timezone' => 'Europe/Istanbul'
    ]
];
