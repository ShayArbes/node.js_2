//-------------------------------------------------------
const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const validator = require('validator');
const app = express();
let db = fs.readFileSync("./db.json");
app.use(express.json());
db = JSON.parse(`${db}`);
//-------------------------------------------------------
const saltRounds = 10;
const myPlaintextPassword = "s0//P4$$w0rD";
const someOtherPlaintextPassword = "not_bacon";

//-------------------------------------------------------

app.get("/users", (req, res) => {
  res.json(db);
});

app.get("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const user = db.find((u) => u.id === userId);
  console.log(userId);
  if (!user) {
    return res.status(403).json({ error: "User not found" });
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

  const isValidEmail = validator.isEmail(email); 
  const isValidPassword =  validator.isStrongPassword(password, {
    minLength: 8, 
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 0
  });
  if (!isValidEmail) {
    return res.status(403).json({ error: "Invalid email" });
  }
  console.log(isValidPassword);
  console.log(password);
  if (!isValidPassword) {
    return res.status(403).json({ error: "Invalid password" });
  }
  const newUser = { id: uuidv4(), email, password };

  const hash = bcrypt.hashSync(newUser.password, saltRounds);
  newUser.password = hash;
  db.push(newUser);
  saveToFile(db);
  //return something to the user
  res.status(200).send();
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.log(email);
    console.log(password);
    return res.status(400).json({ error: "Missing required fields" });
  }
  const user = db.find((u) => {
    return u.email === email && bcrypt.compareSync(password, u.password);
  });
  if (user) {
    res.status(200).json(`Hello ${email}`);
  } else {
    res.status(403).json({ error: "User does not exist!" });
  }
});

app.put("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const index = db.findIndex((user) => user.id === userId);

  if (index === undefined) {
    return res.status(404).json({ error: "User not found" });
  }
  const { email, password } = req.body;

  db[index].email = email ? email : db[index].email;
  if (email) {
    const isValidEmail = validator.isEmail(email);
    if (!isValidEmail) {
      return res.status(403).json({ error: "Invalid email" });
    }
  }
  if (password) {
    const isValidPassword = validator.isStrongPassword(password);
    if (!isValidPassword) {
      return res.status(403).json({ error: "Invalid password" });
    }
    const hash = bcrypt.hashSync(password, saltRounds);
    db[index].password = hash;
    saveToFile(db);
  }
  return res.status(200).send();
});

app.delete("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const index = db.findIndex((user) => user.id === userId);
  console.log(userId);

  console.log(index);
  if (index === undefined) {
    return res.status(404).json({ error: "User not found" });
  }
  const { email, password } = req.body;
  db.splice(index, 1);

  saveToFile(db);

  return res.status(200).send();
});

const saveToFile = (db) => {
  fs.writeFile("db.json", JSON.stringify(db), (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
};
app.listen(3000, () => console.log("Server started on port 3000"));
