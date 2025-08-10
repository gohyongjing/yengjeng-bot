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
  private userDataService: UserData;

  constructor() {
    super();
    this.friendDataService = new FriendData();
    this.friendRequestDataService = new FriendRequestData();
    this.userDataService = new UserData();
  }

  override help(): string {
    return '*FRIEND*\nFRIEND ADD <username>: Send or accept a friend request\nFRIEND REMOVE <username>: Remove friend or reject/cancel request\nFRIEND LIST: View your friends list';
  }

  override processCommand(
    command: Command,
    from: TelegramUser,
    chatId: number,
  ): void {
    //TODO: Design a new system to attach handlers to commands and automatically parse commands with args with type checking
    const subCommand = command.positionalArgs[0]?.toUpperCase();

    if (!subCommand || subCommand === 'LIST') {
      this.listFriends(from, chatId);
    } else if (subCommand === 'ADD') {
      const otherUserName = command.positionalArgs[1];
      if (!otherUserName) {
        TelegramService.sendMessage({
          chatId,
          markdown: new MarkdownBuilder(
            'Please provide a username to add as friend\\. Example: /friend add username',
          ),
        });
        return;
      }
      this.addFriend(from, chatId, otherUserName);
    } else if (subCommand === 'REMOVE') {
      const otherUserName = command.positionalArgs[1];
      if (!otherUserName) {
        TelegramService.sendMessage({
          chatId,
          markdown: new MarkdownBuilder(
            'Please provide a username to remove\\. Example: /friend remove username',
          ),
        });
        return;
      }
      this.removeFriend(from, chatId, otherUserName);
    } else {
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          `Sorry\\, I don't know how to handle this command: '${subCommand}'\n\n${this.help()}`,
        ),
      });
    }
  }

  private async addFriend(
    from: TelegramUser,
    chatId: number,
    otherUserName: string,
  ): Promise<void> {
    const otherUser = this.findUserByUsername(otherUserName);
    if (!otherUser) {
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          `User '${otherUserName}' not found\\. Please ask them to talk to the bot first to create their account\\.`,
        ),
      });
      return;
    }

    if (from.id === otherUser.userId) {
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder('You cannot add yourself as a friend\\.'),
      });
      return;
    }

    const areAlreadyFriends = this.friendDataService.areFriends(
      from.id,
      otherUser.userId,
    );
    if (areAlreadyFriends) {
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          `You are already friends with ${otherUserName}\\.`,
        ),
      });
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
        TelegramService.sendMessage({
          chatId,
          markdown: new MarkdownBuilder(
            `You already have a pending friend request to ${otherUserName}\\.`,
          ),
        });
        return;
      } else if (existingRequest.status === 'cancelled') {
        this.friendRequestDataService.setFriendRequest({
          senderId: from.id,
          recipientId: otherUser.userId,
          status: 'pending',
        });
        this.sendFriendRequestNotification(from, otherUser, chatId);
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

  private async removeFriend(
    from: TelegramUser,
    chatId: number,
    otherUserName: string,
  ): Promise<void> {
    const otherUser = this.findUserByUsername(otherUserName);
    if (!otherUser) {
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(`User '${otherUserName}' not found\\.`),
      });
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
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          `No friend relationship or pending request found with ${otherUserName}\\.`,
        ),
      });
      return;
    }

    if (areFriends) {
      this.friendDataService.removeFriend(from.id, otherUser.userId);
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          `You have removed ${otherUserName} from your friends list\\.`,
        ),
      });
      return;
    }

    if (existingRequest && existingRequest.status === 'pending') {
      this.friendRequestDataService.setFriendRequest({
        senderId: from.id,
        recipientId: otherUser.userId,
        status: 'cancelled',
      });
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          `You have cancelled your friend request to ${otherUserName}\\.`,
        ),
      });
      return;
    }

    if (reverseRequest && reverseRequest.status === 'pending') {
      this.friendRequestDataService.setFriendRequest({
        senderId: otherUser.userId,
        recipientId: from.id,
        status: 'rejected',
      });
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          `You have rejected the friend request from ${otherUserName}\\.`,
        ),
      });
      return;
    }
  }

  private listFriends(from: TelegramUser, chatId: number): void {
    const friendIds = this.friendDataService.getFriends(from.id);

    if (friendIds.length === 0) {
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          'You have no friends yet\\. Use /friend add <username> to add friends\\.',
        ),
      });
      return;
    }

    const friendNames: string[] = [];
    for (const friendId of friendIds) {
      const friendUser = this.userDataService.getUser(friendId);
      if (friendUser) {
        const displayName = friendUser.username
          ? `@${friendUser.username}`
          : friendUser.firstName;
        friendNames.push(displayName);
      }
    }

    const friendsList = friendNames.join('\n');
    TelegramService.sendMessage({
      chatId,
      markdown: new MarkdownBuilder(`*Your Friends*\n\n${friendsList}`),
    });
  }

  private findUserByUsername(username: string): AppUser | null {
    const cleanUsername = username.startsWith('@')
      ? username.slice(1)
      : username;
    const allUsers = this.getAllUsers();
    return allUsers.find((user) => user.username === cleanUsername) || null;
  }

  private getAllUsers(): AppUser[] {
    const users: AppUser[] = [];
    const sheet = this.userDataService['spreadsheetService']['getSheet']();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) return users;

    for (let row = 2; row <= lastRow; row++) {
      const data = sheet.getRange(row, 1, 1, 6).getValues()[0];
      if (data[1] !== '[DELETED]') {
        const user = {
          userId: data[0],
          firstName: data[1],
          lastName: data[2],
          username: data[3],
          createdAt: data[4],
          updatedAt: data[5],
        };
        if (typeof user.userId === 'number') {
          users.push(user as AppUser);
        }
      }
    }

    return users;
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

    TelegramService.sendMessage({
      chatId: senderChatId,
      markdown: new MarkdownBuilder(
        `Friend request sent to ${recipientName}\\.`,
      ),
    });

    TelegramService.sendMessage({
      chatId: recipient.userId,
      markdown: new MarkdownBuilder(`${senderName} wants to be your friend\\!`),
      replyMarkup: {
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
    });
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

    TelegramService.sendMessage({
      chatId: accepterChatId,
      markdown: new MarkdownBuilder(
        `You are now friends with ${senderName}\\!`,
      ),
    });

    TelegramService.sendMessage({
      chatId: sender.userId,
      markdown: new MarkdownBuilder(
        `${accepterName} accepted your friend request\\!`,
      ),
    });
  }
}
