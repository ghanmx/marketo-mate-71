import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { VehicleDetails } from "./form/VehicleDetails";
import { ServiceRequirements } from "./form/ServiceRequirements";
import { downloadServiceInfo } from "@/utils/downloadUtils";
import { VehicleFormHeader } from "./form/VehicleFormHeader";
import { VehicleFormActions } from "./form/VehicleFormActions";
import { TowTruckSelector } from "./form/TowTruckSelector";
import { LocationFields } from "./form/LocationFields";
import { useState } from "react";
import { TowTruckType } from "@/utils/downloadUtils";
import { useTowingCost } from "@/hooks/useTowingCost";
import { useVehicleForm } from "@/hooks/useVehicleForm";
import { useToast } from "@/hooks/use-toast";
import { FormData } from "@/types/form";
import { RouteDisplay } from "./map/RouteDisplay";

interface VehicleFormProps {
  pickupLocation: { lat: number; lng: number } | null;
  dropLocation: { lat: number; lng: number } | null;
  pickupAddress: string;
  dropAddress: string;
  serviceType: 'standard' | 'flatbed' | 'emergency';
  onManeuverChange?: (requiresManeuver: boolean) => void;
  onVehicleModelChange?: (model: string) => void;
  onPickupSelect: (location: { lat: number; lng: number; address: string }) => void;
  onDropSelect: (location: { lat: number; lng: number; address: string }) => void;
}

const VehicleForm = ({
  pickupLocation,
  dropLocation,
  pickupAddress,
  dropAddress,
  serviceType,
  onManeuverChange,
  onVehicleModelChange,
  onPickupSelect,
  onDropSelect
}: VehicleFormProps) => {
  const [requiresManeuver, setRequiresManeuver] = useState(false);
  const [truckType, setTruckType] = useState<TowTruckType>('A');
  const [tollFees, setTollFees] = useState(0);
  const { toast } = useToast();
  const { form, onSubmit, isPending } = useVehicleForm(pickupLocation, dropLocation, serviceType);

  const costDetails = useTowingCost(
    pickupLocation,
    dropLocation,
    requiresManeuver,
    truckType,
    tollFees
  );

  const handleManeuverChange = (checked: boolean) => {
    setRequiresManeuver(checked);
    onManeuverChange?.(checked);
  };

  const generateFormDataText = () => {
    const formData = form.getValues();
    return `
Usuario: ${formData.username}
Vehículo: ${formData.vehicleMake} ${formData.vehicleModel} ${formData.vehicleYear}
Color: ${formData.vehicleColor}
Tipo de Grúa: ${formData.truckType}
Casetas: $${tollFees}
Descripción: ${formData.issueDescription}
Ubicación de recogida: ${pickupLocation ? `${pickupLocation.lat}, ${pickupLocation.lng}` : 'No especificada'}
Ubicación de entrega: ${dropLocation ? `${dropLocation.lat}, ${dropLocation.lng}` : 'No especificada'}
Tipo de servicio: ${serviceType}
Requiere maniobra especial: ${requiresManeuver ? 'Sí' : 'No'}
    `.trim();
  };

  const handleDownload = async (format: 'csv' | 'txt') => {
    if (!form.formState.isValid) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before downloading.",
        variant: "destructive",
      });
      return;
    }

    const formData = form.getValues();
    
    await downloadServiceInfo(
      format,
      formData,
      pickupLocation,
      dropLocation,
      serviceType,
      requiresManeuver
    );
  };

  return (
    <div className="space-y-6">
      <RouteDisplay pickupLocation={pickupLocation} dropLocation={dropLocation} />
      
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
        <VehicleFormHeader />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <LocationFields
              pickupLocation={pickupLocation}
              dropLocation={dropLocation}
              pickupAddress={pickupAddress}
              dropAddress={dropAddress}
              onPickupSelect={onPickupSelect}
              onDropSelect={onDropSelect}
            />

            <VehicleDetails
              onBrandChange={(brand) => form.setValue('vehicleMake', brand)}
              onModelChange={(model) => {
                form.setValue('vehicleModel', model);
                onVehicleModelChange?.(model);
              }}
              onYearChange={(year) => form.setValue('vehicleYear', Number(year))}
              onColorChange={(color) => form.setValue('vehicleColor', color)}
            />

            <TowTruckSelector
              form={form}
              onTruckTypeChange={setTruckType}
              onTollFeesChange={setTollFees}
            />

            <ServiceRequirements
              form={form}
              requiresManeuver={requiresManeuver}
              onManeuverChange={handleManeuverChange}
            />

            <VehicleFormActions
              onDownload={handleDownload}
              onCopy={async () => {
                try {
                  await navigator.clipboard.writeText(generateFormDataText());
                  toast({
                    title: "Información copiada",
                    description: "Los detalles del servicio se han copiado al portapapeles",
                  });
                } catch (err) {
                  toast({
                    title: "Error",
                    description: "No se pudo copiar al portapapeles",
                    variant: "destructive",
                  });
                }
              }}
              onSubmit={() => form.handleSubmit(onSubmit)}
              isPending={isPending}
              formData={generateFormDataText()}
            />
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default VehicleForm;