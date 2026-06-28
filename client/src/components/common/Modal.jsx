import React, { useRef, useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Handle close request from dialog element (e.g. Esc press, closedby="any")
    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener('close', handleClose);

    // Fallback for browsers that do not support native closedby="any" (like current Safari versions)
    let fallbackClick = null;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      fallbackClick = (event) => {
        if (event.target !== dialog) return;

        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );

        if (!isDialogContent) {
          dialog.close();
        }
      };
      dialog.addEventListener('click', fallbackClick);
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      if (fallbackClick) {
        dialog.removeEventListener('click', fallbackClick);
      }
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="modal-title"
      className="fixed inset-0 m-auto max-w-lg w-full bg-white rounded-xl shadow-2xl p-6 border-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm focus:outline-none"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-brand-border pb-3">
          <h3 id="modal-title" className="text-lg font-bold text-brand-navy">
            {title}
          </h3>
          <button
            onClick={() => dialogRef.current?.close()}
            className="text-brand-muted hover:text-brand-navy transition-colors text-2xl font-semibold cursor-pointer leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh] pr-1">
          {children}
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
