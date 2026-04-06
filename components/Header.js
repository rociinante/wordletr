'use client';

import { useState, useEffect } from 'react';
import { temaToggle, temaGetir } from '../lib/depolama';

export default function Header({ 
  onBilgi, 
  onIstatistik, 
  onLogoTikla, 
  onLiderlik, 
  onMeydanOkuma,
  onRozetler,
  onAyarlar,
  rozetSayisi = '0/0'
}) {
  const [tema, setTema] = useState('dark');

  useEffect(() => {
    setTema(temaGetir());
  }, []);

  const handleTemaToggle = () => {
    const yeniTema = temaToggle();
    setTema(yeniTema);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Sol taraf */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onLiderlik}
            className="header-btn"
            title="Liderlik Tablosu"
            aria-label="Liderlik Tablosu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
          </button>
          <button 
            onClick={onMeydanOkuma}
            className="header-btn"
            title="Meydan Okuma"
            aria-label="Meydan Okuma"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </button>
          <button 
            onClick={onRozetler}
            className="header-btn relative"
            title="Rozetler"
            aria-label="Rozetler"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
            <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              {rozetSayisi.split('/')[0]}
            </span>
          </button>
        </div>

        {/* Logo */}
        <button 
          onClick={onLogoTikla}
          className="logo"
          title="Yeni oyun başlat"
          aria-label="Yeni oyun başlat"
        >
          WORDLETR
        </button>

        {/* Sağ taraf */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onBilgi}
            className="header-btn"
            title="Nasıl Oynanır?"
            aria-label="Nasıl Oynanır?"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
          </button>
          <button 
            onClick={onIstatistik}
            className="header-btn"
            title="İstatistikler"
            aria-label="İstatistikler"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </button>
          <button 
            onClick={onAyarlar}
            className="header-btn"
            title="Ayarlar"
            aria-label="Ayarlar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
