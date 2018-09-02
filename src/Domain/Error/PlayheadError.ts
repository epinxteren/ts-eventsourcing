export class PlayheadError extends Error {

  public static create(expected: number, actual: number) {
    return new PlayheadError(`Playhead does not match expected ${expected} given ${actual}`);
  }

}
