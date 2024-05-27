'use client'
import TagRegister from '../components/admin/tags/list-component'; 
import type { NextPageWithLayout } from '../_app';
import AdminLayout from '../layouts/AdminLayout';
import { ReactElement } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const AdminTagList:NextPageWithLayout = ()=>{
  return(
    <div className="row">
      <div className='col-12'>
            <TagRegister/>
        </div>        
    </div>  
  );
}
AdminTagList.getLayout = function getLayout(page: ReactElement) {
  return (
    <AdminLayout>
      {page}
    </AdminLayout>
  )
}

export default AdminTagList;

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
