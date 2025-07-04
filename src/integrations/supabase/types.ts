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
      calculate_data_quality_score: {
        Args: {
          repairer_record: Database["public"]["Tables"]["repairers"]["Row"]
        }
        Returns: number
      }
      generate_unique_id: {
        Args: { prefix?: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_module_access: {
        Args: { user_id: string; module_name: string }
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
