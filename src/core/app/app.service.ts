import { Message, Update } from '@core/telegram';
import { hasKey } from '@core/util/predicates';

export class App {
  receiveUpdate(update: Update) {
    if (hasKey(update, 'message')) {
      this.handleMessageUpdate(update.message);
    } else {
      //const notImplemented = Object.keys(update).find(update => update !== 'message_id');
      //sendText(`This feature (${notImplemented}) has not been implemented yet!`);
    }
  }

  private handleMessageUpdate(message: Message) {
    function getFullName(
      first_name: string | undefined,
      last_name: string | undefined,
    ) {
      let result = first_name ?? '';
      if (last_name) {
        result += ` ${last_name}`;
      }
      return result;
    }

    //const chatId = message.chat.id;
    const name = getFullName(message.chat.first_name, message.chat.last_name);
    Logger.log(name);
  }
}
