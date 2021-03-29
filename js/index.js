import TodoList from './models/todolist'; 
import Todo from './models/todo';

let list = new TodoList();
let filterTodo = 'all'; 
const TODO_ADD = document.getElementById('todo-add');
const FILTER = document.getElementById('filter');
const TODO_ALL_COMPLETED = document.getElementById('todo-all-completed');
const TODOS_DESTROY = document.getElementById('todos-destroy');

function todosFromLocal() {
    let localList = JSON.parse(localStorage.getItem('TodoList'));
    if (localList){
        for (let todo of localList.todos) {
            saveTodo(todo);
        }
    }
    render();
}

function addTodoFromInput() {
    let input = document.querySelector('#todo-input');
    let todo = input.value;
    input.value = '';
    saveTodo(new Todo(todo));
    render();
}

function saveTodo(todo) {
    list.addTodo(todo);
}

function handlerRemove(e) {
    let elem = e.target.parentNode;
    list.removeTodo(+elem.getAttribute('id'));
    elem.remove();
    saveLocal();
}

function render() {
    let ul = document.querySelector('ul#list');
    let todos = list.filterTodos(filterTodo);
    while (ul.firstChild) {
        ul.firstChild.remove();
    }
    for (let todo of todos) {
        let li = document.createElement('li');
        let btnDelete = document.createElement('button');
        let input = document.createElement('input');

        li.classList.add('list-group-item', 'draggable');
        input.type = 'checkbox';
        if (todo.isDone) {
            input.checked = true;
        }
        input.addEventListener('click', toggle);
        btnDelete.classList.add('delete');
        btnDelete.addEventListener('click', handlerRemove)
        btnDelete.innerHTML = 'x'
        li.append(input, `${todo.title}`, btnDelete)
        li.id = todo.id;
        ul.prepend(li);
    }
    saveLocal();
}

function toggle(e) {
    list.toggleTodo(+e.target.parentNode.getAttribute('id'));
    render();
}

function toggleAll() {
    let elems = document.querySelectorAll('input.status');
    for (elem of elems) {
        elem.checked = true;
    }
    list.completeAll();
    render();
}

function filterTodoList(e) {
    filterTodo = e.target.getAttribute('id');
    render();
}

function deleteAll() {
    list.removeAll();
    render();
}

function saveLocal() {
    localStorage.setItem('TodoList', JSON.stringify(list));
}

function updateIndexTodo(currentElem, nextElem) {
    let currentTodoIdx = list.todos.findIndex(t => t.id === +currentElem.getAttribute('id'));
    let nextTodoIdx;
    let currentTodo = list.todos.splice(currentTodoIdx, 1);
    if (nextElem) {
        nextTodoIdx = list.todos.findIndex(t => t.id === +nextElem.getAttribute('id'));
        list.todos.splice(nextTodoIdx + 1, 0, currentTodo[0]);
    } else if (!nextElem) {
        list.todos.unshift(currentTodo[0]);
    }
    saveLocal()
}



document.addEventListener('click', function() {
    // Query the list element
    const list = document.getElementById('list');

    let draggingEle;
    let placeholder;
    let isDraggingStarted = false;

    // The current position of mouse relative to the dragging element
    let x = 0;
    let y = 0;

    // Swap two nodes
    const swap = function(nodeA, nodeB) {
        const parentA = nodeA.parentNode;
        const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

        // Move `nodeA` to before the `nodeB`
        nodeB.parentNode.insertBefore(nodeA, nodeB);

        // Move `nodeB` to before the sibling of `nodeA`
        parentA.insertBefore(nodeB, siblingA);
    };

    // Check if `nodeA` is above `nodeB`
    const isAbove = function(nodeA, nodeB) {
        // Get the bounding rectangle of nodes
        const rectA = nodeA.getBoundingClientRect();
        const rectB = nodeB.getBoundingClientRect();

        return (rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2);
    };

    const mouseDownHandler = function(e) {
        draggingEle = e.target;

        // Calculate the mouse position
        const rect = draggingEle.getBoundingClientRect();
        x = e.pageX - rect.left;
        y = e.pageY - rect.top;

        // Attach the listeners to `document`
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = function(e) {
        const draggingRect = draggingEle.getBoundingClientRect();

        if (!isDraggingStarted) {
            isDraggingStarted = true;
            
            // Let the placeholder take the height of dragging element
            // So the next element won't move up
            placeholder = document.createElement('div');
            placeholder.classList.add('placeholder');
            draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
            placeholder.style.height = `${draggingRect.height}px`;
        }

        // Set position for dragging element
        draggingEle.style.position = 'absolute';
        draggingEle.style.top = `${e.pageY - y}px`; 
        draggingEle.style.left = `${e.pageX - x}px`;

        // The current order
        // prevEle
        // draggingEle
        // placeholder
        // nextEle
        const prevEle = draggingEle.previousElementSibling;
        const nextEle = placeholder.nextElementSibling;
        
        // The dragging element is above the previous element
        // User moves the dragging element to the top
        if (prevEle && isAbove(draggingEle, prevEle)) {
            // The current order    -> The new order
            // prevEle              -> placeholder
            // draggingEle          -> draggingEle
            // placeholder          -> prevEle
            swap(placeholder, draggingEle);
            swap(placeholder, prevEle);
            return;
        }

        // The dragging element is below the next element
        // User moves the dragging element to the bottom
        if (nextEle && isAbove(nextEle, draggingEle)) {
            // The current order    -> The new order
            // draggingEle          -> nextEle
            // placeholder          -> placeholder
            // nextEle              -> draggingEle
            swap(nextEle, placeholder);
            swap(nextEle, draggingEle);
        }

        
    };

    const mouseUpHandler = function() {
        // Remove the placeholder
        placeholder && placeholder.parentNode.removeChild(placeholder);

        const nextEle = draggingEle.nextElementSibling;
        updateIndexTodo(draggingEle, nextEle);

        draggingEle.style.removeProperty('top');
        draggingEle.style.removeProperty('left');
        draggingEle.style.removeProperty('position');

        x = null;
        y = null;
        draggingEle = null;
        isDraggingStarted = false;

        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    // Query all items
    [].slice.call(list.querySelectorAll('.draggable')).forEach(function(item) {
        item.addEventListener('mousedown', mouseDownHandler);
    });
});

TODO_ADD.addEventListener('click', addTodoFromInput);
FILTER.addEventListener('click', filterTodoList);
TODO_ALL_COMPLETED.addEventListener('click', toggleAll);
TODOS_DESTROY.addEventListener('click', deleteAll);

todosFromLocal();