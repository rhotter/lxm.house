import Image from "next/image";

export const ImageGrid = ({
  images,
}: {
  images: { src: any; alt: string }[];
}) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 ">
    {images.map(({ src, alt }) => (
      <div key={alt}>
        <Image src={src} alt={alt} className="w-full h-48 object-cover m-0" />
      </div>
    ))}
  </div>
);
