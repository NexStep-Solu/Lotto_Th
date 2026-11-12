import ImageNumberScanner from '@/components/ImageNumberScanner';
import LotteryDatePicker from '@/components/LotteryDatePicker';
import SgLotteryDatePicker from '@/components/SgLotteryDatePicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { fetchJson } from '@/lib/fetchJson';
import { normalizeImportedNumber, parseNumberList } from '@/lib/extractNumbers';
import { convertThaiDate, sgPrizeNames, translateLottoName } from '@/lib/lottoTranslate';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import * as domtoimage from 'dom-to-image-more';
import {
    AlertCircle,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleGauge,
    ClipboardPaste,
    Coins,
    FileSpreadsheet,
    Globe2,
    ImageUp,
    Info,
    Landmark,
    ListChecks,
    Loader2,
    Printer,
    ScanLine,
    Sparkles,
    Ticket,
    Trophy,
} from 'lucide-react';
import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

type LottoTab = 'thai' | 'singapore';
type InputMode = 'paste' | 'excel' | 'image';
type ResultFilter = 'all' | 'winners';

type LottoPrize = {
    id: string;
    name: string;
    number: string[];
    reward: number;
};

type LottoData = {
    response: {
        date?: string;
        prizes?: LottoPrize[];
        runningNumbers?: LottoPrize[];
        twoDLuck?: string[];
    };
};

type CheckStatus = 'WIN' | 'RUNNING' | 'LOSE';

type PrizeCheck = {
    prize: string | null;
    reward: number;
    status: CheckStatus;
};

type CheckResult = PrizeCheck & {
    number: string;
};

type SubscriptionSnapshot = {
    plan: 'basic' | 'pro';
    label: string;
    tagline: string;
    price: number;
    currency: string;
    features: string[];
    unlimited: boolean;
    limits: {
        draws_per_month: number;
        tickets_per_draw: number | null;
        total_tickets: number;
    };
    usage: {
        tickets_used: number;
        tickets_remaining: number;
        draws_used: number;
        draws_remaining: number;
        used_draws: string[];
        renews_at: string | null;
        period_start: string | null;
    };
};

function formatRenewal(value: string | null): string {
    if (!value) return 'next month';

    return new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
    });
}

function checkThaiNumber(num: string, lotto: LottoData): PrizeCheck {
    const prizes = lotto.response.prizes ?? [];
    const running = lotto.response.runningNumbers ?? [];

    for (const prize of prizes) {
        if (prize.number?.includes(num)) {
            return { prize: prize.name, reward: prize.reward, status: 'WIN' };
        }
    }

    const first3 = num.slice(0, 3);
    const last3 = num.slice(-3);
    const last2 = num.slice(-2);

    for (const number of running) {
        if (number.id === 'runningNumberFrontThree' && number.number?.includes(first3)) {
            return { prize: number.name, reward: number.reward, status: 'RUNNING' };
        }
        if (number.id === 'runningNumberBackThree' && number.number?.includes(last3)) {
            return { prize: number.name, reward: number.reward, status: 'RUNNING' };
        }
        if (number.id === 'runningNumberBackTwo' && number.number?.includes(last2)) {
            return { prize: number.name, reward: number.reward, status: 'RUNNING' };
        }
    }

    return { prize: null, reward: 0, status: 'LOSE' };
}

function checkSgNumber(num: string, lotto: LottoData): PrizeCheck {
    const prizes = lotto.response.prizes ?? [];
    const twoDLuck = lotto.response.twoDLuck ?? [];

    for (const prize of prizes) {
        if (prize.number?.includes(num)) {
            return { prize: sgPrizeNames[prize.id] ?? prize.name, reward: prize.reward, status: 'WIN' };
        }
    }

    if (twoDLuck.length > 0 && num.length >= 2) {
        const last2 = num.slice(-2);
        if (twoDLuck.includes(last2)) {
            return { prize: '2D Delight', reward: 6, status: 'RUNNING' };
        }
    }

    return { prize: null, reward: 0, status: 'LOSE' };
}

