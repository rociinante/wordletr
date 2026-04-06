'use client';

// Türkçe klavye düzeni - İ harfi ayrı tuş olarak
const TURKCE_SATIRLAR = [
  ['E', 'R', 'T', 'Y', 'U', 'I', 'İ', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş'],
  ['ENTER', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'BACKSPACE']
];

// İngilizce klavye düzeni
const INGILIZCE_SATIRLAR = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

// Türkçe özel harfler
const TURKCE_OZEL = ['Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü'];

export default function Klavye({ onTus, harfDurumlari = {}, ingilizce = false }) {
  const satirlar = ingilizce ? INGILIZCE_SATIRLAR : TURKCE_SATIRLAR;

  const tusDurumu = (tus) => {
    if (tus === 'ENTER' || tus === 'BACKSPACE') return '';
    return harfDurumlari[tus] || '';
  };

  const turkceOzelMi = (tus) => {
    return !ingilizce && TURKCE_OZEL.includes(tus);
  };

  // Harf gösterimi
  const harfGoster = (tus) => {
    if (tus === 'BACKSPACE') return '⌫';
    if (tus === 'ENTER') return '↵';
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
                  minWidth: ozelTus ? '65px' : '30px',
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
