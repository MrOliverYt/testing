import React from 'react';
import './App.css';

export type TodoType = {
  id: string;
  title: string;
  description: string;
}

interface TodoProps extends TodoType {
  deleteTodo: (id: string) => void;
}

function Todo({ id, title, description, deleteTodo }: TodoProps) {
  return (
    <div className="todo">
      <div className="todo-details">
        <p className="todo-title">{title}</p>
        <p className="todo-description">{description}</p>
      </div>
      <button onClick={() => deleteTodo(id)}>Delete</button>
    </div>
  );
}

export default Todo;