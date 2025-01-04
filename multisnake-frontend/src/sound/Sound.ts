
/**
 * Represents a single sound that can be played multiple times and as frequently as desired.
 */
export default abstract class Sound {
  protected audioContext: AudioContext = new AudioContext();
  protected buffer: AudioBuffer;
  protected loading: Promise<any>;

  public constructor(path: string) {
    this.loading = fetch(path)
      .then(response => response.arrayBuffer())
      .then(buffer => this.audioContext.decodeAudioData(buffer))
      .then(buffer => this.buffer = buffer);
  }

  public abstract play(volume: number);
}
