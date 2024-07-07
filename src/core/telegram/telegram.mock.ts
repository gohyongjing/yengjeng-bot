import { MockHTTPResponse, MockUrlFetchApp } from '@core/googleAppsScript';
import { Builder } from '@core/util/builder';
import { Chat, Message, ResponseBody, User } from './telegram.type';

export const MockChat: Chat = {
  id: 123,
  type: 'private',
};

export const MockMessage: Message = {
  message_id: 0,
  date: 1,
  chat: MockChat,
  text: 'Hello World!',
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

function canParseMarkdownV2(encodedText: string) {
  const text = decodeURIComponent(encodedText);
  let parenthesisCount = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    const prevCh = i - 1 !== -1 ? text.charAt(i - 1) : null;
    const nextCh = i + 1 !== text.length ? text.charAt(i + 1) : null;

    const isEscaped = prevCh === '\\';
    if (isEscaped) {
      continue;
    } else if (ch === '-') {
      return false;
    } else if (ch === '!') {
      if (nextCh !== '[') {
        return false;
      }
    } else if (ch === '|') {
      if (prevCh !== '|' && nextCh !== '|') {
        return false;
      }
    } else if (ch === '(') {
      parenthesisCount += 1;
    } else if (ch === ')') {
      parenthesisCount -= 1;
    }
  }

  return parenthesisCount === 0;
}

function sendMessage(url: string): string {
  const textQuery = 'text=';
  const startIndex = url.indexOf(textQuery) + textQuery.length;
  const endIndex = url.indexOf('&', startIndex);
  const text = url.substring(startIndex, endIndex);

  const isValid = canParseMarkdownV2(text);
  expect(isValid).toBeTruthy();
  const responseBody: ResponseBody<Message> = {
    ok: true,
    result: new Builder(MockMessage).with({ text }).build(),
  };
  return JSON.stringify(responseBody);
}

export const MockTelegramUrlFetchApp = new Builder(MockUrlFetchApp)
  .with({
    fetch: jest.fn(
      (
        url: string,
        _params?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions,
      ) => {
        const response = new Builder(MockHTTPResponse)
          .with({
            getContentText: jest.fn(() => {
              if (url.endsWith('/getMe')) {
                return getMe();
              } else if (url.includes('/setWebhook')) {
                return setWebhook();
              } else if (url.includes('/sendMessage')) {
                return sendMessage(url);
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
