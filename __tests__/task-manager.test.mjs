import { expect, jest } from '@jest/globals';

let storedTasks = [];

let mockTasks = [
  {
    "taskid": 1,
    "description": "Test Task 1",
    "status": "TODO",
  },
  {
    "taskid": 2,
    "description": "Test Task 2",
    "status": "TODO",
  },
  {
    "taskid": 3,
    "description": "Test Task 3",
    "status": "IN-PROGRESS",
  },
  {
    "taskid": 4,
    "description": "Test Task 4",
    "status": "DONE",
  }

];

const connectDBMock = jest.fn(() => { console.log('database connection') })
const findAllMock = jest.fn(() => storedTasks);

jest.unstable_mockModule('../db.mjs', () => ({
  connectDB: connectDBMock,
  closeDB: jest.fn(),
  findAll: findAllMock,
  create: jest.fn((descr) => {
    const index = storedTasks.length + 1;
    const task = {
      taskid: index,
      description: descr,
      status: 'TODO'
    };
    storedTasks.push(task);
    return [task];
  }),
  updateById: jest.fn((id, data) => {
    const index = storedTasks.findIndex(task => task.taskid === id);
    if (index !== -1) {
      if (data.description) {
        storedTasks[index].description = data.description;
      }
      if (data.status) {
        storedTasks[index].status = data.status;
      }
      return [storedTasks[index]];
    }

  }),
  findById: jest.fn((id) => {
    const index = storedTasks.findIndex(task => task.taskid === id);
    if (index !== -1) {
      return [storedTasks[index]];
    }
    return [];
  }),
  findByStatus: jest.fn((status) => {
    const resp = storedTasks.filter(task => task.status === status);
    return resp;
  }),
  deleteById: jest.fn((id) => {
    const index = storedTasks.findIndex(task => task.taskid === id);
    if (index !== -1) {
      const task = storedTasks[index];
      storedTasks.splice(index, 1);
      return [task];
    }
  })
}));

const { } = await import('../db.mjs');
const taskManager = await import('../task-manager.mjs');

