export type ResiStatus = "pengiriman" | "belum di pack";

export type ResiRow = {
  id: string;
  resi: string;
  name: string;
  status: ResiStatus;
  alamat: string | null;
  courier: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CourierOptionRow = {
  id: string;
  name: string;
  prefix: string | null;
  sort_order: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      resi: {
        Row: ResiRow;
        Insert: {
          id?: string;
          resi: string;
          name: string;
          status: ResiStatus;
          alamat?: string | null;
          courier?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resi?: string;
          name?: string;
          status?: ResiStatus;
          alamat?: string | null;
          courier?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      courier_options: {
        Row: CourierOptionRow;
        Insert: {
          id?: string;
          name: string;
          prefix?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          prefix?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
