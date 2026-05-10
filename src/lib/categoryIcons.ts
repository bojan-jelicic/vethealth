import {
  Stethoscope,
  Syringe,
  Scissors,
  Bone,
  Microscope,
  HeartPulse,
  Pill,
  Activity,
  Thermometer,
  Bandage,
  ClipboardList,
  Dog,
  Cat,
  Bird,
  Rabbit,
  Fish,
  PawPrint,
  Hospital,
  Cross,
  ShieldCheck,
  FlaskConical,
  TestTube,
  Ambulance,
  Brain,
  Eye,
  Ear,
  Smile,
  Bath,
  Bug,
  Leaf,
  Sparkles,
  Camera,
  Calendar,
  FileText,
  Syringe as SyringeAlias,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

export type CategoryIconEntry = {
  name: string;
  label: string;
  Icon: LucideIcon;
};

export const CATEGORY_ICONS: CategoryIconEntry[] = [
  { name: 'Stethoscope', label: 'Stetoskop / Pregled', Icon: Stethoscope },
  { name: 'HeartPulse', label: 'Srce / Kardiologija', Icon: HeartPulse },
  { name: 'Activity', label: 'Aktivnost / Vitalni znaci', Icon: Activity },
  { name: 'Thermometer', label: 'Temperatura', Icon: Thermometer },
  { name: 'Syringe', label: 'Vakcinacija / Injekcija', Icon: Syringe },
  { name: 'Pill', label: 'Lijekovi / Tablete', Icon: Pill },
  { name: 'Bandage', label: 'Zavoj / Prva pomoć', Icon: Bandage },
  { name: 'Cross', label: 'Medicinski krst', Icon: Cross },
  { name: 'Hospital', label: 'Bolnica / Klinika', Icon: Hospital },
  { name: 'Ambulance', label: 'Hitna pomoć', Icon: Ambulance },
  { name: 'ShieldCheck', label: 'Zaštita / Prevencija', Icon: ShieldCheck },
  { name: 'Scissors', label: 'Hirurgija / Šišanje', Icon: Scissors },
  { name: 'Bone', label: 'Kost / Ortopedija', Icon: Bone },
  { name: 'Brain', label: 'Mozak / Neurologija', Icon: Brain },
  { name: 'Eye', label: 'Oko / Oftalmologija', Icon: Eye },
  { name: 'Ear', label: 'Uho', Icon: Ear },
  { name: 'Smile', label: 'Zubi / Stomatologija', Icon: Smile },
  { name: 'Microscope', label: 'Mikroskop / Laboratorija', Icon: Microscope },
  { name: 'FlaskConical', label: 'Tikvica / Lab analize', Icon: FlaskConical },
  { name: 'TestTube', label: 'Epruveta / Uzorci', Icon: TestTube },
  { name: 'ClipboardList', label: 'Karton / Dokumentacija', Icon: ClipboardList },
  { name: 'FileText', label: 'Nalaz / Izvještaj', Icon: FileText },
  { name: 'Calendar', label: 'Termini / Kalendar', Icon: Calendar },
  { name: 'Camera', label: 'Snimanje / Rendgen', Icon: Camera },
  { name: 'PawPrint', label: 'Šapica / Kućni ljubimci', Icon: PawPrint },
  { name: 'Dog', label: 'Pas', Icon: Dog },
  { name: 'Cat', label: 'Mačka', Icon: Cat },
  { name: 'Bird', label: 'Ptica', Icon: Bird },
  { name: 'Rabbit', label: 'Zec / Glodari', Icon: Rabbit },
  { name: 'Fish', label: 'Riba', Icon: Fish },
  { name: 'Bug', label: 'Paraziti / Insekti', Icon: Bug },
  { name: 'Bath', label: 'Kupanje / Higijena', Icon: Bath },
  { name: 'Sparkles', label: 'Njega / Wellness', Icon: Sparkles },
  { name: 'Leaf', label: 'Prirodno / Bilje', Icon: Leaf },
];

export const categoryIconMap: Record<string, LucideIcon> = CATEGORY_ICONS.reduce(
  (acc, entry) => {
    acc[entry.name] = entry.Icon;
    return acc;
  },
  {} as Record<string, LucideIcon>,
);

export const getCategoryIcon = (name?: string | null): LucideIcon => {
  if (!name) return HelpCircle;
  return categoryIconMap[name] || HelpCircle;
};

export { HelpCircle };
void SyringeAlias;