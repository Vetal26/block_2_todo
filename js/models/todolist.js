export default class TodoList {
    constructor() {
        this.todos = [];
    }

    get todoList() {
        return this.todos;
    }

    addTodo(todo) {
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
        
        return todo;
    }

    completeAll() {
        for (let todo of this.todos) {
            todo.isDone = true;
        }
    }

    removeAll() {
        for (let todo of this.todos) {
            this.removeTodo(todo.id)
        }
    }

    toggleTodo(id) {
        let todoIdx = this.todos.findIndex(t => t.id === id);
        let todo = this.todos[todoIdx];
        todo.isDone = !todo.isDone;
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

    getIndex(id) {
        return this.todos.findIndex(t => t.id === id);
    }
}