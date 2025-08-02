import { hasKey, isObject } from '@core/util/predicates';
import { Chat, Message, Update, CallbackQuery, User } from './telegram.type';

export function isChat(u: unknown): u is Chat {
  return (
    hasKey(u, 'id') &&
    typeof u.id === 'number' &&
    hasKey(u, 'type') &&
    typeof u.type === 'string' &&
    ['private', 'group', 'supergroup', 'channel'].includes(u.type)
  );
}

export function isMessage(u: unknown): u is Message {
  return (
    ((hasKey(u, 'message_id') && typeof u.message_id === 'number') ||
      (hasKey(u, 'message_thread_id') &&
        typeof u.message_thread_id === 'number')) &&
    hasKey(u, 'date') &&
    typeof u.date === 'number' &&
    hasKey(u, 'chat') &&
    isChat(u.chat) &&
    (hasKey(u, 'from') ? isUser(u.from) : true)
  );
}

export function isUser(u: unknown): u is User {
  return (
    hasKey(u, 'id') &&
    typeof u.id === 'number' &&
    hasKey(u, 'is_bot') &&
    typeof u.is_bot === 'boolean' &&
    hasKey(u, 'first_name') &&
    typeof u.first_name === 'string'
  );
}

export function isCallbackQuery(u: unknown): u is CallbackQuery {
  return (
    hasKey(u, 'id') &&
    typeof u.id === 'string' &&
    hasKey(u, 'from') &&
    isUser(u.from) &&
    hasKey(u, 'chat_instance') &&
    typeof u.chat_instance === 'string' &&
    (hasKey(u, 'message') ? isMessage(u.message) : true) &&
    (hasKey(u, 'inline_message_id')
      ? typeof u.inline_message_id === 'string'
      : true) &&
    (hasKey(u, 'data') ? typeof u.data === 'string' : true) &&
    (hasKey(u, 'game_short_name')
      ? typeof u.game_short_name === 'string'
      : true)
  );
}

export function isUpdate(u: unknown): u is Update {
  if (!isObject(u) || !hasKey(u, 'update_id')) {
    return false;
  }
  return (
    (hasKey(u, 'message') && isMessage(u.message)) ||
    (hasKey(u, 'edited_message') && isMessage(u.edited_message)) ||
    (hasKey(u, 'channel_post') && isMessage(u.channel_post)) ||
    (hasKey(u, 'edited_channel_post') && isMessage(u.edited_channel_post)) ||
    (hasKey(u, 'callback_query') && isCallbackQuery(u.callback_query))
  );
}
