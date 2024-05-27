'use client'
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, CardTitle, CardSubtitle, Table } from 'react-bootstrap';
import { useRouter } from 'next/navigation'
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'next-i18next';

import _common from '../../../styles/common.module.scss';
import { Loader,Paginations } from '../../common/common';

type ThemeType = {
  themeTag:any;
  themeTitle:any;
  themeSite:any[];
  themeResponse:any;
};

interface ThemeData {
  [key: string]: {
      [key: string]: any;
  };
}
const DEFAULT_ITEMS_PER_PAGE = 5;
const MAX_VISIBLE_PAGES = 4; // Maximum number of visible page numbers

async function ReadThemeList(userId: any) {
  // //LOAD USER THEME                
  const themesResponse = await ReadThemes();                
  const themesData: ThemeData = JSON.parse(themesResponse.message);  
  console.log('themesData:', themesData)
  // const filteredData = themesData[userId];
  let filteredData: { [key: string]: any } = themesData[String(userId)] || null;

  if (filteredData) {
    filteredData = Object.entries(filteredData).reduce((acc: { [key: string]: any }, [key, value]) => {
      if (value.isActive) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  return filteredData;
}

const UserProfile = () => { 
  const router = useRouter();
  const [profileObject, setProfileObject] = useState<object>({});
  const [buttonText, setButtonText] = useState('Edit');
  const [readonly, setReadonly] = useState(true);
  const [show, setShow] = useState(false);
  const [themes, setThemes] = useState<Array<ThemeType>>([]);
  const [user_Id, setUserId] = useState<any>('');
  const [loading, setLoading] = useState(false); 
  const [themeDataFiltered, setThemeDataFiltered] = useState<ThemeData | null>(null); 

   const { t } = useTranslation();  
  
  useEffect(() => {
    let userId = localStorage.getItem('userid');
    if(userId){
      setUserId(userId);
      setLoading(true);    
      const fetchData = async () => {
          try {                  
            //LOAD USER INFORMATION
            let response = await ReadUsers();
            const data = JSON.parse(response.message);                 
            // const personalInfo = data[userId].personalInfo; 
            const personalInfo = data[String(userId)]?.personalInfo || null;                   
            setProfileObject(personalInfo);             
            let filteredData:any = await ReadThemeList(userId);                                     
            setThemeDataFiltered(filteredData);   
          } 
          catch (error) {
              console.error(error);
          } 
          finally {
              setLoading(false);
          }
      };
  
      fetchData();
    }
  }, []); // empty dependency array to run the effect only once after mounting
  

  function handleSubmit(e:any) {
    e.preventDefault();
    if (buttonText.toLowerCase() === 'submit') {
      let formData = new FormData(e.target);
      const formJson = Object.fromEntries(formData.entries());
      console.log(formJson);
      setButtonText('Edit');
      setReadonly(true);
    } else {
      setShow(true);
    }
  }
  function handleEdit(editItem:any) {
    if(editItem){      
      router.push(`/users/theme_registration?themeId=${editItem}`);
    }       
  }
  async function handleDelete(deleteItem:any) {    
    //LOAD USER THEME                
    let themesResponse = await ReadThemes();                
    let themesData: ThemeData = JSON.parse(themesResponse.message); 
    console.log('themesData data: ',themesData);
    let filterAfterDeleteTheme = themesData[String(user_Id)] || null;  
    setThemeDataFiltered(filterAfterDeleteTheme);       

    if (deleteItem in themesData[user_Id]) {
        // Update isActive to false
        themesData[user_Id][deleteItem].isActive = false;
    }    
    UpdateThemeList(themesData,true,setThemeDataFiltered,user_Id);   
  }

  const handleClose = () => setShow(false);
  const handleConfirm = () => {
    setShow(false);
    router.push('/users/info-register');

  };

  const items = Object.entries(profileObject).map(([key, value]) => (
    <div className="col-6 mb-3" key={key}>
      <label htmlFor={key} className="form-label">{key}</label>
      <input type="text" className="form-control custom-form-control" name={key} id={key} placeholder={`Enter your ${key}`} defaultValue={value} readOnly={readonly} />
    </div>
  ));

  //PAGINATION START
  // const [currentPage, setCurrentPage] = useState(0);
  // const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  // const startIndex = currentPage * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const currentItems = themeDataFiltered.slice(startIndex, endIndex);

  // const totalPages = Math.ceil(themeDataFiltered.length / itemsPerPage);

  // const handlePageChange = (selectedPage: any) => {
  //     setCurrentPage(selectedPage.selected);
  // };

  // const handleItemsPerPageChange = (event: any) => {
  //     const selectedItemsPerPage = parseInt(event.target.value, 10);
  //     setItemsPerPage(selectedItemsPerPage);
  //     setCurrentPage(0); // Reset to the first page when changing items per page
  // };
  //PAGINATION END

  return (
    <div className={`${_common.card_body}`}>      
    <Row>
      <Col lg="1"></Col>
      <Col lg="10">
      {loading ? (
          <Loader />
        ) : (
        <Card>                    
          <CardBody>                            
            <CardTitle as="h5">{t("page.users.profile.section_header_personal_information")}</CardTitle>        
            <CardSubtitle as="h6" className="mb-2 text-muted"></CardSubtitle>
            <Row>                                                            
              <>
                {profileObject && Object.entries(profileObject).map(([key, value]) => (
                  <div className="col-6 mb-3" key={key}>
                    <label htmlFor={key} className="form-label">{key}</label>
                    <input 
                      type="text" 
                      className="form-control custom-form-control" 
                      name={key} 
                      id={key} 
                      placeholder={`Enter your ${key}`} 
                      defaultValue={value as string} 
                      readOnly={readonly} 
                    />
                  </div>
                ))}
                <div className="offset-11 col-1 d-flex justify-content-end">
                  <button type="submit" className="btn btn-success btn-sm" onClick={handleSubmit}>{buttonText.toLowerCase()=='edit'?t("page.users.profile.edit_text"):t("page.users.profile.submit_text")}</button>
                </div>
              </>
            </Row>   
            <Modal show={show} onHide={handleClose} centered>
              <Modal.Header closeButton>
                <Modal.Title>{t("page.users.profile.delete_header")}</Modal.Title>
              </Modal.Header>
              <Modal.Body>{t("page.users.profile.delete_confirm_text")}</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                {t("page.users.profile.delete_close_btn")}
                </Button>
                <Button variant="success" onClick={handleConfirm}>
                  {t("page.users.profile.delete_confirm_btn")}
                </Button>
              </Modal.Footer>
            </Modal>                        
          </CardBody>
        </Card>
        )}
      </Col>  
      <Col lg="1"></Col>       
    </Row>

    <br/><br/>   

    <Row>
      <Col lg="1"></Col>
      <Col lg="10">
        {loading ? (
          <Loader />
        ) : (
          <Card>
            <CardBody>
              <CardTitle as="h5">{t("page.users.profile.section_header_theme_list")}</CardTitle>        
              <CardSubtitle as="h6" className="mb-2 text-muted"></CardSubtitle>

              <Row>
                <Col lg="12">
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead>
                      <tr style={{ textAlign: 'center' }}>
                          <th>{t("page.users.profile.th_no")}</th>
                          <th>{t("page.users.profile.th_theme_name")}</th>
                          <th>{t("page.users.profile.th_tag_name")}</th>
                          <th>{t("page.users.profile.th_title")}</th>
                          <th>{t("page.users.profile.th_action")}</th>
                      </tr>
                      </thead>
                      <tbody>
                      {themeDataFiltered && Object.keys(themeDataFiltered).length > 0 ? (
                          Object.keys(themeDataFiltered).map((themeKey:string, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td style={{ textAlign: 'center' }}>{themeKey}</td>
                                <td style={{ textAlign: 'center' }}>{themeDataFiltered[themeKey].themeTag}</td>
                                <td style={{ textAlign: 'center' }}>{themeDataFiltered[themeKey].themeTitle}</td>
                                <td style={{ textAlign: 'center', lineHeight: '1' }}>
                                  <button 
                                      onClick={() => handleEdit(themeKey)} 
                                      className="btn btn-primary"
                                      style={{ lineHeight: '0.7', width: '50%', maxWidth: '49px', marginRight: '5px',fontSize: '12px',fontFamily: 'Yu Gothic' }}
                                    >
                                      {t("page.users.profile.edit_button_text")}
                                  </button>

                                  <button 
                                    onClick={() => handleDelete(themeKey)} 
                                    className="btn btn-danger"
                                    style={{ lineHeight: '0.8', width: '50%', maxWidth: '60px' ,fontSize: '12px',fontFamily: 'Yu Gothic' }}
                                  >
                                      {t("page.users.profile.delete_button_text")}
                                  </button>
                                </td>
                            </tr>
                          ))
                      ) : (
                          <tr>
                              <td className="text-center" colSpan={5}>{t("page.users.profile.no_theme")}</td>
                          </tr>
                      )}                     
                      </tbody>
                    </Table>
                    {/* <Paginations
                      currentItems={currentItems}
                      itemsPerPage={itemsPerPage}
                      handleItemsPerPageChange={handleItemsPerPageChange}
                      handlePageChange={handlePageChange}
                      totalPages={totalPages}
                      MAX_VISIBLE_PAGES={MAX_VISIBLE_PAGES}
                    /> */}
                  </div>
                </Col>
              </Row>                
            </CardBody>
          </Card>
        )}
      </Col>
      <Col lg="1"></Col>
    </Row>
  </div>   
  );
}

export default UserProfile;

async function ReadUsers(){  
  try{
    const userProfileBlob = process.env.NEXT_PUBLIC_USER_BLOB_NAME;    
    const response = await fetch(`/api/blob/read?blobName=${userProfileBlob}`);
    const result = await response.json();       
    return result;
  }catch(error:any){
      console.error("Error: ", error.message);
      return false;
  }
}

async function ReadThemes(){  
  try{
    const themeBlobName = process.env.NEXT_PUBLIC_USER_THEME_BLOB_NAME;    
    const response = await fetch(`/api/blob/read?blobName=${themeBlobName}`);
    const result = await response.json();   
        
    return result;
  }catch(error:any){
      console.error("Error: ", error.message);
      return false;
  }
}

async function UpdateThemeList(themeResponse: { [key: string]: any; },isDelete:boolean,setThemeDataFiltered: { (value: React.SetStateAction<ThemeData | null>): void; (arg0: { [key: string]: any; }): void; },user_Id:string){             
  try{
      let userThemeBlob = process.env.NEXT_PUBLIC_USER_THEME_BLOB_NAME   
      const response = await fetch(`/api/blob/write?blobName=${userThemeBlob}&overwriteCase=true`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(themeResponse),
      });     
      // let filteredData:any = await ReadThemeList(user_Id);    
      // console.log('filteredData22s: ',filteredData);
      // setThemeDataFiltered(filteredData);    

      //LOAD USER THEME                
    //                
    // 
    // console.log('themesData data: ',themesData);
    // 
    //        

    
      if(isDelete){        
        let filteredData:any = await ReadThemeList(user_Id);                                     
        setThemeDataFiltered(filteredData);   

        alert('Blob deleted successful');
      }else{
        alert('Blob stored successful');
      }
      
  }catch(error){
      return false        
  }  finally {
      //setLoading(false); 
  }
}