import Image from "next/image";

type ButtonProps = {
  href: string;
  icon?: { src: string; width: number; height: number; alt: string };
  iconNode?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
  hoverBgColor?: string;
  upperCase?: boolean;
  variant?: "default" | "bordered";
};

export default function Button({
  href,
  icon,
  iconNode,
  children,
  className,
  bgColor,
  hoverBgColor,
  upperCase = false,
  variant = "default",
}: ButtonProps) {
  const baseClass =
    variant === "bordered"
      ? `inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-md bg-[#363636] hover:bg-[#2f2f2f] border border-[#4d4d4d] text-white text-xs ${upperCase ? "uppercase tracking-wide" : ""} font-medium transition-colors`
      : `inline-flex items-center gap-2.5 px-4 py-2.25 rounded-full ${bgColor ?? "bg-[#363636]"} ${hoverBgColor ?? "hover:bg-[#2f2f2f]"} text-white text-xs ${upperCase ? "uppercase" : ""} tracking-wide transition-colors`;

  return (
    <a href={href} className={`${baseClass}${className ? ` ${className}` : ""}`}>
      {iconNode}
      {icon && (
        <Image src={icon.src} width={icon.width} height={icon.height} alt={icon.alt} />
      )}
      {children}
    </a>
  );
}
