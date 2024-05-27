import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar, Collapse, Nav, NavItem, NavbarBrand, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Dropdown, Button, } from "reactstrap";
import LogoWhite from "../../../../public/images/logos/mti-logo.png";
import Logo from "../../../../public/images/logos/mti-logo-desktop.png";
import { usePathname } from "next/navigation";
import _layout from '../styles/layout/layout.module.scss';
import _container from '../../styles/layout/_container.module.scss';
import { i18n } from "next-i18next";
import { useRouter } from 'next/router';
import { TiWorld } from "react-icons/ti";


type LogoForLoginPageType = {
  location: any;
}

function LogoForLoginPage({ location }: LogoForLoginPageType) {
  if (location === '/admin/login' || location === '/' || location === '/404') {
    return (
      // <Logo/>                 
      <Image src={Logo} alt="logo" />
    );
  } else {
    return <></>
  }
};

function LanguageSelector() {
   const languages = ['en', 'jp'];
  const [selectedLanguage, setSelectedLanguage] = useState<any>(i18n?.language);
  const router = useRouter()
  const { pathname, asPath, query } = router;
  function onLanguageClick(language: string) {
    setSelectedLanguage(language);
    // router.push({ pathname, query }, asPath, { locale: language })
    router.push(
      {
          pathname: router.pathname,
          query: router.query
      }
      ,
      router.asPath,
      { locale: language }
    );
  }

  return (

    <UncontrolledDropdown style={{marginRight:"10px"}}>
      <DropdownToggle caret color="light" style={{padding:"0px 10px"}}>
        <TiWorld /> {selectedLanguage}
      </DropdownToggle>
      <DropdownMenu color="light">
        {languages.map((ln) => {
            if (selectedLanguage == ln) {
              return <DropdownItem key={ln} onClick={() => onLanguageClick(ln)}>{ln}</DropdownItem>
            }
            else {
              return <DropdownItem key={ln} onClick={() => onLanguageClick(ln)}>{ln}</DropdownItem>
            }
          })
        }
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [mail, setMail] = useState<any>('');

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const Handletoggle = () => {
    setIsOpen(!isOpen);
  };
  const location = usePathname();
  const currentURL = location.slice(0, location.lastIndexOf('/'));
  useEffect(() => {
    setMail(localStorage.getItem('mail'));
  });

  return (
    <Navbar color="light-white" dark expand="md" className={`${_container.nav_header}`}>
      <div className="d-flex align-items-center">
        <NavbarBrand href="/" className="d-lg-none">
          <Image src={LogoWhite} alt="logo" />
        </NavbarBrand>
      </div>

      <div className="hstack gap-2">
        <Button
          color="light"
          size="sm"
          className="d-sm-block d-md-none"
          onClick={Handletoggle}>
          {isOpen ? (
            <i className="bi bi-x"></i>
          ) : (
            <i className="bi bi-three-dots-vertical"></i>
          )}
        </Button>
      </div>

      <Collapse navbar isOpen={isOpen}>
        <Nav className="me-auto" navbar>
          <LogoForLoginPage location={location} />
          <NavItem>
            <Link href="/pages/about" className="nav-link">
              {/* About */}
            </Link>
          </NavItem>
          <UncontrolledDropdown inNavbar nav>
          </UncontrolledDropdown>
        </Nav>
        <LanguageSelector />
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
          <AdminProfileInformation location={location} mail={mail} />
        </Dropdown>
      </Collapse>
    </Navbar>
  );
};
type AdminProfileInformationType = {
  location: any;
  mail: any;
};
function AdminProfileInformation({ location, mail }: AdminProfileInformationType) {
  if (location !== '/admin/login' && location !== '/' && location !== '/404') {
    return (
      <div>
        <DropdownToggle color="light">
          <div style={{ lineHeight: "8px" }}>
            <label>{mail}</label>
          </div>
        </DropdownToggle>
      </div>
    );
  } else {
    return <></>
  }
};


export default Header;
