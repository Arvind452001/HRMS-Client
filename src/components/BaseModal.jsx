import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * BaseModal — the single popup shell used everywhere in the app
 * (Employee, HR, and Admin modules alike), so every dialog shares the
 * same overlay, header, close button, spacing, radius, and shadow.
 *
 * It only renders the chrome around a dialog — all form fields, logic,
 * and handlers stay exactly where they already are in each caller.
 *
 * Props:
 *  - title: string shown in the header (omit to render a bare card)
 *  - onClose: called on backdrop click, Escape key, or the X button
 *  - size: "sm" | "md" | "lg" | "xl" — controls max width
 *  - footer: optional node rendered pinned to the bottom (actions row)
 *  - hideClose: hide the X button (rare — e.g. while an action is in flight)
 */
export default function BaseModal({
  title,
  onClose,
  children,
  size = "md",
  footer,
  hideClose = false,
}) {
  const maxWidth = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size] || "max-w-lg";

  // Lock background scroll while open, restore on close — matches the
  // behavior already used by DocumentModal so nothing shifts underneath.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Close on Escape, same as every other overlay in the app.
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-6 sm:px-4"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-xl bg-base-100 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideClose) && (
          <div className="flex flex-shrink-0 items-center justify-between border-b border-base-300 px-4 py-3 sm:px-5">
            <h3 className="truncate text-base font-semibold text-base-content sm:text-lg">
              {title}
            </h3>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-base-content/50 transition hover:bg-base-200 hover:text-base-content"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {children}
        </div>

        {footer && (
          <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-base-300 px-4 py-3 sm:px-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
