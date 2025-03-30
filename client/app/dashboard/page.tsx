"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Activity, Database, Layers, LogOut, Plus, Settings, User, Webhook } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConnectDatabaseForm } from "@/components/connect-database-form"
import { DataSelectionForm } from "@/components/data-selection-form"
import { WebhooksList } from "@/components/webhooks-list"
import { WebhookCreator } from "@/components/webhook-creator"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { doc, getDoc, collection, getDocs, onSnapshot, query, where, deleteDoc } from "firebase/firestore"
import { getUserWebhooks, getUserDatabases } from "@/lib/firestore"
import { db } from "@/lib/firebase";


export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [databases, setDatabases] = useState<any[]>([])
  const [dataPoints, setDataPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showWebhookCreator, setShowWebhookCreator] = useState(false)


  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Get user data
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          setUserData(userDoc.data())
        }

        // Get webhooks
        const webhooksData = await getUserWebhooks(user.uid)
        setWebhooks(webhooksData)

        // Get databases
        const databasesData = await getUserDatabases(user.uid)
        setDatabases(databasesData)

        // Calculate total data points
        let totalDataPoints = 0
        webhooksData.forEach((webhook: any) => {
          totalDataPoints += webhook.dataPoints || 0
        })
        setDataPoints(totalDataPoints)

      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "databases"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (snapshot: any) => {
        const dbs = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        }));
        setDatabases(dbs);
      });
      return unsubscribe;
    }
  }, [user]);
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }


  const handleWebhookStatusChange = (id: string, status: string) => {
    setWebhooks(prevWebhooks =>
      prevWebhooks.map(webhook =>
        webhook.id === id ? { ...webhook, status } : webhook
      )
    )
  }


  const handleWebhookDelete = (id: string) => {
    setWebhooks(prevWebhooks => prevWebhooks.filter(webhook => webhook.id !== id))
  }

  const handleDatabaseDelete = async (id: string) => {
    try {
      // Remove from Firestore
      const databaseRef = doc(db, "databases", id);
      await deleteDoc(databaseRef);

      // Update local state
      setDatabases(prevDatabases => prevDatabases.filter(database => database.id !== id));
    } catch (error) {
      console.error("Error deleting database:", error);
    }
  }


  const getUserInitials = () => {
    if (!user || !user.displayName) return 'U'
    return user.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="container mx-auto max-w-screen-2xl flex items-center justify-between">
            <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
              <Layers className="h-6 w-6 text-primary" />
              <span>SolanaIndex</span>
            </Link>
            <nav className="hidden flex-1 md:flex ml-10">
              <Button
                onClick={() => setActiveTab("overview")}
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="mr-2"
              >
                Overview
              </Button>
              <Button
                onClick={() => setActiveTab("webhooks")}
                variant={activeTab === "webhooks" ? "default" : "ghost"}
                className="mr-2"
              >
                Webhooks
              </Button>
              <Button
                onClick={() => setActiveTab("databases")}
                variant={activeTab === "databases" ? "default" : "ghost"}
                className="mr-2"
              >
                Databases
              </Button>
              <Button onClick={() => setActiveTab("settings")} variant={activeTab === "settings" ? "default" : "ghost"}>
                Settings
              </Button>
            </nav>
            <div className="flex items-center justify-end gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8">
          <div className="container mx-auto max-w-screen-xl">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                  <TabsTrigger value="databases">Databases</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                {/* <WebhookCreator buttonText="New Webhook" /> */}
              </div>

              <TabsContent value="overview" className="space-y-6">
                {/* User welcome card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Welcome, {user?.displayName?.split(' ')[0] || 'User'}</CardTitle>
                    <CardDescription>
                      Here's an overview of your Solana blockchain indexing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-10 flex items-center">
                        <div className="h-5 w-5 rounded-full border-2 border-t-green-400 border-r-transparent border-b-transparent border-l-transparent animate-spin mr-2"></div>
                        <p>Loading your data...</p>
                      </div>
                    ) : webhooks.length === 0 && databases.length === 0 ? (
                      <div>
                        <p className="mb-4">Get started by connecting your database and setting up your first webhook.</p>
                        <div className="flex gap-2">
                          <Button onClick={() => setActiveTab("databases")} className="bg-green-600 hover:bg-green-700">
                            <Database className="mr-2 h-4 w-4" />
                            Connect Database
                          </Button>
                          <Button onClick={() => setActiveTab("webhooks")} variant="outline" className="border-green-600 text-green-500">
                            <Webhook className="mr-2 h-4 w-4" />
                            Create Webhook
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p>Your Solana blockchain indexing is {webhooks.length > 0 ? 'active' : 'awaiting configuration'}. Use the dashboard to manage your resources.</p>
                    )}
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Webhooks</CardTitle>
                      <Webhook className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="h-8 w-8 rounded-full border-2 border-t-green-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold">{webhooks.length}</div>
                          {webhooks.length === 0 && <p className="text-xs text-muted-foreground">No webhooks configured</p>}
                        </>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Data Points Indexed</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="h-8 w-8 rounded-full border-2 border-t-green-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold">{dataPoints.toLocaleString()}</div>
                          {dataPoints === 0 && <p className="text-xs text-muted-foreground">No data points indexed yet</p>}
                        </>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Connected Databases</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="h-8 w-8 rounded-full border-2 border-t-green-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold">{databases.length}</div>
                          {databases.length === 0 && <p className="text-xs text-muted-foreground">No databases connected</p>}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Your webhook activity over the last 24 hours</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {isLoading ? (
                        <div className="h-[200px] w-full flex items-center justify-center">
                          <div className="h-8 w-8 rounded-full border-2 border-t-green-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                        </div>
                      ) : webhooks.length === 0 ? (
                        <div className="h-[200px] w-full bg-muted/50 rounded-md flex flex-col items-center justify-center gap-2">
                          <Activity className="h-8 w-8 text-muted-foreground/50" />
                          <p className="text-muted-foreground/70">No webhook activity to display</p>
                          <Button variant="outline" size="sm" onClick={() => setActiveTab("webhooks")} className="mt-2">
                            Create your first webhook
                          </Button>
                        </div>
                      ) : (
                        <div className="h-[200px] w-full bg-muted/50 rounded-md flex flex-col items-center justify-center gap-2">
                          <Activity className="h-8 w-8 text-muted-foreground/50" />
                          <p className="text-muted-foreground/70">Activity data will appear here</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common tasks and operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => {
                            setActiveTab("webhooks")
                            setShowWebhookCreator(true)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Webhook
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => setActiveTab("databases")}
                        >
                          <Database className="mr-2 h-4 w-4" />
                          Connect Database
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => setActiveTab("settings")}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Configure Settings
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          disabled={true}
                        >
                          <Activity className="mr-2 h-4 w-4" />
                          View Logs (coming soon)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="webhooks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Your Webhooks</CardTitle>
                      <CardDescription>
                        {webhooks.length >= 0
                          ? "Create your first webhook to start indexing Solana data"
                          : "Manage your Solana data webhooks"}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="h-8 w-8 rounded-full border-2 border-t-green-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                      </div>
                    ) : (
                      <WebhooksList
                        webhooks={webhooks}
                        onWebhookStatusChange={handleWebhookStatusChange}
                        onWebhookDelete={handleWebhookDelete}
                      />
                    )}
                  </CardContent>
                </Card>

                {webhooks.length >= 0 && !isLoading && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create Your First Webhook</CardTitle>
                      <CardDescription>Start indexing Solana blockchain data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WebhookCreator inline={true} />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>


              <TabsContent value="databases" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Connected Databases</CardTitle>
                      <CardDescription>Manage your Postgres database connections</CardDescription>
                    </div>
                    <div className="mt-4">
                      <Button onClick={() => document.getElementById('add-database-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Connect New Database
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="h-8 w-8 rounded-full border-2 border-t-green-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {databases.map((database) => (
                          <div key={database.id} className="rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-primary" />
                                <div>
                                  <h3 className="font-medium">{database.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {database.connectionString ||
                                      (database.host ? `postgres://${database.username}:****@${database.host}:${database.port || '5432'}/${database.dbName}` : 'Connection details hidden')}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDatabaseDelete(database.id)}
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card id="add-database-section">
                  <CardHeader>
                    <CardTitle>Add New Database</CardTitle>
                    <CardDescription>Connect a new Postgres database to store Solana data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConnectDatabaseForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                {/* User profile card */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>Your account information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="h-8 w-8 rounded-full border-2 border-t-green-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                          <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                            <p className="text-md">{user?.displayName || 'User'}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                            <p className="text-md">{user?.email}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
                            <p className="text-md">{userData?.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </CardFooter>
                </Card>

                {/* <Card>
                  <CardHeader>
                    <CardTitle>Data Selection</CardTitle>
                    <CardDescription>Choose what Solana data you want to index</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataSelectionForm />
                  </CardContent>
                  <CardFooter>
                    <Button>Save Settings</Button>
                  </CardFooter>
                </Card> */}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
