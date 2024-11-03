import { expect, jest } from '@jest/globals';

let storedTasks = [];

let mockTasks = [
  {
    "id": 1,
    "description": "Test Task 1",
    "status": "todo",
    "createdAt": "2024-11-02T21:49:55.903Z",
    "updatedAt": "2024-11-02T21:49:55.903Z"
  },
  {
    "id": 2,
    "description": "Test Task 2",
    "status": "todo",
    "createdAt": "2024-11-02T21:50:34.863Z",
    "updatedAt": "2024-11-02T21:50:34.863Z"
  }
];

const readFileSyncMock = jest.fn();
const writeFileSyncMock = jest.fn((path, data) => {
  storedTasks = JSON.parse(data);
});
const existsSyncMock = jest.fn(() => true);

jest.unstable_mockModule('node:fs', () => ({
  readFileSync: readFileSyncMock,
  writeFileSync: writeFileSyncMock,
  existsSync: existsSyncMock,
}));

const { writeFileSync, readFileSync, existsSync } = await import('node:fs');
const taskManager = await import('../task-manager.mjs');

describe('Task management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storedTasks = [];
    readFileSyncMock.mockReturnValue(JSON.stringify([]));
  });

  test('should create and save a new task', () => {
    const description = 'Test task 1';

    taskManager.addTask(description);

    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0]).toEqual({
      id: 1,
      description: 'Test task 1',
      status: 'todo',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(storedTasks[0].createdAt).toEqual(storedTasks[0].updatedAt);
  });

  test('should not create a task with an empty description', () => {
    expect(() => {
      taskManager.addTask('');
    }).toThrow('Error: Please provide a valid task description. Description cannot be empty.');
  });

  test('should return an empty array when there is no task', async () => {
    const tasks = taskManager.getTasks();
    expect(tasks).toHaveLength(0);
  });

  test('should return all tasks stored in file', () => {
    readFileSyncMock.mockReturnValue(JSON.stringify(mockTasks));
    const tasks = taskManager.getTasks();
    expect(tasks).toStrictEqual(mockTasks);
  });

  test('should update a task description', () => {
    readFileSyncMock.mockReturnValue(JSON.stringify(mockTasks));
    storedTasks = taskManager.getTasks();

    taskManager.updateTask(1, 'Updated Task - 1');
    expect(storedTasks[0].description).toEqual('Updated Task - 1');
    expect(storedTasks[0].status).toEqual('todo');

    taskManager.updateTask(2, 'Updated Task - 2');
    expect(storedTasks[1].description).toEqual('Updated Task - 2');
    expect(storedTasks[1].status).toEqual('todo');
  });

  test('should not update a non-existent task', () => {
    expect(() => { taskManager.updateTask(1, 'Updated Task') }).toThrow('Task [ID: 1] is not found.');
    expect(() => { taskManager.updateTask('invalidId', 'Updated Task') }).toThrow('Error: Please provide a valid task ID.');
  });

  test('should not update a task with an empty description', () => {
    taskManager.addTask('Test Task');
    expect(() => { taskManager.updateTask(1, '') }).toThrow('Error: Please provide a valid task description. Description cannot be empty.');
  });

  test('should change the status of a task as (done)', () => {
    readFileSyncMock.mockReturnValue(JSON.stringify(mockTasks));
    storedTasks = taskManager.getTasks();

    expect(storedTasks[0].status).toEqual('todo');
    taskManager.markTaskStatus(1, 'done');
    expect(storedTasks[0].status).toEqual('done');

    expect(storedTasks[1].status).toEqual('todo');
    taskManager.markTaskStatus(2, 'done');
    expect(storedTasks[1].status).toEqual('done');
  });

  test('should change the status of a task as (in-progress)', () => {
    readFileSyncMock.mockReturnValue(JSON.stringify(mockTasks));
    storedTasks = taskManager.getTasks();

    expect(storedTasks[0].status).toEqual('todo');
    taskManager.markTaskStatus(1, 'in-progress');
    expect(storedTasks[0].status).toEqual('in-progress');

    expect(storedTasks[1].status).toEqual('todo');
    taskManager.markTaskStatus(2, 'in-progress');
    expect(storedTasks[1].status).toEqual('in-progress');
  });

  test('should not change the status of a non-existent task', () => {
    expect(() => { taskManager.markTaskStatus(1, 'todo') }).toThrow('Task [ID: 1] is not found.');
    expect(() => { taskManager.markTaskStatus('invalidId', 'todo') }).toThrow('Error: Please provide a valid task ID.');
  });

  test('should not change the status of a task with ivalid value', () => {
    taskManager.addTask('Test Task');
    expect(() => { taskManager.markTaskStatus(1, 'test') }).toThrow('Error: Please provide a valid status (todo, in-progress, done).');
  });

  test('should delete a task successfully', () => {
    readFileSyncMock.mockReturnValue(JSON.stringify(mockTasks));
    storedTasks = taskManager.getTasks();
    taskManager.deleteTask(mockTasks[0].id);
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0]).toStrictEqual(mockTasks[1]);

    readFileSyncMock.mockReturnValue(JSON.stringify([mockTasks[1]]));
    storedTasks = taskManager.getTasks();
    taskManager.deleteTask(mockTasks[1].id);
    expect(storedTasks).toHaveLength(0);
  });

  test('should not delete a non-existent task', () => {
    expect(() => { taskManager.deleteTask(1) }).toThrow('Task [ID: 1] is not found.');
    expect(() => { taskManager.deleteTask('invalidId') }).toThrow('Error: Please provide a valid task ID.');
  });
});


