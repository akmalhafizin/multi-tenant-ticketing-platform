export type TicketStatus = 'open' | 'pending' | 'on_hold' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type AuthorType = 'agent' | 'guest'

export interface Ticket {
  id: string
  date: string
  category: string
  status: TicketStatus
  priority: TicketPriority
  title: string
  description: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  attachments: Attachment[]
  comments: Comment[]
}

export interface Attachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
}

export interface Comment {
  id: string
  author: string
  authorType: AuthorType
  body: string
  isInternal: boolean
  createdAt: string
}
