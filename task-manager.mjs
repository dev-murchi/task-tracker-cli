import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dataFilePath = join(process.cwd(), 'tasks.json');

let tasks = [];

const taskStatuses = ['todo', 'done', 'in-progress'];

let newTaskId = 1;

// Load tasks from the JSON file
function loadTasks() {
  try {
    if (!existsSync(dataFilePath)) {
      throw new Error('Could not find data source.');
    }
    const data = readFileSync(dataFilePath);
    tasks = JSON.parse(data);
    newTaskId = (tasks.length === 0) ? 1 : (Math.max(...tasks.map(task => task.id))) + 1;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new Error('Loading tasks failed.');
  }
}

// Save tasks to the JSON file
function saveTasks() {
  try {
    writeFileSync(dataFilePath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    throw new Error(`Error saving tasks: ${error.message}`);
  }
}

// Validate description
function validateDescription(description) {
  return (description && description.trim() !== '');
}

// Validate id
function validateId(id) {
  const regexOnlyNumber = /^[0-9]+$/;
  return regexOnlyNumber.test(id);
}

// Validate status
function validateStatus(status) {
  return taskStatuses.includes(status);
}

export function getTasks() {
  loadTasks();
  return tasks;
}

export function addTask(description) {
  loadTasks();
  if (!validateDescription(description)) {
    throw new Error('Error: Please provide a valid task description. Description cannot be empty.');
  };

  const task = {
    id: newTaskId++,
    description: description.trim(),
    status: 'todo',
    createdAt: '',
    updatedAt: '',
  }

  const date = (new Date()).toISOString();
  task.createdAt = date;
  task.updatedAt = date;

  tasks.push(task);
  saveTasks();
  console.log(`Task created: [ID: ${task.id}] - ${task.description} (${task.status})`);
}

export function updateTask(id, description) {
  loadTasks();
  if (!validateId(id)) {
    throw new Error('Error: Please provide a valid task ID.');
  };

  if (!validateDescription(description)) {
    throw new Error('Error: Please provide a valid task description. Description cannot be empty.');
  };

  id = parseInt(id);

  const task = tasks.find(task => task.id === id);

  if (!task) {
    throw new Error(`Task [ID: ${id}] is not found.`);
  }

  task.description = description.trim();
  task.status = 'todo';
  task.updatedAt = (new Date()).toISOString();
  saveTasks();
  console.log(`Task updated: [ID: ${id}] - ${task.description} (${task.status})`);
}

export function deleteTask(id) {
  loadTasks();
  if (!validateId(id)) {
    throw new Error('Error: Please provide a valid task ID.');
  };

  id = parseInt(id);
  const index = tasks.findIndex(task => task.id === id);

  if (index === -1) {
    throw new Error(`Task [ID: ${id}] is not found.`);
  }

  tasks.splice(index, 1);
  saveTasks();
  console.log(`Task [ID: ${id}] is succesfully deleted.`);
}

export function markTaskStatus(id, status) {
  loadTasks();
  if (!validateId(id)) {
    throw new Error('Error: Please provide a valid task ID.');
  };

  if (!validateStatus(status)) {
    throw new Error('Error: Please provide a valid status (todo, in-progress, done).');
  }

  id = parseInt(id);

  const task = tasks.find(task => task.id === id);

  if (!task) {
    throw new Error(`Task [ID: ${id}] is not found.`);
  }

  task.status = status;
  task.updatedAt = (new Date()).toISOString();
  saveTasks();
  console.log(`Task [ID: ${id}] status changed to: ${status}`);
}
