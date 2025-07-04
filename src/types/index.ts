import { User, File, Category, Reminder, FileStatus } from '@prisma/client'

export type UserWithRelations = User & {
  files: File[]
  reminders: Reminder[]
}

export type FileWithRelations = File & {
  user: User
  category: Category
}

export type ReminderWithRelations = Reminder & {
  user: User
  category?: Category | null
}

export interface TransmissionTorrent {
  id: number
  name: string
  status: number
  percentDone: number
  totalSize: number
  downloadedEver: number
  uploadedEver: number
  downloadDir: string
  files: Array<{
    name: string
    length: number
    bytesCompleted: number
  }>
}

export interface TransmissionResponse {
  arguments: {
    torrents: TransmissionTorrent[]
  }
  result: string
}

export interface TMDBSearchResult {
  id: number
  title?: string
  name?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string
  first_air_date?: string
  overview?: string
}

export interface CreateFileData {
  title: string
  categoryId: string
  magnetLink?: string
  imageUrl?: string
  season?: number
  releaseDate?: string
}

export interface CreateReminderData {
  title: string
  description?: string
  categoryId?: string
}

export { FileStatus }
