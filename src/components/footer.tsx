import SocialLinks from "./social-links";

export default function Footer() {
  return (
    <footer className="mt-12 py-6">
      <div className="border-border mx-auto max-w-3xl border-t px-4 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            &copy; Danny 2007-2025
          </p>
          <SocialLinks spacing="compact" />
        </div>
      </div>
    </footer>
  );
}
