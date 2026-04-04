'use client';

import { useState, useEffect } from 'react';
import { temaToggle, temaGetir } from '../lib/depolama';

export default function Header({ onBilgi, onIstatistik, onLogoTikla, onLiderlik, onMeydanOkuma }) {
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
        <div className="flex items-center gap-2">
          <button 
            onClick={onLiderlik}
            className="header-btn"
            title="Liderlik Tablosu"
            aria-label="Liderlik Tablosu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
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
        <div className="flex items-center gap-2">
          <button 
            onClick={onBilgi}
            className="header-btn"
            title="Nasıl Oynanır?"
            aria-label="Nasıl Oynanır?"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </button>
          <button 
            onClick={handleTemaToggle}
            className="header-btn"
            title="Tema Değiştir"
            aria-label="Tema Değiştir"
          >
            {tema === 'dark' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2"/>
                <path d="M12 20v2"/>
                <path d="m4.93 4.93 1.41 1.41"/>
                <path d="m17.66 17.66 1.41 1.41"/>
                <path d="M2 12h2"/>
                <path d="M20 12h2"/>
                <path d="m6.34 17.66-1.41 1.41"/>
                <path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
