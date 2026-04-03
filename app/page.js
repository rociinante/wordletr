'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Tahta from '../components/Tahta';
import Klavye from '../components/Klavye';
import UzunlukSecici from '../components/UzunlukSecici';
import Modal, { SonucIcerigi, NasilOynanirIcerigi, LiderlikIcerigi, KategoriSeciciIcerigi } from '../components/Modal';
import { kontrolEt, klavyeGuncelle, paylasimMetni } from '../lib/oyunMotoru';
import { rastgeleKelimeUzunluklu, kategorileriGetir, mevcutUzunluklar, ipucuHakkiHesapla, ipucuOlustur } from '../lib/kelimeSecici';
import { 
  istatistikGetir, 
  kazandiGuncelle, 
  kaybettiGuncelle,
  kullaniciGetir,
  kullaniciAdiGuncelle,
  liderlikGetir,
  liderlikGuncelle
} from '../lib/depolama';

// Oyun modları
const MODLAR = {
  sinirsiz: { isim: 'Sınırsız', emoji: '♾️', aciklama: 'Sınırsız pratik modu' },
  zor: { isim: 'Zor Mod', emoji: '🔥', aciklama: 'Bulunan harfler zorunlu' },
  merdiven: { isim: 'Merdiven', emoji: '🪜', aciklama: '4→5→6→7→8 harf, yanarsın başa dön!' },
  timeAttack: { isim: 'Zamana Karşı', emoji: '⏱️', aciklama: '5 dakikada kaç kelime?' },
};

