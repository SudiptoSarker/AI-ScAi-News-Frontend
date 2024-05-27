'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'

export default function Auth() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);


  useEffect(() => {
    fetch("/api/msgraph-user-profile")
      .then((response) => response.json())
      .then((data) => {
        let role = 'user';
        console.log(data.userid);
        setProfile(data);
        fetchApi('auth').then((adminIds) => {
          if (adminIds.hasOwnProperty(data.userid)) {
            role = adminIds[data.userid];
          }
          localStorage.setItem("userid", data.userid || 'undefined');
          localStorage.setItem("role", role);
          localStorage.setItem("mail", data.mail || 'undefined');
          localStorage.setItem("name", data.name || 'undefined');



          // creating log for article page visit.
          fetchLogApi().then(function (_data) {
            let _date = new Date();
            let timeStamp = _date.getFullYear() + '-' + _date.getMonth() + '-' + _date.getDate() + ' ' + _date.getHours() + ':' + _date.getMinutes() + ':' + _date.getSeconds();
            let csvContent = "";
            let _mainArray = [];

            if (_data == null) {
              let csvArray = [
                ['userid', 'userrole', 'page', 'activity', 'timestamp'],
                [data.userid, role, router.pathname, 'login', timeStamp]
              ];

              csvArray.forEach(function (rowArray) {
                let row = rowArray.join(",");
                csvContent += row + "\r\n";
              });
            }
            else {
              if (_data.length > 0) {
                let temp_array = _data.split('\n');

                if (temp_array.length > 0) {
                  temp_array.forEach(function (ra: any) {
                    let _subArray = ra.split(",");
                    _mainArray.push(_subArray);
                  });
                  _mainArray.push([data.userid, role, router.pathname, 'login', timeStamp]);
                }

              }
              else {
                _mainArray = [
                  ['userid', 'userrole', 'page', 'activity', 'timestamp'],
                  [data.userid, role, router.pathname, 'login', timeStamp]
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
              response.json().then(function (responseData) {
                console.log(responseData.message);
              });
            });

          });
          
          fetchApi('user').then(function(userData){
            if(userData.hasOwnProperty(data.userid)){
              router.push('/users/profile');
            }
            else{
              router.push('/users/info-register');
            }
          });
          
        });
      });
  }, []);

  return (
    <div>
      <p>plsease wait.</p>
    </div>
  );

}

async function fetchApi(blobName:string) {
  const response = await fetch(`/api/blob/read?blobName=${blobName}.json`);
  const result = await response.json();
  const data = await result.message;
  return JSON.parse(data);
}

async function fetchLogApi() {
  const response = await fetch(`/api/read_csv?blobName=userPageLog.csv`);
  const result = await response.json();
  const data = await result.message;
  return data;
}
