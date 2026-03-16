import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { convertThaiDate, prizeTranslate, runningTranslate } from "@/lib/lottoTranslate"
export default function LotteryResult({ data }: any) {
    const prizes = data?.response.prizes
    const running = data?.response.runningNumbers

    const firstPrize = prizes?.find((p: any) => p.id === "prizeFirst")
    const nearFirst = prizes?.find((p: any) => p.id === "prizeFirstNear")

    return (
        <div className="mx-auto max-w-5xl space-y-6">

            {/* DATE */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Thai Lottery Result
                        <Badge> {convertThaiDate(data.response.date)}</Badge>
                    </CardTitle>
                </CardHeader>
            </Card>

            {/* FIRST PRIZE */}
            <Card className="border-green-500">
                <CardHeader>
                    <CardTitle>First Prize</CardTitle>
                </CardHeader>

                <CardContent className="text-center">
                    <p className="text-5xl font-bold text-green-500">
                        {firstPrize.number[0]}
                    </p>

                    <p className="text-sm text-muted-foreground mt-2">
                        Reward {firstPrize.reward} THB
                    </p>
                </CardContent>
            </Card>

            {/* NEAR FIRST */}
            <Card>
                <CardHeader>
                    <CardTitle>Near First Prize</CardTitle>
                </CardHeader>

                <CardContent className="flex gap-4 justify-center">
                    {nearFirst.number.map((n: string) => (
                        <Badge key={n} variant="secondary" className="text-lg px-4 py-2">
                            {n}
                        </Badge>
                    ))}
                </CardContent>
            </Card>

            {/* RUNNING NUMBERS */}
            <Card>
                <CardHeader>
                    <CardTitle>Running Numbers</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-3 gap-6 text-center">

                    {running.map((r: any) => (
                        <div key={r.id}>
                            <p className="text-sm text-muted-foreground mb-2">
                                {runningTranslate[r.name] ?? r.name}
                            </p>

                            <div className="flex justify-center gap-3">
                                {r.number.map((num: string) => (
                                    <Badge key={num} className="text-lg px-4 py-2">
                                        {num}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}

                </CardContent>
            </Card>

            <Separator />

            {/* OTHER PRIZES */}
            <Card>
                <CardHeader>
                    <CardTitle>Other Prizes</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">

                    {prizes
                        .filter((p: any) =>
                            !["prizeFirst", "prizeFirstNear"].includes(p.id)
                        )
                        .map((p: any) => (
                            <div key={p.id}>

                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">{prizeTranslate[p.name] ?? p.name}</p>

                                    <Badge variant="outline">
                                        {p.reward} THB
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {p.number.slice(0, 10).map((n: string) => (
                                        <Badge key={n} variant="secondary">
                                            {n}
                                        </Badge>
                                    ))}
                                </div>

                            </div>
                        ))}

                </CardContent>
            </Card>

        </div>
    )
}