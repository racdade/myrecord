import { CardSkeleton } from "@/components/card-skeleton";

export default function EquipoLoading() {
  return (
    <div className="flex flex-col gap-6">
      <CardSkeleton alturaContenido="h-56" />
      <CardSkeleton alturaContenido="h-32" />
    </div>
  );
}
