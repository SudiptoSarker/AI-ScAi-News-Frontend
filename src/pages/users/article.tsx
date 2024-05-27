'use client'
import { ReactElement, useEffect, useState } from 'react';
import type { NextPageWithLayout } from '../_app';
import UserLayout from '../layouts/UserLayout';
import Articles from '../components/users/article/user-article-component';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router'

const UserArticles: NextPageWithLayout = () => {

  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(function () {
    let userId = localStorage.getItem('userid') || '';
    let userRole = localStorage.getItem('role') || '';
    setUserId(userId);
    setUserRole(userRole);

  }, []);
  // creating log for article page visit.
  fetchApi().then(function (data) {
    let _date = new Date();
    let timeStamp = _date.getFullYear() + '-' + _date.getMonth() + '-' + _date.getDate() + ' ' + _date.getHours() + ':' + _date.getMinutes() + ':' + _date.getSeconds();
    let csvContent = "";
    let _mainArray = [];

    if (data == null) {
      let csvArray = [
        ['userid', 'userrole', 'page', 'activity', 'timestamp'],
        [userId, userRole, router.pathname, 'visit', timeStamp]
      ];

      csvArray.forEach(function (rowArray) {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
      });
    }
    else {
      if (data.length > 0) {
        let temp_array = data.split('\n');

        if (temp_array.length > 0) {
          temp_array.forEach(function (ra: any) {
            let _subArray = ra.split(",");
            _mainArray.push(_subArray);
          });
          _mainArray.push([userId, userRole, router.pathname, 'visit', timeStamp]);
        }

      }
      else {
        _mainArray = [
          ['userid', 'userrole', 'page', 'activity', 'timestamp'],
          [userId, userRole, router.pathname, 'visit', timeStamp]
        ];

      }

      _mainArray.forEach(function (rowArray) {
        let row = rowArray.join(",");
        csvContent += row + "\n";
      });

    }



    fetch(`/api/write_csv?blobName=userPageLog.csv&overwriteCase=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/csv',
      },
      body: csvContent,
    }).then(function (response) {
      response.json().then(function (data) {
        console.log(data.message);
      });
    });


  });




  return (
    <div className="row">
      <div className='col-12'>
        <Articles />
      </div>
    </div>
  );
}

UserArticles.getLayout = function getLayout(page: ReactElement) {
  return (
    <UserLayout>
      {page}
    </UserLayout>
  )
}

export default UserArticles;

async function fetchApi() {
  const response = await fetch(`/api/read_csv?blobName=userPageLog.csv`);
  const result = await response.json();
  const data = await result.message;
  return data;
}

export async function getStaticProps(context: any) {
  // extract the locale identifier from the URL
  const { locale } = context

  return {
    props: {
      // pass the translation props to the page component
      ...(await serverSideTranslations(locale)),
    },
  }
}