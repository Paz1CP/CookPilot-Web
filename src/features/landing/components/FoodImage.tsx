import Image from "next/image";

type FoodImageProps = {
  src: string;
  name?: string;
  className?: string;
  eager?: boolean;
};

export default function FoodImage({ src, name, className = "", eager = false }: FoodImageProps) {
  return (
    <Image
      className={className}
      src={src}
      alt={name || ""}
      width={800}
      height={800}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
