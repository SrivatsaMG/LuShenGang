export type PhotoStatus = "pending" | "approved" | "rejected";
export type PhotoMimeType = "image/jpeg" | "image/png" | "image/webp";

export type GalleryPhotoRow = {
  id: string;
  discord_user_id: string;
  username: string;
  object_path: string;
  mime_type: PhotoMimeType;
  size_bytes: number;
  status: PhotoStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type Database = {
  public: {
    Tables: {
      gallery_photos: {
        Row: GalleryPhotoRow;
        Insert: Omit<GalleryPhotoRow, "id" | "created_at" | "status" | "reviewed_at" | "reviewed_by"> &
          Partial<Pick<GalleryPhotoRow, "status" | "reviewed_at" | "reviewed_by">>;
        Update: Partial<Pick<GalleryPhotoRow, "status" | "reviewed_at" | "reviewed_by">>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
