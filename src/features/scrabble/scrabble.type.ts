export type GameState =
  | {
      status: 'STOPPED';
    }
  | {
      status: 'IN PROGRESS';
      guessingWord: string;
    };

export type ScrabbleCommand =
  | {
      isValid: false;
      message: string;
    }
  | ({ isValid: true } & (
      | {
          subCommand: 'START';
          length: number;
        }
      | {
          subCommand: 'STOP';
        }
      | {
          subCommand: 'GUESS';
          guess: boolean;
        }
    ));
