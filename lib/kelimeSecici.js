import kelimeler from '../data/kelimeler.json';

/**
 * Rastgele kelime seç (sınırsız oyun için)
 * @param {number} uzunluk - Kelime uzunluğu (4-7)
 * @param {string} oncekiKelime - Önceki kelime (aynısını seçmesin)
 * @returns {string} Rastgele kelime
 */
export function rastgeleKelime(uzunluk = 5, oncekiKelime = '') {
  const kelimeListesi = kelimeler[uzunluk.toString()];
  
  if (!kelimeListesi || kelimeListesi.length === 0) {
    console.error(`${uzunluk} harfli kelime bulunamadı`);
    return null;
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
 * @param {string} kelime - Kontrol edilecek kelime
 * @param {number} uzunluk - Kelime uzunluğu
 * @returns {boolean}
 */
export function kelimeGecerliMi(kelime, uzunluk) {
  const kelimeListesi = kelimeler[uzunluk.toString()];
  
  if (!kelimeListesi) return false;
  
  return kelimeListesi.some(k => 
    k.toUpperCase() === kelime.toUpperCase()
  );
}

/**
 * Mevcut kelime uzunluklarını getir
 */
export function mevcutUzunluklar() {
  return Object.keys(kelimeler).map(Number).sort((a, b) => a - b);
}
