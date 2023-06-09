const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "twitterClone.db");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/", async (request, response) => {
  const getUserQuery = `SELECT * FROM user;`;
  const usersList = await db.all(getUserQuery);
  response.send(usersList);
});

app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const getUserQuery = `
    SELECT * FROM user WHERE username = '${username};
  `;
  const dbUser = await db.get(getUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
        INSERT INTO user
        (username, password, name, gender)
        VALUES
        (
            '${username}',
            '${hashedPassword}',
            '${name}',
            '${gender}'
        );
      `;
    await db.run(createUserQuery);
    response.send("User created successfully");
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

module.exports = app;
