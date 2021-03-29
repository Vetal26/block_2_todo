export default class Todo {
    constructor(title) {
        this.title = title;
        this.id = (new Date()).getTime() + getRandomIntInclusive(1, 10000);
        this.isDone = false;
    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

