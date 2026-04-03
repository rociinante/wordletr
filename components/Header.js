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
        {/* Sol taraf - Liderlik ve Meydan Okuma */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onLiderlik}
            className="header-btn"
            title="Liderlik Tablosu"
          >
            🏆
          </button>
          <button 
            onClick={onMeydanOkuma}
            className="header-btn"
            title="Meydan Okuma"
          >
            🎯
          </button>
        </div>

        {/* Logo */}
        <button 
          onClick={onLogoTikla}
          className="logo hover:scale-105 transition-transform cursor-pointer"
          title="Yeni oyun başlat"
        >
          WORDLETR
        </button>

        {/* Sağ taraf - Butonlar */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onBilgi}
            className="header-btn"
            title="Nasıl Oynanır?"
          >
            ❓
          </button>
          <button 
            onClick={onIstatistik}
            className="header-btn"
            title="İstatistikler"
          >
            📊
          </button>
          <button 
            onClick={handleTemaToggle}
            className="header-btn"
            title="Tema Değiştir"
          >
            {tema === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}
