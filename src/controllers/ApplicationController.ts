import inquirer from 'inquirer';
import { AccountManager } from './AccountManager';
import { Transaction } from '../models/Transaction';
import { Account } from '../models/Account';
import { TransactionType } from '../types';

export class ApplicationController {
  private manager: AccountManager = new AccountManager();

  async run(): Promise<void> {
    await this.mainMenu();
  }

  private async mainMenu(): Promise<void> {
    console.clear();
    const accounts = this.manager.getAccounts();
    const accountChoices = accounts.map((a) => ({
      name: `${a.name}  (баланс: ${a.balance.toFixed(2)})`,
      value: a.id,
    }));

    const choices = [
      ...accountChoices,
      new inquirer.Separator(),
      { name: '➕ Создать новый счёт', value: '__create__' },
      { name: '🚪 Выход', value: '__exit__' },
    ];

    const { action } = await inquirer.prompt<{ action: string }>([
      {
        type: 'list',
        name: 'action',
        message: '💰 Бюджет-трекер - выберите счёт или действие:',
        choices,
      },
    ]);

    if (action === '__exit__') {
      console.log('До свидания!');
      return;
    }
    if (action === '__create__') {
      await this.createAccount();
    } else {
      const account = this.manager.getAccount(action);
      if (account) await this.accountMenu(account);
    }
    await this.mainMenu();
  }

  private async createAccount(): Promise<void> {
    const { name } = await inquirer.prompt<{ name: string }>([
      {
        type: 'input',
        name: 'name',
        message: 'Название счёта:',
        validate: (v) => v.trim().length > 0 || 'Название не может быть пустым',
      },
    ]);
    const account = this.manager.createAccount(name.trim());
    console.log(`✅ Счёт "${account.name}" создан.`);
  }

  private async accountMenu(account: Account): Promise<void> {
    console.clear();
    console.log(`📂 Счёт: ${account.name}  |  Баланс: ${account.balance.toFixed(2)}`);
    console.log(`Транзакций: ${account.transactions.length}\n`);

    const { action } = await inquirer.prompt<{ action: string }>([
      {
        type: 'list',
        name: 'action',
        message: 'Действие:',
        choices: [
          { name: '📋 Просмотреть транзакции', value: 'list' },
          { name: '➕ Добавить транзакцию', value: 'add' },
          { name: '🗑  Удалить транзакцию', value: 'deleteTransaction' },
          { name: '📤 Экспорт в CSV', value: 'export' },
          { name: '❌ Удалить счёт', value: 'deleteAccount' },
          { name: '⬅  Назад', value: 'back' },
        ],
      },
    ]);

    switch (action) {
      case 'list':
        this.listTransactions(account);
        await inquirer.prompt([{ type: 'input', name: '_', message: 'Нажмите Enter...' }]);
        await this.accountMenu(account);
        break;
      case 'add':
        await this.addTransaction(account);
        await this.accountMenu(account);
        break;
      case 'deleteTransaction':
        await this.deleteTransaction(account);
        await this.accountMenu(account);
        break;
      case 'export':
        await this.exportCSV(account);
        await inquirer.prompt([{ type: 'input', name: '_', message: 'Нажмите Enter...' }]);
        await this.accountMenu(account);
        break;
      case 'deleteAccount':
        await this.deleteAccount(account);
        break;
      case 'back':
        break;
    }
  }

  private listTransactions(account: Account): void {
    console.clear();
    if (account.transactions.length === 0) {
      console.log('Транзакций нет.');
      return;
    }
    console.log(`\n${'#'.padEnd(3)} ${'Тип'.padEnd(8)} ${'Сумма'.padEnd(10)} ${'Категория'.padEnd(15)} ${'Дата'.padEnd(12)} Описание`);
    console.log('-'.repeat(70));
    account.transactions.forEach((t, i) => {
      const sign = t.type === TransactionType.Income ? '+' : '-';
      console.log(
        `${String(i + 1).padEnd(3)} ${t.type.padEnd(8)} ${(sign + t.amount.toFixed(2)).padEnd(10)} ${t.category.padEnd(15)} ${t.date.padEnd(12)} ${t.description}`
      );
    });
    console.log('-'.repeat(70));
    console.log(`Баланс: ${account.balance.toFixed(2)}\n`);
  }

  private async addTransaction(account: Account): Promise<void> {
    const answers = await inquirer.prompt<{
      type: TransactionType;
      amount: string;
      category: string;
      date: string;
      description: string;
    }>([
      {
        type: 'list',
        name: 'type',
        message: 'Тип транзакции:',
        choices: [
          { name: 'Доход', value: TransactionType.Income },
          { name: 'Расход', value: TransactionType.Expense },
        ],
      },
      {
        type: 'input',
        name: 'amount',
        message: 'Сумма:',
        validate: (v) => {
          const n = parseFloat(v);
          return (!isNaN(n) && n > 0) || 'Введите положительное число';
        },
      },
      {
        type: 'input',
        name: 'category',
        message: 'Категория:',
        validate: (v) => v.trim().length > 0 || 'Категория не может быть пустой',
      },
      {
        type: 'input',
        name: 'date',
        message: 'Дата (ГГГГ-ММ-ДД):',
        default: new Date().toISOString().slice(0, 10),
        validate: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) || 'Формат: ГГГГ-ММ-ДД',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Описание:',
        default: '',
      },
    ]);

    const transaction = new Transaction(
      answers.type,
      parseFloat(answers.amount),
      answers.category.trim(),
      answers.date,
      answers.description.trim()
    );
    account.addTransaction(transaction);
    console.log('✅ Транзакция добавлена.');
  }

  private async deleteTransaction(account: Account): Promise<void> {
    if (account.transactions.length === 0) {
      console.log('Нет транзакций для удаления.');
      return;
    }

    const { transactionId } = await inquirer.prompt<{ transactionId: string }>([
      {
        type: 'list',
        name: 'transactionId',
        message: 'Выберите транзакцию для удаления:',
        choices: account.transactions.map((t) => ({
          name: `[${t.date}] ${t.type} ${t.amount} - ${t.category}: ${t.description}`,
          value: t.id,
        })),
      },
    ]);

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      { type: 'confirm', name: 'confirm', message: 'Удалить транзакцию?', default: false },
    ]);

    if (confirm) {
      account.removeTransaction(transactionId);
      console.log('✅ Транзакция удалена.');
    }
  }

  private async exportCSV(account: Account): Promise<void> {
    const filePath = this.manager.exportToCSV(account);
    console.log(`✅ Экспортировано в: ${filePath}`);
  }

  private async deleteAccount(account: Account): Promise<void> {
    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Удалить счёт "${account.name}" и все его транзакции?`,
        default: false,
      },
    ]);

    if (confirm) {
      this.manager.deleteAccount(account.id);
      console.log(`✅ Счёт "${account.name}" удалён.`);
    }
  }
}
