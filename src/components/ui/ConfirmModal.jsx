import Modal from "./Modal";
import { PrimaryButton, SecondaryButton } from "./Button";

const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}) => (
  <Modal open={open} onClose={busy ? () => {} : onCancel} title={title}>
    <p className="text-sm text-slate-600 leading-relaxed mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <SecondaryButton onClick={onCancel} disabled={busy} className="text-sm">
        Cancel
      </SecondaryButton>
      <PrimaryButton
        onClick={onConfirm}
        disabled={busy}
        className="text-sm !bg-red-500 hover:!bg-red-600 !text-white disabled:opacity-60"
      >
        {busy ? "Deleting..." : confirmLabel}
      </PrimaryButton>
    </div>
  </Modal>
);

export default ConfirmModal;
