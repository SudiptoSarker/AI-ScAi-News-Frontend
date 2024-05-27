import LogoDark from "../../../../../public/images/logos/mti-logo-desktop.png";
import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/users/info-register" >
      <Image src={LogoDark} alt="logo"/>
    </Link>    
  );
};

export default Logo;
