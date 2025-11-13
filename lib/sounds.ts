export function playErrorSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create two descending piano notes (like Windows security error)
    const playNote = (frequency: number, startTime: number) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Piano-like sound with sine wave
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(frequency, startTime)

      // ADSR envelope for piano-like attack and decay
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01) // Fast attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5) // Decay

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.5)
    }

    // Two descending notes: E4 and C4 (dun dun)
    const now = audioContext.currentTime
    playNote(329.63, now) // E4 - first "dun"
    playNote(261.63, now + 0.15) // C4 - second "dun" (slightly overlapped)
  } catch (error) {
    console.error("[v0] Error playing sound:", error)
  }
}

export function playWarningSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // A4 note

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.error("[v0] Error playing sound:", error)
  }
}
