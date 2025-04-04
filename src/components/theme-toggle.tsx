'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
		// Set initial theme based on system preference or saved preference
		const savedTheme = localStorage.getItem('theme') || 'system';
		if (savedTheme) {
			setTheme(savedTheme);
		}
	}, [setTheme]);

	if (!mounted) {
		return <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0" />;
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => {
				const newTheme = theme === 'dark' ? 'light' : 'dark';
				setTheme(newTheme);
				localStorage.setItem('theme', newTheme);
			}}
			className="h-9 w-9"
		>
			{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
