import kelimeler from '../data/kelimeler.json';

/**
 * Belirli uzunlukta rastgele kelime seç
 * @param {string} kategori - Kategori
 * @param {number} uzunluk - Kelime uzunluğu
 * @param {string} oncekiKelime - Önceki kelime (aynısını seçmesin)
 * @returns {string} Rastgele kelime
 */
export function rastgeleKelimeUzunluklu(kategori = 'klasik', uzunluk = 5, oncekiKelime = '') {
  const kategoriVerisi = kelimeler[kategori];
  
  if (!kategoriVerisi) {
    console.error(`${kategori} kategorisi bulunamadı`);
    return rastgeleKelimeUzunluklu('klasik', uzunluk, oncekiKelime);
  }

  // Önce istenen uzunluğu dene
  let kelimeListesi = kategoriVerisi[uzunluk.toString()];
  
  // Yoksa en yakın uzunluğu bul
  if (!kelimeListesi || kelimeListesi.length === 0) {
    const mevcutUzunluklar = Object.keys(kategoriVerisi).map(Number).sort((a, b) => a - b);
    const enYakin = mevcutUzunluklar.reduce((prev, curr) => 
      Math.abs(curr - uzunluk) < Math.abs(prev - uzunluk) ? curr : prev
    );
    kelimeListesi = kategoriVerisi[enYakin.toString()];
  }
  
  if (!kelimeListesi || kelimeListesi.length === 0) {
    console.error(`${kategori} kategorisinde ${uzunluk} harfli kelime bulunamadı`);
    return 'HATA';
  }

  let yeniKelime;
  let deneme = 0;
  
  do {
    const index = Math.floor(Math.random() * kelimeListesi.length);
    yeniKelime = kelimeListesi[index].toUpperCase();
    deneme++;
  } while (yeniKelime === oncekiKelime.toUpperCase() && deneme < 10);
  
  return yeniKelime;
}

/**
 * Rastgele kelime seç (herhangi bir uzunlukta)
 * @param {string} kategori - Kategori
 * @param {string} oncekiKelime - Önceki kelime
 * @returns {string} Rastgele kelime
 */
export function rastgeleKelime(kategori = 'klasik', oncekiKelime = '') {
  return rastgeleKelimeUzunluklu(kategori, 5, oncekiKelime);
}

/**
 * Oyun sayısını getir
 */
export function oyunSayisiGetir() {
  if (typeof window === 'undefined') return 1;
  const sayi = localStorage.getItem('wordletr_oyun_sayisi') || '0';
  return parseInt(sayi, 10) + 1;
}

/**
 * Oyun sayısını artır
 */
export function oyunSayisiArtir() {
  if (typeof window === 'undefined') return;
  const sayi = oyunSayisiGetir();
  localStorage.setItem('wordletr_oyun_sayisi', sayi.toString());
}

/**
 * Kelimenin listede olup olmadığını kontrol et
 */
export function kelimeGecerliMi(kelime, kategori = 'klasik') {
  const kategoriVerisi = kelimeler[kategori];
  
  if (!kategoriVerisi) return true;
  
  const tumKelimeler = Object.values(kategoriVerisi).flat();
  
  return tumKelimeler.some(k => 
    k.toUpperCase() === kelime.toUpperCase()
  );
}

/**
 * Mevcut kategorileri getir
 */
export function kategorileriGetir() {
  return kelimeler.kategoriler || {};
}

/**
 * Mevcut kelime uzunluklarını getir (kategori için)
 */
export function mevcutUzunluklar(kategori = 'klasik') {
  const kategoriVerisi = kelimeler[kategori];
  if (!kategoriVerisi) return [5];
  return Object.keys(kategoriVerisi).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
}

/**
 * İpucu hakkı hesapla (başarı oranına göre)
 */
export function ipucuHakkiHesapla(istatistik) {
  if (!istatistik || istatistik.oynanan === 0) return 2;
  
  const basariOrani = (istatistik.kazanilan / istatistik.oynanan) * 100;
  const seri = istatistik.seri || 0;
  
  let ipucuHakki = 1;
  
  if (basariOrani < 40) {
    ipucuHakki = 3;
  } else if (basariOrani < 60) {
    ipucuHakki = 2;
  } else if (basariOrani < 80) {
    ipucuHakki = 1;
  } else {
    ipucuHakki = 1;
  }
  
  if (seri >= 5) {
    ipucuHakki += 1;
  }
  
  return Math.min(ipucuHakki, 3);
}

/**
 * İpucu oluştur
 */
export function ipucuOlustur(hedefKelime, tahminler, ipucuTipi = 'harf') {
  const hedef = hedefKelime.toUpperCase();
  
  if (ipucuTipi === 'harf') {
    for (let i = 0; i < hedef.length; i++) {
      const harf = hedef[i];
      const harfTahminEdildi = tahminler.some(t => {
        const tahmin = t.toUpperCase();
        return tahmin[i] === harf;
      });
      
      if (!harfTahminEdildi) {
        return {
          tip: 'harf',
          mesaj: `${i + 1}. harf: ${harf}`,
          pozisyon: i,
          harf: harf
        };
      }
    }
    
    return {
      tip: 'bilgi',
      mesaj: `Kelime ${hedef.length} harfli`
    };
  }
  
  return null;
}

/**
 * Kelimeyi şifrele (meydan okuma için)
 * Basit base64 + karakter kaydırma
 */
