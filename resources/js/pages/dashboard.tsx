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
    const totalReward = results.reduce((sum, r) => sum + (r.reward || 0), 0)
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
    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Supplier Checker" />

            <div className="p-6 space-y-6 max-w-6xl mx-auto">

                {/* DATE PICKER */}
                <LotteryDatePicker onSelect={handleSelectDate} />

                {/* INPUT */}
                <Card>
                    <CardHeader>
                        <CardTitle>Paste Numbers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Card>
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
                    </CardContent>
                </Card>

                {/* BUTTON */}
                <Button
                    onClick={() => handleCheck()}
                    disabled={!lotto}
                >
                    Check Numbers
                </Button>

            </div>
            {results.length > 0 && (
                <Card>
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
                                Total Reward: {totalReward} THB
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
                                        <TableCell>{r.prize ?? "-"}</TableCell>
                                        <TableCell>{r.reward}</TableCell>
                                        <TableCell>
                                            {r.status === "WIN"
                                                ? "🎉"
                                                : r.status === "RUNNING"
                                                    ? "✨"
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