function StatusBadge({ status }: { status: CheckStatus }) {
    if (status === 'WIN') {
        return (
            <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <Trophy className="h-3 w-3" />
                Big win
            </Badge>
        );
    }

    if (status === 'RUNNING') {
        return (
            <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300">
                <Sparkles className="h-3 w-3" />
                Won
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="text-muted-foreground">
            No prize
        </Badge>
    );
}

const ITEMS_PER_PAGE = 20;

const INPUT_METHODS: { id: InputMode; label: string; icon: typeof ClipboardPaste }[] = [
    { id: 'paste', label: 'Paste', icon: ClipboardPaste },
    { id: 'excel', label: 'Excel / CSV', icon: FileSpreadsheet },
    { id: 'image', label: 'Images', icon: ImageUp },
];

export default function Dashboard({ subscription: initialSubscription }: { subscription: SubscriptionSnapshot }) {
    const [tab, setTab] = useState<LottoTab>('thai');
    const [inputMode, setInputMode] = useState<InputMode>('paste');
    const [numbers, setNumbers] = useState('');
    const [lotto, setLotto] = useState<LottoData | null>(null);
    const [sgLotto, setSgLotto] = useState<LottoData | null>(null);
    const [lottoLoading, setLottoLoading] = useState(false);
    const [results, setResults] = useState<CheckResult[]>([]);
    const [resultFilter, setResultFilter] = useState<ResultFilter>('all');
    const [page, setPage] = useState(1);
    const [excelDragging, setExcelDragging] = useState(false);
    const [subscription, setSubscription] = useState<SubscriptionSnapshot>(initialSubscription);
    const [usageRecording, setUsageRecording] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const digitLength = tab === 'thai' ? 6 : 7;
    const currency = tab === 'thai' ? 'THB' : 'SGD';
    const currentLotto = tab === 'thai' ? lotto : sgLotto;

    const parsedNumbers = useMemo(() => parseNumberList(numbers, digitLength), [numbers, digitLength]);
    const validCount = parsedNumbers.numbers.length;

    const winnerResults = results.filter((result) => result.status !== 'LOSE');
    const totalReward = results.reduce((sum, result) => sum + (Number(result.reward) || 0), 0);
    const filteredResults = resultFilter === 'winners' ? winnerResults : results;
    const totalPages = Math.max(1, Math.ceil(filteredResults.length / ITEMS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const paginatedResults = filteredResults.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const visiblePageNumbers = useMemo(() => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
        return Array.from({ length: 5 }, (_, index) => start + index);
    }, [currentPage, totalPages]);

    const drawDate = currentLotto?.response?.date;
    const drawDateLabel = drawDate
        ? tab === 'thai'
            ? convertThaiDate(drawDate)
            : drawDate
        : lottoLoading
          ? 'Loading draw results…'
          : 'No draw selected';

    const translateName = (name: string) => {
        if (tab === 'thai') return translateLottoName(name) ?? '-';
        return name ?? '-';
    };

    const recordUsage = async (drawKey: string, tickets: number): Promise<boolean> => {
        setUsageRecording(true);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const response = await fetch('/dashboard/usage', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ draw: drawKey, tickets }),
            });

            const payload = (await response.json().catch(() => null)) as {
                subscription?: SubscriptionSnapshot;
                message?: string;
            } | null;

            if (payload?.subscription) {
                setSubscription(payload.subscription);
            }

            if (!response.ok) {
                toast.error(payload?.message ?? 'Your plan limit was reached.', {
                    description: 'Manage your plan in Settings → Plan & usage.',
                });
                return false;
            }

            return true;
        } catch {
            toast.warning('Usage could not be recorded, but this check can continue.');
            return true;
        } finally {
            setUsageRecording(false);
        }
    };

    const runCheck = async (list: string[]) => {
        if (!currentLotto) {
            toast.error('Draw results are still loading. Please try again in a moment.');
            return;
        }

        if (list.length === 0) {
            toast.error(`Add at least one ${digitLength}-digit number.`);
            return;
        }

        const drawKey = `${tab}:${currentLotto.response.date ?? 'latest'}`;
        const isNewDraw = !subscription.usage.used_draws.includes(drawKey);

        if (!subscription.unlimited) {
            if (isNewDraw && subscription.usage.draws_remaining <= 0) {
                toast.error(
                    `Your ${subscription.label} plan already used all ${subscription.limits.draws_per_month} draws this month.`,
                    {
                        description: 'Manage your plan in Settings → Plan & usage.',
                    },
                );
                return;
            }

            if (list.length > subscription.usage.tickets_remaining) {
                toast.error(
                    `Your ${subscription.label} plan has ${subscription.usage.tickets_remaining.toLocaleString()} tickets left this month.`,
                    {
                        description: 'Reduce the list or upgrade in Settings → Plan & usage.',
                    },
                );
                return;
            }
        }

        const usageAccepted = await recordUsage(drawKey, list.length);

        if (!usageAccepted) {
            return;
        }

        const checked = list.map((number) => ({
            number,
            ...(tab === 'thai' ? checkThaiNumber(number, currentLotto) : checkSgNumber(number, currentLotto)),
        }));

        setResults(checked);
        setResultFilter('all');
        setPage(1);

        const winners = checked.filter((result) => result.status !== 'LOSE').length;
        if (winners > 0) {
            toast.success(`${winners} winning number${winners === 1 ? '' : 's'} found.`);
        } else {
            toast.info('No winning numbers this time.');
        }
    };

    const handleCheck = () => {
        if (usageRecording) {
            return;
        }

        if (parsedNumbers.skipped > 0) {
            toast.warning(
                `${parsedNumbers.skipped} entr${parsedNumbers.skipped === 1 ? 'y was' : 'ies were'} ignored — use ${digitLength}-digit numbers.`,
            );
        }
        void runCheck(parsedNumbers.numbers);
    };

    const handleSelectDate = async (id: string) => {
        setLottoLoading(true);
        setResults([]);
        try {
            setLotto(await fetchJson<LottoData>(`/api/lotto/lotto/${id}`));
        } catch {
            toast.error('Could not load that Thai draw. Please try another date.');
        } finally {
            setLottoLoading(false);
        }
    };

    const handleSgSelectDate = async (id: string) => {
        setLottoLoading(true);
        setResults([]);
        try {
            setSgLotto(await fetchJson<LottoData>(`/api/lotto/sg/lotto/${id}`));
        } catch {
            toast.error('Could not load that Singapore draw. Please try another date.');
        } finally {
            setLottoLoading(false);
        }
    };

    const handleScannedNumbers = (scanned: string[]) => {
        const existing = parseNumberList(numbers, digitLength).numbers;
        const merged = Array.from(new Set([...existing, ...scanned]));

        setNumbers(merged.join('\n'));
        void runCheck(merged);
    };

    const handleExcelFiles = async (files: File[]) => {
        if (files.length === 0) return;

        const collected: string[] = [];
        let skippedCells = 0;

        for (const file of files) {
            try {
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'array' });

                for (const sheetName of workbook.SheetNames) {
                    const sheet = workbook.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
                        header: 1,
                        raw: false,
                        defval: '',
                    });

                    for (const row of rows) {
                        for (const cell of row) {
                            const normalized = normalizeImportedNumber(cell, digitLength);
                            if (normalized) {
                                collected.push(normalized);
                            } else if (String(cell ?? '').trim() !== '') {
                                skippedCells++;
                            }
                        }
                    }
                }
            } catch {
                toast.error(`${file.name} could not be read as a spreadsheet.`);
            }
        }

        const unique = Array.from(new Set(collected));

        if (unique.length === 0) {
            toast.error(`No ${digitLength}-digit numbers were found in those files.`);
            return;
        }

        const existing = parseNumberList(numbers, digitLength).numbers;
        const merged = Array.from(new Set([...existing, ...unique]));
        setNumbers(merged.join('\n'));

        toast.success(
            `Imported ${unique.length} number${unique.length === 1 ? '' : 's'} from ${files.length} file${files.length === 1 ? '' : 's'}.`,
        );

        if (skippedCells > 0) {
            toast.info(`${skippedCells} other cell${skippedCells === 1 ? '' : 's'} did not look like ${digitLength}-digit numbers.`);
        }
    };

    const handleExcelInput = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = '';
        void handleExcelFiles(files);
    };

    const handleExcelDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setExcelDragging(false);
        void handleExcelFiles(Array.from(event.dataTransfer.files));
    };

    const handlePrintImage = async () => {
        if (!printRef.current || results.length === 0) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Allow pop-ups for this site to print the results.');
            return;
        }

        printWindow.opener = null;
        printWindow.document.title = 'Lottery Results';
        printWindow.document.body.style.margin = '0';
        printWindow.document.body.style.minHeight = '100vh';
        printWindow.document.body.style.display = 'flex';
        printWindow.document.body.style.alignItems = 'center';
        printWindow.document.body.style.justifyContent = 'center';

        const status = printWindow.document.createElement('p');
        status.textContent = 'Preparing your print sheet…';
        status.style.fontFamily = 'sans-serif';
        status.style.fontSize = '14px';
        status.style.color = '#555';
        printWindow.document.body.appendChild(status);

        try {
            const blob = await domtoimage.toBlob(printRef.current, {
                bgcolor: '#ffffff',
                scale: 2,
                style: { 'font-family': 'sans-serif' },
            });
            const imageUrl = URL.createObjectURL(blob);
            const image = printWindow.document.createElement('img');
            image.src = imageUrl;
            image.alt = 'Lottery results';
            image.style.maxWidth = '100%';
            image.style.height = 'auto';
            image.addEventListener(
                'load',
                () => {
                    printWindow.focus();
                    printWindow.print();
                    window.setTimeout(() => URL.revokeObjectURL(imageUrl), 60000);
                },
                { once: true },
            );
            printWindow.document.body.replaceChildren(image);
        } catch {
            printWindow.close();
            toast.error('The print sheet could not be generated. Please try again.');
        }
    };

    const changeTab = (nextTab: LottoTab) => {
        setTab(nextTab);
        setResults([]);
        setResultFilter('all');
        setPage(1);
        setInputMode('paste');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Lottery Checker', href: '/dashboard' }]}>
            <Head title="Lottery Checker" />

            <div className="mx-auto w-full space-y-5 p-4 sm:p-6">
                {/* Page header */}
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                            <Ticket className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Lottery Checker</h1>
                                <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wider">
                                    Admin
                                </Badge>
                            </div>
                            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                Scan ticket photos, import a spreadsheet, or paste numbers — then check everything against the
                                selected draw.
                            </p>
                        </div>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-1 rounded-xl border bg-muted/50 p-1 sm:w-auto">
                        <button
                            type="button"
                            onClick={() => changeTab('thai')}
                            className={cn(
                                'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                                tab === 'thai'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <Landmark className="h-4 w-4" />
                            Thai Lotto
                        </button>
                        <button
                            type="button"
                            onClick={() => changeTab('singapore')}
                            className={cn(
                                'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                                tab === 'singapore'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <Globe2 className="h-4 w-4" />
                            Singapore Sweep
                        </button>
                    </div>
                </div>

                {/* Plan & usage */}
                <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)_auto] lg:items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0c5c43]/10 text-[#0c5c43] dark:bg-emerald-400/10 dark:text-emerald-300">
                                <CircleGauge className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    BlameVerse plan
                                </p>
                                <p className="truncate text-sm font-semibold">
                                    {subscription.label}
                                    <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                                        renews {formatRenewal(subscription.usage.renews_at)}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {subscription.unlimited ? (
                            <div className="rounded-xl border border-[#0c5c43]/20 bg-[#0c5c43]/[0.06] px-4 py-3 text-sm font-semibold text-[#0c5c43] dark:text-emerald-300">
                                Unlimited checking for administrators
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <div className="flex items-center justify-between gap-2 text-[11px]">
                                        <span className="font-medium text-muted-foreground">Tickets this month</span>
                                        <span className="font-ticket tabular-nums">
                                            {subscription.usage.tickets_used.toLocaleString()} /{' '}
                                            {subscription.limits.total_tickets.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all',
                                                subscription.usage.tickets_remaining <= 0
                                                    ? 'bg-amber-500'
                                                    : 'bg-[#0c5c43] dark:bg-emerald-400',
                                            )}
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    Math.round(
                                                        (subscription.usage.tickets_used /
                                                            subscription.limits.total_tickets) *
                                                            100,
                                                    ),
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between gap-2 text-[11px]">
                                        <span className="font-medium text-muted-foreground">Draws this month</span>
                                        <span className="font-ticket tabular-nums">
                                            {subscription.usage.draws_used} / {subscription.limits.draws_per_month}
                                        </span>
                                    </div>
                                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all',
                                                subscription.usage.draws_remaining <= 0
                                                    ? 'bg-amber-500'
                                                    : 'bg-[#0c5c43] dark:bg-emerald-400',
                                            )}
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    Math.round(
                                                        (subscription.usage.draws_used /
                                                            subscription.limits.draws_per_month) *
                                                            100,
                                                    ),
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <Link
                            href={route('subscription.edit')}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition hover:bg-muted lg:justify-self-end"
                        >
                            Manage plan
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </section>

                {/* Draw picker */}
                <Card className="gap-0 overflow-hidden border-primary/15 bg-gradient-to-r from-primary/[0.06] via-transparent to-transparent py-0">
                    <CardContent className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                    Selected draw
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold sm:text-base">{drawDateLabel}</p>
                                    {lottoLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                                    {currentLotto && (
                                        <Badge variant="outline" className="rounded-full bg-background/60 text-[10px]">
                                            {currentLotto.response.prizes?.length ?? 0} prize rows
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="w-full sm:max-w-xs">
                            {tab === 'thai' ? (
                                <LotteryDatePicker onSelect={handleSelectDate} />
                            ) : (
                                <SgLotteryDatePicker onSelect={handleSgSelectDate} />
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
                    {/* Input card */}
                    <Card className="gap-0 self-start overflow-hidden">
                        <CardHeader className="gap-4 border-b bg-muted/20 px-4 py-4 sm:px-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base">Check numbers</CardTitle>
                                    <CardDescription className="mt-1 text-xs">
                                        Add tickets using whichever method is fastest for you.
                                    </CardDescription>
                                </div>
                                {validCount > 0 && (
                                    <Badge variant="secondary" className="rounded-full">
                                        {validCount} ready
                                    </Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
                                {INPUT_METHODS.map((method) => {
                                    const Icon = method.icon;
                                    return (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setInputMode(method.id)}
                                            className={cn(
                                                'flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all',
                                                inputMode === method.id
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{method.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4 px-4 py-4 sm:px-5">
                            {inputMode === 'paste' && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="lottery-numbers" className="text-xs font-medium">
                                            Numbers, one per line
                                        </label>
                                        <span className="text-[11px] text-muted-foreground">{digitLength} digits each</span>
                                    </div>
                                    <Textarea
                                        id="lottery-numbers"
                                        rows={9}
                                        value={numbers}
                                        onChange={(event) => setNumbers(event.target.value)}
                                        placeholder={
                                            tab === 'thai'
                                                ? '011781\n011780\n011782\n123456'
                                                : '3122414\n2288613\n2086056'
                                        }
                                        className="min-h-[190px] resize-none font-mono text-sm tracking-wider"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Tip: paste a column from Excel — spaces and commas are handled automatically.
                                    </p>
                                </div>
                            )}

                            {inputMode === 'excel' && (
                                <div className="space-y-3">
                                    <label
                                        onDragOver={(event) => {
                                            event.preventDefault();
                                            setExcelDragging(true);
                                        }}
                                        onDragLeave={() => setExcelDragging(false)}
                                        onDrop={handleExcelDrop}
                                        className={cn(
                                            'group flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200',
                                            excelDragging
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50 hover:bg-muted/40',
                                        )}
                                    >
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            multiple
                                            className="hidden"
                                            onChange={handleExcelInput}
                                        />
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-105 dark:text-emerald-400">
                                            <FileSpreadsheet className="h-7 w-7" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold">Upload Excel or CSV</p>
                                            <p className="text-xs text-muted-foreground">
                                                Drop files here or click to browse
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-1.5">
                                            {['.xlsx', '.xls', '.csv'].map((extension) => (
                                                <span
                                                    key={extension}
                                                    className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground"
                                                >
                                                    {extension}
                                                </span>
                                            ))}
                                        </div>
                                    </label>

                                    <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                        <p>
                                            All sheets and cells are scanned. Leading zeros are restored automatically
                                            (e.g. 11781 becomes 011781).
                                        </p>
                                    </div>

                                    {numbers !== '' && (
                                        <Button variant="outline" className="w-full" onClick={() => setInputMode('paste')}>
                                            <ClipboardPaste className="h-4 w-4" />
                                            Review imported numbers
                                        </Button>
                                    )}
                                </div>
                            )}

                            {inputMode === 'image' && (
                                <ImageNumberScanner
                                    key={tab}
                                    digitLength={digitLength}
                                    disabled={!currentLotto || lottoLoading}
                                    onUseNumbers={handleScannedNumbers}
                                />
                            )}

                            <div className="rounded-xl border bg-muted/30 p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <ListChecks className="h-4 w-4 text-primary" />
                                        <span>
                                            <strong className="text-foreground">{validCount}</strong>{' '}
                                            {validCount === 1 ? 'number' : 'numbers'} ready to check
                                        </span>
                                    </div>
                                    {numbers !== '' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                            onClick={() => setNumbers('')}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>

                                {parsedNumbers.skipped > 0 && (
                                    <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                                        <AlertCircle className="h-3 w-3" />
                                        {parsedNumbers.skipped} entr{parsedNumbers.skipped === 1 ? 'y' : 'ies'} will be
                                        ignored (needs {digitLength} digits).
                                    </p>
                                )}
                            </div>

                            {subscription.unlimited ? (
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <CircleGauge className="h-3.5 w-3.5" />
                                    Unlimited checking for administrators
                                </div>
                            ) : (
                                <div
                                    className={cn(
                                        'flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]',
                                        subscription.usage.tickets_remaining <= 0 ||
                                            subscription.usage.draws_remaining <= 0 ||
                                            validCount > subscription.usage.tickets_remaining
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        <CircleGauge className="h-3.5 w-3.5" />
                                        {subscription.usage.tickets_remaining.toLocaleString()} ticket
                                        {subscription.usage.tickets_remaining === 1 ? '' : 's'} left this month
                                    </span>
                                    <span className="text-border hidden sm:inline">•</span>
                                    <span>
                                        {subscription.usage.draws_remaining} of {subscription.limits.draws_per_month}{' '}
                                        draws left
                                    </span>
                                    {validCount > subscription.usage.tickets_remaining && (
                                        <span className="basis-full">
                                            This list is larger than the tickets left on your {subscription.label}{' '}
                                            plan.
                                        </span>
                                    )}
                                </div>
                            )}

                            <Button
                                size="lg"
                                onClick={handleCheck}
                                disabled={
                                    !currentLotto || lottoLoading || validCount === 0 || usageRecording
                                }
                                className="w-full shadow-md shadow-primary/20"
                            >
                                {lottoLoading || usageRecording ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ScanLine className="h-4 w-4" />
                                )}
                                {lottoLoading
                                    ? 'Loading draw results…'
                                    : usageRecording
                                      ? 'Recording usage…'
                                      : validCount > 0
                                        ? `Check ${validCount} number${validCount === 1 ? '' : 's'}`
                                        : 'Check numbers'}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Checked instantly in your browser
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results column */}
                    <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <Card className="gap-0 border-sky-500/20 bg-sky-500/[0.06] py-3">
                                <CardContent className="flex items-center gap-3 px-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400">
                                        <ListChecks className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                            Checked
                                        </p>
                                        <p className="text-lg font-bold tabular-nums">{results.length}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="gap-0 border-emerald-500/20 bg-emerald-500/[0.06] py-3">
                                <CardContent className="flex items-center gap-3 px-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                        <Trophy className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                            Winners
                                        </p>
                                        <p className="text-lg font-bold tabular-nums">{winnerResults.length}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="gap-0 border-amber-500/20 bg-amber-500/[0.06] py-3">
                                <CardContent className="flex items-center gap-3 px-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                        <Coins className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                            Total reward
                                        </p>
                                        <p className="text-lg font-bold tabular-nums">
                                            {totalReward.toLocaleString()}{' '}
                                            <span className="text-xs font-medium text-muted-foreground">{currency}</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="gap-0 overflow-hidden">
                            <CardHeader className="gap-3 border-b bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        Results
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-xs">
                                        Checked against {drawDateLabel}
                                    </CardDescription>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="inline-flex rounded-lg border bg-background p-0.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setResultFilter('all');
                                                setPage(1);
                                            }}
                                            className={cn(
                                                'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                                                resultFilter === 'all'
                                                    ? 'bg-muted text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            All ({results.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setResultFilter('winners');
                                                setPage(1);
                                            }}
                                            className={cn(
                                                'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                                                resultFilter === 'winners'
                                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            Winners ({winnerResults.length})
                                        </button>
                                    </div>

                                    {results.length > 0 && (
                                        <Button variant="outline" size="sm" onClick={handlePrintImage}>
                                            <Printer className="h-4 w-4" />
                                            Print
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="px-0 pb-0">
                                {results.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                            <ScanLine className="h-6 w-6" />
                                        </div>
                                        <p className="mt-3 text-sm font-semibold">No numbers checked yet</p>
                                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                            Paste numbers, import a spreadsheet, or scan ticket images. Results and winners
                                            will appear here.
                                        </p>
                                    </div>
                                ) : filteredResults.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                            <Trophy className="h-6 w-6" />
                                        </div>
                                        <p className="mt-3 text-sm font-semibold">No winners in this batch</p>
                                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                            Try the “All” filter to review every number you checked.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="pl-4 sm:pl-5">Number</TableHead>
                                                    <TableHead>Prize</TableHead>
                                                    <TableHead className="text-right">Reward</TableHead>
                                                    <TableHead className="pr-4 text-right sm:pr-5">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedResults.map((result, index) => (
                                                    <TableRow
                                                        key={`${result.number}-${index}`}
                                                        className={cn(result.status !== 'LOSE' && 'bg-emerald-500/[0.04]')}
                                                    >
                                                        <TableCell className="pl-4 font-mono text-sm font-semibold tracking-wider sm:pl-5">
                                                            {result.number}
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {result.prize ? (
                                                                translateName(result.prize)
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium tabular-nums">
                                                            {result.reward > 0
                                                                ? `${Number(result.reward).toLocaleString()} ${currency}`
                                                                : '—'}
                                                        </TableCell>
                                                        <TableCell className="pr-4 text-right sm:pr-5">
                                                            <StatusBadge status={result.status} />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        {totalPages > 1 && (
                                            <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:px-5">
                                                <p className="text-xs text-muted-foreground">
                                                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                                                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredResults.length)} of{' '}
                                                    {filteredResults.length}
                                                </p>
                                                <Pagination className="mx-0 w-auto">
                                                    <PaginationContent className="flex-wrap justify-center">
                                                        <PaginationItem>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                aria-label="Previous page"
                                                                disabled={currentPage === 1}
                                                                onClick={() => setPage(Math.max(1, currentPage - 1))}
                                                                className="h-8 w-8"
                                                            >
                                                                <ChevronLeft className="h-4 w-4" />
                                                            </Button>
                                                        </PaginationItem>
                                                        {visiblePageNumbers.map((pageNumber) => (
                                                            <PaginationItem key={pageNumber}>
                                                                <Button
                                                                    variant={currentPage === pageNumber ? 'default' : 'ghost'}
                                                                    size="sm"
                                                                    onClick={() => setPage(pageNumber)}
                                                                    className="h-8 min-w-8 px-2 tabular-nums"
                                                                    aria-current={currentPage === pageNumber ? 'page' : undefined}
                                                                >
                                                                    {pageNumber}
                                                                </Button>
                                                            </PaginationItem>
                                                        ))}
                                                        <PaginationItem>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                aria-label="Next page"
                                                                disabled={currentPage === totalPages}
                                                                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                                                                className="h-8 w-8"
                                                            >
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                        </PaginationItem>
                                                    </PaginationContent>
                                                </Pagination>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Hidden print layout */}
                {results.length > 0 && (
                    <div
                        ref={printRef}
                        className="bg-white p-6 text-black"
                        style={{ position: 'fixed', left: '-9999px', top: 0, width: '800px' }}
                    >
                        <div className="mb-6 text-center">
                            <h1 className="text-2xl font-bold">Lottery Results</h1>
                            <p className="text-sm text-gray-500">
                                {tab === 'thai' ? 'Thai Lotto' : 'Singapore Sweep'}
                                {drawDate ? ` - ${drawDate}` : ''}
                            </p>
                        </div>

                        <div className="mb-6">
                            <h2 className="mb-3 border-b pb-1 text-lg font-semibold">Win Results</h2>
                            <table className="w-full border-collapse border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 p-2 text-left">#</th>
                                        <th className="border border-gray-300 p-2 text-left">Number</th>
                                        <th className="border border-gray-300 p-2 text-left">Prize</th>
                                        <th className="border border-gray-300 p-2 text-right">Reward</th>
                                        <th className="border border-gray-300 p-2 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {winnerResults.map((result, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                            <td className="border border-gray-300 p-2">{index + 1}</td>
                                            <td className="border border-gray-300 p-2">{result.number}</td>
                                            <td className="border border-gray-300 p-2">{translateName(result.prize ?? '')}</td>
                                            <td className="border border-gray-300 p-2 text-right">
                                                {Number(result.reward).toLocaleString()}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center font-semibold">
                                                {result.status === 'WIN' ? 'BIG WIN' : 'WON'}
                                            </td>
                                        </tr>
                                    ))}
                                    {winnerResults.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="border border-gray-300 p-4 text-center text-gray-500">
                                                No winners
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h2 className="mb-3 border-b pb-1 text-lg font-semibold">Total Results</h2>
                            <table className="w-full border-collapse border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 p-2 text-left">Description</th>
                                        <th className="border border-gray-300 p-2 text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-300 p-2 font-medium">Total Numbers Checked</td>
                                        <td className="border border-gray-300 p-2 text-right">
                                            {results.length.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-medium">Total Winners</td>
                                        <td className="border border-gray-300 p-2 text-right font-semibold text-green-700">
                                            {winnerResults.length.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-300 p-2 font-medium">Total Reward</td>
                                        <td className="border border-gray-300 p-2 text-right font-semibold text-green-700">
                                            {totalReward.toLocaleString()} {currency}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
