'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Tahta from '../components/Tahta';
import Klavye from '../components/Klavye';
import UzunlukSecici from '../components/UzunlukSecici';
import Modal, { SonucIcerigi, NasilOynanirIcerigi } from '../components/Modal';
import { kontrolEt, klavyeGuncelle, paylasimMetni } from '../lib/oyunMotoru';
import { rastgeleKelime, mevcutUzunluklar, oyunSayisiGetir, oyunSayisiArtir } from '../lib/kelimeSecici';
import { 
  istatistikGetir, 
  kazandiGuncelle, 
  kaybettiGuncelle 
} from '../lib/depolama';

export default function Home() {
  // Oyun durumu
  const [uzunluk, setUzunluk] = useState(5);
  const [hedefKelime, setHedefKelime] = useState('');
  const [tahminler, setTahminler] = useState([]);
  const [sonuclar, setSonuclar] = useState([]);
  const [mevcutTahmin, setMevcutTahmin] = useState('');
  const [harfDurumlari, setHarfDurumlari] = useState({});
  const [oyunBitti, setOyunBitti] = useState(false);
  const [kazandi, setKazandi] = useState(false);
  const [sallanim, setSallanim] = useState(false);
  const [oyunSayisi, setOyunSayisi] = useState(1);

  // Modal durumları
  const [bilgiModalAcik, setBilgiModalAcik] = useState(false);
  const [sonucModalAcik, setSonucModalAcik] = useState(false);
  const [istatistik, setIstatistik] = useState(null);

  // İlk yükleme kontrolü
  const [yuklendi, setYuklendi] = useState(false);

  // Yeni oyun başlat
  const yeniOyunBaslat = useCallback((yeniUzunluk = uzunluk) => {
    const kelime = rastgeleKelime(yeniUzunluk, hedefKelime);
    setHedefKelime(kelime);
    setTahminler([]);
    setSonuclar([]);
    setMevcutTahmin('');
    setHarfDurumlari({});
    setOyunBitti(false);
    setKazandi(false);
    setSonucModalAcik(false);
    setOyunSayisi(oyunSayisiGetir());
  }, [uzunluk, hedefKelime]);

  // İlk yükleme
  useEffect(() => {
    yeniOyunBaslat(uzunluk);
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
        tahminGonder();
      } else if (key === 'BACKSPACE') {
        harfSil();
      } else if (/^[A-ZÇĞİÖŞÜ]$/.test(key)) {
        harfEkle(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [oyunBitti, mevcutTahmin, uzunluk, tahminler, hedefKelime]);

  // Harf ekle
  const harfEkle = useCallback((harf) => {
    if (oyunBitti) return;
    if (mevcutTahmin.length >= uzunluk) return;
    setMevcutTahmin(prev => prev + harf);
  }, [oyunBitti, mevcutTahmin, uzunluk]);

  // Harf sil
  const harfSil = useCallback(() => {
    if (oyunBitti) return;
    setMevcutTahmin(prev => prev.slice(0, -1));
  }, [oyunBitti]);

  // Tahmin gönder
  const tahminGonder = useCallback(() => {
    if (oyunBitti) return;
    if (mevcutTahmin.length !== uzunluk) {
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
      
      setTimeout(() => setSonucModalAcik(true), 1500);
    } else if (yeniTahminler.length >= 6) {
      const yeniIstatistik = kaybettiGuncelle();
      setIstatistik(yeniIstatistik);
      setOyunBitti(true);
      setKazandi(false);
      oyunSayisiArtir();
      
      setTimeout(() => setSonucModalAcik(true), 1500);
    }
  }, [oyunBitti, mevcutTahmin, uzunluk, hedefKelime, tahminler, sonuclar]);

  // Sanal klavye girişi
  const handleKlavye = useCallback((tus) => {
    if (tus === 'ENTER') {
      tahminGonder();
    } else if (tus === 'BACKSPACE') {
      harfSil();
    } else {
      harfEkle(tus);
    }
  }, [tahminGonder, harfSil, harfEkle]);

  // Uzunluk değişimi
  const handleUzunlukDegis = (yeniUzunluk) => {
    if (tahminler.length > 0) return;
    setUzunluk(yeniUzunluk);
    yeniOyunBaslat(yeniUzunluk);
  };

  // Paylaşım metni
  const getPaylasimMetni = () => {
    return paylasimMetni(tahminler, hedefKelime, oyunSayisi);
  };

  // Yeni oyun
  const handleYeniOyun = () => {
    yeniOyunBaslat(uzunluk);
  };

  if (!yuklendi) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="logo text-3xl animate-pulse">WORDLETR</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onBilgi={() => setBilgiModalAcik(true)}
        onIstatistik={() => {
          setIstatistik(istatistikGetir());
          setSonucModalAcik(true);
        }}
      />

      <main className="flex-1 flex flex-col items-center justify-between py-4 px-2 max-w-lg mx-auto w-full">
        {/* Uzunluk seçici */}
        <div className="mb-4">
          <UzunlukSecici
            mevcutUzunluk={uzunluk}
            uzunluklar={mevcutUzunluklar()}
            onChange={handleUzunlukDegis}
            devreDisi={tahminler.length > 0}
          />
        </div>

        {/* Oyun tahtası */}
        <div className="flex-1 flex items-center">
          <Tahta
            tahminler={tahminler}
            sonuclar={sonuclar}
            mevcutTahmin={mevcutTahmin}
            uzunluk={uzunluk}
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
    </div>
  );
}
