import { Skeleton } from '@/components/ui/skeleton';

export default function CheckerSkeleton() {
    return (
        <div
            className="overflow-hidden rounded-2xl border border-[#17251c]/10 bg-[#fbf9f2]/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.035]"
            aria-hidden="true"
        >
            <div className="flex items-start justify-between border-b border-[#17251c]/10 px-5 py-4 dark:border-white/[0.07]">
                <div className="space-y-2">
                    <Skeleton className="h-2.5 w-20" />
                    <Skeleton className="h-6 w-36" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-4 px-5 py-5">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-3 w-full" />
            </div>
        </div>
    );
}
