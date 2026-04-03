import kelimeler from '../data/kelimeler.json';

// Başlangıç tarihi (bu tarihten itibaren gün sayısı hesaplanır)
const BASLANGIC_TARIHI = new Date('2024-01-01');

/**
 * Bugünün tarihini YYYY-MM-DD formatında döndür
 */
export function bugunTarih() {
  const bugun = new Date();
  return bugun.toISOString().split('T')[0];
}

/**
 * Başlangıç tarihinden bu yana kaç gün geçti
 */
export function gunSayisi() {
  const bugun = new Date();
  const fark = bugun - BASLANGIC_TARIHI;
  return Math.floor(fark / (1000 * 60 * 60 * 24));
}

/**
 * Sonraki kelimeye kalan süre
 */
export function sonrakiKelimeyeKalan() {
  const simdi = new Date();
  const yarin = new Date(simdi);
  yarin.setDate(yarin.getDate() + 1);
  yarin.setHours(0, 0, 0, 0);
  
  const fark = yarin - simdi;
  
  const saat = Math.floor(fark / (1000 * 60 * 60));
  const dakika = Math.floor((fark % (1000 * 60 * 60)) / (1000 * 60));
  const saniye = Math.floor((fark % (1000 * 60)) / 1000);
  
  return { saat, dakika, saniye, toplam: fark };
}

/**
 * Belirli bir uzunluk için günün kelimesini seç
 * @param {number} uzunluk - Kelime uzunluğu (4-7)
 * @returns {string} Günün kelimesi
 */
export function gunlukKelime(uzunluk = 5) {
  const kelimeListesi = kelimeler[uzunluk.toString()];
  
  if (!kelimeListesi || kelimeListesi.length === 0) {
    console.error(`${uzunluk} harfli kelime bulunamadı`);
    return null;
  }
  
  // Tarih + uzunluk kombinasyonundan benzersiz index oluştur
  const tarih = bugunTarih();
  const seed = tarihdenSeed(tarih, uzunluk);
  const index = seed % kelimeListesi.length;
  
  return kelimeListesi[index].toUpperCase();
}

/**
 * Tarih ve uzunluktan deterministik seed oluştur
 */
function tarihdenSeed(tarih, uzunluk) {
  const str = tarih + '-' + uzunluk;
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit integer'a çevir
  }
  
  return Math.abs(hash);
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
