const STORAGE_KEY = "todo-js-puro-tasks";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const searchInput = document.querySelector("#search-input");
const filterSelect = document.querySelector("#filter-select");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyMessage = document.querySelector("#empty-message");
const appMessage = document.querySelector("#app-message");

let tasks = loadTasks();

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (!savedTasks) return [];

    const parsedTasks = JSON.parse(savedTasks);
    if (!Array.isArray(parsedTasks)) throw new Error("Formato de tarefas inválido.");

    return parsedTasks.filter(
      (task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean",
    );
  } catch {
    appMessage.textContent = "Não foi possível carregar as tarefas salvas.";
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    appMessage.textContent = "";
    return true;
  } catch {
    appMessage.textContent = "Não foi possível salvar. Verifique o armazenamento do navegador.";
    return false;
  }
}

function renderTasks() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const selectedFilter = filterSelect.value;
  const visibleTasks = tasks.filter((task) => {
    const matchesSearch = task.text.toLocaleLowerCase("pt-BR").includes(searchTerm);
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "todo" && !task.completed) ||
      (selectedFilter === "done" && task.completed);

    return matchesSearch && matchesFilter;
  });

  taskList.replaceChildren();
  for (const task of visibleTasks) {
    taskList.append(createTaskElement(task));
  }

  const remainingTasks = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${remainingTasks} ${remainingTasks === 1 ? "tarefa pendente" : "tarefas pendentes"}`;
  emptyMessage.hidden = visibleTasks.length > 0;
  emptyMessage.textContent =
    tasks.length === 0
      ? "Nenhuma tarefa por aqui. Adicione uma!"
      : "Nenhuma tarefa encontrada com esses critérios.";
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-done" : ""}`;
  item.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Marcar "${task.text}" como concluída`);

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.dataset.action = "edit";
  editButton.textContent = "Editar";
  editButton.setAttribute("aria-label", `Editar tarefa: ${task.text}`);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.textContent = "Excluir";
  deleteButton.setAttribute("aria-label", `Excluir tarefa: ${task.text}`);

  actions.append(editButton, deleteButton);
  item.append(checkbox, text, actions);
  return item;
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({ id: crypto.randomUUID(), text, completed: false });
  saveTasks();
  taskInput.value = "";
  taskInput.focus();
  renderTasks();
});

taskList.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") return;

  const item = event.target.closest(".task-item");
  const task = tasks.find((currentTask) => currentTask.id === item?.dataset.id);
  if (!task) return;

  task.completed = event.target.checked;
  saveTasks();
  renderTasks();
});

taskList.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;

  const item = event.target.closest(".task-item");
  const taskIndex = tasks.findIndex((task) => task.id === item?.dataset.id);
  if (taskIndex === -1) return;

  if (event.target.dataset.action === "delete") {
    tasks.splice(taskIndex, 1);
    saveTasks();
    renderTasks();
    return;
  }

  if (event.target.dataset.action === "edit") {
    const updatedText = window.prompt("Edite sua tarefa:", tasks[taskIndex].text)?.trim();
    if (!updatedText) return;

    tasks[taskIndex].text = updatedText;
    saveTasks();
    renderTasks();
  }
});

searchInput.addEventListener("keyup", renderTasks);
filterSelect.addEventListener("change", renderTasks);

renderTasks();
