export class Builder<T> {
  instance: T;

  constructor(defaultObject: T) {
    this.instance = { ...defaultObject };
  }

  with<Key extends keyof T>(fields: { [key in Key]: T[Key] }) {
    for (const entry of Object.entries(fields)) {
      const key = entry[0] as keyof T;
      const value = entry[1] as T[keyof T];
      this.instance[key] = value;
    }
    return this;
  }

  build() {
    return this.instance;
  }
}
