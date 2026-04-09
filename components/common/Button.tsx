import Image from "next/image";

type ButtonProps = {
  href: string;
  icon?: { src: string; width: number; height: number; alt: string };
  children: React.ReactNode;
  className?: string;
  bg?: string;
  hoverBg?: string;
};

export default function Button({
  href,
  icon,
  children,
  className,
  bg,
  hoverBg,
}: ButtonProps) {
  const bgClass = bg ?? "bg-[#363636]";
  const hoverClass = hoverBg ?? "hover:bg-[#2f2f2f]";

  //const bgClass = bg ?? "#2f2f2f"; // #2f2f2f
  //const hoverClass = hoverBg ?? "hover:#363636"; // #363636

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2.5 px-4 py-[9px] rounded-full ${bgClass} ${hoverClass} text-white text-xs uppercase tracking-wide transition-colors${className ? ` ${className}` : ""}`}
    >
      {icon && (
        <Image
          src={icon.src}
          width={icon.width}
          height={icon.height}
          alt={icon.alt}
        />
      )}
      {children}
    </a>
  );
}
