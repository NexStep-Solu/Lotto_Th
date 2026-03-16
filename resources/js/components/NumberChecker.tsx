import { useState } from "react"
import confetti from "canvas-confetti"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { translateLottoName, translatePrize, translateRunning } from "@/lib/lottoTranslate"

export default function NumberChecker({ lotto }: any) {

    const [number, setNumber] = useState("")
    const [open, setOpen] = useState(false)
    const [result, setResult] = useState<any>(null)
    console.log(result);

    const checkNumber = () => {

        if (!lotto) return

        const prizes = lotto.response.prizes
        const running = lotto.response.runningNumbers

        let found = null

        // main prizes
        for (const prize of prizes) {
            if (prize.number.includes(number)) {
                found = prize
                break
            }
        }

        // running numbers
        if (!found) {

            const last2 = number.slice(-2)
            const last3 = number.slice(-3)
            const first3 = number.slice(0, 3)

            for (const run of running) {

                if (run.id === "runningNumberBackTwo" && run.number.includes(last2)) {
                    found = run
                }

                if (run.id === "runningNumberBackThree" && run.number.includes(last3)) {
                    found = run
                }

                if (run.id === "runningNumberFrontThree" && run.number.includes(first3)) {
                    found = run
                }

            }

        }

        setResult(found)
        setOpen(true)

        if (found) {
            confetti({
                particleCount: 180,
                spread: 100,
            })
        }

    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Lottery Checker</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">

                    <Input
                        placeholder="Enter 6 digit number"
                        maxLength={6}
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                    />

                    <Button className="w-full" onClick={checkNumber}>
                        Check Number
                    </Button>

                </CardContent>
            </Card>

            {/* RESULT DIALOG */}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="text-center">

                    {result ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-green-600 text-2xl">
                                    🎉 Congratulations!
                                </DialogTitle>
                            </DialogHeader>

                            <p className="text-lg font-semibold">
                                {translateLottoName(result.name)}
                            </p>

                            <p className="text-sm text-muted-foreground">
                                Reward: {result.reward} THB
                            </p>

                            <Button
                                className="mt-4"
                                onClick={() => setOpen(false)}
                            >
                                Awesome
                            </Button>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl">
                                    😢 No Prize
                                </DialogTitle>
                            </DialogHeader>

                            <p className="text-muted-foreground">
                                Better luck next time
                            </p>

                            <Button
                                className="mt-4"
                                onClick={() => {
                                    setNumber("")
                                    setOpen(false)
                                }}
                            >
                                Try Again
                            </Button>
                        </>
                    )}

                </DialogContent>
            </Dialog>
        </>
    )
}