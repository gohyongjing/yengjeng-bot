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

function sendMessage(url: string): string {
  const textQuery = 'text=';
  const startIndex = url.indexOf(textQuery) + textQuery.length;
  const endIndex = url.indexOf('&', startIndex);
  const text = url.substring(startIndex, endIndex);
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
