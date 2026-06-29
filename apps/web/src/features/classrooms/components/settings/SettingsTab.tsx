import { useState } from "react";
import { Trash } from "@phosphor-icons/react";
import { Card, Button, Input } from "@/shared/components";
import { useQuickActions } from "../../hooks/useQuickActions";
import type { Classroom } from "../../api/classroom.api";

interface SettingsTabProps {
  classroom: Classroom;
}

export function SettingsTab({ classroom }: SettingsTabProps) {
  const { updateClassroom, deleteClassroom, toggleStatus, isUpdating, isDeleting } =
    useQuickActions(classroom.id);

  const [name, setName] = useState(classroom.name);
  const [description, setDescription] = useState(classroom.description || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateClassroom({ name, description });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete "${classroom.name}"? This action cannot be undone.`
      )
    ) {
      deleteClassroom();
    }
  };

  return (
    <div className="space-y-6 select-none max-w-xl text-xs">
      <Card className="p-5 border border-border/80 space-y-4">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wide border-b border-border/40 pb-2">
          Classroom Details
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="settings-name"
            label="Classroom Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="text-xs py-1.5"
          />

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] bg-card border border-border rounded-xl p-3 text-xs focus:outline-none"
              placeholder="e.g. Grade 10 English Literature and Vocabulary Prep"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isUpdating} className="h-8 font-bold px-4 cursor-pointer">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5 border border-border/80 space-y-4">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wide border-b border-border/40 pb-2">
          Classroom Controls
        </h3>
        <div className="flex items-center justify-between py-1.5">
          <div>
            <p className="font-bold text-foreground">Status Toggle</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Currently: <span className="font-bold">{classroom.status.toLowerCase()}</span>.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            loading={isUpdating}
            onClick={() => toggleStatus(classroom.status)}
            className="h-8 font-bold px-4 cursor-pointer"
          >
            {classroom.status === "ACTIVE" ? "Archive Classroom" : "Activate Classroom"}
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-5 border border-rose-500/25 bg-rose-500/5 space-y-4 rounded-2xl">
        <h3 className="text-xs font-black text-rose-500 uppercase tracking-wide border-b border-rose-500/15 pb-2">
          Danger Zone
        </h3>
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-bold text-foreground">Delete Classroom</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Permanently delete this classroom, all memberships, and assignment histories.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            loading={isDeleting}
            onClick={handleDelete}
            className="h-8 font-bold px-4 cursor-pointer"
            leftIcon={<Trash size={14} />}
          >
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}
