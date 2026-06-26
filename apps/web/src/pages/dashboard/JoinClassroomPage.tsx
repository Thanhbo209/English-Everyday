import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Key, ArrowLeft, ArrowRight, WarningCircle } from "@phosphor-icons/react";
import { Card, Button, Input, useToast } from "../../components/ui";
import { useJoinClassroom } from "../../features/classroom/hooks/useClassrooms";

export default function JoinClassroomPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const joinMutation = useJoinClassroom();

  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const cleanCode = joinCode.trim();

    if (cleanCode.length !== 6) {
      setError("Join code must be exactly 6 characters");
      return;
    }

    setError("");
    joinMutation.mutate(
      { joinCode: cleanCode },
      {
        onSuccess: (data) => {
          toast.success("Joined classroom successfully!");
          const classroomId = data?.classroomId ?? data?.classroom?.id;
          if (classroomId) {
            navigate(`/dashboard/classrooms/${classroomId}`);
          } else {
            navigate("/dashboard/classrooms");
          }
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message ?? "Failed to join classroom";
          setError(msg);
        },
      }
    );
  }

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      {/* Back to Classrooms link */}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ArrowLeft size={16} />}
        onClick={() => navigate("/dashboard/classrooms")}
      >
        Back to Classrooms
      </Button>

      {/* Card Form */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
            <Key size={24} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Join a Classroom</h2>
          <p className="text-xs text-muted-foreground max-w-xs">
            Enter the 6-character code provided by your teacher to access assignments and materials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="join-code"
            label="Join Code"
            type="text"
            placeholder="e.g. AB12CD"
            maxLength={6}
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value.toUpperCase());
              setError("");
            }}
            leftIcon={<Key size={16} />}
            autoComplete="off"
            className="text-center font-mono tracking-widest text-lg font-bold placeholder:text-sm placeholder:tracking-normal placeholder:font-normal"
            required
          />

          {error && (
            <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/25 rounded-lg px-3.5 py-3">
              <WarningCircle size={16} className="text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive font-medium leading-snug">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={joinMutation.isPending}
            disabled={joinCode.trim().length !== 6}
          >
            Join Classroom
            {!joinMutation.isPending && <ArrowRight size={15} className="ml-1" />}
          </Button>
        </form>
      </Card>
    </div>
  );
}
