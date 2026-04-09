'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../components/Header';
import Tahta from '../components/Tahta';
import Klavye from '../components/Klavye';
import Modal, { 
  SonucIcerigi, 
  NasilOynanirIcerigi, 
  LiderlikIcerigi, 
  KategoriSeciciIcerigi, 
  ModSeciciIcerigi, 
  MeydanOkumaIcerigi,
  RozetlerIcerigi,
  AyarlarIcerigi,
  GunlukIcerigi
} from '../components/Modal';
import { kontrolEt, klavyeGuncelle, paylasimMetni, korModSonuc } from '../lib/oyunMotoru';
import { 
  rastgeleKelimeUzunluklu, 
  kategorileriGetir, 
  oyunSayisiGetir, 
  oyunSayisiArtir, 
  ipucuHakkiHesapla, 
  ipucuOlustur, 
  mevcutUzunluklar, 
  kelimeSifrele, 
  kelimeCoz,
  gunlukKelimeGetir,
  gunlukOynandiMi,
  gunlukOynandi,
  gunlukIstatistikGuncelle
} from '../lib/kelimeSecici';
import { 
  istatistikGetir, 
  kazandiGuncelle, 
  kaybettiGuncelle,
  kullaniciGetir,
  kullaniciAdiGuncelle,
  liderlikGetir,
  liderlikGuncelle,
  liderlikGetirAPI,
  temaRengiBaslat
} from '../lib/depolama';
import { rozetKontrol, tumRozetler, kazanilanRozetSayisi, toplamRozetSayisi } from '../lib/rozetler';
import { 
  tusSesi, 
  silSesi, 
  enterSesi, 
  hataSesi, 
  kazanmaSesi, 
  kaybetmeSesi, 
  seviyeSesi, 
  rozetSesi,
  ipucuSesi,
  countdownSesi,
  sesAyariGetir
} from '../lib/ses';

// Modlar
const MODLAR = {
  sinirsiz: { isim: 'Sınırsız', emoji: '♾️', aciklama: 'İstediğin kadar oyna' },
  gunluk: { isim: 'Günlük', emoji: '📅', aciklama: 'Her gün yeni kelime, tek hak' },
  merdiven: { isim: 'Merdiven', emoji: '🪜', aciklama: '4→5→6→7 harf, yanılırsan başa dön' },
  survival: { isim: 'Hayatta Kal', emoji: '💀', aciklama: '60 saniye, doğru harfte +süre' },
  kor: { isim: 'Kör Mod', emoji: '🙈', aciklama: 'Renkler yok, sadece sayılar' }
};

