"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Filter, Search } from "lucide-react"
import { TaskFilter, type TaskFilters } from "@/components/task-filter"
import { addNotification } from "@/lib/notifications"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  name: string
  email: string
  role: string
  studentId?: string
}

interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  assignedTo: string
  createdBy: string
  createdAt: string
  projectId?: string | null
  hasProblem?: boolean
  problemDescription?: string
}

interface Project {
  id: string
  title: string
  description: string
  students: string[]
  category: string
  startDate: string
  endDate: string
  status: "pending" | "in-progress" | "completed"
  progress: number
}

export default function StudentTasksPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [studentProjects, setStudentProjects] = useState<Project[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [showFullFilter, setShowFullFilter] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({
    status: [],
    assigneeId: "",
    startDate: null,
    endDate: null,
    searchTerm: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (!userStr) {
      router.push("/signin")
      return

      
    }

    const user = JSON.parse(userStr)
    if (user.role !== "student") {
      router.push("/dashboard")
      return
    }

    setCurrentUser(user)

    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]")

    setUsers(storedUsers)
    setTasks(storedTasks)
    setProjects(storedProjects)
  }, [router])

  useEffect(() => {
    if (!currentUser) return

    let studentTasks = tasks.filter((task) => task.assignedTo === currentUser.id)

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      studentTasks = studentTasks.filter(
        (task) => task.title.toLowerCase().includes(term) || task.description.toLowerCase().includes(term),
      )
    }

    if (statusFilter !== "all") {
      studentTasks = studentTasks.filter((task) => task.status === statusFilter)
    }

    setFilteredTasks(studentTasks)
  }, [tasks, searchTerm, statusFilter, currentUser])

  useEffect(() => {
    if (!currentUser || !showFullFilter) return

    const studentTasks = tasks.filter((task) => task.assignedTo === currentUser.id)

    let result = [...studentTasks]

    if (taskFilters.status.length > 0) {
      result = result.filter((task) => taskFilters.status.includes(task.status))
    }

    if (taskFilters.startDate) {
      result = result.filter((task) => new Date(task.createdAt) >= taskFilters.startDate!)
    }
    if (taskFilters.endDate) {
      const endDate = new Date(taskFilters.endDate)
      endDate.setDate(endDate.getDate() + 1)
      result = result.filter((task) => new Date(task.createdAt) <= endDate)
    }

    if (taskFilters.searchTerm) {
      const searchLower = taskFilters.searchTerm.toLowerCase()
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) || task.description.toLowerCase().includes(searchLower),
      )
    }

    result.sort((a, b) => {
      let valueA, valueB

      if (taskFilters.sortBy === "createdAt") {
        valueA = new Date(a.createdAt).getTime()
        valueB = new Date(b.createdAt).getTime()
      } else if (taskFilters.sortBy === "title") {
        valueA = a.title.toLowerCase()
        valueB = b.title.toLowerCase()
      } else if (taskFilters.sortBy === "status") {
        valueA = a.status
        valueB = b.status
      } else {
        valueA = a[taskFilters.sortBy as keyof Task]
        valueB = b[taskFilters.sortBy as keyof Task]
      }

      if (taskFilters.sortOrder === "asc") {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
      }
    })

    setFilteredTasks(result)
  }, [tasks, taskFilters, currentUser, showFullFilter])

  const handleUpdateTaskStatus = (taskId: string, status: "pending" | "in-progress" | "completed") => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !currentUser) return

    if (task.status !== status) {
      addNotification(
        task.createdBy,
        "task",
        `Task "${task.title}" status has been updated to ${status} by ${currentUser.name}`,
        taskId,
      )
    }

    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    setTasks(updatedTasks)
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
  }

  const getAdminName = (id: string) => {
    const admin = users.find((user) => user.id === id)
    return admin ? admin.name : "Unknown Admin"
  }

 const getStatusBadge = (task: Task) => {
    const nextStatusMap = {
      pending: "in-progress",
      "in-progress": "completed",
      completed: "pending",
    }

    const nextStatus = nextStatusMap[task.status as keyof typeof nextStatusMap]

    const badgeColors = {
      pending: "bg-yellow-900/20 text-yellow-400 border-yellow-500",
      "in-progress": "bg-blue-900/20 text-blue-400 border-blue-500",
      completed: "bg-green-900/20 text-green-400 border-green-500",
    }

    return (
      <Badge
        onClick={() => handleUpdateTaskStatus(task.id, nextStatus as Task["status"])}
        variant="outline"
        className={`${badgeColors[task.status]} cursor-pointer hover:opacity-80 transition`}
        title={`Click to change status to \"${nextStatus}\"`}
      >
        {task.status.replace("-", " ")}
        
      </Badge>
    )
  }
  const handleUpdateProjectStatus = (projectId: string, status: Project["status"]) => {
  const updatedProjects = projects.map((project) =>
    project.id === projectId ? { ...project, status } : project
  )
  setProjects(updatedProjects)
  localStorage.setItem("projects", JSON.stringify(updatedProjects))
}

