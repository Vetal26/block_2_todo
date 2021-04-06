import TodoList from './models/todolist'; 
import Todo from './models/todo';
import config from './config';

let list = new TodoList();
let filterTodo = 'all'; 
const TODO_ADD = document.getElementById('todo-add');
const FILTER = document.getElementById('filter');
const TODO_ALL_COMPLETED = document.getElementById('todo-all-completed');
const TODO_ALL_ACTIVE = document.getElementById('todo-all-active')
const TODOS_DESTROY = document.getElementById('todos-destroy');
const TODOS_LIST = document.getElementById('list');

function todosFromLocal() {
    let localList = JSON.parse(localStorage.getItem('TodoList'));
    if (localList){
        for (let todo of localList.todos) {
            list.addTodo(new Todo(todo));
        }
    }
    render();
}

function addTodoFromInput() {
    let input = document.querySelector('#todo-input');
    let todo = input.value;
    input.value = '';
    list.addTodo(new Todo({title: todo}));
    render();
}

function handlerRemove(e) {
    let isDelete = confirm('Delete current Todo?')
    if (isDelete) {
        let elem = e.target.parentNode;
        list.removeTodo(+elem.getAttribute('id'));
        elem.remove();
    }
}

export default function render() {
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
        ul.append(li);
    }
}

function toggle(e) {
    list.toggleTodo(+e.target.parentNode.getAttribute('id'));
    render();
}

function completeAllTodo() {
    toggleAlltodo(true);
}

function activeAllTodo() {
    toggleAlltodo(false);
}

function toggleAlltodo(bool) {
    let elems = document.querySelectorAll('input.status');
    for (elem of elems) {
        elem.checked = bool;
    }
    list.toggleAll(bool);
    render();
}

function filterTodoList(e) {
    filterTodo = e.target.getAttribute('id');
    let btnActiveOld = document.querySelector('.active');
    btnActiveOld.classList.remove('active');
    let btnActive = document.getElementById(filterTodo);
    btnActive.classList.add('active');
    render();
}

function deleteCompleted() {
    let isDelete = confirm('Delete completed Todo(s)?')
    if (isDelete) {
        list.removeCopleted();
        render();
    }
}

function saveLocal() {
    localStorage.setItem('TodoList', JSON.stringify(list));
}

function updateIndexTodo(currentElem, prevElem) {
    let currentTodoIdx = list.todos.findIndex(t => t.id === +currentElem.getAttribute('id'));
    let nextTodoIdx;
    let currentTodo = list.todos.splice(currentTodoIdx, 1);
    if (prevElem) {
        nextTodoIdx = list.todos.findIndex(t => t.id === +prevElem.getAttribute('id'));
        list.todos.splice(nextTodoIdx + 1, 0, currentTodo[0]);
    } else if (!prevElem) {
        list.todos.unshift(currentTodo[0]);
    }
}

function dragAndDrop(e) {
    const listTodo = document.getElementById('list');
    if (e.target.type === 'checkbox' || e.target.type === 'button' || e.target.type === 'input' ) {
        return;
    }

    let draggingEle;
    let placeholder;
    let isDraggingStarted = false;
    let oldChek;
    let oldBtn;

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
        e.stopPropagation();
        draggingEle = e.target;
        oldChek = draggingEle.querySelector('input');
        oldBtn = draggingEle.querySelector('button');
        draggingEle.removeChild(oldBtn);
        draggingEle.removeChild(oldChek);

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

        draggingEle.style.removeProperty('top');
        draggingEle.style.removeProperty('left');
        draggingEle.style.removeProperty('position');



        const prevEle = draggingEle.previousElementSibling;
        draggingEle.prepend(oldChek);
        draggingEle.append(oldBtn);
        updateIndexTodo(draggingEle, prevEle);

        x = null;
        y = null;
        draggingEle = null;
        isDraggingStarted = false;

       
        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    // Query all items
    list.todos.slice.call(listTodo.querySelectorAll('.draggable')).forEach(function(item) {

        item.addEventListener('mousedown', mouseDownHandler);
    });
}

TODOS_LIST.addEventListener('click', dragAndDrop);
TODO_ADD.addEventListener('click', addTodoFromInput);
FILTER.addEventListener('click', filterTodoList);
TODO_ALL_COMPLETED.addEventListener('click', completeAllTodo);
TODOS_DESTROY.addEventListener('click', deleteCompleted);
TODO_ALL_ACTIVE.addEventListener('click', activeAllTodo)

list.todoFromServer();