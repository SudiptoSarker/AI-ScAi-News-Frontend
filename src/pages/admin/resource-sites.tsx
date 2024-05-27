'use client'
import { Card, Row, Col, CardTitle, CardBody, Button, Form, FormGroup, Label, Input, FormText,CardSubtitle } from 'reactstrap';
import { useState } from 'react';
import ResourceSties from '../components/admin/resource-sites/site_list-component'; 
import type { NextPageWithLayout } from '../_app';
import AdminLayout from '../layouts/AdminLayout';
import { ReactElement } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';



const AdminResourceSites:NextPageWithLayout = ()=>{
  return(
      <Row>
          <Col lg="1"></Col>   
          <Col lg="10">
              <ResourceSties />
          </Col>   
          <Col lg="1"></Col>   
      </Row>       
  );
}

AdminResourceSites.getLayout = function getLayout(page: ReactElement) {
  return (
    <AdminLayout>
      {page}
    </AdminLayout>
  )
}

export default AdminResourceSites;

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
















