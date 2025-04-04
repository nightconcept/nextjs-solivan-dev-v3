'use client';

import { useState, useEffect } from 'react';
import { List, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface TOCItem {
	id: string;
	title: string;
	level: number;
}

interface TableOfContentsProps {
	items: TOCItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hasSpace, setHasSpace] = useState(false); // Default to false, let useEffect confirm space

	// Check if there's enough space to show the TOC
	useEffect(() => {
		const checkSpace = () => {
			const windowWidth = globalThis.innerWidth;
			// Hide TOC on smaller screens to prevent overlap with content
			setHasSpace(windowWidth > 1024);
		};

		checkSpace();
		globalThis.addEventListener('resize', checkSpace);
		return () => globalThis.removeEventListener('resize', checkSpace);
	}, []);

	if (items.length === 0 || !hasSpace) return null;

	return (
		<div className="fixed right-4 bottom-16 z-10">
			{/* Removed large hover activation area */}

			{/* Button wrapper - keep hover and add click to toggle */}
			{/* Removed onMouseEnter and onClick from wrapper */}
			<div className="relative">
				<button
					type="button"
					className={`bg-surface dark:bg-surface-dark rounded-full p-3 shadow-md transition-shadow hover:shadow-lg ${isOpen ? 'opacity-100' : 'opacity-70'}`}
					onClick={(e) => {
						e.stopPropagation(); // Prevent click from bubbling to overlay
						setIsOpen(!isOpen);
					}}
					aria-label="Table of contents"
				>
					<List className="text-on-surface dark:text-on-surface-dark h-5 w-5" />
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
							className="bg-surface dark:bg-surface-dark absolute right-14 bottom-0 z-20 max-w-[250px] min-w-[200px] rounded-lg p-4 shadow-lg"
							onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
						>
							<h4 className="text-on-surface-variant dark:text-on-surface-variant-dark mb-2 text-sm font-medium">
								TABLE OF CONTENTS
							</h4>
							<nav>
								<ul className="space-y-2">
									{items.map((item) => (
										<li key={item.id} className={`text-sm ${item.level > 2 ? 'ml-3' : ''}`}>
											<Link
												href={`#${item.id}`}
												className="text-on-surface dark:text-on-surface-dark hover:text-primary dark:hover:text-primary-dark flex items-center transition-colors"
												onClick={() => setIsOpen(false)}
											>
												<ChevronRight className="mr-1 h-3 w-3 shrink-0" />
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
	);
}
