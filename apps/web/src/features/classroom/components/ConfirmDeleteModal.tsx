import { Modal, Button } from "../../../components/ui";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  classroomName: string;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  classroomName,
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Classroom" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Are you sure you want to delete the classroom{" "}
          <strong className="text-foreground">"{classroomName}"</strong>? This action is
          permanent and will remove all student memberships.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={loading}>
            Delete Classroom
          </Button>
        </div>
      </div>
    </Modal>
  );
}
