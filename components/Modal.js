'use client';

import { useEffect, useState } from 'react';
import { sonrakiKelimeyeKalan } from '../lib/kelimeSecici';

export default function Modal({ 
  acik, 
  kapat, 
  baslik, 
  children,
  tip = 'bilgi' // 'bilgi', 'sonuc', 'ayar'
}) {
  if (!acik) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) kapat();
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {baslik}
          </h2>
          <button 
            onClick={kapat}
            className="text-2xl opacity-60 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Sonuç modalı içeriği
export function SonucIcerigi({ 
  kazandi, 
  hedefKelime, 
  tahminSayisi, 
  istatistik, 
  paylasimMetni,
  onPaylasim 
}) {
  const [kalan, setKalan] = useState(sonrakiKelimeyeKalan());
  const [kopyalandi, setKopyalandi] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setKalan(sonrakiKelimeyeKalan());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePaylas = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Wordletr',
          text: paylasimMetni
        });
      } else {
        await navigator.clipboard.writeText(paylasimMetni);
        setKopyalandi(true);
        setTimeout(() => setKopyalandi(false), 2000);
      }
    } catch (e) {
      console.error('Paylaşım hatası:', e);
    }
  };

  const kazanmaOrani = istatistik.oynanan > 0 
    ? Math.round((istatistik.kazanilan / istatistik.oynanan) * 100) 
    : 0;

  const maxDagilim = Math.max(...istatistik.dagilim, 1);

  return (
    <div className="space-y-6">
      {/* Sonuç mesajı */}
      <div className="text-center">
        {kazandi ? (
          <>
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-lg font-semibold">Tebrikler!</p>
            <p className="text-sm opacity-70">{tahminSayisi}/6 tahminde bildin</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-2">😔</div>
            <p className="text-lg font-semibold">Maalesef!</p>
            <p className="text-sm opacity-70">
              Doğru kelime: <span className="font-bold">{hedefKelime}</span>
            </p>
          </>
        )}
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-4 gap-2">
        <div className="stat-card">
          <div className="stat-number">{istatistik.oynanan}</div>
          <div className="stat-label">Oynanan</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{kazanmaOrani}%</div>
          <div className="stat-label">Başarı</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{istatistik.seri}</div>
          <div className="stat-label">Seri</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{istatistik.enUzunSeri}</div>
          <div className="stat-label">En Uzun</div>
        </div>
      </div>

      {/* Tahmin dağılımı */}
      <div className="space-y-1.5">
        <p className="text-sm font-semibold mb-2">Tahmin Dağılımı</p>
        {istatistik.dagilim.map((sayi, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-4 text-sm font-medium">{index + 1}</span>
            <div 
              className="dagilim-bar flex items-center justify-end px-2 text-sm font-bold text-white"
              style={{ 
                width: `${Math.max((sayi / maxDagilim) * 100, 10)}%`,
              }}
            >
              {sayi}
            </div>
          </div>
        ))}
      </div>

      {/* Sonraki kelime sayacı */}
      <div className="text-center py-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <p className="text-sm opacity-70 mb-1">Sonraki kelime</p>
        <p className="saatli-sayi text-2xl font-bold">
          {String(kalan.saat).padStart(2, '0')}:
          {String(kalan.dakika).padStart(2, '0')}:
          {String(kalan.saniye).padStart(2, '0')}
        </p>
      </div>

      {/* Paylaş butonu */}
      <button 
        onClick={handlePaylas}
        className="btn-primary w-full"
      >
        {kopyalandi ? '✓ Kopyalandı!' : 'Sonucu Paylaş 📤'}
      </button>
    </div>
  );
}

// Nasıl oynanır içeriği
export function NasilOynanirIcerigi() {
  return (
    <div className="space-y-4 text-sm">
      <p>
        Günün gizli kelimesini <strong>6 tahmin</strong> hakkında bul!
      </p>
      
      <div className="space-y-2">
        <p className="font-semibold">Renkler ne anlama gelir?</p>
        
        <div className="flex items-center gap-3">
          <div className="hucre dogru w-10 h-10 text-lg">A</div>
          <span>Harf doğru yerde</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hucre yerinde w-10 h-10 text-lg">B</div>
          <span>Harf var ama yanlış yerde</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hucre yok w-10 h-10 text-lg">C</div>
          <span>Harf kelimede yok</span>
        </div>
      </div>

      <p className="opacity-70">
        Her gün gece yarısı yeni bir kelime gelir. Herkes aynı kelimeyi tahmin eder!
      </p>
    </div>
  );
}
