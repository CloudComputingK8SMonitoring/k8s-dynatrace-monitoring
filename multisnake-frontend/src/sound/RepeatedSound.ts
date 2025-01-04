import Sound from "./Sound";

/**
 * A sound that will be played repeatedly upon calling start() and stopped when stop() is called
 */
export default class RepeatedSound extends Sound {
  private source: AudioBufferSourceNode;

  /**
   * Start repeated playback
   */
  public async play(volume: number = 1) {
    // Wait until sound has loaded
    await this.loading;

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;
    this.source.connect(gainNode);

    gainNode.connect(this.audioContext.destination);
    this.source.loop = true;
    this.source.start();
  }

  /**
   * Stop playback
   */
  public stop() {
    this.source.stop();
  }
}
