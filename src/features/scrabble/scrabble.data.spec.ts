import { ScrabbleData } from './scrabble.data';
import { MockLogger } from '@core/googleAppsScript';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { GameState } from './scrabble.type';

describe('ScrabbleData', () => {
  let underTest: ScrabbleData;

  beforeAll(() => {
    global.Logger = MockLogger;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.SpreadsheetApp = createMockSpreadsheetApp();
    underTest = new ScrabbleData();
  });

  describe('updateGameState', () => {
    it('should update existing row with STOPPED game state', () => {
      const userId = 12345;
      const gameState: GameState = { status: 'STOPPED' };

      const result = underTest.updateGameState(userId, gameState);

      expect(result).toEqual([userId, 'STOPPED', null, expect.any(Date)]);
    });

    it('should update existing row with IN PROGRESS game state and guessing word', () => {
      const userId = 67890;
      const gameState: GameState = {
        status: 'IN PROGRESS',
        guessingWord: 'HELLO',
      };

      const result = underTest.updateGameState(userId, gameState);

      expect(result).toEqual([
        userId,
        'IN PROGRESS',
        'HELLO',
        expect.any(Date),
      ]);
    });
  });

  describe('readGameState', () => {
    describe('when user data exists', () => {
      it('should return STOPPED state for existing user with STOPPED status', () => {
        const userId = 12345;
        const gameState: GameState = { status: 'STOPPED' };

        underTest.updateGameState(userId, gameState);

        const result = underTest.readGameState(userId);

        expect(result).toEqual({ status: 'STOPPED' });
      });

      it('should return IN PROGRESS state for existing user with IN PROGRESS status', () => {
        const userId = 67890;
        const gameState: GameState = {
          status: 'IN PROGRESS',
          guessingWord: 'HELLO',
        };

        underTest.updateGameState(userId, gameState);

        const result = underTest.readGameState(userId);

        expect(result).toEqual({
          status: 'IN PROGRESS',
          guessingWord: 'HELLO',
        });
      });

      it('should handle empty guessing word as STOPPED state', () => {
        const userId = 33333;
        const gameState: GameState = {
          status: 'IN PROGRESS',
          guessingWord: '',
        };

        underTest.updateGameState(userId, gameState);

        const result = underTest.readGameState(userId);

        expect(result).toEqual({ status: 'STOPPED' });
      });

      it('should handle null guessing word as STOPPED state', () => {
        const userId = 44444;
        const gameState: GameState = { status: 'STOPPED' };

        underTest.updateGameState(userId, gameState);

        const result = underTest.readGameState(userId);

        expect(result).toEqual({ status: 'STOPPED' });
      });
    });

    describe('when user data does not exist', () => {
      it('should create default STOPPED state for non-existent user', () => {
        const userId = 99999;

        const result = underTest.readGameState(userId);

        expect(result).toEqual({ status: 'STOPPED' });
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow: update game state multiple times', () => {
      const userId = 77777;

      const stoppedState: GameState = { status: 'STOPPED' };
      const result1 = underTest.updateGameState(userId, stoppedState);
      expect(result1).toEqual([userId, 'STOPPED', null, expect.any(Date)]);

      const inProgressState: GameState = {
        status: 'IN PROGRESS',
        guessingWord: 'HELLO',
      };
      const result2 = underTest.updateGameState(userId, inProgressState);
      expect(result2).toEqual([
        userId,
        'IN PROGRESS',
        'HELLO',
        expect.any(Date),
      ]);

      const finalState: GameState = { status: 'STOPPED' };
      const result3 = underTest.updateGameState(userId, finalState);
      expect(result3).toEqual([userId, 'STOPPED', null, expect.any(Date)]);
    });

    it('should handle complete workflow: get, update, and get again', () => {
      const userId = 66666;

      const initialState = underTest.readGameState(userId);
      expect(initialState).toEqual({ status: 'STOPPED' });

      const inProgressState: GameState = {
        status: 'IN PROGRESS',
        guessingWord: 'WORKFLOW',
      };
      underTest.updateGameState(userId, inProgressState);

      const updatedState = underTest.readGameState(userId);
      expect(updatedState).toEqual({
        status: 'IN PROGRESS',
        guessingWord: 'WORKFLOW',
      });

      const stoppedState: GameState = { status: 'STOPPED' };
      underTest.updateGameState(userId, stoppedState);

      const finalState = underTest.readGameState(userId);
      expect(finalState).toEqual({ status: 'STOPPED' });
    });
  });
});
