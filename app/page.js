'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../components/Header';
import Tahta from '../components/Tahta';
import Klavye from '../components/Klavye';
import Modal, { SonucIcerigi, NasilOynanirIcerigi, LiderlikIcerigi, KategoriSeciciIcerigi, ModSeciciIcerigi, MeydanOkumaIcerigi } from '../components/Modal';
import { kontrolEt, klavyeGuncelle, paylasimMetni, zorModKontrol, korModSonuc } from '../lib/oyunMotoru';
import { rastgeleKelimeUzunluklu, kategorileriGetir, oyunSayisiGetir, oyunSayisiArtir, ipucuHakkiHesapla, ipucuOlustur, mevcutUzunluklar, kelimeSifrele, kelimeCoz } from '../lib/kelimeSecici';
import { 
  istatistikGetir, 
  kazandiGuncelle, 
  kaybettiGuncelle,
  kullaniciGetir,
  kullaniciAdiGuncelle,
  liderlikGetir,
  liderlikGuncelle
} from '../lib/depolama';

// Modlar
const MODLAR = {
  sinirsiz: { isim: 'Sınırsız', emoji: '♾️', aciklama: 'İstediğin kadar oyna' },
  zor: { isim: 'Zor Mod', emoji: '🔥', aciklama: 'Bulunan harfleri kullanmak zorunlu' },
  timeattack: { isim: 'Time Attack', emoji: '⏱️', aciklama: '5 dakikada en fazla kelime' },
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

  // Kelime anlamı
  const [kelimeAnlami, setKelimeAnlami] = useState(null);
  const [anlamYukleniyor, setAnlamYukleniyor] = useState(false);

  // Meydan okuma
  const [meydanOkumaModu, setMeydanOkumaModu] = useState(false);
  const [meydanOkumaKelime, setMeydanOkumaKelime] = useState('');

  // Time Attack & Survival
  const [kalanSure, setKalanSure] = useState(0);
  const [timeAttackSkor, setTimeAttackSkor] = useState(0);
  const [survivalAktif, setSurvivalAktif] = useState(false);
  const timerRef = useRef(null);

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

  // Yeni oyun başlat
  const yeniOyunBaslat = useCallback((yeniKategori = kategori, yeniUzunluk = uzunluk, yeniMod = mod) => {
    timerTemizle();
    
    let kelime;
    let hedefUzunluk = yeniUzunluk;
    
    // Merdiven modunda 4 harften başla
    if (yeniMod === 'merdiven') {
      hedefUzunluk = 4;
      setMerdivenSeviye(4);
    }
    
    kelime = rastgeleKelimeUzunluklu(yeniKategori, hedefUzunluk, hedefKelime);
    
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
    setKelimeAnlami(null);
    
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
            setTimeout(() => setSonucModalAcik(true), 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Survival: 60 saniye
    if (yeniMod === 'survival') {
      setKalanSure(60);
      setSurvivalAktif(true);
      timerRef.current = setInterval(() => {
        setKalanSure(prev => {
          if (prev <= 1) {
            timerTemizle();
            setSurvivalAktif(false);
            setOyunBitti(true);
            setKazandi(false);
            setTimeout(() => setSonucModalAcik(true), 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [kategori, uzunluk, mod, hedefKelime, timerTemizle]);

  // URL'den meydan okuma kelimesini kontrol et
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sifreliKelime = params.get('m');
      
      if (sifreliKelime) {
        const cozulmusKelime = kelimeCoz(sifreliKelime);
        if (cozulmusKelime) {
          setMeydanOkumaModu(true);
          setMeydanOkumaKelime(cozulmusKelime);
          setHedefKelime(cozulmusKelime);
          setUzunluk(cozulmusKelime.length);
          
          // URL'i temizle
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
    
    // Meydan okuma modu değilse normal başla
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
  };

  // Harf sil fonksiyonu
  harfSilRef.current = () => {
    if (oyunBitti) return;
    setMevcutTahmin(prev => prev.slice(0, -1));
    setHataMetni('');
  };

  // Tahmin gönder fonksiyonu
  tahminGonderRef.current = () => {
    if (oyunBitti) return;
    if (!hedefKelime) return;
    if (mevcutTahmin.length !== hedefKelime.length) {
      setSallanim(true);
      setHataMetni(`${hedefKelime.length} harf girmelisin!`);
      setTimeout(() => setSallanim(false), 500);
      return;
    }

    // Zor mod kontrolü
    if (mod === 'zor' && tahminler.length > 0) {
      const zorKontrol = zorModKontrol(mevcutTahmin, tahminler, sonuclar);
      if (!zorKontrol.gecerli) {
        setSallanim(true);
        setHataMetni(zorKontrol.mesaj);
        setTimeout(() => setSallanim(false), 500);
        return;
      }
    }

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

      const yeniIstatistik = kazandiGuncelle(yeniTahminler.length);
      setIstatistik(yeniIstatistik);
      setOyunBitti(true);
      setKazandi(true);
      timerTemizle();
      oyunSayisiArtir();
      setLiderlik(liderlikGuncelle());
      
      setTimeout(() => setSonucModalAcik(true), 1500);
    } else if (yeniTahminler.length >= 6) {
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

      const yeniIstatistik = kaybettiGuncelle();
      setIstatistik(yeniIstatistik);
      setOyunBitti(true);
      setKazandi(false);
      timerTemizle();
      oyunSayisiArtir();
      setLiderlik(liderlikGuncelle());
      
      setTimeout(() => setSonucModalAcik(true), 1500);
    }
  };

  // Klavye girişlerini dinle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (oyunBitti) return;
      
      // Modal açıkken klavyeyi devre dışı bırak
      if (bilgiModalAcik || sonucModalAcik || liderlikModalAcik || kategoriModalAcik || modModalAcik || meydanOkumaModalAcik) {
        return;
      }
      
      const key = e.key.toUpperCase();
      
      if (key === 'ENTER') {
        e.preventDefault();
        if (tahminGonderRef.current) tahminGonderRef.current();
      } else if (key === 'BACKSPACE') {
        e.preventDefault();
        if (harfSilRef.current) harfSilRef.current();
      } else if (/^[A-ZÇĞİÖŞÜIı]$/i.test(key)) {
        // I ve ı harflerini düzelt
        let harf = key;
        if (harf === 'I') harf = 'I';
        if (harf === 'ı' || harf === 'Ι') harf = 'I';
        if (harfEkleRef.current) harfEkleRef.current(harf.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [oyunBitti, bilgiModalAcik, sonucModalAcik, liderlikModalAcik, kategoriModalAcik, modModalAcik, meydanOkumaModalAcik]);

  // İpucu kullan
  const ipucuKullan = () => {
    if (ipucuHakki <= 0 || oyunBitti) return;
    
    const ipucu = ipucuOlustur(hedefKelime, tahminler, 'harf');
    if (ipucu) {
      setKullanilanIpucu(prev => [...prev, ipucu]);
      setIpucuHakki(prev => prev - 1);
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
      <Header 
        onBilgi={() => setBilgiModalAcik(true)}
        onIstatistik={() => {
          setIstatistik(istatistikGetir());
          setSonucModalAcik(true);
        }}
        onLogoTikla={handleLogoTikla}
        onLiderlik={() => {
          setLiderlik(liderlikGetir());
          setLiderlikModalAcik(true);
        }}
        onMeydanOkuma={() => setMeydanOkumaModalAcik(true)}
      />

      <main className="flex-1 flex flex-col items-center py-4 px-4 max-w-xl mx-auto w-full">
        
        {/* ÜST MENÜ - Mod ve Kategori Yazılı */}
        <div className="top-menu w-full">
          {/* Kategori */}
          <button 
            onClick={() => setKategoriModalAcik(true)}
            className="menu-item"
          >
            <span className="emoji">{mevcutKategoriInfo.emoji}</span>
            <div className="flex flex-col items-start">
              <span className="label">Kategori</span>
              <span className="value">{mevcutKategoriInfo.isim}</span>
            </div>
          </button>

          {/* Mod */}
          <button 
            onClick={() => setModModalAcik(true)}
            className="menu-item"
          >
            <span className="emoji">{mevcutModInfo.emoji}</span>
            <div className="flex flex-col items-start">
              <span className="label">Mod</span>
              <span className="value">{mevcutModInfo.isim}</span>
            </div>
          </button>

          {/* İpucu */}
          <button 
            onClick={ipucuKullan}
            disabled={ipucuHakki <= 0 || oyunBitti || mod === 'kor'}
            className={`menu-item ${ipucuHakki <= 0 || oyunBitti || mod === 'kor' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="emoji">💡</span>
            <div className="flex flex-col items-start">
              <span className="label">İpucu</span>
              <span className="value">{ipucuHakki} Hak</span>
            </div>
          </button>
        </div>

        {/* Uzunluk seçici */}
        {mod !== 'merdiven' && (
          <div className="length-selector w-full my-3">
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

        {/* Timer göstergesi */}
        {(mod === 'timeattack' || mod === 'survival') && (
          <div className="flex items-center justify-center gap-4 my-3">
            <div className={`timer-display ${kalanSure <= 10 ? 'warning' : ''}`}>
              {sureFormatla(kalanSure)}
            </div>
            {mod === 'timeattack' && (
              <div className="timer-display">
                <span className="text-sm opacity-70 mr-2">Skor:</span>
                <span>{timeAttackSkor}</span>
              </div>
            )}
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
              <div 
                key={i}
                className="menu-item justify-center mb-2"
              >
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

        {/* Oyun tahtası */}
        <div className="flex-1 flex items-center justify-center py-4">
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

      {/* Bilgi modalı */}
      <Modal
        acik={bilgiModalAcik}
        kapat={() => setBilgiModalAcik(false)}
        baslik="Nasıl Oynanır?"
      >
        <NasilOynanirIcerigi />
      </Modal>

      {/* Sonuç modalı */}
      <Modal
        acik={sonucModalAcik}
        kapat={() => setSonucModalAcik(false)}
        baslik={oyunBitti ? (kazandi ? '🎉 Tebrikler!' : 'Oyun Bitti') : 'İstatistikler'}
      >
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
          />
        )}
      </Modal>

      {/* Liderlik modalı */}
      <Modal
        acik={liderlikModalAcik}
        kapat={() => setLiderlikModalAcik(false)}
        baslik="🏆 Liderlik Tablosu"
      >
        <LiderlikIcerigi
          liderlik={liderlik}
          mevcutKullaniciId={kullanici.id}
          kullaniciAdi={kullanici.ad}
          onAdDegistir={handleKullaniciAdiDegistir}
        />
      </Modal>

      {/* Kategori modalı */}
      <Modal
        acik={kategoriModalAcik}
        kapat={() => setKategoriModalAcik(false)}
        baslik="Kategori Seç"
      >
        <KategoriSeciciIcerigi
          kategoriler={kategoriler}
          mevcutKategori={kategori}
          onKategoriSec={handleKategoriDegis}
        />
      </Modal>

      {/* Mod modalı */}
      <Modal
        acik={modModalAcik}
        kapat={() => setModModalAcik(false)}
        baslik="Oyun Modu"
      >
        <ModSeciciIcerigi
          modlar={MODLAR}
          mevcutMod={mod}
          onModSec={handleModDegis}
        />
      </Modal>

      {/* Meydan Okuma modalı */}
      <Modal
        acik={meydanOkumaModalAcik}
        kapat={() => setMeydanOkumaModalAcik(false)}
        baslik="🎯 Meydan Okuma"
      >
        <MeydanOkumaIcerigi
          onLinkOlustur={meydanOkumaLinkiOlustur}
        />
      </Modal>
    </div>
  );
}
