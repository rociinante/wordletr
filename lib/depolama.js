// localStorage + API işlemleri

// ⚠️ HOSTING'E GEÇİNCE BU URL'İ GÜNCELLE
const API_URL = 'https://iyikelime.com/api/liderlik.php';
// Geliştirme için: const API_URL = 'http://localhost/iyikelime/api/liderlik.php';

const ISTATISTIK_KEY = 'iyikelime_istatistik';
const OYUN_KEY = 'iyikelime_oyun';
const AYAR_KEY = 'iyikelime_ayar';
const KULLANICI_KEY = 'iyikelime_kullanici';
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
  kullanici.ad = yeniAd.trim().slice(0, 20) || rastgeleKullaniciAdi();
  kullaniciKaydet(kullanici);
  
  // API'ye de gönder (arka planda)
  liderlikGuncelle();
  
  return kullanici;
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
  } catch (e) {
    console.error('İstatistik kaydetme hatası:', e);
  }
}

/**
 * Puan hesapla
 */
function puanHesapla(ist) {
  const kazanmaPuani = ist.kazanilan * 100;
  const seriBonus = ist.seri * 50;
  const ortTahmin = ist.kazanilan > 0 
    ? ist.dagilim.reduce((t, d, i) => t + d * (i + 1), 0) / ist.kazanilan 
    : 6;
  const tahminBonus = Math.round((6 - ortTahmin) * 20) * ist.kazanilan;
  
  return Math.max(0, kazanmaPuani + seriBonus + tahminBonus);
}

/**
 * Kazandı güncelle
 */
export function kazandiGuncelle(tahminSayisi) {
  const ist = istatistikGetir();
  
  ist.oynanan += 1;
  ist.kazanilan += 1;
  ist.seri += 1;
  ist.enUzunSeri = Math.max(ist.enUzunSeri, ist.seri);
  ist.dagilim[tahminSayisi - 1] += 1;
  ist.toplamPuan = puanHesapla(ist);
  
  istatistikKaydet(ist);
  
  // API'ye gönder (arka planda)
  liderlikGuncelleAPI();
  
  return ist;
}

/**
 * Kaybetti güncelle
 */
export function kaybettiGuncelle() {
  const ist = istatistikGetir();
  
  ist.oynanan += 1;
  ist.kaybedilen += 1;
  ist.seri = 0;
  ist.toplamPuan = puanHesapla(ist);
  
  istatistikKaydet(ist);
  
  // API'ye gönder (arka planda)
  liderlikGuncelleAPI();
  
  return ist;
}

// ============ LİDERLİK TABLOSU (API) ============

/**
 * Liderlik tablosunu API'den getir
 */
export async function liderlikGetirAPI() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('API hatası');
    
    const data = await response.json();
    
    if (data.basarili) {
      // Yerel cache'e de kaydet
      localStorage.setItem(LIDERLIK_KEY, JSON.stringify(data.liderlik));
      return data.liderlik;
    }
  } catch (e) {
    console.warn('Liderlik API hatası, yerel veri kullanılıyor:', e);
  }
  
  // Offline veya hata durumunda yerel veriyi döndür
  return liderlikGetirYerel();
}

/**
 * Skoru API'ye gönder
 */
export async function liderlikGuncelleAPI() {
  const kullanici = kullaniciGetir();
  const ist = istatistikGetir();
  
  if (!kullanici.id) return;
  
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: kullanici.id,
        ad: kullanici.ad,
        puan: ist.toplamPuan,
        oynanan: ist.oynanan,
        kazanilan: ist.kazanilan,
        seri: ist.seri,
        enUzunSeri: ist.enUzunSeri
      })
    });
  } catch (e) {
    console.warn('Liderlik güncelleme hatası:', e);
    // Yerel olarak da kaydet (offline destek)
    liderlikGuncelleYerel();
  }
}

/**
 * Yerel liderlik tablosunu getir (offline fallback)
 */
function liderlikGetirYerel() {
  if (typeof window === 'undefined') return [];
  
  try {
    const veri = localStorage.getItem(LIDERLIK_KEY);
    if (veri) {
      return JSON.parse(veri);
    }
  } catch (e) {
    console.error('Yerel liderlik okuma hatası:', e);
  }
  
  return [];
}

