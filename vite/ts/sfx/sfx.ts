class SFXBox {
  private sounds: { [key: string]: BABYLON.StaticSound } = {};

  constructor() {
    (async () => {
      const audioEngine = await BABYLON.CreateAudioEngineAsync();
      this.sounds.hit = await BABYLON.CreateSoundAsync("hit", "/hit.wav");
      this.sounds.move = await BABYLON.CreateSoundAsync("move", "/move.wav");
      this.sounds.rotate = await BABYLON.CreateSoundAsync("rotate", "/rotate.wav");
      this.sounds.shot = await BABYLON.CreateSoundAsync("shot", "/shot.wav");
      // Wait for the audio engine to unlock
      await audioEngine.unlockAsync();
      // this.sounds.shot.play()
    })();
  }

  hit(): void {
    this.sounds.hit.play();
  }

  move(): void {
    this.sounds.move.play();
  }

  rotate(): void {
    this.sounds.rotate.play();
  }

  shot(): void {
    this.sounds.shot.play();
  }
}

export const sfx = new SFXBox();
