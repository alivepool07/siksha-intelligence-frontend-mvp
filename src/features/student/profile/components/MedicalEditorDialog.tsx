import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileService } from "@/services/profile";
import type { StudentMedicalRecordDTO } from "@/services/types/profile";

const medicalSchema = z.object({
  emergencyContactName: z.string().min(2, "Emergency Contact Name is required."),
  emergencyContactPhone: z.string().min(7, "Phone number is required."),
  physicianName: z.string().optional(),
  physicianPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
});

type MedicalFormValues = z.infer<typeof medicalSchema>;

interface MedicalEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: StudentMedicalRecordDTO | null;
}

export function MedicalEditorDialog({ isOpen, onClose, initialData }: MedicalEditorDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MedicalFormValues>({
    resolver: zodResolver(medicalSchema),
    defaultValues: {
      emergencyContactName: "",
      emergencyContactPhone: "",
      physicianName: "",
      physicianPhone: "",
      insuranceProvider: "",
      insurancePolicyNumber: "",
    }
  });

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        emergencyContactName: initialData.emergencyContactName || "",
        emergencyContactPhone: initialData.emergencyContactPhone || "",
        physicianName: initialData.physicianName || "",
        physicianPhone: initialData.physicianPhone || "",
        insuranceProvider: initialData.insuranceProvider || "",
        insurancePolicyNumber: initialData.insurancePolicyNumber || "",
      });
    } else if (isOpen) {
      reset({
        emergencyContactName: "",
        emergencyContactPhone: "",
        physicianName: "",
        physicianPhone: "",
        insuranceProvider: "",
        insurancePolicyNumber: "",
      });
    }
  }, [isOpen, initialData, reset]);

  const mutation = useMutation({
    mutationFn: async (values: MedicalFormValues) => {
      // Preserve array dependencies if appending
      const payload: StudentMedicalRecordDTO = {
        ...initialData,
        id: initialData?.id || Date.now(),
        ...values,
      };
      return profileService.updateMyMedical(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile", "me"] });
      toast.success("Medical records updated safely.");
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to sequence Medical telemetry update.");
      console.error(error);
    }
  });

  const onSubmit = (data: MedicalFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Medical Telemetry</DialogTitle>
          <DialogDescription>
            Ensure your strict emergency responder contacts remain accurate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <div className="flex items-center justify-between pb-1 border-b border-border">
                <h4 className="text-sm font-semibold">Emergency Contacts</h4>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Primary Name</Label>
              <Input {...register("emergencyContactName")} placeholder="Jane Doe" />
              {errors.emergencyContactName && <p className="text-xs text-rose-500">{errors.emergencyContactName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Primary Phone</Label>
              <Input {...register("emergencyContactPhone")} placeholder="+1 (555) 000-0000" />
              {errors.emergencyContactPhone && <p className="text-xs text-rose-500">{errors.emergencyContactPhone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2 col-span-2">
              <div className="flex items-center justify-between pb-1 border-b border-border">
                <h4 className="text-sm font-semibold">Physician & Insurance</h4>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Physician Name</Label>
              <Input {...register("physicianName")} placeholder="Dr. House" />
            </div>
            <div className="space-y-2">
              <Label>Physician Phone</Label>
              <Input {...register("physicianPhone")} placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2">
              <Label>Insurance Provider</Label>
              <Input {...register("insuranceProvider")} placeholder="BlueCross" />
            </div>
            <div className="space-y-2">
              <Label>Policy Number</Label>
              <Input {...register("insurancePolicyNumber")} placeholder="POL-123456" />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Syncing..." : "Update Records"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
