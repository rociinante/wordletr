// localStorage işlemleri

const ISTATISTIK_KEY = 'wordletr_istatistik';
const OYUN_KEY = 'wordletr_oyun';
const AYAR_KEY = 'wordletr_ayar';
const KULLANICI_KEY = 'wordletr_kullanici';
const LIDERLIK_KEY = 'wordletr_liderlik';

/**
 * Varsayılan istatistik objesi
 */
const varsayilanIstatistik = {
  oynanan: 0,
  kazanilan: 0,
  kaybedilen: 0,
  seri: 0,
  enUzunSeri: 0,
  dagilim: [0, 0, 0, 0, 0, 0],
  toplamPuan: 0,
};

/**
 * Varsayılan ayarlar
 */
const varsayilanAyar = {
  tema: 'dark',
  uzunluk: 5,
  kategori: 'klasik',
};

/**
 * Rastgele kullanıcı adı oluştur
 */
function rastgeleKullaniciAdi() {
  const sifatlar = ['Hızlı', 'Zeki', 'Cesur', 'Şanslı', 'Güçlü', 'Akıllı', 'Efsane', 'Süper', 'Mega', 'Usta'];
  const isimler = ['Oyuncu', 'Tahmin', 'Kelime', 'Harf', 'Bilge', 'Kaşif', 'Gezgin', 'Avcı', 'Savaşçı', 'Şampiyon'];
  
  const sifat = sifatlar[Math.floor(Math.random() * sifatlar.length)];
  const isim = isimler[Math.floor(Math.random() * isimler.length)];
  const sayi = Math.floor(Math.random() * 1000);
  
  return `${sifat}${isim}${sayi}`;
}

/**
 * Kullanıcı bilgilerini getir
 */
export function kullaniciGetir() {
  if (typeof window === 'undefined') return { ad: 'Misafir', id: null };
  
  try {
    const veri = localStorage.getItem(KULLANICI_KEY);
    if (veri) {
      return JSON.parse(veri);
    }
  } catch (e) {
    console.error('Kullanıcı okuma hatası:', e);
  }
  
  // Yeni kullanıcı oluştur
  const yeniKullanici = {
    ad: rastgeleKullaniciAdi(),
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    olusturulma: Date.now(),
  };
  
  kullaniciKaydet(yeniKullanici);
  return yeniKullanici;
}

/**
 * Kullanıcı bilgilerini kaydet
 */
export function kullaniciKaydet(kullanici) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(KULLANICI_KEY, JSON.stringify(kullanici));
  } catch (e) {
    console.error('Kullanıcı kaydetme hatası:', e);
  }
}

/**
 * Kullanıcı adını güncelle
 */
export function kullaniciAdiGuncelle(yeniAd) {
  const kullanici = kullaniciGetir();
  kullanici.ad = yeniAd || rastgeleKullaniciAdi();
  kullaniciKaydet(kullanici);
  return kullanici;
}

/**
 * Liderlik tablosunu getir
 */
export function liderlikGetir() {
  if (typeof window === 'undefined') return [];
  
  try {
    const veri = localStorage.getItem(LIDERLIK_KEY);
    if (veri) {
      return JSON.parse(veri);
    }
  } catch (e) {
    console.error('Liderlik okuma hatası:', e);
  }
  
  return [];
}

/**
 * Liderlik tablosuna ekle/güncelle
 */
export function liderlikGuncelle() {
  const kullanici = kullaniciGetir();
  const istatistik = istatistikGetir();
  const liderlik = liderlikGetir();
  
  // Puan hesapla
  const puan = hesaplaPuan(istatistik);
  
  // Mevcut kullanıcıyı bul veya ekle
  const mevcutIndex = liderlik.findIndex(l => l.id === kullanici.id);
  
  const kayit = {
    id: kullanici.id,
    ad: kullanici.ad,
    puan: puan,
    oynanan: istatistik.oynanan,
    kazanilan: istatistik.kazanilan,
    seri: istatistik.seri,
    enUzunSeri: istatistik.enUzunSeri,
    sonGuncelleme: Date.now(),
  };
  
  if (mevcutIndex >= 0) {
    liderlik[mevcutIndex] = kayit;
  } else {
    liderlik.push(kayit);
  }
  
  // Puana göre sırala
  liderlik.sort((a, b) => b.puan - a.puan);
  
  // En fazla 100 kayıt tut
  const limitliLiderlik = liderlik.slice(0, 100);
  
  try {
    localStorage.setItem(LIDERLIK_KEY, JSON.stringify(limitliLiderlik));
  } catch (e) {
    console.error('Liderlik kaydetme hatası:', e);
  }
  
  return limitliLiderlik;
}

