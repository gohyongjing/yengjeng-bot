export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUpdate {
  userId: number;
  firstName: string;
  lastName: string;
  username: string;
}

export interface UserQuery {
  userId?: number;
  username?: string;
}
