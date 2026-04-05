// Achievements (Rozet) Sistemi

const ROZETLER_KEY = 'wordletr_rozetler';

// Tüm rozetler
export const ROZETLER = {
  // Başlangıç
  ilk_oyun: {
    id: 'ilk_oyun',
    isim: 'İlk Adım',
    emoji: '🎮',
    aciklama: 'İlk oyununu tamamla',
    gizli: false
  },
  ilk_kazanc: {
    id: 'ilk_kazanc',
    isim: 'İlk Zafer',
    emoji: '🏆',
    aciklama: 'İlk kelimeyi bil',
    gizli: false
  },
  
  // Seri rozetleri
  seri_3: {
    id: 'seri_3',
    isim: 'Isınıyoruz',
    emoji: '🔥',
    aciklama: '3 oyun üst üste kazan',
    gizli: false
  },
  seri_5: {
    id: 'seri_5',
    isim: 'Ateş Topu',
    emoji: '☄️',
    aciklama: '5 oyun üst üste kazan',
    gizli: false
  },
  seri_10: {
    id: 'seri_10',
    isim: 'Durdurulamaz',
    emoji: '💥',
    aciklama: '10 oyun üst üste kazan',
    gizli: false
  },
  seri_25: {
    id: 'seri_25',
    isim: 'Efsane',
    emoji: '👑',
    aciklama: '25 oyun üst üste kazan',
    gizli: true
  },
  
  // Tahmin rozetleri
  tek_tahmin: {
    id: 'tek_tahmin',
    isim: 'Dahi',
    emoji: '🧠',
    aciklama: 'İlk tahminde bil',
    gizli: false
  },
  iki_tahmin: {
    id: 'iki_tahmin',
    isim: 'Keskin Zeka',
    emoji: '⚡',
    aciklama: '2 tahminde bil',
    gizli: false
  },
  son_tahmin: {
    id: 'son_tahmin',
    isim: 'Kıl Payı',
    emoji: '😅',
    aciklama: '6. tahminde bil',
    gizli: false
  },
  
  // Oyun sayısı
  oyun_10: {
    id: 'oyun_10',
    isim: 'Düzenli Oyuncu',
    emoji: '📅',
    aciklama: '10 oyun tamamla',
    gizli: false
  },
  oyun_50: {
    id: 'oyun_50',
    isim: 'Sadık Oyuncu',
    emoji: '💎',
    aciklama: '50 oyun tamamla',
    gizli: false
  },
  oyun_100: {
    id: 'oyun_100',
    isim: 'Veteran',
    emoji: '🎖️',
    aciklama: '100 oyun tamamla',
    gizli: false
  },
  oyun_500: {
    id: 'oyun_500',
    isim: 'Wordletr Ustası',
    emoji: '🏅',
    aciklama: '500 oyun tamamla',
    gizli: true
  },
  
  // Mod rozetleri
  zor_mod_kazanc: {
    id: 'zor_mod_kazanc',
    isim: 'Zorlu Yol',
    emoji: '🔥',
    aciklama: 'Zor modda kazan',
    gizli: false
  },
  merdiven_tamamla: {
    id: 'merdiven_tamamla',
    isim: 'Zirve',
    emoji: '🪜',
    aciklama: 'Merdiven modunu tamamla (7 harfe ulaş)',
    gizli: false
  },
  kor_mod_kazanc: {
    id: 'kor_mod_kazanc',
    isim: 'Altıncı His',
    emoji: '🙈',
    aciklama: 'Kör modda kazan',
    gizli: false
  },
  timeattack_5: {
    id: 'timeattack_5',
    isim: 'Hız Canavarı',
    emoji: '⚡',
    aciklama: 'Time Attack\'ta 5+ kelime bil',
    gizli: false
  },
  survival_uzun: {
    id: 'survival_uzun',
    isim: 'Hayatta Kalan',
    emoji: '💀',
    aciklama: 'Survival modunda 2+ dakika dayan',
    gizli: false
  },
  
  // Kategori rozetleri
  tum_kategoriler: {
    id: 'tum_kategoriler',
    isim: 'Çok Yönlü',
    emoji: '🌈',
    aciklama: 'Her kategoride en az 1 oyun kazan',
    gizli: false
  },
  ingilizce_usta: {
    id: 'ingilizce_usta',
    isim: 'Polyglot',
    emoji: '🇬🇧',
    aciklama: 'İngilizce kategorisinde 10 oyun kazan',
    gizli: false
  },
  
  // Özel rozetler
  gece_kusu: {
    id: 'gece_kusu',
    isim: 'Gece Kuşu',
    emoji: '🦉',
    aciklama: 'Gece 00:00-05:00 arası oyna',
    gizli: true
  },
  sabahci: {
    id: 'sabahci',
    isim: 'Erken Kalkan',
    emoji: '🌅',
    aciklama: 'Sabah 05:00-07:00 arası oyna',
    gizli: true
  },
  meydan_okuma: {
    id: 'meydan_okuma',
    isim: 'Meydan Okuyan',
    emoji: '🎯',
    aciklama: 'Bir meydan okuma linkini tamamla',
    gizli: false
  },
  
  // Uzunluk rozetleri
  yedi_harf: {
    id: 'yedi_harf',
    isim: 'Kelime Canavarı',
    emoji: '📚',
    aciklama: '7 harfli kelimeyi bil',
    gizli: false
  },
  dort_harf_hizli: {
    id: 'dort_harf_hizli',
    isim: 'Hızlı Başlangıç',
    emoji: '🚀',
    aciklama: '4 harfli kelimeyi 2 tahminde bil',
    gizli: false
  }
};

