import { api } from "@/lib/axios";

// ── Template Types ──────────────────────────────────────────────────

export type IdCardTemplate = "classic" | "modern" | "minimal";

export const ID_CARD_TEMPLATES: { value: IdCardTemplate; label: string; description: string }[] = [
  { value: "classic", label: "Classic Formal", description: "Navy & gold, serif typography — inspired by DPS/Modern School" },
  { value: "modern", label: "Modern Gradient", description: "Sleek gradients, contemporary design — international school style" },
  { value: "minimal", label: "Premium Minimal", description: "Clean whitespace, elegant borders — top-tier private school feel" },
];

// ── ID Card API Service ──────────────────────────────────────────────

export const idCardService = {
  // ── Admin endpoints ──────────────────────────────────────────────────

  /** GET /auth/admin/id-cards/student/:studentId — single student ID card PDF */
  downloadStudentIdCard(studentId: number, template: IdCardTemplate = "classic") {
    return api.get<Blob>(`/auth/admin/id-cards/student/${studentId}`, {
      params: { template },
      responseType: "blob",
    });
  },

  /** GET /auth/admin/id-cards/staff/:staffId — single staff ID card PDF */
  downloadStaffIdCard(staffId: number, template: IdCardTemplate = "classic") {
    return api.get<Blob>(`/auth/admin/id-cards/staff/${staffId}`, {
      params: { template },
      responseType: "blob",
    });
  },

  /** GET /auth/admin/id-cards/students/batch — batch student IDs by section UUID */
  downloadBatchStudentIdCards(sectionId: string, template: IdCardTemplate = "classic") {
    return api.get<Blob>(`/auth/admin/id-cards/students/batch`, {
      params: { sectionId, template },
      responseType: "blob",
    });
  },

  /** GET /auth/admin/id-cards/staff/batch — batch all active staff IDs */
  downloadBatchStaffIdCards(template: IdCardTemplate = "classic") {
    return api.get<Blob>(`/auth/admin/id-cards/staff/batch`, {
      params: { template },
      responseType: "blob",
    });
  },

  // ── Template Config ──────────────────────────────────────────────────

  /** PATCH /auth/admin/id-cards/template — sets global school ID card template */
  setMasterTemplate(template: IdCardTemplate) {
    return api.patch(`/auth/admin/id-cards/template`, null, {
      params: { template },
    });
  },

  // ── Self-service endpoint ────────────────────────────────────────────

  /** GET /profile/me/id-card — current user's own ID card PDF */
  downloadMyIdCard() {
    return api.get<Blob>(`/profile/me/id-card`, {
      responseType: "blob",
    });
  },
  
  /** GET /profile/me/id-card/preview-html — current user's own ID card HTML for preview */
  getIdCardPreviewHtml() {
    return api.get<{ html: string }>(`/profile/me/id-card/preview-html`);
  },
};

export function triggerBlobDownload(blob: Blob, filename: string = "document.pdf") {
  const file = new Blob([blob], { type: "application/pdf" });
  // Blob URL for iframe rendering (browsers can render this natively)
  const blobUrl = URL.createObjectURL(file);

  // Also create a Data URI for the download button (bypasses cross-origin restrictions)
  const reader = new FileReader();
  reader.onloadend = () => {
    const dataUri = reader.result as string;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${filename} - PDF Preview</title>
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1e293b; }
          iframe { width: 100%; height: 100%; border: none; display: block; }
          .download-bar {
            position: fixed; bottom: 24px; right: 24px;
            background: #2563eb; color: white;
            padding: 12px 24px; border-radius: 12px;
            text-decoration: none; font-weight: 600; font-size: 14px;
            box-shadow: 0 8px 24px rgba(37,99,235,0.4);
            border: none; transition: all 0.2s; cursor: pointer;
            display: flex; align-items: center; gap: 10px; z-index: 100;
          }
          .download-bar:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(37,99,235,0.5); }
          .download-bar:active { transform: translateY(0); }
          .download-bar svg { width: 20px; height: 20px; }
          .filename-bar {
            position: fixed; top: 0; left: 0; right: 0; height: 40px;
            background: #0f172a; color: #94a3b8; font-size: 13px;
            display: flex; align-items: center; padding: 0 16px; z-index: 100;
            border-bottom: 1px solid #1e293b;
          }
          .filename-bar strong { color: #e2e8f0; margin-right: 4px; }
          iframe { margin-top: 40px; height: calc(100% - 40px); }
        </style>
      </head>
      <body>
        <div class="filename-bar"><strong>📄</strong> ${filename}</div>
        <a href="${dataUri}" download="${filename}" class="download-bar">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </a>
        <iframe src="${blobUrl}"></iframe>
      </body>
      </html>
    `;

    const htmlBlob = new Blob([htmlContent], { type: "text/html" });
    const htmlUrl = URL.createObjectURL(htmlBlob);
    window.open(htmlUrl, "_blank");
  };

  reader.readAsDataURL(file);
}

