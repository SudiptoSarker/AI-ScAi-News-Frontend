'use client'
import { useState } from 'react';
import { Card, Row, Col, CardTitle, CardBody, Button, Form, FormGroup, Label, Input, FormText,CardSubtitle } from 'reactstrap';
import Head from 'next/head';
import Header from '../components/Header';
import type { NextPageWithLayout } from '../_app';
import UserLayout from '../layouts/UserLayout';
import { ReactElement } from 'react';
import ThemeRegister from '../components/users/theme_registration/theme-component';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'


const AdminQuestions:NextPageWithLayout = ()=>{
    return(
      <div className="row">
        <div className='col-12'>
              <ThemeRegister/>
          </div>        
      </div>  
    );
  }
  AdminQuestions.getLayout = function getLayout(page: ReactElement) {
    return (
      <UserLayout>
        {page}
      </UserLayout>
    )
  }
  
  export default AdminQuestions;

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