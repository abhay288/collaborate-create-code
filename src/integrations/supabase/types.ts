export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      career_recommendations: {
        Row: {
          career_id: string
          confidence_score: number
          created_at: string
          id: string
          quiz_session_id: string
          user_id: string
        }
        Insert: {
          career_id: string
          confidence_score: number
          created_at?: string
          id?: string
          quiz_session_id: string
          user_id: string
        }
        Update: {
          career_id?: string
          confidence_score?: number
          created_at?: string
          id?: string
          quiz_session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_recommendations_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_recommendations_quiz_session_id_fkey"
            columns: ["quiz_session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      careers: {
        Row: {
          category: string | null
          created_at: string
          description: string
          id: string
          requirements: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          id?: string
          requirements?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          requirements?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      colleges: {
        Row: {
          courses_offered: string[] | null
          created_at: string
          cutoff_scores: Json | null
          description: string | null
          fees: number | null
          id: string
          location: string
          name: string
          rating: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          courses_offered?: string[] | null
          created_at?: string
          cutoff_scores?: Json | null
          description?: string | null
          fees?: number | null
          id?: string
          location: string
          name: string
          rating?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          courses_offered?: string[] | null
          created_at?: string
          cutoff_scores?: Json | null
          description?: string | null
          fees?: number | null
          id?: string
          location?: string
          name?: string
          rating?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          education_level: string | null
          full_name: string | null
          goals: string | null
          id: string
          interests: string[] | null
          profile_picture_url: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          education_level?: string | null
          full_name?: string | null
          goals?: string | null
          id: string
          interests?: string[] | null
          profile_picture_url?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          created_at?: string
          education_level?: string | null
          full_name?: string | null
          goals?: string | null
          id?: string
          interests?: string[] | null
          profile_picture_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          category: Database["public"]["Enums"]["quiz_category"]
          created_at: string
          id: string
          options: Json
          question_text: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["quiz_category"]
          created_at?: string
          id?: string
          options: Json
          question_text: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["quiz_category"]
          created_at?: string
          id?: string
          options?: Json
          question_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_responses: {
        Row: {
          created_at: string
          id: string
          question_id: string
          quiz_session_id: string
          selected_option: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          quiz_session_id: string
          selected_option: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          quiz_session_id?: string
          selected_option?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_quiz_session_id_fkey"
            columns: ["quiz_session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_sessions: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          score: number | null
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          score?: number | null
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          score?: number | null
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: number | null
          application_link: string | null
          created_at: string
          deadline: string | null
          description: string
          eligibility_criteria: string
          id: string
          title: string
          type: Database["public"]["Enums"]["scholarship_type"]
          updated_at: string
        }
        Insert: {
          amount?: number | null
          application_link?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          eligibility_criteria: string
          id?: string
          title: string
          type: Database["public"]["Enums"]["scholarship_type"]
          updated_at?: string
        }
        Update: {
          amount?: number | null
          application_link?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          eligibility_criteria?: string
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["scholarship_type"]
          updated_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: Database["public"]["Enums"]["favorite_item_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: Database["public"]["Enums"]["favorite_item_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: Database["public"]["Enums"]["favorite_item_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      favorite_item_type: "career" | "college" | "scholarship"
      quiz_category:
        | "logical_reasoning"
        | "analytical_skills"
        | "creativity"
        | "technical_interests"
      scholarship_type: "government" | "private" | "ngo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      favorite_item_type: ["career", "college", "scholarship"],
      quiz_category: [
        "logical_reasoning",
        "analytical_skills",
        "creativity",
        "technical_interests",
      ],
      scholarship_type: ["government", "private", "ngo"],
    },
  },
} as const
