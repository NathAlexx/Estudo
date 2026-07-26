"use client";

export function useTimerSound() {
  function playTone(frequency: number, duration: number, type: OscillatorType = "sine") {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);

      setTimeout(() => ctx.close(), duration * 1000 + 100);
    } catch {
      // Silenciosamente ignora se o navegador bloquear áudio
    }
  }

  function playFocusEnd() {
    // Três tons ascendentes: "missão cumprida"
    playTone(523, 0.15, "sine"); // C5
    setTimeout(() => playTone(659, 0.15, "sine"), 150); // E5
    setTimeout(() => playTone(784, 0.3, "sine"), 300); // G5
  }

  function playRestEnd() {
    // Dois tons descendentes: "volta ao trabalho"
    playTone(784, 0.15, "sine"); // G5
    setTimeout(() => playTone(523, 0.3, "sine"), 150); // C5
  }

  return { playFocusEnd, playRestEnd };
}
