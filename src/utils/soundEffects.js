// Web Audio API sound effects
let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Play a beep sound
export function playBeep(frequency = 800, duration = 100, volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (e) {
    console.log('Audio context not available');
  }
}

// Key press sound - short and light
export function playSoundKeyPress(volume = 0.2) {
  playBeep(600, 50, volume);
}

// Correct answer sound - ascending
export function playSoundCorrect(volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(volume, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.1);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.1);
    });
  } catch (e) {
    console.log('Audio context not available');
  }
}

// Wrong answer sound - low-pitched mirror of the keypress click
// Same sine/short style as playSoundKeyPress but at 200 Hz instead of 600 Hz
export function playSoundWrong(volume = 0.3) {
  playBeep(200, 80, volume);
}

// Tile flip sound - gentle pop
export function playSoundTileFlip(volume = 0.15) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {
    console.log('Audio context not available');
  }
}

// Win game sound - triumphant
export function playSoundWin(volume = 0.4) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(volume, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.15);
    });
  } catch (e) {
    console.log('Audio context not available');
  }
}

// Lose game sound - sad descending
export function playSoundLose(volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const frequencies = [349.23, 293.66, 246.94]; // F4, D4, B3
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(volume, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.15);
    });
  } catch (e) {
    console.log('Audio context not available');
  }
}

// Shake/error sound - same soft low tone as playSoundWrong
export function playSoundError(volume = 0.25) {
  playBeep(200, 80, volume);
}
