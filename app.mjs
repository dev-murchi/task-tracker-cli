import { addTask, deleteTask, getTasks, markTaskStatus, updateTask } from "./task-manager.mjs";

const args = process.argv.splice(2);

async function runApp() {
  try {
    if (args.length === 0) {
      throw new Error('Error: No command provided. Use: list, add, update, delete, or mark.');
    }

    const cmd = args[0];

    if (cmd === 'list') {
      const tasks = await getTasks();
      if (tasks.length === 0) {
        console.log('No tasks available.');
      }
      tasks.forEach(task => console.log(`[${task.taskid}] - ${task.description} (${task.status})`));
    }
    else if (cmd === 'add') {
      const description = args.slice(1).join(' ');
      await addTask(description);
    }
    else if (cmd === 'update') {
      const id = args[1];
      const description = args.slice(2).join(' ');
      await updateTask(id, description);
    }
    else if (cmd === 'delete') {
      const id = args[1];
      await deleteTask(id);
    }
    else if (cmd === 'mark') {
      const id = args[1];
      const status = args[2];
      await markTaskStatus(id, status);
    }
    else {
      throw new Error('Error: Unknown command. Please use: list, add, delete, update, or status.');
    }
  } catch (error) {
    console.error(error.message);
  }
}

await runApp();