const getProjectStatusBadge = (project: Project) => {
  const nextStatusMap = {
    pending: "in-progress",
    "in-progress": "completed",
    completed: "pending",
  }

  const nextStatus = nextStatusMap[project.status as keyof typeof nextStatusMap]

  const badgeColors = {
    pending: "bg-yellow-900/20 text-yellow-400 border-yellow-500",
    "in-progress": "bg-blue-900/20 text-blue-400 border-blue-500",
    completed: "bg-green-900/20 text-green-400 border-green-500",
  }

  return (
    <Badge
      onClick={() => handleUpdateProjectStatus(project.id, nextStatus as Project["status"])}
      variant="outline"
      className={`${badgeColors[project.status]} cursor-pointer hover:opacity-80 transition`}
      title={`Click to change status to "${nextStatus}"`}
    >
      {project.status.replace("-", " ")}
    </Badge>
  )
}


  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <DashboardLayout title="Student Dashboard" userRole="student">
 {studentProjects.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-8 mb-4">My Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentProjects.map((project) => (
              <Card key={project.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-2">{project.description}</p>
                  <div>{getProjectStatusBadge(project)}</div>
                  <p className="text-xs text-gray-500 mt-2">Due: {formatDate(project.endDate)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">My Assigned Tasks</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 border-yellow-500">
              Pending: {tasks.filter((task) => task.assignedTo === currentUser?.id && task.status === "pending").length}
            </Badge>
            <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-500">
              In Progress:{" "}
              {tasks.filter((task) => task.assignedTo === currentUser?.id && task.status === "in-progress").length}
            </Badge>
            <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-500">
              Completed:{" "}
              {tasks.filter((task) => task.assignedTo === currentUser?.id && task.status === "completed").length}
            </Badge>
          </div>
        </div>

        <div className="block lg:hidden space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border-gray-600 pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFullFilter(!showFullFilter)}
              className="bg-gray-700 border-gray-600"
            >
              <Filter size={18} />
            </Button>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={`${showFullFilter ? "block" : "hidden lg:block"}`}>
          <TaskFilter
            users={users}
            onFilterChange={setTaskFilters}
            userRole="student"
            currentUserId={currentUser?.id || ""}
          />
        </div>

        {filteredTasks.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <p className="text-center text-gray-400">You don't have any tasks matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    {getStatusBadge(task)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-300">{task.description}</p>
                    {task.hasProblem && (
                      <div className="bg-red-900/20 border border-red-700 rounded-md p-2 text-sm">
                        <p className="font-semibold text-red-400">Problem:</p>
                        <p className="text-gray-300">{task.problemDescription}</p>
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      <p>Created: {formatDate(task.createdAt)}</p>
                      <p>Created by: {getAdminName(task.createdBy)}</p>
                      {task.projectId && (
                        <p>Project: {projects.find((p) => p.id === task.projectId)?.title || "Unknown Project"}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant={task.status === "in-progress" ? "default" : "outline"}
                        size="sm"
                        className={task.status === "in-progress" ? "bg-blue-600" : ""}
                        onClick={() => handleUpdateTaskStatus(task.id, "in-progress")}
                      >
                        Start Working
                      </Button>
                      <Button
                        variant={task.status === "completed" ? "default" : "outline"}
                        size="sm"
                        className={task.status === "completed" ? "bg-green-600" : ""}
                        onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>

              </Card>
            ))}


          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
