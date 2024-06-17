import { SpreadsheetService } from '@core/spreadsheet';
import { Message, TelegramService } from '@core/telegram';

export class BusService {
  spreadsheetService: SpreadsheetService;
  telegramService: TelegramService;
  SHEET_INDEX = 1;

  constructor() {
    this.spreadsheetService = new SpreadsheetService();
    this.telegramService = new TelegramService();
  }

  processMessage(message: Message) {
    const chatId = message.chat.id;
    this.telegramService.sendMessage({
      chatId,
      text: 'Gimme a sec, getting the bus timings',
    });

    const text = message.text ?? '';
    const tokens = text
      .split(' ')
      .filter((s) => s.length > 0)
      .map((s) => s.trim());

    const userSheet = this.spreadsheetService.open();
    const userRow = userSheet
      .getSheets()
      [this.SHEET_INDEX].getRange('A:D')
      .createTextFinder(chatId.toString())
      .findNext();

    const busStopId = this.getBusStopId(tokens, userRow);
    const response = this.getBusTiming(busStopId);
    this.telegramService.sendMessage({ chatId, text: response });

    if (tokens.length === 2) {
      if (userRow === null) {
        userSheet.appendRow([
          chatId,
          message.from?.first_name ?? '',
          text,
          new Date(),
        ]);
      } else {
        userRow.setValues([
          [chatId, message.from?.first_name ?? '', text, new Date()],
        ]);
      }
    }
  }

  getBusStopId(
    tokens: string[],
    userRow: GoogleAppsScript.Spreadsheet.Range | null,
  ): string {
    if (tokens.length === 1) {
      if (userRow !== null) {
        return userRow.getCell(1, 3).getValue().toString();
      }
    } else if (tokens.length === 2) {
      return tokens[1];
    }
    return '04167';
  }

  getBusTiming(busStopNo = '01113') {
    const response = UrlFetchApp.fetch(
      'https://www.sbstransit.com.sg/service/sbs-transit-app?BusStopNo=' +
        busStopNo +
        '&ServiceNo=',
    );
    const contentText = response.getContentText();
    let table = '';
    let tbody = '';
    const buses: string[] = [];
    buses.push('no buses');

    let ret = 'No buses found for Bus Stop ' + busStopNo + '! :(';

    table = this.getSubstring(
      contentText,
      '<table class="table tb-bus tbres tbbreak-app">',
      '</table>',
    );
    tbody = this.getSubstring(table, '<tbody>', '</tbody>');

    let bus = this.getSubstring(tbody, '<tr>', '</tr>');

    while (bus !== '') {
      buses.push(bus);
      bus = this.getSubstring(tbody, '<tr>', '</tr>');
      tbody = tbody.slice(bus.length);
    }

    ret = '----- BUS STOP ' + busStopNo + ' -----';
    for (bus of buses) {
      let busNo = '0';
      const newbusNo = this.getSubstring(
        bus,
        '<td width="52%" class="text-left">',
        '</td>',
      ).split(' ')[0];
      if (newbusNo !== busNo) {
        busNo = newbusNo;
        const busColour1 = this.getSubstring(
          bus,
          '<td width="24%" class="text-left"><span class="',
          '">',
        );
        const nextArrival = this.getSubstring(
          bus,
          '<td width="24%" class="text-left"><span class="' + busColour1 + '">',
          '</span>',
        );

        const secondHalf = bus.slice(bus.length / 2);

        const busColour2 = this.getSubstring(
          secondHalf,
          '<td width="24%" class="text-left"><span class="',
          '">',
        );
        const subsequentArrival = this.getSubstring(
          secondHalf,
          '<td width="24%" class="text-left"><span class="' + busColour2 + '">',
          '</span>',
        );
        ret =
          ret +
          '\nBus ' +
          busNo +
          ': ' +
          nextArrival +
          ', ' +
          subsequentArrival;
      }
    }
    return ret;
  }

  getSubstring(string_: string, start_: string, end_: string): string {
    let slice1 = '';
    if (string_.indexOf(start_) !== -1) {
      slice1 = string_.substring(
        string_.indexOf(start_) + start_.length,
        string_.length,
      );
    } else {
      return '';
    }
    if (slice1.indexOf(end_) !== -1) {
      return slice1.substring(0, slice1.indexOf(end_));
    } else {
      return '';
    }
  }
}
