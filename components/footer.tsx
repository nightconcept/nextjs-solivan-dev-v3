import SocialLinks from "./social-links";

export default function Footer() {
  return (
    <footer className="py-6 mt-12">
      <div className="max-w-3xl mx-auto px-4 border-t border-border pt-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; Danny 2007-2025
          </p>
          <SocialLinks spacing="compact" />
        </div>
      </div>
    </footer>
  );
}
