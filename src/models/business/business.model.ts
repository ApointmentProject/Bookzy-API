export default interface Business {
  id?: number;
  business_name: string;
  business_slug?: string;
  category_id: number;
  phone_number: string;
  email: string;
  address: string;
  province: string;
  canton: string;
  district: string;
  description?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}
