import { Skeleton } from '@/components/ui/skeleton';

export default function LottoResultSkeleton() {
    return (
        <div className="space-y-5 sm:space-y-6" aria-hidden="true">
            <div className="flex flex-col gap-4 border-b border-[#17251c]/10 pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-white/[0.08]">
                <div className="space-y-3">
                    <Skeleton className="h-2.5 w-40" />
                    <Skeleton className="h-10 w-72 max-w-full" />
                    <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-32 rounded-full" />
            </div>

            <div className="rounded-2xl border border-[#17251c]/10 p-5 sm:p-7 dark:border-white/[0.08]">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-2.5 w-20" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <Skeleton className="h-14 w-32 rounded-xl" />
                </div>
                <div className="mt-7 flex gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-16 w-11 rounded-md sm:h-20 sm:w-14" />
                    ))}
                </div>
                <div className="mt-6 border-t border-dashed border-[#17251c]/10 pt-5 dark:border-white/10">
                    <Skeleton className="h-9 w-full max-w-md" />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full rounded-2xl" />
                ))}
            </div>

            <Skeleton className="h-52 w-full rounded-2xl" />
        </div>
    );
}
