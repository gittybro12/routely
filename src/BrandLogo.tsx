type BrandLogoProps = {
  size?: number;
};

export default function BrandLogo({ size = 22 }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="11" cy="8" r="4.5" fill="white" fillOpacity="0.95" />
      <circle cx="11" cy="8" r="2.2" fill="url(#routely-brand-gradient)" />
      <path d="M11 12.5 L7 20 Q11 17 15 20 Z" fill="white" fillOpacity="0.9" />
      <defs>
        <linearGradient id="routely-brand-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
    </svg>
  );
}
