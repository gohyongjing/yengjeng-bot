import { Parser } from '../parser';

export class CommandV2 {
  private args: string[] = [];
  private currentIndex: number = 0;

  constructor(rawCommand: string) {
    const tokens = new Parser().tokenise(rawCommand);
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (i === 0) {
        if (token.startsWith('/')) {
          if (token.length > 1) {
            this.args.push(token.slice(1).toLocaleLowerCase());
          }
        } else {
          this.args.push(token.toLocaleLowerCase());
        }
      } else {
        this.args.push(token);
      }
    }
  }

  nextArg(): string | null {
    if (this.currentIndex >= this.args.length) {
      return null;
    }
    return this.args[this.currentIndex++];
  }

  toString() {
    return `Command(${this.args.join(' ')})`;
  }
}
