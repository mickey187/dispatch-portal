"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";

const destIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#dc2626;border:2px solid #fff;
    box-shadow:0 1px 4px rgba(0,0,0,.4);transform:rotate(-45deg);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

const driverIcon = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#2563eb;color:#fff;border:2px solid #fff;
    box-shadow:0 1px 4px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font:700 12px system-ui;">🚚</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function TrackMap({
  stop,
  driver,
}: {
  stop: { lat: number; lng: number };
  driver: { name: string; position: { lat: number; lng: number } | null } | null;
}) {
  const center: [number, number] = driver?.position
    ? [(stop.lat + driver.position.lat) / 2, (stop.lng + driver.position.lng) / 2]
    : [stop.lat, stop.lng];

  return (
    <MapContainer center={center} zoom={13} className="h-64 w-full rounded-xl" preferCanvas>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[stop.lat, stop.lng]} icon={destIcon}>
        <Tooltip>Your delivery address</Tooltip>
      </Marker>
      {driver?.position && (
        <Marker position={[driver.position.lat, driver.position.lng]} icon={driverIcon}>
          <Tooltip direction="top" offset={[0, -12]}>
            {driver.name}
          </Tooltip>
        </Marker>
      )}
    </MapContainer>
  );
}
