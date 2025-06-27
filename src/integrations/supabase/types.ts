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
      ai_pre_diagnostic_chats: {
        Row: {
          ended_at: string | null
          id: string
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_pre_diagnostic_messages: {
        Row: {
          chat_id: string
          id: string
          message: string
          sender: string
          timestamp: string | null
        }
        Insert: {
          chat_id: string
          id?: string
          message: string
          sender: string
          timestamp?: string | null
        }
        Update: {
          chat_id?: string
          id?: string
          message?: string
          sender?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_pre_diagnostic_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "ai_pre_diagnostic_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          quote_id: string | null
          repairer_id: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          appointment_date: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          quote_id?: string | null
          repairer_id: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          appointment_date?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          quote_id?: string | null
          repairer_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments_with_quotes: {
        Row: {
          appointment_date: string
          client_id: string
          client_notes: string | null
          created_at: string
          duration_minutes: number
          id: string
          quote_id: string
          repairer_id: string
          repairer_notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          client_id: string
          client_notes?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          quote_id: string
          repairer_id: string
          repairer_notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          client_id?: string
          client_notes?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          quote_id?: string
          repairer_id?: string
          repairer_notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_with_quotes_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes_with_timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_rules: {
        Row: {
          enabled: boolean | null
          id: string
          repairer_id: string
          rule: Json
          updated_at: string | null
        }
        Insert: {
          enabled?: boolean | null
          id?: string
          repairer_id: string
          rule: Json
          updated_at?: string | null
        }
        Update: {
          enabled?: boolean | null
          id?: string
          repairer_id?: string
          rule?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          file_url: string | null
          id: string
          message: string
          message_type: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          message: string
          message_type?: string | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          message?: string
          message_type?: string | null
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: []
      }
      client_interest_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          client_email: string | null
          client_message: string | null
          client_phone: string | null
          created_at: string
          id: string
          repairer_profile_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          client_email?: string | null
          client_message?: string | null
          client_phone?: string | null
          created_at?: string
          id?: string
          repairer_profile_id: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          client_email?: string | null
          client_message?: string | null
          client_phone?: string | null
          created_at?: string
          id?: string
          repairer_profile_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      closed_businesses: {
        Row: {
          address: string | null
          city: string | null
          closure_date: string | null
          created_at: string
          id: string
          name: string
          pappers_data: Json | null
          postal_code: string | null
          siren: string | null
          siret: string | null
          status: string
          verification_date: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          closure_date?: string | null
          created_at?: string
          id?: string
          name: string
          pappers_data?: Json | null
          postal_code?: string | null
          siren?: string | null
          siret?: string | null
          status: string
          verification_date?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          closure_date?: string | null
          created_at?: string
          id?: string
          name?: string
          pappers_data?: Json | null
          postal_code?: string | null
          siren?: string | null
          siret?: string | null
          status?: string
          verification_date?: string
        }
        Relationships: []
      }
      device_models: {
        Row: {
          battery_capacity: number | null
          brand_id: string
          colors: Json | null
          connectivity: Json | null
          created_at: string
          device_type_id: string
          dimensions: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          model_name: string
          model_number: string | null
          operating_system: string | null
          processor: string | null
          ram_gb: number | null
          release_date: string | null
          screen_resolution: string | null
          screen_size: number | null
          screen_type: string | null
          special_features: Json | null
          storage_options: Json | null
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          battery_capacity?: number | null
          brand_id: string
          colors?: Json | null
          connectivity?: Json | null
          created_at?: string
          device_type_id: string
          dimensions?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          model_name: string
          model_number?: string | null
          operating_system?: string | null
          processor?: string | null
          ram_gb?: number | null
          release_date?: string | null
          screen_resolution?: string | null
          screen_size?: number | null
          screen_type?: string | null
          special_features?: Json | null
          storage_options?: Json | null
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          battery_capacity?: number | null
          brand_id?: string
          colors?: Json | null
          connectivity?: Json | null
          created_at?: string
          device_type_id?: string
          dimensions?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          model_name?: string
          model_number?: string | null
          operating_system?: string | null
          processor?: string | null
          ram_gb?: number | null
          release_date?: string | null
          screen_resolution?: string | null
          screen_size?: number | null
          screen_type?: string | null
          special_features?: Json | null
          storage_options?: Json | null
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "device_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_models_device_type_id_fkey"
            columns: ["device_type_id"]
            isOneToOne: false
            referencedRelation: "device_types"
            referencedColumns: ["id"]
          },
        ]
      }
      device_types: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      feature_flags_by_plan: {
        Row: {
          enabled: boolean
          feature_key: string
          id: string
          plan_name: string
          updated_at: string | null
        }
        Insert: {
          enabled?: boolean
          feature_key: string
          id?: string
          plan_name: string
          updated_at?: string | null
        }
        Update: {
          enabled?: boolean
          feature_key?: string
          id?: string
          plan_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          email_enabled: boolean | null
          push_enabled: boolean | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          email_enabled?: boolean | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          email_enabled?: boolean | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications_system: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          notification_type: string
          related_appointment_id: string | null
          related_quote_id: string | null
          title: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          related_appointment_id?: string | null
          related_quote_id?: string | null
          title: string
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          related_appointment_id?: string | null
          related_quote_id?: string | null
          title?: string
          user_id?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_system_related_quote_id_fkey"
            columns: ["related_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes_with_timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      pappers_verification_cache: {
        Row: {
          business_status: string | null
          created_at: string
          id: string
          is_active: boolean
          last_verified: string
          pappers_data: Json | null
          siren: string | null
          siret: string
        }
        Insert: {
          business_status?: string | null
          created_at?: string
          id?: string
          is_active: boolean
          last_verified?: string
          pappers_data?: Json | null
          siren?: string | null
          siret: string
        }
        Update: {
          business_status?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_verified?: string
          pappers_data?: Json | null
          siren?: string | null
          siret?: string
        }
        Relationships: []
      }
      parts_catalog: {
        Row: {
          brand: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          model: string | null
          name: string
          part_number: string | null
          price: number | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          model?: string | null
          name: string
          part_number?: string | null
          price?: number | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          model?: string | null
          name?: string
          part_number?: string | null
          price?: number | null
        }
        Relationships: []
      }
      parts_inventory: {
        Row: {
          id: string
          part_id: string
          quantity: number
          repairer_id: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          part_id: string
          quantity?: number
          repairer_id: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          part_id?: string
          quantity?: number
          repairer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_inventory_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      parts_orders: {
        Row: {
          created_at: string | null
          id: string
          part_id: string
          quantity: number
          repairer_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          part_id: string
          quantity?: number
          repairer_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          part_id?: string
          quantity?: number
          repairer_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_orders_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_grid: {
        Row: {
          average_price: number
          created_at: string
          device_brand: string
          device_model: string
          id: string
          issue_type: string
          max_price: number
          min_price: number
          updated_at: string
        }
        Insert: {
          average_price: number
          created_at?: string
          device_brand: string
          device_model: string
          id?: string
          issue_type: string
          max_price: number
          min_price: number
          updated_at?: string
        }
        Update: {
          average_price?: number
          created_at?: string
          device_brand?: string
          device_model?: string
          id?: string
          issue_type?: string
          max_price?: number
          min_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          applicable_plans: string[] | null
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          discount_type: string
          discount_value: number
          id: string
          max_uses: number | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          active?: boolean
          applicable_plans?: string[] | null
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          discount_type: string
          discount_value: number
          id?: string
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          active?: boolean
          applicable_plans?: string[] | null
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          discount_type?: string
          discount_value?: number
          id?: string
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          contact_email: string
          contact_phone: string | null
          created_at: string
          device_brand: string
          device_model: string
          estimated_price: number | null
          id: string
          issue_description: string
          issue_type: string
          repairer_id: string | null
          response_message: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          device_brand: string
          device_model: string
          estimated_price?: number | null
          id?: string
          issue_description: string
          issue_type: string
          repairer_id?: string | null
          response_message?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          device_brand?: string
          device_model?: string
          estimated_price?: number | null
          id?: string
          issue_description?: string
          issue_type?: string
          repairer_id?: string | null
          response_message?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      quotes_with_timeline: {
        Row: {
          accepted_at: string | null
          client_acceptance_deadline: string | null
          client_email: string
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          client_response_notes: string | null
          created_at: string
          device_brand: string
          device_model: string
          estimated_price: number | null
          id: string
          issue_description: string | null
          quoted_at: string | null
          rejected_at: string | null
          repair_duration: string | null
          repair_type: string
          repairer_id: string
          repairer_notes: string | null
          repairer_response_deadline: string
          status: string
          updated_at: string
          warranty_info: string | null
        }
        Insert: {
          accepted_at?: string | null
          client_acceptance_deadline?: string | null
          client_email: string
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_response_notes?: string | null
          created_at?: string
          device_brand: string
          device_model: string
          estimated_price?: number | null
          id?: string
          issue_description?: string | null
          quoted_at?: string | null
          rejected_at?: string | null
          repair_duration?: string | null
          repair_type: string
          repairer_id: string
          repairer_notes?: string | null
          repairer_response_deadline?: string
          status?: string
          updated_at?: string
          warranty_info?: string | null
        }
        Update: {
          accepted_at?: string | null
          client_acceptance_deadline?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_response_notes?: string | null
          created_at?: string
          device_brand?: string
          device_model?: string
          estimated_price?: number | null
          id?: string
          issue_description?: string | null
          quoted_at?: string | null
          rejected_at?: string | null
          repair_duration?: string | null
          repair_type?: string
          repairer_id?: string
          repairer_notes?: string | null
          repairer_response_deadline?: string
          status?: string
          updated_at?: string
          warranty_info?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          created_at: string | null
          id: string
          referred_email: string
          referrer_id: string
          reward_claimed: boolean | null
          status: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          referred_email: string
          referrer_id: string
          reward_claimed?: boolean | null
          status?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          referred_email?: string
          referrer_id?: string
          reward_claimed?: boolean | null
          status?: string | null
        }
        Relationships: []
      }
      repair_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      repair_prices: {
        Row: {
          created_at: string
          device_model_id: string
          id: string
          is_available: boolean | null
          labor_price_eur: number | null
          notes: string | null
          part_price_eur: number | null
          price_eur: number
          repair_type_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_model_id: string
          id?: string
          is_available?: boolean | null
          labor_price_eur?: number | null
          notes?: string | null
          part_price_eur?: number | null
          price_eur: number
          repair_type_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_model_id?: string
          id?: string
          is_available?: boolean | null
          labor_price_eur?: number | null
          notes?: string | null
          part_price_eur?: number | null
          price_eur?: number
          repair_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_prices_device_model_id_fkey"
            columns: ["device_model_id"]
            isOneToOne: false
            referencedRelation: "device_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_prices_repair_type_id_fkey"
            columns: ["repair_type_id"]
            isOneToOne: false
            referencedRelation: "repair_types"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_tracking: {
        Row: {
          created_at: string
          estimated_completion: string | null
          id: string
          quote_id: string | null
          repairer_id: string
          status: string
          status_message: string | null
        }
        Insert: {
          created_at?: string
          estimated_completion?: string | null
          id?: string
          quote_id?: string | null
          repairer_id: string
          status: string
          status_message?: string | null
        }
        Update: {
          created_at?: string
          estimated_completion?: string | null
          id?: string
          quote_id?: string | null
          repairer_id?: string
          status?: string
          status_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_tracking_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_types: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          estimated_time_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          warranty_days: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          warranty_days?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          warranty_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "repair_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      repairer_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          repairer_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          repairer_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          repairer_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      repairer_brand_settings: {
        Row: {
          brand_id: string
          created_at: string
          default_margin_percentage: number | null
          id: string
          is_active: boolean
          repairer_id: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          default_margin_percentage?: number | null
          id?: string
          is_active?: boolean
          repairer_id: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          default_margin_percentage?: number | null
          id?: string
          is_active?: boolean
          repairer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repairer_brand_settings_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      repairer_catalog_preferences: {
        Row: {
          created_at: string
          default_margin_percentage: number | null
          entity_id: string
          entity_type: string
          id: string
          is_active: boolean
          notes: string | null
          repairer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_margin_percentage?: number | null
          entity_id: string
          entity_type: string
          id?: string
          is_active?: boolean
          notes?: string | null
          repairer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_margin_percentage?: number | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          repairer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      repairer_custom_prices: {
        Row: {
          created_at: string
          custom_labor_price_eur: number | null
          custom_part_price_eur: number | null
          custom_price_eur: number
          id: string
          is_active: boolean
          is_starting_price: boolean | null
          margin_percentage: number | null
          notes: string | null
          price_type: string | null
          repair_price_id: string
          repairer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_labor_price_eur?: number | null
          custom_part_price_eur?: number | null
          custom_price_eur: number
          id?: string
          is_active?: boolean
          is_starting_price?: boolean | null
          margin_percentage?: number | null
          notes?: string | null
          price_type?: string | null
          repair_price_id: string
          repairer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_labor_price_eur?: number | null
          custom_part_price_eur?: number | null
          custom_price_eur?: number
          id?: string
          is_active?: boolean
          is_starting_price?: boolean | null
          margin_percentage?: number | null
          notes?: string | null
          price_type?: string | null
          repair_price_id?: string
          repairer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repairer_custom_prices_repair_price_id_fkey"
            columns: ["repair_price_id"]
            isOneToOne: false
            referencedRelation: "repair_prices"
            referencedColumns: ["id"]
          },
        ]
      }
      repairer_profiles: {
        Row: {
          address: string
          business_name: string
          certifications: string[] | null
          city: string
          created_at: string
          description: string | null
          email: string
          emergency_service: boolean | null
          facebook_url: string | null
          has_qualirepar_label: boolean | null
          home_service: boolean | null
          id: string
          instagram_url: string | null
          languages_spoken: string[] | null
          linkedin_url: string | null
          opening_hours: Json | null
          other_services: string | null
          payment_methods: string[] | null
          phone: string
          pickup_service: boolean | null
          postal_code: string
          pricing_info: Json | null
          profile_image_url: string | null
          repair_types: string[] | null
          response_time: string | null
          services_offered: string[] | null
          shop_photos: string[] | null
          siret_number: string | null
          telegram_url: string | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          warranty_duration: string | null
          website: string | null
          whatsapp_url: string | null
          years_experience: number | null
        }
        Insert: {
          address: string
          business_name: string
          certifications?: string[] | null
          city: string
          created_at?: string
          description?: string | null
          email: string
          emergency_service?: boolean | null
          facebook_url?: string | null
          has_qualirepar_label?: boolean | null
          home_service?: boolean | null
          id?: string
          instagram_url?: string | null
          languages_spoken?: string[] | null
          linkedin_url?: string | null
          opening_hours?: Json | null
          other_services?: string | null
          payment_methods?: string[] | null
          phone: string
          pickup_service?: boolean | null
          postal_code: string
          pricing_info?: Json | null
          profile_image_url?: string | null
          repair_types?: string[] | null
          response_time?: string | null
          services_offered?: string[] | null
          shop_photos?: string[] | null
          siret_number?: string | null
          telegram_url?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          warranty_duration?: string | null
          website?: string | null
          whatsapp_url?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string
          business_name?: string
          certifications?: string[] | null
          city?: string
          created_at?: string
          description?: string | null
          email?: string
          emergency_service?: boolean | null
          facebook_url?: string | null
          has_qualirepar_label?: boolean | null
          home_service?: boolean | null
          id?: string
          instagram_url?: string | null
          languages_spoken?: string[] | null
          linkedin_url?: string | null
          opening_hours?: Json | null
          other_services?: string | null
          payment_methods?: string[] | null
          phone?: string
          pickup_service?: boolean | null
          postal_code?: string
          pricing_info?: Json | null
          profile_image_url?: string | null
          repair_types?: string[] | null
          response_time?: string | null
          services_offered?: string[] | null
          shop_photos?: string[] | null
          siret_number?: string | null
          telegram_url?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          warranty_duration?: string | null
          website?: string | null
          whatsapp_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      repairer_subscriptions: {
        Row: {
          billing_cycle: string | null
          created_at: string
          email: string
          id: string
          popup_dismissed_until: string | null
          popup_never_show: boolean | null
          profile_id: string | null
          repairer_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_plan_id: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          email: string
          id?: string
          popup_dismissed_until?: string | null
          popup_never_show?: boolean | null
          profile_id?: string | null
          repairer_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_plan_id?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          email?: string
          id?: string
          popup_dismissed_until?: string | null
          popup_never_show?: boolean | null
          profile_id?: string | null
          repairer_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_plan_id?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repairer_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repairer_subscriptions_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      repairers: {
        Row: {
          address: string
          business_status: string | null
          city: string
          created_at: string
          department: string | null
          email: string | null
          id: string
          is_open: boolean | null
          is_verified: boolean | null
          lat: number | null
          lng: number | null
          name: string
          opening_hours: Json | null
          pappers_last_check: string | null
          pappers_verified: boolean | null
          phone: string | null
          postal_code: string
          price_range: string | null
          rating: number | null
          region: string | null
          response_time: string | null
          review_count: number | null
          scraped_at: string
          services: string[] | null
          siren: string | null
          siret: string | null
          source: string
          specialties: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          business_status?: string | null
          city: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_open?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          lng?: number | null
          name: string
          opening_hours?: Json | null
          pappers_last_check?: string | null
          pappers_verified?: boolean | null
          phone?: string | null
          postal_code: string
          price_range?: string | null
          rating?: number | null
          region?: string | null
          response_time?: string | null
          review_count?: number | null
          scraped_at?: string
          services?: string[] | null
          siren?: string | null
          siret?: string | null
          source: string
          specialties?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          business_status?: string | null
          city?: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_open?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          opening_hours?: Json | null
          pappers_last_check?: string | null
          pappers_verified?: boolean | null
          phone?: string | null
          postal_code?: string
          price_range?: string | null
          rating?: number | null
          region?: string | null
          response_time?: string | null
          review_count?: number | null
          scraped_at?: string
          services?: string[] | null
          siren?: string | null
          siret?: string | null
          source?: string
          specialties?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          quote_id: string | null
          rating: number
          repairer_id: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          quote_id?: string | null
          rating: number
          repairer_id: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          quote_id?: string | null
          rating?: number
          repairer_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          items_added: number | null
          items_pappers_rejected: number | null
          items_pappers_verified: number | null
          items_scraped: number | null
          items_updated: number | null
          pappers_api_calls: number | null
          source: string
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          items_added?: number | null
          items_pappers_rejected?: number | null
          items_pappers_verified?: number | null
          items_scraped?: number | null
          items_updated?: number | null
          pappers_api_calls?: number | null
          source: string
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          items_added?: number | null
          items_pappers_rejected?: number | null
          items_pappers_verified?: number | null
          items_scraped?: number | null
          items_updated?: number | null
          pappers_api_calls?: number | null
          source?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      spare_parts: {
        Row: {
          category: string | null
          compatible_models: Json | null
          cost_price: number | null
          created_at: string
          id: string
          is_active: boolean | null
          min_stock_alert: number | null
          name: string
          part_number: string | null
          quality_grade: string | null
          selling_price: number | null
          stock_quantity: number | null
          supplier: string | null
          warranty_days: number | null
        }
        Insert: {
          category?: string | null
          compatible_models?: Json | null
          cost_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          min_stock_alert?: number | null
          name: string
          part_number?: string | null
          quality_grade?: string | null
          selling_price?: number | null
          stock_quantity?: number | null
          supplier?: string | null
          warranty_days?: number | null
        }
        Update: {
          category?: string | null
          compatible_models?: Json | null
          cost_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          min_stock_alert?: number | null
          name?: string
          part_number?: string | null
          quality_grade?: string | null
          selling_price?: number | null
          stock_quantity?: number | null
          supplier?: string | null
          warranty_days?: number | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          name: string
          price_monthly: number
          price_yearly: number
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          name: string
          price_monthly: number
          price_yearly: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          name?: string
          price_monthly?: number
          price_yearly?: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          end_time: string
          id: string
          is_booked: boolean | null
          repairer_id: string
          start_time: string
        }
        Insert: {
          end_time: string
          id?: string
          is_booked?: boolean | null
          repairer_id: string
          start_time: string
        }
        Update: {
          end_time?: string
          id?: string
          is_booked?: boolean | null
          repairer_id?: string
          start_time?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_subscription_overview: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          plan_name: string | null
          price_monthly: number | null
          price_yearly: number | null
          repairer_id: string | null
          subscribed: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_free_plan_to_repairer: {
        Args: { user_email: string; user_id: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      validate_and_use_promo_code: {
        Args: { promo_code_text: string }
        Returns: Json
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
