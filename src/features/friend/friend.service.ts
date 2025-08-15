import { AppService } from '@core/appService';
import { TelegramService, User as TelegramUser } from '@core/telegram';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { Command } from '@core/util/command';
import { FriendData } from './friend.data';
import { FriendRequestData } from './friendRequest.data';
import { UserData } from '@features/user/user.data';
import { User as AppUser } from '@features/user/user.type';
import { FriendRequest } from './friend.type';

export class FriendService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'friend';
  private friendDataService: FriendData;
  private friendRequestDataService: FriendRequestData;
  private userData: UserData;

  private sendMessage(chatId: number, message: string): void {
    TelegramService.sendMessage({
      chatId,
      markdown: new MarkdownBuilder(message),
    });
  }

  private sendMessageWithReplyMarkup(
    chatId: number,
    message: string,
    replyMarkup: {
      inline_keyboard: Array<Array<{ text: string; callback_data: string }>>;
    },
  ): void {
    TelegramService.sendMessage({
      chatId,
      markdown: new MarkdownBuilder(message),
      replyMarkup,
    });
  }

  constructor() {
    super();
    this.friendDataService = new FriendData();
    this.friendRequestDataService = new FriendRequestData();
    this.userData = new UserData();
  }

  override help(): string {
    return '*FRIEND*\nFRIEND ADD <username>: Send or accept a friend request\nFRIEND REMOVE <username>: Remove friend or reject/cancel request\nFRIEND LIST: View your friends list';
  }

  override processCommand(
    command: Command,
    from: TelegramUser,
    chatId: number,
  ) {
    //TODO: Design a new system to attach handlers to commands and automatically parse commands with args with type checking
    const subCommand = command.positionalArgs[0]?.toUpperCase();

    if (!subCommand || subCommand === 'LIST') {
      this.listFriends(from, chatId);
      return;
    } else if (subCommand === 'ADD') {
      const otherUserName = command.positionalArgs[1];
      if (!otherUserName) {
        this.sendMessage(
          chatId,
          'Please provide a username to add as friend. Example: /friend add username',
        );
        return;
      }
      this.addFriend(from, chatId, otherUserName);
    } else if (subCommand === 'REMOVE') {
      const otherUserName = command.positionalArgs[1];
      if (!otherUserName) {
        this.sendMessage(
          chatId,
          'Please provide a username to remove. Example: /friend remove username',
        );
        return;
      }
      this.removeFriend(from, chatId, otherUserName);
    } else {
      this.sendMessage(
        chatId,
        `Sorry, I don't know how to handle this command: '${subCommand}'\n\n${this.help()}`,
      );
    }
  }

  private addFriend(
    from: TelegramUser,
    chatId: number,
    otherUserName: string,
  ): void {
    const senderUser = this.userData.getUser({ userId: from.id });
    if (!senderUser) {
      this.sendMessage(
        chatId,
        'You are not registered in the system. Please talk to the bot first to create your account.',
      );
      return;
    }

    const otherUser = this.userData.getUser({
      username: otherUserName.startsWith('@')
        ? otherUserName.slice(1)
        : otherUserName,
    });
    if (!otherUser) {
      this.sendMessage(
        chatId,
        `User '${otherUserName}' not found. Please ask them to talk to the bot first to create their account.`,
      );
      return;
    }

    if (from.id === otherUser.userId) {
      this.sendMessage(chatId, 'You cannot add yourself as a friend.');
      return;
    }

    const areAlreadyFriends = this.friendDataService.areFriends(
      from.id,
      otherUser.userId,
    );
    if (areAlreadyFriends) {
      this.sendMessage(
        chatId,
        `You are already friends with ${otherUserName}.`,
      );
      return;
    }

    const existingRequest = this.friendRequestDataService.getFriendRequest(
      from.id,
      otherUser.userId,
    );
    const reverseRequest = this.friendRequestDataService.getFriendRequest(
      otherUser.userId,
      from.id,
    );

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        this.sendMessage(
          chatId,
          `You already have a pending friend request to ${otherUserName}.`,
        );
        return;
      } else if (existingRequest.status === 'cancelled') {
        this.friendRequestDataService.setFriendRequest({
          senderId: from.id,
          recipientId: otherUser.userId,
          status: 'pending',
        });
        this.sendMessage(chatId, `Friend request sent to ${otherUserName}.`);
        return;
      } else if (existingRequest.status === 'rejected') {
        this.sendMessage(
          chatId,
          `You already have a pending friend request to ${otherUserName}.`,
        );
        return;
      }
    }

    if (reverseRequest) {
      if (reverseRequest.status === 'pending') {
        this.acceptFriendRequest(reverseRequest, from, otherUser, chatId);
        return;
      } else if (
        reverseRequest.status === 'rejected' ||
        reverseRequest.status === 'cancelled'
      ) {
        this.friendRequestDataService.deleteFriendRequest(
          otherUser.userId,
          from.id,
        );
        this.friendRequestDataService.setFriendRequest({
          senderId: from.id,
          recipientId: otherUser.userId,
          status: 'pending',
        });
        this.sendFriendRequestNotification(from, otherUser, chatId);
        return;
      }
    }

    this.friendRequestDataService.setFriendRequest({
      senderId: from.id,
      recipientId: otherUser.userId,
      status: 'pending',
    });
    this.sendFriendRequestNotification(from, otherUser, chatId);
  }

  private removeFriend(
    from: TelegramUser,
    chatId: number,
    otherUserName: string,
  ): void {
    const senderUser = this.userData.getUser({ userId: from.id });
    if (!senderUser) {
      this.sendMessage(
        chatId,
        'You are not registered in the system. Please talk to the bot first to create your account.',
      );
      return;
    }

    const otherUser = this.userData.getUser({
      username: otherUserName.startsWith('@')
        ? otherUserName.slice(1)
        : otherUserName,
    });
    if (!otherUser) {
      this.sendMessage(chatId, `User '${otherUserName}' not found.`);
      return;
    }

    const areFriends = this.friendDataService.areFriends(
      from.id,
      otherUser.userId,
    );
    const existingRequest = this.friendRequestDataService.getFriendRequest(
      from.id,
      otherUser.userId,
    );
    const reverseRequest = this.friendRequestDataService.getFriendRequest(
      otherUser.userId,
      from.id,
    );

    if (!areFriends && !existingRequest && !reverseRequest) {
      this.sendMessage(
        chatId,
        `No friend relationship or pending request found with ${otherUserName}.`,
      );
      return;
    }

    if (areFriends) {
      this.friendDataService.removeFriend(from.id, otherUser.userId);
      this.sendMessage(
        chatId,
        `You have removed ${otherUserName} from your friends list.`,
      );
      return;
    }

    if (existingRequest && existingRequest.status === 'pending') {
      this.friendRequestDataService.setFriendRequest({
        senderId: from.id,
        recipientId: otherUser.userId,
        status: 'cancelled',
      });
      this.sendMessage(
        chatId,
        `You have cancelled your friend request to ${otherUserName}.`,
      );
      return;
    }

    if (reverseRequest && reverseRequest.status === 'pending') {
      this.friendRequestDataService.setFriendRequest({
        senderId: otherUser.userId,
        recipientId: from.id,
        status: 'rejected',
      });
      this.sendMessage(
        chatId,
        `You have rejected the friend request from ${otherUserName}.`,
      );
      return;
    }
  }

  private listFriends(from: TelegramUser, chatId: number): void {
    this.loggerService.debug('Listing friends');
    const senderUser = this.userData.getUser({ userId: from.id });
    this.loggerService.debug('Got User!');
    this.loggerService.debug(`Got User!: ${JSON.stringify(senderUser)}`);
    if (!senderUser) {
      this.loggerService.debug('sending No User message');
      this.sendMessage(
        chatId,
        'You are not registered in the system. Please talk to the bot first to create your account.',
      );
      return;
    }

    this.loggerService.debug('getting friends');
    let friendIds: number[] = [];
    try {
      friendIds = this.friendDataService.getFriends(from.id);
    } catch (e) {
      this.loggerService.error(e);
      return;
    }
    this.loggerService.debug(`Got Friends!: ${friendIds.length}`);
    this.loggerService.debug(`Got Friends!: ${JSON.stringify(friendIds)}`);
    if (friendIds.length === 0) {
      this.loggerService.debug('sending No Friends message');
      this.sendMessage(
        chatId,
        'You have no friends yet. Use /friend add <username> to add friends.',
      );
      return;
    }

    this.loggerService.debug('getting friend names');
    const friendNames: string[] = [];
    for (const friendId of friendIds) {
      const friendUser = this.userData.getUser({ userId: friendId });
      if (friendUser) {
        const displayName = friendUser.username
          ? `@${friendUser.username}`
          : friendUser.firstName;
        friendNames.push(displayName);
      }
    }

    this.loggerService.debug('sending friends list');
    const friendsList = friendNames.join('\n');
    this.loggerService.debug(`Friends List!: ${friendsList}`);
    this.sendMessage(chatId, `*Your Friends*\n\n${friendsList}`);
  }

  private sendFriendRequestNotification(
    sender: TelegramUser,
    recipient: AppUser,
    senderChatId: number,
  ): void {
    const senderName = sender.username
      ? `@${sender.username}`
      : sender.first_name;
    const recipientName = recipient.username
      ? `@${recipient.username}`
      : recipient.firstName;

    this.sendMessage(senderChatId, `Friend request sent to ${recipientName}.`);

    this.sendMessageWithReplyMarkup(
      recipient.userId,
      `${senderName} wants to be your friend!`,
      {
        inline_keyboard: [
          [
            { text: '✅ Accept', callback_data: `/friend add ${senderName}` },
            {
              text: '❌ Ignore',
              callback_data: `/friend remove ${senderName}`,
            },
          ],
        ],
      },
    );
  }

  private acceptFriendRequest(
    request: FriendRequest,
    accepter: TelegramUser,
    sender: AppUser,
    accepterChatId: number,
  ): void {
    this.friendRequestDataService.deleteFriendRequest(
      request.senderId,
      request.recipientId,
    );
    this.friendDataService.addFriend(request.senderId, request.recipientId);

    const accepterName = accepter.username
      ? `@${accepter.username}`
      : accepter.first_name;
    const senderName = sender.username
      ? `@${sender.username}`
      : sender.firstName;

    this.sendMessage(accepterChatId, `You are now friends with ${senderName}!`);

    this.sendMessage(
      sender.userId,
      `${accepterName} accepted your friend request!`,
    );
  }
}
