export type GameState =
  | {
      status: 'STOPPED';
    }
  | {
      status: 'IN PROGRESS';
      guessingWord: string;
    };
