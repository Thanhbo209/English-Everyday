import { ChalkboardTeacher } from "@phosphor-icons/react";
import { Card } from "@/shared/components";

interface EmptyWorkspaceProps {
  isTeacher: boolean;
  onNavigateToTab?: (tabId: string) => void;
}

export function EmptyWorkspace({ isTeacher, onNavigateToTab }: EmptyWorkspaceProps) {
  const steps = [
    {
      num: 1,
      title: "Add Vocabulary Decks",
      desc: isTeacher
        ? "Go to the Vocabulary tab and assign vocabulary set decks to this classroom."
        : "Wait for your teacher to assign vocabulary sets.",
      tab: "vocabulary",
    },
    {
      num: 2,
      title: "Enroll Students",
      desc: isTeacher
        ? "Copy the classroom join code from the header and share it with your students."
        : "You are already enrolled in this class roster.",
      tab: "members",
    },
    {
      num: 3,
      title: "Assign Learning Activities",
      desc: isTeacher
        ? "Create assignments, configure games, flashcard sets, or vocabulary reviews."
        : "Start assignments once published by your teacher.",
      tab: "assignments",
    },
    {
      num: 4,
      title: "Review analytics and standings",
      desc: isTeacher
        ? "Track student completion rate progress under the Analytics tab."
        : "Check your scores and streaks under the Progress tab.",
      tab: isTeacher ? "analytics" : "progress",
    },
  ];

  return (
    <Card className="flex flex-col items-center justify-center p-8 border border-border/80 rounded-2xl max-w-2xl mx-auto select-none text-xs">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20 animate-pulse">
        <ChalkboardTeacher size={24} />
      </div>
      <h3 className="text-sm font-extrabold text-foreground leading-snug">Welcome to your Class Workspace</h3>
      <p className="text-xs text-muted-foreground mt-1 text-center max-w-md">
        Get started with classroom activities by following these steps:
      </p>

      {/* Onboarding steps list */}
      <div className="w-full space-y-3.5 mt-6 text-left">
        {steps.map((step) => (
          <div
            key={step.num}
            onClick={() => isTeacher && onNavigateToTab?.(step.tab)}
            className={`flex gap-3.5 p-3 border border-border/70 rounded-xl transition-all ${
              isTeacher ? "hover:bg-secondary/15 cursor-pointer hover:border-primary/25" : ""
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-secondary text-foreground font-black flex items-center justify-center shrink-0 text-xs">
              {step.num}
            </div>
            <div>
              <p className="font-bold text-foreground leading-snug">{step.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
