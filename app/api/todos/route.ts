import { NextResponse } from 'next/server';
import { getTodos, createTodo, updateTodo, deleteTodo, initDB } from '@/lib/db';

// 确保数据库表已创建
let dbInitPromise: Promise<void> | null = null;

async function ensureDBInitialized() {
  if (!dbInitPromise) {
    dbInitPromise = initDB();
  }
  await dbInitPromise;
}

// GET - 获取所有todos
export async function GET() {
  try {
    await ensureDBInitialized();
    const todos = await getTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

// POST - 创建新todo
export async function POST(request: Request) {
  try {
    await ensureDBInitialized();
    const { title } = await request.json();
    
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const newTodo = await createTodo(title);
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}

// PATCH - 更新todo状态
export async function PATCH(request: Request) {
  try {
    await ensureDBInitialized();
    const { id, completed } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'completed must be a boolean' }, { status: 400 });
    }
    
    const updatedTodo = await updateTodo(id, completed);
    if (!updatedTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

// DELETE - 删除todo
export async function DELETE(request: Request) {
  try {
    await ensureDBInitialized();
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const deleted = await deleteTodo(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
