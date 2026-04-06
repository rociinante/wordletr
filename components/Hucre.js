'use client';

import { useEffect, useState } from 'react';

export default function Hucre({ harf, durum, index, animasyonGecikme = 0 }) {
  const [gosterilecekDurum, setGosterilecekDurum] = useState(null);
  const [animasyonBasladi, setAnimasyonBasladi] = useState(false);

  useEffect(() => {
    if (durum && durum !== 'bos') {
      const timer = setTimeout(() => {
        setAnimasyonBasladi(true);
        setTimeout(() => {
          setGosterilecekDurum(durum);
        }, 200);
      }, animasyonGecikme);

      return () => clearTimeout(timer);
    } else {
      setAnimasyonBasladi(false);
      setGosterilecekDurum(null);
    }
  }, [durum, animasyonGecikme]);

  // Class'ları oluştur
  const classes = ['hucre'];
  
  if (harf) {
    classes.push('dolu');
  }
  
  if (gosterilecekDurum) {
    classes.push(gosterilecekDurum);
  }

  // I ve İ harflerini özel göster
  const harfGoster = () => {
    if (!harf) return '';
    
    // I harfi (noktasız) - altında küçük çizgi
    if (harf === 'I') {
      return (
        <span className="flex flex-col items-center leading-none">
          <span className="text-[26px]">I</span>
          <span className="text-[8px] -mt-1 opacity-70">▬</span>
        </span>
      );
    }
    
    // İ harfi (noktalı) - üstünde belirgin nokta
    if (harf === 'İ') {
      return (
        <span className="flex flex-col items-center leading-none">
          <span className="text-[10px] -mb-1">●</span>
          <span className="text-[26px]">I</span>
        </span>
      );
    }
    
    return harf;
  };

  return (
    <div 
      className={classes.join(' ')}
      style={{ 
        animationDelay: animasyonBasladi ? `${animasyonGecikme}ms` : '0ms'
      }}
    >
      {harfGoster()}
    </div>
  );
}
