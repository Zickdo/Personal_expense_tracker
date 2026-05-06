const express = require("express");
const sqlite3 = require("sqlite3");
const app = express();
const PORT = 4000;
app.use(express.json());

const expensesDB = new sqlite3.Database("./expenses.db");

app.get("/", (req, res) => {
  res.send("Hello from my expense app! You guys are amazing!!! ❤️");
});

app.post("/expenses", (req, res) => {
  const amount = req.body.amount;
  const currency = req.body.currency;
  const description = req.body.description;
  const date = new Date().toISOString();
})
app.listen(PORT, () => {
    console.log( `Server is running on port ${PORT}`);
});