export class MarkdownBuilder {
  texts: string[] = [];

  constructor(text: string = '') {
    this.raw(text);
  }

  raw(text: string): MarkdownBuilder {
    for (const char of text) {
      if (!char.match(/^[a-zA-Z0-9 \n\\\p{Emoji}]+$/u)) {
        this.texts.push('\\');
      }
      this.texts.push(char);
    }
    return this;
  }

  bold(text: string): MarkdownBuilder {
    this.texts.push('*');
    this.raw(text);
    this.texts.push('*');
    return this;
  }

  code(text: string, language: string = '') {
    this.texts.push(`\`\`\`${language}\n${text}\n\`\`\``);
    return this;
  }

  build(): string {
    return this.texts.join('');
  }
}
