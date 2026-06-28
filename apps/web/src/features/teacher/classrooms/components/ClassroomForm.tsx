import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from '@/shared/components';

const classroomFormSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(100, "Name is too long"),
  description: z.string().trim().max(500, "Description is too long").optional().or(z.literal("")),
});

type ClassroomFormValues = z.infer<typeof classroomFormSchema>;

interface ClassroomFormProps {
  onSubmit: (data: ClassroomFormValues) => void;
  initialValues?: ClassroomFormValues;
  loading?: boolean;
  submitText?: string;
}

export function ClassroomForm({
  onSubmit,
  initialValues,
  loading = false,
  submitText = "Submit",
}: ClassroomFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassroomFormValues>({
    resolver: zodResolver(classroomFormSchema),
    defaultValues: initialValues ?? {
      name: "",
      description: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="classroom-name"
        label="Classroom Name"
        type="text"
        placeholder="e.g. Advanced English Grammar"
        error={errors.name?.message}
        {...register("name")}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="classroom-desc" className="text-sm font-medium text-foreground">
          Description (Optional)
        </label>
        <textarea
          id="classroom-desc"
          placeholder="e.g. Topics, schedules, or classroom expectations..."
          className="w-full min-h-[100px] rounded-lg border border-border bg-input text-foreground text-sm p-3 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors placeholder:text-muted-foreground resize-y"
          {...register("description")}
        />
        {errors.description?.message && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={loading} className="px-6">
          {submitText}
        </Button>
      </div>
    </form>
  );
}
