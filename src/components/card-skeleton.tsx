import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton({ className, alturaContenido = "h-24" }: { className?: string; alturaContenido?: string }) {
  return (
    <div className={`rounded-xl bg-card p-4 ring-1 ring-foreground/10 ${className ?? ""}`}>
      <Skeleton className="mb-4 h-5 w-40" />
      <Skeleton className={`w-full ${alturaContenido}`} />
    </div>
  );
}
