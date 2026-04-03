import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { classesService } from "@/services/classes";
import { idCardService, triggerBlobDownload, ID_CARD_TEMPLATES, type IdCardTemplate } from "@/services/idCard";

export function IdCardBatchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<IdCardTemplate>("classic");

  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ["all-classes-batch"],
    queryFn: () => classesService.getClasses().then((r) => r.data),
    enabled: open,
  });

  const sections = useMemo(() => {
    if (!selectedClassId || !classes) return [];
    const cls = classes.find(c => c.classId === selectedClassId || (c as any).uuid === selectedClassId);
    return cls?.sections || [];
  }, [selectedClassId, classes]);

  const { mutate: handleBatchPrint, isPending } = useMutation({
    mutationFn: async () => {
      // Send the UUID directly — backend now accepts UUID
      const blob = await idCardService.downloadBatchStudentIdCards(selectedSectionId, selectedTemplate);
      triggerBlobDownload(blob.data, `student-ids-${selectedTemplate}.pdf`);
    },
    onSuccess: () => {
      toast.success("Batch ID cards generated successfully");
      onClose();
    },
    onError: (err: any) => {
      const detailError = err.response?.data?.message || err.message;
      toast.error(detailError?.includes("not found") ? "No students found in this section" : "Failed to generate ID cards");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Batch Print Student IDs
          </DialogTitle>
          <DialogDescription>
            Select a class, section, and template to generate a printable A4 PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Template</label>
            <div className="grid grid-cols-3 gap-2">
              {ID_CARD_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.value}
                  onClick={() => setSelectedTemplate(tmpl.value)}
                  className={`relative p-2.5 rounded-lg border text-left transition-all duration-200 text-xs ${
                    selectedTemplate === tmpl.value
                      ? "border-primary bg-primary/5 font-semibold"
                      : "border-border bg-background hover:border-primary/30"
                  }`}
                >
                  {selectedTemplate === tmpl.value && (
                    <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-primary" />
                  )}
                  <div className="font-medium text-foreground">{tmpl.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Class</label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSectionId("");
              }}
              disabled={loadingClasses}
            >
              <option value="">Select Class...</option>
              {classes?.map((c) => (
                <option key={c.classId} value={c.classId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Section</label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">Select Section...</option>
              {sections.map((s) => (
                <option key={s.uuid} value={s.uuid}>
                  {s.sectionName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!selectedSectionId || isPending}
            onClick={() => handleBatchPrint()}
            className="gap-2 min-w-[120px]"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPending ? "Generating..." : "Generate PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
