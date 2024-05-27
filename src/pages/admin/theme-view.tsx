'use client'
import type { NextPageWithLayout } from '../_app';
import AdminLayout from '../layouts/AdminLayout';
import { ReactElement } from 'react';
import ThemeView from '../components/admin/theme-view/theme-view-component';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const AdminThemeView:NextPageWithLayout = ()=>{
    return(
      <div className="row">
        <div className='col-12'>
              <ThemeView/>
          </div>        
      </div>  
    );
  }
  AdminThemeView.getLayout = function getLayout(page: ReactElement) {
    return (
      <AdminLayout>
        {page}
      </AdminLayout>
    )
  }
  
  export default AdminThemeView;

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