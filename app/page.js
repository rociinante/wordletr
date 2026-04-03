'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Tahta from '../components/Tahta';
import Klavye from '../components/Klavye';
import Modal, { SonucIcerigi, NasilOynanirIcerigi, LiderlikIcerigi, KategoriSeciciIcerigi } from '../components/Modal';
import { kontrolEt, klavyeGuncelle, paylasimMetni } from '../lib/oyunMotoru';
import { rastgeleKelime, kategorileriGetir, oyunSayisiGetir, oyunSayisiArtir, ipucuHakkiHesapla, ipucuOlustur } from '../lib/kelimeSecici';
import { 
  istatistikGetir, 
  kazandiGuncelle, 
  kaybettiGuncelle,
  kullaniciGetir,
  kullaniciAdiGuncelle,
  liderlikGetir,
  liderlikGuncelle
} from '../lib/depolama';

export default function Home() {
  // Oyun durumu
  const [kategori, setKategori] = useState('klasik');
  const [hedefKelime, setHedefKelime] = useState('');
  const [tahminler, setTahminler] = useState([]);
  const [sonuclar, setSonuclar] = useState([]);
  const [mevcutTahmin, setMevcutTahmin] = useState('');
  const [harfDurumlari, setHarfDurumlari] = useState({});
  const [oyunBitti, setOyunBitti] = useState(false);
  const [kazandi, setKazandi] = useState(false);
  const [sallanim, setSallanim] = useState(false);
  const [oyunSayisi, setOyunSayisi] = useState(1);

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

  // İlk yükleme kontrolü
  const [yuklendi, setYuklendi] = useState(false);

  // Yeni oyun başlat
  const yeniOyunBaslat = useCallback((yeniKategori = kategori) => {
    const kelime = rastgeleKelime(yeniKategori, hedefKelime);
    setHedefKelime(kelime);
    setTahminler([]);
    setSonuclar([]);
    setMevcutTahmin('');
    setHarfDurumlari({});
    setOyunBitti(false);
    setKazandi(false);
    setSonucModalAcik(false);
    setOyunSayisi(oyunSayisiGetir());
    setKullanilanIpucu([]);
    
    // İpucu hakkını hesapla
    const ist = istatistikGetir();
    setIpucuHakki(ipucuHakkiHesapla(ist));
  }, [kategori, hedefKelime]);

  // İlk yükleme
  useEffect(() => {
    const kat = kategorileriGetir();
    setKategoriler(kat);
    setKullanici(kullaniciGetir());
    setLiderlik(liderlikGetir());
    
    const kelime = rastgeleKelime('klasik', '');
    setHedefKelime(kelime);
    
    const ist = istatistikGetir();
    setIpucuHakki(ipucuHakkiHesapla(ist));
    setOyunSayisi(oyunSayisiGetir());
    
    setYuklendi(true);
  }, []);

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

  // Klavye girişlerini dinle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (oyunBitti) return;
      
      const key = e.key.toUpperCase();
      
      if (key === 'ENTER') {
        e.preventDefault();
        tahminGonderRef.current();
      } else if (key === 'BACKSPACE') {
        harfSilRef.current();
      } else if (/^[A-ZÇĞİÖŞÜ]$/.test(key)) {
        harfEkleRef.current(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [oyunBitti]);

  // Ref'ler callback'ler için
  const harfEkleRef = { current: null };
  const harfSilRef = { current: null };
  const tahminGonderRef = { current: null };

  // Harf ekle
  harfEkleRef.current = (harf) => {
    if (oyunBitti) return;
    if (!hedefKelime) return;
    if (mevcutTahmin.length >= hedefKelime.length) return;
    setMevcutTahmin(prev => prev + harf);
  };

  // Harf sil
  harfSilRef.current = () => {
    if (oyunBitti) return;
    setMevcutTahmin(prev => prev.slice(0, -1));
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

  // Tahmin gönder
  tahminGonderRef.current = () => {
    if (oyunBitti) return;
    if (!hedefKelime) return;
    if (mevcutTahmin.length !== hedefKelime.length) {
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
    
    setHarfDurumlari(prev => klavyeGuncelle(prev, mevcutTahmin, sonuc));

    const dogruMu = mevcutTahmin.toUpperCase() === hedefKelime.toUpperCase();
    
    if (dogruMu) {
      const yeniIstatistik = kazandiGuncelle(yeniTahminler.length);
      setIstatistik(yeniIstatistik);
      setOyunBitti(true);
      setKazandi(true);
      oyunSayisiArtir();
      setLiderlik(liderlikGuncelle());
      
      setTimeout(() => setSonucModalAcik(true), 1500);
    } else if (yeniTahminler.length >= 6) {
      const yeniIstatistik = kaybettiGuncelle();
      setIstatistik(yeniIstatistik);
      setOyunBitti(true);
      setKazandi(false);
      oyunSayisiArtir();
      setLiderlik(liderlikGuncelle());
      
      setTimeout(() => setSonucModalAcik(true), 1500);
    }
  };

  // Sanal klavye girişi
  const handleKlavye = (tus) => {
    if (tus === 'ENTER') {
      tahminGonderRef.current();
    } else if (tus === 'BACKSPACE') {
      harfSilRef.current();
    } else {
      harfEkleRef.current(tus);
    }
  };

  // Kategori değişimi
  const handleKategoriDegis = (yeniKategori) => {
    setKategori(yeniKategori);
    setKategoriModalAcik(false);
    
    const kelime = rastgeleKelime(yeniKategori, hedefKelime);
    setHedefKelime(kelime);
    setTahminler([]);
    setSonuclar([]);
    setMevcutTahmin('');
    setHarfDurumlari({});
    setOyunBitti(false);
    setKazandi(false);
    setKullanilanIpucu([]);
    
    const ist = istatistikGetir();
    setIpucuHakki(ipucuHakkiHesapla(ist));
  };

  // Kullanıcı adı değişimi
  const handleKullaniciAdiDegistir = (yeniAd) => {
    const guncellenmis = kullaniciAdiGuncelle(yeniAd);
    setKullanici(guncellenmis);
    setLiderlik(liderlikGuncelle());
  };

  // Logo tıklama - oyunu sıfırla
  const handleLogoTikla = () => {
    const kelime = rastgeleKelime(kategori, hedefKelime);
    setHedefKelime(kelime);
    setTahminler([]);
    setSonuclar([]);
    setMevcutTahmin('');
    setHarfDurumlari({});
    setOyunBitti(false);
    setKazandi(false);
    setSonucModalAcik(false);
    setKullanilanIpucu([]);
    
    const ist = istatistikGetir();
    setIpucuHakki(ipucuHakkiHesapla(ist));
  };

  // Paylaşım metni
  const getPaylasimMetni = () => {
    return paylasimMetni(tahminler, hedefKelime, oyunSayisi);
  };

  // Yeni oyun
  const handleYeniOyun = () => {
    handleLogoTikla();
  };

  if (!yuklendi) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="logo text-3xl animate-pulse">WORDLETR</div>
      </div>
    );
  }

  const mevcutKategoriInfo = kategoriler[kategori] || { isim: 'Klasik', emoji: '📖' };

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

      <main className="flex-1 flex flex-col items-center justify-between py-4 px-2 max-w-lg mx-auto w-full">
        {/* Kategori seçici ve ipucu */}
        <div className="w-full flex items-center justify-between mb-4 px-2">
          <button 
            onClick={() => setKategoriModalAcik(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <span>{mevcutKategoriInfo.emoji}</span>
            <span className="font-semibold">{mevcutKategoriInfo.isim}</span>
            <span className="opacity-50">▼</span>
          </button>

          <button 
            onClick={ipucuKullan}
            disabled={ipucuHakki <= 0 || oyunBitti}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              ipucuHakki > 0 && !oyunBitti ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <span>💡</span>
            <span className="font-semibold">{ipucuHakki}</span>
          </button>
        </div>

        {/* İpucu gösterimi */}
        {kullanilanIpucu.length > 0 && (
          <div className="w-full mb-4 px-2">
            {kullanilanIpucu.map((ipucu, i) => (
              <div 
                key={i}
                className="px-4 py-2 rounded-xl mb-2 text-center text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #a855f7 100%)', color: 'white' }}
              >
                💡 {ipucu.mesaj}
              </div>
            ))}
          </div>
        )}

        {/* Oyun tahtası */}
        <div className="flex-1 flex items-center">
          <Tahta
            tahminler={tahminler}
            sonuclar={sonuclar}
            mevcutTahmin={mevcutTahmin}
            uzunluk={hedefKelime?.length || 5}
            sallanim={sallanim}
          />
        </div>

        {/* Klavye */}
        <div className="w-full mt-auto pb-2">
          <Klavye
            onTus={handleKlavye}
            harfDurumlari={harfDurumlari}
          />
        </div>
      </main>

      {/* Bilgi modalı */}
      <Modal
        acik={bilgiModalAcik}
        kapat={() => setBilgiModalAcik(false)}
        baslik="NASIL OYNANIR?"
      >
        <NasilOynanirIcerigi />
      </Modal>

      {/* Sonuç modalı */}
      <Modal
        acik={sonucModalAcik}
        kapat={() => setSonucModalAcik(false)}
        baslik={oyunBitti ? (kazandi ? 'KAZANDIN! 🎉' : 'OYUN BİTTİ') : 'İSTATİSTİKLER'}
      >
        {istatistik && (
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

      {/* Liderlik modalı */}
      <Modal
        acik={liderlikModalAcik}
        kapat={() => setLiderlikModalAcik(false)}
        baslik="🏆 LİDERLİK TABLOSU"
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
        baslik="KATEGORİ SEÇ"
      >
        <KategoriSeciciIcerigi
          kategoriler={kategoriler}
          mevcutKategori={kategori}
          onKategoriSec={handleKategoriDegis}
        />
      </Modal>
    </div>
  );
}
