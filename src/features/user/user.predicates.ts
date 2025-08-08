import { hasKey, isObject } from '@core/util/predicates';
import { UserData, UserUpdate } from './user.type';

export function isUserData(u: unknown): u is UserData {
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
