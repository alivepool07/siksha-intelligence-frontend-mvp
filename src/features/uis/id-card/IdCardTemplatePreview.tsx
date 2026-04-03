type TemplateStyle = "classic" | "modern" | "minimal";

interface IdCardTemplatePreviewProps {
  style: TemplateStyle;
  selected: boolean;
  onClick: () => void;
  label: string;
}

/** Mini HTML preview of each template style — renders in the browser as WYSIWYG */
export function IdCardTemplatePreview({ style, selected, onClick, label }: IdCardTemplatePreviewProps) {
  return (
    <div className="flex flex-col items-center gap-3 group px-1">
      <button
        onClick={onClick}
        className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden cursor-pointer flex justify-center py-4 bg-white
          ${selected ? "border-primary ring-4 ring-primary/20 scale-[1.02] shadow-xl" : "border-border hover:border-primary/40 shadow-sm hover:shadow-md"}`}
        style={{ width: 170, height: 260 }}
      >
        {/* Selection indicator */}
        {selected && (
          <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
        )}

        {/* Card Preview Miniature (Slightly Scaled) */}
        <div style={{ transform: "scale(0.9)", transformOrigin: "top center", pointerEvents: "none" }}>
          {style === "classic" && <ClassicPreview />}
          {style === "modern" && <ModernPreview />}
          {style === "minimal" && <MinimalPreview />}
        </div>
      </button>

      {/* Label properly placed outside the card preview prevents any overlap bugs! */}
      <div className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors
        ${selected ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
        {label}
      </div>
    </div>
  );
}

/* ═══ Classic Preview — Navy/Gold ═══ */
function ClassicPreview() {
  return (
    <div style={{ width: 150, margin: "0 auto", position: "relative", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ height: 55, background: "linear-gradient(135deg, #1a365d, #2c5282)", borderRadius: "8px 8px 0 0", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <div style={{ width: 24, height: 24, borderRadius: 5, background: "#fff", marginBottom: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1A365D"/><path d="M2 17L12 22L22 17" stroke="#1A365D" strokeWidth="2"/></svg>
        </div>
        <div style={{ fontSize: 5, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.3 }}>Siksha Intelligence</div>
        <div style={{ fontSize: 3.5, fontWeight: 700, color: "#ecc94b", letterSpacing: 1, textTransform: "uppercase", marginTop: 1 }}>Student Identity Card</div>
        {/* Gold sidebar */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#ecc94b", borderRadius: "8px 0 0 0" }} />
      </div>
      {/* Gold divider */}
      <div style={{ height: 2, background: "#ecc94b" }} />
      {/* Photo */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: -14, position: "relative", zIndex: 10 }}>
        <div style={{ width: 42, height: 52, borderRadius: 5, background: "#e8e8e8", border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#bbb"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>
      </div>
      {/* Name */}
      <div style={{ textAlign: "center", padding: "4px 8px 2px" }}>
        <div style={{ fontSize: 6.5, fontWeight: 800, color: "#1a365d", textTransform: "uppercase" }}>Aarav Sharma</div>
        <div style={{ fontSize: 4, fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Class 10 — A</div>
      </div>
      {/* Info rows */}
      <div style={{ padding: "0 8px" }}>
        {[["ENROLL", "S20240001"], ["ROLL", "1"], ["DOB", "15/06/2010"]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", marginBottom: 2, borderBottom: "1px solid #f8fafc", paddingBottom: 1 }}>
            <span style={{ width: 26, fontSize: 3.5, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase" }}>{l}</span>
            <span style={{ fontSize: 4.5, fontWeight: 600, color: "#2d3748" }}>{v}</span>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div style={{ height: 18, background: "#f8fafc", borderTop: "1px solid #edf2f7", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 6px 0 8px", marginTop: 4, borderRadius: "0 0 8px 8px" }}>
        <span style={{ fontSize: 3.5, fontWeight: 700, color: "#718096" }}>VALID: 2026-2027</span>
        <div style={{ height: 10, width: 30, background: "repeating-linear-gradient(90deg, #333 0px, #333 1px, #fff 1px, #fff 2px)" }} />
      </div>
      {/* Sidebar continuation */}
      <div style={{ position: "absolute", left: 0, top: 55, bottom: 0, width: 3, background: "#ecc94b" }} />
    </div>
  );
}

/* ═══ Modern Preview — Rainbow/Gradient ═══ */
function ModernPreview() {
  return (
    <div style={{ width: 150, margin: "0 auto", position: "relative", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ height: 55, background: "linear-gradient(135deg, #6366f1, #ec4899)", borderRadius: "10px 10px 0 0", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#fff", marginBottom: 3, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.3)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#6366f1"/></svg>
        </div>
        <div style={{ fontSize: 5, fontWeight: 800, letterSpacing: 0.3 }}>Siksha Intelligence</div>
        <div style={{ fontSize: 3.5, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 1 }}>Student Identity Card</div>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg, #f59e0b, #ef4444, #8b5cf6, #3b82f6)", borderRadius: "10px 0 0 0" }} />
      </div>
      <div style={{ height: 2, background: "linear-gradient(90deg, #f59e0b, #ef4444, #8b5cf6, #3b82f6)" }} />
      <div style={{ display: "flex", justifyContent: "center", marginTop: -14, position: "relative", zIndex: 10 }}>
        <div style={{ width: 42, height: 52, borderRadius: 8, background: "#e8e8e8", border: "2px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#bbb"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "4px 8px 2px" }}>
        <div style={{ fontSize: 6.5, fontWeight: 800, color: "#111827" }}>Aarav Sharma</div>
        <div style={{ fontSize: 4, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Class 10 — A</div>
      </div>
      <div style={{ padding: "0 8px" }}>
        {[["ENROLL", "S20240001"], ["ROLL", "1"], ["DOB", "15/06/2010"]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", marginBottom: 2, borderBottom: "1px solid #f9fafb", paddingBottom: 1 }}>
            <span style={{ width: 26, fontSize: 3.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>{l}</span>
            <span style={{ fontSize: 4.5, fontWeight: 600, color: "#111827" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 18, background: "#f9fafb", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 6px 0 8px", marginTop: 4, borderRadius: "0 0 10px 10px" }}>
        <span style={{ fontSize: 3.5, fontWeight: 700, color: "#9ca3af" }}>2026-2027</span>
        <div style={{ height: 10, width: 30, background: "repeating-linear-gradient(90deg, #333 0px, #333 1px, #fff 1px, #fff 2px)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 55, bottom: 0, width: 3, background: "linear-gradient(180deg, #f59e0b, #ef4444, #8b5cf6, #3b82f6)" }} />
    </div>
  );
}

/* ═══ Minimal Preview — Clean/Thin ═══ */
function MinimalPreview() {
  return (
    <div style={{ width: 150, margin: "0 auto", position: "relative", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ height: 3, background: "#1a365d", borderRadius: "6px 6px 0 0" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0 2px" }}>
        <div style={{ width: 22, height: 22, borderRadius: 4, background: "#f0f0f0", marginBottom: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#666"/></svg>
        </div>
        <div style={{ fontSize: 5, fontWeight: 700, color: "#1a1a1a", letterSpacing: 0.3 }}>Siksha Intelligence</div>
        <div style={{ fontSize: 3.5, fontWeight: 600, color: "#999", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 1 }}>Student Identity Card</div>
      </div>
      <div style={{ height: 1, background: "#eee", margin: "0 8px" }} />
      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 3px" }}>
        <div style={{ width: 40, height: 50, borderRadius: 3, background: "#f5f5f5", border: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#ccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "3px 8px 2px" }}>
        <div style={{ fontSize: 6, fontWeight: 700, color: "#111" }}>Aarav Sharma</div>
        <div style={{ fontSize: 3.5, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>Class 10 — A</div>
      </div>
      <div style={{ padding: "0 8px" }}>
        {[["ENROLL", "S20240001"], ["ROLL", "1"], ["DOB", "15/06/2010"]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", marginBottom: 2 }}>
            <span style={{ width: 26, fontSize: 3.5, fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>{l}</span>
            <span style={{ fontSize: 4.5, fontWeight: 500, color: "#333" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 16, borderTop: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px", marginTop: 3, borderRadius: "0 0 6px 6px" }}>
        <span style={{ fontSize: 3.5, fontWeight: 500, color: "#bbb" }}>Valid: 2026-2027</span>
        <div style={{ height: 8, width: 28, background: "repeating-linear-gradient(90deg, #666 0px, #666 1px, #fff 1px, #fff 2px)" }} />
      </div>
    </div>
  );
}
