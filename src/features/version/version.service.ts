/**
 * Functional approach
 */

const major: number = 0;
const minor: number = 1;
const patch: number = 0;

const changeLog: string[] = [
  'Use cristobalgvera/ez-clasp template to manage yengjeng bot',
];

export const VersionService = {
  getVersion: (): string => `v${major}.${minor}.${patch}`,
  getChangeLog: (): string[] => changeLog,
} as const;
