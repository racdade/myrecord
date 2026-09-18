import { CardSkeleton } from "@/components/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SobreNosotrosLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 py-4">
        <Skeleton className="size-14 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>
      <CardSkeleton alturaContenido="h-20" />
      <CardSkeleton alturaContenido="h-20" />
      <CardSkeleton alturaContenido="h-16" />
      <CardSkeleton alturaContenido="h-32" />
      <CardSkeleton alturaContenido="h-20" />
    </div>
  );
}
