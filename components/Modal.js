'use client';

import { useState, useEffect } from 'react';
import { sesAyariGetir, sesAyariKaydet } from '../lib/ses';
import { temaRengiGetir, temaRengiDegistir, TEMA_RENKLERI } from '../lib/depolama';
import { gunlukSonucGetir, gunlukIstatistikGetir } from '../lib/kelimeSecici';

export default function Modal({ 
  acik, 
  kapat, 
  baslik, 
  children,
  tip = 'bilgi'
}) {
  if (!acik) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) kapat();
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
            {baslik}
          </h2>
          <button 
            onClick={kapat}
            className="text-2xl opacity-60 hover:opacity-100 transition-opacity w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Sonuç modalı içeriği
export function SonucIcerigi({ 
  kazandi, 
  hedefKelime, 
  tahminSayisi, 
  istatistik, 
  paylasimMetni,
  onYeniOyun,
  oyunBitti = true,
  mod = 'sinirsiz',
  timeAttackSkor = 0,
  merdivenSeviye = 4,
  yeniRozetler = []
}) {
  const [kopyalandi, setKopyalandi] = useState(false);

  const handlePaylas = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Wordletr',
          text: paylasimMetni
        });
      } else {
        await navigator.clipboard.writeText(paylasimMetni);
        setKopyalandi(true);
        setTimeout(() => setKopyalandi(false), 2000);
      }
    } catch (e) {
      console.error('Paylaşım hatası:', e);
    }
  };

  const kazanmaOrani = istatistik.oynanan > 0 
    ? Math.round((istatistik.kazanilan / istatistik.oynanan) * 100) 
    : 0;

  const maxDagilim = Math.max(...istatistik.dagilim, 1);

  return (
    <div className="space-y-6">
      {oyunBitti && (
        <div className="text-center">
          {mod === 'timeattack' ? (
            <>
              <div className="text-5xl mb-3">⏱️</div>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                Süre Doldu!
              </p>
              <p className="text-4xl font-bold mt-2">{timeAttackSkor} Kelime</p>
            </>
          ) : mod === 'merdiven' && kazandi ? (
            <>
              <div className="text-5xl mb-3">🪜</div>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Merdiveni Tamamladın!
              </p>
              <p className="text-sm opacity-70 mt-1">7 harfli kelimeyi bildin!</p>
            </>
          ) : kazandi ? (
            <>
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Tebrikler!
              </p>
              <p className="text-sm opacity-70 mt-1">{tahminSayisi}/6 tahminde bildin</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">😔</div>
              <p className="text-2xl font-bold">Maalesef!</p>
              <p className="text-sm opacity-70 mt-2">
                Doğru kelime: <span className="font-bold text-lg px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white ml-1">{hedefKelime}</span>
              </p>
            </>
          )}
        </div>
      )}

      {/* Yeni kazanılan rozetler */}
      {yeniRozetler.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
          <p className="text-sm font-semibold mb-3 text-center">🏅 Yeni Rozetler!</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {yeniRozetler.map((rozet, i) => (
              <div key={i} className="text-center">
                <span className="text-3xl">{rozet.emoji}</span>
                <p className="text-xs mt-1 font-medium">{rozet.isim}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        <div className="stat-card">
          <div className="stat-number">{istatistik.oynanan}</div>
          <div className="stat-label">Oynanan</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{kazanmaOrani}%</div>
          <div className="stat-label">Başarı</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{istatistik.seri}</div>
          <div className="stat-label">Seri</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{istatistik.enUzunSeri}</div>
          <div className="stat-label">En Uzun</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-semibold mb-3 uppercase tracking-wider opacity-70">Tahmin Dağılımı</p>
        {istatistik.dagilim.map((sayi, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="w-5 text-sm font-bold opacity-60">{index + 1}</span>
            <div 
              className="dagilim-bar flex items-center justify-end px-3 text-sm font-bold text-white"
              style={{ 
                width: `${Math.max((sayi / maxDagilim) * 100, 12)}%`,
              }}
            >
              {sayi}
            </div>
          </div>
        ))}
      </div>

      {/* Kelime Anlamı */}
      {oyunBitti && hedefKelime && (
        <KelimeAnlami kelime={hedefKelime} />
      )}

      <div className="space-y-3 pt-2">
        {oyunBitti && (
          <button 
            onClick={handlePaylas}
            className="btn-primary w-full"
          >
            {kopyalandi ? '✓ Kopyalandı!' : 'Sonucu Paylaş 📤'}
          </button>
        )}
        
        {oyunBitti && onYeniOyun && (
          <button 
            onClick={onYeniOyun}
            className="yeni-oyun-btn w-full"
          >
            Yeni Oyun 🎮
          </button>
        )}
      </div>
    </div>
  );
}

// Kelime Anlamı Bileşeni
function KelimeAnlami({ kelime }) {
  const [anlam, setAnlam] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(false);

  useEffect(() => {
    if (!kelime) return;

    const anlamGetir = async () => {
      setYukleniyor(true);
      setHata(false);

      try {
        // Önce localStorage'dan kontrol et (cache)
        const cacheKey = `wordletr_anlam_${kelime}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          setAnlam(JSON.parse(cached));
          setYukleniyor(false);
          return;
        }

        // API'den getir
        const response = await fetch('https://wordletr.com/api/anlam.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kelime })
        });

        if (!response.ok) throw new Error('API hatası');

        const data = await response.json();
        
        if (data.basarili) {
          setAnlam(data);
          // Cache'e kaydet (7 gün)
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } else {
          throw new Error('Anlam bulunamadı');
        }
      } catch (e) {
        console.warn('Kelime anlamı yüklenemedi:', e);
        setHata(true);
      } finally {
        setYukleniyor(false);
      }
    };

    anlamGetir();
  }, [kelime]);

  if (yukleniyor) {
    return (
      <div className="word-meaning animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-2/3"></div>
      </div>
    );
  }

  if (hata || !anlam) {
    return null; // Hata durumunda sessizce geç
  }

  return (
    <div className="word-meaning">
      <h4>{kelime}</h4>
      <p>{anlam.anlam}</p>
      {anlam.ornek && (
        <p className="example">"{anlam.ornek}"</p>
      )}
    </div>
  );
}

// Liderlik Tablosu İçeriği
export function LiderlikIcerigi({ liderlik, mevcutKullaniciId, kullaniciAdi, onAdDegistir }) {
  const [yeniAd, setYeniAd] = useState(kullaniciAdi);
  const [duzenle, setDuzenle] = useState(false);

  const handleKaydet = () => {
    if (yeniAd.trim()) {
      onAdDegistir(yeniAd.trim());
    }
    setDuzenle(false);
  };

  return (
    <div className="space-y-4">
      {/* Kullanıcı adı düzenleme */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
        <p className="text-xs uppercase tracking-wider opacity-60 mb-2">Kullanıcı Adın</p>
        {duzenle ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={yeniAd}
              onChange={(e) => setYeniAd(e.target.value)}
              maxLength={20}
              className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-purple-500 outline-none"
              placeholder="Kullanıcı adı..."
            />
            <button onClick={handleKaydet} className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold">
              ✓
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">{kullaniciAdi}</span>
            <button 
              onClick={() => setDuzenle(true)}
              className="px-3 py-1 rounded-lg text-sm opacity-70 hover:opacity-100 hover:bg-white/10"
            >
              ✏️ Düzenle
            </button>
          </div>
        )}
      </div>

      {/* Liderlik tablosu - Top 10 */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider opacity-60">🏆 Tüm Zamanların En İyileri</p>
        
        {liderlik.length === 0 ? (
          <p className="text-center opacity-50 py-4">Henüz kimse yok. İlk sen ol!</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {liderlik.slice(0, 10).map((oyuncu, index) => (
              <div 
                key={oyuncu.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  oyuncu.id === mevcutKullaniciId 
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 scale-[1.02]' 
                    : ''
                }`}
                style={{ background: oyuncu.id !== mevcutKullaniciId ? 'var(--bg-tertiary)' : undefined }}
              >
                <span className="text-2xl w-10 text-center">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {oyuncu.ad}
                    {oyuncu.id === mevcutKullaniciId && <span className="text-xs ml-2 opacity-60">(sen)</span>}
                  </p>
                  <p className="text-xs opacity-60">
                    %{oyuncu.oynanan > 0 ? Math.round((oyuncu.kazanilan / oyuncu.oynanan) * 100) : 0} başarı • En uzun seri: {oyuncu.enUzunSeri}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl" style={{ color: 'var(--accent)' }}>{oyuncu.puan}</p>
                  <p className="text-xs opacity-60">puan</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-center opacity-40 mt-4">
          🌐 Global liderlik tablosu
        </p>
      </div>
    </div>
  );
}

// Nasıl oynanır içeriği
export function NasilOynanirIcerigi() {
  return (
    <div className="space-y-5 text-sm">
      <p className="text-base">
        Gizli kelimeyi <strong className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">6 tahmin</strong> hakkında bul!
      </p>
      
      <div className="space-y-3">
        <p className="font-semibold uppercase tracking-wider opacity-70 text-xs">Renkler ne anlama gelir?</p>
        
        <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="hucre dogru w-12 h-12 text-xl">A</div>
          <span>Harf <strong>doğru yerde</strong></span>
        </div>
        
        <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="hucre yerinde w-12 h-12 text-xl">B</div>
          <span>Harf var ama <strong>yanlış yerde</strong></span>
        </div>
        
        <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="hucre yok w-12 h-12 text-xl">C</div>
          <span>Harf kelimede <strong>yok</strong></span>
        </div>
      </div>

      <div className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
        <p className="font-semibold text-xs uppercase tracking-wider opacity-70 mb-2">🎮 Oyun Modları</p>
        <div className="space-y-1 text-xs opacity-80">
          <p>♾️ <strong>Sınırsız:</strong> İstediğin kadar oyna</p>
          <p>🔥 <strong>Zor:</strong> Bulunan harfleri kullanmak zorunlu</p>
          <p>⏱️ <strong>Time Attack:</strong> 5 dk'da en fazla kelime</p>
          <p>🪜 <strong>Merdiven:</strong> 4→7 harf, yanılırsan başa dön</p>
          <p>💀 <strong>Survival:</strong> Doğru harfte +süre kazan</p>
          <p>🙈 <strong>Kör:</strong> Renkler yok, sadece sayılar</p>
        </div>
      </div>

      <p className="opacity-60 text-center pt-2">
        ✨ Arkadaşlarına meydan oku, sınırlarını zorla!
      </p>
    </div>
  );
}

// Kategori Seçici İçeriği
export function KategoriSeciciIcerigi({ kategoriler, mevcutKategori, onKategoriSec }) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wider opacity-60 mb-4">Bir kategori seç</p>
      
      <div className="grid gap-3">
        {Object.entries(kategoriler).map(([key, kategori]) => (
          <button
            key={key}
            onClick={() => onKategoriSec(key)}
            className={`p-4 rounded-xl text-left transition-all ${
              mevcutKategori === key 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'hover:scale-102'
            }`}
            style={{ 
              background: mevcutKategori !== key ? 'var(--bg-tertiary)' : undefined,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{kategori.emoji}</span>
              <div>
                <p className="font-bold">{kategori.isim}</p>
                <p className="text-xs opacity-70">{kategori.aciklama}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Mod Seçici İçeriği
export function ModSeciciIcerigi({ modlar, mevcutMod, onModSec, gunlukOynandi = false }) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wider opacity-60 mb-4">Bir mod seç</p>
      
      <div className="grid gap-3">
        {Object.entries(modlar).map(([key, mod]) => {
          const gunlukTamamlandi = key === 'gunluk' && gunlukOynandi;
          
          return (
            <button
              key={key}
              onClick={() => onModSec(key)}
              disabled={gunlukTamamlandi}
              className={`p-4 rounded-xl text-left transition-all ${
                mevcutMod === key 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : gunlukTamamlandi
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-102'
              }`}
              style={{ 
                background: mevcutMod !== key ? 'var(--bg-tertiary)' : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{gunlukTamamlandi ? '✅' : mod.emoji}</span>
                <div>
                  <p className="font-bold">
                    {mod.isim}
                    {gunlukTamamlandi && <span className="text-xs ml-2 opacity-70">(Bugün oynandı)</span>}
                  </p>
                  <p className="text-xs opacity-70">{mod.aciklama}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Meydan Okuma İçeriği
export function MeydanOkumaIcerigi({ onLinkOlustur }) {
  const [kelime, setKelime] = useState('');
  const [olusturulanLink, setOlusturulanLink] = useState('');
  const [kopyalandi, setKopyalandi] = useState(false);

  const handleOlustur = () => {
    if (kelime.trim().length >= 4 && kelime.trim().length <= 7) {
      const link = onLinkOlustur(kelime.trim().toUpperCase());
      setOlusturulanLink(link);
    }
  };

  const handleKopyala = async () => {
    try {
      await navigator.clipboard.writeText(olusturulanLink);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch (e) {
      console.error('Kopyalama hatası:', e);
    }
  };

  const handleWhatsApp = () => {
    const mesaj = `🎯 Wordletr Meydan Okuma!\n\nBenim kelimemi bulabilecek misin?\n\n${olusturulanLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(mesaj)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm opacity-80">
        Arkadaşlarına meydan oku! Bir kelime belirle, link oluştur ve paylaş.
      </p>

      <div className="space-y-3">
        <input
          type="text"
          value={kelime}
          onChange={(e) => {
            setKelime(e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, ''));
            setOlusturulanLink('');
          }}
          maxLength={7}
          className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500 outline-none text-center text-2xl font-bold uppercase tracking-widest"
          placeholder="KELİME"
        />
        
        <p className="text-xs text-center opacity-60">
          4-7 harf arası bir kelime gir
        </p>

        {!olusturulanLink ? (
          <button 
            onClick={handleOlustur}
            disabled={kelime.trim().length < 4}
            className={`btn-primary w-full ${kelime.trim().length < 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Link Oluştur 🔗
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-xl text-xs break-all" style={{ background: 'var(--bg-tertiary)' }}>
              {olusturulanLink}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleKopyala}
                className="btn-primary"
              >
                {kopyalandi ? '✓ Kopyalandı!' : 'Kopyala 📋'}
              </button>
              
              <button 
                onClick={handleWhatsApp}
                className="yeni-oyun-btn flex items-center justify-center gap-2"
              >
                WhatsApp 📱
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Rozetler içeriği
export function RozetlerIcerigi({ rozetler }) {
  const kazanilanlar = rozetler.filter(r => r.kazanildi);
  const kazanilmayanlar = rozetler.filter(r => !r.kazanildi && !r.gizli);
  const gizliKazanilanlar = rozetler.filter(r => r.kazanildi && r.gizli);
  
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="text-center">
        <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            {kazanilanlar.length}
          </span>
          <span className="opacity-40 text-2xl"> / {rozetler.length}</span>
        </div>
        <p className="text-sm opacity-60 mt-1">rozet kazanıldı</p>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
          <div 
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${(kazanilanlar.length / rozetler.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Kazanılan rozetler */}
      {kazanilanlar.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider opacity-60 mb-3">✨ Kazanılan</p>
          <div className="grid grid-cols-3 gap-3">
            {kazanilanlar.map(rozet => (
              <div 
                key={rozet.id}
                className="p-3 rounded-xl text-center transition-transform hover:scale-105"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <span className="text-3xl">{rozet.emoji}</span>
                <p className="text-xs font-semibold mt-2 truncate">{rozet.isim}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kazanılmayan rozetler */}
      {kazanilmayanlar.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider opacity-60 mb-3">🔒 Kilitli</p>
          <div className="grid grid-cols-3 gap-3">
            {kazanilmayanlar.map(rozet => (
              <div 
                key={rozet.id}
                className="p-3 rounded-xl text-center opacity-40"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <span className="text-3xl grayscale">🔒</span>
                <p className="text-xs font-semibold mt-2 truncate">{rozet.isim}</p>
                <p className="text-[10px] opacity-60 mt-1">{rozet.aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gizli rozetler ipucu */}
      <p className="text-xs text-center opacity-40">
        🔮 {rozetler.filter(r => r.gizli && !r.kazanildi).length} gizli rozet keşfedilmeyi bekliyor
      </p>
    </div>
  );
}

// Ayarlar içeriği
export function AyarlarIcerigi() {
  const [ses, setSes] = useState(true);
  const [renk, setRenk] = useState('varsayilan');

  useEffect(() => {
    setSes(sesAyariGetir());
    setRenk(temaRengiGetir());
  }, []);

  const handleSesToggle = () => {
    const yeni = !ses;
    setSes(yeni);
    sesAyariKaydet(yeni);
  };

  const handleRenkDegistir = (yeniRenk) => {
    setRenk(yeniRenk);
    temaRengiDegistir(yeniRenk);
  };

  return (
    <div className="space-y-6">
      {/* Ses */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{ses ? '🔊' : '🔇'}</span>
          <div>
            <p className="font-semibold">Ses Efektleri</p>
            <p className="text-xs opacity-60">Tuş ve bildirim sesleri</p>
          </div>
        </div>
        <button 
          onClick={handleSesToggle}
          className={`w-14 h-8 rounded-full transition-all ${ses ? 'bg-green-500' : 'bg-gray-500'}`}
        >
          <div className={`w-6 h-6 bg-white rounded-full transition-transform ${ses ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Tema Rengi */}
      <div>
        <p className="text-sm font-semibold mb-3">🎨 Tema Rengi</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(TEMA_RENKLERI).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleRenkDegistir(key)}
              className={`p-3 rounded-xl transition-all ${renk === key ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'}`}
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <span className="text-2xl">{value.emoji}</span>
              <p className="text-xs mt-1">{value.isim}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Versiyon */}
      <p className="text-xs text-center opacity-40">
        Wordletr v5.0 • Made with 💜
      </p>
    </div>
  );
}

// Günlük Challenge içeriği
export function GunlukIcerigi() {
  const sonuc = gunlukSonucGetir();
  const ist = gunlukIstatistikGetir();

  if (!sonuc) {
    return (
      <div className="text-center py-8">
        <span className="text-6xl">📅</span>
        <p className="mt-4 font-semibold">Bugünkü challenge henüz oynanmadı!</p>
        <p className="text-sm opacity-60 mt-2">Mod seçiciden "Günlük" modunu seç ve oyna.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bugünün sonucu */}
      <div className="text-center p-6 rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>
        <span className="text-5xl">{sonuc.kazandi ? '🎉' : '😔'}</span>
        <p className="mt-3 font-bold text-xl">
          {sonuc.kazandi ? `${sonuc.tahminSayisi}/6 Tahminde Bildin!` : 'Yarın Tekrar Dene!'}
        </p>
        <p className="text-sm opacity-60 mt-2">
          Kelime: <strong>{sonuc.kelime}</strong>
        </p>
      </div>

      {/* Günlük istatistikler */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card">
          <p className="stat-number">{ist.oynanan}</p>
          <p className="stat-label">Oynanan</p>
        </div>
        <div className="stat-card">
          <p className="stat-number">{ist.kazanilan}</p>
          <p className="stat-label">Kazanılan</p>
        </div>
        <div className="stat-card">
          <p className="stat-number">{ist.seri}</p>
          <p className="stat-label">Günlük Seri</p>
        </div>
      </div>

      <p className="text-xs text-center opacity-40">
        🔄 Yeni kelime her gece 00:00'da
      </p>
    </div>
  );
}
