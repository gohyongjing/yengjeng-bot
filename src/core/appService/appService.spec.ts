import { MockAppService } from './appService.mock';
import { Builder } from '@core/util/builder';
import {
  MockMessage,
  MockCallbackQuery,
  MockUser,
  MockChat,
  MockTelegramUrlFetchApp,
} from '@core/telegram/telegram.mock';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { Update, Message, CallbackQuery } from '@core/telegram';

describe('AppService', () => {
  let underTest: MockAppService;

  beforeAll(() => {
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    underTest = new MockAppService('test', 'Test help text');
    jest.clearAllMocks();
  });

  describe('processUpdate', () => {
    describe('message update', () => {
      it('should process message update correctly', () => {
        const message = new Builder(MockMessage)
          .with({
            text: '/test command',
            from: MockUser,
            chat: MockChat,
          })
          .build();

        const update: Update = {
          update_id: 1,
          message: message,
        };

        underTest.processUpdate(update);

        expect(underTest.processCommandCalls).toHaveLength(1);
        expect(underTest.processCommandCalls[0].command.commandWord).toBe(
          'test',
        );
        expect(underTest.processCommandCalls[0].from).toBe(MockUser);
        expect(underTest.processCommandCalls[0].chatId).toBe(MockChat.id);
      });

      it('should handle message with different command word', () => {
        const message: Message = {
          ...MockMessage,
          text: '/other command',
          from: MockUser,
          chat: MockChat,
        };

        const update: Update = {
          update_id: 1,
          message: message,
        };

        underTest.processUpdate(update);

        expect(underTest.processCommandCalls).toHaveLength(0);
      });
    });

    describe('callback query update', () => {
      it('should process callback query update correctly', () => {
        const callbackQuery = new Builder(MockCallbackQuery)
          .with({
            data: '/test callback',
            from: MockUser,
            message: {
              ...MockMessage,
              chat: MockChat,
            },
          })
          .build();

        const update: Update = {
          update_id: 1,
          callback_query: callbackQuery,
        };

        underTest.processUpdate(update);

        expect(underTest.processCommandCalls).toHaveLength(1);
        expect(underTest.processCommandCalls[0].command.commandWord).toBe(
          'test',
        );
        expect(underTest.processCommandCalls[0].from).toBe(MockUser);
        expect(underTest.processCommandCalls[0].chatId).toBe(MockChat.id);
      });

      it('should handle callback query with different command word', () => {
        const callbackQuery: CallbackQuery = {
          ...MockCallbackQuery,
          data: '/other callback',
          from: MockUser,
          message: {
            ...MockMessage,
            chat: MockChat,
          },
        };

        const update: Update = {
          update_id: 1,
          callback_query: callbackQuery,
        };

        underTest.processUpdate(update);

        expect(underTest.processCommandCalls).toHaveLength(0);
      });
    });

    describe('update without message or callback_query', () => {
      it('should handle update with neither message nor callback_query', () => {
        const update: Update = {
          update_id: 1,
          edited_message: MockMessage,
        };

        underTest.processUpdate(update);
        expect(underTest.processCommandCalls).toHaveLength(0);
      });
    });
  });

  describe('processMessage', () => {
    describe('valid command', () => {
      it('should process valid command and call processCommand', () => {
        const message = new Builder(MockMessage)
          .with({
            text: '/test command',
            from: MockUser,
            chat: MockChat,
          })
          .build();

        underTest.processMessage(message);

        expect(underTest.processCommandCalls).toHaveLength(1);
        expect(underTest.processCommandCalls[0].command.commandWord).toBe(
          'test',
        );
        expect(underTest.processCommandCalls[0].from).toBe(MockUser);
        expect(underTest.processCommandCalls[0].chatId).toBe(MockChat.id);
      });
    });

    describe('invalid command', () => {
      it('should not process command for different service', () => {
        const message = new Builder(MockMessage)
          .with({
            text: '/other command',
            from: MockUser,
            chat: MockChat,
          })
          .build();

        underTest.processMessage(message);
        expect(underTest.processCommandCalls).toHaveLength(0);
      });

      it('should handle message without text', () => {
        const message: Message = {
          ...MockMessage,
          text: '',
          from: MockUser,
          chat: MockChat,
        };

        underTest.processMessage(message);
        expect(underTest.processCommandCalls).toHaveLength(0);
      });
    });

    describe('message without user', () => {
      it('should handle message without from field', () => {
        const message: Message = {
          text: '/test command',
          message_id: 1,
          date: 1,
          chat: MockChat,
        };

        underTest.processMessage(message);
        expect(underTest.processCommandCalls).toHaveLength(0);
      });
    });
  });

  describe('processCallbackQuery', () => {
    describe('valid callback query', () => {
      it('should process valid callback query and call processCommand', () => {
        const callbackQuery = new Builder(MockCallbackQuery)
          .with({
            data: '/test callback',
            from: MockUser,
            message: {
              ...MockMessage,
              chat: MockChat,
            },
          })
          .build();

        underTest.processCallbackQuery(callbackQuery);
        expect(underTest.processCommandCalls).toHaveLength(1);
        expect(underTest.processCommandCalls[0].command.commandWord).toBe(
          'test',
        );
        expect(underTest.processCommandCalls[0].from).toBe(MockUser);
        expect(underTest.processCommandCalls[0].chatId).toBe(MockChat.id);
      });
    });

    describe('invalid callback query', () => {
      it('should not process callback query for different service', () => {
        const callbackQuery = new Builder(MockCallbackQuery)
          .with({
            data: '/other callback',
            from: MockUser,
            message: {
              ...MockMessage,
              chat: MockChat,
            },
          })
          .build();

        underTest.processCallbackQuery(callbackQuery);
        expect(underTest.processCommandCalls).toHaveLength(0);
      });

      it('should handle callback query without data', () => {
        const callbackQuery: CallbackQuery = {
          ...MockCallbackQuery,
          data: '',
          from: MockUser,
          message: {
            ...MockMessage,
            chat: MockChat,
          },
        };

        underTest.processCallbackQuery(callbackQuery);
        expect(underTest.processCommandCalls).toHaveLength(0);
      });
    });

    describe('callback query without message', () => {
      it('should handle callback query without message', () => {
        const callbackQuery: CallbackQuery = {
          id: '1',
          chat_instance: '1',
          data: '/test callback',
          from: MockUser,
        };

        underTest.processCallbackQuery(callbackQuery);
        expect(underTest.processCommandCalls).toHaveLength(0);
      });
    });
  });
});
