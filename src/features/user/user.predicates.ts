import { hasKey, isObject } from '@core/util/predicates';
import { User, UserUpdate } from './user.type';

export function isUser(u: unknown): u is User {
  return (
    isObject(u) &&
    hasKey(u, 'userId') &&
    typeof u.userId === 'number' &&
    hasKey(u, 'firstName') &&
    typeof u.firstName === 'string' &&
    hasKey(u, 'createdAt') &&
    u.createdAt instanceof Date &&
    hasKey(u, 'updatedAt') &&
    u.updatedAt instanceof Date &&
    (!hasKey(u, 'lastName') || typeof u.lastName === 'string') &&
    (!hasKey(u, 'username') || typeof u.username === 'string')
  );
}

export function isUserUpdate(u: unknown): u is UserUpdate {
  return (
    isObject(u) &&
    hasKey(u, 'userId') &&
    typeof u.userId === 'number' &&
    (!hasKey(u, 'firstName') || typeof u.firstName === 'string') &&
    (!hasKey(u, 'lastName') || typeof u.lastName === 'string') &&
    (!hasKey(u, 'username') || typeof u.username === 'string')
  );
}
