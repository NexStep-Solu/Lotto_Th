import { cn } from '@/lib/utils';

export default function LottoBrand({ subtitle = 'Thai · SG results', className }: { subtitle?: string; className?: string }) {
    return (
        <span className={cn('flex items-center gap-2.5', className)}>
            <span className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#0c5c43]/20 bg-[#0c5c43] text-[#f8f5ea] shadow-[0_10px_20px_-14px_rgba(12,92,67,0.9)] dark:border-[#3cbf96]/20 dark:bg-[#14795a]">
                <span className="font-display text-lg leading-none">L</span>
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full border-2 border-[#f3f0e7] bg-[#b08d57] dark:border-[#0b0f0d]" />
            </span>
            <span>
                <span className="block text-[13px] leading-tight font-semibold tracking-tight">BlameVerse Lottery Checker</span>
                <span className="text-muted-foreground block text-[9px] font-semibold tracking-[0.18em] uppercase">{subtitle}</span>
            </span>
        </span>
    );
}