/**
 * Kazanılan rozetleri getir
 */
export function rozetleriGetir() {
  if (typeof window === 'undefined') return {};
  
  try {
    const veri = localStorage.getItem(ROZETLER_KEY);
    if (veri) {
      return JSON.parse(veri);
    }
  } catch (e) {
    console.error('Rozet okuma hatası:', e);
  }
  
  return {};
}

/**
 * Rozet kazanıldı mı kontrol et
 */
export function rozetKazanildiMi(rozetId) {
  const rozetler = rozetleriGetir();
  return !!rozetler[rozetId];
}

/**
 * Rozet kazan
 * @returns {object|null} Yeni kazanılan rozet veya null
 */
export function rozetKazan(rozetId) {
  if (rozetKazanildiMi(rozetId)) return null;
  
  const rozet = ROZETLER[rozetId];
  if (!rozet) return null;
  
  const rozetler = rozetleriGetir();
  rozetler[rozetId] = {
    kazanilmaTarihi: Date.now(),
    ...rozet
  };
  
  try {
    localStorage.setItem(ROZETLER_KEY, JSON.stringify(rozetler));
  } catch (e) {
    console.error('Rozet kaydetme hatası:', e);
    return null;
  }
  
  return rozet;
}

/**
 * Oyun sonrası rozet kontrolü
 * @returns {array} Yeni kazanılan rozetler
 */
