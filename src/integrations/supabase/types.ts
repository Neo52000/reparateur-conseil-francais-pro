export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
        ]
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
          contact_person: string | null
          created_at: string
          delivery_time_days: number | null
          email: string | null
          id: string
          is_active: boolean | null
          is_preferred: boolean | null
          minimum_order: number | null
          name: string
          payment_terms: string | null
          phone: string | null
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
          contact_person?: string | null
          created_at?: string
          delivery_time_days?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          minimum_order?: number | null
          name: string
          payment_terms?: string | null
          phone?: string | null
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
          contact_person?: string | null
          created_at?: string
          delivery_time_days?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          minimum_order?: number | null
          name?: string
          payment_terms?: string | null
          phone?: string | null
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
          confirmed_at: string | null
          created_at: string
          currency: string
          description: string | null
          hold_funds: boolean
          id: string
          payment_intent_id: string
          quote_id: string | null
          refund_reason: string | null
          refunded_at: string | null
          repairer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          hold_funds?: boolean
          id?: string
          payment_intent_id: string
          quote_id?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          repairer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          hold_funds?: boolean
          id?: string
          payment_intent_id?: string
          quote_id?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
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
          brand: string | null
          category: string | null
          cost_price: number | null
          created_at: string
          current_stock: number
          description: string | null
          dimensions: Json | null
          id: string
          is_active: boolean
          is_trackable: boolean
          location: string | null
          maximum_stock: number | null
          minimum_stock: number
          name: string
          repairer_id: string
          retail_price: number | null
          selling_price: number
          shelf_position: string | null
          sku: string
          sync_source: string | null
          synced_at: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          cost_price?: number | null
          created_at?: string
          current_stock?: number
          description?: string | null
          dimensions?: Json | null
          id?: string
          is_active?: boolean
          is_trackable?: boolean
          location?: string | null
          maximum_stock?: number | null
          minimum_stock?: number
          name: string
          repairer_id: string
          retail_price?: number | null
          selling_price: number
          shelf_position?: string | null
          sku: string
          sync_source?: string | null
          synced_at?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          cost_price?: number | null
          created_at?: string
          current_stock?: number
          description?: string | null
          dimensions?: Json | null
          id?: string
          is_active?: boolean
          is_trackable?: boolean
          location?: string | null
          maximum_stock?: number | null
          minimum_stock?: number
          name?: string
          repairer_id?: string
          retail_price?: number | null
          selling_price?: number
          shelf_position?: string | null
          sku?: string
          sync_source?: string | null
          synced_at?: string | null
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
          payment_details: Json | null
          payment_method: string
          payment_status: string
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
          payment_details?: Json | null
          payment_method: string
          payment_status?: string
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
          payment_details?: Json | null
          payment_method?: string
          payment_status?: string
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
          photos: Json | null
          repairer_id: string
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
          photos?: Json | null
          repairer_id: string
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
          photos?: Json | null
          repairer_id?: string
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
          order_number: string
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
          order_number: string
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
          order_number?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_url_to_monitoring: {
        Args: {
          url_to_monitor: string
          url_type_param: string
          reference_id_param?: string
          priority_param?: number
        }
        Returns: string
      }
      assign_free_plan_to_repairer: {
        Args: { user_email: string; user_id: string }
        Returns: string
      }
      calculate_data_quality_score: {
        Args: {
          repairer_record: Database["public"]["Tables"]["repairers"]["Row"]
        }
        Returns: number
      }
      can_create_subdomain: {
        Args: { user_id: string }
        Returns: boolean
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_admin_user: {
        Args: { user_email: string; admin_user_id: string }
        Returns: boolean
      }
      fix_encoding_issues: {
        Args: Record<PropertyKey, never>
        Returns: {
          fixed_count: number
          details: Json
        }[]
      }
      generate_order_number: {
        Args: { repairer_id: string }
        Returns: string
      }
      generate_pos_customer_number: {
        Args: { repairer_id: string }
        Returns: string
      }
      generate_repair_order_number: {
        Args: { repairer_id: string }
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
          id: string
          repairer_id: string
          email: string
          user_id: string
          first_name: string
          last_name: string
          subscription_tier: string
          billing_cycle: string
          subscribed: boolean
          created_at: string
          updated_at: string
          subscription_end: string
          plan_name: string
          price_monthly: number
          price_yearly: number
        }[]
      }
      get_connection_stats: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          date: string
          event_type: string
          user_role: string
          event_count: number
          unique_users: number
          avg_session_duration: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_service_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          service_type: string
          total_pages: number
          avg_views: number
          avg_ctr: number
          avg_seo_score: number
        }[]
      }
      get_top_performing_cities: {
        Args: { limit_count?: number }
        Returns: {
          city: string
          total_views: number
          avg_ctr: number
          total_conversions: number
          performance_score: number
        }[]
      }
      has_local_seo_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_module_access: {
        Args: { user_id: string; module_name: string }
        Returns: boolean
      }
      has_pos_permission: {
        Args: {
          staff_user_id: string
          repairer_id: string
          permission_name: string
        }
        Returns: boolean
      }
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      increment_chatbot_metric: {
        Args: { metric_name: string; increment_by?: number }
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
      normalize_text: {
        Args: { input_text: string }
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
