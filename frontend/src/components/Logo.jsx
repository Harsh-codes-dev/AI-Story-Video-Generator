import Image from "next/image";
import logoImage from "../LOGO.png";

export default function Logo() {
  return (
    <Image
      src={logoImage}
      alt="AI Video Generator"
      priority
      className="h-11 w-auto select-none sm:h-12"
    />
  );
}
