import { Avatar } from "@/shared/components";

interface TeacherRowProps {
  name: string;
  email?: string;
}

export function TeacherRow({ name, email }: TeacherRowProps) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-secondary/10 border border-border/70 rounded-xl select-none text-xs">
      <div className="flex items-center gap-2.5">
        <Avatar name={name} size="sm" className="bg-primary/20 text-primary border border-primary/20 font-bold" />
        <div>
          <p className="font-bold text-foreground leading-snug">{name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{email ?? "Primary Teacher"}</p>
        </div>
      </div>
      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-black uppercase tracking-wider">
        Teacher Owner
      </span>
    </div>
  );
}
