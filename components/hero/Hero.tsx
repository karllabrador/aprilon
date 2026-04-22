import Image from "next/image";

type HeroProps = {
  children: React.ReactNode;
  backgroundImage?: string;
  darkOverlay?: boolean;
  blur?: boolean;
  wide?: boolean;
  priority?: boolean;
  nativeBackground?: boolean;
};

export default function Hero({
  children,
  backgroundImage = "/images/hl2dm-event-puzzle.jpg",
  darkOverlay = false,
  blur = false,
  wide = false,
  priority = false,
  nativeBackground = false,
}: HeroProps) {
  return (
    <section
      className="relative min-h-112 flex items-center"
      style={{
        backgroundColor: "#0C1010",
        boxShadow: "0 8px 6px #202020, 0 -8px 6px #202020",
        ...(nativeBackground && {
          backgroundImage: `url('${backgroundImage}')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }),
      }}
    >
      {!nativeBackground && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority={priority}
          className="object-cover object-center"
        />
      )}
      {(darkOverlay || blur) && (
        <div
          className={[
            "absolute inset-0",
            darkOverlay ? "bg-gray-900/30" : "",
            blur ? "backdrop-blur-[1px]" : "",
          ].join(" ")}
        />
      )}
      <div className="relative z-10 container max-w-336 mx-auto max-[1344px]:px-6 py-24">
        {wide ? children : <div className="max-w-xl">{children}</div>}
      </div>
    </section>
  );
}
