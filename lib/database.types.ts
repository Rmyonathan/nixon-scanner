export type ResiStatus = "pengiriman" | "belum di pack";

export type ResiRow = {
  id: string;
  resi: string;
  name: string;
  status: ResiStatus;
  alamat: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
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
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
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
