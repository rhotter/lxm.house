"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import {
  faChevronCircleUp,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`${isActive ? "text-gray-900" : "text-gray-500"}`}
    >
      {children}
    </Link>
  );
};

const SocialIcon = ({
  icon,
  href,
}: {
  icon: FontAwesomeIconProps["icon"];
  href: string;
}) => (
  <Link href={href} target="_blank">
    <FontAwesomeIcon
      icon={icon}
      className="w-4 h-4 text-gray-300 hover:text-gray-400"
    />
  </Link>
);

export const NavBar = () => {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div className="font-bold text-lg">
        <Link href="/">lxm.house</Link>
      </div>
      {/* <nav>
        <div className="flex gap-4">
          <NavLink href="/">About</NavLink>
          <NavLink href="/posts">Posts</NavLink>
        </div>
      </nav> */}
    </div>
  );
};

export const Socials = () => (
  <div className="flex gap-2 mt-8">
    <SocialIcon href="https://twitter.com/raffi_hotter" icon={faTwitter} />
    <SocialIcon href="mailto:raphael.hotter@gmail.com" icon={faEnvelope} />
    <SocialIcon href="https://github.com/rhotter" icon={faGithub} />
    <SocialIcon
      href="https://curius.app/raffi-hotter"
      icon={faChevronCircleUp}
    />
  </div>
);
