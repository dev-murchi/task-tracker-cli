import { jest } from '@jest/globals'

let testTasks = [];
let newTaskId = 1;

jest.unstable_mockModule('node:fs', () => ({
  readFileSync: jest.fn(() => JSON.stringify(testTasks)),
  writeFileSync: jest.fn((path, data) => {
    testTasks = JSON.parse(data);
  }),
  existsSync: jest.fn(() => true),
}));

const { addTask } = await import('../task-manager.mjs');
const { writeFileSync, readFileSync, existsSync } = await import('node:fs');

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
});


