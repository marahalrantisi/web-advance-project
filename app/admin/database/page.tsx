"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Database } from "lucide-react"
import { Clock } from "@/components/clock"
import { toast } from "sonner"

export default function DatabaseAdmin() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [dbInfo, setDbInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (!userStr) {
      router.push("/signin")
      return
    }

    const user = JSON.parse(userStr)
    if (user.role !== "admin") {
      router.push("/student-dashboard")
      return
    }

    setCurrentUser(user)
    fetchDatabaseInfo()
  }, [router])

  const fetchDatabaseInfo = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/database/info')
      const data = await response.json()
      setDbInfo(data)
    } catch (error) {
      console.error('Error fetching database info:', error)
      toast.error('Failed to fetch database information')
    }
  }

  const handleSeedDatabase = async () => {
    if (!confirm('Are you sure you want to seed the database? This will clear existing data.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:4000/api/database/seed', {
        method: 'POST'
      })
      const data = await response.json()
      toast.success(data.message)
      fetchDatabaseInfo()
    } catch (error) {
      console.error('Error seeding database:', error)
      toast.error('Failed to seed database')
    } finally {
      setLoading(false)
    }
  }

  const handleClearDatabase = async () => {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:4000/api/database/clear', {
        method: 'DELETE'
      })
      const data = await response.json()
      toast.success(data.message)
      fetchDatabaseInfo()
    } catch (error) {
      console.error('Error clearing database:', error)
      toast.error('Failed to clear database')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/signin")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Database Administration</h1>
          <div className="flex items-center gap-4">
            <Clock />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
            </CardHeader>
            <CardContent>
              {dbInfo ? (
                <div className="space-y-4">
                  <p>Type: <span className="font-bold">{dbInfo.type}</span></p>
                  <p>Collections: <span className="font-bold">{dbInfo.collections}</span></p>
                  <p>Documents: <span className="font-bold">{dbInfo.documents}</span></p>
                  <p>Data Size: <span className="font-bold">{(dbInfo.dataSize / 1024 / 1024).toFixed(2)} MB</span></p>
                  <p>Storage Size: <span className="font-bold">{(dbInfo.storageSize / 1024 / 1024).toFixed(2)} MB</span></p>
                  <p>Indexes: <span className="font-bold">{dbInfo.indexes}</span></p>
                  <p>Index Size: <span className="font-bold">{(dbInfo.indexSize / 1024 / 1024).toFixed(2)} MB</span></p>
                </div>
              ) : (
                <p>Loading database information...</p>
              )}

              <div className="mt-6 space-y-4">
                <Button 
                  onClick={handleSeedDatabase} 
                  disabled={loading}
                  className="w-full"
                >
                  Seed Database
                </Button>
                <Button 
                  onClick={handleClearDatabase} 
                  variant="destructive"
                  disabled={loading}
                  className="w-full"
                >
                  Clear Database
                </Button>
                <Button 
                  onClick={() => router.push("/dashboard")} 
                  variant="outline"
                  className="w-full"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
