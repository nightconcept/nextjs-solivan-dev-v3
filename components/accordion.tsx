"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface AccordionItemProps {
  title: string
  children: React.ReactNode
}

export function AccordionItem({ title, children }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        className="flex w-full justify-between items-center py-4 px-2 text-left font-medium transition-colors hover:bg-muted/50"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}>
        <div className="p-4 pt-2 text-muted-foreground">{children}</div>
      </div>
    </div>
  )
}

interface AccordionProps {
  children: React.ReactNode
}

export function Accordion({ children }: AccordionProps) {
  return <div className="rounded-md border border-border">{children}</div>
}

