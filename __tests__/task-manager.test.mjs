import { expect, jest } from '@jest/globals';

let testTasks = [];
let newTaskId = 1;

jest.unstable_mockModule('node:fs', () => ({
  readFileSync: jest.fn(() => JSON.stringify(testTasks)),
  writeFileSync: jest.fn((path, data) => {
    testTasks = JSON.parse(data);
  }),
  existsSync: jest.fn(() => true),
}));

const { writeFileSync, readFileSync, existsSync } = await import('node:fs');
const taskManager = await import('../task-manager.mjs');

describe('Task management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    testTasks = [];
    newTaskId = 1;
  });

  test('should create and save a new task', () => {
    const description = 'Test task 1';

    taskManager.addTask(description);

    expect(testTasks).toHaveLength(1);
    expect(testTasks[0]).toEqual({
      id: 1,
      description: 'Test task 1',
      status: 'todo',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(testTasks[0].createdAt).toEqual(testTasks[0].updatedAt);
  });

  test('should not create a task with an empty description', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    taskManager.addTask('');
    expect(testTasks).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalledWith('Error: Please provide a valid task description. Description cannot be empty.');
    consoleSpy.mockRestore();
  });

  test('should list tasks correctly', async () => {
    const tasks = taskManager.getTasks();
    expect(tasks).toHaveLength(0);
    expect(tasks).toStrictEqual(testTasks);

    taskManager.addTask('First Test Task');
    taskManager.addTask('Second Test Task');

    const newTasks = taskManager.getTasks();
    expect(newTasks).toHaveLength(2);
    expect(newTasks).toStrictEqual(testTasks);
    expect(newTasks[0]).toEqual({
      id: 1,
      description: 'First Test Task',
      status: 'todo',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(newTasks[0].createdAt).toEqual(newTasks[0].updatedAt);

    expect(newTasks[1]).toEqual({
      id: 2,
      description: 'Second Test Task',
      status: 'todo',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(newTasks[1].createdAt).toEqual(newTasks[1].updatedAt);
  });

  test('should update a task description', () => {
    taskManager.addTask('Test Task 1');
    expect(testTasks[0].id).toEqual(1);
    expect(testTasks[0].description).toEqual('Test Task 1');

    taskManager.updateTask(1, 'Updated Task');
    expect(testTasks[0].description).toEqual('Updated Task');
    expect(testTasks[0].status).toEqual('todo');
    expect(new Date(testTasks[0].createdAt).getTime()).toBeLessThan(new Date(testTasks[0].updatedAt).getTime());
  });

  test('should not update a non-existent task', () => {
    const consoleLogSpy = jest.spyOn(console, 'log');
    const consoleErrorSpy = jest.spyOn(console, 'error');
    taskManager.updateTask(1, 'Updated Task');
    expect(testTasks).toHaveLength(0);
    expect(consoleLogSpy).toHaveBeenCalledWith('Task [ID: 1] is not found.');

    taskManager.updateTask('invalidId', 'Updated Task');
    expect(testTasks).toHaveLength(0);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Please provide a valid task ID.');

    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('should not update a task with an empty description', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    taskManager.addTask('Test Task');
    taskManager.updateTask(1, '');
    expect(testTasks).toHaveLength(1);
    expect(testTasks[0].description).toEqual('Test Task');
    expect(testTasks[0].createdAt).toEqual(testTasks[0].updatedAt);
    expect(consoleSpy).toHaveBeenCalledWith('Error: Please provide a valid task description. Description cannot be empty.');
    consoleSpy.mockRestore();
  });

  test('should change the status of a task as (done)', () => {
    taskManager.addTask('Test Task');
    expect(testTasks[0].id).toEqual(1);
    expect(testTasks[0].status).toEqual('todo');

    taskManager.markTaskStatus(1, 'done');

    expect(testTasks[0].id).toEqual(1);
    expect(testTasks[0].status).toEqual('done');
    expect(new Date(testTasks[0].createdAt).getTime()).toBeLessThan(new Date(testTasks[0].updatedAt).getTime());
  });

  test('should change the status of a task as (in-progress)', () => {
    taskManager.addTask('Test Task');
    expect(testTasks[0].id).toEqual(1);
    expect(testTasks[0].status).toEqual('todo');

    taskManager.markTaskStatus(1, 'in-progress');

    expect(testTasks[0].id).toEqual(1);
    expect(testTasks[0].status).toEqual('in-progress');
    expect(new Date(testTasks[0].createdAt).getTime()).toBeLessThan(new Date(testTasks[0].updatedAt).getTime());
  });

  test('should not change the status of a non-existent task', () => {
    const consoleLogSpy = jest.spyOn(console, 'log');
    expect(testTasks).toHaveLength(0);
    taskManager.markTaskStatus(1, 'todo');
    expect(consoleLogSpy).toHaveBeenCalledWith('Task [ID: 1] is not found.');
    consoleLogSpy.mockRestore();

    const consoleErrorSpy = jest.spyOn(console, 'error');
    taskManager.markTaskStatus('invalidId', 'todo');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Please provide a valid task ID.');
    consoleErrorSpy.mockRestore();
  });

  test('should not change the status of a task with ivalid value', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    taskManager.addTask('Test Task');
    expect(testTasks[0].id).toEqual(1);
    expect(testTasks[0].status).toEqual('todo');

    taskManager.markTaskStatus(1, 'test');

    expect(testTasks[0].id).toEqual(1);
    expect(testTasks[0].status).toEqual('todo');
    expect(testTasks[0].createdAt).toEqual(testTasks[0].updatedAt);
    expect(consoleSpy).toHaveBeenCalledWith('Error: Please provide a valid status (todo, in-progress, done).');
    consoleSpy.mockRestore();
  });

  test('should delete a task successfully', () => {
    expect(testTasks).toHaveLength(0);
    taskManager.addTask('Test Task');
    expect(testTasks).toHaveLength(1);
    taskManager.deleteTask(1);
    expect(testTasks).toHaveLength(0);
  });

  test('should not delete a non-existent task', () => {
    const consoleLogSpy = jest.spyOn(console, 'log');
    expect(testTasks).toHaveLength(0);
    taskManager.deleteTask(1);
    expect(consoleLogSpy).toHaveBeenCalledWith('Task [ID: 1] is not found.');
    consoleLogSpy.mockRestore();

    const consoleErrorSpy = jest.spyOn(console, 'error');
    taskManager.deleteTask('invalidId');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Please provide a valid task ID.');
    consoleErrorSpy.mockRestore();
  });
});


