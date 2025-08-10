export interface FriendRequest {
  id: string;
  senderId: number;
  recipientId: number;
  status: 'pending' | 'rejected' | 'cancelled';
}

export interface FriendRequestUpdate {
  senderId: number;
  recipientId: number;
  status: 'pending' | 'rejected' | 'cancelled';
}

export interface Friendship {
  userId: number;
  friendId: number;
  createdAt: Date;
}
