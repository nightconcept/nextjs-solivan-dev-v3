'use client';

import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { Leaf, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="bg-background border-border sticky top-0 z-30 mx-auto max-w-3xl border-b py-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Link href="/" className="flex items-center space-x-2">
						<Leaf className="h-6 w-6" />
						<span className="font-mono text-2xl font-bold">/home/danny</span>
					</Link>
					<div className="hidden sm:block">
						<ThemeToggle />
					</div>
				</div>

				<div className="hidden items-center space-x-6 sm:flex">
					<Link
						href="/blog"
						className="hover:text-primary hover:bg-muted dark:hover:bg-muted rounded-md px-3 py-1 transition-colors"
					>
						Blog
					</Link>
					<Link
						href="/about"
						className="hover:text-primary hover:bg-muted dark:hover:bg-muted rounded-md px-3 py-1 transition-colors"
					>
						About
					</Link>
				</div>

				<div className="sm:hidden">
					<button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
						{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			{mobileMenuOpen && (
				<div className="border-border bg-background mt-4 border-t py-4 sm:hidden">
					<div className="flex flex-col space-y-4">
						<Link
							href="/blog"
							className="hover:text-primary hover:bg-muted dark:hover:bg-muted rounded-md px-3 py-1 transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							Blog
						</Link>
						<Link
							href="/about"
							className="hover:text-primary hover:bg-muted dark:hover:bg-muted rounded-md px-3 py-1 transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							About
						</Link>
						<div className="pt-2">
							<ThemeToggle />
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
