import { CardSkeleton } from "@/components/card-skeleton";

export default function PlanesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <CardSkeleton alturaContenido="h-40" />
      <CardSkeleton alturaContenido="h-20" />
    </div>
  );
}
