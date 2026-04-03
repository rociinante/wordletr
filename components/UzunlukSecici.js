'use client';

export default function UzunlukSecici({ mevcutUzunluk, uzunluklar, onChange, devreDisi = false }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-sm opacity-50 mr-1 uppercase tracking-wider">Harf</span>
      {uzunluklar.map((uzunluk) => (
        <button
          key={uzunluk}
          onClick={() => onChange(uzunluk)}
          disabled={devreDisi}
          className={`uzunluk-btn ${mevcutUzunluk === uzunluk ? 'active' : ''} ${devreDisi ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uzunluk}
        </button>
      ))}
    </div>
  );
}
