import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { useState } from 'react'
import LotteryDatePicker from '@/components/LotteryDatePicker'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as XLSX from "xlsx"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { translateLottoName } from '@/lib/lottoTranslate'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Info } from 'lucide-react'
function checkNumber(num: string, lotto: any) {
    const prizes = lotto.response.prizes
    const running = lotto.response.runningNumbers

    // exact match
    for (const p of prizes) {
        if (p.number.includes(num)) {
            return {
                prize: p.name,
                reward: p.reward,
                status: "WIN",
            }
        }
    }

    // running numbers (last digits)
    for (const r of running) {
        for (const rn of r.number) {
            if (num.endsWith(rn)) {
                return {
                    prize: r.name,
                    reward: r.reward,
                    status: "RUNNING",
                }
            }
        }
    }

    return {
        prize: null,
        reward: 0,
        status: "LOSE",
    }
}
export default function Dashboard() {
    const [numbers, setNumbers] = useState("")
    const [lotto, setLotto] = useState<any>(null)
    const [results, setResults] = useState<any[]>([])
    const handleCheck = () => {
        if (!lotto) return

        const list = numbers
            .split("\n")
            .map(n => n.trim())
            .filter(n => n.length > 0)

        const result = list.map(num => {
            const res = checkNumber(num, lotto)

            return {
                number: num,
                ...res,
            }
        })

        setResults(result)
    }
    // fetch selected lotto
    const handleSelectDate = (id: string) => {
        fetch(`https://lotto.api.rayriffy.com/lotto/${id}`)
            .then(res => res.json())
            .then(data => setLotto(data))
    }
    const totalWin = results.filter(r => r.status !== "LOSE").length
    const totalReward = results.reduce((sum, r) => sum + (Number(r.reward) || 0), 0)
    const handleFileUpload = (e: any) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()

        reader.onload = (evt: any) => {
            const data = new Uint8Array(evt.target.result)
            const workbook = XLSX.read(data, { type: "array" })

            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]

            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
            })

            // flatten + clean
            const numbers = jsonData
                .flat()
                .map((n: any) => String(n).trim())
                .filter((n: string) => n.length > 0)

            setNumbers(numbers.join("\n"))
        }

        reader.readAsArrayBuffer(file)
    }
    const totalWON = results.filter(r => r.status !== "LOSE");
    return (
        <AppLayout breadcrumbs={[
            {
                title: 'Dashboard',
                href: '/dashboard',
            },
        ]}>
            <Head title="Supplier Checker" />
            <div className='grid grid-cols-2 gap-6 mt-4 mx-4'>
                <div className="">

                    {/* DATE PICKER */}
                    <LotteryDatePicker onSelect={handleSelectDate} />

                    {/* INPUT */}
                    <Card className='my-4'>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    Paste Numbers
                                    <span className="text-sm text-muted-foreground">("Enter numbers, one per line")</span>

                                    {/* Info Popover */}
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon">
                                                <Info className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-72">
                                            <h4 className="font-semibold mb-2">Excel Import Template</h4>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Please use the following format when importing numbers:
                                            </p>
                                            <ul className="text-sm list-disc pl-5 space-y-1">
                                                <li>One number per row</li>
                                                <li>Each number must be 6 digits (pad with leading 0 if needed)</li>
                                                <li>Do not include headers or extra columns</li>
                                                <li>Supported file types: .xlsx, .csv</li>
                                            </ul>

                                            <p className="text-xs text-muted-foreground mt-2">Example:</p>
                                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                                {`123456
654321
111222`}
                                            </pre>
                                        </PopoverContent>
                                    </Popover>
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Card className='my-2'>
                                <CardHeader>
                                    <CardTitle>Upload Excel</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <input
                                        type="file"
                                        accept=".xlsx,.csv"
                                        onChange={handleFileUpload}
                                    />
                                </CardContent>
                            </Card>
                            <Textarea
                                placeholder="Enter numbers (one per line)"
                                value={numbers}
                                onChange={(e) => setNumbers(e.target.value)}
                            />
                            <Button
                                onClick={() => handleCheck()}
                                disabled={!lotto}
                                className='mt-2 w-full'
                            >
                                Check Numbers
                            </Button>
                        </CardContent>
                    </Card>

                    {/* BUTTON */}


                </div>
                <div>
                    <Card className=''>
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
                                    {totalWON?.map((r, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{r.number}</TableCell>
                                            <TableCell>{translateLottoName(r.prize) ?? "-"}</TableCell>
                                            <TableCell>{Number(r.reward).toLocaleString()}</TableCell>
                                            <TableCell>
                                                {r.status === "WIN"
                                                    ? "BIG WIN"
                                                    : r.status === "RUNNING"
                                                        ? "WON"
                                                        : "❌"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            </div>

            {results.length > 0 && (
                <Card className='m-4'>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="flex gap-4">
                            <Card className="p-4">
                                Total Checked: {results.length}
                            </Card>

                            <Card className="p-4">
                                Winners: {totalWin}
                            </Card>

                            <Card className="p-4">
                                Total Reward: {Number(totalReward).toLocaleString()} THB
                            </Card>
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
                                {results.map((r, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{r.number}</TableCell>
                                        <TableCell>{translateLottoName(r.prize) ?? "-"}</TableCell>
                                        <TableCell>{Number(r.reward).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {r.status === "WIN"
                                                ? "BIG WIN"
                                                : r.status === "RUNNING"
                                                    ? "WON"
                                                    : "❌"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </AppLayout>
    )
}