/**
 * Yerel liderlik tablosunu güncelle
 */
function liderlikGuncelleYerel() {
  if (typeof window === 'undefined') return [];
  
  const kullanici = kullaniciGetir();
  const ist = istatistikGetir();
  
  if (!kullanici.id) return [];
  
  let liderlik = liderlikGetirYerel();
  
  const mevcutIndex = liderlik.findIndex(l => l.id === kullanici.id);
  const yeniKayit = {
    id: kullanici.id,
    ad: kullanici.ad,
    puan: ist.toplamPuan,
    oynanan: ist.oynanan,
    kazanilan: ist.kazanilan,
    seri: ist.seri,
    enUzunSeri: ist.enUzunSeri,
    sonGuncelleme: Date.now()
  };
  
  if (mevcutIndex >= 0) {
    liderlik[mevcutIndex] = yeniKayit;
  } else {
    liderlik.push(yeniKayit);
  }
  
  // Puana göre sırala
  liderlik.sort((a, b) => (b.puan || 0) - (a.puan || 0));
  
  // İlk 100'ü tut
  liderlik = liderlik.slice(0, 100);
  
  try {
    localStorage.setItem(LIDERLIK_KEY, JSON.stringify(liderlik));
  } catch (e) {
    console.error('Yerel liderlik kaydetme hatası:', e);
  }
  
  return liderlik;
}

// Eski senkron fonksiyonlar (uyumluluk için)
export function liderlikGetir() {
  // Önce yerel veriyi döndür, arka planda API'den güncelle
  const yerel = liderlikGetirYerel();
  
  // API'den güncelle (arka planda)
  liderlikGetirAPI().catch(() => {});
  
  return yerel;
}

export function liderlikGuncelle() {
  // Yerel güncelle + API'ye gönder
  const yerel = liderlikGuncelleYerel();
  liderlikGuncelleAPI().catch(() => {});
  return yerel;
}

// ============ TEMA ============

/**
 * Temayı değiştir
 */
export function temaToggle() {
  if (typeof window === 'undefined') return 'dark';
  
  const mevcutTema = localStorage.getItem('tema') || 'dark';
  const yeniTema = mevcutTema === 'dark' ? 'light' : 'dark';
  
  localStorage.setItem('tema', yeniTema);
  
  if (yeniTema === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
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

// ============ TEMA RENKLERİ ============

export const TEMA_RENKLERI = {
  varsayilan: { isim: 'Mor', emoji: '💜', class: '' },
  okyanus: { isim: 'Okyanus', emoji: '🌊', class: 'tema-okyanus' },
  orman: { isim: 'Orman', emoji: '🌲', class: 'tema-orman' },
  gunbatimi: { isim: 'Gün Batımı', emoji: '🌅', class: 'tema-gunbatimi' },
  gul: { isim: 'Gül', emoji: '🌹', class: 'tema-gul' },
  altin: { isim: 'Altın', emoji: '✨', class: 'tema-altin' }
};

/**
 * Tema rengini getir
 */
export function temaRengiGetir() {
  if (typeof window === 'undefined') return 'varsayilan';
  return localStorage.getItem('tema_rengi') || 'varsayilan';
}

/**
 * Tema rengini değiştir
 */
export function temaRengiDegistir(yeniRenk) {
  if (typeof window === 'undefined') return;
  
  // Eski rengi kaldır
  Object.values(TEMA_RENKLERI).forEach(tema => {
    if (tema.class) {
      document.documentElement.classList.remove(tema.class);
    }
  });
  
  // Yeni rengi ekle
  const yeniTema = TEMA_RENKLERI[yeniRenk];
  if (yeniTema && yeniTema.class) {
    document.documentElement.classList.add(yeniTema.class);
  }
  
  localStorage.setItem('tema_rengi', yeniRenk);
  return yeniRenk;
}

/**
 * Tema rengini başlat (sayfa yüklendiğinde)
 */
export function temaRengiBaslat() {
  if (typeof window === 'undefined') return;
  
  const renk = temaRengiGetir();
  const tema = TEMA_RENKLERI[renk];
  
  if (tema && tema.class) {
    document.documentElement.classList.add(tema.class);
  }
}
