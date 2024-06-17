/**
 * Based on the response body described in https://core.telegram.org/bots/api#making-requests
 */
export type ResponseBody<T> =
  | {
      ok: true;
      result: T;
    }
  | {
      ok: false;
      description: string;
    };

/**
 * Based on the data types described in https://core.telegram.org/bots/api#available-types
 */

export type User = {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
  can_connect_to_business?: boolean;
};

export type Chat = {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_forum?: true;
};

export type Message = {
  message_id: number;
  message_thread_id?: number;
  from?: User;
  sender_chat?: Chat;
  sender_boost_count?: number;
  sender_buisness_bot?: User;
  date: number;
  buisness_connection_id?: string;
  chat: Chat;
  text?: string;
};

export type Update = {
  update_id: number;
} & (
  | { message: Message }
  | { editedMessage: Message }
  | { channel_post: Message }
  | { edited_channel_post: Message }
);
