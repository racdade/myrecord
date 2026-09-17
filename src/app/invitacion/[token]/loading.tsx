import { Skeleton } from "@/components/ui/skeleton";

export default function InvitacionLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="w-full max-w-sm rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="mb-3 h-4 w-full" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