export function kelimeSifrele(kelime) {
  const temiz = kelime.toUpperCase().trim();
  
  // Türkçe karakterleri ASCII'ye çevir
  const turkceMap = {
    'Ç': 'C1', 'Ğ': 'G1', 'İ': 'I1', 'Ö': 'O1', 'Ş': 'S1', 'Ü': 'U1',
    'ç': 'c1', 'ğ': 'g1', 'ı': 'i1', 'ö': 'o1', 'ş': 's1', 'ü': 'u1'
  };
  
  let encoded = temiz;
  Object.entries(turkceMap).forEach(([tr, en]) => {
    encoded = encoded.replace(new RegExp(tr, 'g'), en);
  });
  
  // Karakter kaydırma (basit şifreleme)
  const shifted = encoded.split('').map(c => {
    const code = c.charCodeAt(0);
    return String.fromCharCode(code + 3);
  }).join('');
  
  // Base64 encode
  try {
    return btoa(shifted);
  } catch (e) {
    return btoa(encodeURIComponent(shifted));
  }
}

/**
 * Şifreli kelimeyi çöz
 */
export function kelimeCoz(sifreli) {
  try {
    // Base64 decode
    let decoded;
    try {
      decoded = atob(sifreli);
    } catch (e) {
      decoded = decodeURIComponent(atob(sifreli));
    }
    
    // Karakter kaydırmasını geri al
    const unshifted = decoded.split('').map(c => {
      const code = c.charCodeAt(0);
      return String.fromCharCode(code - 3);
    }).join('');
    
    // Türkçe karakterleri geri çevir
    const turkceMap = {
      'C1': 'Ç', 'G1': 'Ğ', 'I1': 'İ', 'O1': 'Ö', 'S1': 'Ş', 'U1': 'Ü',
      'c1': 'ç', 'g1': 'ğ', 'i1': 'ı', 'o1': 'ö', 's1': 'ş', 'u1': 'ü'
    };
    
    let sonuc = unshifted;
    Object.entries(turkceMap).forEach(([en, tr]) => {
      sonuc = sonuc.replace(new RegExp(en, 'g'), tr);
    });
    
    return sonuc.toUpperCase();
  } catch (e) {
    console.error('Kelime çözme hatası:', e);
    return null;
  }
}

// ============ GÜNLÜK CHALLENGE ============

/**
 * Bugünün tarih hash'ini al (seed olarak kullanılacak)
 */
function getTarihHash() {
  const bugun = new Date();
  const tarihStr = `${bugun.getFullYear()}-${bugun.getMonth() + 1}-${bugun.getDate()}`;
  
  // Basit hash fonksiyonu
  let hash = 0;
  for (let i = 0; i < tarihStr.length; i++) {
    const char = tarihStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Günlük kelimeyi getir (herkes aynı kelimeyi görür)
 */
export function gunlukKelimeGetir(uzunluk = 5) {
  const seed = getTarihHash();
  const kategoriVerisi = kelimeler['klasik'];
  
  if (!kategoriVerisi) return 'HATA';
  
  const kelimeListesi = kategoriVerisi[uzunluk.toString()];
  if (!kelimeListesi || kelimeListesi.length === 0) return 'HATA';
  
  // Seed'e göre kelime seç
  const index = seed % kelimeListesi.length;
  return kelimeListesi[index].toUpperCase();
}

/**
 * Günlük challenge oynandı mı kontrol et
 */
export function gunlukOynandiMi() {
  if (typeof window === 'undefined') return false;
  
  const sonOyun = localStorage.getItem('wordletr_gunluk_tarih');
  const bugun = new Date().toDateString();
  
  return sonOyun === bugun;
}

/**
 * Günlük challenge'ı oynandı olarak işaretle
 */
export function gunlukOynandi(sonuc) {
  if (typeof window === 'undefined') return;
  
  const bugun = new Date().toDateString();
  localStorage.setItem('wordletr_gunluk_tarih', bugun);
  localStorage.setItem('wordletr_gunluk_sonuc', JSON.stringify({
    tarih: bugun,
    kazandi: sonuc.kazandi,
    tahminSayisi: sonuc.tahminSayisi,
    kelime: sonuc.kelime
  }));
}

/**
 * Son günlük challenge sonucunu getir
 */
export function gunlukSonucGetir() {
  if (typeof window === 'undefined') return null;
  
  try {
    const sonuc = localStorage.getItem('wordletr_gunluk_sonuc');
    return sonuc ? JSON.parse(sonuc) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Günlük challenge istatistiklerini getir
 */
export function gunlukIstatistikGetir() {
  if (typeof window === 'undefined') return { oynanan: 0, kazanilan: 0, seri: 0 };
  
  try {
    const veri = localStorage.getItem('wordletr_gunluk_istatistik');
    return veri ? JSON.parse(veri) : { oynanan: 0, kazanilan: 0, seri: 0, enUzunSeri: 0 };
  } catch (e) {
    return { oynanan: 0, kazanilan: 0, seri: 0, enUzunSeri: 0 };
  }
}

/**
 * Günlük challenge istatistiklerini güncelle
 */
export function gunlukIstatistikGuncelle(kazandi) {
  if (typeof window === 'undefined') return;
  
  const ist = gunlukIstatistikGetir();
  ist.oynanan += 1;
  
  if (kazandi) {
    ist.kazanilan += 1;
    ist.seri += 1;
    ist.enUzunSeri = Math.max(ist.enUzunSeri, ist.seri);
  } else {
    ist.seri = 0;
  }
  
  localStorage.setItem('wordletr_gunluk_istatistik', JSON.stringify(ist));
}
