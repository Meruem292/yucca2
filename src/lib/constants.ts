
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
  SlidersHorizontal,
  Plus, // Added for Add New Device button
  Save, // Added for Save Configuration button
  ListPlus, // Added for Add Sample Data button
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
    title: 'Plants', 
    href: '/devices', 
    icon: 'Leaf',
  },
  {
    title: 'Control', 
    href: '/settings', // Pointing to new settings page
    icon: 'SlidersHorizontal',
  },
  {
    title: 'Settings',
    href: '/settings', // Pointing to new settings page
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
    href: '/settings', // Corrected to point to the new settings page
    icon: 'Settings',
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
    case 'Plus': return Plus;
    case 'Save': return Save;
    case 'ListPlus': return ListPlus;
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
