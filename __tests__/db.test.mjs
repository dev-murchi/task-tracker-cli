import { describe, expect, jest } from '@jest/globals';

const mClient = {
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn(),
};

const mockTasks = [
  { taskid: 1, description: 'first task', status: 'TODO' },
  { taskid: 2, description: 'second task', status: 'IN-PROGRESS' },
  { taskid: 3, description: 'third task', status: 'DONE' }
];

const dbUrl = 'db://connection/url';

jest.unstable_mockModule('pg', () => ({
  default: {
    Client: jest.fn(() => mClient)
  }
}));

const { connectDB, closeDB, findAll, findById, deleteById, updateById, create } = await import('../db.mjs');

describe('Database Client', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  test('should successfully connect to database', async () => {
    await connectDB(dbUrl);
    expect(mClient.connect).toHaveBeenCalledTimes(1);
  });

  test('should fail while connecting to the database', async () => {
    mClient.connect.mockRejectedValueOnce('DB Connection Fail');
    expect(async () => { await connectDB() }).rejects.toThrow('DB Connection Fail');
    expect(mClient.connect).toHaveBeenCalledTimes(1);
  });

  test('should close database connection', async () => {
    await connectDB(dbUrl);
    await closeDB();
    expect(mClient.end).toHaveBeenCalledTimes(1);
  });

  test('should fail while closing the database connection', async () => {
    mClient.end.mockRejectedValueOnce('Connection could not closed.');
    await connectDB(dbUrl);
    expect(async () => { await closeDB() }).rejects.toThrow('Connection could not closed.');
    expect(mClient.end).toHaveBeenCalledTimes(1);
  });

  test('should get all tasks from database', async () => {
    await connectDB(dbUrl);
    mClient.query.mockReturnValueOnce({ rows: mockTasks });
    const resp = await findAll();
    expect(resp).toEqual(mockTasks);
    expect(mClient.query).toHaveBeenCalledTimes(1);
  });

  test('should fail while getting tasks from database', async () => {
    mClient.query.mockRejectedValueOnce('Could not get tasks.');
    await connectDB(dbUrl);
    expect(async () => { await findAll() }).rejects.toThrow('Could not get tasks.');
    expect(mClient.query).toHaveBeenCalledTimes(1);
  });

  test('should get the task with given id', async () => {
    await connectDB(dbUrl);
    mClient.query.mockReturnValueOnce({ rows: [{ taskid: 1, description: 'first task', status: 'TODO' }] });
    const resp = await findById(1);
    expect(resp).toEqual([{ taskid: 1, description: 'first task', status: 'TODO' }]);
    expect(mClient.query).toHaveBeenCalledTimes(1);
  });

  test('should fail while getting the task with given id', async () => {
    mClient.query.mockRejectedValueOnce('Could not get the task.');
    await connectDB(dbUrl);
    expect(async () => { await findById(1) }).rejects.toThrow('Could not get the task.');
    expect(mClient.query).toHaveBeenCalledTimes(1);
  });

  test('should create a task', async () => {
    await connectDB(dbUrl);
    mClient.query.mockReturnValueOnce({ rows: [{ taskid: 2, description: 'create a new task', status: 'TODO' }] });
    const res = await create('create a new task');
    expect(res).toEqual([{ taskid: 2, description: 'create a new task', status: 'TODO' }]);
    expect(mClient.query).toHaveBeenCalledTimes(1);
  });

  test('should fail while creating a task', async () => {
    await connectDB(dbUrl);
    mClient.query.mockRejectedValueOnce('Could not create the task.');
    expect(async () => { await create('My first task.') }).rejects.toThrow('Could not create the task.');
    expect(mClient.query).toHaveBeenCalledTimes(1);
  });

  test('should update the task with given id', async () => {
    await connectDB(dbUrl);
    mClient.query.mockReturnValueOnce({ rows: [{ taskid: 2, description: 'create a new task', status: 'IN-PROGRESS' }] });
    const resp1 = await findById(2);
    expect(resp1).toEqual([{ taskid: 2, description: 'create a new task', status: 'IN-PROGRESS' }]);

    mClient.query.mockReturnValueOnce({ rows: [{ taskid: 2, description: 'updated task', status: 'TODO' }] });
    const resp2 = await updateById(2, { description: 'updated task', status: 'TODO' });
    expect(resp2).toEqual([{ taskid: 2, description: 'updated task', status: 'TODO' }]);

    mClient.query.mockReturnValueOnce({ rows: [{ taskid: 2, description: 'updated task', status: 'DONE' }] });
    const resp3 = await updateById(2, { status: 'DONE' });
    expect(resp3).toEqual([{ taskid: 2, description: 'updated task', status: 'DONE' }]);

    expect(mClient.query).toHaveBeenCalledTimes(3);
  });

  test('should fail while updating the task when no field is provided', async () => {
    await connectDB(dbUrl);
    expect(async () => { await updateById(1, {}) }).rejects.toThrow('Error: No field is provided to update.');
    expect(mClient.query).toHaveBeenCalledTimes(0);

    mClient.query.mockRejectedValueOnce('Could not update the task.');
    expect(async () => { await updateById(1, { test: 'test' }) }).rejects.toThrow('Could not update the task.');
    expect(mClient.query).toHaveBeenCalledTimes(1);
  });

  test('should delete the task with given id', async () => {
    await connectDB(dbUrl);
    mClient.query.mockReturnValueOnce({ rows: [{ taskid: 1, description: 'first task', status: 'TODO' }] });
    const resp = await deleteById(1);
    expect(resp).toEqual([{ taskid: 1, description: 'first task', status: 'TODO' }]);
    expect(mClient.query).toHaveBeenCalledTimes(1);
  });

  test('should fail while deleting the task', async () => {
    await connectDB(dbUrl);
    mClient.query.mockReturnValueOnce({ rows: [] });
    mClient.query.mockRejectedValueOnce('Could not delete the task.');
    expect(async () => { await deleteById(1) }).rejects.toThrow('Error: Task is not exist.');
    expect(async () => { await deleteById(2) }).rejects.toThrow('Could not delete the task.');
    expect(mClient.query).toHaveBeenCalledTimes(2);
  });
});
