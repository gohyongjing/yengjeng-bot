import { SpreadsheetService } from '@core/spreadsheet/spreadsheet.service';
import { LoggerService } from '@core/logger';
import { GameState } from './scrabble.type';

export class ScrabbleData {
  private static SHEET_NAME = 'scarabble_service';
  private spreadsheetService;
  private logger;

  constructor() {
    this.spreadsheetService = new SpreadsheetService(ScrabbleData.SHEET_NAME, [
      'Chat Id',
      'Game State',
      'Guessing Word',
      'Updated At',
    ]);
    this.logger = new LoggerService();
  }

  updateGameState(chatId: number, newState: GameState) {
    return this.spreadsheetService.updateRow(1, chatId.toString(), [
      chatId,
      newState.status,
      newState.status === 'IN PROGRESS' ? newState.guessingWord : null,
      new Date(),
    ]);
  }

  readGameState(chatId: number): GameState {
    const data = this.spreadsheetService.readRow(1, chatId.toString());

    if (!data) {
      const defaultState: GameState = { status: 'STOPPED' };
      this.updateGameState(chatId, defaultState);
      return defaultState;
    }

    const status = data[1] as 'STOPPED' | 'IN PROGRESS';
    const guessingWord = data[2] as string | null;

    if (
      status === 'IN PROGRESS' &&
      (guessingWord === null || guessingWord === '')
    ) {
      this.logger.warn(
        `Inconsistent game state detected for chat ${chatId}: status is IN PROGRESS but guessing word is ${
          guessingWord === null ? 'null' : 'empty'
        }. Treating as STOPPED.`,
      );
      return { status: 'STOPPED' };
    }

    if (
      status === 'IN PROGRESS' &&
      guessingWord !== null &&
      guessingWord !== ''
    ) {
      return {
        status: 'IN PROGRESS',
        guessingWord: guessingWord,
      };
    } else {
      return { status: 'STOPPED' };
    }
  }
}
