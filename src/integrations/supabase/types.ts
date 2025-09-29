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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ad_banners: {
        Row: {
          campaign_id: string | null
          created_at: string
          created_by: string | null
          current_clicks: number
          current_impressions: number
          daily_budget: number | null
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean
          max_clicks: number | null
          max_impressions: number | null
          start_date: string | null
          target_type: string
          target_url: string
          targeting_config: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          current_clicks?: number
          current_impressions?: number
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          max_clicks?: number | null
          max_impressions?: number | null
          start_date?: string | null
          target_type: string
          target_url: string
          targeting_config?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          current_clicks?: number
          current_impressions?: number
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          max_clicks?: number | null
          max_impressions?: number | null
          start_date?: string | null
          target_type?: string
          target_url?: string
          targeting_config?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_banners_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_campaigns: {
        Row: {
          budget_daily: number
          budget_spent: number
          budget_total: number
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string
          status: string
          targeting_config: Json
          updated_at: string
        }
        Insert: {
          budget_daily?: number
          budget_spent?: number
          budget_total?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date: string
          status?: string
          targeting_config?: Json
          updated_at?: string
        }
        Update: {
          budget_daily?: number
          budget_spent?: number
          budget_total?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string
          status?: string
          targeting_config?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ad_clicks: {
        Row: {
          banner_id: string
          created_at: string
          id: string
          impression_id: string | null
          ip_address: unknown | null
          placement: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          banner_id: string
          created_at?: string
          id?: string
          impression_id?: string | null
          ip_address?: unknown | null
          placement: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          banner_id?: string
          created_at?: string
          id?: string
          impression_id?: string | null
          ip_address?: unknown | null
          placement?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_clicks_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "ad_banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_clicks_impression_id_fkey"
            columns: ["impression_id"]
            isOneToOne: false
            referencedRelation: "ad_impressions"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_impressions: {
        Row: {
          banner_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          placement: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          banner_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          placement: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          banner_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          placement?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "ad_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_analytics: {
        Row: {
          date: string
          id: string
          metric_data: Json
          metric_type: string
          repairer_id: string | null
          timestamp: string
          value: number | null
        }
        Insert: {
          date?: string
          id?: string
          metric_data?: Json
          metric_type: string
          repairer_id?: string | null
          timestamp?: string
          value?: number | null
        }
        Update: {
          date?: string
          id?: string
          metric_data?: Json
          metric_type?: string
          repairer_id?: string | null
          timestamp?: string
          value?: number | null
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_user_id: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          severity_level: string
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_user_id: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          severity_level?: string
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_user_id?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          severity_level?: string
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_quote_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string
          id: string
          notes: string | null
          quote_id: string
          status: string
          target_repairer_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          quote_id: string
          status?: string
          target_repairer_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          quote_id?: string
          status?: string
          target_repairer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_quote_assignments_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes_with_timeline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_quote_assignments_target_repairer_id_fkey"
            columns: ["target_repairer_id"]
            isOneToOne: false
            referencedRelation: "repairer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_quote_assignments_target_repairer_id_fkey"
            columns: ["target_repairer_id"]
            isOneToOne: false
            referencedRelation: "repairer_profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      advanced_targeting_segments: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          estimated_reach: number | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description?: string | null
          estimated_reach?: number | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          estimated_reach?: number | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      advertising_analytics: {
        Row: {
          campaign_id: string | null
          channel: string
          clicks: number | null
          conversions: number | null
          cost: number | null
          cpc: number | null
          created_at: string
          creative_id: string | null
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          revenue: number | null
          roas: number | null
        }
        Insert: {
          campaign_id?: string | null
          channel: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          cpc?: number | null
          created_at?: string
          creative_id?: string | null
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          revenue?: number | null
          roas?: number | null
        }
        Update: {
          campaign_id?: string | null
          channel?: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          cpc?: number | null
          created_at?: string
          creative_id?: string | null
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          revenue?: number | null
          roas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "advertising_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "advertising_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advertising_analytics_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "campaign_creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      advertising_budgets: {
        Row: {
          auto_optimization: boolean | null
          budget_allocated: number
          budget_spent: number
          campaign_id: string | null
          channel: string
          created_at: string
          id: string
          optimization_rules: Json | null
          updated_at: string
        }
        Insert: {
          auto_optimization?: boolean | null
          budget_allocated?: number
          budget_spent?: number
          campaign_id?: string | null
          channel: string
          created_at?: string
          id?: string
          optimization_rules?: Json | null
          updated_at?: string
        }
        Update: {
          auto_optimization?: boolean | null
          budget_allocated?: number
          budget_spent?: number
          campaign_id?: string | null
          channel?: string
          created_at?: string
          id?: string
          optimization_rules?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertising_budgets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "advertising_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      advertising_campaigns: {
        Row: {
          auto_optimization: boolean | null
          budget_daily: number
          budget_spent: number
          budget_total: number
          campaign_type: string
          channels: Json
          created_at: string
          creative_style: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          repairer_id: string
          start_date: string | null
          status: string
          targeting_config: Json
          updated_at: string
        }
        Insert: {
          auto_optimization?: boolean | null
          budget_daily?: number
          budget_spent?: number
          budget_total?: number
          campaign_type?: string
          channels?: Json
          created_at?: string
          creative_style?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          repairer_id: string
          start_date?: string | null
          status?: string
          targeting_config?: Json
          updated_at?: string
        }
        Update: {
          auto_optimization?: boolean | null
          budget_daily?: number
          budget_spent?: number
          budget_total?: number
          campaign_type?: string
          channels?: Json
          created_at?: string
          creative_style?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          repairer_id?: string
          start_date?: string | null
          status?: string
          targeting_config?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ai_campaign_templates: {
        Row: {
          ai_model: string | null
          created_at: string
          creative_style: string
          generation_prompt: string | null
          id: string
          is_active: boolean | null
          name: string
          performance_score: number | null
          repairer_id: string | null
          template_data: Json
          template_type: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          ai_model?: string | null
          created_at?: string
          creative_style: string
          generation_prompt?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          performance_score?: number | null
          repairer_id?: string | null
          template_data?: Json
          template_type: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          ai_model?: string | null
          created_at?: string
          creative_style?: string
          generation_prompt?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          performance_score?: number | null
          repairer_id?: string | null
          template_data?: Json
          template_type?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      ai_enhancements: {
        Row: {
          ai_model: string
          confidence_score: number | null
          created_at: string | null
          enhancement_type: string
          error_message: string | null
          id: string
          input_data: Json
          metadata: Json | null
          output_data: Json
          processing_time_ms: number | null
          repairer_id: string | null
          success: boolean | null
        }
        Insert: {
          ai_model: string
          confidence_score?: number | null
          created_at?: string | null
          enhancement_type: string
          error_message?: string | null
          id?: string
          input_data?: Json
          metadata?: Json | null
          output_data?: Json
          processing_time_ms?: number | null
          repairer_id?: string | null
          success?: boolean | null
        }
        Update: {
          ai_model?: string
          confidence_score?: number | null
          created_at?: string | null
          enhancement_type?: string
          error_message?: string | null
          id?: string
          input_data?: Json
          metadata?: Json | null
          output_data?: Json
          processing_time_ms?: number | null
          repairer_id?: string | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_enhancements_repairer_id_fkey"
            columns: ["repairer_id"]
            isOneToOne: false
            referencedRelation: "repairers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_enhancements_repairer_id_fkey"
            columns: ["repairer_id"]
            isOneToOne: false
            referencedRelation: "repairers_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_forecasting: {
        Row: {
          accuracy_score: number | null
          actual_values: Json | null
          confidence_score: number | null
          created_at: string | null
          forecast_type: string
          id: string
          model_version: string | null
          period_end: string
          period_start: string
          predicted_values: Json
          repairer_id: string
        }
        Insert: {
          accuracy_score?: number | null
          actual_values?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          forecast_type: string
          id?: string
          model_version?: string | null
          period_end: string
          period_start: string
          predicted_values: Json
          repairer_id: string
        }
        Update: {
          accuracy_score?: number | null
          actual_values?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          forecast_type?: string
          id?: string
          model_version?: string | null
          period_end?: string
          period_start?: string
          predicted_values?: Json
          repairer_id?: string
        }
        Relationships: []
      }
      ai_generated_content: {
        Row: {
          ai_model: string
          content_type: string
          created_at: string
          generated_content: Json
          generation_cost: number | null
          generation_prompt: string
          id: string
          quality_score: number | null
          repairer_id: string
          source_item_id: string | null
          style_used: string | null
          usage_count: number | null
        }
        Insert: {
          ai_model: string
          content_type: string
          created_at?: string
          generated_content?: Json
          generation_cost?: number | null
          generation_prompt: string
          id?: string
          quality_score?: number | null
          repairer_id: string
          source_item_id?: string | null
          style_used?: string | null
          usage_count?: number | null
        }
        Update: {
          ai_model?: string
          content_type?: string
          created_at?: string
          generated_content?: Json
          generation_cost?: number | null
          generation_prompt?: string
          id?: string
          quality_score?: number | null
          repairer_id?: string
          source_item_id?: string | null
          style_used?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
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
      ai_product_suggestions: {
        Row: {
          confidence_score: number
          created_at: string | null
          frequency_count: number | null
          id: string
          is_active: boolean | null
          last_suggested: string | null
          primary_product_id: string
          suggested_product_id: string
          suggestion_type: string
        }
        Insert: {
          confidence_score: number
          created_at?: string | null
          frequency_count?: number | null
          id?: string
          is_active?: boolean | null
          last_suggested?: string | null
          primary_product_id: string
          suggested_product_id: string
          suggestion_type: string
        }
        Update: {
          confidence_score?: number
          created_at?: string | null
          frequency_count?: number | null
          id?: string
          is_active?: boolean | null
          last_suggested?: string | null
          primary_product_id?: string
          suggested_product_id?: string
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_product_suggestions_primary_product_id_fkey"
            columns: ["primary_product_id"]
            isOneToOne: false
            referencedRelation: "pos_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_product_suggestions_suggested_product_id_fkey"
            columns: ["suggested_product_id"]
            isOneToOne: false
            referencedRelation: "pos_inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_quote_analyses: {
        Row: {
          ai_model: string | null
          ai_reasoning: string | null
          alternative_solutions: Json | null
          confidence_score: number | null
          created_at: string
          device_info: Json
          id: string
          processing_time_ms: number | null
          quote_id: string | null
          suggested_price: number | null
        }
        Insert: {
          ai_model?: string | null
          ai_reasoning?: string | null
          alternative_solutions?: Json | null
          confidence_score?: number | null
          created_at?: string
          device_info: Json
          id?: string
          processing_time_ms?: number | null
          quote_id?: string | null
          suggested_price?: number | null
        }
        Update: {
          ai_model?: string | null
          ai_reasoning?: string | null
          alternative_solutions?: Json | null
          confidence_score?: number | null
          created_at?: string
          device_info?: Json
          id?: string
          processing_time_ms?: number | null
          quote_id?: string | null
          suggested_price?: number | null
        }
        Relationships: []
      }
      ai_quote_templates: {
        Row: {
          ai_confidence: number | null
          base_price: number
          brand: string
          created_at: string
          device_type: string
          difficulty_level: string
          estimated_duration_minutes: number
          id: string
          is_active: boolean
          labor_cost: number
          parts_cost: number
          performance_score: number | null
          repair_type: string
          repairer_id: string
          success_rate: number | null
          updated_at: string
          usage_count: number | null
          warranty_days: number | null
        }
        Insert: {
          ai_confidence?: number | null
          base_price: number
          brand: string
          created_at?: string
          device_type: string
          difficulty_level: string
          estimated_duration_minutes: number
          id?: string
          is_active?: boolean
          labor_cost: number
          parts_cost: number
          performance_score?: number | null
          repair_type: string
          repairer_id: string
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
          warranty_days?: number | null
        }
        Update: {
          ai_confidence?: number | null
          base_price?: number
          brand?: string
          created_at?: string
          device_type?: string
          difficulty_level?: string
          estimated_duration_minutes?: number
          id?: string
          is_active?: boolean
          labor_cost?: number
          parts_cost?: number
          performance_score?: number | null
          repair_type?: string
          repairer_id?: string
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
          warranty_days?: number | null
        }
        Relationships: []
      }
      ai_suggestions: {
        Row: {
          action_steps: string[] | null
          confidence: number | null
          created_at: string | null
          description: string
          estimated_time: number | null
          expected_change: number | null
          id: string
          impact_metric: string | null
          implemented_at: string | null
          priority: string | null
          repairer_id: string
          resources: string[] | null
          status: string | null
          suggestion_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          action_steps?: string[] | null
          confidence?: number | null
          created_at?: string | null
          description: string
          estimated_time?: number | null
          expected_change?: number | null
          id?: string
          impact_metric?: string | null
          implemented_at?: string | null
          priority?: string | null
          repairer_id: string
          resources?: string[] | null
          status?: string | null
          suggestion_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          action_steps?: string[] | null
          confidence?: number | null
          created_at?: string | null
          description?: string
          estimated_time?: number | null
          expected_change?: number | null
          id?: string
          impact_metric?: string | null
          implemented_at?: string | null
          priority?: string | null
          repairer_id?: string
          resources?: string[] | null
          status?: string | null
          suggestion_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
      api_endpoints: {
        Row: {
          created_at: string
          endpoint_name: string
          endpoint_url: string
          id: string
          is_active: boolean
          method: string
          rate_limit: number | null
        }
        Insert: {
          created_at?: string
          endpoint_name: string
          endpoint_url: string
          id?: string
          is_active?: boolean
          method?: string
          rate_limit?: number | null
        }
        Update: {
          created_at?: string
          endpoint_name?: string
          endpoint_url?: string
          id?: string
          is_active?: boolean
          method?: string
          rate_limit?: number | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          api_key_hash: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_name: string
          last_used: string | null
          permissions: Json | null
          repairer_id: string
          updated_at: string
        }
        Insert: {
          api_key_hash: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name: string
          last_used?: string | null
          permissions?: Json | null
          repairer_id: string
          updated_at?: string
        }
        Update: {
          api_key_hash?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          last_used?: string | null
          permissions?: Json | null
          repairer_id?: string
          updated_at?: string
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
      audit_cleanup_config: {
        Row: {
          auto_cleanup_enabled: boolean
          created_at: string
          days_to_keep: number
          id: string
          last_cleanup: string | null
          updated_at: string
        }
        Insert: {
          auto_cleanup_enabled?: boolean
          created_at?: string
          days_to_keep?: number
          id?: string
          last_cleanup?: string | null
          updated_at?: string
        }
        Update: {
          auto_cleanup_enabled?: boolean
          created_at?: string
          days_to_keep?: number
          id?: string
          last_cleanup?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          repairer_id: string | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          repairer_id?: string | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          repairer_id?: string | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automated_campaigns: {
        Row: {
          campaign_id: string | null
          campaign_type: string
          created_at: string
          id: string
          is_active: boolean
          last_executed: string | null
          next_execution: string | null
          rules: Json
          triggers: Json
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          campaign_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_executed?: string | null
          next_execution?: string | null
          rules?: Json
          triggers?: Json
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          campaign_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_executed?: string | null
          next_execution?: string | null
          rules?: Json
          triggers?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automated_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      available_features: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          feature_key: string
          feature_name: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          feature_key: string
          feature_name: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          feature_key?: string
          feature_name?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          author_email: string | null
          author_id: string | null
          author_name: string | null
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          author_email?: string | null
          author_id?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          author_email?: string | null
          author_id?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_generation_templates: {
        Row: {
          ai_model: string | null
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          prompt_template: string
          updated_at: string
          visibility: string
        }
        Insert: {
          ai_model?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          prompt_template: string
          updated_at?: string
          visibility: string
        }
        Update: {
          ai_model?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          prompt_template?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_generation_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          ai_generated: boolean | null
          ai_model: string | null
          author_id: string | null
          category_id: string | null
          comment_count: number | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          generation_prompt: string | null
          id: string
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          scheduled_at: string | null
          share_count: number | null
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number | null
          visibility: string
        }
        Insert: {
          ai_generated?: boolean | null
          ai_model?: string | null
          author_id?: string | null
          category_id?: string | null
          comment_count?: number | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          generation_prompt?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          share_count?: number | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number | null
          visibility?: string
        }
        Update: {
          ai_generated?: boolean | null
          ai_model?: string | null
          author_id?: string | null
          category_id?: string | null
          comment_count?: number | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          generation_prompt?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          share_count?: number | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_scheduling: {
        Row: {
          auto_publish: boolean | null
          created_at: string
          custom_cron: string | null
          frequency: string
          id: string
          is_active: boolean | null
          next_execution: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          auto_publish?: boolean | null
          created_at?: string
          custom_cron?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          next_execution?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          auto_publish?: boolean | null
          created_at?: string
          custom_cron?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_execution?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_scheduling_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "blog_generation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_social_shares: {
        Row: {
          id: string
          platform: string
          post_id: string | null
          shared_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          platform: string
          post_id?: string | null
          shared_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          platform?: string
          post_id?: string | null
          shared_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_social_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_social_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      business_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          scraping_prompts: Json | null
          search_keywords: string[] | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          scraping_prompts?: Json | null
          search_keywords?: string[] | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          scraping_prompts?: Json | null
          search_keywords?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      business_metrics: {
        Row: {
          created_at: string
          current_value: number | null
          data_source: string
          id: string
          last_checked: string | null
          metric_name: string
          metric_type: string
          repairer_id: string
          target_value: number | null
          threshold_critical: number | null
          threshold_warning: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          data_source: string
          id?: string
          last_checked?: string | null
          metric_name: string
          metric_type: string
          repairer_id: string
          target_value?: number | null
          threshold_critical?: number | null
          threshold_warning?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          data_source?: string
          id?: string
          last_checked?: string | null
          metric_name?: string
          metric_type?: string
          repairer_id?: string
          target_value?: number | null
          threshold_critical?: number | null
          threshold_warning?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      campaign_banners: {
        Row: {
          banner_id: string
          campaign_id: string
          created_at: string
          id: string
          is_active: boolean
          weight: number
        }
        Insert: {
          banner_id: string
          campaign_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          weight?: number
        }
        Update: {
          banner_id?: string
          campaign_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_banners_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "ad_banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_banners_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_creatives: {
        Row: {
          ai_generated: boolean
          campaign_id: string | null
          created_at: string
          created_by: string | null
          creative_data: Json
          creative_type: string
          creative_url: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          performance_score: number | null
          status: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          creative_data?: Json
          creative_type: string
          creative_url?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          performance_score?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          creative_data?: Json
          creative_type?: string
          creative_url?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          performance_score?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_performance_metrics: {
        Row: {
          campaign_id: string | null
          clicks: number
          conversions: number
          cost: number
          created_at: string
          date: string
          geo_zone_id: string | null
          id: string
          impressions: number
          revenue: number
          segment_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicks?: number
          conversions?: number
          cost?: number
          created_at?: string
          date?: string
          geo_zone_id?: string | null
          id?: string
          impressions?: number
          revenue?: number
          segment_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicks?: number
          conversions?: number
          cost?: number
          created_at?: string
          date?: string
          geo_zone_id?: string | null
          id?: string
          impressions?: number
          revenue?: number
          segment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_performance_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_performance_metrics_geo_zone_id_fkey"
            columns: ["geo_zone_id"]
            isOneToOne: false
            referencedRelation: "geo_targeting_zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_performance_metrics_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "advanced_targeting_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_schedules: {
        Row: {
          campaign_id: string | null
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          last_executed_at: string | null
          next_execution_at: string | null
          schedule_config: Json
          schedule_type: string
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          frequency: string
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          next_execution_at?: string | null
          schedule_config?: Json
          schedule_type?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          next_execution_at?: string | null
          schedule_config?: Json
          schedule_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_schedules_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "advertising_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_variants: {
        Row: {
          campaign_id: string | null
          created_at: string
          id: string
          is_active: boolean
          performance_metrics: Json
          traffic_split: number
          variant_data: Json
          variant_name: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          performance_metrics?: Json
          traffic_split?: number
          variant_data?: Json
          variant_name: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          performance_metrics?: Json
          traffic_split?: number
          variant_data?: Json
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_variants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          last_sync: string | null
          price: number | null
          repairer_id: string
          sku: string | null
          stock_quantity: number
          sync_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          last_sync?: string | null
          price?: number | null
          repairer_id: string
          sku?: string | null
          stock_quantity?: number
          sync_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          last_sync?: string | null
          price?: number | null
          repairer_id?: string
          sku?: string | null
          stock_quantity?: number
          sync_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      catalog_sync_status: {
        Row: {
          auto_sync: boolean
          created_at: string
          error_items: number
          id: string
          last_sync: string | null
          pending_items: number
          repairer_id: string
          sync_interval: number
          synced_items: number
          total_items: number
          updated_at: string
        }
        Insert: {
          auto_sync?: boolean
          created_at?: string
          error_items?: number
          id?: string
          last_sync?: string | null
          pending_items?: number
          repairer_id: string
          sync_interval?: number
          synced_items?: number
          total_items?: number
          updated_at?: string
        }
        Update: {
          auto_sync?: boolean
          created_at?: string
          error_items?: number
          id?: string
          last_sync?: string | null
          pending_items?: number
          repairer_id?: string
          sync_interval?: number
          synced_items?: number
          total_items?: number
          updated_at?: string
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
      chatbot_analytics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
        }
        Relationships: []
      }
      chatbot_configuration: {
        Row: {
          config_key: string
          config_value: Json
          description: string | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      chatbot_conversations: {
        Row: {
          completed_at: string | null
          context: Json | null
          created_at: string | null
          id: string
          satisfaction_score: number | null
          session_id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
          user_type: string | null
        }
        Insert: {
          completed_at?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          satisfaction_score?: number | null
          session_id: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Update: {
          completed_at?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          satisfaction_score?: number | null
          session_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      chatbot_feedback: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          feedback_text: string | null
          feedback_type: string
          id: string
          message_id: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          feedback_text?: string | null
          feedback_type: string
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          feedback_text?: string | null
          feedback_type?: string
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chatbot_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_improvement_suggestions: {
        Row: {
          admin_reviewed: boolean | null
          ai_confidence: number | null
          conversation_id: string | null
          created_at: string | null
          id: string
          implemented: boolean | null
          original_message: string
          reviewed_at: string | null
          suggested_response: string
          suggestion_type: string
        }
        Insert: {
          admin_reviewed?: boolean | null
          ai_confidence?: number | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          implemented?: boolean | null
          original_message: string
          reviewed_at?: string | null
          suggested_response: string
          suggestion_type: string
        }
        Update: {
          admin_reviewed?: boolean | null
          ai_confidence?: number | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          implemented?: boolean | null
          original_message?: string
          reviewed_at?: string | null
          suggested_response?: string
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_improvement_suggestions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_learning_history: {
        Row: {
          applied_by: string | null
          change_type: string
          created_at: string | null
          id: string
          new_data: Json | null
          original_data: Json | null
          performance_impact: number | null
        }
        Insert: {
          applied_by?: string | null
          change_type: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          original_data?: Json | null
          performance_impact?: number | null
        }
        Update: {
          applied_by?: string | null
          change_type?: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          original_data?: Json | null
          performance_impact?: number | null
        }
        Relationships: []
      }
      chatbot_learning_patterns: {
        Row: {
          category: string
          confidence_score: number | null
          created_at: string | null
          id: string
          input_pattern: string
          last_used: string | null
          success_rate: number | null
          successful_response: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          input_pattern: string
          last_used?: string | null
          success_rate?: number | null
          successful_response: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          input_pattern?: string
          last_used?: string | null
          success_rate?: number | null
          successful_response?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      chatbot_messages: {
        Row: {
          confidence_score: number | null
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          sender_type: string
        }
        Insert: {
          confidence_score?: number | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          sender_type: string
        }
        Update: {
          confidence_score?: number | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_response_feedback: {
        Row: {
          comment: string | null
          conversation_id: string | null
          created_at: string | null
          feedback_type: string
          id: string
          message_id: string | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          conversation_id?: string | null
          created_at?: string | null
          feedback_type: string
          id?: string
          message_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          conversation_id?: string | null
          created_at?: string | null
          feedback_type?: string
          id?: string
          message_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_response_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_response_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chatbot_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_training_data: {
        Row: {
          brand: string | null
          category: string
          confidence_threshold: number | null
          created_at: string | null
          device_type: string | null
          id: string
          intent: string
          is_active: boolean | null
          metadata: Json | null
          model: string | null
          repair_type: string | null
          response_template: string
          training_text: string
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          confidence_threshold?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          intent: string
          is_active?: boolean | null
          metadata?: Json | null
          model?: string | null
          repair_type?: string | null
          response_template: string
          training_text: string
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          confidence_threshold?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          intent?: string
          is_active?: boolean | null
          metadata?: Json | null
          model?: string | null
          repair_type?: string | null
          response_template?: string
          training_text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chorus_pro_submissions: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          invoice_id: string
          response_data: Json | null
          retry_count: number | null
          status: string
          submission_id: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          invoice_id: string
          response_data?: Json | null
          retry_count?: number | null
          status?: string
          submission_id?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          invoice_id?: string
          response_data?: Json | null
          retry_count?: number | null
          status?: string
          submission_id?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chorus_pro_submissions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "electronic_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      client_favorites: {
        Row: {
          client_id: string
          created_at: string
          id: string
          repairer_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          repairer_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          repairer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_favorites_repairer_id_fkey"
            columns: ["repairer_id"]
            isOneToOne: false
            referencedRelation: "repairers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_favorites_repairer_id_fkey"
            columns: ["repairer_id"]
            isOneToOne: false
            referencedRelation: "repairers_safe"
            referencedColumns: ["id"]
          },
        ]
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
      client_reviews: {
        Row: {
          client_id: string
          comment: string | null
          cons: string | null
          created_at: string | null
          criteria_ratings: Json
          helpful_count: number
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          overall_rating: number
          pros: string | null
          quote_id: string | null
          repairer_id: string
          status: string
          updated_at: string | null
          would_recommend: boolean | null
        }
        Insert: {
          client_id: string
          comment?: string | null
          cons?: string | null
          created_at?: string | null
          criteria_ratings?: Json
          helpful_count?: number
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          overall_rating: number
          pros?: string | null
          quote_id?: string | null
          repairer_id: string
          status?: string
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          client_id?: string
          comment?: string | null
          cons?: string | null
          created_at?: string | null
          criteria_ratings?: Json
          helpful_count?: number
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          overall_rating?: number
          pros?: string | null
          quote_id?: string | null
          repairer_id?: string
          status?: string
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "client_reviews_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes_with_timeline"
            referencedColumns: ["id"]
          },
        ]
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
      compliance_reports: {
        Row: {
          completed_at: string | null
          created_at: string
          file_url: string | null
          generated_by: string | null
          id: string
          report_data: Json | null
          report_name: string
          report_type: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          file_url?: string | null
          generated_by?: string | null
          id?: string
          report_data?: Json | null
          report_name: string
          report_type: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          file_url?: string | null
          generated_by?: string | null
          id?: string
          report_data?: Json | null
          report_name?: string
          report_type?: string
          status?: string
        }
        Relationships: []
      }
      configuration_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean
          template_data: Json
          template_name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          template_data?: Json
          template_name: string
          template_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          template_data?: Json
          template_name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      connection_analytics: {
        Row: {
          created_at: string
          device_info: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          location_info: Json | null
          session_duration: number | null
          session_id: string
          user_agent: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          location_info?: Json | null
          session_duration?: number | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location_info?: Json | null
          session_duration?: number | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          sender_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          client_id: string
          created_at: string
          id: string
          quote_id: string | null
          repairer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          quote_id?: string | null
          repairer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          quote_id?: string | null
          repairer_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_activities: {
        Row: {
          activity_type: string
          confidence: number | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          direction: string | null
          entities: Json | null
          id: string
          intent: string | null
          message: string | null
          metadata: Json | null
          owner_id: string
          updated_at: string
        }
        Insert: {
          activity_type?: string
          confidence?: number | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          direction?: string | null
          entities?: Json | null
          id?: string
          intent?: string | null
          message?: string | null
          metadata?: Json | null
          owner_id: string
          updated_at?: string
        }
        Update: {
          activity_type?: string
          confidence?: number | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          direction?: string | null
          entities?: Json | null
          id?: string
          intent?: string | null
          message?: string | null
          metadata?: Json | null
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_companies: {
        Row: {
          address: string | null
          created_at: string
          domain: string | null
          id: string
          name: string
          owner_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          name: string
          owner_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          name?: string
          owner_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_contacts: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          first_name: string | null
          gdpr_consent: boolean
          id: string
          last_name: string | null
          origin: string | null
          owner_id: string
          phone: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          gdpr_consent?: boolean
          id?: string
          last_name?: string | null
          origin?: string | null
          owner_id: string
          phone?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          gdpr_consent?: boolean
          id?: string
          last_name?: string | null
          origin?: string | null
          owner_id?: string
          phone?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_conversation_links: {
        Row: {
          activity_id: string
          created_at: string
          external_id: string | null
          external_source: string | null
          id: string
          owner_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_conversation_links_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "crm_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deal_stages: {
        Row: {
          created_at: string
          id: string
          name: string
          order_index: number
          owner_id: string
          pipeline_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_index?: number
          owner_id: string
          pipeline_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_index?: number
          owner_id?: string
          pipeline_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "crm_pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          amount: number | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          currency: string
          expected_close_date: string | null
          id: string
          owner_id: string
          pipeline_id: string | null
          source: string | null
          stage_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string
          expected_close_date?: string | null
          id?: string
          owner_id: string
          pipeline_id?: string | null
          source?: string | null
          stage_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string
          expected_close_date?: string | null
          id?: string
          owner_id?: string
          pipeline_id?: string | null
          source?: string | null
          stage_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "crm_pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "crm_deal_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipelines: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_tasks: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          owner_id: string
          priority: string
          related_id: string | null
          related_type: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          owner_id: string
          priority?: string
          related_id?: string | null
          related_type?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          owner_id?: string
          priority?: string
          related_id?: string | null
          related_type?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_quality_metrics: {
        Row: {
          accuracy_score: number | null
          calculated_at: string | null
          completeness_score: number | null
          consistency_score: number | null
          id: string
          improvements_suggested: Json | null
          issues_detected: Json | null
          overall_score: number | null
          repairer_id: string | null
        }
        Insert: {
          accuracy_score?: number | null
          calculated_at?: string | null
          completeness_score?: number | null
          consistency_score?: number | null
          id?: string
          improvements_suggested?: Json | null
          issues_detected?: Json | null
          overall_score?: number | null
          repairer_id?: string | null
        }
        Update: {
          accuracy_score?: number | null
          calculated_at?: string | null
          completeness_score?: number | null
          consistency_score?: number | null
          id?: string
          improvements_suggested?: Json | null
          issues_detected?: Json | null
          overall_score?: number | null
          repairer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_quality_metrics_repairer_id_fkey"
            columns: ["repairer_id"]
            isOneToOne: false
            referencedRelation: "repairers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_quality_metrics_repairer_id_fkey"
            columns: ["repairer_id"]
            isOneToOne: false
            referencedRelation: "repairers_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_history: {
        Row: {
          completed_at: string | null
          configuration_data: Json
          deployed_at: string
          deployed_by: string | null
          deployment_type: string
          error_message: string | null
          id: string
          rollback_data: Json | null
          status: string
          target_ids: string[] | null
          target_type: string
        }
        Insert: {
          completed_at?: string | null
          configuration_data: Json
          deployed_at?: string
          deployed_by?: string | null
          deployment_type: string
          error_message?: string | null
          id?: string
          rollback_data?: Json | null
          status?: string
          target_ids?: string[] | null
          target_type: string
        }
        Update: {
          completed_at?: string | null
          configuration_data?: Json
          deployed_at?: string
          deployed_by?: string | null
          deployment_type?: string
          error_message?: string | null
          id?: string
          rollback_data?: Json | null
          status?: string
          target_ids?: string[] | null
          target_type?: string
        }
        Relationships: []
      }
      detailed_audit_logs: {
        Row: {
          action_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      device_conditions: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
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
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      digital_police_logbook: {
        Row: {
          created_at: string
          export_date: string | null
          exported_to_police: boolean
          id: string
          product_description: Json
          purchase_amount: number
          repairer_id: string
          retention_until: string
          seller_identity: Json
          transaction_date: string
          transaction_id: string
          transaction_type: string
        }
        Insert: {
          created_at?: string
          export_date?: string | null
          exported_to_police?: boolean
          id?: string
          product_description: Json
          purchase_amount: number
          repairer_id: string
          retention_until?: string
          seller_identity: Json
          transaction_date: string
          transaction_id: string
          transaction_type?: string
        }
        Update: {
          created_at?: string
          export_date?: string | null
          exported_to_police?: boolean
          id?: string
          product_description?: Json
          purchase_amount?: number
          repairer_id?: string
          retention_until?: string
          seller_identity?: Json
          transaction_date?: string
          transaction_id?: string
          transaction_type?: string
        }
        Relationships: []
      }
      documentation_versions: {
        Row: {
          content_hash: string
          created_at: string
          doc_type: string
          download_count: number
          file_size: number
          generated_at: string
          id: string
          updated_at: string
          version: string
        }
        Insert: {
          content_hash: string
          created_at?: string
          doc_type: string
          download_count?: number
          file_size?: number
          generated_at?: string
          id?: string
          updated_at?: string
          version: string
        }
        Update: {
          content_hash?: string
          created_at?: string
          doc_type?: string
          download_count?: number
          file_size?: number
          generated_at?: string
          id?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      ecommerce_analytics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_date: string
          metric_type: string
          repairer_id: string
          value: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_type: string
          repairer_id: string
          value?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_type?: string
          repairer_id?: string
          value?: number | null
        }
        Relationships: []
      }
      ecommerce_customers: {
        Row: {
          created_at: string
          default_billing_address: Json | null
          default_shipping_address: Json | null
          email: string
          email_verified: boolean
          first_name: string | null
          id: string
          last_name: string | null
          marketing_consent: boolean
          phone: string | null
          repairer_id: string
          total_orders: number
          total_spent: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_billing_address?: Json | null
          default_shipping_address?: Json | null
          email: string
          email_verified?: boolean
          first_name?: string | null
          id?: string
          last_name?: string | null
          marketing_consent?: boolean
          phone?: string | null
          repairer_id: string
          total_orders?: number
          total_spent?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_billing_address?: Json | null
          default_shipping_address?: Json | null
          email?: string
          email_verified?: boolean
          first_name?: string | null
          id?: string
          last_name?: string | null
          marketing_consent?: boolean
          phone?: string | null
          repairer_id?: string
          total_orders?: number
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      ecommerce_integrations: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          is_active: boolean
          platform: string
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          updated_at?: string
        }
        Relationships: []
      }
      ecommerce_order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_sku?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ecommerce_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecommerce_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_products"
            referencedColumns: ["id"]
          },
        ]
      }
      ecommerce_orders: {
        Row: {
          billing_address: Json
          created_at: string
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_notes: string | null
          customer_phone: string | null
          delivered_at: string | null
          discount_amount: number
          fulfillment_status: string
          id: string
          internal_notes: string | null
          order_number: string
          order_status: string
          payment_method: string | null
          payment_status: string
          repairer_id: string
          shipped_at: string | null
          shipping_address: Json
          shipping_amount: number
          shipping_method: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax_amount: number
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          billing_address: Json
          created_at?: string
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_notes?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_amount?: number
          fulfillment_status?: string
          id?: string
          internal_notes?: string | null
          order_number: string
          order_status?: string
          payment_method?: string | null
          payment_status?: string
          repairer_id: string
          shipped_at?: string | null
          shipping_address: Json
          shipping_amount?: number
          shipping_method?: string | null
          stripe_payment_intent_id?: string | null
          subtotal: number
          tax_amount?: number
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: Json
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_amount?: number
          fulfillment_status?: string
          id?: string
          internal_notes?: string | null
          order_number?: string
          order_status?: string
          payment_method?: string | null
          payment_status?: string
          repairer_id?: string
          shipped_at?: string | null
          shipping_address?: Json
          shipping_amount?: number
          shipping_method?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ecommerce_products: {
        Row: {
          category: string | null
          compare_at_price: number | null
          cost_price: number | null
          created_at: string
          description: string | null
          dimensions: Json | null
          featured: boolean
          featured_image_url: string | null
          gallery_images: Json | null
          id: string
          inventory_sync_enabled: boolean
          last_synced_at: string | null
          manage_stock: boolean
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          name: string
          price: number
          repairer_id: string
          shipping_required: boolean
          short_description: string | null
          sku: string
          slug: string
          status: string
          stock_quantity: number
          stock_status: string
          tags: string[] | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          category?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          featured?: boolean
          featured_image_url?: string | null
          gallery_images?: Json | null
          id?: string
          inventory_sync_enabled?: boolean
          last_synced_at?: string | null
          manage_stock?: boolean
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          name: string
          price: number
          repairer_id: string
          shipping_required?: boolean
          short_description?: string | null
          sku: string
          slug: string
          status?: string
          stock_quantity?: number
          stock_status?: string
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          category?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          featured?: boolean
          featured_image_url?: string | null
          gallery_images?: Json | null
          id?: string
          inventory_sync_enabled?: boolean
          last_synced_at?: string | null
          manage_stock?: boolean
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          name?: string
          price?: number
          repairer_id?: string
          shipping_required?: boolean
          short_description?: string | null
          sku?: string
          slug?: string
          status?: string
          stock_quantity?: number
          stock_status?: string
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      ecommerce_settings: {
        Row: {
          created_at: string
          currency: string
          id: string
          minimum_order_amount: number | null
          payment_methods: Json | null
          repairer_id: string
          return_policy: string | null
          shipping_rates: Json | null
          shipping_zones: Json | null
          tax_rate: number | null
          terms_conditions: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          minimum_order_amount?: number | null
          payment_methods?: Json | null
          repairer_id: string
          return_policy?: string | null
          shipping_rates?: Json | null
          shipping_zones?: Json | null
          tax_rate?: number | null
          terms_conditions?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          minimum_order_amount?: number | null
          payment_methods?: Json | null
          repairer_id?: string
          return_policy?: string | null
          shipping_rates?: Json | null
          shipping_zones?: Json | null
          tax_rate?: number | null
          terms_conditions?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ecommerce_store_config: {
        Row: {
          address: Json | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          repairer_id: string
          store_description: string | null
          store_name: string
          store_url: string | null
          theme_settings: Json | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          repairer_id: string
          store_description?: string | null
          store_name: string
          store_url?: string | null
          theme_settings?: Json | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          repairer_id?: string
          store_description?: string | null
          store_name?: string
          store_url?: string | null
          theme_settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      ecommerce_stores: {
        Row: {
          conversion_rate: number | null
          created_at: string
          domain: string | null
          id: string
          last_activity: string | null
          monthly_orders: number | null
          monthly_revenue: number | null
          plan_type: string
          repairer_id: string
          status: string
          store_name: string
          store_settings: Json | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string
          domain?: string | null
          id?: string
          last_activity?: string | null
          monthly_orders?: number | null
          monthly_revenue?: number | null
          plan_type?: string
          repairer_id: string
          status?: string
          store_name: string
          store_settings?: Json | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string
          domain?: string | null
          id?: string
          last_activity?: string | null
          monthly_orders?: number | null
          monthly_revenue?: number | null
          plan_type?: string
          repairer_id?: string
          status?: string
          store_name?: string
          store_settings?: Json | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ecommerce_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_premium: boolean | null
          name: string
          preview_image_url: string | null
          template_data: Json
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          name: string
          preview_image_url?: string | null
          template_data?: Json
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          name?: string
          preview_image_url?: string | null
          template_data?: Json
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      edge_function_configs: {
        Row: {
          config: Json
          created_at: string
          function_name: string
          id: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          function_name: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          function_name?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      electronic_credit_notes: {
        Row: {
          amount_ht: number
          amount_ttc: number
          created_at: string
          credit_note_number: string
          id: string
          original_invoice_id: string
          reason: string
          repairer_id: string
          status: string
          tva_amount: number
          updated_at: string
        }
        Insert: {
          amount_ht: number
          amount_ttc: number
          created_at?: string
          credit_note_number: string
          id?: string
          original_invoice_id: string
          reason: string
          repairer_id: string
          status?: string
          tva_amount: number
          updated_at?: string
        }
        Update: {
          amount_ht?: number
          amount_ttc?: number
          created_at?: string
          credit_note_number?: string
          id?: string
          original_invoice_id?: string
          reason?: string
          repairer_id?: string
          status?: string
          tva_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "electronic_credit_notes_original_invoice_id_fkey"
            columns: ["original_invoice_id"]
            isOneToOne: false
            referencedRelation: "electronic_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      electronic_invoices: {
        Row: {
          amount_ht: number
          amount_ttc: number
          archived_at: string | null
          chorus_pro_id: string | null
          chorus_pro_status: string | null
          client_id: string
          created_at: string
          due_date: string | null
          electronic_signature: string | null
          format_type: string
          id: string
          invoice_date: string
          invoice_number: string
          invoice_type: string
          legal_archive_hash: string | null
          naf_code: string | null
          pdf_path: string | null
          quote_id: string | null
          repairer_id: string
          sent_at: string | null
          siret_client: string | null
          siret_repairer: string
          status: string
          tva_amount: number
          tva_number_client: string | null
          tva_number_repairer: string | null
          tva_rate: number
          updated_at: string
          validated_at: string | null
          xml_content: string | null
        }
        Insert: {
          amount_ht: number
          amount_ttc: number
          archived_at?: string | null
          chorus_pro_id?: string | null
          chorus_pro_status?: string | null
          client_id: string
          created_at?: string
          due_date?: string | null
          electronic_signature?: string | null
          format_type?: string
          id?: string
          invoice_date?: string
          invoice_number: string
          invoice_type?: string
          legal_archive_hash?: string | null
          naf_code?: string | null
          pdf_path?: string | null
          quote_id?: string | null
          repairer_id: string
          sent_at?: string | null
          siret_client?: string | null
          siret_repairer: string
          status?: string
          tva_amount: number
          tva_number_client?: string | null
          tva_number_repairer?: string | null
          tva_rate?: number
          updated_at?: string
          validated_at?: string | null
          xml_content?: string | null
        }
        Update: {
          amount_ht?: number
          amount_ttc?: number
          archived_at?: string | null
          chorus_pro_id?: string | null
          chorus_pro_status?: string | null
          client_id?: string
          created_at?: string
          due_date?: string | null
          electronic_signature?: string | null
          format_type?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_type?: string
          legal_archive_hash?: string | null
          naf_code?: string | null
          pdf_path?: string | null
          quote_id?: string | null
          repairer_id?: string
          sent_at?: string | null
          siret_client?: string | null
          siret_repairer?: string
          status?: string
          tva_amount?: number
          tva_number_client?: string | null
          tva_number_repairer?: string | null
          tva_rate?: number
          updated_at?: string
          validated_at?: string | null
          xml_content?: string | null
        }
        Relationships: []
      }
      electronic_invoices_chain: {
        Row: {
          created_at: string
          current_hash: string
          id: string
          invoice_data_snapshot: Json
          invoice_id: string
          previous_hash: string | null
          repairer_id: string
          sequence_number: number
          signature: string | null
        }
        Insert: {
          created_at?: string
          current_hash: string
          id?: string
          invoice_data_snapshot: Json
          invoice_id: string
          previous_hash?: string | null
          repairer_id: string
          sequence_number: number
          signature?: string | null
        }
        Update: {
          created_at?: string
          current_hash?: string
          id?: string
          invoice_data_snapshot?: Json
          invoice_id?: string
          previous_hash?: string | null
          repairer_id?: string
          sequence_number?: number
          signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "electronic_invoices_chain_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: true
            referencedRelation: "electronic_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      electronic_signatures: {
        Row: {
          client_address: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          id: string
          ip_address: string | null
          is_valid: boolean
          quote_id: string
          signature_data_url: string
          signed_at: string
          updated_at: string
          user_agent: string | null
          verification_hash: string
        }
        Insert: {
          client_address?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          is_valid?: boolean
          quote_id: string
          signature_data_url: string
          signed_at: string
          updated_at?: string
          user_agent?: string | null
          verification_hash: string
        }
        Update: {
          client_address?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          is_valid?: boolean
          quote_id?: string
          signature_data_url?: string
          signed_at?: string
          updated_at?: string
          user_agent?: string | null
          verification_hash?: string
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
      footer_configuration: {
        Row: {
          content: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          links: Json | null
          parent_id: string | null
          section_key: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          links?: Json | null
          parent_id?: string | null
          section_key: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          links?: Json | null
          parent_id?: string | null
          section_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "footer_configuration_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "footer_configuration"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_profiles: {
        Row: {
          achievements_earned: string[] | null
          badges_earned: string[] | null
          created_at: string
          current_level: number
          current_streak: number
          id: string
          last_activity_date: string | null
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements_earned?: string[] | null
          badges_earned?: string[] | null
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements_earned?: string[] | null
          badges_earned?: string[] | null
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gamification_rewards: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          reward_key: string
          reward_type: string
          title: string
          xp_requirement: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          reward_key: string
          reward_type: string
          title: string
          xp_requirement?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          reward_key?: string
          reward_type?: string
          title?: string
          xp_requirement?: number | null
        }
        Relationships: []
      }
      gamification_xp_history: {
        Row: {
          action_type: string | null
          created_at: string
          id: string
          metadata: Json | null
          reason: string | null
          user_id: string
          xp_amount: number
        }
        Insert: {
          action_type?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          user_id: string
          xp_amount: number
        }
        Update: {
          action_type?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
      geo_targeting_zones: {
        Row: {
          coordinates: Json | null
          created_at: string
          id: string
          is_active: boolean
          metadata: Json
          name: string
          polygons: Json | null
          type: string
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          polygons?: Json | null
          type: string
        }
        Update: {
          coordinates?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          polygons?: Json | null
          type?: string
        }
        Relationships: []
      }
      geocoding_history: {
        Row: {
          accuracy: string | null
          created_at: string | null
          geocoding_service: string | null
          id: string
          latitude: number | null
          longitude: number | null
          normalized_address: string | null
          original_address: string
          repairer_id: string | null
          response_data: Json | null
          success: boolean | null
        }
        Insert: {
          accuracy?: string | null
          created_at?: string | null
          geocoding_service?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          normalized_address?: string | null
          original_address: string
          repairer_id?: string | null
          response_data?: Json | null
          success?: boolean | null
        }
        Update: {
          accuracy?: string | null
          created_at?: string | null
          geocoding_service?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          normalized_address?: string | null
          original_address?: string
          repairer_id?: string | null
          response_data?: Json | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "geocoding_history_repairer_id_fkey"
            columns: ["repairer_id"]
            isOneToOne: false
            referencedRelation: "repairers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geocoding_history_repairer_id_fkey"
            columns: ["repairer_id"]
            isOneToOne: false
            referencedRelation: "repairers_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      global_ecommerce_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      global_pos_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      google_css_config: {
        Row: {
          activation_date: string | null
          created_at: string
          css_account_id: string | null
          css_provider: string | null
          id: string
          is_active: boolean
          repairer_id: string
          savings_percentage: number | null
          total_savings: number | null
          updated_at: string
        }
        Insert: {
          activation_date?: string | null
          created_at?: string
          css_account_id?: string | null
          css_provider?: string | null
          id?: string
          is_active?: boolean
          repairer_id: string
          savings_percentage?: number | null
          total_savings?: number | null
          updated_at?: string
        }
        Update: {
          activation_date?: string | null
          created_at?: string
          css_account_id?: string | null
          css_provider?: string | null
          id?: string
          is_active?: boolean
          repairer_id?: string
          savings_percentage?: number | null
          total_savings?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          integration_name: string
          last_sync: string | null
          provider: string
          repairer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          integration_name: string
          last_sync?: string | null
          provider: string
          repairer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          integration_name?: string
          last_sync?: string | null
          provider?: string
          repairer_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inter_store_transfers: {
        Row: {
          completion_date: string | null
          created_at: string | null
          from_location_id: string
          id: string
          item_reference: string
          notes: string | null
          quantity: number | null
          status: string | null
          to_location_id: string
          transfer_date: string | null
          transfer_type: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string | null
          from_location_id: string
          id?: string
          item_reference: string
          notes?: string | null
          quantity?: number | null
          status?: string | null
          to_location_id: string
          transfer_date?: string | null
          transfer_type: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string | null
          from_location_id?: string
          id?: string
          item_reference?: string
          notes?: string | null
          quantity?: number | null
          status?: string | null
          to_location_id?: string
          transfer_date?: string | null
          transfer_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inter_store_transfers_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "multi_location_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inter_store_transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "multi_location_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          brand: string | null
          category: string | null
          cost_price: number | null
          created_at: string
          current_stock: number
          description: string | null
          id: string
          is_active: boolean | null
          is_service: boolean | null
          last_restocked: string | null
          location: string | null
          max_stock_level: number | null
          maximum_stock: number | null
          min_stock_level: number
          minimum_stock: number | null
          model: string | null
          name: string
          product_id: string | null
          repairer_id: string
          selling_price: number
          sku: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          cost_price?: number | null
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_service?: boolean | null
          last_restocked?: string | null
          location?: string | null
          max_stock_level?: number | null
          maximum_stock?: number | null
          min_stock_level?: number
          minimum_stock?: number | null
          model?: string | null
          name: string
          product_id?: string | null
          repairer_id: string
          selling_price: number
          sku: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          cost_price?: number | null
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_service?: boolean | null
          last_restocked?: string | null
          location?: string | null
          max_stock_level?: number | null
          maximum_stock?: number | null
          min_stock_level?: number
          minimum_stock?: number | null
          model?: string | null
          name?: string
          product_id?: string | null
          repairer_id?: string
          selling_price?: number
          sku?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          product_sku: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          repairer_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          product_sku: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          repairer_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          product_sku?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          repairer_id?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          item_type: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          item_type?: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          item_type?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          appointment_id: string | null
          client_id: string
          created_at: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          pdf_url: string | null
          quote_id: string | null
          repairer_id: string
          status: string
          subtotal_amount: number
          tax_amount: number
          tax_rate: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          client_id: string
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          quote_id?: string | null
          repairer_id: string
          status?: string
          subtotal_amount?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          client_id?: string
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          quote_id?: string | null
          repairer_id?: string
          status?: string
          subtotal_amount?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments_with_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes_with_timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      irreparability_certificates: {
        Row: {
          archived_at: string | null
          certificate_number: string
          certificate_status: string
          client_address: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          device_brand: string
          device_imei: string | null
          device_model: string
          device_serial_number: string | null
          diagnostic_date: string
          diagnostic_description: string
          digital_signature_hash: string | null
          estimated_repair_cost: number | null
          id: string
          insurance_claim_number: string | null
          nf525_archive_hash: string | null
          pdf_url: string | null
          purchase_date: string | null
          purchase_price: number | null
          purchase_store: string | null
          repair_impossibility_reason: string
          repairer_id: string
          replacement_value: number | null
          technical_analysis: string
          technician_id: string
          updated_at: string
          warranty_status: string | null
        }
        Insert: {
          archived_at?: string | null
          certificate_number: string
          certificate_status?: string
          client_address?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          device_brand: string
          device_imei?: string | null
          device_model: string
          device_serial_number?: string | null
          diagnostic_date?: string
          diagnostic_description: string
          digital_signature_hash?: string | null
          estimated_repair_cost?: number | null
          id?: string
          insurance_claim_number?: string | null
          nf525_archive_hash?: string | null
          pdf_url?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          purchase_store?: string | null
          repair_impossibility_reason: string
          repairer_id: string
          replacement_value?: number | null
          technical_analysis: string
          technician_id: string
          updated_at?: string
          warranty_status?: string | null
        }
        Update: {
          archived_at?: string | null
          certificate_number?: string
          certificate_status?: string
          client_address?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          device_brand?: string
          device_imei?: string | null
          device_model?: string
          device_serial_number?: string | null
          diagnostic_date?: string
          diagnostic_description?: string
          digital_signature_hash?: string | null
          estimated_repair_cost?: number | null
          id?: string
          insurance_claim_number?: string | null
          nf525_archive_hash?: string | null
          pdf_url?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          purchase_store?: string | null
          repair_impossibility_reason?: string
          repairer_id?: string
          replacement_value?: number | null
          technical_analysis?: string
          technician_id?: string
          updated_at?: string
          warranty_status?: string | null
        }
        Relationships: []
      }
      irreparability_diagnostics: {
        Row: {
          certificate_id: string
          component_name: string
          component_state: string
          created_at: string
          estimated_repair_time: number | null
          failure_description: string
          id: string
          repair_feasibility: string
          spare_parts_availability: string | null
        }
        Insert: {
          certificate_id: string
          component_name: string
          component_state: string
          created_at?: string
          estimated_repair_time?: number | null
          failure_description: string
          id?: string
          repair_feasibility: string
          spare_parts_availability?: string | null
        }
        Update: {
          certificate_id?: string
          component_name?: string
          component_state?: string
          created_at?: string
          estimated_repair_time?: number | null
          failure_description?: string
          id?: string
          repair_feasibility?: string
          spare_parts_availability?: string | null
        }
        Relationships: []
      }
      irreparability_nf525_archive: {
        Row: {
          archived_at: string
          certificate_data: Json
          certificate_hash: string
          certificate_html: string
          certificate_id: string
          file_size_bytes: number
          id: string
          repairer_id: string
          retention_until: string
        }
        Insert: {
          archived_at?: string
          certificate_data: Json
          certificate_hash: string
          certificate_html: string
          certificate_id: string
          file_size_bytes?: number
          id?: string
          repairer_id: string
          retention_until?: string
        }
        Update: {
          archived_at?: string
          certificate_data?: Json
          certificate_hash?: string
          certificate_html?: string
          certificate_id?: string
          file_size_bytes?: number
          id?: string
          repairer_id?: string
          retention_until?: string
        }
        Relationships: []
      }
      landing_page_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          preview_image_url: string | null
          template_config: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_image_url?: string | null
          template_config?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_image_url?: string | null
          template_config?: Json
          updated_at?: string
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_type?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      local_seo_metrics: {
        Row: {
          average_position: number | null
          bounce_rate: number | null
          clicks: number | null
          conversions: number | null
          created_at: string
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          page_id: string
          time_on_page: number | null
        }
        Insert: {
          average_position?: number | null
          bounce_rate?: number | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          page_id: string
          time_on_page?: number | null
        }
        Update: {
          average_position?: number | null
          bounce_rate?: number | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          page_id?: string
          time_on_page?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "local_seo_metrics_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "local_seo_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      local_seo_pages: {
        Row: {
          ai_model: string | null
          average_rating: number | null
          city: string
          city_slug: string
          click_through_rate: number | null
          content_paragraph_1: string
          content_paragraph_2: string
          created_at: string
          cta_text: string
          generated_by_ai: boolean | null
          generation_prompt: string | null
          h1_title: string
          id: string
          is_published: boolean
          last_updated_content: string | null
          map_embed_url: string | null
          meta_description: string
          page_views: number | null
          repairer_count: number | null
          sample_testimonials: Json | null
          seo_score: number | null
          service_type: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          ai_model?: string | null
          average_rating?: number | null
          city: string
          city_slug: string
          click_through_rate?: number | null
          content_paragraph_1: string
          content_paragraph_2: string
          created_at?: string
          cta_text: string
          generated_by_ai?: boolean | null
          generation_prompt?: string | null
          h1_title: string
          id?: string
          is_published?: boolean
          last_updated_content?: string | null
          map_embed_url?: string | null
          meta_description: string
          page_views?: number | null
          repairer_count?: number | null
          sample_testimonials?: Json | null
          seo_score?: number | null
          service_type: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          ai_model?: string | null
          average_rating?: number | null
          city?: string
          city_slug?: string
          click_through_rate?: number | null
          content_paragraph_1?: string
          content_paragraph_2?: string
          created_at?: string
          cta_text?: string
          generated_by_ai?: boolean | null
          generation_prompt?: string | null
          h1_title?: string
          id?: string
          is_published?: boolean
          last_updated_content?: string | null
          map_embed_url?: string | null
          meta_description?: string
          page_views?: number | null
          repairer_count?: number | null
          sample_testimonials?: Json | null
          seo_score?: number | null
          service_type?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      local_seo_templates: {
        Row: {
          content_template: string
          created_at: string
          cta_text: string
          h1_template: string
          id: string
          is_active: boolean
          meta_description_template: string
          name: string
          service_type: string
          title_template: string
          updated_at: string
        }
        Insert: {
          content_template: string
          created_at?: string
          cta_text?: string
          h1_template: string
          id?: string
          is_active?: boolean
          meta_description_template: string
          name: string
          service_type: string
          title_template: string
          updated_at?: string
        }
        Update: {
          content_template?: string
          created_at?: string
          cta_text?: string
          h1_template?: string
          id?: string
          is_active?: boolean
          meta_description_template?: string
          name?: string
          service_type?: string
          title_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_id: string
          customer_name: string | null
          id: string
          lifetime_points: number | null
          repairer_id: string
          tier_level: string | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_id: string
          customer_name?: string | null
          id?: string
          lifetime_points?: number | null
          repairer_id: string
          tier_level?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_id?: string
          customer_name?: string | null
          id?: string
          lifetime_points?: number | null
          repairer_id?: string
          tier_level?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_program: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          points_per_euro: number | null
          program_name: string
          repairer_id: string
          updated_at: string | null
          welcome_bonus: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          points_per_euro?: number | null
          program_name?: string
          repairer_id: string
          updated_at?: string | null
          welcome_bonus?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          points_per_euro?: number | null
          program_name?: string
          repairer_id?: string
          updated_at?: string | null
          welcome_bonus?: number | null
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string | null
          customer_id: string
          description: string | null
          id: string
          order_reference: string | null
          points_amount: number
          repairer_id: string
          transaction_type: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          description?: string | null
          id?: string
          order_reference?: string | null
          points_amount: number
          repairer_id: string
          transaction_type: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          order_reference?: string | null
          points_amount?: number
          repairer_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "loyalty_points"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          campaign_name: string
          campaign_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          message_template: string
          repairer_id: string
          subject_template: string | null
          total_clicked: number | null
          total_opened: number | null
          total_sent: number | null
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          campaign_name: string
          campaign_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_template: string
          repairer_id: string
          subject_template?: string | null
          total_clicked?: number | null
          total_opened?: number | null
          total_sent?: number | null
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          campaign_name?: string
          campaign_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_template?: string
          repairer_id?: string
          subject_template?: string | null
          total_clicked?: number | null
          total_opened?: number | null
          total_sent?: number | null
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      module_data_migrations: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          migration_status: string
          migration_type: string
          module_type: string
          records_migrated: number | null
          repairer_id: string
          started_at: string | null
          total_records: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          migration_status?: string
          migration_type: string
          module_type: string
          records_migrated?: number | null
          repairer_id: string
          started_at?: string | null
          total_records?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          migration_status?: string
          migration_type?: string
          module_type?: string
          records_migrated?: number | null
          repairer_id?: string
          started_at?: string | null
          total_records?: number | null
        }
        Relationships: []
      }
      module_pricing: {
        Row: {
          billing_cycle: string
          id: string
          module_price: number
          module_type: string
          updated_at: string | null
        }
        Insert: {
          billing_cycle: string
          id?: string
          module_price: number
          module_type: string
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string
          id?: string
          module_price?: number
          module_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      module_subscriptions: {
        Row: {
          activated_at: string | null
          auto_renewal: boolean
          billing_cycle: string
          created_at: string
          expires_at: string | null
          id: string
          module_active: boolean
          module_price: number
          module_type: string
          payment_status: string
          repairer_id: string
          stripe_subscription_id: string | null
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          auto_renewal?: boolean
          billing_cycle?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          module_active?: boolean
          module_price: number
          module_type: string
          payment_status?: string
          repairer_id: string
          stripe_subscription_id?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          auto_renewal?: boolean
          billing_cycle?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          module_active?: boolean
          module_price?: number
          module_type?: string
          payment_status?: string
          repairer_id?: string
          stripe_subscription_id?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      monitor_incidents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          monitor_id: string
          notifications_sent: Json | null
          resolved_at: string | null
          severity: string
          started_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          monitor_id: string
          notifications_sent?: Json | null
          resolved_at?: string | null
          severity?: string
          started_at?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          monitor_id?: string
          notifications_sent?: Json | null
          resolved_at?: string | null
          severity?: string
          started_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_incidents_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_results: {
        Row: {
          checked_at: string
          error_message: string | null
          id: string
          location: string | null
          metadata: Json | null
          monitor_id: string
          response_time_ms: number | null
          status: string
          status_code: number | null
        }
        Insert: {
          checked_at?: string
          error_message?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          monitor_id: string
          response_time_ms?: number | null
          status: string
          status_code?: number | null
        }
        Update: {
          checked_at?: string
          error_message?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          monitor_id?: string
          response_time_ms?: number | null
          status?: string
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monitor_results_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
        ]
      }
      monitored_urls: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_check: string | null
          priority: number
          reference_id: string | null
          updated_at: string
          url: string
          url_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_check?: string | null
          priority?: number
          reference_id?: string | null
          updated_at?: string
          url: string
          url_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_check?: string | null
          priority?: number
          reference_id?: string | null
          updated_at?: string
          url?: string
          url_type?: string
        }
        Relationships: []
      }
      monitors: {
        Row: {
          body: string | null
          check_interval_minutes: number | null
          created_at: string
          expected_status_codes: number[] | null
          headers: Json | null
          id: string
          is_active: boolean | null
          method: string | null
          name: string
          repairer_id: string
          settings: Json | null
          timeout_seconds: number | null
          type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          body?: string | null
          check_interval_minutes?: number | null
          created_at?: string
          expected_status_codes?: number[] | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          method?: string | null
          name: string
          repairer_id: string
          settings?: Json | null
          timeout_seconds?: number | null
          type: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          body?: string | null
          check_interval_minutes?: number | null
          created_at?: string
          expected_status_codes?: number[] | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          method?: string | null
          name?: string
          repairer_id?: string
          settings?: Json | null
          timeout_seconds?: number | null
          type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      multi_location_settings: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          location_address: string | null
          location_email: string | null
          location_name: string
          location_phone: string | null
          manager_user_id: string | null
          parent_repairer_id: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_address?: string | null
          location_email?: string | null
          location_name: string
          location_phone?: string | null
          manager_user_id?: string | null
          parent_repairer_id: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_address?: string | null
          location_email?: string | null
          location_name?: string
          location_phone?: string | null
          manager_user_id?: string | null
          parent_repairer_id?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          preferences: Json | null
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          preferences?: Json | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          preferences?: Json | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      nf203_archives: {
        Row: {
          archive_date: string
          archive_format: string
          archive_status: string
          created_at: string | null
          deletion_date: string | null
          document_id: string
          document_type: string
          file_hash: string
          file_path: string | null
          file_size: number
          file_url: string | null
          id: string
          legal_hold: boolean | null
          metadata: Json | null
          repairer_id: string
          retention_period: number
          updated_at: string | null
        }
        Insert: {
          archive_date?: string
          archive_format: string
          archive_status?: string
          created_at?: string | null
          deletion_date?: string | null
          document_id: string
          document_type: string
          file_hash: string
          file_path?: string | null
          file_size: number
          file_url?: string | null
          id?: string
          legal_hold?: boolean | null
          metadata?: Json | null
          repairer_id: string
          retention_period?: number
          updated_at?: string | null
        }
        Update: {
          archive_date?: string
          archive_format?: string
          archive_status?: string
          created_at?: string | null
          deletion_date?: string | null
          document_id?: string
          document_type?: string
          file_hash?: string
          file_path?: string | null
          file_size?: number
          file_url?: string | null
          id?: string
          legal_hold?: boolean | null
          metadata?: Json | null
          repairer_id?: string
          retention_period?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      nf203_audit_trail: {
        Row: {
          action: string
          after_state: Json | null
          before_state: Json | null
          changes_summary: string | null
          compliance_metadata: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown | null
          is_locked: boolean | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          after_state?: Json | null
          before_state?: Json | null
          changes_summary?: string | null
          compliance_metadata?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown | null
          is_locked?: boolean | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          after_state?: Json | null
          before_state?: Json | null
          changes_summary?: string | null
          compliance_metadata?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          is_locked?: boolean | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      nf203_period_closures: {
        Row: {
          closed_by: string | null
          closure_date: string
          closure_hash: string
          compliance_report: Json | null
          created_at: string | null
          fec_export_path: string | null
          fec_generated_at: string | null
          id: string
          invoice_count: number
          is_locked: boolean
          period_end: string
          period_start: string
          period_type: string
          repairer_id: string
          total_ht: number
          total_ttc: number
          total_tva: number
        }
        Insert: {
          closed_by?: string | null
          closure_date?: string
          closure_hash: string
          compliance_report?: Json | null
          created_at?: string | null
          fec_export_path?: string | null
          fec_generated_at?: string | null
          id?: string
          invoice_count?: number
          is_locked?: boolean
          period_end: string
          period_start: string
          period_type: string
          repairer_id: string
          total_ht?: number
          total_ttc?: number
          total_tva?: number
        }
        Update: {
          closed_by?: string | null
          closure_date?: string
          closure_hash?: string
          compliance_report?: Json | null
          created_at?: string | null
          fec_export_path?: string | null
          fec_generated_at?: string | null
          id?: string
          invoice_count?: number
          is_locked?: boolean
          period_end?: string
          period_start?: string
          period_type?: string
          repairer_id?: string
          total_ht?: number
          total_ttc?: number
          total_tva?: number
        }
        Relationships: []
      }
      nf203_timestamps: {
        Row: {
          created_at: string
          document_hash: string
          document_id: string
          document_type: string
          hash_algorithm: string
          id: string
          is_qualified: boolean | null
          timestamp_authority: string | null
          timestamp_date: string
          timestamp_token: string | null
        }
        Insert: {
          created_at?: string
          document_hash: string
          document_id: string
          document_type: string
          hash_algorithm?: string
          id?: string
          is_qualified?: boolean | null
          timestamp_authority?: string | null
          timestamp_date?: string
          timestamp_token?: string | null
        }
        Update: {
          created_at?: string
          document_hash?: string
          document_id?: string
          document_type?: string
          hash_algorithm?: string
          id?: string
          is_qualified?: boolean | null
          timestamp_authority?: string | null
          timestamp_date?: string
          timestamp_token?: string | null
        }
        Relationships: []
      }
      nf525_archive_logs: {
        Row: {
          action: string
          archive_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          repairer_id: string
          status: string
          transaction_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          archive_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          repairer_id: string
          status: string
          transaction_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          archive_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          repairer_id?: string
          status?: string
          transaction_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nf525_archive_logs_archive_id_fkey"
            columns: ["archive_id"]
            isOneToOne: false
            referencedRelation: "nf525_receipt_archives"
            referencedColumns: ["id"]
          },
        ]
      }
      nf525_archive_stats: {
        Row: {
          archive_size_mb: number
          archived_receipts: number
          compliance_score: number
          created_at: string
          date: string
          id: string
          last_archive_check: string | null
          repairer_id: string
          total_receipts: number
          updated_at: string
        }
        Insert: {
          archive_size_mb?: number
          archived_receipts?: number
          compliance_score?: number
          created_at?: string
          date?: string
          id?: string
          last_archive_check?: string | null
          repairer_id: string
          total_receipts?: number
          updated_at?: string
        }
        Update: {
          archive_size_mb?: number
          archived_receipts?: number
          compliance_score?: number
          created_at?: string
          date?: string
          id?: string
          last_archive_check?: string | null
          repairer_id?: string
          total_receipts?: number
          updated_at?: string
        }
        Relationships: []
      }
      nf525_receipt_archives: {
        Row: {
          archive_format: string
          compression_used: boolean | null
          created_at: string
          expires_at: string
          file_size_bytes: number | null
          id: string
          metadata: Json | null
          receipt_data: Json
          receipt_hash: string
          receipt_html: string
          repairer_id: string
          retention_period_years: number
          transaction_id: string
          updated_at: string
        }
        Insert: {
          archive_format?: string
          compression_used?: boolean | null
          created_at?: string
          expires_at?: string
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          receipt_data: Json
          receipt_hash: string
          receipt_html: string
          repairer_id: string
          retention_period_years?: number
          transaction_id: string
          updated_at?: string
        }
        Update: {
          archive_format?: string
          compression_used?: boolean | null
          created_at?: string
          expires_at?: string
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          receipt_data?: Json
          receipt_hash?: string
          receipt_html?: string
          repairer_id?: string
          retention_period_years?: number
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nf525_receipt_archives_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "pos_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_channels: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          repairer_id: string
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          repairer_id: string
          type: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          repairer_id?: string
          type?: string
          updated_at?: string
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
      offline_sync_queue: {
        Row: {
          created_at: string
          entity_data: Json
          entity_type: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_retries: number
          next_retry_at: string | null
          operation_type: string
          priority: number
          repairer_id: string
          retry_count: number
          sync_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_data: Json
          entity_type: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_retries?: number
          next_retry_at?: string | null
          operation_type: string
          priority?: number
          repairer_id: string
          retry_count?: number
          sync_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_data?: Json
          entity_type?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_retries?: number
          next_retry_at?: string | null
          operation_type?: string
          priority?: number
          repairer_id?: string
          retry_count?: number
          sync_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      optional_modules_config: {
        Row: {
          available_plans: Json
          category: string | null
          color: string | null
          created_at: string
          description: string | null
          features: Json | null
          icon: string | null
          id: string
          is_active: boolean
          module_id: string
          module_name: string | null
          pricing_monthly: number
          pricing_yearly: number
          updated_at: string
        }
        Insert: {
          available_plans?: Json
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean
          module_id: string
          module_name?: string | null
          pricing_monthly?: number
          pricing_yearly?: number
          updated_at?: string
        }
        Update: {
          available_plans?: Json
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean
          module_id?: string
          module_name?: string | null
          pricing_monthly?: number
          pricing_yearly?: number
          updated_at?: string
        }
        Relationships: []
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
      parts_suppliers: {
        Row: {
          address: Json | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          delivery_delay_days: number | null
          delivery_time_days: number | null
          discount_percentage: number | null
          email: string | null
          id: string
          is_active: boolean | null
          is_preferred: boolean | null
          minimum_order: number | null
          minimum_order_amount: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          rating: number | null
          repairer_id: string
          shipping_cost: number | null
          specialties: string[] | null
          supported_brands: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          delivery_delay_days?: number | null
          delivery_time_days?: number | null
          discount_percentage?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          minimum_order?: number | null
          minimum_order_amount?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          repairer_id: string
          shipping_cost?: number | null
          specialties?: string[] | null
          supported_brands?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          delivery_delay_days?: number | null
          delivery_time_days?: number | null
          discount_percentage?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          minimum_order?: number | null
          minimum_order_amount?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          repairer_id?: string
          shipping_cost?: number | null
          specialties?: string[] | null
          supported_brands?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          commission_amount: number | null
          commission_rate: number | null
          confirmed_at: string | null
          created_at: string
          currency: string
          description: string | null
          funds_released: boolean | null
          hold_funds: boolean
          id: string
          payment_intent_id: string
          quote_id: string | null
          refund_reason: string | null
          refunded_at: string | null
          released_at: string | null
          repairer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          commission_amount?: number | null
          commission_rate?: number | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          funds_released?: boolean | null
          hold_funds?: boolean
          id?: string
          payment_intent_id: string
          quote_id?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          released_at?: string | null
          repairer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          commission_amount?: number | null
          commission_rate?: number | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          funds_released?: boolean | null
          hold_funds?: boolean
          id?: string
          payment_intent_id?: string
          quote_id?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          released_at?: string | null
          repairer_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes_with_timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_features: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          feature_key: string
          feature_limit: number | null
          id: string
          plan_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          feature_key: string
          feature_limit?: number | null
          id?: string
          plan_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          feature_key?: string
          feature_limit?: number | null
          id?: string
          plan_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_feature_key_fkey"
            columns: ["feature_key"]
            isOneToOne: false
            referencedRelation: "available_features"
            referencedColumns: ["feature_key"]
          },
        ]
      }
      pos_analytics_cache: {
        Row: {
          calculated_at: string
          data: Json
          date_range_end: string
          date_range_start: string
          expires_at: string
          id: string
          repairer_id: string
          report_type: string
        }
        Insert: {
          calculated_at?: string
          data: Json
          date_range_end: string
          date_range_start: string
          expires_at: string
          id?: string
          repairer_id: string
          report_type: string
        }
        Update: {
          calculated_at?: string
          data?: Json
          date_range_end?: string
          date_range_start?: string
          expires_at?: string
          id?: string
          repairer_id?: string
          report_type?: string
        }
        Relationships: []
      }
      pos_catalog_sync: {
        Row: {
          catalog_type: string
          created_at: string
          id: string
          item_data: Json
          item_id: string
          last_synced_at: string | null
          repairer_id: string
          sync_errors: Json | null
          sync_status: string
          updated_at: string
        }
        Insert: {
          catalog_type: string
          created_at?: string
          id?: string
          item_data?: Json
          item_id: string
          last_synced_at?: string | null
          repairer_id: string
          sync_errors?: Json | null
          sync_status?: string
          updated_at?: string
        }
        Update: {
          catalog_type?: string
          created_at?: string
          id?: string
          item_data?: Json
          item_id?: string
          last_synced_at?: string | null
          repairer_id?: string
          sync_errors?: Json | null
          sync_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pos_customers: {
        Row: {
          address: Json | null
          created_at: string
          customer_number: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          last_visit_date: string | null
          loyalty_points: number | null
          loyalty_status: string | null
          marketing_consent: boolean | null
          phone: string | null
          preferred_contact: string | null
          private_notes: string | null
          repairer_id: string
          tags: string[] | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          customer_number: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          last_visit_date?: string | null
          loyalty_points?: number | null
          loyalty_status?: string | null
          marketing_consent?: boolean | null
          phone?: string | null
          preferred_contact?: string | null
          private_notes?: string | null
          repairer_id: string
          tags?: string[] | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          customer_number?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          last_visit_date?: string | null
          loyalty_points?: number | null
          loyalty_status?: string | null
          marketing_consent?: boolean | null
          phone?: string | null
          preferred_contact?: string | null
          private_notes?: string | null
          repairer_id?: string
          tags?: string[] | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pos_hardware_config: {
        Row: {
          configuration: Json | null
          connection_type: string
          created_at: string
          device_name: string
          device_type: string
          id: string
          is_active: boolean | null
          last_connected: string | null
          repairer_id: string
          updated_at: string
        }
        Insert: {
          configuration?: Json | null
          connection_type: string
          created_at?: string
          device_name: string
          device_type: string
          id?: string
          is_active?: boolean | null
          last_connected?: string | null
          repairer_id: string
          updated_at?: string
        }
        Update: {
          configuration?: Json | null
          connection_type?: string
          created_at?: string
          device_name?: string
          device_type?: string
          id?: string
          is_active?: boolean | null
          last_connected?: string | null
          repairer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pos_inventory_items: {
        Row: {
          ademe_bonus: number | null
          brand: string | null
          category: string | null
          category_id: string | null
          cost_price: number | null
          created_at: string
          current_stock: number
          custom_description: string | null
          description: string | null
          dimensions: Json | null
          ecotax: number | null
          external_reference: string | null
          id: string
          image_url: string | null
          intervention_service_id: string | null
          is_active: boolean
          is_ecommerce_active: boolean | null
          is_trackable: boolean
          location: string | null
          margin_percentage: number | null
          maximum_stock: number | null
          minimum_stock: number
          model: string | null
          name: string
          purchase_price_ht: number | null
          purchase_price_ttc: number | null
          repairer_id: string
          requires_intervention: boolean | null
          retail_price: number | null
          sale_price_ht: number | null
          sale_price_ttc: number | null
          selling_price: number
          shelf_position: string | null
          sku: string
          sync_source: string | null
          synced_at: string | null
          tva_rate: number | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          ademe_bonus?: number | null
          brand?: string | null
          category?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          current_stock?: number
          custom_description?: string | null
          description?: string | null
          dimensions?: Json | null
          ecotax?: number | null
          external_reference?: string | null
          id?: string
          image_url?: string | null
          intervention_service_id?: string | null
          is_active?: boolean
          is_ecommerce_active?: boolean | null
          is_trackable?: boolean
          location?: string | null
          margin_percentage?: number | null
          maximum_stock?: number | null
          minimum_stock?: number
          model?: string | null
          name: string
          purchase_price_ht?: number | null
          purchase_price_ttc?: number | null
          repairer_id: string
          requires_intervention?: boolean | null
          retail_price?: number | null
          sale_price_ht?: number | null
          sale_price_ttc?: number | null
          selling_price: number
          shelf_position?: string | null
          sku: string
          sync_source?: string | null
          synced_at?: string | null
          tva_rate?: number | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          ademe_bonus?: number | null
          brand?: string | null
          category?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          current_stock?: number
          custom_description?: string | null
          description?: string | null
          dimensions?: Json | null
          ecotax?: number | null
          external_reference?: string | null
          id?: string
          image_url?: string | null
          intervention_service_id?: string | null
          is_active?: boolean
          is_ecommerce_active?: boolean | null
          is_trackable?: boolean
          location?: string | null
          margin_percentage?: number | null
          maximum_stock?: number | null
          minimum_stock?: number
          model?: string | null
          name?: string
          purchase_price_ht?: number | null
          purchase_price_ttc?: number | null
          repairer_id?: string
          requires_intervention?: boolean | null
          retail_price?: number | null
          sale_price_ht?: number | null
          sale_price_ttc?: number | null
          selling_price?: number
          shelf_position?: string | null
          sku?: string
          sync_source?: string | null
          synced_at?: string | null
          tva_rate?: number | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      pos_offline_operations: {
        Row: {
          created_at: string
          device_id: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_retries: number | null
          operation_data: Json
          operation_type: string
          priority: number | null
          repairer_id: string
          retry_count: number | null
          scheduled_sync_at: string | null
          session_id: string | null
          sync_status: string
          synced_at: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_retries?: number | null
          operation_data: Json
          operation_type: string
          priority?: number | null
          repairer_id: string
          retry_count?: number | null
          scheduled_sync_at?: string | null
          session_id?: string | null
          sync_status?: string
          synced_at?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_retries?: number | null
          operation_data?: Json
          operation_type?: string
          priority?: number | null
          repairer_id?: string
          retry_count?: number | null
          scheduled_sync_at?: string | null
          session_id?: string | null
          sync_status?: string
          synced_at?: string | null
        }
        Relationships: []
      }
      pos_payment_methods: {
        Row: {
          configuration: Json | null
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          method_name: string
          method_type: string
          repairer_id: string
          updated_at: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          method_name: string
          method_type: string
          repairer_id: string
          updated_at?: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          method_name?: string
          method_type?: string
          repairer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pos_sessions: {
        Row: {
          cash_drawer_end: number | null
          cash_drawer_start: number
          created_at: string
          employee_name: string | null
          ended_at: string | null
          id: string
          notes: string | null
          repairer_id: string
          session_date: string
          session_number: string
          started_at: string
          status: string
          total_amount: number
          total_transactions: number
          updated_at: string
        }
        Insert: {
          cash_drawer_end?: number | null
          cash_drawer_start?: number
          created_at?: string
          employee_name?: string | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          repairer_id: string
          session_date?: string
          session_number: string
          started_at?: string
          status?: string
          total_amount?: number
          total_transactions?: number
          updated_at?: string
        }
        Update: {
          cash_drawer_end?: number | null
          cash_drawer_start?: number
          created_at?: string
          employee_name?: string | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          repairer_id?: string
          session_date?: string
          session_number?: string
          started_at?: string
          status?: string
          total_amount?: number
          total_transactions?: number
          updated_at?: string
        }
        Relationships: []
      }
      pos_staff_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          is_active: boolean | null
          repairer_id: string
          role_id: string
          staff_user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          repairer_id: string
          role_id: string
          staff_user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          repairer_id?: string
          role_id?: string
          staff_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_staff_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "pos_staff_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_staff_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          permissions: Json
          repairer_id: string
          role_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json
          repairer_id: string
          role_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json
          repairer_id?: string
          role_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      pos_systems: {
        Row: {
          created_at: string
          id: string
          last_activity: string | null
          monthly_revenue: number | null
          plan_type: string
          repairer_id: string
          settings: Json | null
          status: string
          system_name: string
          total_transactions: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_activity?: string | null
          monthly_revenue?: number | null
          plan_type?: string
          repairer_id: string
          settings?: Json | null
          status?: string
          system_name: string
          total_transactions?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_activity?: string | null
          monthly_revenue?: number | null
          plan_type?: string
          repairer_id?: string
          settings?: Json | null
          status?: string
          system_name?: string
          total_transactions?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pos_transaction_items: {
        Row: {
          created_at: string
          discount_amount: number
          id: string
          item_name: string
          item_sku: string | null
          item_type: string
          product_id: string | null
          quantity: number
          repair_details: Json | null
          tax_rate: number
          total_price: number
          transaction_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          id?: string
          item_name: string
          item_sku?: string | null
          item_type: string
          product_id?: string | null
          quantity?: number
          repair_details?: Json | null
          tax_rate?: number
          total_price: number
          transaction_id: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_amount?: number
          id?: string
          item_name?: string
          item_sku?: string | null
          item_type?: string
          product_id?: string | null
          quantity?: number
          repair_details?: Json | null
          tax_rate?: number
          total_price?: number
          transaction_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "pos_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_transactions: {
        Row: {
          appointment_id: string | null
          archive_status: string | null
          archived_at: string | null
          archived_receipt_data: Json | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number
          fiscal_counter: number | null
          fiscal_receipt_number: string | null
          fiscal_signature: string | null
          id: string
          nf525_archive_hash: string | null
          payment_details: Json | null
          payment_method: string
          payment_status: string
          receipt_generation_status: string | null
          repair_order_id: string | null
          repairer_id: string
          session_id: string
          subtotal: number
          tax_amount: number
          total_amount: number
          transaction_date: string
          transaction_number: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          archive_status?: string | null
          archived_at?: string | null
          archived_receipt_data?: Json | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number
          fiscal_counter?: number | null
          fiscal_receipt_number?: string | null
          fiscal_signature?: string | null
          id?: string
          nf525_archive_hash?: string | null
          payment_details?: Json | null
          payment_method: string
          payment_status?: string
          receipt_generation_status?: string | null
          repair_order_id?: string | null
          repairer_id: string
          session_id: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          transaction_date?: string
          transaction_number: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          archive_status?: string | null
          archived_at?: string | null
          archived_receipt_data?: Json | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number
          fiscal_counter?: number | null
          fiscal_receipt_number?: string | null
          fiscal_signature?: string | null
          id?: string
          nf525_archive_hash?: string | null
          payment_details?: Json | null
          payment_method?: string
          payment_status?: string
          receipt_generation_status?: string | null
          repair_order_id?: string | null
          repairer_id?: string
          session_id?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          transaction_date?: string
          transaction_number?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "pos_sessions"
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
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_links: {
        Row: {
          ai_confidence: number | null
          created_at: string | null
          id: string
          is_automatic: boolean | null
          link_type: string
          linked_product_id: string
          primary_product_id: string
        }
        Insert: {
          ai_confidence?: number | null
          created_at?: string | null
          id?: string
          is_automatic?: boolean | null
          link_type: string
          linked_product_id: string
          primary_product_id: string
        }
        Update: {
          ai_confidence?: number | null
          created_at?: string | null
          id?: string
          is_automatic?: boolean | null
          link_type?: string
          linked_product_id?: string
          primary_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_links_linked_product_id_fkey"
            columns: ["linked_product_id"]
            isOneToOne: false
            referencedRelation: "pos_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_links_primary_product_id_fkey"
            columns: ["primary_product_id"]
            isOneToOne: false
            referencedRelation: "pos_inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          referrer: string | null
          repairer_id: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          repairer_id: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          repairer_id?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      purchase_order_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity: number | null
          total_ht: number
          total_ttc: number
          unit_price_ht: number
          unit_price_ttc: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity?: number | null
          total_ht: number
          total_ttc: number
          unit_price_ht: number
          unit_price_ttc: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number | null
          total_ht?: number
          total_ttc?: number
          unit_price_ht?: number
          unit_price_ttc?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "pos_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          auto_generated: boolean | null
          created_at: string | null
          created_by: string | null
          expected_delivery: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          repairer_id: string
          status: string
          supplier_id: string
          total_amount_ht: number | null
          total_amount_ttc: number | null
          updated_at: string | null
        }
        Insert: {
          auto_generated?: boolean | null
          created_at?: string | null
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number: string
          repairer_id: string
          status?: string
          supplier_id: string
          total_amount_ht?: number | null
          total_amount_ttc?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_generated?: boolean | null
          created_at?: string | null
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          repairer_id?: string
          status?: string
          supplier_id?: string
          total_amount_ht?: number | null
          total_amount_ttc?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "parts_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      qualirepar_api_logs: {
        Row: {
          api_endpoint: string
          created_at: string | null
          dossier_id: string | null
          error_details: string | null
          id: string
          request_method: string
          request_payload: Json | null
          response_data: Json | null
          response_status: number | null
          response_time_ms: number | null
        }
        Insert: {
          api_endpoint: string
          created_at?: string | null
          dossier_id?: string | null
          error_details?: string | null
          id?: string
          request_method: string
          request_payload?: Json | null
          response_data?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
        }
        Update: {
          api_endpoint?: string
          created_at?: string | null
          dossier_id?: string | null
          error_details?: string | null
          id?: string
          request_method?: string
          request_payload?: Json | null
          response_data?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "qualirepar_api_logs_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "qualirepar_dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      qualirepar_auth_credentials: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_intermediary: boolean | null
          password: string
          updated_at: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_intermediary?: boolean | null
          password: string
          updated_at?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_intermediary?: boolean | null
          password?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      qualirepar_auth_repairers: {
        Row: {
          auth_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          repairer_code: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          repairer_code: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          repairer_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualirepar_auth_repairers_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "qualirepar_auth_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      qualirepar_documents: {
        Row: {
          auto_validation_passed: boolean | null
          created_at: string
          document_type: string
          dossier_id: string
          file_checksum: string | null
          file_metadata: Json | null
          file_name: string
          file_path: string
          file_size: number
          file_size_mb: number | null
          file_validation_errors: Json | null
          file_validation_status: string | null
          id: string
          is_validated: boolean | null
          mime_type: string
          ocr_confidence: number | null
          ocr_data: Json | null
          ocr_extracted_text: string | null
          official_document_type: string | null
          original_filename: string | null
          updated_at: string
          upload_status: string | null
          upload_url: string | null
          validation_notes: string | null
          validation_rules: Json | null
        }
        Insert: {
          auto_validation_passed?: boolean | null
          created_at?: string
          document_type: string
          dossier_id: string
          file_checksum?: string | null
          file_metadata?: Json | null
          file_name: string
          file_path: string
          file_size: number
          file_size_mb?: number | null
          file_validation_errors?: Json | null
          file_validation_status?: string | null
          id?: string
          is_validated?: boolean | null
          mime_type: string
          ocr_confidence?: number | null
          ocr_data?: Json | null
          ocr_extracted_text?: string | null
          official_document_type?: string | null
          original_filename?: string | null
          updated_at?: string
          upload_status?: string | null
          upload_url?: string | null
          validation_notes?: string | null
          validation_rules?: Json | null
        }
        Update: {
          auto_validation_passed?: boolean | null
          created_at?: string
          document_type?: string
          dossier_id?: string
          file_checksum?: string | null
          file_metadata?: Json | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_size_mb?: number | null
          file_validation_errors?: Json | null
          file_validation_status?: string | null
          id?: string
          is_validated?: boolean | null
          mime_type?: string
          ocr_confidence?: number | null
          ocr_data?: Json | null
          ocr_extracted_text?: string | null
          official_document_type?: string | null
          original_filename?: string | null
          updated_at?: string
          upload_status?: string | null
          upload_url?: string | null
          validation_notes?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "qualirepar_documents_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "qualirepar_dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      qualirepar_dossiers: {
        Row: {
          api_endpoint: string | null
          api_errors: Json | null
          api_response_data: Json | null
          api_status: string | null
          api_upload_urls: Json | null
          api_version: string | null
          client_address: string
          client_city: string
          client_country: string | null
          client_email: string
          client_first_name: string | null
          client_last_name: string | null
          client_name: string
          client_phone: string | null
          client_postal_code: string
          client_title: string | null
          created_at: string
          document_types_uploaded: string[] | null
          dossier_number: string
          eco_organism: string
          eligibility_rule_id: string | null
          id: string
          iris_code: string | null
          is_api_compliant: boolean | null
          last_api_call: string | null
          max_retry_attempts: number | null
          new_spare_parts_amount: number | null
          official_claim_id: string | null
          payment_date: string | null
          piec_spare_parts_amount: number | null
          pos_transaction_id: string | null
          processing_date: string | null
          processing_notifications: Json | null
          product_brand: string
          product_brand_id: string | null
          product_category: string
          product_commercial_reference: string | null
          product_id: string | null
          product_model: string
          product_serial_number: string | null
          purchase_order_by_customer: string | null
          reimbursement_claim_id: string | null
          rejection_reason: string | null
          repair_cost: number
          repair_date: string
          repair_description: string
          repair_order_id: string | null
          repair_place_id: string | null
          repair_type_code: string | null
          repairer_id: string
          repairer_siret: string | null
          requested_bonus_amount: number
          retry_count: number | null
          sap_service_order: string | null
          second_hand_spare_parts_amount: number | null
          spare_parts_cost: number | null
          status: string
          submission_date: string | null
          temporary_claim_id: string | null
          updated_at: string
          v3_reject_reason: string | null
          v3_request_status: string | null
          validation_errors: Json | null
          wizard_step: number | null
        }
        Insert: {
          api_endpoint?: string | null
          api_errors?: Json | null
          api_response_data?: Json | null
          api_status?: string | null
          api_upload_urls?: Json | null
          api_version?: string | null
          client_address: string
          client_city: string
          client_country?: string | null
          client_email: string
          client_first_name?: string | null
          client_last_name?: string | null
          client_name: string
          client_phone?: string | null
          client_postal_code: string
          client_title?: string | null
          created_at?: string
          document_types_uploaded?: string[] | null
          dossier_number: string
          eco_organism: string
          eligibility_rule_id?: string | null
          id?: string
          iris_code?: string | null
          is_api_compliant?: boolean | null
          last_api_call?: string | null
          max_retry_attempts?: number | null
          new_spare_parts_amount?: number | null
          official_claim_id?: string | null
          payment_date?: string | null
          piec_spare_parts_amount?: number | null
          pos_transaction_id?: string | null
          processing_date?: string | null
          processing_notifications?: Json | null
          product_brand: string
          product_brand_id?: string | null
          product_category: string
          product_commercial_reference?: string | null
          product_id?: string | null
          product_model: string
          product_serial_number?: string | null
          purchase_order_by_customer?: string | null
          reimbursement_claim_id?: string | null
          rejection_reason?: string | null
          repair_cost: number
          repair_date: string
          repair_description: string
          repair_order_id?: string | null
          repair_place_id?: string | null
          repair_type_code?: string | null
          repairer_id: string
          repairer_siret?: string | null
          requested_bonus_amount: number
          retry_count?: number | null
          sap_service_order?: string | null
          second_hand_spare_parts_amount?: number | null
          spare_parts_cost?: number | null
          status?: string
          submission_date?: string | null
          temporary_claim_id?: string | null
          updated_at?: string
          v3_reject_reason?: string | null
          v3_request_status?: string | null
          validation_errors?: Json | null
          wizard_step?: number | null
        }
        Update: {
          api_endpoint?: string | null
          api_errors?: Json | null
          api_response_data?: Json | null
          api_status?: string | null
          api_upload_urls?: Json | null
          api_version?: string | null
          client_address?: string
          client_city?: string
          client_country?: string | null
          client_email?: string
          client_first_name?: string | null
          client_last_name?: string | null
          client_name?: string
          client_phone?: string | null
          client_postal_code?: string
          client_title?: string | null
          created_at?: string
          document_types_uploaded?: string[] | null
          dossier_number?: string
          eco_organism?: string
          eligibility_rule_id?: string | null
          id?: string
          iris_code?: string | null
          is_api_compliant?: boolean | null
          last_api_call?: string | null
          max_retry_attempts?: number | null
          new_spare_parts_amount?: number | null
          official_claim_id?: string | null
          payment_date?: string | null
          piec_spare_parts_amount?: number | null
          pos_transaction_id?: string | null
          processing_date?: string | null
          processing_notifications?: Json | null
          product_brand?: string
          product_brand_id?: string | null
          product_category?: string
          product_commercial_reference?: string | null
          product_id?: string | null
          product_model?: string
          product_serial_number?: string | null
          purchase_order_by_customer?: string | null
          reimbursement_claim_id?: string | null
          rejection_reason?: string | null
          repair_cost?: number
          repair_date?: string
          repair_description?: string
          repair_order_id?: string | null
          repair_place_id?: string | null
          repair_type_code?: string | null
          repairer_id?: string
          repairer_siret?: string | null
          requested_bonus_amount?: number
          retry_count?: number | null
          sap_service_order?: string | null
          second_hand_spare_parts_amount?: number | null
          spare_parts_cost?: number | null
          status?: string
          submission_date?: string | null
          temporary_claim_id?: string | null
          updated_at?: string
          v3_reject_reason?: string | null
          v3_request_status?: string | null
          validation_errors?: Json | null
          wizard_step?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_qualirepar_dossiers_eligibility"
            columns: ["eligibility_rule_id"]
            isOneToOne: false
            referencedRelation: "qualirepar_eligibility_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualirepar_dossiers_eligibility_rule_id_fkey"
            columns: ["eligibility_rule_id"]
            isOneToOne: false
            referencedRelation: "qualirepar_eligibility_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      qualirepar_eligibility_cache: {
        Row: {
          api_source_updated: string | null
          created_at: string | null
          eco_organism: string
          eligibility_rules: Json | null
          id: string
          is_active: boolean | null
          max_bonus_amount: number
          min_repair_cost: number | null
          product_brand: string | null
          product_category: string
          product_model: string | null
          updated_at: string | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          api_source_updated?: string | null
          created_at?: string | null
          eco_organism: string
          eligibility_rules?: Json | null
          id?: string
          is_active?: boolean | null
          max_bonus_amount: number
          min_repair_cost?: number | null
          product_brand?: string | null
          product_category: string
          product_model?: string | null
          updated_at?: string | null
          valid_from: string
          valid_until?: string | null
        }
        Update: {
          api_source_updated?: string | null
          created_at?: string | null
          eco_organism?: string
          eligibility_rules?: Json | null
          id?: string
          is_active?: boolean | null
          max_bonus_amount?: number
          min_repair_cost?: number | null
          product_brand?: string | null
          product_category?: string
          product_model?: string | null
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      qualirepar_eligibility_rules: {
        Row: {
          brand: string | null
          created_at: string
          eco_organism: string
          id: string
          is_active: boolean
          max_bonus_amount: number
          min_repair_cost: number | null
          model: string | null
          product_category: string
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          eco_organism: string
          id?: string
          is_active?: boolean
          max_bonus_amount: number
          min_repair_cost?: number | null
          model?: string | null
          product_category: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          eco_organism?: string
          id?: string
          is_active?: boolean
          max_bonus_amount?: number
          min_repair_cost?: number | null
          model?: string | null
          product_category?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      qualirepar_product_catalog: {
        Row: {
          category_code: string
          category_name: string
          created_at: string | null
          eco_organism: string | null
          id: string
          is_active: boolean | null
          max_bonus_amount: number
          min_repair_cost: number | null
          updated_at: string | null
        }
        Insert: {
          category_code: string
          category_name: string
          created_at?: string | null
          eco_organism?: string | null
          id?: string
          is_active?: boolean | null
          max_bonus_amount: number
          min_repair_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          category_code?: string
          category_name?: string
          created_at?: string | null
          eco_organism?: string | null
          id?: string
          is_active?: boolean | null
          max_bonus_amount?: number
          min_repair_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      qualirepar_reimbursements: {
        Row: {
          approval_date: string
          approved_amount: number
          created_at: string
          dossier_id: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          processing_delay_days: number | null
          submission_id: string | null
          updated_at: string
        }
        Insert: {
          approval_date: string
          approved_amount: number
          created_at?: string
          dossier_id: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          processing_delay_days?: number | null
          submission_id?: string | null
          updated_at?: string
        }
        Update: {
          approval_date?: string
          approved_amount?: number
          created_at?: string
          dossier_id?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          processing_delay_days?: number | null
          submission_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualirepar_reimbursements_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "qualirepar_dossiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualirepar_reimbursements_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "qualirepar_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      qualirepar_status_notifications: {
        Row: {
          created_at: string | null
          delivery_status: string | null
          dossier_id: string | null
          id: string
          message: string | null
          new_status: string
          notification_type: string
          old_status: string | null
          recipient_user_id: string | null
          sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_status?: string | null
          dossier_id?: string | null
          id?: string
          message?: string | null
          new_status: string
          notification_type: string
          old_status?: string | null
          recipient_user_id?: string | null
          sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_status?: string | null
          dossier_id?: string | null
          id?: string
          message?: string | null
          new_status?: string
          notification_type?: string
          old_status?: string | null
          recipient_user_id?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qualirepar_status_notifications_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "qualirepar_dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      qualirepar_submissions: {
        Row: {
          api_endpoint: string | null
          created_at: string
          dossier_id: string
          error_message: string | null
          external_reference: string | null
          id: string
          recipient_email: string | null
          response_data: Json | null
          status: string
          submission_data: Json
          submission_method: string
          tracking_reference: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string
          dossier_id: string
          error_message?: string | null
          external_reference?: string | null
          id?: string
          recipient_email?: string | null
          response_data?: Json | null
          status?: string
          submission_data: Json
          submission_method: string
          tracking_reference?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string
          dossier_id?: string
          error_message?: string | null
          external_reference?: string | null
          id?: string
          recipient_email?: string | null
          response_data?: Json | null
          status?: string
          submission_data?: Json
          submission_method?: string
          tracking_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualirepar_submissions_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "qualirepar_dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          client_id: string
          created_at: string
          device_brand: string | null
          device_model: string | null
          device_type: string
          estimated_price: number | null
          id: string
          issue_description: string
          repairer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          device_brand?: string | null
          device_model?: string | null
          device_type: string
          estimated_price?: number | null
          id?: string
          issue_description: string
          repairer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          device_brand?: string | null
          device_model?: string | null
          device_type?: string
          estimated_price?: number | null
          id?: string
          issue_description?: string
          repairer_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_response_tracking: {
        Row: {
          client_id: string
          created_at: string | null
          deadline_24h: string
          has_predefined_pricing: boolean
          id: string
          quote_id: string
          reminder_sent: boolean | null
          repairer_id: string
          response_status: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          deadline_24h: string
          has_predefined_pricing?: boolean
          id?: string
          quote_id: string
          reminder_sent?: boolean | null
          repairer_id: string
          response_status?: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          deadline_24h?: string
          has_predefined_pricing?: boolean
          id?: string
          quote_id?: string
          reminder_sent?: boolean | null
          repairer_id?: string
          response_status?: string
          updated_at?: string | null
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
          admin_assigned_at: string | null
          admin_assigned_by: string | null
          ai_confidence: number | null
          ai_generated: boolean | null
          ai_reasoning: string | null
          assignment_status: string | null
          client_acceptance_deadline: string | null
          client_email: string
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          client_response_notes: string | null
          client_signature_date: string | null
          created_at: string
          device_brand: string
          device_model: string
          estimated_price: number | null
          has_predefined_pricing: boolean | null
          id: string
          issue_description: string | null
          labor_cost: number | null
          parts_cost: number | null
          pricing_type: string | null
          quoted_at: string | null
          rejected_at: string | null
          repair_duration: string | null
          repair_type: string
          repairer_id: string
          repairer_notes: string | null
          repairer_response_deadline: string
          response_deadline: string | null
          status: string
          updated_at: string
          warranty_info: string | null
          warranty_period_days: number | null
        }
        Insert: {
          accepted_at?: string | null
          admin_assigned_at?: string | null
          admin_assigned_by?: string | null
          ai_confidence?: number | null
          ai_generated?: boolean | null
          ai_reasoning?: string | null
          assignment_status?: string | null
          client_acceptance_deadline?: string | null
          client_email: string
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_response_notes?: string | null
          client_signature_date?: string | null
          created_at?: string
          device_brand: string
          device_model: string
          estimated_price?: number | null
          has_predefined_pricing?: boolean | null
          id?: string
          issue_description?: string | null
          labor_cost?: number | null
          parts_cost?: number | null
          pricing_type?: string | null
          quoted_at?: string | null
          rejected_at?: string | null
          repair_duration?: string | null
          repair_type: string
          repairer_id: string
          repairer_notes?: string | null
          repairer_response_deadline?: string
          response_deadline?: string | null
          status?: string
          updated_at?: string
          warranty_info?: string | null
          warranty_period_days?: number | null
        }
        Update: {
          accepted_at?: string | null
          admin_assigned_at?: string | null
          admin_assigned_by?: string | null
          ai_confidence?: number | null
          ai_generated?: boolean | null
          ai_reasoning?: string | null
          assignment_status?: string | null
          client_acceptance_deadline?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_response_notes?: string | null
          client_signature_date?: string | null
          created_at?: string
          device_brand?: string
          device_model?: string
          estimated_price?: number | null
          has_predefined_pricing?: boolean | null
          id?: string
          issue_description?: string | null
          labor_cost?: number | null
          parts_cost?: number | null
          pricing_type?: string | null
          quoted_at?: string | null
          rejected_at?: string | null
          repair_duration?: string | null
          repair_type?: string
          repairer_id?: string
          repairer_notes?: string | null
          repairer_response_deadline?: string
          response_deadline?: string | null
          status?: string
          updated_at?: string
          warranty_info?: string | null
          warranty_period_days?: number | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          count: number | null
          created_at: string | null
          id: string
          identifier: string
          window_start: string | null
        }
        Insert: {
          action: string
          count?: number | null
          created_at?: string | null
          id?: string
          identifier: string
          window_start?: string | null
        }
        Update: {
          action?: string
          count?: number | null
          created_at?: string | null
          id?: string
          identifier?: string
          window_start?: string | null
        }
        Relationships: []
      }
      recent_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          metadata: Json | null
          repairer_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          repairer_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          repairer_id?: string | null
          title?: string
          user_id?: string | null
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
      relaunch_campaign_logs: {
        Row: {
          campaign_name: string
          campaign_type: string
          clicked_count: number | null
          converted_count: number | null
          created_at: string
          emails_sent: number | null
          id: string
          next_execution: string | null
          opened_count: number | null
          repairer_id: string
          sms_sent: number | null
          status: string
          trigger_event: string
          updated_at: string
        }
        Insert: {
          campaign_name: string
          campaign_type?: string
          clicked_count?: number | null
          converted_count?: number | null
          created_at?: string
          emails_sent?: number | null
          id?: string
          next_execution?: string | null
          opened_count?: number | null
          repairer_id: string
          sms_sent?: number | null
          status?: string
          trigger_event: string
          updated_at?: string
        }
        Update: {
          campaign_name?: string
          campaign_type?: string
          clicked_count?: number | null
          converted_count?: number | null
          created_at?: string
          emails_sent?: number | null
          id?: string
          next_execution?: string | null
          opened_count?: number | null
          repairer_id?: string
          sms_sent?: number | null
          status?: string
          trigger_event?: string
          updated_at?: string
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
      repair_category_device_types: {
        Row: {
          created_at: string
          device_type_id: string
          id: string
          is_active: boolean
          repair_category_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_type_id: string
          id?: string
          is_active?: boolean
          repair_category_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_type_id?: string
          id?: string
          is_active?: boolean
          repair_category_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_category_device_types_device_type_id_fkey"
            columns: ["device_type_id"]
            isOneToOne: false
            referencedRelation: "device_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_category_device_types_repair_category_id_fkey"
            columns: ["repair_category_id"]
            isOneToOne: false
            referencedRelation: "repair_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_content_templates: {
        Row: {
          category: string
          content_template: string
          created_at: string | null
          created_by: string | null
          device_type: string | null
          id: string
          is_active: boolean | null
          name: string
          repair_type: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category?: string
          content_template: string
          created_at?: string | null
          created_by?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          repair_type?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string
          content_template?: string
          created_at?: string | null
          created_by?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          repair_type?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      repair_devices: {
        Row: {
          accessories: Json | null
          actual_completion: string | null
          brand_id: string | null
          created_at: string
          current_condition_id: string | null
          custom_device_info: string | null
          customer_email: string | null
          customer_name: string
          customer_notes: string | null
          customer_phone: string | null
          customer_phone_fixed: string | null
          device_model_id: string | null
          device_type_id: string | null
          estimated_completion: string | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          id: string
          imei_serial: string | null
          initial_condition_id: string | null
          initial_diagnosis: string | null
          intake_date: string
          lock_pattern: string | null
          photos: Json | null
          pin_code: string | null
          repairer_id: string
          security_notes: string | null
          sim_code: string | null
          updated_at: string
        }
        Insert: {
          accessories?: Json | null
          actual_completion?: string | null
          brand_id?: string | null
          created_at?: string
          current_condition_id?: string | null
          custom_device_info?: string | null
          customer_email?: string | null
          customer_name: string
          customer_notes?: string | null
          customer_phone?: string | null
          customer_phone_fixed?: string | null
          device_model_id?: string | null
          device_type_id?: string | null
          estimated_completion?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          imei_serial?: string | null
          initial_condition_id?: string | null
          initial_diagnosis?: string | null
          intake_date?: string
          lock_pattern?: string | null
          photos?: Json | null
          pin_code?: string | null
          repairer_id: string
          security_notes?: string | null
          sim_code?: string | null
          updated_at?: string
        }
        Update: {
          accessories?: Json | null
          actual_completion?: string | null
          brand_id?: string | null
          created_at?: string
          current_condition_id?: string | null
          custom_device_info?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string | null
          customer_phone_fixed?: string | null
          device_model_id?: string | null
          device_type_id?: string | null
          estimated_completion?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          imei_serial?: string | null
          initial_condition_id?: string | null
          initial_diagnosis?: string | null
          intake_date?: string
          lock_pattern?: string | null
          photos?: Json | null
          pin_code?: string | null
          repairer_id?: string
          security_notes?: string | null
          sim_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_devices_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_devices_current_condition_id_fkey"
            columns: ["current_condition_id"]
            isOneToOne: false
            referencedRelation: "device_conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_devices_device_model_id_fkey"
            columns: ["device_model_id"]
            isOneToOne: false
            referencedRelation: "device_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_devices_device_type_id_fkey"
            columns: ["device_type_id"]
            isOneToOne: false
            referencedRelation: "device_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_devices_initial_condition_id_fkey"
            columns: ["initial_condition_id"]
            isOneToOne: false
            referencedRelation: "device_conditions"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_orders: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_signature_data: string | null
          customer_signature_date: string | null
          device_id: string
          final_amount: number | null
          id: string
          internal_notes: string | null
          order_number: string | null
          priority: number | null
          quote_accepted_at: string | null
          quote_amount: number | null
          quote_expires_at: string | null
          repairer_id: string
          started_at: string | null
          status: string
          technician_id: string | null
          technician_notes: string | null
          time_spent_minutes: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_signature_data?: string | null
          customer_signature_date?: string | null
          device_id: string
          final_amount?: number | null
          id?: string
          internal_notes?: string | null
          order_number?: string | null
          priority?: number | null
          quote_accepted_at?: string | null
          quote_amount?: number | null
          quote_expires_at?: string | null
          repairer_id: string
          started_at?: string | null
          status?: string
          technician_id?: string | null
          technician_notes?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_signature_data?: string | null
          customer_signature_date?: string | null
          device_id?: string
          final_amount?: number | null
          id?: string
          internal_notes?: string | null
          order_number?: string | null
          priority?: number | null
          quote_accepted_at?: string | null
          quote_amount?: number | null
          quote_expires_at?: string | null
          repairer_id?: string
          started_at?: string | null
          status?: string
          technician_id?: string | null
          technician_notes?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_orders_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "repair_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_parts_used: {
        Row: {
          created_at: string
          id: string
          installed_at: string | null
          inventory_item_id: string | null
          ordered_at: string | null
          part_name: string
          part_sku: string | null
          quantity: number
          received_at: string | null
          repair_order_id: string
          serial_numbers: string[] | null
          status: string
          supplier_info: string | null
          total_cost: number
          unit_cost: number
          warranty_months: number | null
          warranty_start_date: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          installed_at?: string | null
          inventory_item_id?: string | null
          ordered_at?: string | null
          part_name: string
          part_sku?: string | null
          quantity?: number
          received_at?: string | null
          repair_order_id: string
          serial_numbers?: string[] | null
          status?: string
          supplier_info?: string | null
          total_cost: number
          unit_cost: number
          warranty_months?: number | null
          warranty_start_date?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          installed_at?: string | null
          inventory_item_id?: string | null
          ordered_at?: string | null
          part_name?: string
          part_sku?: string | null
          quantity?: number
          received_at?: string | null
          repair_order_id?: string
          serial_numbers?: string[] | null
          status?: string
          supplier_info?: string | null
          total_cost?: number
          unit_cost?: number
          warranty_months?: number | null
          warranty_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_parts_used_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "pos_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_parts_used_repair_order_id_fkey"
            columns: ["repair_order_id"]
            isOneToOne: false
            referencedRelation: "repair_orders"
            referencedColumns: ["id"]
          },
        ]
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
      repair_steps: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          photos: Json | null
          repair_order_id: string
          started_at: string | null
          status: string
          step_description: string | null
          step_name: string
          step_order: number
          test_results: Json | null
          time_spent_minutes: number | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          photos?: Json | null
          repair_order_id: string
          started_at?: string | null
          status?: string
          step_description?: string | null
          step_name: string
          step_order: number
          test_results?: Json | null
          time_spent_minutes?: number | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          photos?: Json | null
          repair_order_id?: string
          started_at?: string | null
          status?: string
          step_description?: string | null
          step_name?: string
          step_order?: number
          test_results?: Json | null
          time_spent_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_steps_repair_order_id_fkey"
            columns: ["repair_order_id"]
            isOneToOne: false
            referencedRelation: "repair_orders"
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
      repair_warranties: {
        Row: {
          claims_count: number | null
          coverage_description: string | null
          covered_parts: string[] | null
          created_at: string
          duration_months: number
          end_date: string
          id: string
          last_claim_date: string | null
          repair_order_id: string
          repairer_id: string
          start_date: string
          status: string
          terms_conditions: string | null
          updated_at: string
          warranty_type: string
        }
        Insert: {
          claims_count?: number | null
          coverage_description?: string | null
          covered_parts?: string[] | null
          created_at?: string
          duration_months: number
          end_date: string
          id?: string
          last_claim_date?: string | null
          repair_order_id: string
          repairer_id: string
          start_date?: string
          status?: string
          terms_conditions?: string | null
          updated_at?: string
          warranty_type: string
        }
        Update: {
          claims_count?: number | null
          coverage_description?: string | null
          covered_parts?: string[] | null
          created_at?: string
          duration_months?: number
          end_date?: string
          id?: string
          last_claim_date?: string | null
          repair_order_id?: string
          repairer_id?: string
          start_date?: string
          status?: string
          terms_conditions?: string | null
          updated_at?: string
          warranty_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_warranties_repair_order_id_fkey"
            columns: ["repair_order_id"]
            isOneToOne: false
            referencedRelation: "repair_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      repairer_analytics: {
        Row: {
          competitor_analysis: Json | null
          contact_clicks: number | null
          conversion_rate: number | null
          created_at: string | null
          date: string
          id: string
          profile_views: number | null
          quote_requests: number | null
          ranking_position: number | null
          repairer_id: string
        }
        Insert: {
          competitor_analysis?: Json | null
          contact_clicks?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          id?: string
          profile_views?: number | null
          quote_requests?: number | null
          ranking_position?: number | null
          repairer_id: string
        }
        Update: {
          competitor_analysis?: Json | null
          contact_clicks?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          id?: string
          profile_views?: number | null
          quote_requests?: number | null
          ranking_position?: number | null
          repairer_id?: string
        }
        Relationships: []
      }
      repairer_api_settings: {
        Row: {
          created_at: string
          has_buyback_module: boolean | null
          has_police_logbook: boolean | null
          id: string
          repairer_id: string
          resend_api_key: string | null
          stripe_secret_key: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          has_buyback_module?: boolean | null
          has_police_logbook?: boolean | null
          id?: string
          repairer_id: string
          resend_api_key?: string | null
          stripe_secret_key?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          has_buyback_module?: boolean | null
          has_police_logbook?: boolean | null
          id?: string
          repairer_id?: string
          resend_api_key?: string | null
          stripe_secret_key?: string | null
          updated_at?: string
        }
        Relationships: []
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
      repairer_badges: {
        Row: {
          badge_name: string
          badge_type: string
          created_at: string
          criteria: string | null
          earned: boolean
          earned_at: string | null
          id: string
          level: string | null
          repairer_id: string
          updated_at: string
        }
        Insert: {
          badge_name: string
          badge_type: string
          created_at?: string
          criteria?: string | null
          earned?: boolean
          earned_at?: string | null
          id?: string
          level?: string | null
          repairer_id: string
          updated_at?: string
        }
        Update: {
          badge_name?: string
          badge_type?: string
          created_at?: string
          criteria?: string | null
          earned?: boolean
          earned_at?: string | null
          id?: string
          level?: string | null
          repairer_id?: string
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
      repairer_legal_info: {
        Row: {
          capital_social: number | null
          created_at: string
          id: string
          invoice_prefix: string | null
          late_penalty_rate: number | null
          legal_form: string | null
          legal_mentions: string | null
          naf_code: string | null
          next_invoice_number: number | null
          payment_terms_days: number | null
          rcs_city: string | null
          rcs_number: string | null
          repairer_id: string
          siret: string
          tva_number: string | null
          updated_at: string
        }
        Insert: {
          capital_social?: number | null
          created_at?: string
          id?: string
          invoice_prefix?: string | null
          late_penalty_rate?: number | null
          legal_form?: string | null
          legal_mentions?: string | null
          naf_code?: string | null
          next_invoice_number?: number | null
          payment_terms_days?: number | null
          rcs_city?: string | null
          rcs_number?: string | null
          repairer_id: string
          siret: string
          tva_number?: string | null
          updated_at?: string
        }
        Update: {
          capital_social?: number | null
          created_at?: string
          id?: string
          invoice_prefix?: string | null
          late_penalty_rate?: number | null
          legal_form?: string | null
          legal_mentions?: string | null
          naf_code?: string | null
          next_invoice_number?: number | null
          payment_terms_days?: number | null
          rcs_city?: string | null
          rcs_number?: string | null
          repairer_id?: string
          siret?: string
          tva_number?: string | null
          updated_at?: string
        }
        Relationships: []
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
      repairer_services: {
        Row: {
          base_price: number | null
          category: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          repairer_id: string
          service_name: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          repairer_id: string
          service_name: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          repairer_id?: string
          service_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      repairer_statistics: {
        Row: {
          average_repair_time: number | null
          completed_repairs: number | null
          created_at: string | null
          customer_satisfaction: number | null
          id: string
          month_year: string
          pending_orders: number | null
          repairer_id: string
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          average_repair_time?: number | null
          completed_repairs?: number | null
          created_at?: string | null
          customer_satisfaction?: number | null
          id?: string
          month_year: string
          pending_orders?: number | null
          repairer_id: string
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          average_repair_time?: number | null
          completed_repairs?: number | null
          created_at?: string | null
          customer_satisfaction?: number | null
          id?: string
          month_year?: string
          pending_orders?: number | null
          repairer_id?: string
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      repairer_stripe_config: {
        Row: {
          auto_transfer: boolean | null
          commission_rate: number | null
          created_at: string
          id: string
          is_active: boolean | null
          repairer_id: string
          stripe_account_id: string | null
          stripe_publishable_key: string | null
          stripe_secret_key: string | null
          updated_at: string
        }
        Insert: {
          auto_transfer?: boolean | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          repairer_id: string
          stripe_account_id?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          updated_at?: string
        }
        Update: {
          auto_transfer?: boolean | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          repairer_id?: string
          stripe_account_id?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          updated_at?: string
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
      repairer_team_members: {
        Row: {
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          permissions: Json | null
          repairer_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          repairer_id: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          repairer_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      repairers: {
        Row: {
          address: string
          auto_detected_category: string | null
          business_category_id: string | null
          business_status: string | null
          category_confidence: number | null
          city: string
          created_at: string
          data_quality_score: number | null
          deepseek_classification: Json | null
          deepseek_confidence: number | null
          department: string | null
          description: string | null
          email: string | null
          enhanced_at: string | null
          enhancement_status: string | null
          geocoding_accuracy: string | null
          geocoding_source: string | null
          id: string
          is_open: boolean | null
          is_verified: boolean | null
          lat: number | null
          lng: number | null
          mistral_enhanced: boolean | null
          mistral_enhancement_data: Json | null
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
          unique_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          auto_detected_category?: string | null
          business_category_id?: string | null
          business_status?: string | null
          category_confidence?: number | null
          city: string
          created_at?: string
          data_quality_score?: number | null
          deepseek_classification?: Json | null
          deepseek_confidence?: number | null
          department?: string | null
          description?: string | null
          email?: string | null
          enhanced_at?: string | null
          enhancement_status?: string | null
          geocoding_accuracy?: string | null
          geocoding_source?: string | null
          id?: string
          is_open?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          lng?: number | null
          mistral_enhanced?: boolean | null
          mistral_enhancement_data?: Json | null
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
          unique_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          auto_detected_category?: string | null
          business_category_id?: string | null
          business_status?: string | null
          category_confidence?: number | null
          city?: string
          created_at?: string
          data_quality_score?: number | null
          deepseek_classification?: Json | null
          deepseek_confidence?: number | null
          department?: string | null
          description?: string | null
          email?: string | null
          enhanced_at?: string | null
          enhancement_status?: string | null
          geocoding_accuracy?: string | null
          geocoding_source?: string | null
          id?: string
          is_open?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          lng?: number | null
          mistral_enhanced?: boolean | null
          mistral_enhancement_data?: Json | null
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
          unique_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repairers_business_category_id_fkey"
            columns: ["business_category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      restore_points: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          point_name: string
          point_type: string
          snapshot_data: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          point_name: string
          point_type?: string
          snapshot_data?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          point_name?: string
          point_type?: string
          snapshot_data?: Json | null
        }
        Relationships: []
      }
      review_criteria: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
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
      scraping_enhancement_config: {
        Row: {
          config_key: string
          config_value: Json
          id: string
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value?: Json
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
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
      scraping_suggestions: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          quality_score: number | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scraped_data: Json
          source: string
          status: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          quality_score?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scraped_data: Json
          source?: string
          status?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          quality_score?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scraped_data?: Json
          source?: string
          status?: string
        }
        Relationships: []
      }
      secure_payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          held_until: string | null
          id: string
          quote_id: string
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          held_until?: string | null
          id?: string
          quote_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          held_until?: string | null
          id?: string
          quote_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource?: string | null
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seo_alerts: {
        Row: {
          alert_type: string
          created_at: string
          details: Json
          id: string
          message: string
          resolved_at: string | null
          severity: string
          status: string
          url: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          details?: Json
          id?: string
          message: string
          resolved_at?: string | null
          severity?: string
          status?: string
          url: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          details?: Json
          id?: string
          message?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          url?: string
        }
        Relationships: []
      }
      seo_monitoring_config: {
        Row: {
          alert_webhooks: Json
          created_at: string
          google_search_console_token: string | null
          id: string
          monitoring_enabled: boolean
          performance_thresholds: Json
          sitemap_auto_update: boolean
          updated_at: string
        }
        Insert: {
          alert_webhooks?: Json
          created_at?: string
          google_search_console_token?: string | null
          id?: string
          monitoring_enabled?: boolean
          performance_thresholds?: Json
          sitemap_auto_update?: boolean
          updated_at?: string
        }
        Update: {
          alert_webhooks?: Json
          created_at?: string
          google_search_console_token?: string | null
          id?: string
          monitoring_enabled?: boolean
          performance_thresholds?: Json
          sitemap_auto_update?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      shopping_cart: {
        Row: {
          added_at: string | null
          id: string
          product_id: string | null
          quantity: number
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_products"
            referencedColumns: ["id"]
          },
        ]
      }
      sitemap_history: {
        Row: {
          created_at: string
          google_submission_status: string | null
          id: string
          sitemap_content: string
          submitted_to_google: boolean
          urls_count: number
        }
        Insert: {
          created_at?: string
          google_submission_status?: string | null
          id?: string
          sitemap_content: string
          submitted_to_google?: boolean
          urls_count: number
        }
        Update: {
          created_at?: string
          google_submission_status?: string | null
          id?: string
          sitemap_content?: string
          submitted_to_google?: boolean
          urls_count?: number
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
      static_pages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      status_pages: {
        Row: {
          created_at: string
          custom_domain: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          monitors_config: Json | null
          name: string
          repairer_id: string
          slug: string
          theme_config: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          monitors_config?: Json | null
          name: string
          repairer_id: string
          slug: string
          theme_config?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          monitors_config?: Json | null
          name?: string
          repairer_id?: string
          slug?: string
          theme_config?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_alerts: {
        Row: {
          alert_type: string
          auto_order_enabled: boolean | null
          created_at: string | null
          current_value: number | null
          id: string
          is_active: boolean | null
          last_triggered: string | null
          product_id: string
          repairer_id: string
          threshold_value: number | null
        }
        Insert: {
          alert_type: string
          auto_order_enabled?: boolean | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          product_id: string
          repairer_id: string
          threshold_value?: number | null
        }
        Update: {
          alert_type?: string
          auto_order_enabled?: boolean | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          product_id?: string
          repairer_id?: string
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "pos_inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          inventory_item_id: string | null
          movement_type: string
          quantity: number
          reason: string | null
          reference_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_item_id?: string | null
          movement_type: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_item_id?: string | null
          movement_type?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      store_customizations: {
        Row: {
          created_at: string
          custom_css: string | null
          domain_config: Json | null
          font_family: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          primary_color: string | null
          repairer_id: string | null
          secondary_color: string | null
          store_name: string | null
          theme_settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_css?: string | null
          domain_config?: Json | null
          font_family?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          repairer_id?: string | null
          secondary_color?: string | null
          store_name?: string | null
          theme_settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_css?: string | null
          domain_config?: Json | null
          font_family?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          repairer_id?: string | null
          secondary_color?: string | null
          store_name?: string | null
          theme_settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      subdomains: {
        Row: {
          created_at: string
          custom_domain: string | null
          dns_configured: boolean | null
          id: string
          is_active: boolean | null
          landing_page_id: string | null
          repairer_id: string
          ssl_enabled: boolean | null
          subdomain: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          dns_configured?: boolean | null
          id?: string
          is_active?: boolean | null
          landing_page_id?: string | null
          repairer_id: string
          ssl_enabled?: boolean | null
          subdomain: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          dns_configured?: boolean | null
          id?: string
          is_active?: boolean | null
          landing_page_id?: string | null
          repairer_id?: string
          ssl_enabled?: boolean | null
          subdomain?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_billing: {
        Row: {
          amount: number
          billing_frequency: string
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string
          id: string
          next_billing_date: string | null
          repairer_id: string
          service_type: string
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          billing_frequency: string
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name: string
          id?: string
          next_billing_date?: string | null
          repairer_id: string
          service_type: string
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          billing_frequency?: string
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string
          id?: string
          next_billing_date?: string | null
          repairer_id?: string
          service_type?: string
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          display_order: number | null
          features: Json
          has_promo: boolean | null
          id: string
          is_recommended: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
          promo_text: string | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          features?: Json
          has_promo?: boolean | null
          id?: string
          is_recommended?: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
          promo_text?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          features?: Json
          has_promo?: boolean | null
          id?: string
          is_recommended?: boolean | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          promo_text?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      supplier_products: {
        Row: {
          created_at: string | null
          delivery_delay_days: number | null
          id: string
          is_preferred_supplier: boolean | null
          last_price_update: string | null
          minimum_quantity: number | null
          product_id: string
          supplier_id: string
          supplier_reference: string | null
          unit_price_ht: number | null
          unit_price_ttc: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_delay_days?: number | null
          id?: string
          is_preferred_supplier?: boolean | null
          last_price_update?: string | null
          minimum_quantity?: number | null
          product_id: string
          supplier_id: string
          supplier_reference?: string | null
          unit_price_ht?: number | null
          unit_price_ttc?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_delay_days?: number | null
          id?: string
          is_preferred_supplier?: boolean | null
          last_price_update?: string | null
          minimum_quantity?: number | null
          product_id?: string
          supplier_id?: string
          supplier_reference?: string | null
          unit_price_ht?: number | null
          unit_price_ttc?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "pos_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "parts_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers_directory: {
        Row: {
          address: Json | null
          brands_sold: string[] | null
          certifications: string[] | null
          created_at: string
          created_by: string | null
          delivery_info: Json | null
          description: string | null
          email: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          minimum_order: number | null
          name: string
          payment_terms: string | null
          phone: string | null
          product_types: string[] | null
          rating: number | null
          review_count: number | null
          specialties: string[] | null
          status: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          brands_sold?: string[] | null
          certifications?: string[] | null
          created_at?: string
          created_by?: string | null
          delivery_info?: Json | null
          description?: string | null
          email?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          minimum_order?: number | null
          name: string
          payment_terms?: string | null
          phone?: string | null
          product_types?: string[] | null
          rating?: number | null
          review_count?: number | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          brands_sold?: string[] | null
          certifications?: string[] | null
          created_at?: string
          created_by?: string | null
          delivery_info?: Json | null
          description?: string | null
          email?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          minimum_order?: number | null
          name?: string
          payment_terms?: string | null
          phone?: string | null
          product_types?: string[] | null
          rating?: number | null
          review_count?: number | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      suppliers_directory_reviews: {
        Row: {
          cons: Json | null
          content: string
          created_at: string
          id: string
          pros: Json | null
          rating: number
          repairer_id: string
          status: string | null
          supplier_id: string
          title: string
          updated_at: string
          verified_purchase: boolean | null
        }
        Insert: {
          cons?: Json | null
          content: string
          created_at?: string
          id?: string
          pros?: Json | null
          rating: number
          repairer_id: string
          status?: string | null
          supplier_id: string
          title: string
          updated_at?: string
          verified_purchase?: boolean | null
        }
        Update: {
          cons?: Json | null
          content?: string
          created_at?: string
          id?: string
          pros?: Json | null
          rating?: number
          repairer_id?: string
          status?: string | null
          supplier_id?: string
          title?: string
          updated_at?: string
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_directory_reviews_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          after_data: Json | null
          before_data: Json | null
          conflict_resolution: string | null
          created_at: string
          entity_id: string
          entity_type: string
          error_message: string | null
          id: string
          operation: string
          repairer_id: string
          resolved_at: string | null
          resolved_by: string | null
          sync_status: string
          sync_type: string
        }
        Insert: {
          after_data?: Json | null
          before_data?: Json | null
          conflict_resolution?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          error_message?: string | null
          id?: string
          operation: string
          repairer_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          sync_status?: string
          sync_type: string
        }
        Update: {
          after_data?: Json | null
          before_data?: Json | null
          conflict_resolution?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          id?: string
          operation?: string
          repairer_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          sync_status?: string
          sync_type?: string
        }
        Relationships: []
      }
      system_backups: {
        Row: {
          backup_name: string
          backup_path: string | null
          backup_status: string
          backup_type: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          file_size_bytes: number | null
          id: string
        }
        Insert: {
          backup_name: string
          backup_path?: string | null
          backup_status?: string
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          file_size_bytes?: number | null
          id?: string
        }
        Update: {
          backup_name?: string
          backup_path?: string | null
          backup_status?: string
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          file_size_bytes?: number | null
          id?: string
        }
        Relationships: []
      }
      system_cache_entries: {
        Row: {
          cache_key: string
          created_at: string
          hit_count: number
          id: string
          last_accessed: string
          size_mb: number
          ttl_seconds: number
          updated_at: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          hit_count?: number
          id?: string
          last_accessed?: string
          size_mb?: number
          ttl_seconds?: number
          updated_at?: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          hit_count?: number
          id?: string
          last_accessed?: string
          size_mb?: number
          ttl_seconds?: number
          updated_at?: string
        }
        Relationships: []
      }
      system_cache_stats: {
        Row: {
          active_keys: number
          created_at: string
          disk_usage_percent: number
          hit_ratio: number
          id: string
          memory_usage_percent: number
          miss_ratio: number
          operations_per_second: number
          total_size_mb: number
          updated_at: string
        }
        Insert: {
          active_keys?: number
          created_at?: string
          disk_usage_percent?: number
          hit_ratio?: number
          id?: string
          memory_usage_percent?: number
          miss_ratio?: number
          operations_per_second?: number
          total_size_mb?: number
          updated_at?: string
        }
        Update: {
          active_keys?: number
          created_at?: string
          disk_usage_percent?: number
          hit_ratio?: number
          id?: string
          memory_usage_percent?: number
          miss_ratio?: number
          operations_per_second?: number
          total_size_mb?: number
          updated_at?: string
        }
        Relationships: []
      }
      system_services: {
        Row: {
          error_message: string | null
          id: string
          last_checked: string
          metadata: Json | null
          response_time_ms: number | null
          service_name: string
          service_status: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          last_checked?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name: string
          service_status?: string
        }
        Update: {
          error_message?: string | null
          id?: string
          last_checked?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name?: string
          service_status?: string
        }
        Relationships: []
      }
      system_users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_login: string | null
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      targeting_segments: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          estimated_reach: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description?: string | null
          estimated_reach?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          estimated_reach?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          permissions: Json | null
          repairer_id: string
          role: string
          status: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          permissions?: Json | null
          repairer_id: string
          role?: string
          status?: string | null
          token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          permissions?: Json | null
          repairer_id?: string
          role?: string
          status?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      technical_knowledge_base: {
        Row: {
          attachments: Json | null
          brand_id: string | null
          content: string | null
          content_type: string
          created_at: string
          created_by: string | null
          description: string | null
          device_model_id: string | null
          device_type_id: string | null
          difficulty_level: number | null
          estimated_time_minutes: number | null
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          last_viewed_at: string | null
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          attachments?: Json | null
          brand_id?: string | null
          content?: string | null
          content_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          device_model_id?: string | null
          device_type_id?: string | null
          difficulty_level?: number | null
          estimated_time_minutes?: number | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          last_viewed_at?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          attachments?: Json | null
          brand_id?: string | null
          content?: string | null
          content_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          device_model_id?: string | null
          device_type_id?: string | null
          difficulty_level?: number | null
          estimated_time_minutes?: number | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          last_viewed_at?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_knowledge_base_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_knowledge_base_device_model_id_fkey"
            columns: ["device_model_id"]
            isOneToOne: false
            referencedRelation: "device_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_knowledge_base_device_type_id_fkey"
            columns: ["device_type_id"]
            isOneToOne: false
            referencedRelation: "device_types"
            referencedColumns: ["id"]
          },
        ]
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
      ui_ab_tests: {
        Row: {
          control_config_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          success_metrics: Json | null
          target_audience: Json | null
          traffic_split: number
          updated_at: string
          variant_config_id: string | null
        }
        Insert: {
          control_config_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          success_metrics?: Json | null
          target_audience?: Json | null
          traffic_split?: number
          updated_at?: string
          variant_config_id?: string | null
        }
        Update: {
          control_config_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          success_metrics?: Json | null
          target_audience?: Json | null
          traffic_split?: number
          updated_at?: string
          variant_config_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ui_ab_tests_control_config_id_fkey"
            columns: ["control_config_id"]
            isOneToOne: false
            referencedRelation: "ui_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ui_ab_tests_variant_config_id_fkey"
            columns: ["variant_config_id"]
            isOneToOne: false
            referencedRelation: "ui_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_analytics: {
        Row: {
          ab_test_id: string | null
          configuration_id: string | null
          conversion_value: number | null
          device_type: string | null
          event_data: Json
          event_type: string
          id: string
          metadata: Json | null
          page_url: string | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          ab_test_id?: string | null
          configuration_id?: string | null
          conversion_value?: number | null
          device_type?: string | null
          event_data?: Json
          event_type: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          ab_test_id?: string | null
          configuration_id?: string | null
          conversion_value?: number | null
          device_type?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ui_analytics_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "ui_ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ui_analytics_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "ui_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_configuration_history: {
        Row: {
          change_summary: string | null
          changed_by: string | null
          configuration_id: string | null
          configuration_snapshot: Json
          created_at: string
          id: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          changed_by?: string | null
          configuration_id?: string | null
          configuration_snapshot: Json
          created_at?: string
          id?: string
          version: number
        }
        Update: {
          change_summary?: string | null
          changed_by?: string | null
          configuration_id?: string | null
          configuration_snapshot?: Json
          created_at?: string
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "ui_configuration_history_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "ui_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_configurations: {
        Row: {
          configuration: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          tags: string[] | null
          type: string
          updated_at: string
          version: number
        }
        Insert: {
          configuration?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          tags?: string[] | null
          type: string
          updated_at?: string
          version?: number
        }
        Update: {
          configuration?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tags?: string[] | null
          type?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      ui_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_featured: boolean
          name: string
          preview_image_url: string | null
          tags: string[] | null
          template_data: Json
          updated_at: string
          usage_count: number
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean
          name: string
          preview_image_url?: string | null
          tags?: string[] | null
          template_data?: Json
          updated_at?: string
          usage_count?: number
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean
          name?: string
          preview_image_url?: string | null
          tags?: string[] | null
          template_data?: Json
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      ui_themes: {
        Row: {
          accessibility_score: number | null
          created_at: string
          created_by: string | null
          css_variables: Json | null
          description: string | null
          id: string
          is_default: boolean
          name: string
          preview_image_url: string | null
          tailwind_config: Json | null
          theme_data: Json
          type: string
          updated_at: string
        }
        Insert: {
          accessibility_score?: number | null
          created_at?: string
          created_by?: string | null
          css_variables?: Json | null
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          preview_image_url?: string | null
          tailwind_config?: Json | null
          theme_data?: Json
          type?: string
          updated_at?: string
        }
        Update: {
          accessibility_score?: number | null
          created_at?: string
          created_by?: string | null
          css_variables?: Json | null
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          preview_image_url?: string | null
          tailwind_config?: Json | null
          theme_data?: Json
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      url_health_checks: {
        Row: {
          check_timestamp: string
          errors: Json
          h1_count: number | null
          has_canonical: boolean | null
          has_noindex: boolean | null
          http_status: number | null
          id: string
          is_indexable: boolean | null
          meta_description_length: number | null
          meta_title_length: number | null
          monitored_url_id: string
          response_time_ms: number | null
          warnings: Json
        }
        Insert: {
          check_timestamp?: string
          errors?: Json
          h1_count?: number | null
          has_canonical?: boolean | null
          has_noindex?: boolean | null
          http_status?: number | null
          id?: string
          is_indexable?: boolean | null
          meta_description_length?: number | null
          meta_title_length?: number | null
          monitored_url_id: string
          response_time_ms?: number | null
          warnings?: Json
        }
        Update: {
          check_timestamp?: string
          errors?: Json
          h1_count?: number | null
          has_canonical?: boolean | null
          has_noindex?: boolean | null
          http_status?: number | null
          id?: string
          is_indexable?: boolean | null
          meta_description_length?: number | null
          meta_title_length?: number | null
          monitored_url_id?: string
          response_time_ms?: number | null
          warnings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "url_health_checks_monitored_url_id_fkey"
            columns: ["monitored_url_id"]
            isOneToOne: false
            referencedRelation: "monitored_urls"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behavior_events: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_interaction_history: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          metadata: Json
          target_id: string | null
          target_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          display_settings: Json | null
          favorite_products: string[] | null
          id: string
          notification_settings: Json | null
          preferred_brands: string[] | null
          preferred_categories: string[] | null
          recently_viewed: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_settings?: Json | null
          favorite_products?: string[] | null
          id?: string
          notification_settings?: Json | null
          preferred_brands?: string[] | null
          preferred_categories?: string[] | null
          recently_viewed?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_settings?: Json | null
          favorite_products?: string[] | null
          id?: string
          notification_settings?: Json | null
          preferred_brands?: string[] | null
          preferred_categories?: string[] | null
          recently_viewed?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean | null
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      visitor_analytics: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          id: string
          page_path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          visited_at: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          page_path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visited_at?: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visited_at?: string
        }
        Relationships: []
      }
      warranties: {
        Row: {
          claim_date: string | null
          claim_description: string | null
          claim_status: string | null
          client_id: string
          created_at: string | null
          device_brand: string
          device_model: string
          id: string
          quote_id: string | null
          repair_type: string
          repairer_id: string
          status: string
          terms_conditions: string | null
          updated_at: string | null
          warranty_duration_days: number
          warranty_end_date: string
          warranty_start_date: string
        }
        Insert: {
          claim_date?: string | null
          claim_description?: string | null
          claim_status?: string | null
          client_id: string
          created_at?: string | null
          device_brand: string
          device_model: string
          id?: string
          quote_id?: string | null
          repair_type: string
          repairer_id: string
          status?: string
          terms_conditions?: string | null
          updated_at?: string | null
          warranty_duration_days?: number
          warranty_end_date: string
          warranty_start_date?: string
        }
        Update: {
          claim_date?: string | null
          claim_description?: string | null
          claim_status?: string | null
          client_id?: string
          created_at?: string | null
          device_brand?: string
          device_model?: string
          id?: string
          quote_id?: string | null
          repair_type?: string
          repairer_id?: string
          status?: string
          terms_conditions?: string | null
          updated_at?: string | null
          warranty_duration_days?: number
          warranty_end_date?: string
          warranty_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranties_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes_with_timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      warranty_management: {
        Row: {
          claim_history: Json | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          device_info: string
          end_date: string
          id: string
          repair_order_id: string | null
          repairer_id: string
          start_date: string
          status: string | null
          updated_at: string | null
          warranty_conditions: Json | null
          warranty_duration_months: number
          warranty_type: string
        }
        Insert: {
          claim_history?: Json | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          device_info: string
          end_date: string
          id?: string
          repair_order_id?: string | null
          repairer_id: string
          start_date: string
          status?: string | null
          updated_at?: string | null
          warranty_conditions?: Json | null
          warranty_duration_months: number
          warranty_type: string
        }
        Update: {
          claim_history?: Json | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          device_info?: string
          end_date?: string
          id?: string
          repair_order_id?: string | null
          repairer_id?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          warranty_conditions?: Json | null
          warranty_duration_months?: number
          warranty_type?: string
        }
        Relationships: []
      }
      zapier_integrations: {
        Row: {
          created_at: string
          error_count: number | null
          id: string
          integration_name: string
          is_active: boolean | null
          last_triggered_at: string | null
          repairer_id: string | null
          success_count: number | null
          trigger_events: string[] | null
          updated_at: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          error_count?: number | null
          id?: string
          integration_name: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          repairer_id?: string | null
          success_count?: number | null
          trigger_events?: string[] | null
          updated_at?: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          error_count?: number | null
          id?: string
          integration_name?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          repairer_id?: string | null
          success_count?: number | null
          trigger_events?: string[] | null
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      repairer_profiles_safe: {
        Row: {
          business_name: string | null
          city: string | null
          created_at: string | null
          id: string | null
          repair_types: string[] | null
        }
        Insert: {
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          id?: string | null
          repair_types?: string[] | null
        }
        Update: {
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          id?: string | null
          repair_types?: string[] | null
        }
        Relationships: []
      }
      repairers_safe: {
        Row: {
          city: string | null
          created_at: string | null
          id: string | null
          lat: number | null
          lng: number | null
          name: string | null
          postal_code: string | null
          rating: number | null
          review_count: number | null
          specialties: string[] | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          postal_code?: string | null
          rating?: number | null
          review_count?: number | null
          specialties?: string[] | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          postal_code?: string | null
          rating?: number | null
          review_count?: number | null
          specialties?: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_url_to_monitoring: {
        Args: {
          priority_param?: number
          reference_id_param?: string
          url_to_monitor: string
          url_type_param: string
        }
        Returns: string
      }
      armor: {
        Args: { "": string }
        Returns: string
      }
      assign_free_plan_to_repairer: {
        Args: { user_email: string; user_id: string }
        Returns: string
      }
      auto_archive_certificate: {
        Args: { certificate_id: string }
        Returns: string
      }
      auto_archive_receipt: {
        Args: { transaction_id: string }
        Returns: string
      }
      auto_assign_quote_to_paid_repairer: {
        Args: { quote_id_param: string }
        Returns: string
      }
      calculate_data_quality_score: {
        Args: {
          repairer_record: Database["public"]["Tables"]["repairers"]["Row"]
        }
        Returns: number
      }
      calculate_invoice_hash: {
        Args: { invoice_data: Json }
        Returns: string
      }
      calculate_period_hash: {
        Args: { end_date: string; repairer_uuid: string; start_date: string }
        Returns: string
      }
      can_close_period: {
        Args: { end_date: string; repairer_uuid: string; start_date: string }
        Returns: Json
      }
      can_create_subdomain: {
        Args: { user_id: string }
        Returns: boolean
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      close_accounting_period: {
        Args: {
          end_date: string
          period_type_param: string
          repairer_uuid: string
          start_date: string
        }
        Returns: string
      }
      create_admin_user: {
        Args: { admin_user_id: string; user_email: string }
        Returns: boolean
      }
      dearmor: {
        Args: { "": string }
        Returns: string
      }
      fix_encoding_issues: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: Json
          fixed_count: number
        }[]
      }
      gen_random_bytes: {
        Args: { "": number }
        Returns: string
      }
      gen_random_uuid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gen_salt: {
        Args: { "": string }
        Returns: string
      }
      generate_certificate_number: {
        Args: { repairer_uuid: string }
        Returns: string
      }
      generate_invoice_number: {
        Args: { repairer_uuid: string }
        Returns: string
      }
      generate_order_number: {
        Args: { repairer_id: string }
        Returns: string
      }
      generate_pos_customer_number: {
        Args: { repairer_id: string }
        Returns: string
      }
      generate_qualirepar_dossier_number: {
        Args: { repairer_uuid: string }
        Returns: string
      }
      generate_repair_order_number: {
        Args: { repairer_uuid: string }
        Returns: string
      }
      generate_transaction_number: {
        Args: { repairer_id: string }
        Returns: string
      }
      generate_unique_id: {
        Args: { prefix?: string }
        Returns: string
      }
      get_admin_subscription_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          billing_cycle: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          plan_name: string
          price_monthly: number
          price_yearly: number
          repairer_id: string
          subscribed: boolean
          subscription_end: string
          subscription_tier: string
          updated_at: string
          user_id: string
        }[]
      }
      get_connection_stats: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          avg_session_duration: number
          date: string
          event_count: number
          event_type: string
          unique_users: number
          user_role: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_service_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_ctr: number
          avg_seo_score: number
          avg_views: number
          service_type: string
          total_pages: number
        }[]
      }
      get_top_performing_cities: {
        Args: { limit_count?: number }
        Returns: {
          avg_ctr: number
          city: string
          performance_score: number
          total_conversions: number
          total_views: number
        }[]
      }
      has_local_seo_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_module_access: {
        Args: { module_name: string; user_id: string }
        Returns: boolean
      }
      has_paid_subscription: {
        Args: { repairer_user_id: string }
        Returns: boolean
      }
      has_pos_permission: {
        Args: {
          permission_name: string
          repairer_id: string
          staff_user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      increment_chatbot_metric: {
        Args: { increment_by?: number; metric_name: string }
        Returns: undefined
      }
      increment_clicks: {
        Args: { banner_id: string }
        Returns: undefined
      }
      increment_impressions: {
        Args: { banner_id: string }
        Returns: undefined
      }
      increment_share_count: {
        Args: { post_id: string }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          action_param: string
          error_message_param?: string
          resource_param?: string
          success_param?: boolean
        }
        Returns: string
      }
      normalize_text: {
        Args: { input_text: string }
        Returns: string
      }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      pgp_key_id: {
        Args: { "": string }
        Returns: string
      }
      refresh_seo_page_content: {
        Args: { page_id: string }
        Returns: boolean
      }
      validate_and_use_promo_code: {
        Args: { promo_code_text: string }
        Returns: Json
      }
      verify_chain_integrity: {
        Args: { repairer_uuid: string }
        Returns: {
          broken_links: number
          error_details: string
          first_error_sequence: number
          is_valid: boolean
          total_invoices: number
        }[]
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
