import { useQuery } from "@tanstack/react-query";
import { getLiveSessions } from "../../../api/learning.api";

export function useLiveSessions() {
  return useQuery({
    queryKey: ["live-sessions"],
    queryFn: getLiveSessions,
  });
}
