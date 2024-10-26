import { useRef, useCallback, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LocationMarker } from "./map/LocationMarker";
import { DraggableMarker } from "./map/DraggableMarker";
import { MapControls } from "./map/MapControls";
import { BorderControls } from "./map/BorderControls";
import { FloatingPanel } from "./map/FloatingPanel";
import { useToast } from "@/components/ui/use-toast";
import PaymentWindow from "./payment/PaymentWindow";
import { Button } from "@/components/ui/button";
import { RouteDisplay } from "./map/RouteDisplay";

const enterpriseIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ENTERPRISE_LOCATIONS = [
  { lat: 26.510272, lng: -100.006323, name: "Main Service Center" },
];

interface TowMapProps {
  onPickupSelect: (location: { lat: number; lng: number }) => void;
  onDropSelect: (location: { lat: number; lng: number }) => void;
  pickupLocation: { lat: number; lng: number } | null;
  dropLocation: { lat: number; lng: number } | null;
}

const TowMap = ({ onPickupSelect, onDropSelect, pickupLocation, dropLocation }: TowMapProps) => {
  const [selectingPickup, setSelectingPickup] = useState(false);
  const [selectingDrop, setSelectingDrop] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const { toast } = useToast();

  const handleLocationSelect = useCallback((location: { lat: number; lng: number }) => {
    if (selectingPickup) {
      onPickupSelect(location);
      setSelectingPickup(false);
      toast({
        title: "Pickup Location Set",
        description: "Click and drag the marker to adjust the location",
      });
    } else if (selectingDrop) {
      onDropSelect(location);
      setSelectingDrop(false);
      toast({
        title: "Drop-off Location Set",
        description: "Click and drag the marker to adjust the location",
      });
    }
  }, [selectingPickup, selectingDrop, onPickupSelect, onDropSelect, toast]);

  const handlePaymentSubmit = (result: { success: boolean; error?: string }) => {
    if (result.success) {
      toast({
        title: "Success",
        description: "Your tow truck request has been confirmed!",
      });
    }
  };

  return (
    <div className="fixed inset-0">
      <FloatingPanel position="top" className="max-w-md mx-auto">
        <MapControls 
          selectingPickup={selectingPickup}
          selectingDrop={selectingDrop}
          onPickupClick={() => {
            setSelectingPickup(true);
            setSelectingDrop(false);
            toast({
              title: "Select Pickup Location",
              description: "Click on the map to set pickup location",
            });
          }}
          onDropClick={() => {
            setSelectingDrop(true);
            setSelectingPickup(false);
            toast({
              title: "Select Drop-off Location",
              description: "Click on the map to set drop-off location",
            });
          }}
        />
      </FloatingPanel>

      <MapContainer
        center={[ENTERPRISE_LOCATIONS[0].lat, ENTERPRISE_LOCATIONS[0].lng]}
        zoom={13}
        style={{ height: "100vh", width: "100vw" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker onLocationSelect={handleLocationSelect} />
        <BorderControls />
        
        {ENTERPRISE_LOCATIONS.map((location, index) => (
          <DraggableMarker
            key={index}
            position={[location.lat, location.lng]}
            onDragEnd={() => {}}
            icon={enterpriseIcon}
            label={location.name}
            draggable={false}
          />
        ))}

        {pickupLocation && (
          <DraggableMarker 
            position={[pickupLocation.lat, pickupLocation.lng]}
            onDragEnd={(latlng) => onPickupSelect({ lat: latlng.lat, lng: latlng.lng })}
            icon={pickupIcon}
            label="Pickup Location"
            draggable={true}
          />
        )}
        
        {dropLocation && (
          <DraggableMarker 
            position={[dropLocation.lat, dropLocation.lng]}
            onDragEnd={(latlng) => onDropSelect({ lat: latlng.lat, lng: latlng.lng })}
            icon={dropIcon}
            label="Drop-off Location"
            draggable={true}
          />
        )}
      </MapContainer>

      <FloatingPanel position="bottom" className="max-w-xl mx-auto">
        <div className="space-y-4">
          <RouteDisplay pickupLocation={pickupLocation} dropLocation={dropLocation} />
          {pickupLocation && dropLocation && (
            <Button 
              className="w-full" 
              onClick={() => setShowPayment(true)}
            >
              Request Tow Truck
            </Button>
          )}
        </div>
      </FloatingPanel>

      <PaymentWindow
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onPaymentSubmit={handlePaymentSubmit}
        totalCost={0} // This will be updated when payment is initiated
      />
    </div>
  );
};

export default TowMap;
