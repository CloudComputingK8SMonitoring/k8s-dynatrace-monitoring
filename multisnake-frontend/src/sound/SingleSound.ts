import Sound from "./Sound";

/**
 * Represents a single sound that can be played multiple times and as frequently as desired.
 */
export default class SingleSound extends Sound {
  protected buffer: AudioBuffer;
  private lastPlayed: number = 0;

  /**
   * Plays the sound with a slight, random variation in pitch and volume
   */
  public play(volume: number = 1) {
    // Debounce to prevent crazy collision overlapping
    const now = Date.now();
    if (now - this.lastPlayed < 100) return;
    this.lastPlayed = now;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.buffer;

    // Randomize pitch variation
    const pitchVariation = (Math.random() * 0.2 - 0.1);
    source.playbackRate.value = 1 + pitchVariation;

    // Randomize volume variation
    const volumeVariation = (Math.random() * 0.2 + 0.9) * volume;
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volumeVariation;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
  }
}
