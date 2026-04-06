<?php
/**
 * Wordletr Kelime Anlam API
 * Anthropic Claude API kullanarak kelime anlamı getirir
 * 
 * Bu dosyayı hosting'ine yükle: wordletr.com/api/anlam.php
 */

// CORS ayarları
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// OPTIONS request için (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Sadece POST kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['basarili' => false, 'hata' => 'Sadece POST desteklenir']);
    exit();
}

// ⚠️ API KEY'İNİ BURAYA YAZ
$ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY';

// Input al
$girdi = json_decode(file_get_contents('php://input'), true);
$kelime = isset($girdi['kelime']) ? trim(strtoupper($girdi['kelime'])) : '';

if (empty($kelime) || strlen($kelime) < 2 || strlen($kelime) > 10) {
    http_response_code(400);
    echo json_encode(['basarili' => false, 'hata' => 'Geçersiz kelime']);
    exit();
}

// Cache kontrol (aynı kelime için tekrar API çağrısı yapma)
$cacheDir = __DIR__ . '/cache';
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

$cacheFile = $cacheDir . '/' . md5($kelime) . '.json';

// Cache varsa kullan (7 gün)
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < 604800) {
    $cachedData = json_decode(file_get_contents($cacheFile), true);
    if ($cachedData) {
        echo json_encode($cachedData);
        exit();
    }
}

// Anthropic API çağrısı
$prompt = "\"$kelime\" kelimesinin Türkçe anlamını çok kısa ve öz şekilde açıkla. 
Sadece 1-2 cümle yaz. Örnek cümle de ekle.
JSON formatında yanıt ver: {\"anlam\": \"...\", \"ornek\": \"...\"}
Sadece JSON döndür, başka bir şey yazma.";

$data = [
    'model' => 'claude-sonnet-4-20250514',
    'max_tokens' => 200,
    'messages' => [
        ['role' => 'user', 'content' => $prompt]
    ]
];

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . $ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01'
    ],
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    // API hatası - basit fallback
    $sonuc = [
        'basarili' => true,
        'kelime' => $kelime,
        'anlam' => 'Bu kelimenin anlamı şu an yüklenemiyor.',
        'ornek' => '',
        'kaynak' => 'fallback'
    ];
    echo json_encode($sonuc);
    exit();
}

$apiResponse = json_decode($response, true);
$content = $apiResponse['content'][0]['text'] ?? '';

// JSON parse et
$anlamData = json_decode($content, true);

if (!$anlamData || !isset($anlamData['anlam'])) {
    // Parse hatası - ham içeriği kullan
    $sonuc = [
        'basarili' => true,
        'kelime' => $kelime,
        'anlam' => preg_replace('/[{}"\[\]]/', '', $content),
        'ornek' => '',
        'kaynak' => 'ai'
    ];
} else {
    $sonuc = [
        'basarili' => true,
        'kelime' => $kelime,
        'anlam' => $anlamData['anlam'],
        'ornek' => $anlamData['ornek'] ?? '',
        'kaynak' => 'ai'
    ];
}

// Cache'e kaydet
file_put_contents($cacheFile, json_encode($sonuc, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

echo json_encode($sonuc, JSON_UNESCAPED_UNICODE);
