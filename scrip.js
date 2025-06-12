const API_URL = "https://pw-api-0ues.onrender.com"

class TodoApp {
  constructor() {
    this.tasks = []
    this.currentFilter = "all"
    this.init()
  }

  init() {
    this.bindEvents()
    this.loadTasks()
  }

  bindEvents() {
    const taskForm = document.getElementById("taskForm")
    taskForm.addEventListener("submit", (e) => this.handleAddTask(e))

    const filterBtns = document.querySelectorAll(".filter-btn")
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFilter(e))
    })
  }

  handleFilter(e) {
    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"))
    e.target.classList.add("active")

    this.currentFilter = e.target.dataset.filter
    this.renderTasks()
  }

  async loadTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks`)
      if (!response.ok) throw new Error("Error al cargar tareas")

      this.tasks = await response.json()
      this.renderTasks()
      this.updateStats()
    } catch (error) {
      console.error("Error:", error)
      this.showToast("Error al cargar las tareas. Verifica la conexión con la API.", "error")
      this.renderEmptyState()
    }
  }

  async handleAddTask(e) {
    e.preventDefault()
    const taskInput = document.getElementById("taskInput")
    const title = taskInput.value.trim()

    if (!title) return

    const addBtn = document.querySelector(".add-btn")
    addBtn.style.transform = "scale(0.95)"
    setTimeout(() => (addBtn.style.transform = ""), 150)

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, done: false }),
      })

      if (!response.ok) throw new Error("Error al crear tarea")

      const newTask = await response.json()
      this.tasks.push(newTask)
      this.renderTasks()
      this.updateStats()
      taskInput.value = ""
      this.showToast("¡Tarea agregada correctamente!", "success")
    } catch (error) {
      console.error("Error:", error)
      this.showToast("Error al agregar la tarea", "error")
    }
  }

  async toggleTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (!task) return

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: task.title, done: !task.done }),
      })

      if (!response.ok) throw new Error("Error al actualizar tarea")

      const updatedTask = await response.json()
      const index = this.tasks.findIndex((t) => t.id === taskId)
      this.tasks[index] = updatedTask
      this.renderTasks()
      this.updateStats()
      this.showToast(updatedTask.done ? "¡Tarea completada!" : "Tarea marcada como pendiente", "success")
    } catch (error) {
      console.error("Error:", error)
      this.showToast("Error al actualizar la tarea", "error")
    }
  }

  async deleteTask(taskId) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta tarea?")) return

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar tarea")

      this.tasks = this.tasks.filter((t) => t.id !== taskId)
      this.renderTasks()
      this.updateStats()
      this.showToast("Tarea eliminada correctamente", "success")
    } catch (error) {
      console.error("Error:", error)
      this.showToast("Error al eliminar la tarea", "error")
    }
  }

  getFilteredTasks() {
    switch (this.currentFilter) {
      case "pending":
        return this.tasks.filter((task) => !task.done)
      case "completed":
        return this.tasks.filter((task) => task.done)
      default:
        return this.tasks
    }
  }

  renderTasks() {
    const tasksList = document.getElementById("tasksList")
    const filteredTasks = this.getFilteredTasks()

    if (filteredTasks.length === 0) {
      this.renderEmptyState()
      return
    }

    const tasksHTML = filteredTasks
      .map(
        (task) => `
            <div class="task-item ${task.done ? "completed" : ""}">
                <div class="task-content">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.done ? "checked" : ""}
                        onchange="app.toggleTask(${task.id})"
                    >
                    <span class="task-title">${task.title}</span>
                    <div class="task-actions">
                        <button 
                            class="delete-btn"
                            onclick="app.deleteTask(${task.id})"
                        >
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")

    tasksList.innerHTML = tasksHTML
  }

  renderEmptyState() {
    const tasksList = document.getElementById("tasksList")
    let message = "No hay tareas"
    let submessage = "Agrega tu primera tarea para comenzar"

    if (this.currentFilter === "pending") {
      message = "¡Genial! No tienes tareas pendientes"
      submessage = "Todas tus tareas están completadas"
    } else if (this.currentFilter === "completed") {
      message = "Aún no has completado ninguna tarea"
      submessage = "¡Marca algunas tareas como completadas!"
    }

    tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h5>${message}</h5>
                <p>${submessage}</p>
            </div>
        `
  }

  updateStats() {
    const total = this.tasks.length
    const completed = this.tasks.filter((task) => task.done).length
    const pending = total - completed

    document.getElementById("totalTasks").textContent = total
    document.getElementById("pendingTasks").textContent = pending
    document.getElementById("completedTasks").textContent = completed
  }

  showToast(message, type = "success") {
    const toast = document.getElementById("toast")
    const toastMessage = document.getElementById("toastMessage")
    const toastIcon = document.getElementById("toastIcon")

    if (type === "success") {
      toastIcon.className = "fas fa-check"
      toast.querySelector(".toast-icon").className = "toast-icon success"
    } else {
      toastIcon.className = "fas fa-exclamation-triangle"
      toast.querySelector(".toast-icon").className = "toast-icon error"
    }

    toastMessage.textContent = message
    toast.classList.add("show")

    setTimeout(() => {
      this.hideToast()
    }, 3000)
  }

  hideToast() {
    const toast = document.getElementById("toast")
    toast.classList.remove("show")
  }
}

function hideToast() {
  app.hideToast()
}

const app = new TodoApp()
