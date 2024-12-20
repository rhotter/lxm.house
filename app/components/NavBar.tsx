import Link from "next/link";
import Image from "next/image";
import lxmLogo from "@/app/public/lxm-logo.avif";

export const NavBar = () => {
  return (
    <div className="flex justify-between items-center border-b border-gray-200 mb-8">
      <Link
        href="/"
        className="flex items-center gap-2 no-underline hover:underline"
      >
        <Image src={lxmLogo} alt="Light and Matter" className="w-8 mr-2" />
        <div className="font-bold text-lg">Light and matter</div>
      </Link>
    </div>
  );
};
