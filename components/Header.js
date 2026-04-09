'use client';

import { useState } from 'react';

export default function Header({ 
  onBilgi, 
  onIstatistik, 
  onLogoTikla, 
  onLiderlik, 
  onMeydanOkuma,
  onRozetler,
  onAyarlar,
  rozetSayisi = '0/0',
  istatistik = {}
}) {
  const [menuAcik, setMenuAcik] = useState(false);

  const seri = istatistik?.seri || 0;

  return (
    <>
      {/* Ana Header */}
      <header className="header">
        <div className="header-content">
          {/* Sol - Seri göstergesi */}
          <div className="header-streak" onClick={onIstatistik}>
            <span className="streak-fire">🔥</span>
            <span className="streak-count">{seri}</span>
          </div>

          {/* Orta - Logo */}
          <button className="logo" onClick={onLogoTikla}>
            <span className="logo-main">İYİKELİME</span>
            <span className="logo-dot">.COM</span>
          </button>

          {/* Sağ - Menü butonu */}
          <button 
            className={`hamburger ${menuAcik ? 'aktif' : ''}`}
            onClick={() => setMenuAcik(!menuAcik)}
            aria-label="Menü"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Slide Menu Overlay */}
      <div 
        className={`menu-overlay ${menuAcik ? 'aktif' : ''}`} 
        onClick={() => setMenuAcik(false)}
      >
        <nav 
          className={`slide-menu ${menuAcik ? 'aktif' : ''}`} 
          onClick={e => e.stopPropagation()}
        >
          {/* Menü Header */}
          <div className="menu-header">
            <div className="menu-logo">
              <span className="menu-logo-main">İYİKELİME.COM</span>
              <span className="menu-logo-sub">TÜRKÇE KELİME OYUNU</span>
            </div>
            <button className="menu-close" onClick={() => setMenuAcik(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Menü İçerik */}
          <div className="menu-body">
            {/* Profil/Stats Kartı */}
            <div className="menu-profile" onClick={() => { onIstatistik(); setMenuAcik(false); }}>
              <div className="profile-avatar">
                <span>🎮</span>
              </div>
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="stat-value">{istatistik?.toplam || 0}</span>
                  <span className="stat-label">Oyun</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-value">{istatistik?.kazanilan || 0}</span>
                  <span className="stat-label">Kazanma</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-value">{seri}</span>
                  <span className="stat-label">🔥 Seri</span>
                </div>
              </div>
            </div>

            {/* Menü Öğeleri */}
            <div className="menu-section">
              <button className="menu-item" onClick={() => { onMeydanOkuma(); setMenuAcik(false); }}>
                <div className="menu-item-icon gradient-daily">📅</div>
                <div className="menu-item-content">
                  <span className="menu-item-title">Günlük Meydan Okuma</span>
                  <span className="menu-item-desc">Her gün yeni kelime</span>
                </div>
                <span className="menu-item-arrow">→</span>
              </button>

              <button className="menu-item" onClick={() => { onLiderlik(); setMenuAcik(false); }}>
                <div className="menu-item-icon gradient-gold">🏆</div>
                <div className="menu-item-content">
                  <span className="menu-item-title">Liderlik Tablosu</span>
                  <span className="menu-item-desc">En iyilerle yarış</span>
                </div>
                <span className="menu-item-arrow">→</span>
              </button>

              <button className="menu-item" onClick={() => { onRozetler(); setMenuAcik(false); }}>
                <div className="menu-item-icon gradient-purple">🎖️</div>
                <div className="menu-item-content">
                  <span className="menu-item-title">Rozetler</span>
                  <span className="menu-item-desc">{rozetSayisi} kazanıldı</span>
                </div>
                <span className="menu-item-arrow">→</span>
              </button>
            </div>

            <div className="menu-divider"></div>

            <div className="menu-section">
              <button className="menu-item" onClick={() => { onAyarlar(); setMenuAcik(false); }}>
                <div className="menu-item-icon">⚙️</div>
                <div className="menu-item-content">
                  <span className="menu-item-title">Ayarlar</span>
                  <span className="menu-item-desc">Ses, tema ve daha fazlası</span>
                </div>
                <span className="menu-item-arrow">→</span>
              </button>

              <button className="menu-item" onClick={() => { onBilgi(); setMenuAcik(false); }}>
                <div className="menu-item-icon">❓</div>
                <div className="menu-item-content">
                  <span className="menu-item-title">Nasıl Oynanır</span>
                  <span className="menu-item-desc">Kurallar ve ipuçları</span>
                </div>
                <span className="menu-item-arrow">→</span>
              </button>
            </div>
          </div>

          {/* Menü Footer */}
          <div className="menu-footer">
            <span>iyikelime.com</span>
          </div>
        </nav>
      </div>
    </>
  );
}
