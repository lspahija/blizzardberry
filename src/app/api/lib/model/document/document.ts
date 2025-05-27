export interface Document {
  id: string;
  parent_document_id: string | null;
  content: string;
  metadata: any;
  chunk_ids: string[];
}
