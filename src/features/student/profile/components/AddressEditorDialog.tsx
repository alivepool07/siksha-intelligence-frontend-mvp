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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profileService } from "@/services/profile";
import type { AddressDTO } from "@/services/types/profile";

const addressSchema = z.object({
  addressType: z.enum(["HOME", "MAILING", "WORK", "OTHER"]),
  addressLine1: z.string().min(3, "Address line 1 is required (min 3 chars)."),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  postalCode: z.string().min(4, "Postal Code is required."),
  country: z.string().min(2, "Country is required."),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AddressDTO | null;
}

export function AddressEditorDialog({ isOpen, onClose, initialData }: AddressEditorDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressType: "HOME",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    }
  });

  const addressTypeWatch = watch("addressType");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          addressType: initialData.addressType || "HOME",
          addressLine1: initialData.addressLine1 || "",
          addressLine2: initialData.addressLine2 || "",
          city: initialData.city || "",
          state: initialData.state || "",
          postalCode: initialData.postalCode || "",
          country: initialData.country || "",
        });
      } else {
        reset({
          addressType: "HOME",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const mutation = useMutation({
    mutationFn: async (values: AddressFormValues) => {
      if (isEditing && initialData.id) {
        return profileService.updateMyAddress(initialData.id, values);
      }
      return profileService.createMyAddress(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile", "me"] });
      toast.success(isEditing ? "Address updated successfully" : "Address added successfully");
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to save address details.");
      console.error(error);
    }
  });

  const onSubmit = (data: AddressFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Address" : "Add New Address"}</DialogTitle>
          <DialogDescription>
            Provide your comprehensive residential coordinates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Address Type</Label>
            <Select 
              value={addressTypeWatch} 
              onValueChange={(v) => setValue("addressType", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOME">Home</SelectItem>
                <SelectItem value="MAILING">Mailing</SelectItem>
                <SelectItem value="WORK">Work</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.addressType && <p className="text-xs text-rose-500">{errors.addressType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Street Address Line 1</Label>
            <Input {...register("addressLine1")} placeholder="123 Academic Blvd" />
            {errors.addressLine1 && <p className="text-xs text-rose-500">{errors.addressLine1.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Apt, Suite, Bldg (Optional)</Label>
            <Input {...register("addressLine2")} placeholder="Apt 4B" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input {...register("city")} placeholder="Metropolis" />
              {errors.city && <p className="text-xs text-rose-500">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>State / Province</Label>
              <Input {...register("state")} placeholder="NY" />
              {errors.state && <p className="text-xs text-rose-500">{errors.state.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Postal Code</Label>
              <Input {...register("postalCode")} placeholder="10001" />
              {errors.postalCode && <p className="text-xs text-rose-500">{errors.postalCode.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input {...register("country")} placeholder="United States" />
              {errors.country && <p className="text-xs text-rose-500">{errors.country.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
