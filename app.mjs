import { addTask, deleteTask, getTasks, markTaskStatus, updateTask } from "./task-manager.mjs";

const args = process.argv.splice(2);

function runApp() {
  if (args.length === 0) {
    console.error('Error: No command provided. Use: list, add, update, delete, or mark.');
    return;
  }

  const cmd = args[0];

  if (cmd === 'list') {
    const tasks = getTasks();
    if (tasks.length === 0) {
      console.log('No tasks available.');
    }
    tasks.forEach(task => console.log(`[${task.id}] - ${task.description} (${task.status})`));
  }
  else if (cmd === 'add') {
    const description = args.slice(1).join(' ');
    addTask(description)
  }
  else if (cmd === 'update') {
    const id = args[1];
    const description = args.slice(2).join(' ');
    updateTask(id, description);
  }
  else if (cmd === 'delete') {
    const id = args[1];
    deleteTask(id);
  }
  else if (cmd === 'mark') {
    const id = args[1];
    const status = args[2];
    markTaskStatus(id, status);
  }
  else {
    console.error('Error: Unknown command. Please use: list, add, delete, update, or status.');
  }

}

runApp();
