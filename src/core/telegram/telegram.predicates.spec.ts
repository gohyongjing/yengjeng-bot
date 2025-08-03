import { isUpdate } from './telegram.predicates';

describe('TelegramPredicates', () => {
  describe('isUpdate', () => {
    // String inputs taken from examples in https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates
    const updateObjects = {
      message:
        '{ "update_id":10000, "message":{ "date":1441645532, "chat":{ "last_name":"Test Lastname", "id":1111111, "type": "private", "first_name":"Test", "username":"Test" }, "message_id":1365, "from":{ "last_name":"Test Lastname", "id":1111111, "is_bot": false, "first_name":"Test", "username":"Test" }, "text":"/start" } }',
      'forwarded message':
        '{ "update_id":10000, "message":{ "date":1441645532, "chat":{ "last_name":"Test Lastname", "id":1111111, "type": "private", "first_name":"Test Firstname", "username":"Testusername" }, "message_id":1365, "from":{ "last_name":"Test Lastname", "id":1111111, "is_bot": false, "first_name":"Test Firstname", "username":"Testusername" }, "forward_from": { "last_name":"Forward Lastname", "id": 222222, "first_name":"Forward Firstname" }, "forward_date":1441645550, "text":"/start" } }',
      'forwarded channel message':
        '{ "update_id":10000, "message":{ "date":1441645532, "chat":{ "last_name":"Test Lastname", "type": "private", "id":1111111, "first_name":"Test Firstname", "username":"Testusername" }, "message_id":1365, "from":{ "last_name":"Test Lastname", "id":1111111, "is_bot": false, "first_name":"Test Firstname", "username":"Testusername" }, "forward_from": { "id": -10000000000, "type": "channel", "title": "Test channel" }, "forward_date":1441645550, "text":"/start" } }',
      'message with reply':
        '{ "update_id":10000, "message":{ "date":1441645532, "chat":{ "last_name":"Test Lastname", "type": "private", "id":1111111, "first_name":"Test Firstname", "username":"Testusername" }, "message_id":1365, "from":{ "last_name":"Test Lastname", "id":1111111, "is_bot": false, "first_name":"Test Firstname", "username":"Testusername" }, "text":"/start", "reply_to_message":{ "date":1441645000, "chat":{ "last_name":"Reply Lastname", "type": "private", "id":1111112, "first_name":"Reply Firstname", "username":"Testusername" }, "message_id":1334, "text":"Original" } } }',
      'edited message':
        '{ "update_id":10000, "edited_message":{ "date":1441645532, "chat":{ "last_name":"Test Lastname", "type": "private", "id":1111111, "first_name":"Test Firstname", "username":"Testusername" }, "message_id":1365, "from":{ "last_name":"Test Lastname", "id":1111111, "is_bot": false, "first_name":"Test Firstname", "username":"Testusername" }, "text":"Edited text", "edit_date": 1441646600 } }',
      'callback query':
        '{ "update_id": 756195662, "callback_query": { "id": "3075194689670475767", "from": { "id": 715999558, "is_bot": false, "first_name": "Test FirstName", "username": "test_username", "language_code": "en" }, "message": { "message_id": 282, "from": { "id": 6833000441, "is_bot": true, "first_name": "test bot", "username": "testbot" }, "chat": { "id": 715999558, "first_name": "Test Firstname", "username": "test_username", "type": "private" }, "date": 1752909962, "text": "Is the word AA a valid Scrabble word?", "reply_markup": { "inline_keyboard": [ [ { "text": "Yes", "callback_data": "SCRABBLE GUESS YES" }, { "text": "No", "callback_data": "SCRABBLE GUESS NO" } ] ] } }, "chat_instance": "-4661477233836774021", "data": "SCRABBLE GUESS YES" } }',
    };

    describe('given update object', () => {
      it.each(Object.keys(updateObjects) as (keyof typeof updateObjects)[])(
        'should return true for %s update object',
        (key) => {
          const actual = isUpdate(JSON.parse(updateObjects[key]));
          expect(actual).toBeTruthy();
        },
      );
    });

    const nonUpdateObjects = {
      string: 'abc',
      array: [{ update_id: 123 }],
      'object with missing fields': { update_id: 123 },
    };

    describe('given object with missing keys', () => {
      it.each(
        Object.keys(nonUpdateObjects) as (keyof typeof nonUpdateObjects)[],
      )('should return false for items of type %s', (key) => {
        const actual = isUpdate(nonUpdateObjects[key]);
        expect(actual).toBeFalsy();
      });
    });
  });
});
