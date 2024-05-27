'use client'
import { useState } from 'react';
import UserProfile from '../components/admin/user-profile/profile-component';
import type { NextPageWithLayout } from '../_app';
import AdminLayout from '../layouts/AdminLayout';
import { ReactElement } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const AdminUserProfile:NextPageWithLayout = ()=>{
  return(
    <div className="row">
      <div className='col-12'>
            <UserProfile/>
        </div>        
    </div>  
  );
}
AdminUserProfile.getLayout = function getLayout(page: ReactElement) {
  return (
    <AdminLayout>
      {page}
    </AdminLayout>
  )
}

export default AdminUserProfile;

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