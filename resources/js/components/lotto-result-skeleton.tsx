import { Skeleton } from "@/components/ui/skeleton"

export default function LottoResultSkeleton() {
  return (
    <div className="space-y-6">

      <Skeleton className="h-10 w-40" />

      <div className="grid md:grid-cols-3 gap-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>

      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />

    </div>
  )
}