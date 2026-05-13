class SFXBox {
  private sounds: { [key: string]: BABYLON.StaticSound } = {};

  constructor() {
    (async () => {
      const audioEngine = await BABYLON.CreateAudioEngineAsync();
      this.sounds.hit = await BABYLON.CreateSoundAsync("hit", "/hit.ogg");
      this.sounds.move = await BABYLON.CreateSoundAsync("move", "/move.ogg");
      this.sounds.rotate = await BABYLON.CreateSoundAsync("rotate", "/rotate.ogg");
      this.sounds.shot = await BABYLON.CreateSoundAsync("shot", "/shot.ogg");
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
