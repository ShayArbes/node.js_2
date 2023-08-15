const express = require("express");
const db = require("./db");
const app = express();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
app.use(express.json());

let s = {email: "shayarbes@gmail.com",password: "123"};
app.get("/users", (req, res) => {
  res.send(JSON.stringify(db));
});

app.get("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const user = db.find((u) => u.id === userId);
  console.log(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.send(JSON.stringify(user));
});

app.post("/users", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.log(email);
    console.log(password);

    return res.status(400).json({ error: "Missing required fields" });
  }
  const newUser = { email, password };
  db.push(newUser);

  fs.writeFile("db.js", db, (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
});

app.listen(3000, () => console.log("Server started on port 3000"));