export default function Home() {
  // Oyun durumu
  const [kategori, setKategori] = useState('klasik');
  const [uzunluk, setUzunluk] = useState(5);
  const [mod, setMod] = useState('sinirsiz');
  const [hedefKelime, setHedefKelime] = useState('');
  const [tahminler, setTahminler] = useState([]);
  const [sonuclar, setSonuclar] = useState([]);
  const [mevcutTahmin, setMevcutTahmin] = useState('');
  const [harfDurumlari, setHarfDurumlari] = useState({});
  const [oyunBitti, setOyunBitti] = useState(false);
  const [kazandi, setKazandi] = useState(false);
  const [sallanim, setSallanim] = useState(false);
  const [hataMetni, setHataMetni] = useState('');
  const [oyunSayisi, setOyunSayisi] = useState(1);

  // Rozet bildirimi
  const [yeniRozetler, setYeniRozetler] = useState([]);
  const [rozetBildirimi, setRozetBildirimi] = useState(null);

  // Meydan okuma
  const [meydanOkumaModu, setMeydanOkumaModu] = useState(false);

  // Time Attack & Survival
  const [kalanSure, setKalanSure] = useState(0);
  const [timeAttackSkor, setTimeAttackSkor] = useState(0);
  const [survivalAktif, setSurvivalAktif] = useState(false);
  const [survivalBaslangic, setSurvivalBaslangic] = useState(0);
  const timerRef = useRef(null);
  const mobilInputRef = useRef(null);

  // Merdiven modu
  const [merdivenSeviye, setMerdivenSeviye] = useState(4);

  // Kör mod
  const [korModSonuclar, setKorModSonuclar] = useState([]);

  // İpucu durumu
  const [ipucuHakki, setIpucuHakki] = useState(2);
  const [kullanilanIpucu, setKullanilanIpucu] = useState([]);
  
  // Kullanıcı ve liderlik
  const [kullanici, setKullanici] = useState({ ad: 'Misafir', id: null });
  const [liderlik, setLiderlik] = useState([]);

  // Modal durumları
  const [bilgiModalAcik, setBilgiModalAcik] = useState(false);
  const [sonucModalAcik, setSonucModalAcik] = useState(false);
  const [liderlikModalAcik, setLiderlikModalAcik] = useState(false);
  const [kategoriModalAcik, setKategoriModalAcik] = useState(false);
  const [modModalAcik, setModModalAcik] = useState(false);
  const [meydanOkumaModalAcik, setMeydanOkumaModalAcik] = useState(false);
  const [rozetlerModalAcik, setRozetlerModalAcik] = useState(false);
  const [ayarlarModalAcik, setAyarlarModalAcik] = useState(false);
  const [gunlukModalAcik, setGunlukModalAcik] = useState(false);
  const [istatistik, setIstatistik] = useState(null);
  const [kategoriler, setKategoriler] = useState({});
  const [uzunluklar, setUzunluklar] = useState([5]);

  // İlk yükleme kontrolü
  const [yuklendi, setYuklendi] = useState(false);

  // useRef ile fonksiyonları saklıyoruz (klavye için)
  const harfEkleRef = useRef(null);
  const harfSilRef = useRef(null);
  const tahminGonderRef = useRef(null);

  // Timer'ı temizle
  const timerTemizle = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Rozet bildirimi göster
  const rozetBildirimGoster = useCallback((rozetler) => {
    if (rozetler.length > 0) {
      rozetSesi();
      setRozetBildirimi(rozetler[0]);
      setTimeout(() => {
        setRozetBildirimi(null);
        if (rozetler.length > 1) {
          rozetBildirimGoster(rozetler.slice(1));
        }
      }, 3000);
    }
  }, []);

  // Yeni oyun başlat
  const yeniOyunBaslat = useCallback((yeniKategori = kategori, yeniUzunluk = uzunluk, yeniMod = mod) => {
    timerTemizle();
    
    let kelime;
    let hedefUzunluk = yeniUzunluk;
    
    // Günlük mod kontrolü
    if (yeniMod === 'gunluk') {
      if (gunlukOynandiMi()) {
        setGunlukModalAcik(true);
        return;
      }
      kelime = gunlukKelimeGetir(5);
      hedefUzunluk = 5;
    } else if (yeniMod === 'merdiven') {
      hedefUzunluk = 4;
      setMerdivenSeviye(4);
      kelime = rastgeleKelimeUzunluklu(yeniKategori, hedefUzunluk, hedefKelime);
    } else {
      kelime = rastgeleKelimeUzunluklu(yeniKategori, hedefUzunluk, hedefKelime);
    }
    
    setHedefKelime(kelime);
    setTahminler([]);
    setSonuclar([]);
    setKorModSonuclar([]);
    setMevcutTahmin('');
    setHarfDurumlari({});
    setOyunBitti(false);
    setKazandi(false);
    setSonucModalAcik(false);
    setOyunSayisi(oyunSayisiGetir());
    setKullanilanIpucu([]);
    setHataMetni('');
    setMeydanOkumaModu(false);
    setTimeAttackSkor(0);
    setSurvivalAktif(false);
    setYeniRozetler([]);
    
    // İpucu hakkını hesapla
    const ist = istatistikGetir();
    setIpucuHakki(ipucuHakkiHesapla(ist));

    // Time Attack: 5 dakika
    if (yeniMod === 'timeattack') {
      setKalanSure(300);
      timerRef.current = setInterval(() => {
        setKalanSure(prev => {
          if (prev <= 1) {
            timerTemizle();
            setOyunBitti(true);
            // Time Attack rozetleri
            const rozetler = rozetKontrol({
              kazandi: false,
              mod: 'timeattack',
              timeAttackSkor,
              oynanan: istatistikGetir().oynanan
            });
            if (rozetler.length > 0) {
              setYeniRozetler(rozetler);
              rozetBildirimGoster(rozetler);
            }
            setTimeout(() => setSonucModalAcik(true), 500);
            return 0;
          }
          if (prev <= 10) countdownSesi();
          return prev - 1;
        });
      }, 1000);
    }
    
    // Survival: 60 saniye
    if (yeniMod === 'survival') {
      setKalanSure(60);
      setSurvivalAktif(true);
      setSurvivalBaslangic(Date.now());
      timerRef.current = setInterval(() => {
        setKalanSure(prev => {
          if (prev <= 1) {
            timerTemizle();
            setSurvivalAktif(false);
            setOyunBitti(true);
            setKazandi(false);
            const survivalSure = Math.floor((Date.now() - survivalBaslangic) / 1000);
            const rozetler = rozetKontrol({
              kazandi: false,
              mod: 'survival',
              survivalSure,
              oynanan: istatistikGetir().oynanan
            });
            if (rozetler.length > 0) {
              setYeniRozetler(rozetler);
              rozetBildirimGoster(rozetler);
            }
            setTimeout(() => setSonucModalAcik(true), 500);
            return 0;
          }
          if (prev <= 10) countdownSesi();
          return prev - 1;
        });
      }, 1000);
    }
  }, [kategori, uzunluk, mod, hedefKelime, timerTemizle, rozetBildirimGoster, timeAttackSkor, survivalBaslangic]);

  // URL'den meydan okuma kelimesini kontrol et
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sifreliKelime = params.get('m');
      
      if (sifreliKelime) {
        const cozulmusKelime = kelimeCoz(sifreliKelime);
        if (cozulmusKelime) {
          setMeydanOkumaModu(true);
          setHedefKelime(cozulmusKelime);
          setUzunluk(cozulmusKelime.length);
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, []);

  // İlk yükleme
  useEffect(() => {
    const kat = kategorileriGetir();
    setKategoriler(kat);
    setKullanici(kullaniciGetir());
    setLiderlik(liderlikGetir());
    setUzunluklar(mevcutUzunluklar('klasik'));
    temaRengiBaslat();
    
    if (!meydanOkumaModu) {
      const kelime = rastgeleKelimeUzunluklu('klasik', 5, '');
      setHedefKelime(kelime);
    }
    
    const ist = istatistikGetir();
    setIpucuHakki(ipucuHakkiHesapla(ist));
    setOyunSayisi(oyunSayisiGetir());
    
    setYuklendi(true);
    
    return () => timerTemizle();
  }, [timerTemizle, meydanOkumaModu]);

  // İlk defa oynuyorsa bilgi modalını göster
  useEffect(() => {
    if (yuklendi) {
      const ilkOyun = localStorage.getItem('wordletr_ilk_oyun');
      if (!ilkOyun) {
        setBilgiModalAcik(true);
        localStorage.setItem('wordletr_ilk_oyun', 'true');
      }
    }
  }, [yuklendi]);

  // Harf ekle fonksiyonu
  harfEkleRef.current = (harf) => {
    if (oyunBitti) return;
    if (!hedefKelime) return;
    if (mevcutTahmin.length >= hedefKelime.length) return;
    setMevcutTahmin(prev => prev + harf);
    setHataMetni('');
    if (sesAyariGetir()) tusSesi();
  };

  // Harf sil fonksiyonu
  harfSilRef.current = () => {
    if (oyunBitti) return;
    if (mevcutTahmin.length === 0) return;
    setMevcutTahmin(prev => prev.slice(0, -1));
    setHataMetni('');
    if (sesAyariGetir()) silSesi();
  };

  // Tahmin gönder fonksiyonu
  tahminGonderRef.current = () => {
    if (oyunBitti) return;
    if (!hedefKelime) return;
    
    if (mevcutTahmin.length !== hedefKelime.length) {
      setSallanim(true);
      setHataMetni(`${hedefKelime.length} harf girmelisin!`);
      if (sesAyariGetir()) hataSesi();
      setTimeout(() => setSallanim(false), 500);
      return;
    }

    if (sesAyariGetir()) enterSesi();

    const sonuc = kontrolEt(mevcutTahmin, hedefKelime);
    const yeniTahminler = [...tahminler, mevcutTahmin];
    const yeniSonuclar = [...sonuclar, sonuc];
    
    setTahminler(yeniTahminler);
    setSonuclar(yeniSonuclar);
    setMevcutTahmin('');
    
    // Kör mod için özel sonuç
    if (mod === 'kor') {
      const korSonuc = korModSonuc(sonuc);
      setKorModSonuclar(prev => [...prev, korSonuc]);
    }
    
    setHarfDurumlari(prev => klavyeGuncelle(prev, mevcutTahmin, sonuc));

    // Survival modunda doğru harf için süre ekle
    if (mod === 'survival' && survivalAktif) {
      const dogruHarfSayisi = sonuc.filter(s => s === 'dogru').length;
      const mevcutHarfSayisi = sonuc.filter(s => s === 'mevcut').length;
      const ekSure = dogruHarfSayisi * 10 + mevcutHarfSayisi * 5;
      if (ekSure > 0) {
        setKalanSure(prev => Math.min(prev + ekSure, 120));
      }
    }

    const dogruMu = mevcutTahmin.toUpperCase() === hedefKelime.toUpperCase();
    
    if (dogruMu) {
      // Kazanma sesi
      if (sesAyariGetir()) kazanmaSesi();
      
      // Time Attack: devam et
      if (mod === 'timeattack') {
        setTimeAttackSkor(prev => prev + 1);
        const yeniKelime = rastgeleKelimeUzunluklu(kategori, uzunluk, hedefKelime);
        setHedefKelime(yeniKelime);
        setTahminler([]);
        setSonuclar([]);
        setKorModSonuclar([]);
        setHarfDurumlari({});
        return;
      }
      
      // Merdiven: sonraki seviye
      if (mod === 'merdiven') {
        if (merdivenSeviye < 7) {
          if (sesAyariGetir()) seviyeSesi();
          const yeniSeviye = merdivenSeviye + 1;
          setMerdivenSeviye(yeniSeviye);
          const yeniKelime = rastgeleKelimeUzunluklu(kategori, yeniSeviye, hedefKelime);
          setHedefKelime(yeniKelime);
          setTahminler([]);
          setSonuclar([]);
          setKorModSonuclar([]);
          setHarfDurumlari({});
          return;
        }
      }

      // Günlük mod
      if (mod === 'gunluk') {
        gunlukOynandi({ kazandi: true, tahminSayisi: yeniTahminler.length, kelime: hedefKelime });
        gunlukIstatistikGuncelle(true);
      }

      const yeniIstatistik = kazandiGuncelle(yeniTahminler.length);
      setIstatistik(yeniIstatistik);
      setOyunBitti(true);
      setKazandi(true);
      timerTemizle();
      oyunSayisiArtir();
      setLiderlik(liderlikGuncelle());
      
      // Rozet kontrolü
      const rozetler = rozetKontrol({
        kazandi: true,
        tahminSayisi: yeniTahminler.length,
        seri: yeniIstatistik.seri,
        enUzunSeri: yeniIstatistik.enUzunSeri,
        oynanan: yeniIstatistik.oynanan,
        mod,
        kategori,
        uzunluk: hedefKelime.length,
        meydanOkuma: meydanOkumaModu,
        timeAttackSkor,
        survivalSure: mod === 'survival' ? Math.floor((Date.now() - survivalBaslangic) / 1000) : 0
      });
      
      if (rozetler.length > 0) {
        setYeniRozetler(rozetler);
        setTimeout(() => rozetBildirimGoster(rozetler), 1600);
      }
      
      setTimeout(() => setSonucModalAcik(true), 1500);
    } else if (yeniTahminler.length >= 6) {
      // Kaybetme sesi
      if (sesAyariGetir()) kaybetmeSesi();
      
      // Merdiven: başa dön
      if (mod === 'merdiven') {
        setMerdivenSeviye(4);
        const yeniKelime = rastgeleKelimeUzunluklu(kategori, 4, hedefKelime);
        setHedefKelime(yeniKelime);
        setTahminler([]);
        setSonuclar([]);
        setKorModSonuclar([]);
        setHarfDurumlari({});
        setHataMetni('Yanıldın! 4 harfe geri dönüyorsun...');
        setTimeout(() => setHataMetni(''), 2000);
        return;
      }

      // Günlük mod
      if (mod === 'gunluk') {
        gunlukOynandi({ kazandi: false, tahminSayisi: 6, kelime: hedefKelime });
        gunlukIstatistikGuncelle(false);
      }

      const yeniIstatistik = kaybettiGuncelle();
      setIstatistik(yeniIstatistik);
      setOyunBitti(true);
      setKazandi(false);
      timerTemizle();
      oyunSayisiArtir();
      setLiderlik(liderlikGuncelle());
      
      // Rozet kontrolü (kaybetme için de bazı rozetler)
      const rozetler = rozetKontrol({
        kazandi: false,
        tahminSayisi: 6,
        seri: 0,
        enUzunSeri: yeniIstatistik.enUzunSeri,
        oynanan: yeniIstatistik.oynanan,
        mod,
        kategori,
        uzunluk: hedefKelime.length
      });
      
      if (rozetler.length > 0) {
        setYeniRozetler(rozetler);
        setTimeout(() => rozetBildirimGoster(rozetler), 1600);
      }
      
      setTimeout(() => setSonucModalAcik(true), 1500);
    }
  };

  // Klavye girişlerini dinle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (oyunBitti) return;
      
      if (bilgiModalAcik || sonucModalAcik || liderlikModalAcik || kategoriModalAcik || 
          modModalAcik || meydanOkumaModalAcik || rozetlerModalAcik || ayarlarModalAcik || gunlukModalAcik) {
        return;
      }
      
      const key = e.key;
      
      if (key === 'Enter') {
        e.preventDefault();
        if (tahminGonderRef.current) tahminGonderRef.current();
      } else if (key === 'Backspace') {
        e.preventDefault();
        if (harfSilRef.current) harfSilRef.current();
      } else if (/^[a-zA-ZçÇğĞıİöÖşŞüÜ]$/.test(key)) {
        let harf = key.toUpperCase();
        // Türkçe i/İ dönüşümü
        if (key === 'i') harf = 'İ';  // küçük i -> büyük İ
        if (key === 'ı') harf = 'I';  // küçük ı -> büyük I
        if (harfEkleRef.current) harfEkleRef.current(harf);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [oyunBitti, bilgiModalAcik, sonucModalAcik, liderlikModalAcik, kategoriModalAcik, 
      modModalAcik, meydanOkumaModalAcik, rozetlerModalAcik, ayarlarModalAcik, gunlukModalAcik]);

  // İpucu kullan
  const ipucuKullan = () => {
    if (ipucuHakki <= 0 || oyunBitti) return;
    
    const ipucu = ipucuOlustur(hedefKelime, tahminler, 'harf');
    if (ipucu) {
      setKullanilanIpucu(prev => [...prev, ipucu]);
      setIpucuHakki(prev => prev - 1);
      if (sesAyariGetir()) ipucuSesi();
    }
  };

  // Sanal klavye girişi
  const handleKlavye = (tus) => {
    if (tus === 'ENTER') {
      if (tahminGonderRef.current) tahminGonderRef.current();
    } else if (tus === 'BACKSPACE') {
      if (harfSilRef.current) harfSilRef.current();
    } else {
      if (harfEkleRef.current) harfEkleRef.current(tus);
    }
  };

  // Tahtaya tıklama - mobil klavye aç
  const handleTahtaTikla = () => {
    if (oyunBitti) return;
    if (mobilInputRef.current) {
      mobilInputRef.current.focus();
    }
  };

  // Mobil input değişikliği
  const handleMobilInput = (e) => {
    if (oyunBitti) return;
    if (!hedefKelime) return;
    
    const value = e.target.value || '';
    
    // Geçerli harfleri topla
    let yeniHarfler = '';
    for (const karakter of value) {
      if (/^[a-zA-ZçÇğĞıİöÖşŞüÜ]$/.test(karakter)) {
        let harf = karakter.toUpperCase();
        // Türkçe i/İ dönüşümü
        if (karakter === 'i') harf = 'İ';
        if (karakter === 'ı') harf = 'I';
        yeniHarfler += harf;
      }
    }
    
    // Tüm harfleri tek seferde ekle
    if (yeniHarfler) {
      setMevcutTahmin(prev => {
        const yeni = prev + yeniHarfler;
        // Maksimum uzunluğu aşmasın
        return yeni.slice(0, hedefKelime.length);
      });
      setHataMetni('');
    }
    
    // Input'u temizle
    e.target.value = '';
  };

  // Kategori değişimi
  const handleKategoriDegis = (yeniKategori) => {
    setKategori(yeniKategori);
    setKategoriModalAcik(false);
    setUzunluklar(mevcutUzunluklar(yeniKategori));
    yeniOyunBaslat(yeniKategori, uzunluk, mod);
  };

  // Uzunluk değişimi
  const handleUzunlukDegis = (yeniUzunluk) => {
    setUzunluk(yeniUzunluk);
    yeniOyunBaslat(kategori, yeniUzunluk, mod);
  };

  // Mod değişimi
  const handleModDegis = (yeniMod) => {
    setMod(yeniMod);
    setModModalAcik(false);
    yeniOyunBaslat(kategori, uzunluk, yeniMod);
  };

  // Kullanıcı adı değişimi
  const handleKullaniciAdiDegistir = (yeniAd) => {
    const guncellenmis = kullaniciAdiGuncelle(yeniAd);
    setKullanici(guncellenmis);
    setLiderlik(liderlikGuncelle());
  };

  // Logo tıklama - oyunu sıfırla
  const handleLogoTikla = () => {
    yeniOyunBaslat(kategori, uzunluk, mod);
  };

  // Meydan okuma linki oluştur
  const meydanOkumaLinkiOlustur = (kelime) => {
    const sifreliKelime = kelimeSifrele(kelime);
    const url = `${window.location.origin}${window.location.pathname}?m=${sifreliKelime}`;
    return url;
  };

  // Paylaşım metni
  const getPaylasimMetni = () => {
    if (mod === 'timeattack') {
      return `Wordletr ⏱️ Time Attack\n${timeAttackSkor} kelime bildim!\n\nhttps://wordletr.vercel.app`;
    }
    if (mod === 'merdiven') {
      return `Wordletr 🪜 Merdiven\n${merdivenSeviye} harfe ulaştım!\n\nhttps://wordletr.vercel.app`;
    }
    if (mod === 'gunluk') {
      return `Wordletr 📅 Günlük\n${kazandi ? `${tahminler.length}/6` : 'X/6'}\n\nhttps://wordletr.vercel.app`;
    }
    return paylasimMetni(tahminler, hedefKelime, oyunSayisi);
  };

  // Yeni oyun
  const handleYeniOyun = () => {
    yeniOyunBaslat(kategori, uzunluk, mod);
  };

  // Süre formatla
  const sureFormatla = (saniye) => {
    const dk = Math.floor(saniye / 60);
    const sn = saniye % 60;
    return `${dk}:${sn.toString().padStart(2, '0')}`;
  };

  if (!yuklendi) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center">
        <div className="logo text-3xl animate-pulse">WORDLETR</div>
      </div>
    );
  }

  const mevcutKategoriInfo = kategoriler[kategori] || { isim: 'Klasik', emoji: '📖' };
  const mevcutModInfo = MODLAR[mod] || MODLAR.sinirsiz;

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col">
      {/* Rozet bildirimi */}
      {rozetBildirimi && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-2xl flex items-center gap-3">
            <span className="text-3xl">{rozetBildirimi.emoji}</span>
            <div>
              <p className="font-bold">Yeni Rozet!</p>
              <p className="text-sm opacity-90">{rozetBildirimi.isim}</p>
            </div>
          </div>
        </div>
      )}

      <Header 
        onBilgi={() => setBilgiModalAcik(true)}
        onIstatistik={() => {
          setIstatistik(istatistikGetir());
          setSonucModalAcik(true);
        }}
        onLogoTikla={handleLogoTikla}
        onLiderlik={async () => {
          setLiderlik(liderlikGetir());
          setLiderlikModalAcik(true);
          try {
            const apiLiderlik = await liderlikGetirAPI();
            setLiderlik(apiLiderlik);
          } catch (e) {}
        }}
        onMeydanOkuma={() => setMeydanOkumaModalAcik(true)}
        onRozetler={() => setRozetlerModalAcik(true)}
        onAyarlar={() => setAyarlarModalAcik(true)}
        rozetSayisi={`${kazanilanRozetSayisi()}/${toplamRozetSayisi()}`}
        istatistik={istatistik}
      />

      <main className="flex-1 flex flex-col items-center py-3 px-3 max-w-xl mx-auto w-full">
        
        {/* ÜST MENÜ - Pill Style */}
        <div className="top-menu w-full">
          <button onClick={() => setKategoriModalAcik(true)} className="menu-pill">
            <span className="emoji">{mevcutKategoriInfo.emoji}</span>
            <span className="text">{mevcutKategoriInfo.isim}</span>
          </button>

          <button onClick={() => setModModalAcik(true)} className="menu-pill">
            <span className="emoji">{mevcutModInfo.emoji}</span>
            <span className="text">{mevcutModInfo.isim}</span>
          </button>

          <button 
            onClick={ipucuKullan}
            disabled={ipucuHakki <= 0 || oyunBitti || mod === 'kor' || mod === 'gunluk'}
            className={`menu-pill ${ipucuHakki <= 0 || oyunBitti || mod === 'kor' || mod === 'gunluk' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="emoji">💡</span>
            <span className="text">{ipucuHakki} İpucu</span>
          </button>
        </div>

        {/* Uzunluk seçici */}
        {mod !== 'merdiven' && mod !== 'gunluk' && (
          <div className="length-selector">
            {[4, 5, 6, 7].map(u => (
              <button
                key={u}
                onClick={() => handleUzunlukDegis(u)}
                className={`length-btn ${uzunluk === u ? 'active' : ''}`}
              >
                {u}
              </button>
            ))}
          </div>
        )}

        {/* Merdiven seviye göstergesi */}
        {mod === 'merdiven' && (
          <div className="ladder-indicator w-full my-3">
            {[4, 5, 6, 7].map(s => (
              <div
                key={s}
                className={`ladder-step ${
                  merdivenSeviye === s ? 'current' : 
                  merdivenSeviye > s ? 'completed' : 'upcoming'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        {/* Timer göstergesi - Survival */}
        {mod === 'survival' && (
          <div className="flex items-center justify-center gap-4 my-3">
            <div className={`timer-display ${kalanSure <= 10 ? 'warning' : ''}`}>
              {sureFormatla(kalanSure)}
            </div>
          </div>
        )}

        {/* Günlük mod bildirimi */}
        {mod === 'gunluk' && (
          <div className="hint-box w-full my-3">
            📅 Günlük Challenge — Tek hak, herkes aynı kelime!
          </div>
        )}

        {/* Meydan okuma bildirimi */}
        {meydanOkumaModu && (
          <div className="hint-box w-full my-3">
            🎯 Meydan Okuma — Arkadaşının kelimesini bul!
          </div>
        )}

        {/* İpucu gösterimi */}
        {kullanilanIpucu.length > 0 && (
          <div className="w-full my-2">
            {kullanilanIpucu.map((ipucu, i) => (
              <div key={i} className="hint-box mb-2">
                💡 {ipucu.mesaj}
              </div>
            ))}
          </div>
        )}

        {/* Kör mod sonuçları */}
        {mod === 'kor' && korModSonuclar.length > 0 && (
          <div className="w-full my-2">
            {korModSonuclar.map((sonuc, i) => (
              <div key={i} className="menu-item justify-center mb-2">
                🔢 <strong>{sonuc.dogruYer}</strong> doğru yerde, <strong>{sonuc.yanliyer}</strong> yanlış yerde
              </div>
            ))}
          </div>
        )}

        {/* Hata metni */}
        {hataMetni && (
          <div className="error-box w-full my-2">
            {hataMetni}
          </div>
        )}

        {/* Gizli mobil input */}
        <input
          ref={mobilInputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck="false"
          className="mobile-input"
          onInput={(e) => {
            if (oyunBitti || !hedefKelime) return;
            
            const value = e.target.value || '';
            
            // Geçerli harfleri topla
            let yeniHarfler = '';
            for (const karakter of value) {
              if (/^[a-zA-ZçÇğĞıİöÖşŞüÜ]$/.test(karakter)) {
                let harf = karakter.toUpperCase();
                if (karakter === 'i') harf = 'İ';
                if (karakter === 'ı') harf = 'I';
                yeniHarfler += harf;
              }
            }
            
            if (yeniHarfler) {
              setMevcutTahmin(prev => {
                const yeni = prev + yeniHarfler;
                return yeni.slice(0, hedefKelime.length);
              });
              setHataMetni('');
            }
            
            // Input'u temizle
            e.target.value = '';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (tahminGonderRef.current) tahminGonderRef.current();
            } else if (e.key === 'Backspace') {
              e.preventDefault();
              if (harfSilRef.current) harfSilRef.current();
            }
          }}
        />

        {/* Oyun tahtası */}
        <div 
          className="flex-1 flex items-center justify-center py-2 cursor-pointer"
          onClick={handleTahtaTikla}
        >
          <Tahta
            tahminler={tahminler}
            sonuclar={mod === 'kor' ? sonuclar.map(() => Array(hedefKelime?.length || 5).fill('bos')) : sonuclar}
            mevcutTahmin={mevcutTahmin}
            uzunluk={hedefKelime?.length || uzunluk}
            sallanim={sallanim}
          />
        </div>

        {/* Klavye */}
        <div className="w-full mt-auto">
          <Klavye
            onTus={handleKlavye}
            harfDurumlari={mod === 'kor' ? {} : harfDurumlari}
            ingilizce={kategori === 'english'}
          />
        </div>
      </main>

      {/* MODALS */}
      <Modal acik={bilgiModalAcik} kapat={() => setBilgiModalAcik(false)} baslik="Nasıl Oynanır?">
        <NasilOynanirIcerigi />
      </Modal>

      <Modal acik={sonucModalAcik} kapat={() => setSonucModalAcik(false)} baslik={oyunBitti ? (kazandi ? '🎉 Tebrikler!' : 'Oyun Bitti') : 'İstatistikler'}>
        {istatistik && (
          <SonucIcerigi
            kazandi={kazandi}
            hedefKelime={hedefKelime}
            tahminSayisi={tahminler.length}
            istatistik={istatistik}
            paylasimMetni={getPaylasimMetni()}
            onYeniOyun={handleYeniOyun}
            oyunBitti={oyunBitti}
            mod={mod}
            timeAttackSkor={timeAttackSkor}
            merdivenSeviye={merdivenSeviye}
            yeniRozetler={yeniRozetler}
          />
        )}
      </Modal>

      <Modal acik={liderlikModalAcik} kapat={() => setLiderlikModalAcik(false)} baslik="🏆 Liderlik Tablosu">
        <LiderlikIcerigi
          liderlik={liderlik}
          mevcutKullaniciId={kullanici.id}
          kullaniciAdi={kullanici.ad}
          onAdDegistir={handleKullaniciAdiDegistir}
        />
      </Modal>

      <Modal acik={kategoriModalAcik} kapat={() => setKategoriModalAcik(false)} baslik="Kategori Seç">
        <KategoriSeciciIcerigi
          kategoriler={kategoriler}
          mevcutKategori={kategori}
          onKategoriSec={handleKategoriDegis}
        />
      </Modal>

      <Modal acik={modModalAcik} kapat={() => setModModalAcik(false)} baslik="Oyun Modu">
        <ModSeciciIcerigi
          modlar={MODLAR}
          mevcutMod={mod}
          onModSec={handleModDegis}
          gunlukOynandi={gunlukOynandiMi()}
        />
      </Modal>

      <Modal acik={meydanOkumaModalAcik} kapat={() => setMeydanOkumaModalAcik(false)} baslik="🎯 Meydan Okuma">
        <MeydanOkumaIcerigi onLinkOlustur={meydanOkumaLinkiOlustur} />
      </Modal>

      <Modal acik={rozetlerModalAcik} kapat={() => setRozetlerModalAcik(false)} baslik="🏅 Rozetler">
        <RozetlerIcerigi rozetler={tumRozetler()} />
      </Modal>

      <Modal acik={ayarlarModalAcik} kapat={() => setAyarlarModalAcik(false)} baslik="⚙️ Ayarlar">
        <AyarlarIcerigi />
      </Modal>

      <Modal acik={gunlukModalAcik} kapat={() => setGunlukModalAcik(false)} baslik="📅 Günlük Challenge">
        <GunlukIcerigi />
      </Modal>
    </div>
  );
}
