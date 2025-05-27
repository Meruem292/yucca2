
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Smartphone,
  Settings,
  BarChart3,
  ChevronRight,
  Clock,
  Droplets,
  Thermometer,
  CloudRain,
  Waves,
  FlaskConical,
  Leaf,
  PackageSearch,
  AlertTriangle,
  CheckCircle2,
  CircleCheck, 
  Settings2,
  SlidersHorizontal, // Added for new bottom nav
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon | string; // Allow string for icon name
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export const APP_NAME = "Yucca";

// This can be used for sidebar/desktop if needed later, or removed
export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Devices',
    href: '/devices',
    icon: 'Smartphone',
  },
];

export const bottomNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Plants', // Assuming 'Plants' page, using /devices as placeholder
    href: '/devices', // Placeholder, adjust if a dedicated /plants page exists
    icon: 'Leaf',
  },
  {
    title: 'Control', // Assuming 'Control' page, using /settings as placeholder
    href: '/settings', // Placeholder, adjust if a dedicated /control page exists
    icon: 'SlidersHorizontal',
  },
  {
    title: 'Settings',
    href: '/settings', // Placeholder
    icon: 'Settings',
  },
];


export const userNavItems: NavItem[] = [
 {
    title: 'Profile',
    href: '#', // Placeholder
    icon: 'Settings', 
    disabled: true,
  },
  {
    title: 'Settings',
    href: '#', // Placeholder
    icon: 'Settings',
    disabled: true,
  },
];

// Store icon names as strings
export const SENSOR_ICON_NAMES = {
  'soil_moisture': 'Droplets',
  'soil_temperature': 'Thermometer',
  'air_temperature': 'Thermometer',
  'air_humidity': 'CloudRain',
  'water_level': 'Waves',
  'fertilizer_level': 'FlaskConical',
} as const;

export type SensorIconNameType = keyof typeof SENSOR_ICON_NAMES;

// Helper to get Lucide icon component by name
export const getLucideIcon = (name: string): LucideIcon | null => {
  switch (name) {
    case 'Droplets': return Droplets;
    case 'Thermometer': return Thermometer;
    case 'CloudRain': return CloudRain;
    case 'Waves': return Waves;
    case 'FlaskConical': return FlaskConical;
    case 'Leaf': return Leaf;
    case 'PackageSearch': return PackageSearch;
    case 'AlertTriangle': return AlertTriangle;
    case 'CheckCircle2': return CheckCircle2;
    case 'CircleCheck': return CircleCheck;
    case 'LayoutDashboard': return LayoutDashboard;
    case 'Smartphone': return Smartphone;
    case 'Settings': return Settings;
    case 'Settings2': return Settings2;
    case 'BarChart3': return BarChart3;
    case 'ChevronRight': return ChevronRight;
    case 'Clock': return Clock;
    case 'SlidersHorizontal': return SlidersHorizontal;
    default: return null;
  }
};


export type SensorType = keyof typeof SENSOR_ICON_NAMES;

export const SENSOR_DISPLAY_NAMES: Record<SensorType, string> = {
  'soil_moisture': 'Soil Moisture',
  'soil_temperature': 'Soil Temp.',
  'air_temperature': 'Air Temp.',
  'air_humidity': 'Humidity',
  'water_level': 'Water Level',
  'fertilizer_level': 'Fertilizer Level',
};
