import {
  connectDB,
  closeDB,
  findAll,
  create,
  updateById,
  findById,
  deleteById
} from './db.mjs';


const taskStatuses = ['todo', 'done', 'in-progress'];

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

export async function getTasks() {
  try {
    await connectDB(process.env.DB_URL);
    const tasks = await findAll();
    await closeDB();
    return tasks;
  } catch (error) {
    console.error(error.stack)
    throw new Error('Loading tasks failed.');
  }
}

export async function addTask(description) {
  await connectDB(process.env.DB_URL);
  if (!validateDescription(description)) {
    throw new Error('Error: Please provide a valid task description. Description cannot be empty.');
  };

  const task = await create(description.trim());
  await closeDB();
  console.log(`Task created: [ID: ${task[0].taskid}] - ${task[0].description} (${task[0].status})`);
}

export async function updateTask(id, description) {
  if (!validateId(id)) {
    throw new Error('Error: Please provide a valid task ID.');
  };

  if (!validateDescription(description)) {
    throw new Error('Error: Please provide a valid task description. Description cannot be empty.');
  };

  id = parseInt(id);

  await connectDB(process.env.DB_URL);
  const task = await findById(id);

  if (task.length === 0) {
    await closeDB();
    throw new Error(`Task [ID: ${id}] is not found.`);
  }

  const updatedTask = await updateById(id, { description: description.trim(), status: 'TODO' });
  await closeDB();
  console.log(`Task updated: [ID: ${updatedTask[0].taskid}] - ${updatedTask[0].description} (${updatedTask[0].status})`);
}

export async function deleteTask(id) {
  if (!validateId(id)) {
    throw new Error('Error: Please provide a valid task ID.');
  };

  id = parseInt(id);

  await connectDB(process.env.DB_URL);
  const task = await findById(id);

  if (task.length === 0) {
    await closeDB();
    throw new Error(`Task [ID: ${id}] is not found.`);
  }

  const deletedTask = await deleteById(id);
  await closeDB();
  console.log(`Task [ID: ${deletedTask[0].taskid}] is succesfully deleted.`);
}

export async function markTaskStatus(id, status) {
  if (!validateId(id)) {
    throw new Error('Error: Please provide a valid task ID.');
  };

  if (!validateStatus(status)) {
    throw new Error('Error: Please provide a valid status (todo, in-progress, done).');
  }

  id = parseInt(id);

  await connectDB(process.env.DB_URL);
  const task = await findById(id);

  if (task.length === 0) {
    await closeDB();
    throw new Error(`Task [ID: ${id}] is not found.`);
  }

  const updatedTask = await updateById(id, { status: status.toUpperCase() })
  await closeDB();
  console.log(`Task [ID: ${updatedTask[0].taskid}] status changed to: ${updatedTask[0].status}`);
}
