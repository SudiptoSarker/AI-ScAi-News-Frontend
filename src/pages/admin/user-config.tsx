'use client'
import { useState } from 'react';
import AdminPersonalInfoFieldList from '../components/admin/user-config/user-config-component'; 
import type { NextPageWithLayout } from '../_app';
import AdminLayout from '../layouts/AdminLayout';
import { ReactElement } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

//MAIN FUNCTION: INPUT FORM AND LIST TABLE WILL BE CALLED FROM THIS FUNCTION
const PageContent:NextPageWithLayout=()=> {
  return (                  
      <div>
        <AdminPersonalInfoFieldList />                   
      </div>
    );
}

PageContent.getLayout = function getLayout(page: ReactElement) {
  return (
    <AdminLayout>
      {page}
    </AdminLayout>
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