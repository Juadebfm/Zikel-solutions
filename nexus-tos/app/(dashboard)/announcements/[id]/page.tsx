"use client"

import { use } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAnnouncementById } from "@/hooks/api/use-announcements"

interface ViewAnnouncementPageProps {
  params: Promise<{ id: string }>
}

export default function ViewAnnouncementPage({ params }: ViewAnnouncementPageProps) {
  const { id } = use(params)
  const announcementQuery = useAnnouncementById(id)

  if (announcementQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">View Announcement</h1>
          <p className="text-gray-500 mt-1">Loading announcement details...</p>
        </div>
      </div>
    )
  }

  if (announcementQuery.error || !announcementQuery.data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcement Not Found</h1>
          <p className="text-gray-500 mt-1">
            {announcementQuery.error instanceof Error
              ? announcementQuery.error.message
              : "The announcement you are looking for does not exist."}
          </p>
        </div>
        <Link href="/announcements">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            back
          </Button>
        </Link>
      </div>
    )
  }

  const announcement = announcementQuery.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">View Announcement</h1>
        <p className="text-gray-500 mt-1">Viewing announcement details.</p>
      </div>

      <div className="flex justify-end">
        <Link href="/announcements">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            back
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">{announcement.title}</h2>
          <Badge
            className={`shrink-0 w-fit ${
              announcement.status === "read"
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {announcement.status}
          </Badge>
        </div>

        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
          <div>
            <span className="font-medium text-gray-700">ID:</span> {announcement.id}
          </div>
          <div>
            <span className="font-medium text-gray-700">Starts At:</span> {formatDateTime(announcement.startsAt)}
          </div>
          <div>
            <span className="font-medium text-gray-700">Ends At:</span>{" "}
            {announcement.endsAt ? formatDateTime(announcement.endsAt) : "-"}
          </div>
        </div>

        {announcement.images.length > 0 && (
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            {announcement.images.map((image, index) => (
              <div
                key={`${announcement.id}-${index}`}
                className="relative w-full max-w-4xl mx-auto rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
              >
                <div className="aspect-[16/9] relative">
                  <Image
                    src={image}
                    alt={`${announcement.title} - image ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 896px"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {announcement.description}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
