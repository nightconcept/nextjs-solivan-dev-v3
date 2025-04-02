import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbProps {
  items: {
    label: string
    href: string
  }[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />}
            <Link
              href={item.href}
              className={`text-sm font-medium hover:text-primary hover:underline ${
                index === items.length - 1 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}

