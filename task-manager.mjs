import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dataFilePath = join(process.cwd(), 'tasks.json');

let tasks = [];

const taskStatuses = ['todo', 'done', 'in-progress'];

let newTaskId = 1;

// Load tasks from the JSON file
function loadTasks() {
  try {
    if (existsSync(dataFilePath)) {
      const data = readFileSync(dataFilePath);
      tasks = JSON.parse(data);
      newTaskId = (tasks.length === 0) ? 1 : (Math.max(...tasks.map(task => task.id))) + 1;
    }
  } catch (error) {
    tasks = [];
    console.error('Error loading tasks:', error.message);
  }
}

// Save tasks to the JSON file
function saveTasks() {
  try {
    writeFileSync(dataFilePath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error(`Error saving tasks: ${error.message}`);
  }
}

// Validate description
function validateDescription(description) {
  if (!description || description.trim() === '') {
    console.error('Error: Please provide a valid task description. Description cannot be empty.');
    return false;
  }
  return true;
}

// Validate id
function validateId(id) {
  const regexOnlyNumber = /^[0-9]+$/;
  if (!regexOnlyNumber.test(id)) {
    console.error('Error: Please provide a valid task ID.');
    return false;
  };
  return true;
}

// Validate status
function validateStatus(status) {
  if (!taskStatuses.includes(status)) {
    console.error('Error: Please provide a valid status (todo, in-progress, done).');
    return false;
  }

  return true;
}

export function getTasks() {
  return tasks;
}

export function addTask(description) {
  if (!validateDescription(description)) return;

  const task = {
    id: newTaskId++,
    description: description.trim(),
    status: 'todo',
    createdAt: (new Date()).toISOString(),
    updatedAt: (new Date()).toISOString(),
  }

  tasks.push(task);
  saveTasks();
  console.log(`Task created: [ID: ${task.id}] - ${task.description} (${task.status})`);
}

export function updateTask(id, description) {
  if (!validateId(id) || !validateDescription(description)) return;

  id = parseInt(id);

  const task = tasks.find(task => task.id === id);

  if (!task) {
    console.log(`Task [ID: ${id}] is not found.`);
    return;
  }

  task.description = description.trim();
  task.status = 'todo';
  task.updatedAt = (new Date()).toISOString();
  saveTasks();
  console.log(`Task updated: [ID: ${id}] - ${task.description} (${task.status})`);
}

export function deleteTask(id) {
  if (!validateId(id)) return;
  id = parseInt(id);
  const index = tasks.findIndex(task => task.id === id);

  if (index === -1) {
    console.log(`Task [ID: ${id}] is not found.`);
    return;
  }

  tasks.splice(index, 1);
  saveTasks();
  console.log(`Task [ID: ${id}] is succesfully deleted.`);
}

export function markTaskStatus(id, status) {
  if (!validateId(id) || !validateStatus(status)) return;

  id = parseInt(id);

  const task = tasks.find(task => task.id === id);

  if (!task) {
    console.log(`Task [ID: ${id}] is not found.`);
    return;
  }

  task.status = status;
  task.updatedAt = (new Date()).toISOString();
  saveTasks();
  console.log(`Task [ID: ${id}] status changed to: ${status}`);
}

// Load tasks when the module is imported
loadTasks();