describe('Task management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storedTasks = [];
  });

  test('should create and save a new task', async () => {
    await taskManager.addTask('Test task 1');
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0]).toEqual({
      taskid: 1,
      description: 'Test task 1',
      status: 'TODO'
    });
  });

  test('should not create a task with an empty description', async () => {
    expect(async () => {
      await taskManager.addTask('');
    }).rejects.toThrow('Please provide a valid task description. Description cannot be empty.');
  });

  test('should return an empty array when there is no task', async () => {
    const tasks = await taskManager.getTasks();
    expect(tasks).toHaveLength(0);
  });

  test('should throw an error when non-existent data source is provided', () => {
    connectDBMock.mockRejectedValueOnce('Error connecting to database.');
    expect(async () => { await taskManager.getTasks() }).rejects.toThrow('Loading tasks failed.');
  });

  test('should return all tasks stored in db', async () => {
    storedTasks = mockTasks.map(task => Object.assign({}, task));
    const tasks = await taskManager.getTasks();
    expect(tasks).toStrictEqual(storedTasks);
  });

  test('should return all tasks which has status (TODO) stored in db', async () => {
    storedTasks = mockTasks.map(task => Object.assign({}, task));
    const tasks = await taskManager.getTasks('todo');
    expect(tasks).toStrictEqual([mockTasks[0], mockTasks[1]]);
  });

  test('should return all tasks which has status (IN-PROGRESS) stored in db', async () => {
    storedTasks = mockTasks.map(task => Object.assign({}, task));
    const tasks = await taskManager.getTasks('in-progress');
    expect(tasks).toStrictEqual([mockTasks[2]]);
  });

  test('should return all tasks which has status (DONE) stored in db', async () => {
    storedTasks = mockTasks.map(task => Object.assign({}, task));
    const tasks = await taskManager.getTasks('done');
    expect(tasks).toStrictEqual([mockTasks[3]]);
  });

  test('should throw an error when trying to get tasks with invalid status', async () => {
    expect(async () => { await taskManager.getTasks('test') }).rejects.toThrow('Please provide a valid status (todo, in-progress, done).');
  });

  test('should update a task description', async () => {
    storedTasks = mockTasks.map(task => Object.assign({}, task));
    const tasks = await taskManager.getTasks();

    await taskManager.updateTask(1, 'Updated Task - 1');
    expect(storedTasks[0].description).toEqual('Updated Task - 1');
    expect(storedTasks[0].status).toEqual('TODO');

    await taskManager.updateTask(2, 'Updated Task - 2');
    expect(storedTasks[1].description).toEqual('Updated Task - 2');
    expect(storedTasks[1].status).toEqual('TODO');
  });

  test('should not update a non-existent task', async () => {
    expect(async () => { await taskManager.updateTask(1, 'Updated Task') }).rejects.toThrow('Could not update the task!');
    expect(async () => { await taskManager.updateTask('invalidId', 'Updated Task') }).rejects.toThrow('Please provide a valid task ID.');
  });

  test('should not update a task with an empty description', async () => {
    storedTasks = mockTasks.map(task => Object.assign({}, task));
    expect(async () => { await taskManager.updateTask(1, '') }).rejects.toThrow('Please provide a valid task description. Description cannot be empty.');
  });

  test('should change the status of a task as (done)', async () => {
    storedTasks = mockTasks.map(task => Object.assign({}, task));

    expect(storedTasks[0].status).toEqual('TODO');
    await taskManager.markTaskStatus(1, 'done');
    expect(storedTasks[0].status).toEqual('DONE');

    expect(storedTasks[1].status).toEqual('TODO');
    await taskManager.markTaskStatus(2, 'done');
    expect(storedTasks[1].status).toEqual('DONE');
  });

  test('should change the status of a task as (in-progress)', async () => {
    storedTasks = mockTasks.map(task => Object.assign({}, task));

    expect(storedTasks[0].status).toEqual('TODO');
    await taskManager.markTaskStatus(1, 'in-progress');
    expect(storedTasks[0].status).toEqual('IN-PROGRESS');

    expect(storedTasks[1].status).toEqual('TODO');
    await taskManager.markTaskStatus(2, 'in-progress');
    expect(storedTasks[1].status).toEqual('IN-PROGRESS');
  });

  test('should not change the status of a non-existent task', async () => {
    expect(async () => { await taskManager.markTaskStatus(1, 'todo') }).rejects.toThrow('Could not update the task status!');
    expect(async () => { await taskManager.markTaskStatus('invalidId', 'todo') }).rejects.toThrow('Please provide a valid task ID.');
  });

  test('should not change the status of a task with ivalid value', async () => {
    storedTasks = mockTasks.map(task => Object.assign({}, task));
    expect(async () => { await taskManager.markTaskStatus(1, 'test') }).rejects.toThrow('Please provide a valid status (todo, in-progress, done).');
  });

  test('should delete a task successfully', async () => {
    storedTasks = mockTasks.map(task => Object.assign({}, task));

    await taskManager.deleteTask(mockTasks[0].taskid);
    expect(storedTasks).toHaveLength(3);
    expect(storedTasks[0]).toStrictEqual(mockTasks[1]);
    expect(storedTasks[1]).toStrictEqual(mockTasks[2]);
    expect(storedTasks[2]).toStrictEqual(mockTasks[3]);

    await taskManager.deleteTask(mockTasks[1].taskid);
    expect(storedTasks).toHaveLength(2);
    expect(storedTasks[0]).toStrictEqual(mockTasks[2]);
    expect(storedTasks[1]).toStrictEqual(mockTasks[3]);

    await taskManager.deleteTask(mockTasks[2].taskid);
    await taskManager.deleteTask(mockTasks[3].taskid);
    expect(storedTasks).toHaveLength(0);
  });

  test('should not delete a non-existent task', async () => {
    expect(async () => { await taskManager.deleteTask(1) }).rejects.toThrow('Could not delete the task!');
    expect(async () => { await taskManager.deleteTask('invalidId') }).rejects.toThrow('Please provide a valid task ID.');
  });
});


