const API_URL = "https://pw-api-0ues.onrender.com"

class TaskDashboard {
  constructor() {
    this.tasks = []
    this.currentFilter = "all"
    this.init()
  }

  init() {
    this.bindEvents()
    this.loadTasks()
    this.updateLastRefresh()
  }

  bindEvents() {
    // Filtros
    const filterBtns = document.querySelectorAll(".filter-btn")
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFilter(e))
    })

    // Auto-refresh cada 30 segundos
    setInterval(() => this.loadTasks(), 30000)
  }

  handleFilter(e) {
    // Actualizar botones activos
    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"))
    e.currentTarget.classList.add("active")

    this.currentFilter = e.currentTarget.dataset.filter
    this.renderTasks()
  }

  async loadTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks`)
      if (!response.ok) throw new Error("Error al cargar tareas")

      this.tasks = await response.json()
      this.renderTasks()
      this.updateStats()
      this.updateLastRefresh()
    } catch (error) {
      console.error("Error:", error)
      this.renderError("Error al cargar las tareas. Verifica la conexión con la API.")
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
                    <div class="task-status ${task.done ? "done" : "pending"}"></div>
                    <span class="task-title">${task.title}</span>
                </div>
                <div class="task-meta">
                    <span class="badge ${task.done ? "bg-success" : "bg-warning"}">
                        ${task.done ? "Completada" : "Pendiente"}
                    </span>
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
    let submessage = "No hay tareas registradas en el sistema"

    if (this.currentFilter === "pending") {
      message = "¡Genial! No hay tareas pendientes"
      submessage = "Todas las tareas están completadas"
    } else if (this.currentFilter === "completed") {
      message = "Aún no hay tareas completadas"
      submessage = "No se ha marcado ninguna tarea como completada"
    }

    tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h5>${message}</h5>
                <p>${submessage}</p>
            </div>
        `
  }

  renderError(message) {
    const tasksList = document.getElementById("tasksList")
    tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h5>Error de conexión</h5>
                <p>${message}</p>
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

  updateLastRefresh() {
    const now = new Date()
    const formattedDate = now.toLocaleString()
    document.getElementById("lastUpdate").textContent = formattedDate
  }
}

// Inicializar el dashboard
const dashboard = new TaskDashboard()
