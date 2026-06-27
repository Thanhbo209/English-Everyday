import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Cards,
  Brain,
  Ear,
  EyeClosed,
  Microphone,
} from "@phosphor-icons/react";
import { Modal, Button, Card } from "../../../components/ui";
import type { VocabSet } from "../../../api/vocab.api";

interface PracticeModalProps {
  open: boolean;
  onClose: () => void;
  vocabSet: VocabSet | null;
}

interface ActivityOption {
  id: string;
  title: string;
  desc: string;
  path: string;
  icon: React.ReactNode;
  color: string;
}

export const PracticeModal: FC<PracticeModalProps> = ({ open, onClose, vocabSet }) => {
  const navigate = useNavigate();

  if (!vocabSet) return null;

  const ACTIVITIES: ActivityOption[] = [
    {
      id: "a1",
      title: "A1 • Learn Cards",
      desc: "Autoplay flashcards sequentially. Ideal for initial exposure.",
      path: `/student/activities/a1/${vocabSet.id}`,
      icon: <BookOpen size={24} />,
      color: "from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-500/20",
    },
    {
      id: "a2",
      title: "A2 • Flip Cards",
      desc: "Manually flip cards back/front with keyboard shortcuts.",
      path: `/student/activities/a2/${vocabSet.id}`,
      icon: <Cards size={24} />,
      color: "from-purple-500/10 to-purple-500/5 text-purple-600 border-purple-500/20",
    },
    {
      id: "a3",
      title: "A3 • Self Learning",
      desc: "Consolidate memory. Re-queue words until fully learned.",
      path: `/student/activities/a3/${vocabSet.id}`,
      icon: <Brain size={24} />,
      color: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-500/20",
    },
    {
      id: "a4",
      title: "A4 • Listening Practice",
      desc: "Audio-first training. Listen to pronunciation then reveal.",
      path: `/student/activities/a4/${vocabSet.id}`,
      icon: <Ear size={24} />,
      color: "from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-500/20",
    },
    {
      id: "a5",
      title: "A5 • Hidden Meaning",
      desc: "Meaning is initially blurred. Tap to reveal definition.",
      path: `/student/activities/a5/${vocabSet.id}`,
      icon: <EyeClosed size={24} />,
      color: "from-pink-500/10 to-pink-500/5 text-pink-600 border-pink-500/20",
    },
    {
      id: "a6",
      title: "A6 • Speaking Practice",
      desc: "Practice pronunciation using speech recorder comparisons.",
      path: `/student/activities/a6/${vocabSet.id}`,
      icon: <Microphone size={24} />,
      color: "from-red-500/10 to-red-500/5 text-red-600 border-red-500/20",
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Practice: ${vocabSet.title}`}
      size="lg"
    >
      <div className="space-y-4 pt-2">
        <p className="text-xs text-muted-foreground">
          Choose a learning activity below to begin studying this vocabulary deck.
        </p>

        {/* 2-column list of activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {ACTIVITIES.map((act) => (
            <Card
              key={act.id}
              hover
              onClick={() => {
                onClose();
                navigate(act.path);
              }}
              className={`flex items-start gap-4 p-4 border cursor-pointer bg-gradient-to-br ${act.color}`}
            >
              <div className="p-2.5 rounded-xl bg-card border border-border/40 shadow-sm shrink-0">
                {act.icon}
              </div>
              <div className="space-y-1 text-left">
                <h4 className="text-sm font-bold text-foreground leading-tight">
                  {act.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-normal">
                  {act.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="ghost" size="sm">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
