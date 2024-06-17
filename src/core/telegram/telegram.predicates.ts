import { hasKey, isObject } from '@core/util/predicates';
import { Chat, Message, Update } from './telegram.type';

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
    (hasKey(u, 'message_id') && typeof u.message_id === 'number') ||
    (hasKey(u, 'message_thread_id') &&
      typeof u.message_thread_id === 'number') ||
    (hasKey(u, 'date') && typeof u.date === 'number') ||
    (hasKey(u, 'chat') && isChat(u.chat))
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
    (hasKey(u, 'edited_channel_post') && isMessage(u.edited_channel_post))
  );
}
