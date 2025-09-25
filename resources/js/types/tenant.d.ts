/*'slug',
    'description',
    'is_active',
    'trial_ends_at',
    'suspended_at',
    'data' */
export interface Tenant {
  id: string;
  name: string;
  data: Record<string, any>;
  slug: string;
  description: string | null;
  is_active: boolean;
  trial_ends_at: string | null;
  suspended_at: string | null;
  created_at: string;
  updated_at: string;
}