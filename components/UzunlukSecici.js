'use client';

export default function UzunlukSecici({ secili, uzunluklar = [4, 5, 6, 7], onChange, devreDisi = false }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {uzunluklar.map((uzunluk) => (
        <button
          key={uzunluk}
          onClick={() => onChange(uzunluk)}
          disabled={devreDisi}
          className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${
            secili === uzunluk 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110' 
              : 'hover:scale-105'
          } ${devreDisi ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ 
            background: secili !== uzunluk ? 'var(--bg-secondary)' : undefined,
            border: '1px solid var(--border-color)'
          }}
        >
          {uzunluk}
        </button>
      ))}
    </div>
  );
}
