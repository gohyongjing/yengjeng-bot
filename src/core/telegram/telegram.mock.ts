import { MockHTTPResponse, MockUrlFetchApp } from '@core/googleAppsScript';
import { Builder } from '@core/util/builder';
import {
  Chat,
  Message,
  ResponseBody,
  Update,
  User,
  CallbackQuery,
} from './telegram.type';

export const MockChat: Chat = {
  id: 123,
  type: 'private',
};

export const MockUser: User = {
  id: 123,
  first_name: 'TestUser',
  username: 'testuser',
  is_bot: false,
};

export const MockUser2: User = {
  id: 456,
  first_name: 'Jane',
  username: 'janesmith',
  is_bot: false,
};

export const MockMessage: Message = {
  message_id: 0,
  date: 1,
  chat: MockChat,
  from: MockUser,
  text: 'Hello World!',
};

export const MockCallbackQuery: CallbackQuery = {
  id: '123',
  from: MockUser,
  data: 'test_callback_data',
  chat_instance: 'test-instance',
  message: MockMessage,
};

export const MockUpdate: Update = {
  update_id: 1,
  message: MockMessage,
};

function getMe(): string {
  const responseBody: ResponseBody<User> = {
    ok: true,
    result: {
      id: 123,
      is_bot: false,
      first_name: 'John Doe',
    },
  };
  return JSON.stringify(responseBody);
}

function setWebhook(): string {
  const responseBody: ResponseBody<boolean> = {
    ok: true,
    result: true,
  };
  return JSON.stringify(responseBody);
}

export const canParseMarkdownV2 = jest.fn((encodedText: string) => {
  const text = decodeURIComponent(encodedText);
  let parenthesisCount = 0;
  let isEscaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    const prevCh = i - 1 !== -1 ? text.charAt(i - 1) : null;
    const nextCh = i + 1 !== text.length ? text.charAt(i + 1) : null;

    if (ch === '\\') {
      i += 1;
      continue;
    } else if (text.slice(i, i + 3) === '```') {
      isEscaped = !isEscaped;
    } else if (isEscaped) {
      continue;
    } else if (ch === '-' || ch === '.') {
      console.log(`markdown '${text}' contains Unescaped ${ch} at index ${i}`);
      return false;
    } else if (ch === '!') {
      if (nextCh !== '[') {
        console.log(`markdown '${text}' contains Unescaped '!' at index ${i}`);
        return false;
      }
    } else if (ch === '|') {
      if (prevCh !== '|' && nextCh !== '|') {
        console.log(`markdown '${text}' contains Unescaped '|' at index ${i}`);
        return false;
      }
    } else if (ch === '(') {
      parenthesisCount += 1;
    } else if (ch === ')') {
      parenthesisCount -= 1;
    }
  }
  if (parenthesisCount !== 0) {
    console.log(`markdown '${text}' contains Unescaped '(' or ')'`);
  }
  return parenthesisCount === 0;
});

export const sendMessage = jest.fn(
  (
    url: string,
    options?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions,
  ): string => {
    let text: string;
    let chatId = MockChat.id;

    if (options?.method === 'post' && typeof options.payload === 'string') {
      try {
        const payload = JSON.parse(options.payload);
        text = payload.text || '';
        chatId = payload.chat_id;
      } catch {
        text = '';
      }
    } else {
      const textQuery = 'text=';
      const startIndex = url.indexOf(textQuery) + textQuery.length;
      const endIndex = url.indexOf('&', startIndex);
      text = url.substring(startIndex, endIndex);
    }

    if (canParseMarkdownV2(text)) {
      const responseBody: ResponseBody<Message> = {
        ok: true,
        result: new Builder(MockMessage)
          .with({ text, chat: { ...MockChat, id: chatId } })
          .build(),
      };
      return JSON.stringify(responseBody);
    }
    const responseBody: ResponseBody<Message> = {
      ok: false,
      description: 'invalid markdown',
    };
    return JSON.stringify(responseBody);
  },
);

export const MockTelegramUrlFetchApp = new Builder(MockUrlFetchApp)
  .with({
    fetch: jest.fn(
      (
        url: string,
        params?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions,
      ) => {
        const response = new Builder(MockHTTPResponse)
          .with({
            getContentText: jest.fn(() => {
              if (url.endsWith('/getMe')) {
                return getMe();
              } else if (url.includes('/setWebhook')) {
                return setWebhook();
              } else if (url.includes('/sendMessage')) {
                return sendMessage(url, params);
              }
              return '';
            }),
          })
          .build();

        return response;
      },
    ),
  })
  .build();