/**
 * Puan hesapla
 */
function hesaplaPuan(istatistik) {
  const kazanmaPuani = istatistik.kazanilan * 100;
  const seriBonus = istatistik.enUzunSeri * 50;
  
  // Ortalama tahmin sayısına göre bonus
  let ortalamaBonus = 0;
  const toplamTahmin = istatistik.dagilim.reduce((t, val, idx) => t + val * (idx + 1), 0);
  if (istatistik.kazanilan > 0) {
    const ortalama = toplamTahmin / istatistik.kazanilan;
    if (ortalama <= 3) ortalamaBonus = 200;
    else if (ortalama <= 4) ortalamaBonus = 100;
    else if (ortalama <= 5) ortalamaBonus = 50;
  }
  
  return kazanmaPuani + seriBonus + ortalamaBonus;
}

/**
 * İstatistikleri getir
 */
export function istatistikGetir() {
  if (typeof window === 'undefined') return varsayilanIstatistik;
  
  try {
    const veri = localStorage.getItem(ISTATISTIK_KEY);
    if (veri) {
      return { ...varsayilanIstatistik, ...JSON.parse(veri) };
    }
  } catch (e) {
    console.error('İstatistik okuma hatası:', e);
  }
  
  return varsayilanIstatistik;
}

/**
 * İstatistikleri kaydet
 */
export function istatistikKaydet(istatistik) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(ISTATISTIK_KEY, JSON.stringify(istatistik));
    // Liderlik tablosunu da güncelle
    liderlikGuncelle();
  } catch (e) {
    console.error('İstatistik kaydetme hatası:', e);
  }
}

/**
 * Oyun kazanıldığında istatistikleri güncelle
 */
export function kazandiGuncelle(tahminSayisi) {
  const istatistik = istatistikGetir();
  
  istatistik.oynanan += 1;
  istatistik.kazanilan += 1;
  istatistik.seri += 1;
  istatistik.enUzunSeri = Math.max(istatistik.enUzunSeri, istatistik.seri);
  istatistik.dagilim[tahminSayisi - 1] += 1;
  
  // Puan ekle
  const puanEklenen = (7 - tahminSayisi) * 20 + 50; // Az tahminde daha çok puan
  istatistik.toplamPuan = (istatistik.toplamPuan || 0) + puanEklenen;
  
  istatistikKaydet(istatistik);
  return istatistik;
}

/**
 * Oyun kaybedildiğinde istatistikleri güncelle
 */
export function kaybettiGuncelle() {
  const istatistik = istatistikGetir();
  
  istatistik.oynanan += 1;
  istatistik.kaybedilen += 1;
  istatistik.seri = 0;
  
  istatistikKaydet(istatistik);
  return istatistik;
}

/**
 * Ayarları getir
 */
export function ayarGetir() {
  if (typeof window === 'undefined') return varsayilanAyar;
  
  try {
    const veri = localStorage.getItem(AYAR_KEY);
    if (veri) {
      return { ...varsayilanAyar, ...JSON.parse(veri) };
    }
  } catch (e) {
    console.error('Ayar okuma hatası:', e);
  }
  
  return varsayilanAyar;
}

/**
 * Ayarları kaydet
 */
export function ayarKaydet(ayar) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(AYAR_KEY, JSON.stringify(ayar));
  } catch (e) {
    console.error('Ayar kaydetme hatası:', e);
  }
}

/**
 * Temayı değiştir
 */
export function temaToggle() {
  if (typeof window === 'undefined') return 'dark';
  
  const mevcutTema = localStorage.getItem('tema') || 'dark';
  const yeniTema = mevcutTema === 'dark' ? 'light' : 'dark';
  
  localStorage.setItem('tema', yeniTema);
  
  if (yeniTema === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return yeniTema;
}

/**
 * Mevcut temayı getir
 */
export function temaGetir() {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem('tema') || 'dark';
}
