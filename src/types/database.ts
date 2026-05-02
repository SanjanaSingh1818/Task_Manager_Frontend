export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: 'admin' | 'member';
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          role?: 'admin' | 'member';
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: 'todo' | 'in_progress' | 'completed';
          due_date: string | null;
          project_id: string | null;
          assigned_to: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          status?: 'todo' | 'in_progress' | 'completed';
          due_date?: string | null;
          project_id?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          status?: 'todo' | 'in_progress' | 'completed';
          due_date?: string | null;
          project_id?: string | null;
          assigned_to?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
