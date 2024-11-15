# Task Tracker CLI App

A simple Node.js-based Command Line Interface (CLI) application for managing tasks. The app offers two versions: one that stores tasks in a JSON file and another that uses PostgreSQL for persistent storage. This app allows users to add, update, delete, and track the status of their tasks. It supports task statuses like `todo`, `in-progress`, and `done`.

## Features

- **Add a Task:** Add a new task with a description.
- **Update a Task:** Update the description of an existing task.
- **Delete a Task:** Remove a task from the task list.
- **Mark a Task as Todo, In Progress or Done:** Change the status of a task.
- **List Tasks:** View all tasks, tasks with specific statuses (e.g., `done`, `in-progress`, `todo`).

## Versions

### Version 1: JSON File Storage in branch: [store-tasks-in-file](https://github.com/dev-murchi/task-tracker-cli/tree/store-tasks-in-file)

In this version, tasks are stored in a local JSON file (tasks.json). This is a simple solution for smaller apps or personal projects.

### Version 2: Database Storage in branch: [store-tasks-in-db](https://github.com/dev-murchi/task-tracker-cli/tree/store-tasks-in-db)

This version uses PostgreSQL database to store tasks persistently. It allows for more scalable storage and is suitable for larger applications.

## Task Statuses

- **todo**: Task has not been started.
- **in-progress**: Task is currently being worked on.
- **done**: Task is completed.

## Available Commands

### 1. List All Tasks

To list all tasks, run the following command:

```bash
node app.mjs list
```

This will display all tasks regardless of their current status.

### 2. List Tasks by Status

To list tasks by a specific status, use the following command:

```bash
node app.mjs list <status>
```

Replace `<status>` with one of the following: `todo`, `in-progress`, or `done`. For example:

```bash
node app.mjs list todo
node app.mjs list in-progress
node app.mjs list done
```

### 3. Add a Task

To add a new task, use the following command:

```bash
node app.mjs add <description>
```

Replace <description> with the description of the task. For example:

```bash
node app.mjs add "Finish writing report"
```

### 4. Update a Task

To update the description of an existing task, use this command:

```bash
node app.mjs update <id> <description>
```

Replace `<id>` with the ID of the task you want to update, and `<description>` with the new description. For example:

```bash
node app.mjs update 3 "Finish writing report and submit"
```

### 5. Mark a Task as Done or In Progress

To change the status of a task, use the following command:

```bash
node app.mjs mark <id> <status>
```

Replace `<id>` with the task ID and `<status>` with one of the following: todo, in-progress, or done. For example:

```bash
node app.mjs mark 2 in-progress
node app.mjs mark 3 done
```

### 6. Delete a Task

To delete a task, run:

```bash
node app.mjs delete <id>
```

Replace <id> with the task ID. For example:

```bash
node app.mjs delete 5
```

## Prerequisites

- Node.js
- Ensure PostgreSQL is installed and running on your machine.

## Installation Steps

### Version 1: JSON File Storage

#### 1. Clone this repository or download the app files.

```bash
git clone https://github.com/dev-murchi/task-tracker-cli.git
```

#### 2. Navigate to the project directory.

```bash
cd task-tracker-cli
```

#### 3. Install dependencies:

```bash
npm install
```

#### 4. Run the app:

```bash
node app.mjs <command>
```

### Version 2: Database Storage

#### 1. Clone this repository or download the app files.

```bash
git clone https://github.com/dev-murchi/task-tracker-cli.git
```

#### 2. Navigate to the project directory.

```bash
cd task-tracker-cli
```

#### 3. Install dependencies:

```bash
npm install
```

#### 4. Set up PostgreSQL:

- Ensure you have PostgreSQL installed and running on your machine.
- Create a database called `task_tracker` in PostgreSQL if it doesn't already exist (_you are free to change the database name_):

```bash
CREATE DATABASE task_tracker;
```

#### 5. Create the tasks table:

- (_you are free to change the table name_)

```bash
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'todo'
);

```

#### 6. Add database configurations in `.env` file.

> **Note:** If you're using a database, you may need to modify database credentials and ensure the correct driver (e.g., PostgreSQL) is installed and configured.

#### 7. Run the app:

```bash
node app.mjs <command>
```

## Example Usage

### Add New Tasks:

```bash
node app.mjs add "Buy groceries"
node app.mjs add "Clean the house"
node app.mjs add "Write project proposal"
```

### List Tasks by Status:

```bash
node app.mjs list todo
node app.mjs list in-progress
node app.mjs list done
```

### Update a Task Description:

```bash
node app.mjs update 2 "Clean the house and organize the garage"
```

### Mark Task as In Progress:

```bash
node app.mjs mark 1 in-progress
```

### Mark Task as Done:

```bash
node app.mjs mark 1 done
```

### Delete a Task:

```bash
node app.mjs delete 3
```

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/dev-murchi/task-tracker-cli/blob/main/LICENSE) file for details.

## Troubleshooting

- **Database Connection Issues:** If you're getting connection errors, double-check your PostgreSQL credentials and ensure that the database server is running.

- **Missing Tasks Table:** If you see errors related to the table not existing, ensure that you've created the tasks table in PostgreSQL by running the SQL command from the Set Up PostgreSQL section.

- **PostgreSQL Authentication Errors:** If you're using different credentials (e.g., non-default username or password), make sure your `.env` file is updated accordingly.

## Notes

**Database Driver:** This app uses the `pg` package for PostgreSQL. You can check or modify the connection configuration in `.env` file if necessary.
