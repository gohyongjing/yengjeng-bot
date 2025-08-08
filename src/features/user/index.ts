export { UserService } from './user.service';
export { UserDataService } from './user.data';
export type { UserData, UserUpdate } from './user.type';
export { isUserData, isUserUpdate } from './user.predicates';
export {
  MockUserDataA,
  MockUserDataA as MockUserDataB,
  MockUserDataB as MockUserDataC,
} from './user.mock';
