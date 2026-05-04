const express = require("express");
const sqlite3 = require("sqlite3");
const app = express();
const PORT = 3000;
app.use(express.json());

app.listen(PORT, () => {
    console.log( `Server is running on port ${PORT}`);
});