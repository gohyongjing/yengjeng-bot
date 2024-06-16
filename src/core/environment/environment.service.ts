export class EnvironmentService {
  get(key: string): string | null {
    return process.env[key] ?? null;
  }
}
