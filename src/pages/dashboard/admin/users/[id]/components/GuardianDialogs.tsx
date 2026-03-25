import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { adminService } from "@/services/admin";
import type { StudentGuardianDTO } from "@/services/types/profile";
import type { CreateGuardianRequestDTO, UpdateGuardianRequestDTO } from "@/services/types/admin";

// ── Link Guardian Dialog ──────────────────────────────────────────────────────

const linkGuardianSchema = z.object({
  guardianId: z.string().min(1, "Guardian UUID is required").uuid("Must be a valid UUID"),
  relationshipType: z.string().min(1, "Relationship type is required"),
  primaryContact: z.boolean().optional(),
  canPickup: z.boolean().optional(),
  financialContact: z.boolean().optional(),
  canViewGrades: z.boolean().optional(),
});

type LinkGuardianData = z.infer<typeof linkGuardianSchema>;

interface LinkGuardianDialogProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LinkGuardianDialog({ studentId, isOpen, onClose, onSuccess }: LinkGuardianDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LinkGuardianData>({
    resolver: zodResolver(linkGuardianSchema),
    defaultValues: {
      guardianId: "",
      relationshipType: "FATHER",
      primaryContact: false,
      canPickup: false,
      financialContact: false,
      canViewGrades: false,
    },
  });

  // Reset form when opened
  useEffect(() => {
    if (isOpen) form.reset();
  }, [isOpen, form]);

  const onSubmit = async (data: LinkGuardianData) => {
    try {
      setIsSubmitting(true);
      await adminService.linkGuardian(studentId, data);
      toast.success("Guardian linked successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to link guardian");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link Existing Guardian</DialogTitle>
          <DialogDescription>
            Attach an existing guardian (via their exact System UUID) to this student.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="guardianId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guardian System UUID*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 123e4567-e89b-12d3..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relationshipType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship*</FormLabel>
                  <FormControl>
                    <Input placeholder="MOTHER, FATHER, UNCLE, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/50 p-4 border border-border">
              <FormField
                control={form.control}
                name="primaryContact"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0">
                    <FormLabel>Primary Contact</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="canPickup"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0">
                    <FormLabel>Can Pickup</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="financialContact"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0">
                    <FormLabel>Financial Contact</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="canViewGrades"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0">
                    <FormLabel>View Grades</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4 space-x-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Linking..." : "Link Guardian"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Create / Edit Guardian Dialog ────────────────────────────────────────────────

const guardianFormSchema = z.object({
  username: z.string().min(3).max(50).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  initialPassword: z.string().optional().or(z.literal("")),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  bio: z.string().optional(),
  phoneNumber: z.string().optional(),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  // Relationship info
  relationshipType: z.string().min(1, "Relationship type is required"),
  primaryContact: z.boolean().optional(),
  canPickup: z.boolean().optional(),
  financialContact: z.boolean().optional(),
  canViewGrades: z.boolean().optional(),
}).refine(() => {
  // If we are creating (not editing), username and email might be required by backend
  // but we enforce this dynamically in the component if needed.
  return true;
});

type GuardianFormData = z.infer<typeof guardianFormSchema>;

interface GuardianFormDialogProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: StudentGuardianDTO | null; // Null means CREATE mode
}

export function GuardianFormDialog({ studentId, isOpen, onClose, onSuccess, initialData }: GuardianFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!initialData;
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingData, setPendingData] = useState<GuardianFormData | null>(null);

  const form = useForm<GuardianFormData>({
    resolver: zodResolver(guardianFormSchema),
    defaultValues: {
      username: "",
      email: "",
      initialPassword: "",
      firstName: "",
      middleName: "",
      lastName: "",
      preferredName: "",
      dateOfBirth: "",
      gender: "PREFER_NOT_TO_SAY",
      bio: "",
      phoneNumber: "",
      occupation: "",
      employer: "",
      relationshipType: "",
      primaryContact: false,
      canPickup: false,
      financialContact: false,
      canViewGrades: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Hydrate form for updating by splitting the full name
        const nameParts = initialData.name ? initialData.name.split(" ") : [];
        const fName = nameParts.length > 0 ? nameParts[0] : "";
        const lName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        form.reset({
          username: "", // Username isn't typically editable from list view updates securely
          email: "",
          firstName: fName,
          middleName: "",
          lastName: lName,
          preferredName: "",
          dateOfBirth: "",
          gender: "PREFER_NOT_TO_SAY",
          bio: "",
          phoneNumber: initialData.phoneNumber || "",
          occupation: initialData.occupation || "",
          employer: initialData.employer || "",
          relationshipType: initialData.relation || "",
          primaryContact: initialData.primaryContact || false,
          canPickup: initialData.canPickup || false,
          financialContact: initialData.financialContact || false,
          canViewGrades: initialData.canViewGrades || false,
        });
      } else {
        // Reset to brand new defaults
        form.reset({
          username: "",
          email: "",
          initialPassword: "",
          firstName: "",
          middleName: "",
          lastName: "",
          preferredName: "",
          dateOfBirth: "",
          gender: "PREFER_NOT_TO_SAY",
          bio: "",
          phoneNumber: "",
          occupation: "",
          employer: "",
          relationshipType: "MOTHER",
          primaryContact: true,
          canPickup: true,
          financialContact: false,
          canViewGrades: true,
        });
      }
    }
  }, [isOpen, initialData, form]);

  const performSubmit = async (data: GuardianFormData) => {
    try {
      setIsSubmitting(true);
      
      if (isEdit) {
        // Map to UpdateGuardianRequestDTO
        const updatePayload: UpdateGuardianRequestDTO = {
          email: data.email,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          preferredName: data.preferredName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          bio: data.bio,
          phoneNumber: data.phoneNumber,
          occupation: data.occupation,
          employer: data.employer,
          relationshipType: data.relationshipType,
          primaryContact: data.primaryContact,
          canPickup: data.canPickup,
          financialContact: data.financialContact,
          canViewGrades: data.canViewGrades,
        };
        await adminService.updateGuardian(studentId, initialData.guardianUuid, updatePayload);
        toast.success("Guardian profile updated!");
      } else {
        // Map to CreateGuardianRequestDTO
        // We enforce username and email strictly manually if Zod schema let it slip
        if (!data.username || !data.email || !data.phoneNumber) {
           toast.error("Username, Email, and Phone are required for new guardians.");
           return;
        }
        
        const createPayload: CreateGuardianRequestDTO = {
          username: data.username,
          email: data.email,
          initialPassword: data.initialPassword,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          preferredName: data.preferredName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          bio: data.bio,
          phoneNumber: data.phoneNumber,
          occupation: data.occupation,
          employer: data.employer,
          relationshipType: data.relationshipType,
          primaryContact: data.primaryContact,
          canPickup: data.canPickup,
          financialContact: data.financialContact,
          canViewGrades: data.canViewGrades,
        };
        await adminService.createGuardian(studentId, createPayload);
        toast.success("New guardian created and linked!");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to process guardian");
    } finally {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
      setPendingData(null);
    }
  };

  const onSubmit = (data: GuardianFormData) => {
    if (isEdit) {
      setPendingData(data);
      setConfirmDialogOpen(true);
    } else {
      performSubmit(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Guardian Profile" : "Create New Guardian"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the identity and relational metadata for this guardian."
              : "Register an entirely new user to the platform and link them to this student."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Account Info (Only on Create) */}
            {!isEdit && (
              <div className="space-y-4 rounded-xl border border-border p-4 bg-muted/20">
                <h3 className="font-semibold px-1">Account Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username*</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email*</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="initialPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Leave empty for auto-gen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-semibold px-1">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input placeholder="William" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 555-0100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="NON_BINARY">Non-Binary</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                          <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Relationship Info */}
            <div className="space-y-4">
              <h3 className="font-semibold px-1">Relationship to Student</h3>
              <div className="rounded-xl bg-muted/50 p-4 border border-border">
                <FormField
                  control={form.control}
                  name="relationshipType"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Relationship Type*</FormLabel>
                      <FormControl>
                        <Input placeholder="FATHER, MOTHER, LEGAL GUARDIAN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primaryContact"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0">
                        <FormLabel>Primary Contact</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="canPickup"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0">
                        <FormLabel>Can Pickup</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="financialContact"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0">
                        <FormLabel>Financial Contact</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="canViewGrades"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0">
                        <FormLabel>View Grades</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 space-x-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Update Guardian" : "Create Guardian"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Profile Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update {initialData?.name || "this guardian"}'s profile?
              These changes will reflect globally across all their linked students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={(e) => {
                e.preventDefault();
                if (pendingData) performSubmit(pendingData);
              }}
            >
              {isSubmitting ? "Updating..." : "Update Guardian"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
