
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "app_config": {
                  Row: {
                    "id": boolean,"owner_email": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: boolean,"owner_email": string
                  }
                  Update: {
                    "id"?: boolean,"owner_email"?: string
                  }
                  Relationships: [
                    
                  ]
                },"categories": {
                  Row: {
                    "color": string,"created_at": string,"created_by": string | null,"id": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "color": string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"name": string
                  }
                  Update: {
                    "color"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"event_links": {
                  Row: {
                    "event_id": string,"id": string,"position": number,"title": string | null,"url": string
                  }
                  ComputedFields: never
                  Insert: {
                    "event_id": string,"id"?: string,"position"?: number,"title"?: string | null,"url": string
                  }
                  Update: {
                    "event_id"?: string,"id"?: string,"position"?: number,"title"?: string | null,"url"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_links_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"event_participants": {
                  Row: {
                    "added_at": string,"event_id": string,"left_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "added_at"?: string,"event_id": string,"left_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "added_at"?: string,"event_id"?: string,"left_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_participants_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "event_participants_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "all_day": boolean,"category_id": string | null,"created_at": string,"created_by": string,"description": string | null,"end_at": string,"id": string,"location": string | null,"start_at": string,"title": string,"updated_at": string,"visibility": Database["public"]['Enums']["event_visibility"]
                  }
                  ComputedFields: never
                  Insert: {
                    "all_day"?: boolean,"category_id"?: string | null,"created_at"?: string,"created_by"?: string,"description"?: string | null,"end_at": string,"id"?: string,"location"?: string | null,"start_at": string,"title": string,"updated_at"?: string,"visibility"?: Database["public"]['Enums']["event_visibility"]
                  }
                  Update: {
                    "all_day"?: boolean,"category_id"?: string | null,"created_at"?: string,"created_by"?: string,"description"?: string | null,"end_at"?: string,"id"?: string,"location"?: string | null,"start_at"?: string,"title"?: string,"updated_at"?: string,"visibility"?: Database["public"]['Enums']["event_visibility"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "events_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"invites": {
                  Row: {
                    "created_at": string,"created_by": string | null,"expires_at": string,"id": string,"revoked_at": string | null,"token_hash": string,"used_at": string | null,"used_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"expires_at"?: string,"id"?: string,"revoked_at"?: string | null,"token_hash": string,"used_at"?: string | null,"used_by"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"expires_at"?: string,"id"?: string,"revoked_at"?: string | null,"token_hash"?: string,"used_at"?: string | null,"used_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "invites_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invites_used_by_fkey"
      columns: ["used_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"email": string,"full_name": string | null,"id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"email": string,"full_name"?: string | null,"id": string
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"email"?: string,"full_name"?: string | null,"id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"team": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"owner_id": string,"singleton": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"owner_id": string,"singleton"?: boolean
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"owner_id"?: string,"singleton"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "team_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"team_members": {
                  Row: {
                    "joined_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "joined_at"?: string,"user_id": string
                  }
                  Update: {
                    "joined_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "team_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "accept_invite":
{ Args: { "p_token": string }; Returns: string
                           },
"create_invite":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"create_team":
{ Args: { "p_name": string }; Returns: string
                           },
"get_access_state":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"revoke_invite":
{ Args: { "p_invite_id": string }; Returns: undefined
                           }
          }
          Enums: {
            "event_visibility": "personal"|"group"|"team"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "event_visibility": ["personal", "group", "team"]
          }
        }
} as const
