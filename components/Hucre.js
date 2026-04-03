'use client';

import { useEffect, useState } from 'react';

export default function Hucre({ harf, durum, index, animasyonGecikme = 0 }) {
  const [animasyonlu, setAnimasyonlu] = useState(false);
  const [gosterilecekDurum, setGosterilecekDurum] = useState(null);

  useEffect(() => {
    if (durum) {
      // Flip animasyonu için gecikme
      const timer = setTimeout(() => {
        setAnimasyonlu(true);
        setTimeout(() => {
          setGosterilecekDurum(durum);
        }, 250); // Animasyonun yarısında renk değiştir
      }, animasyonGecikme);

      return () => clearTimeout(timer);
    } else {
      setAnimasyonlu(false);
      setGosterilecekDurum(null);
    }
  }, [durum, animasyonGecikme]);

  const durumClass = gosterilecekDurum || '';
  const doluClass = harf ? 'dolu' : '';
  const flipClass = animasyonlu ? 'animate-flip' : '';

  return (
    <div 
      className={`hucre ${durumClass} ${doluClass} ${flipClass}`}
      style={{ 
        animationDelay: `${animasyonGecikme}ms`,
        perspective: '1000px'
      }}
    >
      {harf || ''}
    </div>
  );
}
