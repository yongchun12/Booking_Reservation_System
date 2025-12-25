import * as React from "react"
import { Clock } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../components/ui/popover"
import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"

export function TimeSelect({ value, onChange, className }) {
    const [open, setOpen] = React.useState(false)

    // Generate time slots (every 30 mins)
    const timeSlots = []
    for (let i = 8; i < 23; i++) { // 8 AM to 10 PM
        const hour = i
        const hour12 = hour > 12 ? hour - 12 : hour
        const ampm = hour >= 12 ? 'PM' : 'AM'

        // :00
        const timeString1 = `${hour.toString().padStart(2, '0')}:00:00`
        const displayString1 = `${hour12}:00 ${ampm}`
        timeSlots.push({ value: timeString1, label: displayString1 })

        // :30
        const timeString2 = `${hour.toString().padStart(2, '0')}:30:00`
        const displayString2 = `${hour12}:30 ${ampm}`
        timeSlots.push({ value: timeString2, label: displayString2 })
    }

    const selectedLabel = timeSlots.find(t => t.value === value)?.label || "Select time"

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-start font-normal", !value && "text-muted-foreground", className)}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    {selectedLabel}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 h-[300px] overflow-y-auto">
                <div className="flex flex-col p-1">
                    {timeSlots.map((slot) => (
                        <Button
                            key={slot.value}
                            variant="ghost"
                            className={cn("justify-start font-normal", value === slot.value && "bg-accent")}
                            onClick={() => {
                                onChange(slot.value)
                                setOpen(false)
                            }}
                        >
                            {slot.label}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
