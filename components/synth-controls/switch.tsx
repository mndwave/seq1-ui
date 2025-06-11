"use client"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface SwitchProps {
  name: string
  options: string[]
  value: string | number
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
  readOnly?: boolean
  onChange?: (value: string | number) => void
}

export default function Switch({
  name,
  options,
  value,
  orientation = "horizontal",
  size = "md",
  readOnly = true,
  onChange,
}: SwitchProps) {
  // Handle option click
  const handleOptionClick = (option: string | number) => {
    if (readOnly) return
    if (onChange) {
      onChange(option)
    }
  }

  // Determine size classes
  const sizeClasses = {
    sm: "h-3",
    md: "h-4",
    lg: "h-5",
  }

  // Determine container classes based on orientation
  const containerClasses = orientation === "horizontal" ? "flex flex-row space-x-0" : "flex flex-col space-y-0"

  // Find the index of the current value
  const currentIndex = options.indexOf(value as string)

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Simple rectangular blocks like in the Minimoog patch sheet */}
            <div className={`${containerClasses} bg-transparent`}>
              {options.length === 2 ? (
                // For binary switches (On/Off), show a single block that's either filled or empty
                <div className="w-6 h-3 flex items-center justify-center">
                  <div
                    className={`w-5 h-2 ${value === options[0] ? "bg-white" : "bg-transparent border border-white"}`}
                  ></div>
                </div>
              ) : (
                // For multi-position switches, show blocks with one highlighted
                <div className="flex space-x-1">
                  {options.map((option, index) => (
                    <div
                      key={option}
                      className={`w-2 ${sizeClasses[size]} ${index === currentIndex ? "bg-white" : "bg-transparent border border-white"}`}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{`${name}: ${value}`}</p>
          </TooltipContent>
        </Tooltip>

        {/* No parameter name displayed in the patch sheet style */}
      </div>
    </TooltipProvider>
  )
}
