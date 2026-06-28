import { Modal } from "../../../components/ui";
import { ClassroomForm } from "./ClassroomForm";
import { useCreateClassroom, useUpdateClassroom } from "../hooks/useClassrooms";
import { useToast } from "../../../components/ui";
import type { Classroom } from "../../../api/classroom.api";

interface ClassroomModalProps {
  open: boolean;
  onClose: () => void;
  classroom?: Classroom;
}

export function ClassroomModal({
  open,
  onClose,
  classroom,
}: ClassroomModalProps) {
  const isEdit = !!classroom;
  const toast = useToast();
  const createMutation = useCreateClassroom();
  const updateMutation = useUpdateClassroom();

  const loading = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(data: { name: string; description?: string }) {
    if (isEdit && classroom) {
      updateMutation.mutate(
        { id: classroom.id, payload: data },
        {
          onSuccess: () => {
            toast.success("Classroom updated successfully");
            onClose();
          },
          onError: (err: any) => {
            const msg =
              err.response?.data?.message ?? "Failed to update classroom";
            toast.error(msg);
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Classroom created successfully");
          onClose();
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ?? "Failed to create classroom";
          toast.error(msg);
        },
      });
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Classroom" : "Create Classroom"}
      size="md"
    >
      <ClassroomForm
        onSubmit={handleSubmit}
        initialValues={
          isEdit && classroom
            ? { name: classroom.name, description: classroom.description ?? "" }
            : undefined
        }
        loading={loading}
        submitText={isEdit ? "Save Changes" : "Create Classroom"}
      />
    </Modal>
  );
}
