export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          legal_name: string;
          nit: string;
          address: string;
          phone: string;
          email: string;
          status: 'active' | 'suspended';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      company_users: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          role: 'admin' | 'operator' | 'viewer';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['company_users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['company_users']['Insert']>;
      };
      employees: {
        Row: {
          id: string;
          company_id: string;
          full_name: string;
          cedula: string;
          contract_type: 'FIJO' | 'TEMPORAL';
          monthly_salary: number;
          comments: string;
          status: 'active' | 'inactive';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['employees']['Insert']>;
      };
      hour_types: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          percentage: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hour_types']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['hour_types']['Insert']>;
      };
      hour_records: {
        Row: {
          id: string;
          company_id: string;
          employee_id: string;
          period: string;
          hour_type_id: string;
          hours: number;
          has_debt: boolean;
          debt_amount: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hour_records']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['hour_records']['Insert']>;
      };
      payrolls: {
        Row: {
          id: string;
          company_id: string;
          employee_id: string;
          period: string;
          base_hour_value: number;
          total_earned: number;
          transport_allowance: number;
          health_deduction: number;
          pension_deduction: number;
          other_deductions: number;
          total_deductions: number;
          net_pay: number;
          calculated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payrolls']['Row'], 'id' | 'calculated_at'>;
        Update: Partial<Database['public']['Tables']['payrolls']['Insert']>;
      };
      company_settings: {
        Row: {
          id: string;
          company_id: string;
          minimum_wage: number;
          transport_allowance: number;
          health_percentage: number;
          pension_percentage: number;
          monthly_base_hours: number;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['company_settings']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['company_settings']['Insert']>;
      };
    };
  };
}
