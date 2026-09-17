import { CardSkeleton } from "@/components/card-skeleton";

export default function ImportarLoading() {
  return (
    <div className="flex flex-col gap-6">
      <CardSkeleton alturaContenido="h-64" />
    </div>
  );
}
