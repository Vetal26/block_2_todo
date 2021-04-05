import Todo from './todo';
import render from '../index';

export default class TodoList {
    constructor() {
        this.todos = [];
    }

    get todoList() {
        return this.todos;
    }

    addTodo(todo) {
        fetch('http://localhost:3333/todos', {
            method: 'post',
            body: JSON.stringify(todo),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json()
        .then((json) => console.log(json))
        .catch(err => console.log(err)));
        this.todos.push(todo);
    }

    removeTodo(id) {
        let todoIdx = this.todos.findIndex(t => t.id === id);
        if (todoIdx === -1) {
            console.log('Nothing to remove!');
            return;
        }
        
        let todo = this.todos[todoIdx];
        this.todos = [...this.todos.slice(0, todoIdx), ...this.todos.slice(todoIdx + 1)];
        fetch('http://localhost:3333/todos/id', {
            method: 'delete',
            body: JSON.stringify([todoIdx]),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then((json) => console.log(json));
        return todo;
    }

    toggleAll(bool) {
        if (bool) {
            for (let todo of this.todos) {
                todo.markDone();
            }
        } else {
            for (let todo of this.todos) {
                todo.markNotDone();
            }
        }
        fetch('http://localhost:3333/todos', {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([bool])
            }).then(response => response.json())
            .then((json) => console.log(json));
    }

    removeAllCopleted() {
        for (let todo of this.todos) {
            if (todo.isDone){
                this.removeTodo(todo.id);
            }
        }
    }

    toggleTodo(id) {
        let todoIdx = this.todos.findIndex(t => t.id === id);
        if (this.todos[todoIdx].isDone) {
            this.todos[todoIdx].markNotDone();
        } else {
            this.todos[todoIdx].markDone();
        }
        fetch('http://localhost:3333/todos/id', {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([id])
            }).then(response => response.json())
            .then((json) => console.log(json));
    }

    filterTodos(filter = 'all') {
        if (filter === 'active') {
          return this.getActiveTodo();
        }
        if (filter === 'completed') {
          return this.getCompletedTodo();
        }
        return this.todoList;
    }
    
    getCompletedTodo() {
        return this.todoList.filter((todo) => todo.isDone === true);
    }
    
    getActiveTodo() {
        return this.todoList.filter((todo) => todo.isDone === false);
    }

    todoFromServer(){
        fetch('http://localhost:3333/todos')
            .then(response => response.json())
            .then(json => {
                for (let todo of json.todos) {
                    this.todos.push(new Todo(todo));
                }
                render();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
}