export interface WhatsAppEvent extends Document {
  _id: string;
  channelId: string;
  payload: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppEventsResponse {
  ok: boolean;
  payload: WhatsAppEvent[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter?: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}
