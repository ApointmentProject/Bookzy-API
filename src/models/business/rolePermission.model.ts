export default interface RolePermission {
  id?: number;
  role: string;
  permissions: Record<string, boolean>; // JSONB
  description?: string;
  created_at?: string;
}
