import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { convertThaiDate, prizeTranslate, runningTranslate } from "@/lib/lottoTranslate"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
export default function LotteryResult({ data }: any) {
    const prizes = data?.response.prizes
    const running = data?.response.runningNumbers

    const firstPrize = prizes?.find((p: any) => p.id === "prizeFirst")
    const nearFirst = prizes?.find((p: any) => p.id === "prizeFirstNear")
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})
    return (
        <div className="mx-auto max-w-5xl space-y-6 px-4">
            {/* DATE HEADER */}
            <Card className="border-t-4 border-primary">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-base sm:text-lg tracking-tight">
                                Thai Lottery Result
                            </CardTitle>
                            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                                Official draw summary
                            </p>
                        </div>
                        <Badge
                            variant="secondary"
                            className="text-[11px] sm:text-xs px-2 py-1 whitespace-nowrap"
                        >
                            {convertThaiDate(data.response.date)}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                {/* FIRST PRIZE */}
                <Card className="border-primary order-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                            <div className="w-1.5 h-5 bg-primary rounded-full" />
                            First Prize
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                        <p className="text-3xl sm:text-4xl font-bold text-primary mb-2 tracking-wide font-[var(--lottery-number-font,theme(fontFamily.mono))]">
                            {firstPrize.number[0]}
                        </p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground">
                            Reward {firstPrize.reward} THB
                        </p>
                    </CardContent>
                </Card>

                {/* NEAR FIRST */}
                <Card className="order-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                            <div className="w-1.5 h-5 bg-orange-500 rounded-full" />
                            Near First Prize
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2 justify-start sm:justify-center">
                            {nearFirst.number.map((n: string) => (
                                <Badge
                                    key={n}
                                    variant="outline"
                                    className="text-base sm:text-lg px-3 py-1.5 font-[var(--lottery-number-font,theme(fontFamily.mono))]"
                                >
                                    {n}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* RUNNING NUMBERS */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
                        Running Numbers
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-1 grid gap-5 sm:grid-cols-3">
                    {running.map((r: any) => (
                        <div key={r.id} className="space-y-2 text-center sm:text-left">
                            <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {runningTranslate[r.name] ?? r.name}
                            </p>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                {r.number.map((num: string) => (
                                    <Badge
                                        key={num}
                                        variant="secondary"
                                        className="text-base sm:text-lg px-3 py-1.5 font-[var(--lottery-number-font,theme(fontFamily.mono))]"
                                    >
                                        {num}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Separator className="my-4 sm:my-6" />

            {/* OTHER PRIZES */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm sm:text-base font-semibold">
                        Other Prizes
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-1">
                    {prizes
                        .filter((p: any) => !["prizeFirst", "prizeFirstNear"].includes(p.id))
                        .map((p: any) => {
                            const isExpanded = expanded[p.id]
                            const limit = 10 // show 9 on mobile; grid will expand on larger screens
                            const numbersToShow = isExpanded ? p.number : p.number.slice(0, limit)

                            return (
                                <div key={p.id} className="space-y-3">
                                    {/* HEADER */}
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-sm sm:text-base">
                                            {prizeTranslate[p.name] ?? p.name}
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className="text-[11px] sm:text-xs px-2 py-1 whitespace-nowrap"
                                        >
                                            {p.reward} THB
                                        </Badge>
                                    </div>

                                    {/* NUMBERS GRID */}
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                                        {numbersToShow.map((n: string) => (
                                            <Badge
                                                key={n}
                                                variant="secondary"
                                                className="justify-center py-2 text-sm sm:text-base font-[var(--lottery-number-font,theme(fontFamily.mono))] h-10 sm:h-11 flex items-center"
                                            >
                                                {n}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* TOGGLE BUTTON */}
                                    {p.number.length > limit && (
                                        <button
                                            onClick={() =>
                                                setExpanded(prev => ({
                                                    ...prev,
                                                    [p.id]: !prev[p.id],
                                                }))
                                            }
                                            className="text-[11px] sm:text-xs font-medium text-primary hover:text-primary/80 hover:underline flex items-center gap-1"
                                        >
                                            {isExpanded
                                                ? "Show less"
                                                : `Show all (${p.number.length})`}
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                </CardContent>
            </Card>
        </div>


    )
}