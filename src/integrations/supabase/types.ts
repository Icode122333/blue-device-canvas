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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          google_meet_link: string | null
          id: string
          notes: string | null
          physiotherapist: string
          scheduled_at: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          google_meet_link?: string | null
          id?: string
          notes?: string | null
          physiotherapist: string
          scheduled_at: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          google_meet_link?: string | null
          id?: string
          notes?: string | null
          physiotherapist?: string
          scheduled_at?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chw_assignments: {
        Row: {
          chw_id: string
          created_at: string | null
          id: string
          patient_id: string
        }
        Insert: {
          chw_id: string
          created_at?: string | null
          id?: string
          patient_id: string
        }
        Update: {
          chw_id?: string
          created_at?: string | null
          id?: string
          patient_id?: string
        }
        Relationships: []
      }
      chw_reports: {
        Row: {
          admin_comment: string | null
          attachment_url: string | null
          chw_id: string
          content: string
          created_at: string | null
          id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_comment?: string | null
          attachment_url?: string | null
          chw_id: string
          content: string
          created_at?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_comment?: string | null
          attachment_url?: string | null
          chw_id?: string
          content?: string
          created_at?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_question_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          question_id: string
          responder_id: string
          responder_role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          question_id: string
          responder_id: string
          responder_role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          question_id?: string
          responder_id?: string
          responder_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_question_replies_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "community_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      community_questions: {
        Row: {
          assigned_physio_id: string | null
          content: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          assigned_physio_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          assigned_physio_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_videos: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          duration_seconds: number | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration_seconds?: number | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration_seconds?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          payload: Json
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload: Json
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_assessments: {
        Row: {
          address_cell: string | null
          address_district: string | null
          address_sector: string | null
          address_village: string | null
          caregiver_contact: string | null
          caregiver_name: string | null
          created_at: string
          date_of_birth: string | null
          developmental_delayed_milestones: string | null
          developmental_response_prior_treatments: string | null
          env_assistive_devices: string | null
          env_attention_span: string | null
          env_communication_ability: string | null
          env_continence_hygiene: string | null
          env_gait_posture_deformities: string | null
          env_home_school_accessibility: string | null
          env_involuntary_movements: string | null
          env_nutrition_feeding: string | null
          full_name: string | null
          functional_complaint: string | null
          gender: string | null
          gmfc_level: string | null
          id: string
          motor_balance_coordination: string | null
          motor_gross_fine_skills: string | null
          motor_range_of_motion: string | null
          motor_reflexes: string | null
          motor_sensory_perception: string | null
          motor_tone_contractures_tightness: string | null
          patient_id: string
          perinatal_apgar: string | null
          perinatal_complications: string | null
          perinatal_mode_of_delivery: string | null
          perinatal_trauma: string | null
          physio_id: string
          postnatal_brain_trauma: string | null
          postnatal_jaundice: boolean | null
          postnatal_prior_treatments: string | null
          postnatal_surgery: string | null
          prenatal_drugs: string | null
          prenatal_folic_acid: boolean | null
          prenatal_infections: string | null
          prenatal_mothers_age: number | null
          rehab_functional_level: string | null
          rehab_recommendations: string | null
          updated_at: string
        }
        Insert: {
          address_cell?: string | null
          address_district?: string | null
          address_sector?: string | null
          address_village?: string | null
          caregiver_contact?: string | null
          caregiver_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          developmental_delayed_milestones?: string | null
          developmental_response_prior_treatments?: string | null
          env_assistive_devices?: string | null
          env_attention_span?: string | null
          env_communication_ability?: string | null
          env_continence_hygiene?: string | null
          env_gait_posture_deformities?: string | null
          env_home_school_accessibility?: string | null
          env_involuntary_movements?: string | null
          env_nutrition_feeding?: string | null
          full_name?: string | null
          functional_complaint?: string | null
          gender?: string | null
          gmfc_level?: string | null
          id?: string
          motor_balance_coordination?: string | null
          motor_gross_fine_skills?: string | null
          motor_range_of_motion?: string | null
          motor_reflexes?: string | null
          motor_sensory_perception?: string | null
          motor_tone_contractures_tightness?: string | null
          patient_id: string
          perinatal_apgar?: string | null
          perinatal_complications?: string | null
          perinatal_mode_of_delivery?: string | null
          perinatal_trauma?: string | null
          physio_id: string
          postnatal_brain_trauma?: string | null
          postnatal_jaundice?: boolean | null
          postnatal_prior_treatments?: string | null
          postnatal_surgery?: string | null
          prenatal_drugs?: string | null
          prenatal_folic_acid?: boolean | null
          prenatal_infections?: string | null
          prenatal_mothers_age?: number | null
          rehab_functional_level?: string | null
          rehab_recommendations?: string | null
          updated_at?: string
        }
        Update: {
          address_cell?: string | null
          address_district?: string | null
          address_sector?: string | null
          address_village?: string | null
          caregiver_contact?: string | null
          caregiver_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          developmental_delayed_milestones?: string | null
          developmental_response_prior_treatments?: string | null
          env_assistive_devices?: string | null
          env_attention_span?: string | null
          env_communication_ability?: string | null
          env_continence_hygiene?: string | null
          env_gait_posture_deformities?: string | null
          env_home_school_accessibility?: string | null
          env_involuntary_movements?: string | null
          env_nutrition_feeding?: string | null
          full_name?: string | null
          functional_complaint?: string | null
          gender?: string | null
          gmfc_level?: string | null
          id?: string
          motor_balance_coordination?: string | null
          motor_gross_fine_skills?: string | null
          motor_range_of_motion?: string | null
          motor_reflexes?: string | null
          motor_sensory_perception?: string | null
          motor_tone_contractures_tightness?: string | null
          patient_id?: string
          perinatal_apgar?: string | null
          perinatal_complications?: string | null
          perinatal_mode_of_delivery?: string | null
          perinatal_trauma?: string | null
          physio_id?: string
          postnatal_brain_trauma?: string | null
          postnatal_jaundice?: boolean | null
          postnatal_prior_treatments?: string | null
          postnatal_surgery?: string | null
          prenatal_drugs?: string | null
          prenatal_folic_acid?: boolean | null
          prenatal_infections?: string | null
          prenatal_mothers_age?: number | null
          rehab_functional_level?: string | null
          rehab_recommendations?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patient_exercise_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          patient_id: string
          video_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          video_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_exercise_assignments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "exercise_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_onboarding: {
        Row: {
          age: number
          created_at: string | null
          full_name: string
          id: string
          mother_phone: string
          problem_first_noticed: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age: number
          created_at?: string | null
          full_name: string
          id?: string
          mother_phone: string
          problem_first_noticed: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number
          created_at?: string | null
          full_name?: string
          id?: string
          mother_phone?: string
          problem_first_noticed?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          phone: string | null
          residence: string | null
          role: string
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          residence?: string | null
          role: string
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          residence?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_physio: {
        Args: { uid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
