import SocialLinks from "./social-links";

export default function ProfileCard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Hi, I'm Danny</h1>
      <p className="text-muted-foreground dark:text-muted-foreground text-lg mb-6">
        I'm an engineer by day, gamer, developer, writer, poet, and Stoic by
        night.
      </p>
      <SocialLinks spacing="normal" />
    </div>
  );
}
