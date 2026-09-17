import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "@/components/card-skeleton";

export default function InicioLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 py-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} alturaContenido="h-12" />
        ))}
      </div>
    </div>
  );
}
