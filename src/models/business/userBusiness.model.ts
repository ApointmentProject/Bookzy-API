export default interface UserBusiness {
  id?: number;
  user_id: number;
  business_id: number;
  role: 'owner' | 'manager' | 'employee' | 'receptionist';
  is_active?: boolean;
  created_at?: string;
  created_by?: number;
}
