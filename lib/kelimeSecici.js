import kelimeler from '../data/kelimeler.json';

/**
 * Rastgele kelime seç (sınırsız oyun için)
 * @param {string} kategori - Kategori (klasik, filmler, futbol, sehirler, muzik)
 * @param {string} oncekiKelime - Önceki kelime (aynısını seçmesin)
 * @returns {string} Rastgele kelime
 */
export function rastgeleKelime(kategori = 'klasik', oncekiKelime = '') {
  const kategoriVerisi = kelimeler[kategori];
  
  if (!kategoriVerisi) {
    console.error(`${kategori} kategorisi bulunamadı`);
    return null;
  }

  // Kategori içindeki tüm kelimeleri al (tüm uzunluklar)
  const tumKelimeler = Object.values(kategoriVerisi).flat();
  
  if (tumKelimeler.length === 0) {
    console.error(`${kategori} kategorisinde kelime bulunamadı`);
    return null;
  }
  
  let yeniKelime;
  let deneme = 0;
  
  do {
    const index = Math.floor(Math.random() * tumKelimeler.length);
    yeniKelime = tumKelimeler[index].toUpperCase();
    deneme++;
  } while (yeniKelime === oncekiKelime.toUpperCase() && deneme < 10);
  
  return yeniKelime;
}

/**
 * Belirli uzunlukta kelime seç
 */
export function rastgeleKelimeUzunluklu(kategori = 'klasik', uzunluk = 5, oncekiKelime = '') {
  const kategoriVerisi = kelimeler[kategori];
  
  if (!kategoriVerisi || !kategoriVerisi[uzunluk.toString()]) {
    // Uzunluk yoksa tüm kelimelerden seç
    return rastgeleKelime(kategori, oncekiKelime);
  }

  const kelimeListesi = kategoriVerisi[uzunluk.toString()];
  
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
 * Oyun sayısını getir (istatistik için)
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
  
  if (!kategoriVerisi) return true; // Kategori yoksa kabul et
  
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
  return Object.keys(kategoriVerisi).map(Number).sort((a, b) => a - b);
}

/**
 * İpucu hakkı hesapla (başarı oranına göre)
 */
export function ipucuHakkiHesapla(istatistik) {
  if (!istatistik || istatistik.oynanan === 0) return 2; // İlk oyun için 2 ipucu
  
  const basariOrani = (istatistik.kazanilan / istatistik.oynanan) * 100;
  const seri = istatistik.seri || 0;
  
  let ipucuHakki = 1; // Temel hak
  
  // Başarı oranına göre
  if (basariOrani < 40) {
    ipucuHakki = 3;
  } else if (basariOrani < 60) {
    ipucuHakki = 2;
  } else if (basariOrani < 80) {
    ipucuHakki = 1;
  } else {
    ipucuHakki = 1;
  }
  
  // Seri bonusu
  if (seri >= 5) {
    ipucuHakki += 1;
  }
  
  return Math.min(ipucuHakki, 3); // Maksimum 3 ipucu
}

/**
 * İpucu oluştur
 */
export function ipucuOlustur(hedefKelime, tahminler, ipucuTipi = 'harf') {
  const hedef = hedefKelime.toUpperCase();
  const tahminHarfler = tahminler.join('').toUpperCase().split('');
  
  if (ipucuTipi === 'harf') {
    // Henüz tahmin edilmemiş bir harf göster
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
    
    // Tüm pozisyonlar bulunduysa rastgele bir ipucu
    return {
      tip: 'bilgi',
      mesaj: `Kelime ${hedef.length} harfli`
    };
  }
  
  return null;
}
