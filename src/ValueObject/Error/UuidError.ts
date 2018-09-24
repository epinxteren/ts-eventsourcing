
export class UuidError extends Error {

  public static notValid() {
    return new this('Not a valid uuid');
  }
}