export function rozetKontrol(durum) {
  const {
    kazandi,
    tahminSayisi,
    seri,
    enUzunSeri,
    oynanan,
    mod,
    kategori,
    uzunluk,
    meydanOkuma,
    timeAttackSkor,
    survivalSure,
    kazanilanKategoriler
  } = durum;
  
  const yeniRozetler = [];
  
  // İlk oyun
  if (oynanan === 1) {
    const r = rozetKazan('ilk_oyun');
    if (r) yeniRozetler.push(r);
  }
  
  // İlk kazanç
  if (kazandi && oynanan === 1) {
    const r = rozetKazan('ilk_kazanc');
    if (r) yeniRozetler.push(r);
  }
  
  // Seri rozetleri
  if (seri >= 3) {
    const r = rozetKazan('seri_3');
    if (r) yeniRozetler.push(r);
  }
  if (seri >= 5) {
    const r = rozetKazan('seri_5');
    if (r) yeniRozetler.push(r);
  }
  if (seri >= 10) {
    const r = rozetKazan('seri_10');
    if (r) yeniRozetler.push(r);
  }
  if (enUzunSeri >= 25) {
    const r = rozetKazan('seri_25');
    if (r) yeniRozetler.push(r);
  }
  
  // Tahmin rozetleri
  if (kazandi && tahminSayisi === 1) {
    const r = rozetKazan('tek_tahmin');
    if (r) yeniRozetler.push(r);
  }
  if (kazandi && tahminSayisi === 2) {
    const r = rozetKazan('iki_tahmin');
    if (r) yeniRozetler.push(r);
  }
  if (kazandi && tahminSayisi === 6) {
    const r = rozetKazan('son_tahmin');
    if (r) yeniRozetler.push(r);
  }
  
  // Oyun sayısı rozetleri
  if (oynanan >= 10) {
    const r = rozetKazan('oyun_10');
    if (r) yeniRozetler.push(r);
  }
  if (oynanan >= 50) {
    const r = rozetKazan('oyun_50');
    if (r) yeniRozetler.push(r);
  }
  if (oynanan >= 100) {
    const r = rozetKazan('oyun_100');
    if (r) yeniRozetler.push(r);
  }
  if (oynanan >= 500) {
    const r = rozetKazan('oyun_500');
    if (r) yeniRozetler.push(r);
  }
  
  // Mod rozetleri
  if (kazandi && mod === 'zor') {
    const r = rozetKazan('zor_mod_kazanc');
    if (r) yeniRozetler.push(r);
  }
  if (kazandi && mod === 'kor') {
    const r = rozetKazan('kor_mod_kazanc');
    if (r) yeniRozetler.push(r);
  }
  if (mod === 'merdiven' && uzunluk === 7 && kazandi) {
    const r = rozetKazan('merdiven_tamamla');
    if (r) yeniRozetler.push(r);
  }
  if (mod === 'timeattack' && timeAttackSkor >= 5) {
    const r = rozetKazan('timeattack_5');
    if (r) yeniRozetler.push(r);
  }
  if (mod === 'survival' && survivalSure >= 120) {
    const r = rozetKazan('survival_uzun');
    if (r) yeniRozetler.push(r);
  }
  
  // Meydan okuma rozeti
  if (kazandi && meydanOkuma) {
    const r = rozetKazan('meydan_okuma');
    if (r) yeniRozetler.push(r);
  }
  
  // 7 harf rozeti
  if (kazandi && uzunluk === 7) {
    const r = rozetKazan('yedi_harf');
    if (r) yeniRozetler.push(r);
  }
  
  // 4 harf hızlı rozeti
  if (kazandi && uzunluk === 4 && tahminSayisi <= 2) {
    const r = rozetKazan('dort_harf_hizli');
    if (r) yeniRozetler.push(r);
  }
  
  // İngilizce usta rozeti (kazanilanKategoriler kontrolü gerekir)
  
  // Saat bazlı rozetler
  const saat = new Date().getHours();
  if (saat >= 0 && saat < 5) {
    const r = rozetKazan('gece_kusu');
    if (r) yeniRozetler.push(r);
  }
  if (saat >= 5 && saat < 7) {
    const r = rozetKazan('sabahci');
    if (r) yeniRozetler.push(r);
  }
  
  return yeniRozetler;
}

/**
 * Toplam rozet sayısı
 */
export function toplamRozetSayisi() {
  return Object.keys(ROZETLER).length;
}

/**
 * Kazanılan rozet sayısı
 */
export function kazanilanRozetSayisi() {
  return Object.keys(rozetleriGetir()).length;
}

/**
 * Tüm rozetleri listele (kazanılmış ve kazanılmamış)
 */
export function tumRozetler() {
  const kazanilanlar = rozetleriGetir();
  
  return Object.values(ROZETLER).map(rozet => ({
    ...rozet,
    kazanildi: !!kazanilanlar[rozet.id],
    kazanilmaTarihi: kazanilanlar[rozet.id]?.kazanilmaTarihi || null
  }));
}
