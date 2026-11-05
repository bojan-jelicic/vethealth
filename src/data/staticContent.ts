/**
 * Static content for the public site (used when FEATURES.staticMode = true).
 * All editable content lives in ./content.json:
 *  - clinic: name, phone, email, address, working hours, social links
 *  - categories / services: price list (price in KM, duration in minutes)
 *  - blogPosts: published blog articles (status must be "published")
 * Images referenced as /content/<file> live in public/content/.
 */
import content from './content.json';
import type { Service, ServiceCategory, ServiceContentBlock, CategoryWithServices } from '@/hooks/useAppointmentData';

export interface StaticBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  hero_image_url: string | null;
  content_blocks: ServiceContentBlock[] | null;
  author_name: string | null;
  read_time_minutes: number;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at?: string;
}

type StaticService = Service & { slug?: string | null };

export const staticClinic = content.clinic;
export const staticCategories = content.categories as ServiceCategory[];
export const staticServices = (content.services as unknown as StaticService[]).map((s) => ({
  ...s,
  content_blocks: Array.isArray(s.content_blocks) ? s.content_blocks : [],
}));

export const staticBlogPosts = (content.blogPosts as unknown as StaticBlogPost[])
  .filter((p) => p.status === 'published')
  .sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at));

export const getStaticCategoriesWithServices = (): CategoryWithServices[] => {
  const cats = [...staticCategories].sort((a, b) => a.sort_order - b.sort_order);
  const byName = [...staticServices].sort((a, b) => a.name.localeCompare(b.name, 'sr'));
  const result: CategoryWithServices[] = cats.map((c) => ({
    ...c,
    services: byName.filter((s) => s.category_id === c.id),
  }));
  const rest = byName.filter((s) => !s.category_id);
  if (rest.length) {
    result.push({ id: 'uncategorized', name: 'Ostale usluge', description: null, icon: null, sort_order: 999, services: rest });
  }
  return result;
};

export const getStaticServiceBySlug = (slug: string) => {
  const s = staticServices.find((x) => x.slug === slug);
  if (!s) return null;
  const cat = staticCategories.find((c) => c.id === s.category_id);
  return { ...s, service_categories: cat ? { name: cat.name } : null };
};
