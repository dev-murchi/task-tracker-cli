import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

// create a client
let dbClient;

// connect to database
export async function connectDB(connectionString) {
  try {
    dbClient = new Client({ connectionString });
    await dbClient.connect();
    console.log('Connected to database.');
  } catch (error) {
    throw new Error(error);
  }
}

// close database connection
export async function closeDB() {
  try {
    await dbClient.end();
    console.log('Disconnected from database');
  } catch (error) {
    throw new Error(error);
  }
}

// get all tasks
export async function findAll() {
  try {
    const queryString = `SELECT ${process.env.DB_COLUMN1}, ${process.env.DB_COLUMN2}, ${process.env.DB_COLUMN3} FROM ${process.env.DB_TABLE};`;
    const response = await dbClient.query(queryString);
    return response.rows;
  } catch (error) {
    throw new Error(error);
  }
}

// get a task by status
export async function findByStatus(status) {
  try {
    const queryString = `SELECT ${process.env.DB_COLUMN1}, ${process.env.DB_COLUMN2}, ${process.env.DB_COLUMN3} FROM ${process.env.DB_TABLE} WHERE ${process.env.DB_COLUMN3} = $1;`;
    const values = [id];
    const response = await dbClient.query(queryString, values);
    return response.rows;
  } catch (error) {
    throw new Error(error);
  }
}

// get a task by id
export async function findById(id) {
  try {
    const queryString = `SELECT ${process.env.DB_COLUMN1}, ${process.env.DB_COLUMN2}, ${process.env.DB_COLUMN3} FROM ${process.env.DB_TABLE} WHERE ${process.env.DB_COLUMN1} = $1;`;
    const values = [id];
    const response = await dbClient.query(queryString, values);
    return response.rows;
  } catch (error) {
    throw new Error(error);
  }
}

// create a task
export async function create(data) {
  try {
    const queryString = `INSERT INTO ${process.env.DB_TABLE} (${process.env.DB_COLUMN2}, ${process.env.DB_COLUMN3}) VALUES ($1, $2) RETURNING *;`;
    const values = [data, 'TODO'];
    const response = await dbClient.query(queryString, values);
    return response.rows;
  } catch (error) {
    throw new Error(error);
  }
}

// update a task by id
export async function updateById(id, data) {
  try {
    const fields = [];
    const values = [];
    Object.keys(data).forEach((key, index) => {
      fields.push(`${key} = $${index + 2}`);
      values.push(data[key]);
    });

    if (fields.length === 0 && values.length === 0) {
      throw new Error('No field is provided to update.');
    }

    const queryString = `UPDATE ${process.env.DB_TABLE} SET ${fields.join(', ')} WHERE ${process.env.DB_COLUMN1} = $1 RETURNING *;`;
    const response = await dbClient.query(queryString, [id, ...values]);
    return response.rows;
  } catch (error) {
    throw new Error(error);
  }
}

// delete aa task by id
export async function deleteById(id) {
  try {
    const queryString = `DELETE FROM ${process.env.DB_TABLE} WHERE ${process.env.DB_COLUMN1} = $1 RETURNING *`;
    const values = [id];
    const response = await dbClient.query(queryString, values);

    if (response.rows.length === 0) {
      throw new Error('Task is not exist.');
    }
    return response.rows;
  } catch (error) {
    throw new Error(error);
  }
}
