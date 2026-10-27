export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight text-balance">Know what an upgrade costs before you run it.</h1>
      <p className="text-lg text-muted-foreground text-pretty">
        Paste a package.json to see which dependencies are behind, which bumps are major, and which packages have
        advisories. Then turn it into a plan you can share.
      </p>
    </main>
  );
}
