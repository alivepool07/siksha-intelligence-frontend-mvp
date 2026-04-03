import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, type BulkUploadReportDTO } from '@/services/admin';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, UploadCloud, FileArchive, CheckCircle2, XCircle } from 'lucide-react';

export function BulkPhotoUploadDialog({
  open,
  onClose,
  userType
}: {
  open: boolean;
  onClose: () => void;
  userType: 'students' | 'staff';
}) {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<BulkUploadReportDTO | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (uploadFile: File) => adminService.uploadBulkPhotos(userType, uploadFile).then(r => r.data),
    onSuccess: (data) => {
      setReport(data);
      if (data.failed === 0) {
        toast.success(`Successfully uploaded ${data.success} photos`);
      } else {
        toast.warning(`Uploaded ${data.success} photos, but ${data.failed} failed`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin', userType] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to process bulk upload');
    }
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.toLowerCase().endsWith('.zip')) {
        setFile(droppedFile);
        setReport(null);
      } else {
        toast.error('Only ZIP files are supported');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setReport(null);
    }
  };

  const reset = () => {
    setFile(null);
    setReport(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && reset()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-primary" />
            Bulk Photo Upload ({userType === 'students' ? 'Students' : 'Staff'})
          </DialogTitle>
          <DialogDescription>
            Upload a ZIP file containing profile photos. The filename must exactly match the
            {userType === 'students' ? ' enrollment number' : ' employee ID'} (e.g., <code className="text-xs bg-muted px-1 py-0.5 rounded">ENR001.jpg</code>).
          </DialogDescription>
        </DialogHeader>

        {!report ? (
          <div className="py-4">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".zip,application/zip"
                onChange={handleFileChange}
              />
              
              <FileArchive className={`h-10 w-10 mb-3 ${file ? 'text-primary' : 'text-muted-foreground/50'}`} />
              
              {file ? (
                <div>
                  <p className="text-sm font-semibold text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-foreground">Click or drag ZIP file here</p>
                  <p className="text-xs text-muted-foreground mt-1">Maximum 50MB per upload</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-2 space-y-4">
            <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-muted/30 border border-border">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1">Success</p>
                <p className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-5 w-5" />
                  {report.success}
                </p>
              </div>
              <div className="h-10 w-px bg-border"></div>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1">Failed</p>
                <p className="text-2xl font-bold text-rose-600 flex items-center justify-center gap-1.5">
                  <XCircle className="h-5 w-5" />
                  {report.failed}
                </p>
              </div>
            </div>

            {report.errors && report.errors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Error Log:</p>
                <div className="h-32 w-full overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
                  <ul className="space-y-1.5 list-disc list-inside">
                    {report.errors.map((err, i) => (
                      <li key={i} className="text-[11px] text-rose-600/90 leading-tight">
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!report ? (
            <>
              <Button variant="outline" onClick={reset} disabled={isPending}>Cancel</Button>
              <Button 
                onClick={() => file && mutate(file)} 
                disabled={!file || isPending}
                className="gap-2"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isPending ? 'Uploading & Processing...' : 'Upload ZIP'}
              </Button>
            </>
          ) : (
            <Button onClick={reset}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
