"use client"

import { useState } from "react"
import { Archive, MessageSquarePlus, MoreHorizontal, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  usePatchConversation,
} from "@/hooks/api/use-ai"
import { useToastStore } from "@/components/shared/toast"
import { getApiErrorMessage } from "@/lib/api/error"
import { cn } from "@/lib/utils"
import type { AiConversationSummary } from "@/services/ai.service"

interface ConversationSidebarProps {
  activeId: string | null
  onSelect: (id: string) => void
  onCreated: (id: string) => void
}

function formatRelative(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function ConversationSidebar({ activeId, onSelect, onCreated }: ConversationSidebarProps) {
  const [includeArchived, setIncludeArchived] = useState(false)
  const showToast = useToastStore((s) => s.show)
  const { data, isLoading } = useConversations({ includeArchived })
  const createMutation = useCreateConversation()

  const handleCreate = async () => {
    try {
      const created = await createMutation.mutateAsync()
      onCreated(created.id)
    } catch (error) {
      showToast(getApiErrorMessage(error))
    }
  }

  const conversations = data?.data ?? []

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-muted/30">
      <div className="border-b border-border p-3">
        <Button
          type="button"
          onClick={handleCreate}
          disabled={createMutation.isPending}
          className="w-full"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Show archived</span>
          <Switch checked={includeArchived} onCheckedChange={setIncludeArchived} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-1">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <MessageSquarePlus className="h-6 w-6 opacity-50" />
            <p>No chats yet</p>
            <p className="text-xs">Start one with the button above.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((convo) => (
              <ConversationRow
                key={convo.id}
                conversation={convo}
                isActive={convo.id === activeId}
                onSelect={() => onSelect(convo.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}

interface ConversationRowProps {
  conversation: AiConversationSummary
  isActive: boolean
  onSelect: () => void
}

function ConversationRow({ conversation, isActive, onSelect }: ConversationRowProps) {
  const showToast = useToastStore((s) => s.show)
  const patchMutation = usePatchConversation(conversation.id)
  const deleteMutation = useDeleteConversation()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const isArchived = Boolean(conversation.archivedAt)
  const title = conversation.title?.trim() || "New chat"

  const handleArchiveToggle = async () => {
    try {
      await patchMutation.mutateAsync({ archived: !isArchived })
      showToast(isArchived ? "Conversation restored." : "Conversation archived.")
    } catch (error) {
      showToast(getApiErrorMessage(error))
    }
  }

  const handleDelete = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      window.setTimeout(() => setConfirmingDelete(false), 4000)
      return
    }
    try {
      await deleteMutation.mutateAsync(conversation.id)
      showToast("Conversation deleted.")
    } catch (error) {
      showToast(getApiErrorMessage(error))
    } finally {
      setConfirmingDelete(false)
    }
  }

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1.5 transition",
          isActive ? "bg-primary/10" : "hover:bg-muted",
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 text-left"
        >
          <p className={cn("truncate text-sm", isActive ? "font-semibold" : "font-medium")}>
            {title}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {isArchived ? "Archived · " : ""}
            {formatRelative(conversation.updatedAt)}
          </p>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="opacity-0 transition group-hover:opacity-100"
              aria-label="Conversation actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleArchiveToggle} disabled={patchMutation.isPending}>
              <Archive className="mr-2 h-4 w-4" />
              {isArchived ? "Restore" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {confirmingDelete ? "Click again to confirm" : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}
