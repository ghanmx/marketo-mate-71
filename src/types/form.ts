import { z } from "zod";

export const vehicleFormSchema = z.object({
  username: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  vehicleMake: z.string().min(1, "Brand is required"),
  vehicleModel: z.string().min(1, "Model is required"),
  vehicleYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicleColor: z.string().min(1, "Color is required"),
  issueDescription: z.string().min(10, "Please provide more details about the issue"),
  truckType: z.enum(["A", "B", "C", "D"]),
  tollFees: z.number().min(0, "Toll fees cannot be negative")
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
export type FormData = {
  username: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  issueDescription: string;
  truckType: "A" | "B" | "C" | "D";
  tollFees: number;
};