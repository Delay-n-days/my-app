import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://aderversa:123456@175.178.107.232:5432/testdb'
});

export async function query(text: string, params?: unknown[]) {
  const result = await pool.query(text, params);
  return result;
}

// 初始化数据库表
export async function initDB() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(createTableQuery);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Todo 操作函数
export async function getTodos() {
  const result = await query('SELECT * FROM todos ORDER BY created_at DESC');
  return result.rows;
}

export async function createTodo(title: string) {
  const result = await query(
    'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
    [title, false]
  );
  return result.rows[0];
}

export async function updateTodo(id: number, completed: boolean) {
  const result = await query(
    'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *',
    [completed, id]
  );
  return result.rows[0];
}

export async function deleteTodo(id: number) {
  await query('DELETE FROM todos WHERE id = $1', [id]);
}

export default pool;
