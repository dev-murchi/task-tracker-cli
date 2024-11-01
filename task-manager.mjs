const tasks = [
  {
    id: 1,
    description: 'first task',
    status: 'todo',
    createdAt: '2024-11-01T20:49:09.598Z',
    updatedAt: '2024-11-01T20:49:09.598Z'
  }
];

let newTaskId = (tasks.length === 0) ? 1 : (Math.max(...tasks.map(task => task.id))) + 1;

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
  console.log(`Task [ID: ${id}] is succesfully deleted.`);
}
