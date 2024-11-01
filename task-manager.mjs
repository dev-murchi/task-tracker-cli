const tasks = [];

let newTaskId = (tasks.length === 0) ? 1 : (Math.max(...tasks.map(task => task.id))) + 1;

// Validate description
function validateDescription(description) {
  if (!description || description.trim() === '') {
    console.error('Error: Please provide a valid task description. Description cannot be empty.');
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
  console.log(`Task created: [ID: ${task.id}] - ${task.description} (${task.status})`);
}