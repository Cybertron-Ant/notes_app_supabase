export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string | null;
          created_at?: string;
        };
      };
      notes_tags: {
        Row: {
          note_id: string;
          tag_id: string;
        };
        Insert: {
          note_id: string;
          tag_id: string;
        };
        Update: {
          note_id?: string;
          tag_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
