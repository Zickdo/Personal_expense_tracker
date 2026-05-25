# Personal Expense Tracker

A simple Node.js + Express app for tracking personal expenses using SQLite. It supports categories, payment methods, budgets, and enriched expense responses with joined data.

## Project overview

This project stores expense records in an SQLite database and exposes a REST API for:
- creating, reading, updating, and deleting expenses
- managing categories and payment methods
- tracking budgets per category and month
- returning expense details with category and payment method labels

## Key features

- `expenses` table with category and payment method links
- `categories` table for expense classifications
- `paymentMethods` table for how expenses were paid
- `budgets` table for category spending limits by month
- joined API responses that include category and payment method names

## Database structure

### expenses
- `id` - primary key
- `nameOfExpense` - expense name
- `amount` - expense amount
- `currency` - currency code or symbol
- `description` - expense details
- `categoryId` - linked category
- `paymentMethodId` - linked payment method
- `createdAt` - timestamp when the expense was created

### categories
- `id` - primary key
- `name` - category name
- `description` - optional category description

### paymentMethods
- `id` - primary key
- `name` - payment method name
- `type` - optional method type (e.g. cash, card)

### budgets
- `id` - primary key
- `categoryId` - linked category
- `monthYear` - month identifier like `2026-05`
- `"limit"` - budget amount for the category and month

## API endpoints

### Categories
- `POST /categories` - create a category
- `GET /categories` - list all categories

### Payment methods
- `POST /payment-methods` - create a payment method
- `GET /payment-methods` - list all payment methods

### Budgets
- `POST /budgets` - create a budget for a category/month
- `GET /budgets` - list all budgets

### Expenses
- `GET /expenses` - list expenses with category and payment method names
- `GET /expenses/:id` - get a single expense with its linked names
- `POST /expenses` - create an expense with `categoryId` and `paymentMethodId`
- `PUT /expenses/:id` - update an expense and its linked fields
- `DELETE /expenses/:id` - delete an expense

### Reports
- `GET /reports/category-spending?monthYear=YYYY-MM` - get spending and budget data by category for a month

## How to run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   node server.js
   ```
3. Open the API at `http://localhost:4000`

## Example request bodies

### Create a category
```json
{
  "name": "Food",
  "description": "Meals, snacks, and groceries"
}
```

### Create a payment method
```json
{
  "name": "Credit Card",
  "type": "Card"
}
```

### Create a budget
```json
{
  "categoryId": 1,
  "monthYear": "2026-05",
  "limit": 500
}
```

### Create an expense
```json
{
  "nameOfExpense": "Lunch",
  "amount": 12.5,
  "currency": "USD",
  "description": "Business lunch with client",
  "categoryId": 1,
  "paymentMethodId": 1
}
```

## Notes

- `limit` is quoted in SQLite as a reserved keyword.
- The server automatically creates missing tables on startup.
- `categoryId` and `paymentMethodId` are validated before creating or updating an expense.
