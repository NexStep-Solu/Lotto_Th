"use client"

import { useEffect, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command"

import { convertThaiDate } from "@/lib/lottoTranslate"

export default function LotteryDatePicker({ onSelect }: any) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [dates, setDates] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const fetchDates = async () => {
        setLoading(true)
        const res = await fetch("/api/lotto/list")
        const data = await res.json()
        setDates(data.response)
        setLoading(false)
    }

    useEffect(() => {
        fetchDates()
    }, [])

    useEffect(() => {
        if (dates.length > 0 && !value) {
            setValue(dates[0].id)
            onSelect(dates[0].id)
        }
    }, [dates])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                >
                    {value
                        ? convertThaiDate(
                            dates.find((d) => d.id === value)?.date
                        )
                        : "Select lottery date"}

                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandGroup className="max-h-64 overflow-y-auto">

                        {dates.map((d) => (
                            <CommandItem
                                key={d.id}
                                value={d.id}
                                onSelect={() => {
                                    setValue(d.id)
                                    setOpen(false)
                                    onSelect(d.id)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === d.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                    )}
                                />

                                {convertThaiDate(d.date)}
                            </CommandItem>
                        ))}

                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}