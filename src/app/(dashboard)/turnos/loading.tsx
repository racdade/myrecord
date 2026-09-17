import { CardSkeleton } from "@/components/card-skeleton";

export default function TurnosLoading() {
  return (
    <div className="flex flex-col gap-6">
      <CardSkeleton alturaContenido="h-56" />
      <CardSkeleton alturaContenido="h-72" />
    </div>
  );
}
