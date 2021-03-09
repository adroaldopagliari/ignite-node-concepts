const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find((user) => user.username === username);

  if (userAlreadyExists) {
    return response
      .status(400)
      .json({ error: "User already exists with the same username" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;

  const todo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(200).json(user.todos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoFound = todos.find((todo) => todo.id === id);

  if (todoFound) {
    return response.status(400).json({ error: "Todo not found" });
  }

  const todoDone = { ...todoFound, title, deadline };

  return response.status(200).json(todoDone);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;

  const todoFound = todos.find((todo) => todo.id === id);

  if (todoFound) {
    return response.status(400).json({ error: "Todo not found" });
  }

  const todoDone = { ...todoFound, done: true };

  return response.status(200).json(todoDone);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  const todosAfterDelete = todos.filter((todo) => todo.id !== id);

  return response.status(200).json(todosAfterDelete);
});

module.exports = app;
