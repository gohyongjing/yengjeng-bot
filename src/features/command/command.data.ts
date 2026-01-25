import { SpreadsheetService } from '@core/spreadsheet/spreadsheet.service';

export class CommandData {
  private static SHEET_NAME = 'command_service';
  private spreadsheetService;

  constructor() {
    this.spreadsheetService = new SpreadsheetService(CommandData.SHEET_NAME, [
      'User Id',
      'Command',
    ]);
  }

  updateCommand(userId: number, newCommand: string) {
    return this.spreadsheetService.updateRow(1, userId.toString(), [
      userId,
      newCommand,
    ]);
  }

  readCommand(userId: number): string | null {
    const data = this.spreadsheetService.readRow(1, userId.toString());
    return data && typeof data[1] === 'string' ? data[1] : null;
  }
}
