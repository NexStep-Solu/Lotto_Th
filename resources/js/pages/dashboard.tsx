import LotteryDatePicker from '@/components/LotteryDatePicker';
import SgLotteryDatePicker from '@/components/SgLotteryDatePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { translateLottoName, sgPrizeNames } from '@/lib/lottoTranslate';
import { Head } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

type LottoTab = 'thai' | 'singapore';

function checkThaiNumber(num: string, lotto: any) {
    const prizes = lotto.response.prizes;
    const running = lotto.response.runningNumbers;

    for (const p of prizes) {
        if (p.number.includes(num)) {
            return { prize: p.name, reward: p.reward, status: 'WIN' };
        }
    }

    const first3 = num.slice(0, 3);
    const last3 = num.slice(-3);
    const last2 = num.slice(-2);

    for (const r of running) {
        if (r.id === 'runningNumberFrontThree' && r.number.includes(first3)) {
            return { prize: r.name, reward: r.reward, status: 'RUNNING' };
        }
        if (r.id === 'runningNumberBackThree' && r.number.includes(last3)) {
            return { prize: r.name, reward: r.reward, status: 'RUNNING' };
        }
        if (r.id === 'runningNumberBackTwo' && r.number.includes(last2)) {
            return { prize: r.name, reward: r.reward, status: 'RUNNING' };
        }
    }

    return { prize: null, reward: 0, status: 'LOSE' };
}

