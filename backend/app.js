import express from 'express';
import cors from 'cors';
import { appendTask, appendTodo, clearTask, clearTasks, clearTodo, clearTodos, getTasks, getTodos } from '../lib/todo.js';
import path from 'path'
import sqlite3 from 'sqlite3';

//db instance
var db = new sqlite3.Database('./todo.db');

db.serialize(function () {
  db.run("CREATE TABLE lorem (info TEXT)");
  
  var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for(var i = 0; i < 10; i++) {
    stmt.run("Impsum " + i);
  }
  
  stmt.finalize();
  
  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
    console.log(row.id + ": " + row.info);
  })
});

db.close();

const app = express();

// allow cross origin
app.use(cors());


// enable POST as json
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/**
 * TASK:
 * - get all todos
 * - respond all todos as JSON
 */
app.get('/todo', async function(req, res) {
  const todos = await getTodos();
  res.status(200).send(todos);
});

app.get('/todo/task', async function(req, res) {
  const tasks = await getTasks();
  res.status(200).send(tasks);
});

/**
 * TASK:
 * - handle wrong input (send status 400)
 * - append todo
 * - send status 201 as confirmation
 */
app.post('/todo', async function(req, res) {
  // console.log(req);
  const input = req.body.todoWidget;
  if(!input) {
    res.sendStatus(400);
    return;
  }
  
  await appendTodo(input);
  res.status(201).send(input);
});

app.post('/todo/task', async function(req, res) {
  // console.log(req.body.task);
  const input = req.body.task;
  if(!input) {
    res.sendStatus(400);
    return;
  }
  
  await appendTask(input);
  res.status(201).send(input);
});

app.put('/todo/task/:id', async function(req, res) {
  const taskId = req.body.id;
  const taskBody = req.body;
  await clearTask(taskId);
  await appendTask(taskBody);
  res.status(201).send(taskBody);
});

/**
 * TASK:
 * - remove all todos
 * - send status 204 as confirmation
 */
// app.delete(`/todo`, async function(req, res) {
//   console.log();
//   clearTodos();
//   res.sendStatus(204);
// });

/**
 * TASK:
 * - remove just one todo
 * - send status 204 as confirmation
 */
app.delete(`/todo/:id`, async function(req, res) {
  // console.log(req.params.id);
  clearTodo(req.params.id);
  res.sendStatus(204);
});

app.delete(`/todo/task/:id`, async function(req, res) {
  // console.log(req.params.id);
  clearTask(req.params.id);
  res.sendStatus(204);
});

app.delete(`/todo/tasks/:id`, async function(req, res) {
  // console.log('req.params.id');
  clearTasks(req.params.id);
  res.sendStatus(204);
});

// start app
app.listen(3000, () => {
  console.log('listening on port 3000');
});

