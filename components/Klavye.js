'use client';

const KLAVYE_SATIRLARI = [
  ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['ENTER', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', '⌫']
];

export default function Klavye({ onTus, harfDurumlari = {} }) {
  const handleClick = (tus) => {
    if (tus === '⌫') {
      onTus('BACKSPACE');
    } else {
      onTus(tus);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 w-full max-w-lg mx-auto px-1">
      {KLAVYE_SATIRLARI.map((satir, satirIndex) => (
        <div key={satirIndex} className="flex gap-1 sm:gap-1.5 justify-center">
          {satir.map((tus) => {
            const durum = harfDurumlari[tus] || '';
            const ozelTus = tus === 'ENTER' || tus === '⌫';
            
            return (
              <button
                key={tus}
                onClick={() => handleClick(tus)}
                className={`tus ${durum} ${ozelTus ? 'ozel' : ''}`}
              >
                {tus}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
