'use client';

// Türkçe klavye düzeni
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

export default function Klavye({ onTus, harfDurumlari = {}, ingilizce = false }) {
  const satirlar = ingilizce ? INGILIZCE_SATIRLAR : TURKCE_SATIRLAR;

  const tusDurumu = (tus) => {
    if (tus === 'ENTER' || tus === 'BACKSPACE') return '';
    return harfDurumlari[tus] || '';
  };

  return (
    <div className="klavye">
      {satirlar.map((satir, satirIndex) => (
        <div key={satirIndex} className="klavye-satir">
          {satir.map((tus) => {
            const durum = tusDurumu(tus);
            const ozelTus = tus === 'ENTER' || tus === 'BACKSPACE';
            
            return (
              <button
                key={tus}
                onClick={() => onTus(tus)}
                className={`klavye-tus ${durum} ${ozelTus ? 'ozel' : ''}`}
                style={{
                  minWidth: ozelTus ? '65px' : '32px',
                }}
              >
                {tus === 'BACKSPACE' ? '⌫' : tus === 'ENTER' ? '↵' : tus}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
