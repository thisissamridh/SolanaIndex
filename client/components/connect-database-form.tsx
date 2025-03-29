
"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock, Database } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { addDatabase } from "@/lib/firestore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

export function ConnectDatabaseForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [connectionType, setConnectionType] = useState("direct")
  const [useSSL, setUseSSL] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth()


  const [formData, setFormData] = useState({
    name: "",
    host: "",
    port: "5432",
    database: "",
    schema: "public",
    username: "",
    password: "",
    connectionString: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  // A helper to mask the password in the connection string
  // const maskConnectionString = (connectionString: string) => {
  //   if (!connectionString) return ""
  //   return connectionString.replace(/:(.*?)@/, ":****@")
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to add a database")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Build the connection string based on connection type.
      const connectionString =
        connectionType === "direct"
          ? `postgres://${formData.username}:${formData.password}@${formData.host}:${formData.port}/${formData.database}`
          : formData.connectionString

      // Build the database data object (with masked password for display/storage)
      const databaseData =
        connectionType === "direct"
          ? {
            name: formData.name,
            host: formData.host,
            port: formData.port,
            dbName: formData.database,
            schema: formData.schema,
            username: formData.username,
            password: "********", // Mask the password
            ssl: useSSL,
            // connectionString: maskConnectionString(connectionString)
            connectionString: (connectionString)
          }
          : {
            name: formData.name,
            connectionString: (connectionString),
            // connectionString: maskConnectionString(connectionString),
            ssl: useSSL
          }

      // Step 1: Test the connection via your backend API
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
      const testResponse = await fetch(`${backendUrl}/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass the raw connection string for testing and a dummy table name
        body: JSON.stringify({
          connectionString,
          tableName: "test_table"
        })
      })

      if (!testResponse.ok) {
        const errorData = await testResponse.json()
        throw new Error(errorData.error || "Database connection test failed")
      }

      // If the test passes, add the database to Firestore.
      await addDatabase(user.uid, databaseData)

      setIsSuccess(true)

      // Reset the form
      setFormData({
        name: "",
        host: "",
        port: "5432",
        database: "",
        schema: "public",
        username: "",
        password: "",
        connectionString: ""
      })
    } catch (err: any) {
      console.error("Error adding database:", err)
      setError(err.message || "Failed to connect database. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Database Name</Label>
          <Input
            id="name"
            placeholder="My Solana Database"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <RadioGroup
          value={connectionType}
          onValueChange={setConnectionType}
          className="grid grid-cols-2 gap-4"
        >
          <label
            htmlFor="direct"
            className={`flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 cursor-pointer ${connectionType === "direct" ? "border-primary" : "border-muted"
              } hover:bg-accent hover:text-accent-foreground`}
          >
            <RadioGroupItem value="direct" id="direct" className="sr-only" />
            <Database className="mb-3 h-6 w-6" />
            <span className="text-center">Direct Connection</span>
          </label>

          <label
            htmlFor="connectionString"
            className={`flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 cursor-pointer ${connectionType === "connectionString" ? "border-primary" : "border-muted"
              } hover:bg-accent hover:text-accent-foreground`}
          >
            <RadioGroupItem
              value="connectionString"
              id="connectionString"
              className="sr-only"
            />
            <Lock className="mb-3 h-6 w-6" />
            <span className="text-center">Connection String</span>
          </label>
        </RadioGroup>

        {connectionType === "direct" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  placeholder="db.example.com"
                  value={formData.host}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  placeholder="5432"
                  value={formData.port}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="database">Database</Label>
                <Input
                  id="database"
                  placeholder="solana_data"
                  value={formData.database}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schema">Schema (Optional)</Label>
                <Input
                  id="schema"
                  placeholder="public"
                  value={formData.schema}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="postgres_user"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="connectionString">Connection String</Label>
            <div className="relative">
              <Input
                id="connectionString"
                type={showPassword ? "text" : "password"}
                placeholder="postgres://username:password@host:port/database"
                value={formData.connectionString}
                onChange={handleInputChange}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch id="ssl" checked={useSSL} onCheckedChange={setUseSSL} />
          <Label htmlFor="ssl">Use SSL Connection</Label>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          "Connect Database"
        )}
      </Button>

      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-500">
              Database Connected Successfully
            </DialogTitle>
            <DialogDescription>
              Your database has been successfully connected. You can now create
              webhooks to start indexing Solana data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsSuccess(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
