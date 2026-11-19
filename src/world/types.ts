import { LangCode, LearningActivityKind } from '../types';

export type WorldTimeOfDay = 'dawn' | 'day' | 'twilight' | 'midnight';

export type DistrictKind =
  | 'city_center'
  | 'cafe_district'
  | 'travel_hub'
  | 'university'
  | 'business_quarter'
  | 'cultural_quarter';

export interface MapCoordinates {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
}

export interface InteractiveMapBuilding {
  id: string;
  district: DistrictKind;
  title: string;
  subtitle: string;
  icon: string;
  coordinates: MapCoordinates;
  accentColor: string;
  languageId: LangCode;
  requiredLevel: 'A1' | 'A2' | 'B1' | 'B2';
  prerequisiteUnits: number;
  primaryActivity: LearningActivityKind;
  charactersPresent: string[]; // Persona IDs (e.g. ['pierre'])
  vocabularyDomain: string;
  activeMissionId?: string;
}

export interface WorldEnvironmentTheme {
  timeOfDay: WorldTimeOfDay;
  skyColor: string;
  groundColor: string;
  roadColor: string;
  ambientTextColor: string;
  glowColor: string;
  streetLampActive: boolean;
  greeting: string;
}
