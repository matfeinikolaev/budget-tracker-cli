import { v4 as uuidv4 } from 'uuid';
import { IAccount, ITransaction } from '../types';

export class Account implements IAccount {
  readonly id: string;
  name: string;
  transactions: ITransaction[];

  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
    this.transactions = [];
  }

  addTransaction(transaction: ITransaction): void {
    this.transactions.push(transaction);
  }

  removeTransaction(transactionId: string): boolean {
    const index = this.transactions.findIndex((t) => t.id === transactionId);
    if (index === -1) return false;
    this.transactions.splice(index, 1);
    return true;
  }

  get balance(): number {
    return this.transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);
  }
}
