import { LayoutDashboard, Smartphone, Settings, GitFork, BarChart3, CircleHelpIcon, Droplets, Thermometer, CloudRain, Waves, FlaskConical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export const APP_NAME = "Yucca";

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Devices',
    href: '/devices',
    icon: Smartphone,
  },
];

export const userNavItems: NavItem[] = [
 {
    title: 'Profile',
    href: '#', // Placeholder
    icon: Settings, // Using Settings as a generic profile icon
    disabled: true,
  },
  {
    title: 'Settings',
    href: '#', // Placeholder
    icon: Settings,
    disabled: true,
  },
];

export const SENSOR_ICONS: Record<string, LucideIcon> = {
  'soil_moisture': Droplets,
  'soil_temperature': Thermometer,
  'air_temperature': Thermometer,
  'air_humidity': CloudRain,
  'water_level': Waves,
  'fertilizer_level': FlaskConical,
};

export type SensorType = keyof typeof SENSOR_ICONS;

export const SENSOR_DISPLAY_NAMES: Record<SensorType, string> = {
  'soil_moisture': 'Soil Moisture',
  'soil_temperature': 'Soil Temperature',
  'air_temperature': 'Air Temperature',
  'air_humidity': 'Air Humidity',
  'water_level': 'Water Level',
  'fertilizer_level': 'Fertilizer Level',
};
