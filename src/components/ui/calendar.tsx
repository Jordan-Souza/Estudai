"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rdp-custom p-3 bg-zinc-950 rounded-xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center h-9",
        caption_label: "text-sm font-medium text-zinc-100",
        nav: "flex items-center gap-1",
        button_previous: "absolute left-1 h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors",
        button_next: "absolute right-1 h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-zinc-500 rounded-md w-9 font-normal text-[0.8rem] text-center flex-1",
        week: "flex w-full mt-2",
        day: "flex-1 text-center text-sm p-0 relative",
        day_button: "h-9 w-9 mx-auto p-0 font-normal flex items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-200 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
        selected: "[&>button]:bg-indigo-600 [&>button]:text-white [&>button]:hover:bg-indigo-500",
        today: "[&>button]:bg-zinc-800 [&>button]:text-zinc-100 [&>button]:font-semibold",
        outside: "[&>button]:opacity-30",
        disabled: "[&>button]:opacity-30 [&>button]:pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
