import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { MockUser, MockUser2 } from '@core/telegram/telegram.mock';
import { User } from '@features/user';
import { FriendRequest, Friendship } from './friend.type';

export const createMockSpreadsheetWithData = (
  users: User[],
  friends: Friendship[] = [],
  friendRequests: FriendRequest[] = [],
) => {
  const usersSheet = users.map((user) => [
    user.userId,
    user.firstName,
    user.lastName,
    user.username,
    user.createdAt,
    user.updatedAt,
  ]);
  const friendsSheet = friends.map((friendship) => [
    friendship.id,
    friendship.userId,
    friendship.friendId,
    friendship.createdAt,
  ]);
  const friendRequestsSheet = friendRequests.map((request) => [
    request.id,
    request.senderId,
    request.recipientId,
    request.status,
  ]);

  return createMockSpreadsheetApp({
    TEST_SPREADSHEET_ID: {
      user_service: usersSheet,
      friends: friendsSheet,
      friend_requests: friendRequestsSheet,
    },
  });
};

export const requestSender = {
  userId: MockUser.id,
  firstName: MockUser.first_name,
  lastName: MockUser.last_name ?? 'senderlastname',
  username: MockUser.username ?? 'senderusername',
  createdAt: new Date(2024, 0, 1),
  updatedAt: new Date(2024, 0, 1),
};
export const requestRecipient = {
  userId: MockUser2.id,
  firstName: MockUser2.first_name,
  lastName: MockUser2.last_name ?? 'Smith',
  username: MockUser2.username ?? 'janesmith',
  createdAt: new Date(2024, 0, 2),
  updatedAt: new Date(2024, 0, 2),
};
const users = [requestSender, requestRecipient];

export const setupState = {
  senderNotFound: () => createMockSpreadsheetWithData([requestRecipient]),
  recipientNotFound: () => createMockSpreadsheetWithData([requestSender]),
  noRequests: () => createMockSpreadsheetWithData(users),
  senderPendingRequest: () =>
    createMockSpreadsheetWithData(
      users,
      [],
      [
        {
          id: `${requestSender.userId}-${requestRecipient.userId}`,
          senderId: requestSender.userId,
          recipientId: requestRecipient.userId,
          status: 'pending',
        },
      ],
    ),
  recipientPendingRequest: () =>
    createMockSpreadsheetWithData(
      users,
      [],
      [
        {
          id: `${requestRecipient.userId}-${requestSender.userId}`,
          senderId: requestRecipient.userId,
          recipientId: requestSender.userId,
          status: 'pending',
        },
      ],
    ),
  senderCancelledRequest: () =>
    createMockSpreadsheetWithData(
      users,
      [],
      [
        {
          id: `${requestSender.userId}-${requestRecipient.userId}`,
          senderId: requestSender.userId,
          recipientId: requestRecipient.userId,
          status: 'cancelled',
        },
      ],
    ),
  recipientCancelledRequest: () =>
    createMockSpreadsheetWithData(
      users,
      [],
      [
        {
          id: `${requestRecipient.userId}-${requestSender.userId}`,
          senderId: requestRecipient.userId,
          recipientId: requestSender.userId,
          status: 'cancelled',
        },
      ],
    ),
  senderRejectedRequest: () =>
    createMockSpreadsheetWithData(
      users,
      [],
      [
        {
          id: `${requestRecipient.userId}-${requestSender.userId}`,
          senderId: requestRecipient.userId,
          recipientId: requestSender.userId,
          status: 'rejected',
        },
      ],
    ),
  recipientRejectedRequest: () =>
    createMockSpreadsheetWithData(
      users,
      [],
      [
        {
          id: `${requestSender.userId}-${requestRecipient.userId}`,
          senderId: requestSender.userId,
          recipientId: requestRecipient.userId,
          status: 'rejected',
        },
      ],
    ),
  alreadyFriends: () =>
    createMockSpreadsheetWithData(users, [
      {
        id: `${requestSender.userId}-${requestRecipient.userId}`,
        userId: requestSender.userId,
        friendId: requestRecipient.userId,
        createdAt: new Date(2024, 0, 1),
      },
    ]),
  multipleUsers: () =>
    createMockSpreadsheetWithData([
      ...users,
      {
        userId: 3,
        firstName: 'Bob',
        lastName: 'Johnson',
        username: 'bobjohnson',
        createdAt: new Date(2024, 0, 3),
        updatedAt: new Date(2024, 0, 3),
      },
      {
        userId: 4,
        firstName: 'Alice',
        lastName: 'Brown',
        username: 'alice_brown',
        createdAt: new Date(2024, 0, 4),
        updatedAt: new Date(2024, 0, 4),
      },
    ]),
};
