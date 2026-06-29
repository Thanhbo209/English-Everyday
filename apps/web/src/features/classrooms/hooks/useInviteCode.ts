import { useToast } from "@/shared/components";

export function useInviteCode() {
  const toast = useToast();

  const copyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied to clipboard!");
  };

  const getJoinLink = (code: string) => {
    return `${window.location.origin}/dashboard/classrooms/join?code=${code}`;
  };

  const copyLink = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(getJoinLink(code));
    toast.success("Join link copied to clipboard!");
  };

  return {
    copyCode,
    copyLink,
    getJoinLink,
  };
}
