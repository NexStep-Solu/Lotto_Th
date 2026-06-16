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

import { sgPrizeNames } from "@/lib/lottoTranslate"

export default function SgNumberChecker({ lotto }: any) {
    const [number, setNumber] = useState("")
    const [open, setOpen] = useState(false)
    const [result, setResult] = useState<any>(null)

    const checkNumber = () => {
        if (!lotto) return

        const prizes = lotto.response.prizes
        const twoDLuck = lotto.response.twoDLuck

        let found = null

        for (const prize of prizes) {
            if (prize.number.includes(number)) {
                found = prize
                break
            }
        }

        if (!found && twoDLuck.length > 0 && number.length >= 2) {
            const last2 = number.slice(-2)
            if (twoDLuck.includes(last2)) {
                found = {
                    id: "twoDDelight",
                    name: "2D Delight",
                    number: [last2],
                    reward: 6,
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
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Singapore Sweep Checker</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    <Input
                        placeholder="Enter 7 digit number"
                        maxLength={7}
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                    />

                    <Button className="w-full" onClick={checkNumber}>
                        Check Number
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="text-center">
                    {result ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-green-600 text-2xl">
                                    Congratulations!
                                </DialogTitle>
                            </DialogHeader>

                            <p className="text-lg font-semibold">
                                {sgPrizeNames[result.id] ?? result.name}
                            </p>

                            <p className="text-sm text-muted-foreground">
                                Reward: ${result.reward.toLocaleString()} SGD
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
                                    No Prize
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
