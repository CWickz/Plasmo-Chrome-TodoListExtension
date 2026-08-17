import { useState, useRef, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
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

interface ClipboardSnippet {
  id: string
  text: string
  isPinned: boolean
  createdAt: string
}

// Local storage instance (bypasses the 8 KB sync quota for long text)
const localStorageInstance = new Storage({ area: "local" })

// --- Modern Micro-Acoustic Synthesizer ---
const playSound = (type: "add" | "complete" | "uncomplete" | "delete" | "click" | "theme" | "copy") => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    if (type === "complete") {
      const chord = [659.25, 987.77, 1318.51]
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now + i * 0.04)

        gain.gain.setValueAtTime(0, now + i * 0.04)
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.04 + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.35)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.04)
        osc.stop(now + i * 0.04 + 0.38)
      })
    } else if (type === "copy") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(880, now)
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.06)

      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.07)
    } else if (type === "uncomplete") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.05)

      gain.gain.setValueAtTime(0.09, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.06)
    } else if (type === "add") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(420, now)
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.06)

      gain.gain.setValueAtTime(0.09, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.07)
    } else if (type === "delete") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(380, now)
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09)

      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.1)
    } else if (type === "theme" || type === "click") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(1200, now)
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.025)

      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.03)
    }
  } catch (e) {}
}

