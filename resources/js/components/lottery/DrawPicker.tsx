'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { fetchJson } from '@/lib/fetchJson';
import { cn } from '@/lib/utils';
import { CalendarDays, Check, ChevronsUpDown, Loader2, RotateCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export type DrawOption = {
    id: string;
    date: string;
    name?: string;
    firstPrize?: string;
};

type DrawPickerProps = {
    endpoint: string;
    onSelect: (id: string) => void;
    formatDate?: (date: string) => string;
    label?: string;
    description?: string;
    className?: string;
    selectedId?: string;
    sortDescending?: boolean;
};

export default function DrawPicker({
    endpoint,
    onSelect,
    formatDate = (date) => date,
    label = 'Draw archive',
    description = 'Browse earlier draws',
    className,
    selectedId,
    sortDescending = false,
}: DrawPickerProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(selectedId ?? '');
    const [dates, setDates] = useState<DrawOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const onSelectRef = useRef(onSelect);
    const autoSelected = useRef(false);

    useEffect(() => {
        onSelectRef.current = onSelect;
    }, [onSelect]);

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setError(null);

        fetchJson<{ response?: DrawOption[] }>(endpoint)
            .then((data) => {
                if (controller.signal.aborted) return;
                setDates(Array.isArray(data.response) ? data.response : []);
            })
            .catch(() => {
                if (controller.signal.aborted) return;
                setDates([]);
                setError('The draw archive could not be loaded.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [endpoint, reloadKey]);

    useEffect(() => {
        if (selectedId) {
            setValue(selectedId);
        }
    }, [selectedId]);

    const orderedDates = useMemo(() => {
        if (!sortDescending) return dates;

        return [...dates].sort((a, b) => {
            const timeA = new Date(a.date).getTime();
            const timeB = new Date(b.date).getTime();
            return (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA);
        });
    }, [dates, sortDescending]);

    useEffect(() => {
        if (autoSelected.current || selectedId || value || orderedDates.length === 0) return;

        autoSelected.current = true;
        setValue(orderedDates[0].id);
        onSelectRef.current(orderedDates[0].id);
    }, [orderedDates, selectedId, value]);

    const selected = orderedDates.find((draw) => draw.id === value);
    const latestId = orderedDates[0]?.id;

    return (
        <div
            className={cn(
                'rounded-2xl border border-[#17251c]/10 bg-[#fbf9f2]/80 p-1.5 shadow-[0_1px_0_rgba(255,255,255,0.75)_inset,0_18px_42px_-34px_rgba(18,32,25,0.55)] backdrop-blur-xl',
                'dark:border-white/[0.08] dark:bg-white/[0.035] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_18px_42px_-34px_rgba(0,0,0,0.85)]',
                className,
            )}
        >
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        role="combobox"
                        aria-expanded={open}
                        className="h-auto w-full justify-between gap-3 rounded-xl px-2.5 py-2.5 text-left hover:bg-[#17251c]/[0.04] dark:hover:bg-white/[0.05]"
                    >
                        <span className="flex min-w-0 items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#17251c]/10 bg-[#fffdf7] text-[#0c5c43] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#8be0c4]">
                                <CalendarDays className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                                <span className="eyebrow text-muted-foreground block text-[10px]">{label}</span>
                                <span className="mt-0.5 block truncate text-sm font-semibold">
                                    {loading ? 'Loading draws…' : selected ? formatDate(selected.date) : 'Choose a draw date'}
                                </span>
                                {!loading && selected && selected.id === latestId && (
                                    <span className="mt-0.5 block text-[10px] font-medium text-[#0c5c43] dark:text-[#8be0c4]">Latest draw</span>
                                )}
                                {!loading && !selected && <span className="text-muted-foreground mt-0.5 block text-[10px]">{description}</span>}
                            </span>
                        </span>
                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-40" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden p-0">
                    <Command>
                        <CommandInput placeholder="Search by date…" />
                        <CommandList className="max-h-72">
                            {loading ? (
                                <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-xs">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading draw archive…
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                                    <p className="text-muted-foreground text-xs">{error}</p>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
                                        <RotateCw className="h-3.5 w-3.5" />
                                        Try again
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <CommandEmpty>No draws match that date.</CommandEmpty>
                                    <CommandGroup heading="Recent draws">
                                        {orderedDates.map((draw) => {
                                            const isSelected = draw.id === value;

                                            return (
                                                <CommandItem
                                                    key={draw.id}
                                                    value={`${draw.id} ${draw.date} ${draw.firstPrize ?? ''}`}
                                                    onSelect={() => {
                                                        setValue(draw.id);
                                                        setOpen(false);
                                                        onSelectRef.current(draw.id);
                                                    }}
                                                    className="items-center gap-2.5 rounded-lg px-2 py-2"
                                                >
                                                    <Check
                                                        className={cn(
                                                            'h-4 w-4 shrink-0 text-[#0c5c43] dark:text-[#8be0c4]',
                                                            isSelected ? 'opacity-100' : 'opacity-0',
                                                        )}
                                                    />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-[13px] font-medium">{formatDate(draw.date)}</span>
                                                        {draw.firstPrize && (
                                                            <span className="font-ticket text-muted-foreground mt-0.5 block truncate text-[10px]">
                                                                1st {draw.firstPrize}
                                                            </span>
                                                        )}
                                                    </span>
                                                    {draw.id === latestId && (
                                                        <span className="rounded border border-[#0c5c43]/20 bg-[#0c5c43]/[0.07] px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-[#0c5c43] uppercase dark:border-[#8be0c4]/20 dark:bg-[#8be0c4]/10 dark:text-[#8be0c4]">
                                                            Latest
                                                        </span>
                                                    )}
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
