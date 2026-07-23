"use client";

import type { ReactNode, MouseEvent, CSSProperties } from "react";
import { useFocusTrap } from "@/lib/use-focus-trap";

type A11yDialogProps = {
  open: boolean;
  onClose: () => void;
  /** aria-label do diálogo */
  label?: string;
  /** id do título (aria-labelledby) */
  labelledBy?: string;
  children: ReactNode;
  className?: string;
  /** Classe do backdrop (se omitido, sem backdrop separado — children inclui tudo) */
  backdropClassName?: string;
  style?: CSSProperties;
  /** Se false, clique no backdrop não fecha */
  closeOnBackdrop?: boolean;
};

/**
 * Diálogo acessível: aria-modal, foco preso, Escape fecha, restaura foco.
 */
export default function A11yDialog({
  open,
  onClose,
  label,
  labelledBy,
  children,
  className,
  backdropClassName = "sv-a11y-dialog-backdrop",
  style,
  closeOnBackdrop = true,
}: A11yDialogProps) {
  const panelRef = useFocusTrap(open, onClose);
  if (!open) return null;

  function onBackdropClick(e: MouseEvent) {
    if (!closeOnBackdrop) return;
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className={backdropClassName}
      role="presentation"
      onClick={onBackdropClick}
    >
      <div
        ref={panelRef}
        className={className}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
