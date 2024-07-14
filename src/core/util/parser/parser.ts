export class Parser {
  tokenise(command: string): string[] {
    return command
      .split(' ')
      .filter((s) => s.length > 0)
      .map((s) => s.trim());
  }
}
