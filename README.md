# İyi Kelime 🎮

iyikelime.com — Türkçe Wordle deneyimi! 6 farklı modda oyna, rozetler kazan, arkadaşlarına meydan oku.

## ✨ Özellikler

### Oyun Modları
- ♾️ **Sınırsız** — İstediğin kadar oyna
- 📅 **Günlük** — Her gün yeni kelime, tek hak
- 🔥 **Zor Mod** — Bulunan harfleri kullanmak zorunlu
- ⏱️ **Time Attack** — 5 dakikada en fazla kelime
- 🪜 **Merdiven** — 4→5→6→7 harf, yanılırsan başa dön
- 💀 **Survival** — 60 saniye, doğru harfte +süre
- 🙈 **Kör Mod** — Renkler yok, sadece sayılar

### Diğer Özellikler
- 🏆 Global liderlik tablosu
- 🏅 25+ rozet sistemi
- 🎯 Meydan okuma linki
- 🔊 Ses efektleri
- 🎨 6 tema rengi
- 🌙 Karanlık/Aydınlık mod
- 📱 PWA desteği

## 🚀 Kurulum

```bash
npm install
npm run dev
```

## 📁 Hosting Kurulumu

1. `api/liderlik.php` → `/public_html/api/liderlik.php`
2. `lib/depolama.js` satır 4'ü güncelle:
   ```javascript
   const API_URL = 'https://iyikelime.com/api/liderlik.php';
   ```
3. PWA ikonları ekle: `icon-192.png`, `icon-512.png`

Made with 💜 for iyikelime.com
