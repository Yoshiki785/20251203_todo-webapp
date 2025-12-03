const STORAGE_KEY = 'my_tasks_v1';
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = loadTasks();
let currentFilter = 'all';

// Load tasks from localStorage or return an empty array
function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  try {
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.warn('Failed to parse tasks from storage, resetting.');
    return [];
  }
}

// Save current tasks to localStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Create a task DOM element from a task object
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.completed ? ' completed' : ''}`;
  li.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleTask(task.id));

  const text = document.createElement('p');
  text.className = 'task-text';
  text.textContent = task.text;

  const actions = document.createElement('div');
  actions.className = 'task-actions';
  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));
  actions.appendChild(deleteBtn);

  li.append(checkbox, text, actions);
  return li;
}

// Render tasks based on the current filter
function renderTasks() {
  taskList.innerHTML = '';
  const filtered = tasks.filter((task) => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No tasks yet — add something!';
    taskList.appendChild(empty);
    return;
  }

  filtered.forEach((task) => taskList.appendChild(createTaskElement(task)));
}

// Add a new task
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: crypto.randomUUID(),
    text,
    completed: false,
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

// Toggle task completion state
function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

// Delete a task by id
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

// Handle filter button clicks
filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Add task on button click or Enter key
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

// Initial render on page load
renderTasks();
