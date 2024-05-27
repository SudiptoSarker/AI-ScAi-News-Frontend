"use client"

import LoginForm from '../components/admin/login/login-form-component'; 
import type { NextPageWithLayout } from '../_app';
import AdminLayout from '../layouts/AdminLayout';
import { ReactElement } from 'react';

const App:NextPageWithLayout = () =>{
  return (                  
      <div>
        <LoginForm />                     
      </div>
    );
}

App.getLayout = function getLayout(page: ReactElement) {
  return (
    <AdminLayout>
      {page}
    </AdminLayout>
  )
}

export default App;
