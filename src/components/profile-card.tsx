import SocialLinks from "./social-links";

export default function ProfileCard() {
  return (
    <div className="p-8">
      <h1 className="mb-4 text-3xl font-bold">Hi, I&apos;m Danny</h1>
      <p className="text-muted-foreground dark:text-muted-foreground mb-6 text-lg">
        I&rsquo;m an engineer by day, gamer, developer, writer, poet, and Stoic
        by night. I like thinking and growing my thoughts continuosly. This site
        serves as my place where I 📚{" "}
        <a href="https://www.swyx.io/learn-in-public">learn in public</a>{" "}
        and grow my 💻🌱{" "}
        <a href="https://maggieappleton.com/garden-history">digital garden</a>,
        but more accurately a simple{" "}
        <a href="https://www.ryrob.com/history-of-blogging/">blog</a>.
      </p>
      <SocialLinks spacing="normal" />
    </div>
  );
}
