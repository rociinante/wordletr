'use client';

import { useState } from 'react';

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
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
            {baslik}
          </h2>
          <button 
            onClick={kapat}
            className="text-2xl opacity-60 hover:opacity-100 transition-opacity w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
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
  onYeniOyun,
  oyunBpiitti = true
}) {
  const [kopyalandi, setKopyalandi] = useState(false);

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
      {/* Sonuç mesajı - sadece oyun bittiyse göster */}
      {oyunBpiitti && (
        <div className="text-center">
          {kazandi ? (
            <>
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Tebrikler!
              </p>
              <p className="text-sm opacity-70 mt-1">{tahminSayisi}/6 tahminde bildin</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">😔</div>
              <p className="text-2xl font-bold">Maalesef!</p>
              <p className="text-sm opacity-70 mt-2">
                Doğru kelime: <span className="font-bold text-lg px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white ml-1">{hedefKelime}</span>
              </p>
            </>
          )}
        </div>
      )}

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
        <p className="text-sm font-semibold mb-3 uppercase tracking-wider opacity-70">Tahmin Dağılımı</p>
        {istatistik.dagilim.map((sayi, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="w-5 text-sm font-bold opacity-60">{index + 1}</span>
            <div 
              className="dagilim-bar flex items-center justify-end px-3 text-sm font-bold text-white"
              style={{ 
                width: `${Math.max((sayi / maxDagilim) * 100, 12)}%`,
              }}
            >
              {sayi}
            </div>
          </div>
        ))}
      </div>

      {/* Butonlar */}
      <div className="space-y-3 pt-2">
        {oyunBpiitti && (
          <button 
            onClick={handlePaylas}
            className="btn-primary w-full"
          >
            {kopyalandi ? '✓ Kopyalandı!' : 'Sonucu Paylaş 📤'}
          </button>
        )}
        
        {oyunBpiitti && onYeniOyun && (
          <button 
            onClick={onYeniOyun}
            className="yeni-oyun-btn w-full"
          >
            Yeni Oyun 🎮
          </button>
        )}
      </div>
    </div>
  );
}

// Nasıl oynanır içeriği
export function NasilOynanirIcerigi() {
  return (
    <div className="space-y-5 text-sm">
      <p className="text-base">
        Gizli kelimeyi <strong className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">6 tahmin</strong> hakkında bul!
      </p>
      
      <div className="space-y-3">
        <p className="font-semibold uppercase tracking-wider opacity-70 text-xs">Renkler ne anlama gelir?</p>
        
        <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="hucre dogru w-12 h-12 text-xl">A</div>
          <span>Harf <strong>doğru yerde</strong></span>
        </div>
        
        <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="hucre yerinde w-12 h-12 text-xl">B</div>
          <span>Harf var ama <strong>yanlış yerde</strong></span>
        </div>
        
        <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="hucre yok w-12 h-12 text-xl">C</div>
          <span>Harf kelimede <strong>yok</strong></span>
        </div>
      </div>

      <p className="opacity-60 text-center pt-2">
        ✨ Sınırsız oyun — istediğin kadar oyna!
      </p>
    </div>
  );
}
