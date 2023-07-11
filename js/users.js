const form = document.querySelector("#form");

const todoContainer = document.querySelector("#todo-container");

let date = new Date();
let time = date.getTime();
let counter = time;
let todos = []; //массив для записей
let todos2 = [];

auth.onAuthStateChanged((user) => { //вход пользователя
    if (user) {
        console.log("user is signed in at users.html");
    } else {
        alert(
            "your login session has expired or you have logged out, login again to continue"
        );
        location = "login.html";
    }
});

function logout() { //выход пользователя
    auth.signOut();
    localStorage.removeItem("todos");
}

function saveData(doc) { //сохранение записи
    let todo = {
        id: doc.id,
        book_name: doc.data().book_name,
        author: doc.data().author,
        completed: doc.data().completed,
    };
    todos.push(todo); //запись в конец массива
}

function renderData(id) {
    let todoObj = todos.find((todo) => todo.id === id);
    //let todoObj2 = todos2.find((todo) => todo.id === id);

    let parentDiv = document.createElement("li");
    parentDiv.setAttribute("id", todoObj.id);
    
    let book_ = `${todoObj.book_name} - ${todoObj.author}`;

    let todoDiv = document.createElement("p");
    todoDiv.textContent =
        book_.length <= 20 ? book_: book_.slice(0, 40);
    todoObj.completed ? todoDiv.classList.add("completed") : todoDiv;

    let trashButton = document.createElement("button");
    trashButton.className = "far fa-trash-alt";
    trashButton.classList.add("delete");
    trashButton.classList.add("button");
    trashButton.classList.add("hover_button");

    let completeButton = document.createElement("button");
    completeButton.className = "fa solid fa-check"
    completeButton.classList.add("finish")
    completeButton.classList.add("button")
    completeButton.classList.add("hover_button")

    let buttonDiv = document.createElement("div");
    buttonDiv.className = "button_div";
    buttonDiv.appendChild(trashButton);
    buttonDiv.appendChild(completeButton);

    parentDiv.appendChild(todoDiv);
    //parentDiv.appendChild(todoDiv2);
    parentDiv.appendChild(buttonDiv);
    todoContainer.appendChild(parentDiv);

    trashButton.addEventListener("click", (e) => {
        let id = e.target.parentElement.parentElement.getAttribute("id");
        auth.onAuthStateChanged((user) => {
            if (user) db.collection(user.uid).doc(id).delete();
        });
    });

    completeButton.addEventListener('click', e => {
        let id = e.target.parentElement.parentElement.getAttribute('id');

        auth.onAuthStateChanged(user => {
            let item = db.collection(`${user.uid}`).doc(id)
            item.get().then(doc => {
                item.update({completed: !doc.data().completed})
                todoDiv.classList.toggle('completed')
                todos.map(todo => todo.id === doc.id ? todo.completed = !todo.completed : todo)
            })
        })
    })
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const book_name = form["todos"].value;
    const author = form["todos2"].value;
    let id = (counter += 1);
    form.reset();

    auth.onAuthStateChanged((user) => {
        if (user) {
            db.collection(user.uid)
                .doc("_" + id)
                .set({
                    id: "_" + id,
                    book_name,
                    author,
                    completed: false,
                })
                .then(() => {
                    console.log("todo added");
                })
                .catch((err) => {
                    console.log(err.message);
                });
        }
    });
});


function filterHandler(status) {
    if (status === 'completed')
        todos = JSON.parse(localStorage.getItem('todos')).filter(todo => todo.completed)
    else if (status === 'open')
        todos = JSON.parse(localStorage.getItem('todos')).filter(todo => !todo.completed)
    else
        todos = JSON.parse(localStorage.getItem('todos'))

    todoContainer.innerHTML = ''
    todos.forEach(todo => renderData(todo.id))
}

auth.onAuthStateChanged((user) => {
    if (user) {
        db.collection(user.uid).onSnapshot((snapshot) => {
            let changes = snapshot.docChanges();
            changes.forEach((change) => {
                if (change.type === "added") {
                    saveData(change.doc);
                    renderData(change.doc.id);
                } else if (change.type === "removed") {
                    let li = todoContainer.querySelector(`#${change.doc.id}`);
                    todoContainer.removeChild(li);
                    todos = todos.filter((todo) => todo.id !== change.doc.id);
                }
            });
            localStorage.setItem('todos', JSON.stringify(todos))
        });
    }
});
