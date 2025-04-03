"use client"

import { useState, useEffect } from "react"
import { List, ChevronRight } from "lucide-react"
import Link from "next/link"

interface TOCItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  items: TOCItem[]
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasSpace, setHasSpace] = useState(false) // Default to false, let useEffect confirm space

  // Check if there's enough space to show the TOC
  useEffect(() => {
    const checkSpace = () => {
      const windowWidth = window.innerWidth
      // Hide TOC on smaller screens to prevent overlap with content
      setHasSpace(windowWidth > 1024)
    }

    checkSpace()
    window.addEventListener("resize", checkSpace)
    return () => window.removeEventListener("resize", checkSpace)
  }, [])

  if (items.length === 0 || !hasSpace) return null

  return (
    <div className="fixed right-4 bottom-16 z-10">
      {/* Removed large hover activation area */}

      {/* Button wrapper - keep hover and add click to toggle */}
      {/* Removed onMouseEnter and onClick from wrapper */}
      <div className="relative">
        <button
          className={`bg-surface dark:bg-surface-dark p-3 rounded-full shadow-md hover:shadow-lg transition-shadow ${isOpen ? "opacity-100" : "opacity-70"}`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent click from bubbling to overlay
            setIsOpen(!isOpen);
          }}
          aria-label="Table of contents"
        >
          <List className="h-5 w-5 text-on-surface dark:text-on-surface-dark" />
        </button>

        {isOpen && (
          <>
            {/* Overlay to handle closing ONLY on click outside */}
            <div
              className="fixed inset-0 z-10"
              // Removed onMouseLeave
              onClick={() => setIsOpen(false)} // Click anywhere outside closes
            ></div>

            {/* Actual TOC content - stop propagation on click */}
            <div
              className="absolute right-14 bottom-0 bg-surface dark:bg-surface-dark rounded-lg shadow-lg p-4 min-w-[200px] max-w-[250px] z-20"
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
            >
              <h4 className="font-medium text-sm mb-2 text-on-surface-variant dark:text-on-surface-variant-dark">
                TABLE OF CONTENTS
              </h4>
              <nav>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.id} className={`text-sm ${item.level > 2 ? "ml-3" : ""}`}>
                      <Link
                        href={`#${item.id}`}
                        className="flex items-center text-on-surface dark:text-on-surface-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <ChevronRight className="h-3 w-3 mr-1 shrink-0" />
                        <span className="line-clamp-1">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
