import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import React from "react"

interface SectionIntroProps {
  title: React.ReactNode
  description?: React.ReactNode
  buttonText?: string
  onButtonClick?: () => void

  className?: string
  titleClassName?: string
  descriptionClassName?: string
  buttonClassName?: string
}

export default function SectionIntro({
  title,
  description,
  buttonText,
  onButtonClick,
  className,
  titleClassName,
  descriptionClassName,
  buttonClassName,
}: SectionIntroProps) {
  return (
    <div className={cn(" text-center lg:text-left", className)}>
      
       <h2 className={cn("text-6xl md:text-7xl font-display uppercase text-center tracking-tight",
          titleClassName
        )}>
            {title}
          </h2>
          <p className={cn("text-lg md:text-xl text-center text-neutral-400 max-w-2xl mx-auto", descriptionClassName)}>
          {description}
          </p>
      {buttonText && (
        <div className="flex justify-center mt-8 lg:justify-start">
          <Button
            variant="default"
            className={cn("rounded-xl capitalize px-8 py-4", buttonClassName)}
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  )
}
