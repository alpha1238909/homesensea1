import type { AppSnapshot } from "../types";
import type { SensorReading } from "../services/data-assistant.service";

/** Compact, model-readable snapshot of everything HomeSense AI currently knows. */
export function buildHomeContext(snapshot: AppSnapshot, sensors: SensorReading[] = []) {
  const today = new Date().toDateString();
  const events = snapshot.events.slice(0, 60).map((event) => ({
    time: event.timestamp,
    today: new Date(event.timestamp).toDateString() === today,
    kind: event.kind,
    room: event.room,
    resource: event.resource,
    detail: event.detail,
    consumption: event.consumption,
    unit: event.unit,
    cost: event.cost,
    confidence: event.confidence,
    source: event.source,
  }));

  return JSON.stringify(
    {
      today,
      home: snapshot.homeName,
      monitoringDay: snapshot.monitoringDay,
      currency: snapshot.tariffs.currency,
      tariffs: snapshot.tariffs,
      waterMeterReading: snapshot.profile?.waterMeterReading ?? snapshot.waterReading,
      electricityMeterReading: snapshot.profile?.electricityMeterReading ?? 0,
      savedTotal: snapshot.savedTotal,
      devices: snapshot.devices.map((device) => ({
        name: device.name,
        room: device.room,
        state: device.state,
        connected: device.connected,
      })),
      sensors: sensors.map((sensor) => ({
        id: sensor.id,
        type: sensor.type,
        room: sensor.room,
        state: sensor.state,
        value: sensor.value,
        source: sensor.source,
      })),
      events,
    },
    null,
    0,
  );
}
