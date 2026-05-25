const express = require("express");
const sqlite3 = require("sqlite3");
const app = express();
const PORT = 4000;
app.use(express.json());

const expensesDB = new sqlite3.Database("./expenses.db");

expensesDB.run(`CREATE TABLE IF NOT EXISTS expenses ( 
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nameOfExpense TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  description TEXT NOT NULL,
  categoryID INTEGER,
  paymentMethodId INTEGER,
  FOREIGN KEY (categoryID) REFERENCES categories(id),
  FOREIGN KEY (paymentMethodId) REFERENCES paymentMethods(id)
)`);

expensesDB.run(`CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT 
)`);

expensesDB.run(`CREATE TABLE IF NOT EXISTS paymentMethods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT 
)`);

expensesDB.run(`CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoryId INTEGER NOT NULL,
  monthYear TEXT NOT NULL,
  "limit" REAL NOT NULL,
  FOREIGN KEY (categoryId) REFERENCES categories(id)
)`);

app.delete("/expenses/:id", (req, res) => {
  const id = req.params.id;

  expensesDB.get("SELECT id FROM expenses WHERE id = ?", [id], (error, row) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!row) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expensesDB.run("DELETE FROM expenses WHERE id = ?", [id], function (deleteError) {
      if (deleteError) {
        return res.status(500).json({ error: deleteError.message });
      }
      return res.status(200).json({ message: "Expense successfully deleted" });
    });
  });
});


app.put("/expenses/:id", (req, res) => {
  const { nameOfExpense, amount, currency, description } = req.body;
  const expenseId = req.params.id;
  if (!nameOfExpense || !amount || !currency || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (typeof nameOfExpense !== "string" || nameOfExpense.trim() === "" ){
    return res.status(400).json({ error: "Your expense input must be a non-empty string" });

  }
  if(typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }
  if (typeof currency !== "string" || currency.trim() === "") {
    return res.status(400).json({ error: "Currency must be a non-empty string" });
  }
  if (typeof description !== "string" || description.trim() === "") {
    return res.status(400).json({ error: "Description must be a non-empty string" });
  }
  if (description.length > 255) {
    return res.status(400).json({ error: "Description must be less than 255 characters" });
  }
  

  expensesDB.get("SELECT id FROM expenses WHERE id = ?", [expenseId], (error, row) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }
    expensesDB.run(
      "UPDATE expenses SET nameOfExpense = ?, amount = ?, currency = ?, description = ? WHERE id = ?",
      [nameOfExpense, amount, currency, description, expenseId],
      function (error) {
        if (error) {
          res.status(500).json({ error: error.message });
          return;
        }

        res.json({ message: "Expense updated successfully!" });
      },
    );
  });
});


app.get("/expenses", (req, res) => {
  const { currency, minAmount, maxAmount, nameOfExpense, description } = req.query;

  let sql = "SELECT * FROM expenses";
  const conditions = [];
  const params = [];

  if (currency) {
    conditions.push("currency = ?");
    params.push(currency);
  }
  if (minAmount !== undefined) {
    const min = parseFloat(minAmount);
    if (isNaN(min)) {
      return res.status(400).json({ error: "Invalid minAmount parameter" });
    }
    conditions.push("amount >= ?");
    params.push(min);
  }
  if (maxAmount !== undefined) {
    const max = parseFloat(maxAmount);
    if (isNaN(max)) {
      return res.status(400).json({ error: "Invalid maxAmount parameter" });
    }
    conditions.push("amount <= ?");
    params.push(max);
  }
  if (nameOfExpense) {
    conditions.push("nameOfExpense LIKE ?");
    params.push(`%${nameOfExpense}%`);
  }
  if (description) {
    conditions.push("description LIKE ?");
    params.push(`%${description}%`);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  expensesDB.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No expenses found" });
    }
    res.json(rows);
  });
});

app.get("/expenses/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM expenses WHERE id = ?";
  expensesDB.get(sql, [id], (error, row) => {
    if (error) {
      return res.status(500).json({ error: "DB error" });
    }
    if (!row) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(row);
  });
});

app.get("/", (req, res) => {
  res.send("Hello from my expense app! You guys are amazing!!! ❤️");
});

app.post("/expenses", (req, res) => {
  const nameOfExpense = req.body.nameOfExpense;
  const amount = req.body.amount;
  const currency = req.body.currency;
  const description = req.body.description;
    
  if (!nameOfExpense || !amount || !currency || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (typeof nameOfExpense !== "string" || nameOfExpense.trim() === "" ){
    return res.status(400).json({ error: "Your expense input must be a non-empty string" });

  }
  if(typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }
  if (typeof currency !== "string" || currency.trim() === "") {
    return res.status(400).json({ error: "Currency must be a non-empty string" });
  }
  if (typeof description !== "string" || description.trim() === "") {
    return res.status(400).json({ error: "Description must be a non-empty string" });
  }
  if (description.length > 255) {
    return res.status(400).json({ error: "Description must be less than 255 characters" });
  }
  expensesDB.run("INSERT INTO expenses(nameOfExpense, amount, currency, description) VALUES (?, ?, ?, ?)", [nameOfExpense, amount, currency, description]);
  res.status(201).json({ message: "Expense created successfully" });
});

app.post("/categories", (req, res) => {
  const name = req.body.name;
  const description = req.body.description;

  if (!name) {
    return res.status(400).json({ error: "Missing required field: name" });
  } 
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Name must be a non-empty string" });
  }
  if (description && (typeof description !== "string" || description.trim() === "")) {
    return res.status(400).json({ error: "Description must be a non-empty string if provided" });
  }
  expensesDB.run("INSERT INTO categories(name, description) VALUES (?, ?)", [name, description]);
  res.status(201).json({ message: "Category created successfully" });
});

app.post("/payment-methods", (req, res) => {
  const name = req.body.name;
  const type = req.body.type;
  if (!name) {
    return res.status(400).json({ error: "Missing required field: name" });
  }
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Name must be a non-empty string" });
  }
  if (type && (typeof type !== "string" || type.trim() === "")) {
    return res.status(400).json({ error: "Type must be a non-empty string if provided" });
  }
  expensesDB.run("INSERT INTO paymentMethods(name, type) VALUES (?, ?)", [name, type]);
  res.status(201).json({ message: "Payment method created successfully" });
});

app.post("/budgets", (req, res) => {
  const categoryId = req.body.categoryId;
  const monthYear = req.body.monthYear;
  const limit = req.body.limit;
  if (!categoryId || !monthYear || !limit) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (typeof categoryId !== "number" || categoryId <= 0) {
    return res.status(400).json({ error: "Category ID must be a positive number" });
  }
  if (typeof monthYear !== "string" || monthYear.trim() === "") {
    return res.status(400).json({ error: "Month-Year must be a non-empty string" });
  }
  if (typeof limit !== "number" || limit < 0) {
    return res.status(400).json({ error: "Limit must be a non-negative number" });
  }
  expensesDB.run("INSERT INTO budgets(categoryId, monthYear, limit) VALUES (?, ?, ?)", [categoryId, monthYear, limit]);
  res.status(201).json({ message: "Budget created successfully" });

});
app.listen(PORT, () => {
    console.log( `Server is running on port ${PORT}`);
});