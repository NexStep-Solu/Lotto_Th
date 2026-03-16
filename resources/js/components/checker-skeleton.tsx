import { Skeleton } from "@/components/ui/skeleton"

export default function CheckerSkeleton() {
  return (
    <div className="space-y-4">

      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />

    </div>
  )
}