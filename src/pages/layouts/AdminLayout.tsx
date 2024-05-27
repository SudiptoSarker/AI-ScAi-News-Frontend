'use client'
import Head from "next/head";
import React, { ReactNode,useEffect,useState } from "react";
import Sidebar from "./sidebars/vertical/AdminSidebar";
import Header from "./header/Header";
import { usePathname } from "next/navigation";
import { Container } from "react-bootstrap";
import _container from '../styles/layout/_container.module.scss';
import _sidebar from '../styles/layout/_sidebar.module.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useRouter } from 'next/navigation'

 type Props = {
    children: ReactNode;
  };

  type SideBarMenuShowHideType={
    location:any;
    open:any;
  };

function SideBarMenuShowHide({ location,open}:SideBarMenuShowHideType){    
  if (location !== '/admin/login' && location !== '/' && location !== '/404') {
    if(open){
      return (
        <aside className={`${_sidebar.sidebarArea} bg-white shadow showSidebar`}>
          <Sidebar />
        </aside>          
      );
    }
    else{
      return (
        <aside className={`${_sidebar.sidebarArea} bg-white shadow`}>
          <Sidebar />
        </aside>          
      );
    }
  }else{
    return <></>
  }
};
const AdminLayout:React.FC<Props> = ({children})=> {
  const location = usePathname();
  const [unauthorised, setUnuthorised] = useState<any>(false);
  const router = useRouter();   

  useEffect(()=>{
      const userId = localStorage.getItem('userid');
      if (userId === null || userId.trim() === ''){
        router.push('/auth/auth');
      }          
      setUnuthorised(localStorage.getItem('role') !='admin');
  });

  if(unauthorised){
    return (
      <div>
        <h1>Your account is not authorized for admin request.Please Retry</h1>
      </div>
    );
  }
  return (
    <>
    <Head>
    <meta name="robots" content="noindex, nofollow" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="" />
        <title>ScAIChat</title>
        <link rel="icon" href="/favicon.ico" />
    </Head>
    <main>
      <div className={`${_container.pageWrapper} d-md-block d-lg-flex`}>
        {/******** Sidebar **********/}            
        <SideBarMenuShowHide  location={location} open={false}/>                 
        {/********Content Area**********/}

        <div className={_container.contentArea}>
          {/********header**********/}
          <Header/>

          {/********Middle Content**********/}
          <Container className={`p-4 ${_container.wrapper}`} fluid>
            <div>{children}</div>
          </Container>
        </div>
      </div>
    </main>
    </>
  )
}

export default AdminLayout;