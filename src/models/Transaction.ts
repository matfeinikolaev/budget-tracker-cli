import { v4 as uuidv4 } from 'uuid';
import { ITransaction, TransactionType } from '../types';

export class Transaction implements ITransaction {
  readonly id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;

  constructor(
    type: TransactionType,
    amount: number,
    category: string,
    date: string,
    description: string
  ) {
    this.id = uuidv4();
    this.type = type;
    this.amount = amount;
    this.category = category;
    this.date = date;
    this.description = description;
  }
}
