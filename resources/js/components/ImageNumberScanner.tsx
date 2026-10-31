import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { scanTicketImage } from '@/lib/ticketOcr';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, ImagePlus, Info, Loader2, ScanLine, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import Tesseract from 'tesseract.js';

type ScanStatus = 'queued' | 'processing' | 'done' | 'error';

type ScanImage = {
    id: string;
    file: File;
    previewUrl: string;
    status: ScanStatus;
    progress: number;
    numbers: string[];
    error?: string;
};

type ImageNumberScannerProps = {
    digitLength: number;
    disabled?: boolean;
    onUseNumbers: (numbers: string[]) => void;
};

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ENGINE_STATUS_LABELS: Record<string, string> = {
    'loading tesseract core': 'Loading OCR engine…',
    'initializing tesseract': 'Starting OCR engine…',
    'loading language traineddata': 'Downloading digit model…',
    'initializing api': 'Preparing OCR…',
    'recognizing text': 'Reading numbers…',
};

function statusLabel(status: ScanStatus) {
    switch (status) {
        case 'queued':
            return 'Waiting…';
        case 'processing':
            return 'Scanning…';
        case 'done':
            return 'Scanned';
        default:
            return 'Failed';
    }
}

function createImageId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ImageNumberScanner({ digitLength, disabled, onUseNumbers }: ImageNumberScannerProps) {
    const [images, setImages] = useState<ScanImage[]>([]);
    const [dragging, setDragging] = useState(false);
    const [busy, setBusy] = useState(false);
    const [engineStatus, setEngineStatus] = useState('');
    const [engineProgress, setEngineProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const workerRef = useRef<Tesseract.Worker | null>(null);
    const workerPromiseRef = useRef<Promise<Tesseract.Worker> | null>(null);
    const mountedRef = useRef(true);
    const objectUrlsRef = useRef<string[]>([]);
    const scanningRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            workerRef.current?.terminate().catch(() => undefined);
            workerRef.current = null;
            objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
            objectUrlsRef.current = [];
        };
    }, []);

    const updateImage = (id: string, patch: Partial<ScanImage>) => {
        setImages((prev) => prev.map((image) => (image.id === id ? { ...image, ...patch } : image)));
    };

    const getWorker = async (): Promise<Tesseract.Worker> => {
        if (workerRef.current) return workerRef.current;
        if (workerPromiseRef.current) return workerPromiseRef.current;

        const promise = (async () => {
            setEngineStatus(ENGINE_STATUS_LABELS['loading tesseract core']);
            setEngineProgress(0);

            const worker = await Tesseract.createWorker('eng', Tesseract.OEM.LSTM_ONLY, {
                logger: (message) => {
                    if (!mountedRef.current) return;

                    // Per-image progress is reported by the scanning pipeline;
                    // the engine logger is only needed while assets load.
                    if (message.status === 'recognizing text') return;

                    if (ENGINE_STATUS_LABELS[message.status]) {
                        setEngineStatus(ENGINE_STATUS_LABELS[message.status]);
                        setEngineProgress(Math.round(message.progress * 100));
                    }
                },
            });

            if (!mountedRef.current) {
                await worker.terminate();
                throw new Error('Scanner was closed.');
            }

            await worker.setParameters({
                tessedit_char_whitelist: '0123456789',
                tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
                preserve_interword_spaces: '1',
            });

            workerRef.current = worker;
            setEngineStatus('');
            setEngineProgress(0);

            return worker;
        })();

        workerPromiseRef.current = promise;

        try {
            return await promise;
        } finally {
            workerPromiseRef.current = null;
        }
    };

    const scanFiles = async (fileList: File[]) => {
        if (scanningRef.current || fileList.length === 0) return;

        const imageFiles = fileList.filter((file) => file.type.startsWith('image/'));
        const remainingSlots = Math.max(0, MAX_IMAGES - images.length);
        const accepted = imageFiles.filter((file) => file.size <= MAX_FILE_SIZE).slice(0, remainingSlots);
        const rejectedCount = fileList.length - accepted.length;

        setError(
            rejectedCount > 0
                ? `${rejectedCount} file${rejectedCount === 1 ? ' was' : 's were'} skipped. Use images up to 20 MB (max ${MAX_IMAGES}).`
                : null,
        );

        if (accepted.length === 0) return;

        const items: ScanImage[] = accepted.map((file) => {
            const previewUrl = URL.createObjectURL(file);
            objectUrlsRef.current.push(previewUrl);

            return {
                id: createImageId(),
                file,
                previewUrl,
                status: 'queued',
                progress: 0,
                numbers: [],
            };
        });

        setImages((prev) => [...prev, ...items]);
        scanningRef.current = true;
        setBusy(true);

        try {
            const worker = await getWorker();

            for (const item of items) {
                if (!mountedRef.current) break;

                updateImage(item.id, { status: 'processing', progress: 2 });

                try {
                    const numbers = await scanTicketImage(item.file, digitLength, worker, (progress) => {
                        if (!mountedRef.current) return;
                        updateImage(item.id, { progress });
                    });

                    if (!mountedRef.current) break;

                    updateImage(item.id, {
                        status: 'done',
                        progress: 100,
                        numbers,
                    });
                } catch {
                    if (!mountedRef.current) break;
                    updateImage(item.id, {
                        status: 'error',
                        progress: 100,
                        error: 'Could not read this image.',
                    });
                }
            }
        } catch {
            if (mountedRef.current) {
                setError('The OCR engine could not start. Check your internet connection and try again.');
            }
        } finally {
            scanningRef.current = false;
            if (mountedRef.current) setBusy(false);
        }
    };

    const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = '';
        void scanFiles(files);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        if (busy) return;
        void scanFiles(Array.from(event.dataTransfer.files));
    };

    const removeImage = (image: ScanImage) => {
        if (busy) return;
        URL.revokeObjectURL(image.previewUrl);
        objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== image.previewUrl);
        setImages((prev) => prev.filter((item) => item.id !== image.id));
    };

    const removeNumber = (imageId: string, number: string) => {
        if (busy) return;
        setImages((prev) =>
            prev.map((image) => (image.id === imageId ? { ...image, numbers: image.numbers.filter((value) => value !== number) } : image)),
        );
    };

    const clearAll = () => {
        if (busy) return;
        objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        objectUrlsRef.current = [];
        setImages([]);
        setError(null);
    };

    const detectedNumbers: string[] = [];
    const seenNumbers = new Set<string>();
    for (const image of images) {
        for (const number of image.numbers) {
            if (!seenNumbers.has(number)) {
                seenNumbers.add(number);
                detectedNumbers.push(number);
            }
        }
    }

    const processingImage = images.find((image) => image.status === 'processing');
    const activeProgress = engineStatus ? engineProgress : (processingImage?.progress ?? 0);
    const activeLabel = engineStatus || (processingImage ? `Reading ${processingImage.file.name}…` : 'Preparing images…');
    const finishedCount = images.filter((image) => image.status === 'done' || image.status === 'error').length;

    return (
        <div className="space-y-4">
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />

            <div
                role="button"
                tabIndex={busy ? -1 : 0}
                aria-label="Upload ticket images"
                onClick={() => !busy && inputRef.current?.click()}
                onKeyDown={(event) => {
                    if (!busy && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDragEnter={(event) => {
                    event.preventDefault();
                    if (!busy) setDragging(true);
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                    if (!busy) setDragging(true);
                }}
                onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                        setDragging(false);
                    }
                }}
                onDrop={handleDrop}
                className={cn(
                    'group focus-visible:ring-ring relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 outline-none focus-visible:ring-2',
                    dragging ? 'border-primary bg-primary/5 shadow-inner' : 'border-border hover:border-primary/50 hover:bg-muted/40',
                    busy && 'cursor-wait opacity-90',
                )}
            >
                <div
                    className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200',
                        dragging ? 'bg-primary text-primary-foreground scale-110' : 'bg-primary/10 text-primary group-hover:scale-105',
                    )}
                >
                    {busy ? <Loader2 className="h-7 w-7 animate-spin" /> : <ImagePlus className="h-7 w-7" />}
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-semibold">{busy ? 'Scanning ticket images…' : 'Drop ticket images here'}</p>
                    <p className="text-muted-foreground text-xs">or click to browse · JPG, PNG, WEBP · up to {MAX_IMAGES} images</p>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5">
                    <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-[11px]">{digitLength}-digit numbers</span>
                    <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-[11px]">Scanned privately in your browser</span>
                </div>

                {busy && (
                    <div className="w-full max-w-sm space-y-1.5 pt-1">
                        <div className="text-muted-foreground flex items-center justify-between gap-3 text-[11px]">
                            <span className="truncate">{activeLabel}</span>
                            <span className="shrink-0 font-medium">
                                {finishedCount}/{images.length}
                            </span>
                        </div>
                        <Progress value={activeProgress} className="h-1.5" />
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {images.length === 0 && (
                <div className="bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-xl p-3 text-xs">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                        For best results, keep tickets flat, well lit and free of glare. Every {digitLength}-digit number found across all images is
                        collected for you to review before checking.
                    </p>
                </div>
            )}

            {images.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-xs font-medium">
                            {images.length} image{images.length === 1 ? '' : 's'}
                        </p>
                        <Button variant="ghost" size="sm" onClick={clearAll} disabled={busy} className="h-7 text-xs">
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear all
                        </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className={cn(
                                    'bg-card relative overflow-hidden rounded-xl border p-3 shadow-xs transition-colors',
                                    image.status === 'error' && 'border-rose-500/40',
                                    image.status === 'done' && image.numbers.length > 0 && 'border-emerald-500/30',
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <a href={image.previewUrl} target="_blank" rel="noreferrer" title="Open full image" className="shrink-0">
                                        <img
                                            src={image.previewUrl}
                                            alt={image.file.name}
                                            className="h-14 w-14 rounded-lg border object-cover transition-transform hover:scale-105"
                                        />
                                    </a>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium" title={image.file.name}>
                                            {image.file.name}
                                        </p>
                                        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                                            {image.status === 'done' ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {image.numbers.length} number{image.numbers.length === 1 ? '' : 's'}
                                                </span>
                                            ) : image.status === 'error' ? (
                                                <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {image.error}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1">
                                                    {image.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
                                                    {statusLabel(image.status)}
                                                </span>
                                            )}
                                        </div>

                                        {image.status === 'processing' && <Progress value={image.progress} className="mt-2 h-1" />}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeImage(image)}
                                        disabled={busy}
                                        className="text-muted-foreground hover:text-foreground h-6 w-6 shrink-0"
                                        aria-label={`Remove ${image.file.name}`}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                {image.status === 'done' && image.numbers.length === 0 && (
                                    <p className="mt-2 rounded-md bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
                                        No {digitLength}-digit numbers found. Try a clearer or closer photo.
                                    </p>
                                )}

                                {image.numbers.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {image.numbers.map((number) => (
                                            <span
                                                key={number}
                                                className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-wide"
                                            >
                                                {number}
                                                <button
                                                    type="button"
                                                    onClick={() => removeNumber(image.id, number)}
                                                    disabled={busy}
                                                    className="text-primary/60 hover:text-primary rounded-sm transition-colors disabled:opacity-50"
                                                    aria-label={`Remove ${number}`}
                                                >
                                                    <X className="h-2.5 w-2.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {detectedNumbers.length > 0 && (
                <div className="border-primary/20 from-primary/[0.07] rounded-2xl border bg-gradient-to-br to-transparent p-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-primary h-4 w-4" />
                            <p className="text-sm font-semibold">Detected numbers</p>
                            <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px]">
                                {detectedNumbers.length}
                            </Badge>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {detectedNumbers.map((number) => (
                            <span
                                key={number}
                                className="border-primary/20 bg-background rounded-lg border px-2.5 py-1 font-mono text-sm font-semibold tracking-wider shadow-xs"
                            >
                                {number}
                            </span>
                        ))}
                    </div>

                    <Button type="button" onClick={() => onUseNumbers(detectedNumbers)} disabled={disabled || busy} className="mt-4 w-full sm:w-auto">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
                        Add {detectedNumbers.length} number{detectedNumbers.length === 1 ? '' : 's'} &amp; check
                    </Button>

                    {disabled && <p className="text-muted-foreground mt-2 text-[11px]">Waiting for the draw results before checking.</p>}
                </div>
            )}
        </div>
    );
}
