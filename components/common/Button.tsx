import Image from "next/image";

type ButtonProps = {
  href: string;
  icon?: { src: string; width: number; height: number; alt: string };
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
  hoverBgColor?: string;
  upperCase?: boolean;
};

export default function Button({
  href,
  icon,
  children,
  className,
  bgColor,
  hoverBgColor,
  upperCase = false,
}: ButtonProps) {
  const bgClass = bgColor ?? "bg-[#363636]";
  const hoverClass = hoverBgColor ?? "hover:bg-[#2f2f2f]";

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2.5 px-4 py-2.25 rounded-full ${bgClass} ${hoverClass} text-white text-xs ${upperCase ? "uppercase" : ""} tracking-wide transition-colors${className ? ` ${className}` : ""}`}
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
