import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { sgPrizeNames } from "@/lib/lottoTranslate"
import { useState } from "react"

const CURRENCY = "SGD"

export default function SgLotteryResult({ data }: any) {
    if (!data?.response) return null
    const prizes = data.response.prizes || []
    const twoDLuck = data.response.twoDLuck || []

    const firstPrize = prizes.find((p: any) => p.id === "firstPrize")
    const secondPrize = prizes.find((p: any) => p.id === "secondPrize")
    const thirdPrize = prizes.find((p: any) => p.id === "thirdPrize")

    const otherPrizes = prizes.filter(
        (p: any) => !["firstPrize", "secondPrize", "thirdPrize"].includes(p.id)
    )

    const [expanded, setExpanded] = useState<Record<string, boolean>>({})

    return (
        <div className="mx-auto max-w-5xl space-y-6 px-4">
            <Card className="border-t-4 border-primary">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-base sm:text-lg tracking-tight">
                                Singapore Sweep Result
                            </CardTitle>
                            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                                {data.response.drawNo ? `Draw #${data.response.drawNo}` : "Official draw summary"}
                            </p>
                        </div>
                        <Badge
                            variant="secondary"
                            className="text-[11px] sm:text-xs px-2 py-1 whitespace-nowrap"
                        >
                            {data.response.date}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3">
                {firstPrize && (
                    <Card className="border-primary order-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                                <div className="w-1.5 h-5 bg-primary rounded-full" />
                                1st Prize
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center pt-0">
                            <p className="text-3xl sm:text-4xl font-bold text-primary mb-2 tracking-wide font-[var(--lottery-number-font,theme(fontFamily.mono))]">
                                {firstPrize.number[0]}
                            </p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground">
                                Reward {firstPrize.reward.toLocaleString()} {CURRENCY}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {secondPrize && (
                    <Card className="order-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                                <div className="w-1.5 h-5 bg-orange-500 rounded-full" />
                                2nd Prize
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center pt-0">
                            <p className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2 tracking-wide font-[var(--lottery-number-font,theme(fontFamily.mono))]">
                                {secondPrize.number[0]}
                            </p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground">
                                Reward {secondPrize.reward.toLocaleString()} {CURRENCY}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {thirdPrize && (
                    <Card className="order-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                                <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
                                3rd Prize
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center pt-0">
                            <p className="text-3xl sm:text-4xl font-bold text-blue-500 mb-2 tracking-wide font-[var(--lottery-number-font,theme(fontFamily.mono))]">
                                {thirdPrize.number[0]}
                            </p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground">
                                Reward {thirdPrize.reward.toLocaleString()} {CURRENCY}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {twoDLuck.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                            <div className="w-1.5 h-5 bg-purple-500 rounded-full" />
                            2D Delight
                        </CardTitle>
                        <p className="text-[11px] text-muted-foreground">
                            Match the last 2 digits of your ticket to win $6
                        </p>
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="flex flex-wrap gap-2">
                            {twoDLuck.map((num: string) => (
                                <Badge
                                    key={num}
                                    variant="secondary"
                                    className="text-base sm:text-lg px-3 py-1.5 font-[var(--lottery-number-font,theme(fontFamily.mono))]"
                                >
                                    {num}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Separator className="my-4 sm:my-6" />

            {otherPrizes.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base font-semibold">
                            Other Prizes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-1">
                        {otherPrizes.map((p: any) => {
                            const isExpanded = expanded[p.id]
                            const limit = 10
                            const numbersToShow = isExpanded ? p.number : p.number.slice(0, limit)

                            return (
                                <div key={p.id} className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-sm sm:text-base">
                                            {sgPrizeNames[p.id] ?? p.name}
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className="text-[11px] sm:text-xs px-2 py-1 whitespace-nowrap"
                                        >
                                            {p.reward.toLocaleString()} {CURRENCY}
                                        </Badge>
                                    </div>

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
            )}
        </div>
    )
}
