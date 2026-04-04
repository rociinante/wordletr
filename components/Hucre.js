'use client';

import { useEffect, useState } from 'react';

export default function Hucre({ harf, durum, index, animasyonGecikme = 0 }) {
  const [gosterilecekDurum, setGosterilecekDurum] = useState(null);
  const [animasyonBasladi, setAnimasyonBasladi] = useState(false);

  useEffect(() => {
    if (durum && durum !== 'bos') {
      // Animasyon gecikmesi
      const timer = setTimeout(() => {
        setAnimasyonBasladi(true);
        // Animasyonun ortasında rengi değiştir
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

  return (
    <div 
      className={classes.join(' ')}
      style={{ 
        animationDelay: animasyonBasladi ? `${animasyonGecikme}ms` : '0ms'
      }}
    >
      {harf || ''}
    </div>
  );
}