export default function IndexPopup() {
  const [isDarkMode, setIsDarkMode] = useStorage<boolean>("todo_dark_mode", true)
  const [activeTab, setActiveTab] = useState<"tasks" | "clipboard">("tasks")

  // --- Task State ---
  const [categories, setCategories] = useStorage<TaskCategory[]>(
    {
      key: "todo_categories",
      instance: localStorageInstance
    },
    [
      {
        id: "1",
        title: "Daily",
        isExpanded: true,
        tasks: [
          { id: "101", title: "Wash the car", completed: true },
          { id: "102", title: "Write a song", completed: false }
        ]
      },
      {
        id: "2",
        title: "Work & Projects",
        isExpanded: false,
        tasks: [
          { id: "201", title: "Review PRs", completed: false },
          { id: "202", title: "Design macropad case", completed: false }
        ]
      }
    ]
  )

  // --- Clipboard Snippets State (Backed by Local Storage) ---
  const [snippets, setSnippets] = useStorage<ClipboardSnippet[]>(
    {
      key: "clipboard_snippets",
      instance: localStorageInstance
    },
    [
      {
        id: "s1",
        text: "npm run build -- --target=chrome-mv3",
        isPinned: true,
        createdAt: "10:30 AM"
      },
      {
        id: "s2",
        text: "#6366f1",
        isPinned: false,
        createdAt: "02:15 PM"
      }
    ]
  )

  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [activeInputCategoryId, setActiveInputCategoryId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [manualSnippetText, setManualSnippetText] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Inline editing states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryText, setEditingCategoryText] = useState("")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskText, setEditingTaskText] = useState("")

  // Scroll dynamics
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    setCanScrollUp(scrollTop > 4)
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 4)

    const maxScroll = scrollHeight - clientHeight
    setScrollProgress(maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [categories, snippets, activeTab])

  // --- Task Methods ---
  const toggleCategory = (categoryId: string) => {
    if (editingCategoryId) return
    playSound("click")
    setCategories(
      categories?.map((cat) =>
        cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
      ) || []
    )
    setTimeout(checkScroll, 120)
  }

  const deleteCategory = (categoryId: string) => {
    playSound("delete")
    setCategories(categories?.filter((cat) => cat.id !== categoryId) || [])
    setTimeout(checkScroll, 120)
  }

  const startEditCategory = (cat: TaskCategory) => {
    playSound("click")
    setEditingCategoryId(cat.id)
    setEditingCategoryText(cat.title)
  }

  const saveEditCategory = (categoryId: string) => {
    if (!editingCategoryText.trim()) {
      setEditingCategoryId(null)
      return
    }
    playSound("add")
    setCategories(
      categories?.map((cat) =>
        cat.id === categoryId ? { ...cat, title: editingCategoryText.trim() } : cat
      ) || []
    )
    setEditingCategoryId(null)
  }

  const startEditTask = (task: SubTask) => {
    playSound("click")
    setEditingTaskId(task.id)
    setEditingTaskText(task.title)
  }

  const saveEditTask = (categoryId: string, taskId: string) => {
    if (!editingTaskText.trim()) {
      setEditingTaskId(null)
      return
    }
    playSound("add")
    setCategories(
      categories?.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          tasks: cat.tasks.map((t) =>
            t.id === taskId ? { ...t, title: editingTaskText.trim() } : t
          )
        }
      }) || []
    )
    setEditingTaskId(null)
  }

  const toggleTask = (categoryId: string, taskId: string) => {
    if (editingTaskId) return
    const currentTask = categories
      ?.find((c) => c.id === categoryId)
      ?.tasks.find((t) => t.id === taskId)

    if (currentTask && !currentTask.completed) {
      playSound("complete")
    } else {
      playSound("uncomplete")
    }

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
    playSound("add")
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
    setTimeout(checkScroll, 120)
  }

  const addCategory = () => {
    if (!newCategoryTitle.trim()) return
    playSound("add")
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
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
      }
      checkScroll()
    }, 100)
  }

  const deleteTask = (categoryId: string, taskId: string) => {
    playSound("delete")
    setCategories(
      categories?.map((cat) =>
        cat.id === categoryId
          ? { ...cat, tasks: cat.tasks.filter((t) => t.id !== taskId) }
          : cat
      ) || []
    )
    setTimeout(checkScroll, 120)
  }

  // --- Clipboard Manager Methods ---
  const copyToClipboard = async (snippet: ClipboardSnippet) => {
    try {
      await navigator.clipboard.writeText(snippet.text)
      playSound("copy")
      setCopiedId(snippet.id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch (err) {}
  }

  const pasteFromSystemClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) return

      if (snippets?.some((s) => s.text === text.trim())) {
        playSound("click")
        return
      }

      const newSnippet: ClipboardSnippet = {
        id: crypto.randomUUID(),
        text: text.trim(),
        isPinned: false,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }

      playSound("add")
      setSnippets([newSnippet, ...(snippets || [])])
      setTimeout(checkScroll, 100)
    } catch (e) {}
  }

  const addManualSnippet = () => {
    if (!manualSnippetText.trim()) return
    const newSnippet: ClipboardSnippet = {
      id: crypto.randomUUID(),
      text: manualSnippetText.trim(),
      isPinned: false,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    playSound("add")
    setSnippets([newSnippet, ...(snippets || [])])
    setManualSnippetText("")
    setTimeout(checkScroll, 100)
  }

  const togglePinSnippet = (id: string) => {
    playSound("click")
    setSnippets(
      snippets?.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s)) || []
    )
  }

  const deleteSnippet = (id: string) => {
    playSound("delete")
    setSnippets(snippets?.filter((s) => s.id !== id) || [])
    setTimeout(checkScroll, 100)
  }

  const convertSnippetToTask = (text: string) => {
    playSound("complete")
    const snippetTitle = text.length > 80 ? text.slice(0, 80) + "..." : text
    if (!categories || categories.length === 0) {
      setCategories([
        {
          id: crypto.randomUUID(),
          title: "Clipboard Tasks",
          isExpanded: true,
          tasks: [{ id: crypto.randomUUID(), title: snippetTitle, completed: false }]
        }
      ])
    } else {
      setCategories(
        categories.map((cat, idx) =>
          idx === 0
            ? {
                ...cat,
                tasks: [
                  ...cat.tasks,
                  { id: crypto.randomUUID(), title: snippetTitle, completed: false }
                ]
              }
            : cat
        )
      )
    }
    setActiveTab("tasks")
  }

  const sortedSnippets = [...(snippets || [])].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))

  // Theme configuration
  const t = isDarkMode
    ? {
        bg: "#0f1016",
        gradient: "linear-gradient(160deg, #11131c 0%, #151824 50%, #0d0f17 100%)",
        textColor: "#f3f4f6",
        subTextColor: "#94a3b8",
        cardBg: "rgba(24, 27, 39, 0.7)",
        cardBorder: "rgba(255, 255, 255, 0.08)",
        cardShadow: "0 10px 24px -4px rgba(0, 0, 0, 0.45)",
        badgeBg: "rgba(99, 102, 241, 0.18)",
        badgeBorder: "rgba(99, 102, 241, 0.35)",
        badgeText: "#818cf8",
        taskActiveBg: "rgba(30, 35, 50, 0.8)",
        taskActiveBorder: "rgba(255, 255, 255, 0.08)",
        taskActiveText: "#f8fafc",
        taskCompletedBg: "rgba(10, 11, 15, 0.92)",
        taskCompletedBorder: "rgba(255, 255, 255, 0.04)",
        taskCompletedText: "#64748b",
        glowOne: "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0) 70%)",
        glowTwo: "radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0) 70%)",
        iconBtnBg: "rgba(255, 255, 255, 0.06)",
        iconBtnBorder: "rgba(255, 255, 255, 0.1)",
        inputBg: "rgba(24, 27, 39, 0.85)",
        inputBorder: "rgba(255, 255, 255, 0.12)",
        actionBtnBg: "#6366f1",
        actionBtnText: "#ffffff",
        subtaskBtnBg: "rgba(255, 255, 255, 0.04)",
        subtaskBtnBorder: "rgba(99, 102, 241, 0.35)",
        tabActiveBg: "#6366f1",
        tabActiveText: "#ffffff",
        tabInactiveText: "#94a3b8"
      }
    : {
        bg: "#F6F2FD",
        gradient: "linear-gradient(150deg, #F6F2FD 0%, #EBE4FA 50%, #E0E8FC 100%)",
        textColor: "#14151a",
        subTextColor: "#7e8299",
        cardBg: "rgba(255, 255, 255, 0.65)",
        cardBorder: "rgba(255, 255, 255, 0.85)",
        cardShadow: "0 8px 20px -4px rgba(135, 120, 180, 0.12)",
        badgeBg: "rgba(255, 255, 255, 0.9)",
        badgeBorder: "rgba(255, 255, 255, 0.9)",
        badgeText: "#6366f1",
        taskActiveBg: "rgba(255, 255, 255, 0.8)",
        taskActiveBorder: "rgba(255, 255, 255, 0.95)",
        taskActiveText: "#1f2937",
        taskCompletedBg: "rgba(18, 20, 26, 0.92)",
        taskCompletedBorder: "rgba(255, 255, 255, 0.15)",
        taskCompletedText: "#ffffff",
        glowOne: "radial-gradient(circle, rgba(199, 178, 255, 0.6) 0%, rgba(199, 178, 255, 0) 70%)",
        glowTwo: "radial-gradient(circle, rgba(165, 203, 255, 0.6) 0%, rgba(165, 203, 255, 0) 70%)",
        iconBtnBg: "rgba(255, 255, 255, 0.4)",
        iconBtnBorder: "rgba(255, 255, 255, 0.7)",
        inputBg: "rgba(255, 255, 255, 0.65)",
        inputBorder: "rgba(255, 255, 255, 0.9)",
        actionBtnBg: "#12141a",
        actionBtnText: "#ffffff",
        subtaskBtnBg: "rgba(255, 255, 255, 0.4)",
        subtaskBtnBorder: "rgba(160, 164, 184, 0.7)",
        tabActiveBg: "#12141a",
        tabActiveText: "#ffffff",
        tabInactiveText: "#6b7280"
      }

  return (
    <>
      <style>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 350px;
          height: 550px;
          background: ${t.bg} !important;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          user-select: none;
        }
        * {
          box-sizing: border-box;
        }

        .glass-scroll {
          overflow-y: auto;
          scroll-behavior: smooth;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        .mask-scroll-both {
          mask-image: linear-gradient(to bottom, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%);
        }
        .mask-scroll-down {
          mask-image: linear-gradient(to bottom, black calc(100% - 20px), transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 20px), transparent 100%);
        }
        .mask-scroll-up {
          mask-image: linear-gradient(to bottom, transparent 0%, black 20px);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20px);
        }

        .glass-scroll::-webkit-scrollbar,
        .custom-code-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .glass-scroll::-webkit-scrollbar-track,
        .custom-code-scroll::-webkit-scrollbar-track {
          background: ${isDarkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.15)"};
          border-radius: 999px;
          margin: 4px 0;
        }
        .glass-scroll::-webkit-scrollbar-thumb,
        .custom-code-scroll::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "rgba(255, 255, 255, 0.18)" : "rgba(140, 130, 190, 0.35)"};
          border-radius: 999px;
          transition: background 0.2s ease;
        }
        .glass-scroll::-webkit-scrollbar-thumb:hover,
        .custom-code-scroll::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }

        .hover-card {
          transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.24s ease, border-color 0.24s ease;
          animation: cardEnter 0.28s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
        .hover-card:hover {
          transform: translateY(-2px) scale(1.005);
          box-shadow: ${isDarkMode ? "0 14px 32px -4px rgba(0, 0, 0, 0.6)" : "0 12px 28px -4px rgba(120, 105, 170, 0.2)"};
          border-color: ${isDarkMode ? "rgba(99, 102, 241, 0.4)" : "rgba(255, 255, 255, 0.95)"};
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .hover-task {
          transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.18s ease, box-shadow 0.18s ease;
        }
        .hover-task:hover {
          transform: scale(1.015);
          filter: brightness(1.05);
          box-shadow: ${isDarkMode ? "0 4px 14px rgba(0, 0, 0, 0.3)" : "0 4px 14px rgba(0, 0, 0, 0.06)"};
        }
        .hover-task:active {
          transform: scale(0.98);
        }

        .hover-snippet {
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }
        .hover-snippet:hover {
          transform: translateY(-2px);
          border-color: ${isDarkMode ? "rgba(99, 102, 241, 0.6)" : "rgba(99, 102, 241, 0.5)"};
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
        }
        .hover-snippet:active {
          transform: scale(0.99);
        }

        .action-btn {
          transition: transform 0.18s ease, background 0.18s ease;
        }
        .action-btn:hover {
          transform: scale(1.15);
          background: ${isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.7)"};
        }
        .action-btn:active {
          transform: scale(0.9);
        }

        .hover-theme-btn {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease;
        }
        .hover-theme-btn:hover {
          transform: rotate(20deg) scale(1.1);
        }

        .hover-add-btn {
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, background 0.2s ease;
        }
        .hover-add-btn:hover {
          transform: scale(1.08) rotate(90deg);
          box-shadow: 0 8px 20px ${isDarkMode ? "rgba(99, 102, 241, 0.4)" : "rgba(18, 20, 26, 0.28)"};
        }
        .hover-add-btn:active {
          transform: scale(0.92) rotate(90deg);
        }

        .subtask-btn {
          transition: all 0.2s ease;
        }
        .subtask-btn:hover {
          background: ${isDarkMode ? "rgba(99, 102, 241, 0.12)" : "rgba(255, 255, 255, 0.65)"};
          border-color: #6366f1;
          transform: translateY(-1px);
        }
        .subtask-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <div
        style={{
          ...styles.container,
          background: t.gradient
        }}
      >
        <div
          style={{
            ...styles.glowCircleOne,
            background: t.glowOne,
            transform: `translateY(${scrollProgress * 0.3}px) scale(${1 + scrollProgress * 0.002})`
          }}
        />
        <div
          style={{
            ...styles.glowCircleTwo,
            background: t.glowTwo,
            transform: `translateY(-${scrollProgress * 0.25}px)`
          }}
        />

        <div style={styles.layout}>
          {/* Header Bar with Tab Switcher & Theme Toggle */}
          <div style={styles.header}>
            <div style={styles.tabSwitcher}>
              <button
                onClick={() => {
                  playSound("click")
                  setActiveTab("tasks")
                }}
                style={{
                  ...styles.tabPill,
                  background: activeTab === "tasks" ? t.tabActiveBg : "transparent",
                  color: activeTab === "tasks" ? t.tabActiveText : t.tabInactiveText
                }}
              >
                Tasks
              </button>
              <button
                onClick={() => {
                  playSound("click")
                  setActiveTab("clipboard")
                }}
                style={{
                  ...styles.tabPill,
                  background: activeTab === "clipboard" ? t.tabActiveBg : "transparent",
                  color: activeTab === "clipboard" ? t.tabActiveText : t.tabInactiveText
                }}
              >
                Clipboard
              </button>
            </div>

            <button
              onClick={() => {
                playSound("theme")
                setIsDarkMode(!isDarkMode)
              }}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="hover-theme-btn"
              style={{
                ...styles.themeToggleBtn,
                background: t.iconBtnBg,
                border: `1px solid ${t.iconBtnBorder}`
              }}
            >
              {isDarkMode ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </div>

          {/* Subheader */}
          <div style={styles.subHeader}>
            <h2 style={{ ...styles.mainHeading, color: t.textColor }}>
              {activeTab === "tasks" ? "Choose a task" : "Clipboard Snippets"}
            </h2>
            <p style={{ ...styles.subHeading, color: t.subTextColor }}>
              {activeTab === "tasks" ? "Make a choice to start" : "One-click copy & fast paste notes"}
            </p>
          </div>

          {/* TAB 1: TASKS */}
          {activeTab === "tasks" && (
            <>
              <div
                ref={scrollRef}
                onScroll={checkScroll}
                className={`glass-scroll ${
                  canScrollUp && canScrollDown
                    ? "mask-scroll-both"
                    : canScrollDown
                    ? "mask-scroll-down"
                    : canScrollUp
                    ? "mask-scroll-up"
                    : ""
                }`}
                style={styles.scrollArea}
              >
                {categories && categories.length > 0 ? (
                  categories.map((cat) => {
                    const total = cat.tasks.length
                    const completedCount = cat.tasks.filter((t) => t.completed).length
                    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0

                    return (
                      <div
                        key={cat.id}
                        className="hover-card"
                        style={{
                          ...styles.glassCard,
                          background: t.cardBg,
                          border: `1px solid ${t.cardBorder}`,
                          boxShadow: t.cardShadow
                        }}
                      >
                        {/* Category Header */}
                        <div style={styles.cardHeader} onClick={() => toggleCategory(cat.id)}>
                          <div
                            style={{
                              ...styles.glassBadge,
                              background: t.badgeBg,
                              border: `1px solid ${t.badgeBorder}`
                            }}
                          >
                            {percentage === 100 ? (
                              <span style={{ color: t.badgeText, fontWeight: 800 }}>✓</span>
                            ) : (
                              <span style={{ fontSize: 11, fontWeight: 800, color: t.badgeText }}>
                                {percentage}%
                              </span>
                            )}
                          </div>

                          {editingCategoryId === cat.id ? (
                            <input
                              value={editingCategoryText}
                              onChange={(e) => setEditingCategoryText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditCategory(cat.id)
                                if (e.key === "Escape") setEditingCategoryId(null)
                              }}
                              onBlur={() => saveEditCategory(cat.id)}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                ...styles.editInput,
                                background: isDarkMode ? "#1e2230" : "#ffffff",
                                color: t.textColor
                              }}
                            />
                          ) : (
                            <span
                              style={{ ...styles.cardTitle, color: t.textColor }}
                              onDoubleClick={(e) => {
                                e.stopPropagation()
                                startEditCategory(cat)
                              }}
                              title="Double-click to edit"
                            >
                              {cat.title}
                            </span>
                          )}

                          <div style={styles.headerActions}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (editingCategoryId === cat.id) {
                                  saveEditCategory(cat.id)
                                } else {
                                  startEditCategory(cat)
                                }
                              }}
                              title={editingCategoryId === cat.id ? "Save name" : "Edit list name"}
                              className="action-btn"
                              style={{
                                ...styles.iconBtn,
                                background: t.iconBtnBg,
                                border: `1px solid ${t.iconBtnBorder}`
                              }}
                            >
                              {editingCategoryId === cat.id ? (
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981" }}>✓</span>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#94a3b8" : "#6b7280"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteCategory(cat.id)
                              }}
                              title="Delete list"
                              className="action-btn"
                              style={{
                                ...styles.iconBtn,
                                background: t.iconBtnBg,
                                border: `1px solid ${t.iconBtnBorder}`
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                            <span style={{ ...styles.chevron, color: t.subTextColor, transform: cat.isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
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
                                  background: task.completed ? t.taskCompletedBg : t.taskActiveBg,
                                  border: `1px solid ${task.completed ? t.taskCompletedBorder : t.taskActiveBorder}`
                                }}
                              >
                                <div style={styles.taskLeft}>
                                  <div
                                    style={{
                                      ...styles.taskIconBubble,
                                      background: task.completed
                                        ? isDarkMode
                                          ? "#334155"
                                          : "rgba(255,255,255,0.95)"
                                        : isDarkMode
                                        ? "#6366f1"
                                        : "rgba(17, 19, 23, 0.9)"
                                    }}
                                  >
                                    <span style={{ fontSize: 11, color: task.completed && !isDarkMode ? "#111" : "#fff" }}>
                                      {task.completed ? "✓" : "✎"}
                                    </span>
                                  </div>

                                  {editingTaskId === task.id ? (
                                    <input
                                      value={editingTaskText}
                                      onChange={(e) => setEditingTaskText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") saveEditTask(cat.id, task.id)
                                        if (e.key === "Escape") setEditingTaskId(null)
                                      }}
                                      onBlur={() => saveEditTask(cat.id, task.id)}
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        ...styles.editTaskInput,
                                        background: isDarkMode ? "#1e2230" : "#fff",
                                        color: t.textColor
                                      }}
                                    />
                                  ) : (
                                    <span
                                      onDoubleClick={(e) => {
                                        e.stopPropagation()
                                        startEditTask(task)
                                      }}
                                      title="Double-click to edit"
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: task.completed ? t.taskCompletedText : t.taskActiveText,
                                        textDecoration: task.completed ? "line-through" : "none"
                                      }}
                                    >
                                      {task.title}
                                    </span>
                                  )}
                                </div>

                                <div style={styles.taskActions}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (editingTaskId === task.id) {
                                        saveEditTask(cat.id, task.id)
                                      } else {
                                        startEditTask(task)
                                      }
                                    }}
                                    title={editingTaskId === task.id ? "Save task" : "Edit task"}
                                    className="action-btn"
                                    style={styles.taskActionBtn}
                                  >
                                    {editingTaskId === task.id ? (
                                      <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981" }}>✓</span>
                                    ) : (
                                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={task.completed ? "#64748b" : isDarkMode ? "#94a3b8" : "#6b7280"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                      </svg>
                                    )}
                                  </button>
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
                                  style={{
                                    ...styles.inlineInput,
                                    background: t.inputBg,
                                    border: `1px solid ${t.inputBorder}`,
                                    color: t.textColor
                                  }}
                                />
                                <button
                                  onClick={() => addTask(cat.id)}
                                  style={{
                                    ...styles.inlineAddBtn,
                                    background: t.actionBtnBg,
                                    color: t.actionBtnText
                                  }}
                                >
                                  Add
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  playSound("click")
                                  setActiveInputCategoryId(cat.id)
                                }}
                                className="subtask-btn"
                                style={{
                                  ...styles.addSubtaskTrigger,
                                  background: t.subtaskBtnBg,
                                  border: `1px dashed ${t.subtaskBtnBorder}`,
                                  color: isDarkMode ? "#a5b4fc" : "#6366f1"
                                }}
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
                  <div style={{ ...styles.emptyState, color: t.subTextColor }}>No lists yet. Create one below!</div>
                )}
              </div>

              <div style={styles.footer}>
                <input
                  value={newCategoryTitle}
                  onChange={(e) => setNewCategoryTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  placeholder="New task list name..."
                  style={{
                    ...styles.bottomInput,
                    background: t.inputBg,
                    border: `1px solid ${t.inputBorder}`,
                    color: t.textColor
                  }}
                />
                <button
                  onClick={addCategory}
                  className="hover-add-btn"
                  style={{
                    ...styles.bottomAddBtn,
                    background: t.actionBtnBg,
                    color: t.actionBtnText
                  }}
                  title="Add list"
                >
                  +
                </button>
              </div>
            </>
          )}

          {/* TAB 2: CLIPBOARD MANAGER */}
          {activeTab === "clipboard" && (
            <>
              {/* Quick Action Bar */}
              <div style={styles.clipboardActionsBar}>
                <button
                  onClick={pasteFromSystemClipboard}
                  className="subtask-btn"
                  style={{
                    ...styles.quickPasteBtn,
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    color: t.textColor
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                  <span>Grab system clipboard</span>
                </button>
              </div>

              {/* Snippets Feed */}
              <div
                ref={scrollRef}
                onScroll={checkScroll}
                className={`glass-scroll ${
                  canScrollUp && canScrollDown
                    ? "mask-scroll-both"
                    : canScrollDown
                    ? "mask-scroll-down"
                    : canScrollUp
                    ? "mask-scroll-up"
                    : ""
                }`}
                style={styles.scrollArea}
              >
                {sortedSnippets && sortedSnippets.length > 0 ? (
                  sortedSnippets.map((snippet) => {
                    const isCopied = copiedId === snippet.id
                    return (
                      <div
                        key={snippet.id}
                        onClick={() => copyToClipboard(snippet)}
                        className="hover-snippet"
                        style={{
                          ...styles.snippetCard,
                          background: t.cardBg,
                          border: `1px solid ${snippet.isPinned ? "rgba(99, 102, 241, 0.5)" : t.cardBorder}`,
                          boxShadow: t.cardShadow
                        }}
                      >
                        <div style={styles.snippetTopRow}>
                          <span style={styles.snippetTime}>{snippet.createdAt}</span>
                          <div style={styles.snippetActions}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                togglePinSnippet(snippet.id)
                              }}
                              title={snippet.isPinned ? "Unpin snippet" : "Pin snippet"}
                              className="action-btn"
                              style={{
                                ...styles.snippetActionBtn,
                                color: snippet.isPinned ? "#6366f1" : t.subTextColor
                              }}
                            >
                              📌
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                convertSnippetToTask(snippet.text)
                              }}
                              title="Turn into Task"
                              className="action-btn"
                              style={{ ...styles.snippetActionBtn, color: "#10b981" }}
                            >
                              +Task
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteSnippet(snippet.id)
                              }}
                              title="Delete snippet"
                              className="action-btn"
                              style={{ ...styles.snippetActionBtn, color: "#ef4444" }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Long text scrollable box */}
                        <div
                          className="custom-code-scroll"
                          style={{
                            ...styles.snippetText,
                            color: t.textColor
                          }}
                        >
                          {snippet.text}
                        </div>

                        {isCopied && (
                          <div style={styles.copiedFeedback}>
                            ✓ Copied to clipboard!
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div style={{ ...styles.emptyState, color: t.subTextColor }}>
                    No snippets saved. Tap "Grab system clipboard" or type below!
                  </div>
                )}
              </div>

              {/* Bottom Multi-line Textarea Input */}
              <div style={styles.footer}>
                <textarea
                  value={manualSnippetText}
                  onChange={(e) => setManualSnippetText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      addManualSnippet()
                    }
                  }}
                  rows={1}
                  placeholder="Paste or type snippet..."
                  style={{
                    ...styles.bottomTextarea,
                    background: t.inputBg,
                    border: `1px solid ${t.inputBorder}`,
                    color: t.textColor
                  }}
                />
                <button
                  onClick={addManualSnippet}
                  className="hover-add-btn"
                  style={{
                    ...styles.bottomAddBtn,
                    background: t.actionBtnBg,
                    color: t.actionBtnText
                  }}
                  title="Save snippet"
                >
                  +
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    overflow: "hidden"
  },
  glowCircleOne: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: "50%",
    filter: "blur(25px)",
    pointerEvents: "none",
    transition: "transform 0.15s ease-out, background 0.3s ease"
  },
  glowCircleTwo: {
    position: "absolute",
    bottom: -40,
    right: -40,
    width: 190,
    height: 190,
    borderRadius: "50%",
    filter: "blur(30px)",
    pointerEvents: "none",
    transition: "transform 0.15s ease-out, background 0.3s ease"
  },
  layout: {
    position: "relative",
    zIndex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "16px 16px 14px 16px"
  },
  header: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  tabSwitcher: {
    display: "flex",
    gap: 4,
    background: "rgba(255, 255, 255, 0.06)",
    padding: 3,
    borderRadius: 999,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  tabPill: {
    border: "none",
    padding: "5px 14px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  themeToggleBtn: {
    cursor: "pointer",
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(8px)"
  },
  subHeader: {
    flexShrink: 0,
    marginBottom: 10,
    paddingLeft: 4
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.6px",
    margin: 0
  },
  subHeading: {
    fontSize: 11,
    margin: "3px 0 0 0"
  },
  scrollArea: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingRight: 4,
    paddingTop: 4,
    paddingBottom: 14
  },
  glassCard: {
    flexShrink: 0,
    borderRadius: 22,
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    overflow: "hidden",
    cursor: "pointer"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    padding: "12px 14px"
  },
  glassBadge: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    flexShrink: 0
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  editInput: {
    flex: 1,
    padding: "4px 8px",
    borderRadius: 8,
    border: "1px solid #6366f1",
    fontSize: 13,
    fontWeight: 700,
    outline: "none",
    marginRight: 6
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 5
  },
  iconBtn: {
    cursor: "pointer",
    padding: "4px 5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%"
  },
  chevron: {
    fontSize: 9,
    transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
    marginLeft: 2
  },
  tasksContainer: {
    padding: "0 12px 12px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 7
  },
  taskRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    borderRadius: 999,
    cursor: "pointer"
  },
  taskLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
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
  editTaskInput: {
    flex: 1,
    padding: "3px 8px",
    borderRadius: 6,
    border: "1px solid #6366f1",
    fontSize: 12,
    outline: "none"
  },
  taskActions: {
    display: "flex",
    alignItems: "center",
    gap: 4
  },
  taskActionBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  deleteTaskBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: 12,
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1
  },
  addSubtaskTrigger: {
    borderRadius: 999,
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
    fontSize: 12,
    outline: "none"
  },
  inlineAddBtn: {
    padding: "7px 14px",
    borderRadius: 999,
    border: "none",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer"
  },
  clipboardActionsBar: {
    flexShrink: 0,
    marginBottom: 8
  },
  quickPasteBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 14,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    backdropFilter: "blur(10px)"
  },
  snippetCard: {
    position: "relative",
    flexShrink: 0,
    borderRadius: 18,
    padding: "10px 12px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)"
  },
  snippetTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  snippetTime: {
    fontSize: 10,
    color: "#818cf8",
    fontWeight: 600
  },
  snippetActions: {
    display: "flex",
    alignItems: "center",
    gap: 4
  },
  snippetActionBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    padding: "2px 4px",
    lineHeight: 1,
    borderRadius: 4
  },
  snippetText: {
    fontSize: 12,
    lineHeight: 1.45,
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
    maxHeight: "120px",
    overflowY: "auto",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    paddingRight: 2
  },
  copiedFeedback: {
    position: "absolute",
    bottom: 6,
    right: 10,
    fontSize: 10,
    fontWeight: 700,
    color: "#10b981",
    background: "rgba(0, 0, 0, 0.8)",
    padding: "2px 6px",
    borderRadius: 6
  },
  emptyState: {
    textAlign: "center",
    padding: "32px 0",
    fontSize: 12
  },
  footer: {
    flexShrink: 0,
    display: "flex",
    gap: 8,
    paddingTop: 8,
    alignItems: "center"
  },
  bottomInput: {
    flex: 1,
    padding: "10px 16px",
    borderRadius: 999,
    fontSize: 12,
    outline: "none",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)"
  },
  bottomTextarea: {
    flex: 1,
    padding: "9px 14px",
    borderRadius: 16,
    fontSize: 12,
    outline: "none",
    resize: "none",
    height: "38px",
    lineHeight: "1.4",
    fontFamily: "inherit",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)"
  },
  bottomAddBtn: {
    width: 42,
    height: 42,
    borderRadius: "50%",
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