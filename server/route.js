//global modules
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

//rest code...
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', (req, res) => {
  res.send('Hello World!!!');
});

router.get('/todos', (req, res) => {
  const todos = require('./data/todos.json');
  res.json(todos);
});

router.post('/todos', (req, res) => {
  fs.readFile('./data/todos.json', (err, data) => {
    if (err) {
      throw err;
    }
    let content = JSON.parse(data);
    content.todos.push(req.body);
    fs.writeFile('./data/todos.json', JSON.stringify(content), (err) => {
      if (err) throw err;
      console.log("JSON data is saved.");
    });
  });
});

router.delete('/todos/id', (req, res) => {
  fs.readFile('./data/todos.json', (err, data) => {
    if (err) {
      throw err;
    }
    let content = JSON.parse(data);
    const idToDelete = req.body;
    content.todos.splice(idToDelete, 1);
    console.log(content)
    fs.writeFile('./data/todos.json', JSON.stringify(content),  function(err) {
      if (err) {
        return console.error(err);
      }});
  });
});

router.put('/todos/id', (req, res) => {
  fs.readFile('./data/todos.json', (err, data) => {
    if (err) {
      throw err;
    }
    let content = JSON.parse(data);
    const idToToggle = req.body;
    let todoIdx = content.todos.findIndex(t => t.id === idToToggle[0])
    if (todoIdx !== -1) {
      content.todos[todoIdx].isDone = !content.todos[todoIdx].isDone;
    }
    fs.writeFile('./data/todos.json', JSON.stringify(content),  function(err) {
      if (err) {
        return console.error(err);
      }});
  });
});

router.put('/todos', (req, res) => {
  fs.readFile('./data/todos.json', (err, data) => {
    if (err) {
      throw err;
    }
    let content = JSON.parse(data);

    content.todos.forEach(todo => {
      todo.isDone = !todo.isDone
    });
    fs.writeFile('./data/todos.json', JSON.stringify(content),  function(err) {
      if (err) {
        return console.error(err);
      }});
  });
})

module.exports = router;