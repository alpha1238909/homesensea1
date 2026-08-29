export type Resource = "water" | "electricity" | "safety";
export type SensorState = "on" | "off";
export type Confidence = "High" | "Medium" | "Low";

export type HomeEvent = {
  id: string;
  timestamp: string;
  kind: string;
  room: string;
  resource: Resource;
  detail: string;
  cost: number;
  consumption: number;
  unit: "L" | "kWh" | "event";
  confidence: number;
  severity: "info" | "warning" | "critical" | "success";
  source: string;
};

export type Device = {
  id: string;
  name: string;
  room: string;
  type: "valve" | "relay" | "plug" | "hub";
  connected: boolean;
  state: "OPEN" | "CLOSED" | "ON" | "OFF" | "UPDATING" | "ERROR";
  lastActivity: string;
};

export type AutomationRule = {
  id: string;
  name: string;
  condition: string;
  delayMinutes: number;
  action: string;
  deviceId: string;
  enabled: boolean;
  safetyConfirmed: boolean;
};

export type Tariffs = { electricity: number; water: number; currency: "₸" };
export type ApplianceModel = { id: string; name: string; room: string; powerKw: number };

export type AppSnapshot = {
  homeName: string;
  monitoringDay: number;
  automationEnabled: boolean;
  tariffs: Tariffs;
  events: HomeEvent[];
  devices: Device[];
  rules: AutomationRule[];
  appliances: ApplianceModel[];
  waterReading: number;
  savedTotal: number;
  profile?: HomeProfile;
};

export type HomeProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment: string;
  areaM2: number;
  roomCount: number;
  occupants: number;
  previousUtilitiesKzt: number;
  currentUtilitiesKzt: number;
  waterMeterNumber: string;
  waterMeterReading: number;
  electricityMeterNumber: string;
  electricityMeterReading: number;
};

export type DetectionPayload = {
  camera_id: string;
  timestamp: string;
  room: string;
  detections: Array<{ object: string; confidence: number; state?: SensorState }>;
};

export type AIReportInput = {
  monitoringDays: number;
  waterConsumptionM3: number;
  estimatedElectricityKwh: number;
  totalPotentialWaste: number;
  events: HomeEvent[];
};
