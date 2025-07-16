interface Business {
  id?: number;
  business_name: string;
  business_slug: string;
  category_id: number;
  phone_number: string;
  email: string;
  website?: string;
  address: string;
  province: string;
  canton: string;
  district: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export default Business;