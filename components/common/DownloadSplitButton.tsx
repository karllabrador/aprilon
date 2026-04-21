type DownloadSplitButtonProps = {
  href: string;
  downloadSize: string;
};

export default function DownloadSplitButton({
  href,
  downloadSize,
}: DownloadSplitButtonProps) {
  return (
    <a
      href={href}
      className="inline-flex overflow-hidden rounded-md bg-[#276cda] hover:bg-[#1e4fa8] border border-[#1e5ab8] text-white text-xs font-medium uppercase tracking-wide transition-colors"
    >
      <span className="inline-flex items-center px-4.5 py-2.5 border-r border-[#1e5ab8]">
        Download
      </span>
      <span className="inline-flex items-center px-3 py-2.5 normal-case tracking-normal text-white/75">
        {downloadSize}
      </span>
    </a>
  );
}
