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
          industry: string | null
          job_type: string | null
          requirements: string | null
          salary_range: string | null
          skills_required: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          id?: string
          industry?: string | null
          job_type?: string | null
          requirements?: string | null
          salary_range?: string | null
          skills_required?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          industry?: string | null
          job_type?: string | null
          requirements?: string | null
          salary_range?: string | null
          skills_required?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      colleges: {
        Row: {
          added_in_survey: string | null
          address: string | null
          admission_link: string | null
          affiliation: string | null
          college_name: string | null
          college_type: string | null
          contact_info: string | null
          courses_offered: string[] | null
          created_at: string
          cutoff_scores: Json | null
          district: string | null
          eligibility_criteria: string | null
          established_year: string | null
          fees: number | null
          id: string
          is_active: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          management: string | null
          naac_grade: string | null
          rating: number | null
          s_no: number | null
          specialised_in: string | null
          state: string | null
          university_type: string | null
          updated_at: string
          uploaded_year: string | null
          website: string | null
        }
        Insert: {
          added_in_survey?: string | null
          address?: string | null
          admission_link?: string | null
          affiliation?: string | null
          college_name?: string | null
          college_type?: string | null
          contact_info?: string | null
          courses_offered?: string[] | null
          created_at?: string
          cutoff_scores?: Json | null
          district?: string | null
          eligibility_criteria?: string | null
          established_year?: string | null
          fees?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          management?: string | null
          naac_grade?: string | null
          rating?: number | null
          s_no?: number | null
          specialised_in?: string | null
          state?: string | null
          university_type?: string | null
          updated_at?: string
          uploaded_year?: string | null
          website?: string | null
        }
        Update: {
          added_in_survey?: string | null
          address?: string | null
          admission_link?: string | null
          affiliation?: string | null
          college_name?: string | null
          college_type?: string | null
          contact_info?: string | null
          courses_offered?: string[] | null
          created_at?: string
          cutoff_scores?: Json | null
          district?: string | null
          eligibility_criteria?: string | null
          established_year?: string | null
          fees?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          management?: string | null
          naac_grade?: string | null
          rating?: number | null
          s_no?: number | null
          specialised_in?: string | null
          state?: string | null
          university_type?: string | null
          updated_at?: string
          uploaded_year?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          class_level: string | null
          created_at: string
          creative_score: number | null
          current_course: string | null
          current_study_level: string | null
          education_level: string | null
          full_name: string | null
          goals: string | null
          id: string
          interests: string[] | null
          is_onboarding_complete: boolean | null
          logical_score: number | null
          numerical_score: number | null
          overall_score: number | null
          preferences: string[] | null
          preferred_district: string | null
          preferred_state: string | null
          primary_target: string | null
          profile_picture_url: string | null
          study_area: string | null
          target_admission_year: number | null
          target_course_interest: string[] | null
          technical_score: number | null
          updated_at: string
          verbal_score: number | null
        }
        Insert: {
          age?: number | null
          class_level?: string | null
          created_at?: string
          creative_score?: number | null
          current_course?: string | null
          current_study_level?: string | null
          education_level?: string | null
          full_name?: string | null
          goals?: string | null
          id: string
          interests?: string[] | null
          is_onboarding_complete?: boolean | null
          logical_score?: number | null
          numerical_score?: number | null
          overall_score?: number | null
          preferences?: string[] | null
          preferred_district?: string | null
          preferred_state?: string | null
          primary_target?: string | null
          profile_picture_url?: string | null
          study_area?: string | null
          target_admission_year?: number | null
          target_course_interest?: string[] | null
          technical_score?: number | null
          updated_at?: string
          verbal_score?: number | null
        }
        Update: {
          age?: number | null
          class_level?: string | null
          created_at?: string
          creative_score?: number | null
          current_course?: string | null
          current_study_level?: string | null
          education_level?: string | null
          full_name?: string | null
          goals?: string | null
          id?: string
          interests?: string[] | null
          is_onboarding_complete?: boolean | null
          logical_score?: number | null
          numerical_score?: number | null
          overall_score?: number | null
          preferences?: string[] | null
          preferred_district?: string | null
          preferred_state?: string | null
          primary_target?: string | null
          profile_picture_url?: string | null
          study_area?: string | null
          target_admission_year?: number | null
          target_course_interest?: string[] | null
          technical_score?: number | null
          updated_at?: string
          verbal_score?: number | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          category: Database["public"]["Enums"]["quiz_category"]
          created_at: string
          id: string
          options: Json
          points: number | null
          question_text: string
          target_class_levels: string[] | null
          target_study_areas: string[] | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["quiz_category"]
          created_at?: string
          id?: string
          options: Json
          points?: number | null
          question_text: string
          target_class_levels?: string[] | null
          target_study_areas?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["quiz_category"]
          created_at?: string
          id?: string
          options?: Json
          points?: number | null
          question_text?: string
          target_class_levels?: string[] | null
          target_study_areas?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_responses: {
        Row: {
          created_at: string
          id: string
          points_earned: number | null
          question_id: string
          quiz_session_id: string
          selected_option: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_earned?: number | null
          question_id: string
          quiz_session_id: string
          selected_option: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_earned?: number | null
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
          category_scores: Json | null
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
          category_scores?: Json | null
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
          category_scores?: Json | null
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
      recommendation_feedback: {
        Row: {
          created_at: string
          feedback_data: Json | null
          feedback_type: string
          id: string
          recommendation_id: string
          recommendation_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_data?: Json | null
          feedback_type: string
          id?: string
          recommendation_id: string
          recommendation_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_data?: Json | null
          feedback_type?: string
          id?: string
          recommendation_id?: string
          recommendation_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          verified: boolean | null
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
          verified?: boolean | null
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
          verified?: boolean | null
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
      user_recommendations: {
        Row: {
          confidence_score: number
          created_at: string
          id: string
          item_id: string
          match_reason: string | null
          quiz_session_id: string
          recommendation_type: string
          user_id: string
        }
        Insert: {
          confidence_score: number
          created_at?: string
          id?: string
          item_id: string
          match_reason?: string | null
          quiz_session_id: string
          recommendation_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          id?: string
          item_id?: string
          match_reason?: string | null
          quiz_session_id?: string
          recommendation_type?: string
          user_id?: string
        }
        Relationships: []
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
      verified_jobs: {
        Row: {
          apply_url: string
          company: string
          created_at: string
          experience_required: string | null
          id: string
          is_active: boolean | null
          job_type: string | null
          last_checked: string | null
          location: string
          posting_date: string
          required_education: string[] | null
          required_skills: string[] | null
          role: string
          salary_range: string | null
          source_site: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          apply_url: string
          company: string
          created_at?: string
          experience_required?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          last_checked?: string | null
          location: string
          posting_date: string
          required_education?: string[] | null
          required_skills?: string[] | null
          role: string
          salary_range?: string | null
          source_site: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          apply_url?: string
          company?: string
          created_at?: string
          experience_required?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          last_checked?: string | null
          location?: string
          posting_date?: string
          required_education?: string[] | null
          required_skills?: string[] | null
          role?: string
          salary_range?: string | null
          source_site?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      verified_scholarships: {
        Row: {
          amount: string
          apply_url: string
          category_criteria: string[] | null
          created_at: string
          deadline: string | null
          eligibility_summary: string
          id: string
          income_criteria: string | null
          last_checked: string | null
          minimum_percentage: number | null
          name: string
          official_domain: string
          provider: string
          required_documents: string[]
          source: string
          source_url: string
          status: string
          target_academic_level: string[] | null
          target_locations: string[] | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          youtube_tutorial_channel: string | null
          youtube_tutorial_publish_date: string | null
          youtube_tutorial_title: string | null
          youtube_tutorial_url: string | null
        }
        Insert: {
          amount: string
          apply_url: string
          category_criteria?: string[] | null
          created_at?: string
          deadline?: string | null
          eligibility_summary: string
          id?: string
          income_criteria?: string | null
          last_checked?: string | null
          minimum_percentage?: number | null
          name: string
          official_domain: string
          provider: string
          required_documents?: string[]
          source: string
          source_url: string
          status?: string
          target_academic_level?: string[] | null
          target_locations?: string[] | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          youtube_tutorial_channel?: string | null
          youtube_tutorial_publish_date?: string | null
          youtube_tutorial_title?: string | null
          youtube_tutorial_url?: string | null
        }
        Update: {
          amount?: string
          apply_url?: string
          category_criteria?: string[] | null
          created_at?: string
          deadline?: string | null
          eligibility_summary?: string
          id?: string
          income_criteria?: string | null
          last_checked?: string | null
          minimum_percentage?: number | null
          name?: string
          official_domain?: string
          provider?: string
          required_documents?: string[]
          source?: string
          source_url?: string
          status?: string
          target_academic_level?: string[] | null
          target_locations?: string[] | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          youtube_tutorial_channel?: string | null
          youtube_tutorial_publish_date?: string | null
          youtube_tutorial_title?: string | null
          youtube_tutorial_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      get_filtered_quiz_questions: {
        Args: { p_class_level: string; p_limit?: number; p_study_area: string }
        Returns: {
          category: Database["public"]["Enums"]["quiz_category"]
          created_at: string
          id: string
          options: Json
          points: number | null
          question_text: string
          target_class_levels: string[] | null
          target_study_areas: string[] | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "quiz_questions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        | "quantitative"
        | "verbal"
        | "interpersonal"
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
        "quantitative",
        "verbal",
        "interpersonal",
      ],
      scholarship_type: ["government", "private", "ngo"],
    },
  },
} as const