export default function Home() {
  // Oyun modu
  const [mod, setMod] = useState('sinirsiz');
  const [modModalAcik, setModModalAcik] = useState(false);
  
  // Merdiven modu state
  const [merdivenSeviye, setMerdivenSeviye] = useState(4);
  const [merdivenSkor, setMerdivenSkor] = useState(0);
  
  // Time Attack state
  const [timeAttackSure, setTimeAttackSure] = useState(300);
  const [timeAttackSkor, setTimeAttackSkor] = useState(0);
  const [timeAttackAktif, setTimeAttackAktif] = useState(false);
  const timerRef = useRef(null);

  // Challenge modu
  const [challengeKelime, setChallengeKelime] = useState(null);
  const [challengeOlusturModalAcik, setChallengeOlusturModalAcik] = useState(false);
  const [challengeInput, setChallengeInput] = useState('');
  const [challengeLink, setChallengeLink] = useState('');

  // Temel oyun durumu
  const [kategori, setKategori] = useState('klasik');
  const [uzunluk, setUzunluk] = useState(5);
  const [hedefKelime, setHedefKelime] = useState('');
  const [tahminler, setTahminler] = useState([]);
  const [sonuclar, setSonuclar] = useState([]);
  const [mevcutTahmin, setMevcutTahmin] = useState('');
  const [harfDurumlari, setHarfDurumlari] = useState({});
  const [oyunBitti, setOyunBitti] = useState(false);
  const [kazandi, setKazandi] = useState(false);
  const [sallanim, setSallanim] = useState(false);
  const [hata, setHata] = useState('');
  const [oyunBasladi, setOyunBasladi] = useState(false);

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
  const [istatistik, setIstatistik] = useState(null);
  const [kategoriler, setKategoriler] = useState({});
  const [uzunluklar, setUzunluklar] = useState([5]);

  // İlk yükleme kontrolü
  const [yuklendi, setYuklendi] = useState(false);

  // URL'den challenge kelimesini kontrol et
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const challenge = params.get('c');
      if (challenge) {
        try {
          const decoded = atob(challenge);
          setChallengeKelime(decoded.toUpperCase());
          setMod('challenge');
        } catch (e) {
          console.error('Challenge decode hatası');
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
    
    const uzunlukListesi = mevcutUzunluklar('klasik');
    setUzunluklar(uzunlukListesi);
    
    const ist = istatistikGetir();
    setIpucuHakki(ipucuHakkiHesapla(ist));
    setIstatistik(ist);
    
    setYuklendi(true);
  }, []);

  // İlk defa oynuyorsa bilgi modalını göster
  useEffect(() => {
    if (yuklendi && !challengeKelime) {
      const ilkOyun = localStorage.getItem('wordletr_ilk_oyun');
      if (!ilkOyun) {
        setBilgiModalAcik(true);
        localStorage.setItem('wordletr_ilk_oyun', 'true');
      }
    }
  }, [yuklendi, challengeKelime]);

  // Time Attack timer
  useEffect(() => {
    if (timeAttackAktif && timeAttackSure > 0) {
      timerRef.current = setInterval(() => {
        setTimeAttackSure(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimeAttackAktif(false);
            setOyunBitti(true);
            setTimeout(() => setSonucModalAcik(true), 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeAttackAktif]);

  // Oyun başlat
  const oyunuBaslat = (yeniUzunluk) => {
    let kelime;
    let secilenUzunluk = yeniUzunluk || uzunluk;
    
    if (challengeKelime) {
      kelime = challengeKelime;
      secilenUzunluk = challengeKelime.length;
    } else if (mod === 'merdiven') {
      kelime = rastgeleKelimeUzunluklu(kategori, merdivenSeviye, hedefKelime);
      secilenUzunluk = merdivenSeviye;
    } else if (mod === 'timeAttack') {
      kelime = rastgeleKelimeUzunluklu(kategori, 5, hedefKelime);
      secilenUzunluk = 5;
      if (!timeAttackAktif) {
        setTimeAttackSure(300);
        setTimeAttackSkor(0);
        setTimeAttackAktif(true);
      }
    } else {
      kelime = rastgeleKelimeUzunluklu(kategori, secilenUzunluk, hedefKelime);
    }
    
    setUzunluk(secilenUzunluk);
    setHedefKelime(kelime);
    setTahminler([]);
    setSonuclar([]);
    setMevcutTahmin('');
    setHarfDurumlari({});
    setOyunBitti(false);
    setKazandi(false);
    setSonucModalAcik(false);
    setKullanilanIpucu([]);
    setHata('');
    setOyunBasladi(true);
    
    const ist = istatistikGetir();
    setIpucuHakki(ipucuHakkiHesapla(ist));
  };

  // Klavye girişlerini dinle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!oyunBasladi || oyunBitti) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      const key = e.key;
      
      if (key === 'Enter') {
        e.preventDefault();
        handleTahminGonder();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleHarfSil();
      } else {
        const upperKey = key.toUpperCase();
        const tumHarfler = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZWXQ';
        
        if (tumHarfler.includes(upperKey)) {
          e.preventDefault();
          handleHarfEkle(upperKey);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Harf ekle
  const handleHarfEkle = (harf) => {
    if (oyunBitti || !hedefKelime) return;
    if (mevcutTahmin.length >= hedefKelime.length) return;
    setMevcutTahmin(prev => prev + harf);
    setHata('');
  };

  // Harf sil
  const handleHarfSil = () => {
    if (oyunBitti) return;
    setMevcutTahmin(prev => prev.slice(0, -1));
    setHata('');
  };

  // Zor mod kontrolü
  const zorModKontrol = (tahmin) => {
    if (mod !== 'zor') return true;
    
    for (let i = 0; i < sonuclar.length; i++) {
      const oncekiTahmin = tahminler[i];
      const oncekiSonuc = sonuclar[i];
      
      for (let j = 0; j < oncekiSonuc.length; j++) {
        const durum = oncekiSonuc[j];
        const harf = oncekiTahmin[j];
        
        if (durum === 'dogru' && tahmin[j] !== harf) {
          setHata(`${j + 1}. harf ${harf} olmalı!`);
          return false;
        }
        
        if (durum === 'yerinde' && !tahmin.includes(harf)) {
          setHata(`${harf} harfi kullanılmalı!`);
          return false;
        }
      }
    }
    
    return true;
  };

  // Tahmin gönder
  const handleTahminGonder = () => {
    if (oyunBitti || !hedefKelime) return;
    if (mevcutTahmin.length !== hedefKelime.length) {
      setSallanim(true);
      setTimeout(() => setSallanim(false), 500);
      setHata(`${hedefKelime.length} harf girmelisin!`);
      return;
    }

    if (!zorModKontrol(mevcutTahmin)) {
      setSallanim(true);
      setTimeout(() => setSallanim(false), 500);
      return;
    }

    const sonuc = kontrolEt(mevcutTahmin, hedefKelime);
    const yeniTahminler = [...tahminler, mevcutTahmin];
    const yeniSonuclar = [...sonuclar, sonuc];
    
    setTahminler(yeniTahminler);
    setSonuclar(yeniSonuclar);
    setMevcutTahmin('');
    setHata('');
    
    setHarfDurumlari(prev => klavyeGuncelle(prev, mevcutTahmin, sonuc));

    const dogruMu = mevcutTahmin.toUpperCase() === hedefKelime.toUpperCase();
    
    if (dogruMu) {
      if (mod === 'merdiven') {
        setMerdivenSkor(prev => prev + 1);
        if (merdivenSeviye < 8) {
          setMerdivenSeviye(prev => prev + 1);
          setTimeout(() => {
            const yeniKelime = rastgeleKelimeUzunluklu(kategori, merdivenSeviye + 1, hedefKelime);
            setHedefKelime(yeniKelime);
            setUzunluk(merdivenSeviye + 1);
            setTahminler([]);
            setSonuclar([]);
            setHarfDurumlari({});
            setKullanilanIpucu([]);
          }, 1000);
          return;
        } else {
          setOyunBitti(true);
          setKazandi(true);
        }
      } else if (mod === 'timeAttack') {
        setTimeAttackSkor(prev => prev + 1);
        setTimeout(() => {
          const yeniKelime = rastgeleKelimeUzunluklu(kategori, 5, hedefKelime);
          setHedefKelime(yeniKelime);
          setTahminler([]);
          setSonuclar([]);
          setHarfDurumlari({});
          setKullanilanIpucu([]);
        }, 500);
        return;
      } else {
        const yeniIstatistik = kazandiGuncelle(yeniTahminler.length);
        setIstatistik(yeniIstatistik);
        setOyunBitti(true);
        setKazandi(true);
        setLiderlik(liderlikGuncelle());
      }
      
      setTimeout(() => setSonucModalAcik(true), 1500);
    } else if (yeniTahminler.length >= 6) {
      if (mod === 'merdiven') {
        setMerdivenSeviye(4);
        setMerdivenSkor(0);
      }
      
      if (mod !== 'timeAttack') {
        const yeniIstatistik = kaybettiGuncelle();
        setIstatistik(yeniIstatistik);
        setOyunBitti(true);
        setKazandi(false);
        setLiderlik(liderlikGuncelle());
        
        setTimeout(() => setSonucModalAcik(true), 1500);
      } else {
        setTimeout(() => {
          const yeniKelime = rastgeleKelimeUzunluklu(kategori, 5, hedefKelime);
          setHedefKelime(yeniKelime);
          setTahminler([]);
          setSonuclar([]);
          setHarfDurumlari({});
          setKullanilanIpucu([]);
        }, 500);
      }
    }
  };

  // İpucu kullan
  const ipucuKullan = () => {
    if (ipucuHakki <= 0 || oyunBitti) return;
    
    const ipucu = ipucuOlustur(hedefKelime, tahminler, 'harf');
    if (ipucu) {
      setKullanilanIpucu(prev => [...prev, ipucu]);
      setIpucuHakki(prev => prev - 1);
    }
  };

  // Sanal klavye
  const handleKlavye = (tus) => {
    if (tus === 'ENTER') {
      handleTahminGonder();
    } else if (tus === 'BACKSPACE') {
      handleHarfSil();
    } else {
      handleHarfEkle(tus);
    }
  };

  // Kategori değişimi
  const handleKategoriDegis = (yeniKategori) => {
    setKategori(yeniKategori);
    setKategoriModalAcik(false);
    
    const yeniUzunluklar = mevcutUzunluklar(yeniKategori);
    setUzunluklar(yeniUzunluklar);
    
    if (!yeniUzunluklar.includes(uzunluk)) {
      setUzunluk(yeniUzunluklar[0] || 5);
    }
    
    setOyunBasladi(false);
  };

  // Uzunluk değişimi
  const handleUzunlukDegis = (yeniUzunluk) => {
    setUzunluk(yeniUzunluk);
  };

  // Mod değişimi
  const handleModDegis = (yeniMod) => {
    setMod(yeniMod);
    setModModalAcik(false);
    setOyunBasladi(false);
    
    if (yeniMod === 'merdiven') {
      setMerdivenSeviye(4);
      setMerdivenSkor(0);
    } else if (yeniMod === 'timeAttack') {
      setTimeAttackSure(300);
      setTimeAttackSkor(0);
      setTimeAttackAktif(false);
    }
  };

  // Logo tıklama
  const handleLogoTikla = () => {
    if (mod === 'timeAttack') {
      clearInterval(timerRef.current);
      setTimeAttackAktif(false);
    }
    setOyunBasladi(false);
    setOyunBitti(false);
    setChallengeKelime(null);
    setMod('sinirsiz');
    setMerdivenSeviye(4);
    setMerdivenSkor(0);
    
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  // Challenge link oluştur
  const challengeLinkOlustur = () => {
    if (challengeInput.length < 4 || challengeInput.length > 8) {
      setHata('Kelime 4-8 harf arası olmalı!');
      return;
    }
    
    const encoded = btoa(challengeInput.toUpperCase());
    const link = `${window.location.origin}${window.location.pathname}?c=${encoded}`;
    setChallengeLink(link);
    setHata('');
  };

  // Challenge linkini kopyala
  const challengeLinkKopyala = async () => {
    try {
      await navigator.clipboard.writeText(challengeLink);
      setHata('Link kopyalandı!');
      setTimeout(() => setHata(''), 2000);
    } catch (e) {
      console.error('Kopyalama hatası');
    }
  };

  // Kullanıcı adı değişimi
  const handleKullaniciAdiDegistir = (yeniAd) => {
    const guncellenmis = kullaniciAdiGuncelle(yeniAd);
    setKullanici(guncellenmis);
    setLiderlik(liderlikGuncelle());
  };

  // Yeni oyun
  const handleYeniOyun = () => {
    setSonucModalAcik(false);
    setOyunBasladi(false);
    setChallengeKelime(null);
    
    if (mod === 'merdiven') {
      setMerdivenSeviye(4);
      setMerdivenSkor(0);
    }
  };

  // Paylaşım metni
  const getPaylasimMetni = () => {
    let modText = '';
    if (mod === 'merdiven') modText = ` 🪜 Merdiven Seviye ${merdivenSeviye}`;
    if (mod === 'timeAttack') modText = ` ⏱️ Time Attack: ${timeAttackSkor} kelime`;
    if (mod === 'zor') modText = ' 🔥 Zor Mod';
    
    return paylasimMetni(tahminler, hedefKelime, 1) + modText;
  };

  // Süre formatla
  const sureFormatla = (saniye) => {
    const dk = Math.floor(saniye / 60);
    const sn = saniye % 60;
    return `${dk}:${sn.toString().padStart(2, '0')}`;
  };

  if (!yuklendi) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="logo text-3xl animate-pulse">WORDLETR</div>
      </div>
    );
  }

  const mevcutKategoriInfo = kategoriler[kategori] || { isim: 'Klasik', emoji: '📖' };
  const mevcutModInfo = MODLAR[mod] || MODLAR.sinirsiz;

  return (
    <div className="min-h-screen flex flex-col">
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
      />

      <main className="flex-1 flex flex-col items-center py-4 px-2 max-w-lg mx-auto w-full">
        
        {/* Oyun başlamadan - seçim ekranı */}
        {!oyunBasladi && !challengeKelime && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full px-4">
            <h2 className="text-2xl font-bold text-center" style={{ fontFamily: 'var(--font-display)' }}>
              Oyun Ayarları
            </h2>
            
            {/* Mod Seçimi */}
            <div className="w-full">
              <p className="text-sm opacity-60 mb-2">Oyun Modu</p>
              <button 
                onClick={() => setModModalAcik(true)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl transition-all hover:scale-102"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mevcutModInfo.emoji}</span>
                  <div className="text-left">
                    <p className="font-semibold">{mevcutModInfo.isim}</p>
                    <p className="text-xs opacity-60">{mevcutModInfo.aciklama}</p>
                  </div>
                </div>
                <span className="opacity-50">▼</span>
              </button>
            </div>
            
            {/* Kategori Seçimi */}
            <div className="w-full">
              <p className="text-sm opacity-60 mb-2">Kategori</p>
              <button 
                onClick={() => setKategoriModalAcik(true)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl transition-all hover:scale-102"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mevcutKategoriInfo.emoji}</span>
                  <span className="font-semibold">{mevcutKategoriInfo.isim}</span>
                </div>
                <span className="opacity-50">▼</span>
              </button>
            </div>
            
            {/* Harf Uzunluğu Seçimi */}
            {mod !== 'merdiven' && mod !== 'timeAttack' && (
              <div className="w-full">
                <p className="text-sm opacity-60 mb-2">Harf Sayısı</p>
                <UzunlukSecici
                  uzunluklar={uzunluklar}
                  secili={uzunluk}
                  onChange={handleUzunlukDegis}
                />
              </div>
            )}
            
            {/* Meydan Okuma Oluştur */}
            <button 
              onClick={() => setChallengeOlusturModalAcik(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all hover:scale-102"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}
            >
              <span>🎯</span>
              <span className="font-semibold text-white">Arkadaşına Meydan Oku!</span>
            </button>
            
            {/* Başla Butonu */}
            <button 
              onClick={() => oyunuBaslat(uzunluk)}
              className="btn-primary w-full text-xl py-4"
            >
              {mod === 'merdiven' ? '🪜 Merdivene Başla!' : 
               mod === 'timeAttack' ? '⏱️ Zamana Karşı Başla!' :
               '🎮 Oyuna Başla!'}
            </button>
          </div>
        )}

        {/* Oyun başladı */}
        {(oyunBasladi || challengeKelime) && (
          <>
            {/* Üst bilgi barı */}
            <div className="w-full flex items-center justify-between mb-2 px-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{mevcutKategoriInfo.emoji}</span>
                <span className="font-semibold text-sm">{mevcutKategoriInfo.isim}</span>
                {mod !== 'sinirsiz' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold" 
                    style={{ background: 'var(--accent)', color: 'white' }}>
                    {mevcutModInfo.emoji} {mevcutModInfo.isim}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {mod === 'merdiven' && (
                  <span className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{ background: 'var(--bg-secondary)' }}>
                    🪜 {merdivenSeviye} harf • Skor: {merdivenSkor}
                  </span>
                )}
                
                {mod === 'timeAttack' && (
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${timeAttackSure < 30 ? 'animate-pulse' : ''}`}
                    style={{ background: timeAttackSure < 30 ? '#ef4444' : 'var(--bg-secondary)', color: timeAttackSure < 30 ? 'white' : 'inherit' }}>
                    ⏱️ {sureFormatla(timeAttackSure)} • {timeAttackSkor} kelime
                  </span>
                )}
                
                <button 
                  onClick={ipucuKullan}
                  disabled={ipucuHakki <= 0 || oyunBitti}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${
                    ipucuHakki > 0 && !oyunBitti ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <span>💡</span>
                  <span className="font-bold">{ipucuHakki}</span>
                </button>
              </div>
            </div>

            {challengeKelime && (
              <div className="w-full mb-2 px-2">
                <div className="px-4 py-2 rounded-xl text-center text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', color: 'white' }}>
                  🎯 Meydan Okuma! {challengeKelime.length} harfli kelimeyi bul!
                </div>
              </div>
            )}

            {hata && (
              <div className="w-full mb-2 px-2">
                <div className="px-4 py-2 rounded-xl text-center text-sm font-semibold"
                  style={{ background: '#ef4444', color: 'white' }}>
                  {hata}
                </div>
              </div>
            )}

            {kullanilanIpucu.length > 0 && (
              <div className="w-full mb-2 px-2">
                {kullanilanIpucu.map((ipucu, i) => (
                  <div 
                    key={i}
                    className="px-4 py-2 rounded-xl mb-1 text-center text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #a855f7 100%)', color: 'white' }}
                  >
                    💡 {ipucu.mesaj}
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 flex items-center justify-center py-2">
              <Tahta
                tahminler={tahminler}
                sonuclar={sonuclar}
                mevcutTahmin={mevcutTahmin}
                uzunluk={hedefKelime?.length || uzunluk}
                sallanim={sallanim}
              />
            </div>

            <div className="w-full mt-auto pb-2">
              <Klavye
                onTus={handleKlavye}
                harfDurumlari={harfDurumlari}
              />
            </div>
          </>
        )}
      </main>

      {/* Modaller */}
      <Modal acik={bilgiModalAcik} kapat={() => setBilgiModalAcik(false)} baslik="NASIL OYNANIR?">
        <NasilOynanirIcerigi />
      </Modal>

      <Modal
        acik={sonucModalAcik}
        kapat={() => setSonucModalAcik(false)}
        baslik={
          mod === 'timeAttack' ? `⏱️ SÜRE BİTTİ!` :
          mod === 'merdiven' && kazandi && merdivenSeviye === 8 ? '🏆 MERDİVEN TAMAMLANDI!' :
          oyunBitti ? (kazandi ? 'KAZANDIN! 🎉' : 'OYUN BİTTİ') : 'İSTATİSTİKLER'
        }
      >
        {mod === 'timeAttack' ? (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">⏱️</div>
            <p className="text-3xl font-bold">{timeAttackSkor} kelime!</p>
            <p className="opacity-60">5 dakikada {timeAttackSkor} kelime buldun!</p>
            <button onClick={handleYeniOyun} className="btn-primary w-full mt-4">Tekrar Dene 🔄</button>
          </div>
        ) : mod === 'merdiven' && kazandi && merdivenSeviye === 8 ? (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-3xl font-bold">Tebrikler!</p>
            <p className="opacity-60">Tüm merdiveni tamamladın!</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>Skor: {merdivenSkor}</p>
            <button onClick={handleYeniOyun} className="btn-primary w-full mt-4">Yeni Merdiven 🪜</button>
          </div>
        ) : istatistik && (
          <SonucIcerigi
            kazandi={kazandi}
            hedefKelime={hedefKelime}
            tahminSayisi={tahminler.length}
            istatistik={istatistik}
            paylasimMetni={getPaylasimMetni()}
            onYeniOyun={handleYeniOyun}
            oyunBpiitti={oyunBitti}
          />
        )}
      </Modal>

      <Modal acik={liderlikModalAcik} kapat={() => setLiderlikModalAcik(false)} baslik="🏆 LİDERLİK TABLOSU">
        <LiderlikIcerigi
          liderlik={liderlik}
          mevcutKullaniciId={kullanici.id}
          kullaniciAdi={kullanici.ad}
          onAdDegistir={handleKullaniciAdiDegistir}
        />
      </Modal>

      <Modal acik={kategoriModalAcik} kapat={() => setKategoriModalAcik(false)} baslik="KATEGORİ SEÇ">
        <KategoriSeciciIcerigi
          kategoriler={kategoriler}
          mevcutKategori={kategori}
          onKategoriSec={handleKategoriDegis}
        />
      </Modal>

      <Modal acik={modModalAcik} kapat={() => setModModalAcik(false)} baslik="OYUN MODU SEÇ">
        <div className="space-y-3">
          {Object.entries(MODLAR).map(([key, modInfo]) => (
            <button
              key={key}
              onClick={() => handleModDegis(key)}
              className={`w-full p-4 rounded-xl text-left transition-all ${mod === key ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'hover:scale-102'}`}
              style={{ background: mod !== key ? 'var(--bg-tertiary)' : undefined }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{modInfo.emoji}</span>
                <div>
                  <p className="font-bold">{modInfo.isim}</p>
                  <p className="text-xs opacity-70">{modInfo.aciklama}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        acik={challengeOlusturModalAcik}
        kapat={() => { setChallengeOlusturModalAcik(false); setChallengeInput(''); setChallengeLink(''); setHata(''); }}
        baslik="🎯 MEYDAN OKUMA OLUŞTUR"
      >
        <div className="space-y-4">
          <p className="text-sm opacity-70">Bir kelime gir ve arkadaşlarına meydan oku!</p>
          
          <input
            type="text"
            value={challengeInput}
            onChange={(e) => setChallengeInput(e.target.value.toUpperCase().replace(/[^A-ZÇĞİÖŞÜ]/g, ''))}
            maxLength={8}
            placeholder="Kelimeyi gir (4-8 harf)"
            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 outline-none text-center text-xl font-bold tracking-widest"
          />
          
          {challengeLink ? (
            <div className="space-y-3">
              <p className="text-sm text-green-400 font-semibold">✅ Link hazır!</p>
              <div className="p-3 rounded-lg bg-black/20 break-all text-sm">{challengeLink}</div>
              <button onClick={challengeLinkKopyala} className="btn-primary w-full">📋 Linki Kopyala</button>
              <button 
                onClick={() => {
                  const text = `🎯 Wordletr'da sana meydan okuyorum!\n\nBu ${challengeInput.length} harfli kelimeyi bulabilecek misin?\n\n${challengeLink}`;
                  if (navigator.share) {
                    navigator.share({ text });
                  } else {
                    navigator.clipboard.writeText(text);
                  }
                }}
                className="yeni-oyun-btn w-full"
              >
                📤 Paylaş
              </button>
            </div>
          ) : (
            <button 
              onClick={challengeLinkOlustur}
              disabled={challengeInput.length < 4}
              className="btn-primary w-full disabled:opacity-50"
            >
              Link Oluştur 🔗
            </button>
          )}
          
          {hata && <p className="text-sm text-center text-green-400">{hata}</p>}
        </div>
      </Modal>
    </div>
  );
}
