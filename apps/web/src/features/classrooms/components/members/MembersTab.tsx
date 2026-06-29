import { Users, MagnifyingGlass, FileCsv, Key } from "@phosphor-icons/react";
import { Card, Button, Input, EmptyState } from "@/shared/components";
import { useMembers } from "../../hooks/useMembers";
import { useWorkspace } from "../../hooks/useWorkspace";
import { useInviteCode } from "../../hooks/useInviteCode";
import { TeacherRow } from "./TeacherRow";
import { StudentRow } from "./StudentRow";
import { exportProgressToCSV } from "@/features/teacher/dashboard/utils/export";

interface MembersTabProps {
  classroomId: string;
}

export function MembersTab({ classroomId }: MembersTabProps) {
  const { classroom, isTeacher } = useWorkspace(classroomId);
  const { copyCode } = useInviteCode();
  const {
    members,
    rawMembers: _rawMembers,
    isLoading,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    removeStudent,
    isRemoving,
  } = useMembers(classroomId);

  const handleExportCSV = () => {
    if (!members) return;
    const exportData = members.map((m) => ({
      name: m.user.name,
      email: m.user.email,
      joinedAt: new Date(m.joinAt).toLocaleDateString(),
    }));
    exportProgressToCSV(
      exportData,
      ["name", "email", "joinedAt"],
      "classroom_members.csv"
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-14 bg-card rounded-lg" />
        <div className="h-28 bg-card rounded-lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
      {/* Roster column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Teacher list */}
        <div className="space-y-2.5">
          <h3 className="px-1 text-xs font-black text-muted-foreground uppercase tracking-wide">Teacher</h3>
          <TeacherRow
            name={classroom?.teacher?.name ?? "Teacher Owner"}
            email={classroom?.teacher?.email}
          />
        </div>

        {/* Student list */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <h3 className="px-1 text-xs font-black text-muted-foreground uppercase tracking-wide">
              Students ({members.length})
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40 text-xs py-1"
                leftIcon={<MagnifyingGlass size={13} />}
              />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="text-xs bg-card border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="name">Name</option>
                <option value="joinDate">Join Date</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-8 w-8 p-0 flex items-center justify-center rounded-lg cursor-pointer"
                title="Export CSV"
              >
                <FileCsv size={15} />
              </Button>
            </div>
          </div>

          <Card padding="none" className="overflow-hidden border border-border/80 shadow-xs">
            {members.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-sidebar-accent text-[10px] font-black text-muted-foreground uppercase">
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Email Address</th>
                      <th className="px-5 py-3 text-right">Date Enrolled</th>
                      {isTeacher && <th className="px-5 py-3 text-right">Remove</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {members.map((member) => (
                      <StudentRow
                        key={member.id}
                        member={member}
                        isTeacher={isTeacher}
                        onRemove={removeStudent}
                        isRemoving={isRemoving}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center">
                <EmptyState
                  icon={<Users size={28} />}
                  title="No classmates found"
                  description={
                    searchTerm
                      ? "Try adjusting your search keywords."
                      : "No students have joined this classroom yet. Share the code to invite them!"
                  }
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Invite card column */}
      <div className="space-y-6">
        <Card className="p-5 border border-border/80 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border/50 pb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <Key size={16} />
            </div>
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wide">Invite Students</h3>
          </div>
          <div className="bg-primary/50 border border-border p-3.5 rounded-lg text-center space-y-2">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">Classroom Join Code</p>
            <p className="font-mono text-2xl font-black text-foreground tracking-wider select-all">
              {classroom?.joinCode}
            </p>
            <Button
              size="sm"
              onClick={() => copyCode(classroom?.joinCode ?? "")}
              className="w-full h-8 text-[10px] font-bold mt-2 cursor-pointer"
            >
              Copy Invite Code
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground leading-normal">
            Instruct students to select the **Join Classroom** button on their list page and enter this code.
          </p>
        </Card>
      </div>
    </div>
  );
}
