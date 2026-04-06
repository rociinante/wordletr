// Ses efektleri sistemi - Web Audio API ile
// Harici dosya gerektirmez, programatik olarak ses üretir

let audioContext = null;
let sesAcik = true;

// Ses ayarını localStorage'dan al
export function sesAyariGetir() {
  if (typeof window === 'undefined') return true;
  const ayar = localStorage.getItem('wordletr_ses');
  return ayar !== 'false';
}

// Ses ayarını kaydet
export function sesAyariKaydet(acik) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('wordletr_ses', acik ? 'true' : 'false');
  sesAcik = acik;
}

// Audio context başlat
function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Temel ses çalma fonksiyonu
function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  if (!sesAyariGetir()) return;
  
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // Context suspended ise resume et
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

// Tuş sesi - KALDIRILDI (rahatsız edici)
export function tusSesi() {
  // Ses yok
}

// Silme sesi - KALDIRILDI
export function silSesi() {
  // Ses yok
}

// Enter sesi - hafif
export function enterSesi() {
  if (!sesAyariGetir()) return;
  playTone(500, 0.06, 'sine', 0.1);
}

// Hata sesi - yanlış kelime
export function hataSesi() {
  playTone(200, 0.15, 'sawtooth', 0.2);
  setTimeout(() => playTone(150, 0.15, 'sawtooth', 0.15), 100);
}

// Doğru harf sesi
export function dogruHarfSesi(index = 0) {
  const baseFreq = 523; // C5
  const freq = baseFreq * Math.pow(1.1, index);
  setTimeout(() => playTone(freq, 0.15, 'sine', 0.2), index * 100);
}

// Kazanma sesi - melodi
export function kazanmaSesi() {
  const melody = [523, 659, 784, 1047]; // C5, E5, G5, C6
  melody.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.25), i * 150);
  });
}

// Kaybetme sesi - üzgün melodi
export function kaybetmeSesi() {
  const melody = [392, 349, 330, 262]; // G4, F4, E4, C4
  melody.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.2), i * 200);
  });
}

// Seviye atlama sesi (merdiven modu)
export function seviyeSesi() {
  playTone(660, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(880, 0.15, 'sine', 0.25), 100);
}

// Rozet kazanma sesi
export function rozetSesi() {
  const melody = [784, 988, 1175, 1318]; // G5, B5, D6, E6
  melody.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, 'triangle', 0.3), i * 100);
  });
}

// İpucu sesi
export function ipucuSesi() {
  playTone(440, 0.1, 'sine', 0.15);
  setTimeout(() => playTone(554, 0.1, 'sine', 0.15), 80);
}

// Countdown sesi (son 10 saniye)
export function countdownSesi() {
  playTone(440, 0.08, 'square', 0.15);
}
