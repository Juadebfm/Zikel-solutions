import { apiRequest } from "@/lib/api/client"

export interface CreateUploadSessionInput {
  fileName: string
  contentType: string
  sizeBytes: number
  purpose: "signature"
}

export interface UploadSession {
  fileId: string
  upload: {
    url: string
    method: string
    contentType: string
    headers: Record<string, string>
  }
}

export interface CompletedUpload {
  file: {
    id: string
  }
}

export interface UploadDownloadUrl {
  url: string
}

interface CreateSessionResponseData {
  file: {
    id: string
    originalName: string
    contentType: string
    sizeBytes: number
    purpose: string
    status: string
    uploadedAt: string | null
    publicUrl: string | null
    createdAt: string
    updatedAt: string
    checksumSha256: string | null
  }
  upload: {
    method: string
    url: string
    expiresAt: string
    headers: Record<string, string>
  }
}

interface CompleteResponseData {
  id: string
  originalName: string
  contentType: string
  sizeBytes: number
  purpose: string
  status: string
  uploadedAt: string | null
  publicUrl: string | null
}

export const uploadsService = {
  async createSession(input: CreateUploadSessionInput): Promise<UploadSession> {
    const response = await apiRequest<CreateSessionResponseData>({
      path: "/uploads/sessions",
      method: "POST",
      auth: true,
      body: input,
    })

    const { file, upload } = response.data
    if (!file?.id || !upload?.url) {
      throw new Error("Invalid upload session response.")
    }

    return {
      fileId: file.id,
      upload: {
        url: upload.url,
        method: upload.method ?? "PUT",
        contentType: upload.headers?.["Content-Type"] ?? input.contentType,
        headers: upload.headers ?? {},
      },
    }
  },

  async uploadToSignedUrl(args: {
    url: string
    method?: string
    contentType: string
    blob: Blob
    headers?: Record<string, string>
  }): Promise<void> {
    const response = await fetch(args.url, {
      method: args.method ?? "PUT",
      headers: {
        "Content-Type": args.contentType,
        ...(args.headers ?? {}),
      },
      body: args.blob,
    })

    if (!response.ok) {
      throw new Error("Failed to upload signature file.")
    }
  },

  async completeUpload(fileId: string, expectedSizeBytes?: number): Promise<CompletedUpload> {
    const response = await apiRequest<CompleteResponseData>({
      path: `/uploads/${fileId}/complete`,
      method: "POST",
      auth: true,
      body: expectedSizeBytes != null ? { expectedSizeBytes } : undefined,
    })

    const id = response.data?.id
    if (!id) {
      throw new Error("Invalid upload completion response.")
    }

    return {
      file: { id },
    }
  },

  async getDownloadUrl(fileId: string): Promise<UploadDownloadUrl> {
    const response = await apiRequest<{
      url?: string
      downloadUrl?: string
    }>({
      path: `/uploads/${fileId}/download-url`,
      auth: true,
    })

    const url = response.data.url ?? response.data.downloadUrl
    if (!url) {
      throw new Error("Unable to get file download URL.")
    }

    return { url }
  },
}
