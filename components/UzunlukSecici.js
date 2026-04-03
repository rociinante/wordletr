'use client';

export default function UzunlukSecici({ mevcutUzunluk, uzunluklar, onChange, devreDisi = false }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm opacity-70 mr-2">Harf:</span>
      {uzunluklar.map((uzunluk) => (
        <button
          key={uzunluk}
          onClick={() => onChange(uzunluk)}
          disabled={devreDisi}
          className={`
            w-10 h-10 rounded-lg font-bold text-lg transition-all
            ${mevcutUzunluk === uzunluk 
              ? 'bg-blue-500 text-white scale-110' 
              : 'hover:bg-white/10'
            }
            ${devreDisi ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ 
            fontFamily: 'var(--font-display)',
            backgroundColor: mevcutUzunluk === uzunluk ? '' : 'var(--bg-tertiary)'
          }}
        >
          {uzunluk}
        </button>
      ))}
    </div>
  );
}
