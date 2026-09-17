// Tipos manuales de las tablas de Supabase usadas en la Fase 1.
// Cuando el proyecto esté vinculado con el CLI, esto se puede reemplazar por
// `supabase gen types typescript` para que se generen solos.
//
// Todo acá usa `type`, no `interface`: los genéricos de @supabase/postgrest-js
// (Omit, keyof, condicionales) no resuelven bien sobre una interface y
// `.insert()`/`.update()` terminan tipados como `never` sin avisar en el
// punto donde se declara el tipo (documentado y confirmado a mano).

export type TipoTurnoDB = "normal" | "feriado" | "libre";
export type OrigenTurnoDB = "manual" | "texto" | "foto" | "calendar";
export type ModoExtrasDB = "dia" | "semana" | "ambos";
export type EstadoImportacionDB = "pendiente" | "listo" | "error" | "confirmado";
export type RolEquipoDB = "admin" | "miembro";
export type EstadoSuscripcionDB = "trial" | "activa" | "vencida" | "cancelada";

export type Json = string | number | boolean | null | { [clave: string]: Json } | Json[];

export type ProfileRow = {
  id: string;
  nombre: string | null;
  email: string | null;
  avatar_url: string | null;
  tarifa_hora: number;
  moneda: string;
  zona_horaria: string;
  admin_habilitado: boolean;
  created_at: string;
  updated_at: string;
};

export type OvertimeRuleRow = {
  id: string;
  user_id: string;
  team_id: string | null;
  horas_dia: number;
  horas_semana: number;
  modo: ModoExtrasDB;
  tramo1_horas: number;
  tramo1_pct: number;
  tramo2_pct: number;
  feriado_pct: number;
  nocturno_pct: number;
  nocturno_inicio: string;
  nocturno_fin: string;
  inicio_semana: string;
  created_at: string;
  updated_at: string;
};

export type ShiftRow = {
  id: string;
  user_id: string;
  team_id: string | null;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  descanso_min: number;
  tipo: TipoTurnoDB;
  origen: OrigenTurnoDB;
  nota: string | null;
  gcal_event_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ScheduleImportRow = {
  id: string;
  user_id: string;
  team_id: string | null;
  imagen_path: string | null;
  texto: string | null;
  resultado_json: Json | null;
  estado: EstadoImportacionDB;
  created_at: string;
};

export type TeamRow = {
  id: string;
  nombre: string;
  owner_id: string;
  created_at: string;
};

export type TeamMemberRow = {
  team_id: string;
  user_id: string;
  rol: RolEquipoDB;
  created_at: string;
};

export type InvitationRow = {
  id: string;
  team_id: string;
  email: string | null;
  rol: RolEquipoDB;
  token: string;
  expira_en: string;
  aceptada_en: string | null;
  created_at: string;
};

export type SubscriptionRow = {
  id: string;
  owner_id: string;
  team_id: string;
  plan: "admin";
  estado: EstadoSuscripcionDB;
  personas_incluidas: number;
  personas_extra: number;
  proveedor: string | null;
  proveedor_sub_id: string | null;
  periodo_fin: string | null;
  trial_fin: string;
  created_at: string;
  updated_at: string;
};

export type HolidayRow = {
  fecha: string;
  nombre: string;
  pais: string;
};

export type GoogleConnectionRow = {
  user_id: string;
  refresh_token: string;
  calendar_id: string | null;
  conectado_en: string;
};

export type BillingEventRow = {
  id: string;
  proveedor: string;
  tipo: string;
  payload_json: Json | null;
  procesado_en: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      overtime_rules: {
        Row: OvertimeRuleRow;
        Insert: Partial<OvertimeRuleRow> & { user_id: string };
        Update: Partial<OvertimeRuleRow>;
        Relationships: [];
      };
      shifts: {
        Row: ShiftRow;
        Insert: Partial<ShiftRow> & { user_id: string; fecha: string };
        Update: Partial<ShiftRow>;
        Relationships: [];
      };
      schedule_imports: {
        Row: ScheduleImportRow;
        Insert: Partial<ScheduleImportRow> & { user_id: string };
        Update: Partial<ScheduleImportRow>;
        Relationships: [];
      };
      teams: {
        Row: TeamRow;
        Insert: Partial<TeamRow> & { nombre: string; owner_id: string };
        Update: Partial<TeamRow>;
        Relationships: [];
      };
      team_members: {
        Row: TeamMemberRow;
        Insert: Partial<TeamMemberRow> & { team_id: string; user_id: string };
        Update: Partial<TeamMemberRow>;
        Relationships: [];
      };
      invitations: {
        Row: InvitationRow;
        Insert: Partial<InvitationRow> & { team_id: string };
        Update: Partial<InvitationRow>;
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: Partial<SubscriptionRow> & { owner_id: string; team_id: string };
        Update: Partial<SubscriptionRow>;
        Relationships: [];
      };
      billing_events: {
        Row: BillingEventRow;
        Insert: Partial<BillingEventRow> & { proveedor: string; tipo: string };
        Update: Partial<BillingEventRow>;
        Relationships: [];
      };
      google_connections: {
        Row: GoogleConnectionRow;
        Insert: Partial<GoogleConnectionRow> & { user_id: string; refresh_token: string };
        Update: Partial<GoogleConnectionRow>;
        Relationships: [];
      };
      holidays: {
        Row: HolidayRow;
        Insert: Partial<HolidayRow> & { fecha: string; nombre: string };
        Update: Partial<HolidayRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      obtener_invitacion: {
        Args: { p_token: string };
        Returns: { equipo_nombre: string | null; rol: RolEquipoDB | null; valida: boolean }[];
      };
      aceptar_invitacion: {
        Args: { p_token: string };
        Returns: void;
      };
      suscripcion_activa: {
        Args: { p_team_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
