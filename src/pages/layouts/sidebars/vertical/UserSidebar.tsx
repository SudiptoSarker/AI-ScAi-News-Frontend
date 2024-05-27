import React, { useState } from "react";
import { Button, Nav, NavItem } from "reactstrap";
import Logo from "../../shared/logo/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from 'next/navigation';
import  "../../../../../node_modules/bootstrap/dist/css/bootstrap.css";
import _sidebar from  '../../../styles/layout/_user_sidebar.module.scss';
import { useTranslation } from 'next-i18next';

const Sidebar = () => {
  const location = usePathname();
  const [showSubMenu, setShowSubMenu] = useState(false);
  const { t } = useTranslation();
  const admin_navigation = [  
    {
      title: t("user_links.profile_title"),
      href: "/users/profile",
      icon: 'bi bi-person',
    }, 
    {
      title: t("user_links.theme.theme_title"),
      icon: "bi bi-amd",
      submenu: [
        {
          title: t("user_links.theme.theme_registration"),
          href: "/users/theme_registration",
          icon: "bi bi-journal-plus",
        }
      ]
    },
    {
      title: t("user_links.articles_title"),
      href: "/users/article",
      icon: "bi bi-pass",    
    }
  ];

  const toggleSubMenu = () => {
    setShowSubMenu(!showSubMenu);
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-center align-items-center">
        <Logo />
      </div>
      <div className="pt-4 mt-2">
        <Nav vertical className={_sidebar.sidebarNav}>  
          {admin_navigation.map((navItem, index) => (
            <NavItem key={index} className="sidenav-bg" style={{ fontSize: '15px', marginLeft: '-5px' }}>
              {navItem.href && (
                <Link
                  href={navItem.href}
                  className={location === navItem.href ? "text-primary nav-link py-2" : "nav-link text-secondary py-2"}
                  style={{ lineHeight: '1.2' }}
                >
                  <i className={navItem.icon}></i>
                  <span className="d-inline-block ms-3">{navItem.title}</span>
                </Link>
              )}
              {/* Handle submenu if it exists */}
              {navItem.submenu && (
                <div
                  className="nav-link text-secondary py-2"
                  onClick={toggleSubMenu}
                  style={{ cursor: 'pointer' }}
                >
                  <i className={navItem.icon}></i>
                  <span className="d-inline-block ms-3" style={{ textAlign: 'center'}}>{navItem.title}</span>
                  {showSubMenu && (                    
                    <Nav vertical className="ms-4">
                      <hr className={_sidebar.custom_hr} style={{ textAlign: 'center',marginTop:'6px' }}/>
                      {navItem.submenu.map((subItem, subIndex) => (
                        <NavItem key={subIndex} className="sidenav-bg" style={{ fontSize: '15px', marginLeft: '-26px' }}>
                          {subItem.href && (
                            <Link
                              href={subItem.href}
                              className={location === subItem.href ? "text-primary nav-link py-2" : "nav-link text-secondary py-2"}
                              style={{ lineHeight: '1.2' }}
                            >
                              <i className={subItem.icon}></i>
                              <span className="d-inline-block ms-3" style={{ textAlign: 'left' }}>{subItem.title}</span>
                            </Link>
                          )}
                          {/* <hr className={_sidebar.custom_hr} /> */}
                        </NavItem>
                      ))}
                    </Nav>
                  )}
                </div>
              )}
              <hr className={_sidebar.custom_hr} style={{ marginTop:'-2px' }}/>
            </NavItem>
          ))}
        </Nav>                   
      </div>    
    </div>
  );
};

export default Sidebar;
