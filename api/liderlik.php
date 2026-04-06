<?php
/**
 * Wordletr Liderlik API
 * 
 * Bu dosyayı hosting'ine yükle (örn: wordletr.com/api/liderlik.php)
 * Aynı dizinde liderlik.json dosyası otomatik oluşturulacak
 */

// CORS ayarları - tüm domainlerden erişime izin ver
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// OPTIONS request için (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Liderlik dosyası
$dosya = __DIR__ . '/liderlik.json';

// Dosya yoksa oluştur
if (!file_exists($dosya)) {
    file_put_contents($dosya, json_encode([], JSON_PRETTY_PRINT));
}

// GET - Liderlik listesini getir
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $veri = json_decode(file_get_contents($dosya), true) ?: [];
    
    // Puana göre sırala
    usort($veri, function($a, $b) {
        return ($b['puan'] ?? 0) - ($a['puan'] ?? 0);
    });
    
    // İlk 100'ü döndür
    $veri = array_slice($veri, 0, 100);
    
    echo json_encode([
        'basarili' => true,
        'liderlik' => $veri
    ]);
    exit();
}

// POST - Skor güncelle
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $girdi = json_decode(file_get_contents('php://input'), true);
    
    // Validasyon
    if (!isset($girdi['id']) || !isset($girdi['ad'])) {
        http_response_code(400);
        echo json_encode(['basarili' => false, 'hata' => 'Eksik veri']);
        exit();
    }
    
    // Verileri temizle
    $id = preg_replace('/[^a-zA-Z0-9]/', '', substr($girdi['id'], 0, 50));
    $ad = mb_substr(strip_tags($girdi['ad']), 0, 20);
    $puan = intval($girdi['puan'] ?? 0);
    $oynanan = intval($girdi['oynanan'] ?? 0);
    $kazanilan = intval($girdi['kazanilan'] ?? 0);
    $seri = intval($girdi['seri'] ?? 0);
    $enUzunSeri = intval($girdi['enUzunSeri'] ?? 0);
    
    // Mevcut veriyi oku
    $veri = json_decode(file_get_contents($dosya), true) ?: [];
    
    // Kullanıcıyı bul veya ekle
    $bulundu = false;
    foreach ($veri as &$oyuncu) {
        if ($oyuncu['id'] === $id) {
            $oyuncu['ad'] = $ad;
            $oyuncu['puan'] = $puan;
            $oyuncu['oynanan'] = $oynanan;
            $oyuncu['kazanilan'] = $kazanilan;
            $oyuncu['seri'] = $seri;
            $oyuncu['enUzunSeri'] = $enUzunSeri;
            $oyuncu['sonGuncelleme'] = time() * 1000;
            $bulundu = true;
            break;
        }
    }
    
    if (!$bulundu) {
        $veri[] = [
            'id' => $id,
            'ad' => $ad,
            'puan' => $puan,
            'oynanan' => $oynanan,
            'kazanilan' => $kazanilan,
            'seri' => $seri,
            'enUzunSeri' => $enUzunSeri,
            'sonGuncelleme' => time() * 1000
        ];
    }
    
    // Puana göre sırala ve kaydet
    usort($veri, function($a, $b) {
        return ($b['puan'] ?? 0) - ($a['puan'] ?? 0);
    });
    
    // İlk 500'ü tut (disk alanı için)
    $veri = array_slice($veri, 0, 500);
    
    file_put_contents($dosya, json_encode($veri, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    echo json_encode([
        'basarili' => true,
        'mesaj' => 'Skor güncellendi',
        'sira' => array_search($id, array_column($veri, 'id')) + 1
    ]);
    exit();
}

// Bilinmeyen method
http_response_code(405);
echo json_encode(['basarili' => false, 'hata' => 'Geçersiz method']);
