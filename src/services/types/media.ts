export interface ImageUploadInitRequest {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface ImageUploadInstruction {
  provider: string; // e.g., 'cloudinary', 's3'
  uploadUrl: string; // The presigned URL or direct endpoint
  method: string; // POST, PUT, etc.
  fields?: Record<string, string>; // formData key/value pairs (typical for Cloudinary)
  headers?: Record<string, string>; // Raw headers (typical for S3 signed PUT)
  objectKey: string; // The target internal ID/Path for the file
  expiresAt?: string; // Optional expiry timestamp for the instruction
}

export interface ImageUploadCompleteRequest {
  objectKey: string;
  secureUrl: string;
  etag?: string;
  metadata?: string;
}
