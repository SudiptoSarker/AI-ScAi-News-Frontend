'use client'
import React from 'react';

import InfoRegister from '../components/users/info-register/info-register-component';
import type { NextPageWithLayout } from '../_app';
import UserLayout from '../layouts/UserLayout';
import { ReactElement } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


const PageContent:NextPageWithLayout=()=>{

    return(
        <div>
            <InfoRegister/>
        </div>        
    );
}

PageContent.getLayout = function getLayout(page: ReactElement) {
    return (
      <UserLayout>
        {page}
      </UserLayout>
    )
  }
  
  export default PageContent;

  export async function getStaticProps(context:any) {
    // extract the locale identifier from the URL
    const { locale } = context
  
    return {
      props: {
        // pass the translation props to the page component
        ...(await serverSideTranslations(locale)),
      },
    }
  }