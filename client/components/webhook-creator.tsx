"use client"

import { useState, useEffect } from "react"
import { Webhook, Plus } from "lucide-react"
import { CreateWebhookForm } from "./create-webhook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface WebhookCreatorProps {
  buttonText?: string
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined
  inline?: boolean
}

export function WebhookCreator({
  buttonText = "Create Webhook",
  buttonVariant = "default",
  inline = false
}: WebhookCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)


  if (inline) {
    return <CreateWebhookForm />
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>
          <Plus className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Webhook</DialogTitle>
          <DialogDescription>
            Configure a new webhook to start indexing Solana blockchain data
          </DialogDescription>
        </DialogHeader>
        <CreateWebhookForm onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}