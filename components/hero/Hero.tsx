type HeroProps = {
  children: React.ReactNode;
};

export default function Hero({ children }: HeroProps) {
  return (
    <section
      className="relative min-h-112 flex items-center"
      style={{
        backgroundImage: "url('/images/hl2dm-event-puzzle.jpg')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundColor: "#0C1010",
        boxShadow: "0 8px 6px #202020",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "url('/images/t.png')" }}
      >
        <div className="relative z-10 container mx-auto px-6 py-24">
          <div className="max-w-xl">{children}</div>
        </div>
      </div>
    </section>
  );
}
