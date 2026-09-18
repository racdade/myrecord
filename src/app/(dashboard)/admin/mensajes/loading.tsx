import { CardSkeleton } from "@/components/card-skeleton";

export default function AdminMensajesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <CardSkeleton alturaContenido="h-40" />
    </div>
  );
}