function checkSgNumber(num: string, lotto: any) {
    const prizes = lotto.response.prizes;
    const twoDLuck = lotto.response.twoDLuck || [];

    for (const p of prizes) {
        if (p.number.includes(num)) {
            return { prize: sgPrizeNames[p.id] ?? p.name, reward: p.reward, status: 'WIN' };
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

const ITEMS_PER_PAGE = 20;

export default function Dashboard() {
    const [tab, setTab] = useState<LottoTab>('thai');
    const [numbers, setNumbers] = useState('');
    const [lotto, setLotto] = useState<any>(null);
    const [sgLotto, setSgLotto] = useState<any>(null);
    const [results, setResults] = useState<any[]>([]);
    const [resultsPage, setResultsPage] = useState(1);
    const [winnersPage, setWinnersPage] = useState(1);

    const currentLotto = tab === 'thai' ? lotto : sgLotto;

    const handleCheck = () => {
        if (!currentLotto) return;

        const list = numbers
            .split('\n')
            .map((n) => n.trim())
            .filter((n) => n.length > 0);

        const result = list.map((num) => {
            const res = tab === 'thai' ? checkThaiNumber(num, currentLotto) : checkSgNumber(num, currentLotto);
            return { number: num, ...res };
        });

        setResults(result);
        setResultsPage(1);
        setWinnersPage(1);
    };

    const handleSelectDate = (id: string) => {
        fetch(`/api/lotto/lotto/${id}`)
            .then((res) => res.json())
            .then((data) => setLotto(data));
    };

    const handleSgSelectDate = (id: string) => {
        fetch(`/api/lotto/sg/lotto/${id}`)
            .then((res) => res.json())
            .then((data) => setSgLotto(data));
    };

    const totalWin = results.filter((r) => r.status !== 'LOSE').length;
    const totalReward = results.reduce((sum, r) => sum + (Number(r.reward) || 0), 0);

    const handleFileUpload = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (evt: any) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const numbers = jsonData
                .flat()
                .map((n: any) => String(n).trim())
                .filter((n: string) => n.length > 0);

            setNumbers(numbers.join('\n'));
        };

        reader.readAsArrayBuffer(file);
    };

    const totalWON = results.filter((r) => r.status !== 'LOSE');
    const winnersStart = (winnersPage - 1) * ITEMS_PER_PAGE;
    const winnersEnd = winnersStart + ITEMS_PER_PAGE;
    const paginatedWinners = totalWON.slice(winnersStart, winnersEnd);
    const winnersTotalPages = Math.ceil(totalWON.length / ITEMS_PER_PAGE);

    const resultsStart = (resultsPage - 1) * ITEMS_PER_PAGE;
    const resultsEnd = resultsStart + ITEMS_PER_PAGE;
    const paginatedResults = results.slice(resultsStart, resultsEnd);
    const resultsTotalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

    const translateName = (name: string) => {
        if (tab === 'thai') return translateLottoName(name) ?? '-';
        return name ?? '-';
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
            ]}
        >
            <Head title="Lottery Checker" />
            <div className="mx-4 mt-4">
                <div className="flex gap-1 mb-4 border-b">
                    <button
                        onClick={() => { setTab('thai'); setResults([]); }}
                        className={`px-4 py-2 text-sm font-medium transition ${
                            tab === 'thai'
                                ? 'border-b-2 border-primary text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Thai Lotto
                    </button>
                    <button
                        onClick={() => { setTab('singapore'); setResults([]); }}
                        className={`px-4 py-2 text-sm font-medium transition ${
                            tab === 'singapore'
                                ? 'border-b-2 border-primary text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Singapore Sweep
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        {tab === 'thai' ? (
                            <LotteryDatePicker onSelect={handleSelectDate} />
                        ) : (
                            <SgLotteryDatePicker onSelect={handleSgSelectDate} />
                        )}

                        <Card className="my-4">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        Paste Numbers
                                        <span className="text-muted-foreground text-sm">("Enter numbers, one per line")</span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-72">
                                                <h4 className="mb-2 font-semibold">Import Template</h4>
                                                <p className="text-muted-foreground mb-2 text-sm">
                                                    {tab === 'thai'
                                                        ? 'Enter 6-digit Thai lottery numbers'
                                                        : 'Enter 7-digit Singapore Sweep ticket numbers'}
                                                </p>
                                                <ul className="list-disc space-y-1 pl-5 text-sm">
                                                    <li>One number per row</li>
                                                    <li>Supported: .xlsx, .csv</li>
                                                </ul>
                                                <p className="text-muted-foreground mt-2 text-xs">Example:</p>
                                                <pre className="rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                                                    {tab === 'thai' ? `123456\n654321\n111222` : `3122414\n2288613\n2086056`}
                                                </pre>
                                            </PopoverContent>
                                        </Popover>
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Card className="my-2">
                                    <CardHeader>
                                        <CardTitle>Upload Excel</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <input type="file" accept=".xlsx,.csv" onChange={handleFileUpload} />
                                    </CardContent>
                                </Card>
                                <Textarea placeholder="Enter numbers (one per line)" value={numbers} onChange={(e) => setNumbers(e.target.value)} />
                                <Button onClick={() => handleCheck()} disabled={!currentLotto} className="mt-2 w-full">
                                    Check Numbers
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Win Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Number</TableHead>
                                            <TableHead>Prize</TableHead>
                                            <TableHead>Reward</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedWinners?.map((r, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{r.number}</TableCell>
                                                <TableCell>{translateName(r.prize)}</TableCell>
                                                <TableCell>{Number(r.reward).toLocaleString()}</TableCell>
                                                <TableCell>{r.status === 'WIN' ? 'BIG WIN' : r.status === 'RUNNING' ? 'WON' : ''}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {winnersTotalPages > 1 && (
                                    <Pagination className="mt-4">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setWinnersPage((p) => Math.max(1, p - 1));
                                                    }}
                                                />
                                            </PaginationItem>
                                            {Array.from({ length: winnersTotalPages }, (_, i) => i + 1).map((page) => (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={winnersPage === page}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setWinnersPage(page);
                                                        }}
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setWinnersPage((p) => Math.min(winnersTotalPages, p + 1));
                                                    }}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {results.length > 0 && (
                    <Card className="m-4">
                        <CardHeader>
                            <CardTitle>Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Card className="p-4">Total Checked: {results.length}</Card>
                                <Card className="p-4">Winners: {totalWin}</Card>
                                <Card className="p-4">Total Reward: {Number(totalReward).toLocaleString()} {tab === 'thai' ? 'THB' : 'SGD'}</Card>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Number</TableHead>
                                        <TableHead>Prize</TableHead>
                                        <TableHead>Reward</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedResults.map((r, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{r.number}</TableCell>
                                            <TableCell>{translateName(r.prize)}</TableCell>
                                            <TableCell>{Number(r.reward).toLocaleString()}</TableCell>
                                            <TableCell>{r.status === 'WIN' ? 'BIG WIN' : r.status === 'RUNNING' ? 'WON' : ''}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {resultsTotalPages > 1 && (
                                <Pagination className="mt-4">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setResultsPage((p) => Math.max(1, p - 1));
                                                }}
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: resultsTotalPages }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={resultsPage === page}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setResultsPage(page);
                                                    }}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setResultsPage((p) => Math.min(resultsTotalPages, p + 1));
                                                }}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
