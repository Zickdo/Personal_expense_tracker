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
  description TEXT NOT NULL
)`);


app.get("/", (req, res) => {
  res.send("Hello from my expense app! You guys are amazing!!! ❤️");
});

app.post("/expenses/:id", (req, res) => {
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
  const id = req.params.id;
  expensesDB.run("INSERT INTO expenses(nameOfExpense, amount, currency, description) VALUES (?, ?, ?, ?)", [nameOfExpense, amount, currency, description]);
  res.status(201).json({ message: "Expense created successfully" });
});
app.listen(PORT, () => {
    console.log( `Server is running on port ${PORT}`);
});