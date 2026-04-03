'use client';

import Hucre from './Hucre';

export default function Tahta({ 
  tahminler, 
  sonuclar, 
  mevcutTahmin, 
  uzunluk,
  satirSayisi = 6,
  sallanim = false
}) {
  // Satırları oluştur
  const satirlar = [];

  for (let i = 0; i < satirSayisi; i++) {
    const harfler = [];
    let satirDurumlari = null;
    let satirMetni = '';

    if (i < tahminler.length) {
      // Tamamlanmış tahmin
      satirMetni = tahminler[i];
      satirDurumlari = sonuclar[i];
    } else if (i === tahminler.length) {
      // Mevcut tahmin
      satirMetni = mevcutTahmin;
    }

    for (let j = 0; j < uzunluk; j++) {
      const harf = satirMetni[j] || '';
      const durum = satirDurumlari ? satirDurumlari[j] : null;
      const animasyonGecikme = satirDurumlari ? j * 100 : 0;

      harfler.push(
        <Hucre
          key={`${i}-${j}`}
          harf={harf}
          durum={durum}
          index={j}
          animasyonGecikme={animasyonGecikme}
        />
      );
    }

    const satirAnimasyonu = sallanim && i === tahminler.length ? 'animate-shake' : '';

    satirlar.push(
      <div 
        key={i} 
        className={`flex gap-1.5 sm:gap-2 justify-center ${satirAnimasyonu}`}
      >
        {harfler}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 p-2">
      {satirlar}
    </div>
  );
}
