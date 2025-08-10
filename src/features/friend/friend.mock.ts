import { FriendRequest, Friendship } from './friend.type';

export const mockFriendRequests: FriendRequest[] = [
  { id: '1-2', senderId: 1, recipientId: 2, status: 'pending' },
  { id: '3-1', senderId: 3, recipientId: 1, status: 'rejected' },
  { id: '2-4', senderId: 2, recipientId: 4, status: 'cancelled' },
];

export const mockFriends: Friendship[] = [
  { userId: 1, friendId: 3, createdAt: new Date('2024-01-01') },
  { userId: 2, friendId: 5, createdAt: new Date('2024-01-02') },
  { userId: 3, friendId: 1, createdAt: new Date('2024-01-01') },
  { userId: 5, friendId: 2, createdAt: new Date('2024-01-02') },
];
