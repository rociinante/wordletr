/**
 * Tahmin kontrol et
 * @param {string} tahmin - Kullanıcının tahmini
 * @param {string} hedef - Hedef kelime
 * @returns {string[]} Her harf için durum: 'dogru', 'mevcut', 'yok'
 */
export function kontrolEt(tahmin, hedef) {
  const tahminArr = tahmin.toUpperCase().split('');
  const hedefArr = hedef.toUpperCase().split('');
  const sonuc = new Array(tahminArr.length).fill('yok');
  const hedefKullanildi = new Array(hedefArr.length).fill(false);

  // İlk geçiş: Doğru pozisyondaki harfler
  for (let i = 0; i < tahminArr.length; i++) {
    if (tahminArr[i] === hedefArr[i]) {
      sonuc[i] = 'dogru';
      hedefKullanildi[i] = true;
    }
  }

  // İkinci geçiş: Yanlış pozisyondaki harfler
  for (let i = 0; i < tahminArr.length; i++) {
    if (sonuc[i] === 'dogru') continue;

    for (let j = 0; j < hedefArr.length; j++) {
      if (!hedefKullanildi[j] && tahminArr[i] === hedefArr[j]) {
        sonuc[i] = 'mevcut';
        hedefKullanildi[j] = true;
        break;
      }
    }
  }

  return sonuc;
}

/**
 * Klavye durumunu güncelle
 * @param {Object} mevcutDurum - Mevcut harf durumları
 * @param {string} tahmin - Son tahmin
 * @param {string[]} sonuc - Tahmin sonucu
 * @returns {Object} Güncellenmiş harf durumları
 */
export function klavyeGuncelle(mevcutDurum, tahmin, sonuc) {
  const yeniDurum = { ...mevcutDurum };
  const harfler = tahmin.toUpperCase().split('');

  harfler.forEach((harf, index) => {
    const yeniSonuc = sonuc[index];
    const eskiSonuc = yeniDurum[harf];

    // Öncelik: dogru > mevcut > yok
    if (yeniSonuc === 'dogru') {
      yeniDurum[harf] = 'dogru';
    } else if (yeniSonuc === 'mevcut' && eskiSonuc !== 'dogru') {
      yeniDurum[harf] = 'mevcut';
    } else if (!eskiSonuc) {
      yeniDurum[harf] = 'yok';
    }
  });

  return yeniDurum;
}

/**
 * Paylaşım metni oluştur
 * @param {string[]} tahminler - Tüm tahminler
 * @param {string} hedef - Hedef kelime
 * @param {number} oyunNo - Oyun numarası
 * @returns {string} Paylaşım metni
 */
export function paylasimMetni(tahminler, hedef, oyunNo = 1) {
  const satirlar = tahminler.map(tahmin => {
    const sonuc = kontrolEt(tahmin, hedef);
    return sonuc.map(s => {
      if (s === 'dogru') return '🟩';
      if (s === 'mevcut') return '🟨';
      return '⬛';
    }).join('');
  });

  const basariliMi = tahminler.length > 0 && 
    tahminler[tahminler.length - 1].toUpperCase() === hedef.toUpperCase();

  const skor = basariliMi ? `${tahminler.length}/6` : 'X/6';

  return `Wordletr #${oyunNo} ${skor}\n\n${satirlar.join('\n')}\n\nhttps://wordletr.vercel.app`;
}

/**
 * Zor mod kontrolü - bulunan harfler kullanılmalı
 * @param {string} yeniTahmin - Yeni tahmin
 * @param {string[]} tahminler - Önceki tahminler
 * @param {string[][]} sonuclar - Önceki sonuçlar
 * @returns {{gecerli: boolean, mesaj: string}}
 */
export function zorModKontrol(yeniTahmin, tahminler, sonuclar) {
  const yeniTahminArr = yeniTahmin.toUpperCase().split('');
  
  // Tüm tahminleri ve sonuçları incele
  for (let t = 0; t < tahminler.length; t++) {
    const oncekiTahmin = tahminler[t].toUpperCase().split('');
    const oncekiSonuc = sonuclar[t];
    
    for (let i = 0; i < oncekiTahmin.length; i++) {
      const harf = oncekiTahmin[i];
      const sonuc = oncekiSonuc[i];
      
      // Doğru yerdeki harfler aynı pozisyonda olmalı
      if (sonuc === 'dogru') {
        if (yeniTahminArr[i] !== harf) {
          return {
            gecerli: false,
            mesaj: `${i + 1}. harf ${harf} olmalı!`
          };
        }
      }
      
      // Mevcut harfler kelimede olmalı
      if (sonuc === 'mevcut') {
        if (!yeniTahminArr.includes(harf)) {
          return {
            gecerli: false,
            mesaj: `${harf} harfini kullanmalısın!`
          };
        }
      }
    }
  }
  
  return { gecerli: true, mesaj: '' };
}

/**
 * Kör mod sonucu - renkler yerine sayılar
 * @param {string[]} sonuc - Normal sonuç dizisi
 * @returns {{dogruYer: number, yanliyer: number}}
 */
export function korModSonuc(sonuc) {
  const dogruYer = sonuc.filter(s => s === 'dogru').length;
  const yanliyer = sonuc.filter(s => s === 'mevcut').length;
  
  return { dogruYer, yanliyer };
}
