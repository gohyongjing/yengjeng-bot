import { TelegramService } from '@core/telegram';

// @ts-ignore
function main(): void {
  const user = new TelegramService().getMe();

  console.log({ user });
}
