import * as fs from 'fs';
import * as path from 'path';
import { Account } from '../models/Account';
import { IAccount } from '../types';

export class AccountManager {
  private accounts: Account[] = [];

  getAccounts(): Account[] {
    return this.accounts;
  }

  getAccount(id: string): Account | undefined {
    return this.accounts.find((a) => a.id === id);
  }

  createAccount(name: string): Account {
    const account = new Account(name);
    this.accounts.push(account);
    return account;
  }

  deleteAccount(id: string): boolean {
    const index = this.accounts.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.accounts.splice(index, 1);
    return true;
  }

  exportToCSV(account: IAccount, outputDir: string = '.'): string {
    const rows = [
      'id,type,amount,category,date,description',
      ...account.transactions.map((t) =>
        [t.id, t.type, t.amount, t.category, t.date, `"${t.description}"`].join(',')
      ),
    ];
    const filePath = path.join(outputDir, `${account.name.replace(/\s+/g, '_')}.csv`);
    fs.writeFileSync(filePath, rows.join('\n'), 'utf-8');
    return filePath;
  }
}
