import type { AIReportInput, ApplianceModel, DetectionPayload, HomeEvent, Tariffs } from "../types";

export interface DetectionSource {
  next(): Promise<DetectionPayload>;
}

export interface AudioClassificationService {
  start(): Promise<void>;
  stop(): Promise<void>;
  getState(): Promise<"listening" | "water" | "idle">;
}

export interface WaterMeterService {
  getReading(): Promise<{ currentM3: number; dailyM3: number; monthlyM3: number }>;
}

export interface BluetoothService {
  connect(deviceId: string): Promise<boolean>;
  disconnect(deviceId: string): Promise<boolean>;
  getStatus(deviceId: string): Promise<string>;
  sendCommand(deviceId: string, command: string): Promise<{ ok: boolean; state: string }>;
}

export class ElectricityEstimationService {
  estimate(model: ApplianceModel, durationMinutes: number, tariffs: Tariffs) {
    const kwh = model.powerKw * (durationMinutes / 60);
    return { kwh, cost: kwh * tariffs.electricity };
  }
}

export class WasteCalculationService {
  electricity(args: { label: string; room: string; durationMinutes: number; model: ApplianceModel; tariffs: Tariffs; confidence: number }): HomeEvent {
    const estimated = new ElectricityEstimationService().estimate(args.model, args.durationMinutes, args.tariffs);
    return event({
      kind: `${args.label.toUpperCase()} LEFT ON`, room: args.room, resource: "electricity",
      detail: `${args.durationMinutes} min without detected presence`, cost: estimated.cost,
      consumption: estimated.kwh, unit: "kWh", confidence: args.confidence,
      severity: args.label.toLowerCase().includes("stove") ? "critical" : "warning",
      source: "Camera detection → appliance power model → duration → tariff",
    });
  }

  water(args: { room: string; durationMinutes: number; flowLitersPerMinute: number; tariffs: Tariffs; confidence: number }): HomeEvent {
    const liters = args.durationMinutes * args.flowLitersPerMinute;
    return event({
      kind: "WATER FLOW WITHOUT PRESENCE", room: args.room, resource: "water",
      detail: `${args.durationMinutes} min without detected presence`, cost: (liters / 1000) * args.tariffs.water,
      consumption: liters, unit: "L", confidence: args.confidence, severity: "warning",
      source: "Phone audio + manual event → flow model → duration → water tariff",
    });
  }
}

export function buildAIReport(input: AIReportInput) {
  if (input.monitoringDays < 3 || input.events.length < 3) {
    return { ready: false, summary: "Not enough data to confidently estimate this. Continue monitoring to build a reliable pattern." };
  }
  const waste = input.events.filter((item) => item.cost > 0);
  const byResource = waste.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.resource]: (acc[item.resource] ?? 0) + item.cost }), {});
  const byRoom = waste.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.room]: (acc[item.room] ?? 0) + item.cost }), {});
  const topResource = topKey(byResource) ?? "resource use";
  const topRoom = topKey(byRoom) ?? "your home";
  const common = Object.entries(waste.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.kind]: (acc[item.kind] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1])[0];
  return {
    ready: true,
    summary: `Across ${input.monitoringDays} monitored days, ${topResource} was the largest detected source of potential waste. ${topRoom} had the highest estimated impact. The most repeated pattern was ${common?.[0]?.toLowerCase() ?? "insufficiently classified activity"} (${common?.[1] ?? 0} events). Based only on recorded activity and configured tariffs, estimated monthly avoidable spending is ${Math.round(input.totalPotentialWaste).toLocaleString("en-US")} ₸.`,
    topResource,
    topRoom,
    opportunity: topResource === "water" ? "Install a smart water valve with a configurable delay." : "Install a smart relay or plug on the highest-impact circuit.",
  };
}

function topKey(values: Record<string, number>) {
  return Object.entries(values).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function event(input: Omit<HomeEvent, "id" | "timestamp">): HomeEvent {
  return { ...input, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
}
