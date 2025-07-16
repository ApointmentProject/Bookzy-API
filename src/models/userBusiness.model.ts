interface UserBusiness {
  id?: number;
  user_id: number;
  business_id: number;
  role: 'owner' | 'manager' | 'employee' | 'receptionist';
  can_manage_appointments?: boolean;
  can_manage_services?: boolean;
  can_manage_employees?: boolean;
  can_view_reports?: boolean;
  can_manage_settings?: boolean;
  is_active?: boolean;
  created_at?: Date;
  created_by?: number;
}

export default UserBusiness;