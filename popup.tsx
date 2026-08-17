import { useState } from "react"
import { useStorage } from "@plasmohq/storage/hook"

interface TodoItem {
  id: string
  text: string
  completed: boolean
}

function IndexPopup() {
  const [todos, setTodos] = useStorage<TodoItem[]>("todos", [])
  const [input, setInput] = useState("")

  const addTodo = () => {
    if (!input.trim()) return
    setTodos([
      ...(todos || []),
      { id: crypto.randomUUID(), text: input.trim(), completed: false }
    ])
    setInput("")
  }

  const toggleTodo = (id: string) => {
    setTodos(
      todos?.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)) || []
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(todos?.filter((t) => t.id !== id) || [])
  }

  return (
    <div style={{ padding: 16, width: 320, fontFamily: "system-ui, sans-serif", color: "#111827" }}>
      <h3 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: 600 }}>Task Tracker</h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTodo()
            }
          }}
          placeholder="Add a new task..."
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            fontSize: 14,
            outline: "none"
          }}
        />
        <button
          onClick={addTodo}
          style={{
            padding: "8px 14px",
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: 6,
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          Add
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 260, overflowY: "auto" }}>
        {todos && todos.length > 0 ? (
          todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #f3f4f6"
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1 }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  style={{ cursor: "pointer" }}
                />
                <span
                  style={{
                    fontSize: 14,
                    textDecoration: todo.completed ? "line-through" : "none",
                    color: todo.completed ? "#9ca3af" : "#111827",
                    wordBreak: "break-word"
                  }}
                >
                  {todo.text}
                </span>
              </label>
              <button
                onClick={() => deleteTodo(todo.id)}
                aria-label="Delete todo"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: 16,
                  padding: "0 4px",
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </li>
          ))
        ) : (
          <li style={{ textAlign: "center", padding: "16px 0", color: "#9ca3af", fontSize: 13 }}>
            No tasks yet. Add one above!
          </li>
        )}
      </ul>
    </div>
  )
}

export default IndexPopup