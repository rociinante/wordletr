// Kelime kontrolü ve geri bildirim hesaplama

/**
 * Tahmin edilen kelimeyi hedef kelimeyle karşılaştırır
 * @param {string} tahmin - Kullanıcının tahmini
 * @param {string} hedef - Doğru kelime
 * @returns {Array} Her harf için durum: 'dogru', 'yerinde', 'yok'
 */
export function kontrolEt(tahmin, hedef) {
  const tahminHarfler = tahmin.toUpperCase().split('');
  const hedefHarfler = hedef.toUpperCase().split('');
  const sonuc = new Array(tahminHarfler.length).fill('yok');
  const hedefKalan = [...hedefHarfler];

  // İlk geçiş: Doğru yerdeki harfleri bul
  tahminHarfler.forEach((harf, i) => {
    if (harf === hedefHarfler[i]) {
      sonuc[i] = 'dogru';
      hedefKalan[i] = null;
    }
  });

  // İkinci geçiş: Yanlış yerdeki harfleri bul
  tahminHarfler.forEach((harf, i) => {
    if (sonuc[i] !== 'dogru') {
      const kalanIndex = hedefKalan.indexOf(harf);
      if (kalanIndex !== -1) {
        sonuc[i] = 'yerinde';
        hedefKalan[kalanIndex] = null;
      }
    }
  });

  return sonuc;
}

/**
 * Kelimenin geçerli olup olmadığını kontrol eder
 * @param {string} kelime - Kontrol edilecek kelime
 * @param {number} uzunluk - Beklenen uzunluk
 * @returns {boolean}
 */
export function gecerliMi(kelime, uzunluk) {
  if (!kelime || kelime.length !== uzunluk) return false;
  
  // Sadece Türkçe harfler
  const turkceHarfler = /^[A-ZÇĞİÖŞÜ]+$/i;
  return turkceHarfler.test(kelime);
}

/**
 * Oyun durumunu hesapla
 * @param {Array} tahminler - Yapılan tahminler
 * @param {string} hedef - Hedef kelime
 * @returns {string} 'devam', 'kazandi', 'kaybetti'
 */
export function oyunDurumu(tahminler, hedef) {
  if (!tahminler || tahminler.length === 0) return 'devam';
  
  const sonTahmin = tahminler[tahminler.length - 1];
  if (sonTahmin.toUpperCase() === hedef.toUpperCase()) {
    return 'kazandi';
  }
  
  if (tahminler.length >= 6) {
    return 'kaybetti';
  }
  
  return 'devam';
}

/**
 * Klavye durumlarını güncelle
 * @param {Object} mevcutDurum - Mevcut klavye durumu
 * @param {string} tahmin - Yeni tahmin
 * @param {Array} sonuc - Tahmin sonucu
 * @returns {Object} Güncellenmiş klavye durumu
 */
export function klavyeGuncelle(mevcutDurum, tahmin, sonuc) {
  const yeniDurum = { ...mevcutDurum };
  const harfler = tahmin.toUpperCase().split('');
  
  harfler.forEach((harf, i) => {
    const mevcutHarfDurum = yeniDurum[harf];
    const yeniHarfDurum = sonuc[i];
    
    // Öncelik: dogru > yerinde > yok
    if (yeniHarfDurum === 'dogru') {
      yeniDurum[harf] = 'dogru';
    } else if (yeniHarfDurum === 'yerinde' && mevcutHarfDurum !== 'dogru') {
      yeniDurum[harf] = 'yerinde';
    } else if (!mevcutHarfDurum) {
      yeniDurum[harf] = 'yok';
    }
  });
  
  return yeniDurum;
}

/**
 * Paylaşım metni oluştur
 * @param {Array} tahminler - Yapılan tahminler
 * @param {string} hedef - Hedef kelime
 * @param {number} gunSayisi - Günün sayısı
 * @returns {string} Paylaşım metni
 */
export function paylasimMetni(tahminler, hedef, gunSayisi) {
  const kazandi = tahminler.some(t => t.toUpperCase() === hedef.toUpperCase());
  const skor = kazandi ? `${tahminler.length}/6` : 'X/6';
  
  let metin = `Wordletr #${gunSayisi} ${skor}\n\n`;
  
  tahminler.forEach(tahmin => {
    const sonuc = kontrolEt(tahmin, hedef);
    const satirEmoji = sonuc.map(durum => {
      if (durum === 'dogru') return '🟩';
      if (durum === 'yerinde') return '🟨';
      return '⬛';
    }).join('');
    metin += satirEmoji + '\n';
  });
  
  metin += '\nwordletr.vercel.app';
  
  return metin;
}
