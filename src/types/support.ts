export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Ticket {
  id: number;
  userId: number;
  subject: string;
  message: string;
  status: TicketStatus;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDto {
  subject: string;
  message: string;
}

export interface ReplyTicketDto {
  response: string;
}

export interface UpdateTicketStatusDto {
  status: TicketStatus;
}

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  limit: number;
  offset: number;
}

export interface TicketsFilters {
  limit?: number;
  offset?: number;
  status?: TicketStatus;
  sortBy?: "createdAt" | "updatedAt" | "status";
  sortOrder?: "asc" | "desc";
}

