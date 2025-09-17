import { useEffect, useState } from "react";

type Props = {
  className?: string;
  alt?: string;
};

// Primary logo hosted on Supabase Storage (provided by user)
const CANDIDATES = [
  "https://oxnkdfaiwbnbbmrjlkei.supabase.co/storage/v1/object/public/imagens/imagens%20hive%20of%20clicks/Sem%20nome%20(1196%20x%20675%20px)%20(3).png",
];

export function Logo({ className = "h-10 w-auto", alt = "Hive of Clicks" }: Props) {
  const [srcIndex, setSrcIndex] = useState(0);
  const [src, setSrc] = useState(CANDIDATES[0]);

  useEffect(() => {
    setSrc(CANDIDATES[0]);
    setSrcIndex(0);
  }, []);

  const handleError = () => {
    if (srcIndex < CANDIDATES.length - 1) {
      const next = srcIndex + 1;
      setSrcIndex(next);
      setSrc(CANDIDATES[next]);
    } else {
      // fallback local asset (ensure exists in public/)
      setSrc("/logo-hive-of-clicks.png");
    }
  };

  return <img src={src} onError={handleError} alt={alt} className={className} />;
}

export default Logo;
