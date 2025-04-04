import SocialLinks from './social-links';

export default function ProfileCard() {
	return (
		<div className="p-8">
			<h1 className="mb-4 text-3xl font-bold">Hi, I'm Danny</h1>
			<p className="text-muted-foreground dark:text-muted-foreground mb-6 text-lg">
				I'm an engineer by day, gamer, developer, writer, poet, and Stoic by night.
			</p>
			<SocialLinks spacing="normal" />
		</div>
	);
}
