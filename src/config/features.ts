/**
 * MVP feature flags.
 * Set to `true` to re-enable a hidden module without code changes.
 * Keep keys stable — they are referenced by FeatureRoute and nav menus.
 */
export const FEATURES = {
  // Public site
  publicPetShop: false,
  publicAppointments: false,
  publicChat: false,
  themeToggle: false,

  // Admin modules
  adminCRM: false, // Klijenti, Ljubimci, Posjete, Dokumenti
  adminInventory: false,
  adminReminders: false,
  adminTemplates: false,
  adminMessagesPage: true, // poruke iz kontakt forme
  adminQuickActions: false, // "Nova posjeta" / "Novi nalaz" u top baru
} as const;

export type FeatureFlag = keyof typeof FEATURES;

export const isEnabled = (flag: FeatureFlag): boolean => FEATURES[flag];