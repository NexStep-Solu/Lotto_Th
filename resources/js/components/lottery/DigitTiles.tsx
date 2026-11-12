import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type TileSize = 'sm' | 'md' | 'lg' | 'xl';
type TileTone = 'paper' | 'solid' | 'outline';

const sizeClasses: Record<TileSize, string> = {
    sm: 'h-7 w-5 rounded-[4px] text-[11px] sm:h-8 sm:w-6 sm:text-xs',
    md: 'h-9 w-7 rounded-[5px] text-sm sm:h-11 sm:w-8 sm:text-base',
    lg: 'h-12 w-8 rounded-md text-xl sm:h-16 sm:w-11 sm:text-3xl',
    xl: 'h-16 w-10 rounded-md text-3xl sm:h-20 sm:w-14 sm:text-4xl lg:h-24 lg:w-[4.25rem] lg:text-5xl',
};

const toneClasses: Record<TileTone, string> = {
    paper: [
        'border-[#17251c]/10 bg-[#fffdf7] text-[#122019] shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_8px_18px_-14px_rgba(18,32,25,0.55)]',
        'dark:border-white/10 dark:bg-white/[0.07] dark:text-[#f4f1e7] dark:shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_8px_18px_-14px_rgba(0,0,0,0.8)]',
    ].join(' '),
    solid: [
        'border-transparent bg-[#0c5c43] text-[#f7f4ea] shadow-[0_6px_18px_-10px_rgba(12,92,67,0.85)]',
        'dark:bg-[#14795a] dark:text-[#f7f4ea]',
    ].join(' '),
    outline: ['border-[#17251c]/15 bg-transparent text-[#17251c]', 'dark:border-white/15 dark:text-[#f4f1e7]'].join(' '),
};

interface DigitTilesProps {
    number?: string;
    size?: TileSize;
    tone?: TileTone;
    className?: string;
}

export function DigitTiles({ number, size = 'md', tone = 'paper', className }: DigitTilesProps) {
    if (!number) {
        return <span className="font-ticket text-muted-foreground text-lg">—</span>;
    }

    const digits = Array.from(number);

    return (
        <div className={cn('flex items-center gap-1 sm:gap-1.5', className)} role="img" aria-label={`Winning number ${digits.join(' ')}`}>
            {digits.map((digit, index) => (
                <span
                    key={`${digit}-${index}`}
                    aria-hidden="true"
                    className={cn(
                        'font-ticket flex shrink-0 items-center justify-center border font-medium tabular-nums',
                        sizeClasses[size],
                        toneClasses[tone],
                    )}
                >
                    {digit}
                </span>
            ))}
        </div>
    );
}

interface NumberChipsProps {
    numbers?: string[];
    tone?: 'default' | 'muted' | 'accent' | 'outline';
    className?: string;
    max?: number;
    children?: ReactNode;
}

export function NumberChips({ numbers = [], tone = 'default', className, max }: NumberChipsProps) {
    const visible = typeof max === 'number' ? numbers.slice(0, max) : numbers;
    const hidden = numbers.length - visible.length;

    if (visible.length === 0) {
        return <p className={cn('text-muted-foreground text-xs', className)}>No numbers published</p>;
    }

    return (
        <div className={cn('flex flex-wrap gap-1.5 sm:gap-2', className)}>
            {visible.map((number, index) => (
                <span
                    key={`${number}-${index}`}
                    className={cn(
                        'font-ticket inline-flex h-8 min-w-9 items-center justify-center rounded-[5px] border px-2 text-xs font-medium tabular-nums sm:h-9 sm:min-w-10 sm:text-[13px]',
                        tone === 'muted' &&
                            'border-[#17251c]/10 bg-[#17251c]/[0.045] text-[#384a3f] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#d7ded8]',
                        tone === 'accent' &&
                            'border-[#0c5c43]/20 bg-[#0c5c43]/[0.08] text-[#0c5c43] dark:border-[#3cbf96]/25 dark:bg-[#3cbf96]/10 dark:text-[#8be0c4]',
                        tone === 'outline' && 'border-[#17251c]/15 bg-transparent text-[#384a3f] dark:border-white/15 dark:text-[#d7ded8]',
                        tone === 'default' &&
                            'border-[#17251c]/10 bg-[#fffdf7] text-[#17251c] dark:border-white/10 dark:bg-white/[0.05] dark:text-[#f0eee4]',
                    )}
                >
                    {number}
                </span>
            ))}
            {hidden > 0 && <span className="text-muted-foreground inline-flex h-8 items-center px-1 text-[11px] sm:h-9">+{hidden} more</span>}
        </div>
    );
}
