export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      custom_requests: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          status: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      keys_history: {
        Row: {
          id: string
          key_type: string
          new_total: number
          quantity: number
          reason: string | null
          timestamp: string
          type: string
          user_id: string
        }
        Insert: {
          id?: string
          key_type: string
          new_total: number
          quantity: number
          reason?: string | null
          timestamp?: string
          type: string
          user_id: string
        }
        Update: {
          id?: string
          key_type?: string
          new_total?: number
          quantity?: number
          reason?: string | null
          timestamp?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keys_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      points_history: {
        Row: {
          id: string
          new_total: number
          points: number
          reason: string | null
          task_id: string | null
          task_title: string | null
          timestamp: string
          type: string
          user_id: string
        }
        Insert: {
          id?: string
          new_total: number
          points: number
          reason?: string | null
          task_id?: string | null
          task_title?: string | null
          timestamp?: string
          type: string
          user_id: string
        }
        Update: {
          id?: string
          new_total?: number
          points?: number
          reason?: string | null
          task_id?: string | null
          task_title?: string | null
          timestamp?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          email_verified: boolean
          full_name: string
          id: string
          points: number
          role: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_verified?: boolean
          full_name: string
          id: string
          points?: number
          role?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          email_verified?: boolean
          full_name?: string
          id?: string
          points?: number
          role?: string
          username?: string
        }
        Relationships: []
      }
      reward_key_requirements: {
        Row: {
          id: string
          key_type: string
          quantity: number
          reward_id: string
        }
        Insert: {
          id?: string
          key_type: string
          quantity?: number
          reward_id: string
        }
        Update: {
          id?: string
          key_type?: string
          quantity?: number
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_key_requirements_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          category: string | null
          description: string | null
          id: string
          points_cost: number
          requires_approval: boolean
          title: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          points_cost: number
          requires_approval?: boolean
          title: string
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          points_cost?: number
          requires_approval?: boolean
          title?: string
        }
        Relationships: []
      }
      task_key_rewards: {
        Row: {
          id: string
          key_type: string
          quantity: number
          task_id: string
        }
        Insert: {
          id?: string
          key_type: string
          quantity?: number
          task_id: string
        }
        Update: {
          id?: string
          key_type?: string
          quantity?: number
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_key_rewards_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          points_value: number
          recurring: boolean | null
          status: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          points_value?: number
          recurring?: boolean | null
          status?: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          points_value?: number
          recurring?: boolean | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_keys: {
        Row: {
          id: string
          key_type: string
          quantity: number
          user_id: string
        }
        Insert: {
          id?: string
          key_type: string
          quantity?: number
          user_id: string
        }
        Update: {
          id?: string
          key_type?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tasks: {
        Row: {
          assigned_at: string
          completed_at: string | null
          completion_requested_at: string | null
          id: string
          notes: string | null
          rejected_at: string | null
          rejection_reason: string | null
          status: string
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          completed_at?: string | null
          completion_requested_at?: string | null
          id?: string
          notes?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          completed_at?: string | null
          completion_requested_at?: string | null
          id?: string
          notes?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
