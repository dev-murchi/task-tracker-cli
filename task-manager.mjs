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
    throw new Error('Error loading tasks:', error.message);
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
  try {
    loadTasks();
  } catch (error) {
    console.error(error.message);
  }
  return tasks;
}

export function addTask(description) {
  try {
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
  } catch (error) {
    console.error(error.message)
  }
}

export function updateTask(id, description) {
  try {
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
      console.log(`Task [ID: ${id}] is not found.`);
      return;
    }

    task.description = description.trim();
    task.status = 'todo';
    task.updatedAt = (new Date()).toISOString();
    saveTasks();
    console.log(`Task updated: [ID: ${id}] - ${task.description} (${task.status})`);
  } catch (error) {
    console.error(error.message);
  }
}

export function deleteTask(id) {
  try {
    loadTasks();
    if (!validateId(id)) {
      throw new Error('Error: Please provide a valid task ID.');
    };

    id = parseInt(id);
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
      console.log(`Task [ID: ${id}] is not found.`);
      return;
    }

    tasks.splice(index, 1);
    saveTasks();
    console.log(`Task [ID: ${id}] is succesfully deleted.`);
  } catch (error) {
    console.error(error.message);
  }
}

export function markTaskStatus(id, status) {
  try {
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
      console.log(`Task [ID: ${id}] is not found.`);
      return;
    }

    task.status = status;
    task.updatedAt = (new Date()).toISOString();
    saveTasks();
    console.log(`Task [ID: ${id}] status changed to: ${status}`);
  } catch (error) {
    console.error(error.message)
  }
}
