import React, { useEffect, useState } from 'react';
import './App.css';
import Todo, { TodoType } from './Todo';

function App() {
  const [todos, setTodos] = useState<Array<TodoType>>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const fetchTodos = async () => {
    try {
      const response = await fetch('http://localhost:8080/');
      if (response.status !== 200) {
        console.log('Error fetching data');
        return;
      }
      const todosData: Array<TodoType> = await response.json();
      if (Array.isArray(todosData)) {
        setTodos(todosData);
      } else {
        console.log('Fetched data is not an array');
        setTodos([]); 
      }
    } catch (e) {
      console.log('Could not connect to server. Ensure it is running. ' + e);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const todo: TodoType = { id: Date.now().toString(), title, description };
  
    try {
      const response = await fetch('http://localhost:8080/', {
        method: 'POST',
        body: JSON.stringify(todo),
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.status === 201 || response.status === 200) { 
        setTitle("");
        setDescription("");
        await fetchTodos();
      } else {
        console.log(`Error adding todo. Status code: ${response.status}`);
        const responseBody = await response.text();
        console.log(`Server response: ${responseBody}`);
      }
    } catch (e) {
      console.log('Could not connect to server. Ensure it is running. ' + e);
    }
  };
  
  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/?id=${id}`, {
        method: 'DELETE',
      });
  
      if (response.status === 200) {
        await fetchTodos(); 
      } else {
        console.log('Error deleting todo');
      }
    } catch (e) {
      console.log('Could not connect to server. Ensure it is running. ' + e);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>TODO</h1>
      </header>

      <div className="todo-list">
        {todos.map((todo) =>
          <Todo 
            key={todo.id}
            id={todo.id}
            title={todo.title}
            description={todo.description}
            deleteTodo={deleteTodo}
          />
        )}
      </div>
      
      <h2>Add a Todo</h2>
      <form onSubmit={addTodo}>
        <input placeholder="Title" name="title" autoFocus={true} value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Description" name="description" value={description} onChange={e => setDescription(e.target.value)} />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
}

export default App;