import { CardSkeleton } from "@/components/card-skeleton";

export default function ConfiguracionLoading() {
  return (
    <div className="flex flex-col gap-6">
      <CardSkeleton alturaContenido="h-10" />
      <CardSkeleton alturaContenido="h-10" />
      <CardSkeleton alturaContenido="h-10" />
    </div>
  );
}
