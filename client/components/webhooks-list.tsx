"use client"

import { useState } from "react"
import { Activity, Database, Edit, MoreHorizontal, Trash, RefreshCw } from "lucide-react"
import { updateWebhook, deleteWebhook } from "@/lib/firestore"
import { useAuth } from "@/contexts/AuthContext"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface WebhooksListProps {
  webhooks?: any[]
  onWebhookStatusChange?: (id: string, status: string) => void
  onWebhookDelete?: (id: string) => void
}

export function WebhooksList({
  webhooks = [],
  onWebhookStatusChange,
  onWebhookDelete
}: WebhooksListProps) {
  const [localWebhooks, setLocalWebhooks] = useState(webhooks)
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()

  // // Default empty state if no webhooks are passed
  // if (webhooks.length === 0 && localWebhooks.length === 0) {
  //   return (
  //     <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
  //       <h3 className="font-medium">No webhooks configured</h3>
  //       <p className="text-sm text-muted-foreground mt-1">Create your first webhook to start indexing Solana data</p>
  //       <Button className="mt-4">
  //         <RefreshCw className="mr-2 h-4 w-4" />
  //         Create Webhook
  //       </Button>
  //     </div>
  //   )
  // }

  const toggleWebhookStatus = async (id: string, currentStatus: string) => {
    if (!user) return

    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'


      await updateWebhook(id, { status: newStatus })


      setLocalWebhooks(prev =>
        prev.map(webhook =>
          webhook.id === id ? { ...webhook, status: newStatus } : webhook
        )
      )


      if (onWebhookStatusChange) {
        onWebhookStatusChange(id, newStatus)
      }
    } catch (error) {
      console.error('Error updating webhook status:', error)
    }
  }

  const handleDeleteWebhook = async () => {
    if (!webhookToDelete || !user) return

    setIsDeleting(true)
    try {

      await deleteWebhook(webhookToDelete)


      setLocalWebhooks(prev => prev.filter(webhook => webhook.id !== webhookToDelete))


      if (onWebhookDelete) {
        onWebhookDelete(webhookToDelete)
      }
    } catch (error) {
      console.error('Error deleting webhook:', error)
    } finally {
      setIsDeleting(false)
      setWebhookToDelete(null)
    }
  }


  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Never'

    // Handle Firestore timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString()
    }

    // Handle JavaScript Date
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString()
    }

    // Handle timestamp number
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleString()
    }

    return 'Invalid date'
  }

  return (
    <div className="space-y-4">
      {(webhooks.length > 0 ? webhooks : localWebhooks).map((webhook) => (
        <div key={webhook.id} className="flex flex-col space-y-2 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{webhook.name}</h3>
              <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
                {webhook.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={webhook.status === "active"}
                onCheckedChange={() => toggleWebhookStatus(webhook.id, webhook.status)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Activity className="mr-2 h-4 w-4" />
                    View Logs
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setWebhookToDelete(webhook.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span>{webhook.databaseName || "Connected Database"}</span>
            </div>
            <div>Data Table: {webhook.dataTable}</div>
            <div>Last Update: {formatDate(webhook.lastTriggered)}</div>
            <div>Data Points: {webhook.dataPoints?.toLocaleString() || "0"}</div>
          </div>
          {webhook.description && (
            <div className="text-sm text-muted-foreground border-t pt-2 mt-2">
              {webhook.description}
            </div>
          )}
        </div>
      ))}

      <AlertDialog open={!!webhookToDelete} onOpenChange={(open) => !open && setWebhookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this webhook and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWebhook}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? "Deleting..." : "Delete Webhook"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}