"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  endpoint: string
  status: "pending" | "success" | "error"
  message?: string
}

export default function ConnectionTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "MongoDB", endpoint: "mongodb://localhost:27017/business-management", status: "pending" },
    { name: "AI Engine", endpoint: "http://localhost:11434/api/tags", status: "pending" },
    { name: "Business API", endpoint: "/api/analytics", status: "pending" }
  ])
  const [running, setRunning] = useState(false)

  async function runTests() {
    setRunning(true)
    
    // Reset all tests to pending
    setTests(prev => prev.map(test => ({ ...test, status: "pending" as const, message: undefined })))
    
    // Run each test sequentially
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      try {
        const response = await fetch(`/api/test-connection?endpoint=${encodeURIComponent(test.endpoint)}`)
        const data = await response.json()
        
        if (data.success) {
          setTests(prev => {
            const updated = [...prev]
            updated[i] = {
              ...updated[i],
              status: "success",
              message: data.message || "Connection successful"
            }
            return updated
          })
        } else {
          setTests(prev => {
            const updated = [...prev]
            updated[i] = {
              ...updated[i],
              status: "error",
              message: data.error || "Unknown error"
            }
            return updated
          })
        }
      } catch (error) {
        setTests(prev => {
          const updated = [...prev]
          updated[i] = {
            ...updated[i],
            status: "error", 
            message: error instanceof Error ? error.message : "Connection failed"
          }
          return updated
        })
      }
    }
    
    setRunning(false)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">システム接続テスト</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>ビジネスシステム接続テスト</span>
            <Button 
              onClick={runTests} 
              disabled={running}
              className="flex items-center gap-2"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : "Run Tests"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium text-lg">{test.name}</h3>
                  <p className="text-sm text-gray-500">{test.endpoint}</p>
                  {test.message && (
                    <p className={`text-sm mt-1 ${
                      test.status === "error" ? "text-red-500" : "text-green-500"
                    }`}>{test.message}</p>
                  )}
                </div>
                <Badge 
                  variant={
                    test.status === "success" ? "outline" : 
                    test.status === "error" ? "destructive" : "secondary"
                  }
                  className="flex items-center gap-1"
                >
                  {test.status === "success" ? (
                    <><CheckCircle className="h-3 w-3" /> Connected</>
                  ) : test.status === "error" ? (
                    <><XCircle className="h-3 w-3" /> Failed</>
                  ) : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
