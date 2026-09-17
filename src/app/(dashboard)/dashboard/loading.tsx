import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "@/components/card-skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <CardSkeleton alturaContenido="h-64" />
      <CardSkeleton alturaContenido="h-72" />
      <CardSkeleton alturaContenido="h-24" />
    </div>
  );
}
