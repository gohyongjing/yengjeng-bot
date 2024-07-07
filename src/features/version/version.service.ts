/**
 * Functional approach
 */

const major: number = 0;
const minor: number = 1;
const patch: number = 1;

const changeLog = {
  '0.1.1': 'Fix bug causing failed fetching of last retrieved bus stop',
  '0.1.0': 'Use cristobalgvera/ez-clasp template to manage yengjeng bot',
};

export const VersionService = {
  getVersion: (): string => `v${major}.${minor}.${patch}`,
  getChangeLog: (): string[] =>
    Object.entries(changeLog).map((entry) => `${entry[0]}: ${entry[1]}`),
} as const;
