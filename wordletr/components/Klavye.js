'use client';

// Türkçe klavye düzeni - I ve İ ayrı ve belirgin
const TURKCE_SATIRLAR = [
  ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['ENTER', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'BACKSPACE']
];

// İngilizce klavye düzeni
const INGILIZCE_SATIRLAR = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

// Türkçe özel harfler (vurgulanacak)
const TURKCE_OZEL = ['Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü', 'I'];

export default function Klavye({ onTus, harfDurumlari = {}, ingilizce = false }) {
  const satirlar = ingilizce ? INGILIZCE_SATIRLAR : TURKCE_SATIRLAR;

  const tusDurumu = (tus) => {
    if (tus === 'ENTER' || tus === 'BACKSPACE') return '';
    return harfDurumlari[tus] || '';
  };

  const turkceOzelMi = (tus) => {
    return !ingilizce && TURKCE_OZEL.includes(tus);
  };

  // I ve İ için özel gösterim
  const harfGoster = (tus) => {
    if (tus === 'BACKSPACE') return '⌫';
    if (tus === 'ENTER') return '↵';
    
    // I harfi için altına çizgi ekle (noktasız olduğunu göstermek için)
    if (tus === 'I' && !ingilizce) {
      return (
        <span className="flex flex-col items-center leading-none">
          <span>I</span>
          <span className="text-[8px] opacity-60 -mt-1">ı</span>
        </span>
      );
    }
    
    // İ harfi için üstte nokta vurgula
    if (tus === 'İ') {
      return (
        <span className="flex flex-col items-center leading-none">
          <span className="text-[8px] opacity-80">•</span>
          <span className="-mt-1">I</span>
        </span>
      );
    }
    
    return tus;
  };

  return (
    <div className="klavye">
      {satirlar.map((satir, satirIndex) => (
        <div key={satirIndex} className="klavye-satir">
          {satir.map((tus) => {
            const durum = tusDurumu(tus);
            const ozelTus = tus === 'ENTER' || tus === 'BACKSPACE';
            const turkceOzel = turkceOzelMi(tus);
            
            return (
              <button
                key={tus}
                onClick={() => onTus(tus)}
                className={`klavye-tus ${durum} ${ozelTus ? 'ozel' : ''} ${turkceOzel ? 'turkce-ozel' : ''}`}
                style={{
                  minWidth: ozelTus ? '70px' : turkceOzel ? '36px' : '34px',
                }}
              >
                {harfGoster(tus)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
