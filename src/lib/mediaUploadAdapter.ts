import type { ImageUploadInstruction } from "@/services/types/media";

export interface UploadResult {
  secureUrl: string;
  objectKey: string;
  etag?: string;
  metadata?: string;
}

/**
 * Universal adapter for orchestrating media uploads.
 * Agnostic to the underlying provider (Cloudinary vs AWS S3/GCP).
 * 
 * It determines the proper HTTP flow purely based on the presence of `fields` vs `headers`
 * provided by the secure backend instruction API.
 */
export const executeMediaUpload = async (
  file: File,
  instruction: ImageUploadInstruction
): Promise<UploadResult> => {

  const { uploadUrl, method, fields, headers, objectKey } = instruction;

  // 1. Cloudinary / Multi-part FormData Flow
  if (fields && Object.keys(fields).length > 0) {
    const formData = new FormData();
    
    // Cloudinary requires signature and API keys BEFORE the file in the multipart body
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }
    // Most providers expect the actual binary file attached under the literal 'file' field
    formData.append("file", file);

    const response = await fetch(uploadUrl, {
      method: method || "POST",
      body: formData,
      // Note: fetch automatically attaches correct boundary headers when passing FormData
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Multipart Upload failed: ${response.status} - ${errBody}`);
    }

    const result = await response.json();
    return {
      secureUrl: result.secure_url || result.url || result.Location, // Various provider response keys
      objectKey,
      etag: result.etag,
      metadata: JSON.stringify(result) // Stash verbose metadata stringified to pass back if needed
    };
  }

  // 2. S3 / Cloud Storage Signed PUT Flow
  else {
    const response = await fetch(uploadUrl, {
      method: method || "PUT",
      body: file, // Raw binary mapping
      headers: {
        "Content-Type": file.type,
        ...headers,
      },
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Binary Upload failed: ${response.status} - ${errBody}`);
    }

    // In a Signed PUT, the secure URL is usually the URL stripped of the query parameters, 
    // but the backend will resolve the final CDN url during upload-complete using the objectKey.
    // We try to return a sensible URL here just in case.
    const secureUrl = uploadUrl.split("?")[0];
    
    return {
      secureUrl,
      objectKey,
      etag: response.headers.get("Etag") || undefined
    };
  }
};
