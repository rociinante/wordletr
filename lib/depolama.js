// localStorage işlemleri

const ISTATISTIK_KEY = 'wordletr_istatistik';
const OYUN_KEY = 'wordletr_oyun';
const AYAR_KEY = 'wordletr_ayar';

/**
 * Varsayılan istatistik objesi
 */
const varsayilanIstatistik = {
  oynanan: 0,
  kazanilan: 0,
  kaybedilen: 0,
  seri: 0,
  enUzunSeri: 0,
  dagilim: [0, 0, 0, 0, 0, 0], // 1-6 tahmin dağılımı
};

/**
 * Varsayılan ayarlar
 */
const varsayilanAyar = {
  tema: 'dark',
  uzunluk: 5,
};

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
 * Günlük oyun durumunu getir
 */
export function oyunGetir(tarih, uzunluk) {
  if (typeof window === 'undefined') return null;
  
  try {
    const veri = localStorage.getItem(OYUN_KEY);
    if (veri) {
      const oyun = JSON.parse(veri);
      if (oyun.tarih === tarih && oyun.uzunluk === uzunluk) {
        return oyun;
      }
    }
  } catch (e) {
    console.error('Oyun okuma hatası:', e);
  }
  
  return null;
}

/**
 * Oyun durumunu kaydet
 */
export function oyunKaydet(tarih, uzunluk, tahminler, sonuclar, durum) {
  if (typeof window === 'undefined') return;
  
  try {
    const oyun = {
      tarih,
      uzunluk,
      tahminler,
      sonuclar,
      durum,
      kaydedilme: Date.now(),
    };
    localStorage.setItem(OYUN_KEY, JSON.stringify(oyun));
  } catch (e) {
    console.error('Oyun kaydetme hatası:', e);
  }
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
