import { UserData } from './user.data';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { MockUserDataA, MockUserDataB } from './user.mock';
import { UserUpdate } from './user.type';

describe('UserDataService', () => {
  let underTest: UserData;

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    underTest = new UserData();
    jest.clearAllMocks();
  });

  describe('updateUser', () => {
    it('should create a new user successfully', () => {
      expect(createUser(underTest, MockUserDataA)).not.toBeNull();
    });

    it('should update existing user successfully', () => {
      underTest.updateUser(MockUserDataA);

      const result = underTest.updateUser({
        ...MockUserDataB,
        userId: MockUserDataA.userId,
      });

      expect(result).toBeDefined();
      expect(result?.userId).toBe(MockUserDataA.userId);
      expect(result?.firstName).toBe(MockUserDataB.firstName);
      expect(result?.lastName).toBe(MockUserDataB.lastName);
      expect(result?.username).toBe(MockUserDataB.username);
    });
  });

  describe('getUser', () => {
    describe('when userId is provided', () => {
      it('should return null for non-existent user', () => {
        const result = underTest.getUser({ userId: 999999 });
        expect(result).toBeNull();
      });

      it('should return user data for existing user', () => {
        createUser(underTest, MockUserDataA);
        const result = underTest.getUser({ userId: MockUserDataA.userId });

        expect(result).toBeDefined();
        expect(result?.userId).toBe(MockUserDataA.userId);
        expect(result?.firstName).toBe(MockUserDataA.firstName);
        expect(result?.lastName).toBe(MockUserDataA.lastName);
        expect(result?.username).toBe(MockUserDataA.username);
      });
    });

    describe('when username is provided', () => {
      it('should return null for non-existent user', () => {
        const result = underTest.getUser({ username: 'nonexistent' });
        expect(result).toBeNull();
      });

      it('should return user data for existing user', () => {
        createUser(underTest, MockUserDataA);
        const result = underTest.getUser({ username: MockUserDataA.username });

        expect(result).toBeDefined();
        expect(result?.userId).toBe(MockUserDataA.userId);
        expect(result?.firstName).toBe(MockUserDataA.firstName);
        expect(result?.lastName).toBe(MockUserDataA.lastName);
        expect(result?.username).toBe(MockUserDataA.username);
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete existing user successfully', () => {
      createUser(underTest, MockUserDataA);
      const result = underTest.deleteUser(MockUserDataA.userId);

      expect(result).toBe(true);
      expect(underTest.getUser({ userId: MockUserDataA.userId })).toBeNull();
    });

    it('should return false for non-existent user', () => {
      const result = underTest.deleteUser(999999);
      expect(result).toBe(false);
    });
  });

  function createUser(underTest: UserData, user: UserUpdate) {
    const result = underTest.updateUser(user);
    expect(result).not.toBeNull();
    expect(result?.userId).toBe(user.userId);
    expect(result?.firstName).toBe(user.firstName);
    expect(result?.lastName).toBe(user.lastName);
    expect(result?.username).toBe(user.username);
    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.updatedAt).toBeInstanceOf(Date);
    return result;
  }
});
