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
const { addTask, getTasks, updateTask } = await import('../task-manager.mjs');

describe('Task management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    testTasks = [];
    newTaskId = 1;
  });

  test('should create and save a new task', () => {
    const description = 'Test task 1';

    addTask(description);

    expect(testTasks).toHaveLength(1);
    expect(testTasks[0]).toEqual({
      id: 1,
      description: 'Test task 1',
      status: 'todo',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('should not create a task with an empty description', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    addTask('');
    expect(testTasks).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalledWith('Error: Please provide a valid task description. Description cannot be empty.');
    consoleSpy.mockRestore();
  });

  test('should list tasks correctly', async () => {
    const tasks = getTasks();
    expect(tasks).toHaveLength(0);
    expect(tasks).toStrictEqual(testTasks);

    addTask('First Test Task');
    addTask('Second Test Task');

    const newTasks = getTasks();
    expect(newTasks).toHaveLength(2);
    expect(newTasks).toStrictEqual(testTasks);
    expect(newTasks[0]).toEqual({
      id: 1,
      description: 'First Test Task',
      status: 'todo',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    expect(newTasks[1]).toEqual({
      id: 2,
      description: 'Second Test Task',
      status: 'todo',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('should update a task description', () => {
    addTask('Test Task 1');
    expect(testTasks[0].id).toEqual(1);
    expect(testTasks[0].description).toEqual('Test Task 1');
    expect(testTasks[0].status).toEqual('todo');

    updateTask(1, 'Updated Task');
    expect(testTasks[0].id).toEqual(1);
    expect(testTasks[0].description).toEqual('Updated Task');
    expect(testTasks[0].status).toEqual('todo');
  });

  test('should not update a non-existent task', () => {
    const consoleLogSpy = jest.spyOn(console, 'log');
    const consoleErrorSpy = jest.spyOn(console, 'error');
    updateTask(1, 'Updated Task');
    expect(testTasks).toHaveLength(0);
    expect(consoleLogSpy).toHaveBeenCalledWith('Task [ID: 1] is not found.');

    updateTask('invalidId', 'Updated Task');
    expect(testTasks).toHaveLength(0);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Please provide a valid task ID.');

    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('should not update a task with an empty description', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    addTask('Test Task');
    updateTask(1, '');
    expect(testTasks).toHaveLength(1);
    expect(testTasks[0].id).toEqual(1);
    expect(testTasks[0].description).toEqual('Test Task');
    expect(testTasks[0].status).toEqual('todo');
    expect(consoleSpy).toHaveBeenCalledWith('Error: Please provide a valid task description. Description cannot be empty.');
  });
});


