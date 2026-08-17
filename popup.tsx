import { useState } from "react"
import { useStorage } from "@plasmohq/storage/hook"

interface SubTask {
  id: string
  title: string
  completed: boolean
}

interface TaskCategory {
  id: string
  title: string
  isExpanded?: boolean
  tasks: SubTask[]
}

export default function IndexPopup() {
  const [categories, setCategories] = useStorage<TaskCategory[]>("todo_categories", [
    {
      id: "1",
      title: "Daily",
      isExpanded: true,
      tasks: [
        { id: "101", title: "Wash the car", completed: true },
        { id: "102", title: "Write a song", completed: false }
      ]
    }
  ])

  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [activeInputCategoryId, setActiveInputCategoryId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")

  const toggleCategory = (categoryId: string) => {
    setCategories(
      categories?.map((cat) =>
        cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
      ) || []
    )
  }

  const deleteCategory = (categoryId: string) => {
    setCategories(categories?.filter((cat) => cat.id !== categoryId) || [])
  }

  const toggleTask = (categoryId: string, taskId: string) => {
    setCategories(
      categories?.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          tasks: cat.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          )
        }
      }) || []
    )
  }

  const addTask = (categoryId: string) => {
    if (!newTaskTitle.trim()) return
    setCategories(
      categories?.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          tasks: [
            ...cat.tasks,
            { id: crypto.randomUUID(), title: newTaskTitle.trim(), completed: false }
          ]
        }
      }) || []
    )
    setNewTaskTitle("")
    setActiveInputCategoryId(null)
  }

  const addCategory = () => {
    if (!newCategoryTitle.trim()) return
    setCategories([
      ...(categories || []),
      {
        id: crypto.randomUUID(),
        title: newCategoryTitle.trim(),
        isExpanded: true,
        tasks: []
      }
    ])
    setNewCategoryTitle("")
  }

  const deleteTask = (categoryId: string, taskId: string) => {
    setCategories(
      categories?.map((cat) =>
        cat.id === categoryId
          ? { ...cat, tasks: cat.tasks.filter((t) => t.id !== taskId) }
          : cat
      ) || []
    )
  }

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 8px;
          background: transparent !important;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          user-select: none;
        }
        * {
          box-sizing: border-box;
        }

        /* Smooth Elastic Scrolling */
        .glass-scroll {
          overflow-y: auto;
          scroll-behavior: smooth;
          mask-image: linear-gradient(to bottom, black calc(100% - 24px), transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 24px), transparent 100%);
        }
        .glass-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .glass-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 999px;
          margin: 4px 0;
        }
        .glass-scroll::-webkit-scrollbar-thumb {
          background: rgba(140, 130, 190, 0.4);
          border-radius: 999px;
          transition: background 0.2s ease;
        }
        .glass-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }

        /* Hover & Micro-interaction Animations */
        .hover-card {
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -4px rgba(120, 105, 170, 0.18), inset 0 1px 2px rgba(255, 255, 255, 1);
          border-color: rgba(255, 255, 255, 0.95);
        }

        .hover-task {
          transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.18s ease, box-shadow 0.18s ease;
        }
        .hover-task:hover {
          transform: scale(1.015);
          filter: brightness(1.03);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
        }
        .hover-task:active {
          transform: scale(0.98);
        }

        .action-btn {
          transition: transform 0.18s ease, background 0.18s ease, opacity 0.18s ease;
        }
        .action-btn:hover {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 0.7);
        }
        .action-btn:active {
          transform: scale(0.92);
        }

        .hover-add-btn {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, background 0.2s ease;
        }
        .hover-add-btn:hover {
          transform: scale(1.08) rotate(90deg);
          box-shadow: 0 8px 20px rgba(18, 20, 26, 0.28);
          background: #000000;
        }
        .hover-add-btn:active {
          transform: scale(0.92) rotate(90deg);
        }

        .subtask-btn {
          transition: all 0.2s ease;
        }
        .subtask-btn:hover {
          background: rgba(255, 255, 255, 0.65);
          border-color: rgba(99, 102, 241, 0.6);
          transform: translateY(-1px);
        }
        .subtask-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.glowCircleOne} />
        <div style={styles.glowCircleTwo} />

        <div style={styles.layout}>
          {/* Header */}
          <div style={styles.header}>
            <h2 style={styles.mainHeading}>Choose a task</h2>
            <p style={styles.subHeading}>Make a choice to start</p>
          </div>

          {/* Dynamic Scroll Area */}
          <div className="glass-scroll" style={styles.scrollArea}>
            {categories && categories.length > 0 ? (
              categories.map((cat) => {
                const total = cat.tasks.length
                const completedCount = cat.tasks.filter((t) => t.completed).length
                const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0

                return (
                  <div key={cat.id} className="hover-card" style={styles.glassCard}>
                    {/* Category Card Header */}
                    <div
                      style={styles.cardHeader}
                      onClick={() => toggleCategory(cat.id)}
                    >
                      <div style={styles.glassBadge}>
                        {percentage === 100 ? (
                          <span style={{ color: "#6366f1", fontWeight: 800 }}>✓</span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#6366f1" }}>
                            {percentage}%
                          </span>
                        )}
                      </div>
                      <span style={styles.cardTitle}>{cat.title}</span>

                      <div style={styles.headerActions}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteCategory(cat.id)
                          }}
                          title="Delete list"
                          className="action-btn"
                          style={styles.iconBtn}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                        <span style={{ ...styles.chevron, transform: cat.isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Expandable Task Items */}
                    {cat.isExpanded && (
                      <div style={styles.tasksContainer}>
                        {cat.tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => toggleTask(cat.id, task.id)}
                            className="hover-task"
                            style={{
                              ...styles.taskRow,
                              ...(task.completed ? styles.taskRowCompleted : styles.taskRowActive)
                            }}
                          >
                            <div style={styles.taskLeft}>
                              <div
                                style={{
                                  ...styles.taskIconBubble,
                                  background: task.completed ? "rgba(255,255,255,0.95)" : "rgba(17, 19, 23, 0.9)"
                                }}
                              >
                                <span style={{ fontSize: 11, color: task.completed ? "#111" : "#fff" }}>
                                  {task.completed ? "✓" : "✎"}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: task.completed ? "#ffffff" : "#1f2937",
                                  textDecoration: task.completed ? "line-through" : "none"
                                }}
                              >
                                {task.title}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteTask(cat.id, task.id)
                              }}
                              className="action-btn"
                              style={styles.deleteTaskBtn}
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        {activeInputCategoryId === cat.id ? (
                          <div style={styles.inputRow}>
                            <input
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && addTask(cat.id)}
                              placeholder="Task name..."
                              autoFocus
                              style={styles.inlineInput}
                            />
                            <button onClick={() => addTask(cat.id)} style={styles.inlineAddBtn}>
                              Add
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveInputCategoryId(cat.id)}
                            className="subtask-btn"
                            style={styles.addSubtaskTrigger}
                          >
                            + Add subtask
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div style={styles.emptyState}>No lists yet. Create one below!</div>
            )}
          </div>

          {/* Fixed Footer */}
          <div style={styles.footer}>
            <input
              value={newCategoryTitle}
              onChange={(e) => setNewCategoryTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="New task list name..."
              style={styles.bottomInput}
            />
            <button onClick={addCategory} className="hover-add-btn" style={styles.bottomAddBtn} title="Add list">
              +
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    width: 350,
    height: 540,
    borderRadius: 32,
    background: "linear-gradient(150deg, #F6F2FD 0%, #EBE4FA 50%, #E0E8FC 100%)",
    color: "#1e1e24",
    overflow: "hidden",
    boxShadow: "0 20px 48px rgba(100, 85, 150, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.95)",
    border: "1px solid rgba(255, 255, 255, 0.85)"
  },
  glowCircleOne: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(199, 178, 255, 0.6) 0%, rgba(199, 178, 255, 0) 70%)",
    filter: "blur(25px)",
    pointerEvents: "none"
  },
  glowCircleTwo: {
    position: "absolute",
    bottom: -40,
    right: -40,
    width: 190,
    height: 190,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(165, 203, 255, 0.6) 0%, rgba(165, 203, 255, 0) 70%)",
    filter: "blur(30px)",
    pointerEvents: "none"
  },
  layout: {
    position: "relative",
    zIndex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "20px 16px 16px 16px"
  },
  header: {
    flexShrink: 0,
    marginBottom: 14,
    paddingLeft: 4
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.6px",
    margin: 0,
    color: "#14151a"
  },
  subHeading: {
    fontSize: 12,
    color: "#7e8299",
    margin: "4px 0 0 0"
  },
  scrollArea: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingRight: 4,
    paddingBottom: 16
  },
  glassCard: {
    flexShrink: 0,
    borderRadius: 24,
    background: "rgba(255, 255, 255, 0.62)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.85)",
    boxShadow: "0 8px 20px -4px rgba(135, 120, 180, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.9)",
    overflow: "hidden",
    cursor: "pointer"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px"
  },
  glassBadge: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.9)",
    boxShadow: "0 2px 6px rgba(99, 102, 241, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    flexShrink: 0
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1e222e",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 6
  },
  iconBtn: {
    background: "rgba(255, 255, 255, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.7)",
    cursor: "pointer",
    padding: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%"
  },
  chevron: {
    fontSize: 9,
    color: "#7e8299",
    transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)"
  },
  tasksContainer: {
    padding: "0 12px 14px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  taskRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "9px 12px",
    borderRadius: 999,
    cursor: "pointer"
  },
  taskRowActive: {
    background: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.95)",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)"
  },
  taskRowCompleted: {
    background: "rgba(18, 20, 26, 0.92)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.16)"
  },
  taskLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    overflow: "hidden"
  },
  taskIconBubble: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  deleteTaskBtn: {
    background: "none",
    border: "none",
    color: "#9ca3af",
    fontSize: 12,
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1
  },
  addSubtaskTrigger: {
    background: "rgba(255, 255, 255, 0.4)",
    border: "1px dashed rgba(160, 164, 184, 0.7)",
    borderRadius: 999,
    color: "#6366f1",
    fontSize: 11,
    fontWeight: 700,
    padding: "8px",
    cursor: "pointer",
    marginTop: 2
  },
  inputRow: {
    display: "flex",
    gap: 6,
    marginTop: 2
  },
  inlineInput: {
    flex: 1,
    padding: "7px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255, 255, 255, 0.9)",
    background: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    outline: "none"
  },
  inlineAddBtn: {
    padding: "7px 14px",
    borderRadius: 999,
    border: "none",
    background: "#12141a",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer"
  },
  emptyState: {
    textAlign: "center",
    padding: "32px 0",
    fontSize: 13,
    color: "#8c8fa1"
  },
  footer: {
    flexShrink: 0,
    display: "flex",
    gap: 8,
    paddingTop: 10
  },
  bottomInput: {
    flex: 1,
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid rgba(255, 255, 255, 0.9)",
    background: "rgba(255, 255, 255, 0.65)",
    fontSize: 12,
    outline: "none",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.8)"
  },
  bottomAddBtn: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#12141a",
    color: "#fff",
    border: "none",
    fontSize: 20,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 14px rgba(0, 0, 0, 0.16)",
    flexShrink: 0
  }
}