import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, CardTitle, CardSubtitle, Table } from 'react-bootstrap';
import { useSearchParams,useRouter } from 'next/navigation'
import _common from '../../../styles/common.module.scss';
import _pagination from '../../../styles/pagination/pagination.module.scss';
import { Loader } from '../../common/common';
import { useTranslation } from 'next-i18next';

interface ThemeData {
  [key: string]: {
      [key: string]: any;
  };
}


const AdminProfile = () => {  
  const [profileObject, setProfileObject] = useState({});
  const [buttonText, setButtonText] = useState('Edit');
  const [readonly, setReadonly] = useState(true);
  const [show, setShow] = useState(false);  
  const [loading, setLoading] = useState(false); 

  const searchParams = useSearchParams(); 
  const userId = searchParams.get('Id') || '';       
  const [themeDataFiltered, setThemeDataFiltered] = useState<ThemeData | null>(null);  
  const { t } = useTranslation();
  useEffect(() => {
    if (userId) {
        setLoading(true);    
        const fetchData = async () => {
            try {                  
              //LOAD USER INFORMATION
              let response = await ReadUsers();
              const data = JSON.parse(response.message);                 
              const personalInfo = data[userId].personalInfo;                     
              setProfileObject(personalInfo);            

              //LOAD USER THEME                
              const themesResponse = await ReadThemes();                
              const themesData: ThemeData = JSON.parse(themesResponse.message);  

              let filteredData = themesData[userId] || null;
              if (filteredData) {
                filteredData = Object.entries(filteredData).reduce((acc: { [key: string]: any }, [key, value]) => {
                  if (value.isActive) {
                    acc[key] = value;
                  }
                  return acc;
                }, {});
              }
              
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
  }, [userId]);
  
  interface ThemeDataItem {
    themeTag: string;
    themeSite: string;
    themeTitle: string;
    themeRequest: string;
    themeResponse: { [question: string]: string[] };
    created_at: string;
    updated_at: string;
    deleted_at: string;
    isActive: boolean;
  }
  
  const router = useRouter();  
  interface HandleViewData {
    themeKey: string;
    theme: ThemeDataItem | undefined; 
  }
  const handleView = (data: HandleViewData) => {
    router.push(`/admin/theme-view?userId=${userId}&themeId=${data.themeKey}`);
  };

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
                <CardTitle as="h5">{t("page.admin.user_profile.section_header_personal_information")}</CardTitle>        
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
                    </>
                            
                </Row>                    
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
                <CardTitle as="h5">{t("page.admin.user_profile.section_header_theme_list")}</CardTitle>        
                <CardSubtitle as="h6" className="mb-2 text-muted"></CardSubtitle>

                <Row>
                  <Col lg="12">
                    <div className="table-responsive">
                      <Table bordered hover>
                        <thead>
                        <tr style={{ textAlign: 'center' }}>
                            <th>{t("page.admin.user_profile.th_no")}</th>
                            <th>{t("page.admin.user_profile.th_theme_name")}</th>
                            <th>{t("page.admin.user_profile.th_tag_name")}</th>
                            <th>{t("page.admin.user_profile.th_title")}</th>
                            <th>{t("page.admin.user_profile.th_action")}</th>
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
                                          onClick={() => handleView({
                                              themeKey,
                                              theme: undefined
                                          })} 
                                          className="btn btn-primary"
                                          style={{ lineHeight: '1', width: '100%', maxWidth: '80px' }}
                                      >
                                          {t("page.admin.user_profile.view_text")}
                                      </button>
                                  </td>
                              </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="text-center" colSpan={5}>{t("page.admin.user_profile.no_theme")}</td>
                            </tr>
                        )}                     
                        </tbody>
                      </Table>
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
};

export default AdminProfile;

//********AZURE BLOB STORAGE SERVICE*********//
let blobName_Tags: string = '';
let allTags: any = [];
let filteredTagList: any[] =[];

interface ParsedData  {
  [key: string]: { isActive: boolean };
};

interface TagDetails {
  questionnaire: {
    [key: string]: any; 
  };
}

let dataArray: any[] =[];
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