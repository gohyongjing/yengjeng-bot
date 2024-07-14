import { Parser } from '../parser';

export class Command {
  commandWord: string | null = null;
  positionalArgs: string[] = [];
  keywordArgs: { [keyword: string]: string } = {};

  constructor(rawCommand: string) {
    const tokens = new Parser().tokenise(rawCommand);
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (i === 0) {
        if (token.startsWith('/')) {
          if (token.length > 1) {
            this.commandWord = token.slice(1).toLocaleLowerCase();
          }
        } else {
          this.commandWord = token.toLocaleLowerCase();
        }
      } else {
        if (token.startsWith('-')) {
          if (i + 1 < tokens.length) {
            this.keywordArgs[token.slice(1)] = tokens[i + 1] ?? '';
            i += 1;
          }
        } else {
          this.positionalArgs.push(token);
        }
      }
    }
  }

  isCommand(commandWord: string): boolean {
    return commandWord.toLocaleLowerCase() === this.commandWord;
  }
}
