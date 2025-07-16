interface BusinessSocialNetworks {
  id?: number;
  business_id: number;
  instagram_url?: string;
  facebook_url?: string;
  whatsapp_number?: string;
  tiktok_url?: string;
  youtube_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export default BusinessSocialNetworks;