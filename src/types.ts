export enum TransactionType {
  Income = 'income',
  Expense = 'expense',
}

export interface ITransaction {
  readonly id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface IAccount {
  readonly id: string;
  name: string;
  transactions: ITransaction[];
}
