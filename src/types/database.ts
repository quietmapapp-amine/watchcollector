export interface Database {
  public: {
    Tables: {
      brand: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
      };
      caliber: {
        Row: {
          id: string;
          name: string;
          service_interval_months: number | null;
          service_cost_low: number | null;
          service_cost_high: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          service_interval_months?: number | null;
          service_cost_low?: number | null;
          service_cost_high?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          service_interval_months?: number | null;
          service_cost_low?: number | null;
          service_cost_high?: number | null;
        };
      };
      model: {
        Row: {
          id: string;
          brand_id: string;
          name: string;
          reference: string | null;
          caliber_id: string | null;
          year_start: number | null;
          year_end: number | null;
        };
        Insert: {
          id?: string;
          brand_id: string;
          name: string;
          reference?: string | null;
          caliber_id?: string | null;
          year_start?: number | null;
          year_end?: number | null;
        };
        Update: {
          id?: string;
          brand_id?: string;
          name?: string;
          reference?: string | null;
          caliber_id?: string | null;
          year_start?: number | null;
          year_end?: number | null;
        };
      };
      profile: {
        Row: {
          id: string;
          email: string | null;
          pseudo: string;
          lang: string;
          is_public: boolean;
          is_premium: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          pseudo: string;
          lang?: string;
          is_public?: boolean;
          is_premium?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          pseudo?: string;
          lang?: string;
          is_public?: boolean;
          is_premium?: boolean;
          created_at?: string;
        };
      };
      watch_instance: {
        Row: {
          id: string;
          user_id: string;
          model_id: string | null;
          serial: string | null;
          purchase_price: number | null;
          purchase_currency: string;
          purchase_date: string | null;
          box_papers: boolean | null;
          condition: 'new' | 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
          notes: string | null;
          visibility: 'private' | 'friends' | 'public';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          model_id?: string | null;
          serial?: string | null;
          purchase_price?: number | null;
          purchase_currency?: string;
          purchase_date?: string | null;
          box_papers?: boolean | null;
          condition?: 'new' | 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
          notes?: string | null;
          visibility?: 'private' | 'friends' | 'public';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          model_id?: string | null;
          serial?: string | null;
          purchase_price?: number | null;
          purchase_currency?: string;
          purchase_date?: string | null;
          box_papers?: boolean | null;
          condition?: 'new' | 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
          notes?: string | null;
          visibility?: 'private' | 'friends' | 'public';
          created_at?: string;
        };
      };
      photo: {
        Row: {
          id: string;
          watch_instance_id: string;
          url: string;
          is_cover: boolean;
          credits: string | null;
          license: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          watch_instance_id: string;
          url: string;
          is_cover?: boolean;
          credits?: string | null;
          license?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          watch_instance_id?: string;
          url?: string;
          is_cover?: boolean;
          credits?: string | null;
          license?: string | null;
          created_at?: string;
        };
      };
      price_snapshot: {
        Row: {
          id: string;
          model_id: string;
          captured_at: string;
          median: number | null;
          p25: number | null;
          p75: number | null;
          sample_size: number | null;
          source_breakdown: any | null;
        };
        Insert: {
          id?: string;
          model_id: string;
          captured_at?: string;
          median?: number | null;
          p25?: number | null;
          p75?: number | null;
          sample_size?: number | null;
          source_breakdown?: any | null;
        };
        Update: {
          id?: string;
          model_id?: string;
          captured_at?: string;
          median?: number | null;
          p25?: number | null;
          p75?: number | null;
          sample_size?: number | null;
          source_breakdown?: any | null;
        };
      };
      price_alert: {
        Row: {
          id: string;
          user_id: string;
          model_id: string;
          direction: 'above' | 'below' | 'delta';
          threshold_numeric: number | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          model_id: string;
          direction: 'above' | 'below' | 'delta';
          threshold_numeric?: number | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          model_id?: string;
          direction?: 'above' | 'below' | 'delta';
          threshold_numeric?: number | null;
          active?: boolean;
          created_at?: string;
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
