'use-clent'

import { useState,useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { ListGroup, Table, Pagination, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import { Card, Row, Col, CardTitle, CardBody, Button, Form, FormGroup, Label, Input, FormText,CardSubtitle } from 'reactstrap';
import { IoIosArrowForward,IoIosArrowBack } from "react-icons/io";
import { useRouter } from 'next/navigation'
import _common from '../../../styles/common.module.scss';
import _pagination from '../../../styles/pagination/pagination.module.scss';
import { Loader,Paginations } from '../../common/common';
import { useTranslation } from 'next-i18next';

//DEFAULT ITEM FOR PER PAGE ROW
const DEFAULT_ITEMS_PER_PAGE = 5;
const MAX_VISIBLE_PAGES = 4; // Maximum number of visible page numbers

const UserList = () => {   
  const [validationError, setValidationError] = useState(''); 
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [editText, setEditText] = useState('');
  const [deleteText, setDeleteText] = useState('');
  const [isDeleteTag, setIsDeleteTag] = useState(false);
  const { t } = useTranslation();

  //*******Testing:start********//
  const [adminTagList, setAdminTagList] = useState<Array<any>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseTagList:any = await ReadUsers();
        setAdminTagList(responseTagList);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const data = adminTagList;
  console.log('data: ',data);

  // const columns = ['ID', 'Name', 'Age', 'Mail', 'Actions'];

  //PAGINATION START
  const [currentPage, setCurrentPage] = useState(0); // Note: ReactPaginate uses 0-based indexing
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  interface TagItem {
    TagName: string;
    Questionnaire: string;
    // Add other properties if necessary
  }
  
 
  const currentItems: TagItem[] = data.slice(startIndex, endIndex);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (selectedPage:any) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleItemsPerPageChange = (event:any) => {
    const selectedItemsPerPage = parseInt(event.target.value, 10);
    setItemsPerPage(selectedItemsPerPage);
    setCurrentPage(0); // Reset to the first page when changing items per page
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(0, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
    let endPage = Math.min(totalPages - 1, startPage + MAX_VISIBLE_PAGES - 1);

    if (totalPages > MAX_VISIBLE_PAGES) {
      if (endPage === totalPages - 1) {
        startPage = Math.max(0, endPage - MAX_VISIBLE_PAGES + 1);
      } else if (startPage === 0) {
        endPage = Math.min(totalPages - 1, startPage + MAX_VISIBLE_PAGES - 1);
      }
    }

    if (startPage > 0) {
      pageNumbers.push(
        <span key="ellipsis-start" className="ellipsis">
          ...
        </span>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <span
          key={i}
          className={`page-number ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange({ selected: i })}
        >
          {i + 1}
        </span>
      );
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push(
        <span key="ellipsis-end" className="ellipsis">
          ...
        </span>
      );
    }

    return pageNumbers;
  };
  //PAGINATION END
  const router = useRouter();

  const handleViewClick = (id: any) => {
    // Use the useRouter hook to access the router object  
    // Redirect to the profile page with the Id parameter
    router.push(`/admin/user-profile?Id=${id}`);
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
                <CardTitle tag="h5" style={{ marginTop: '3px', marginBottom: '15px' }}>
                  {t("page.admin.user_list.section_header")}
                </CardTitle>
                <CardSubtitle className="mb-2 text-muted" tag="h6"></CardSubtitle>
                <Row>                        
                  <Col lg="12">        
                    <div className="table-responsive">                   
                    <Table bordered hover responsive>
                      <thead className="thead-dark">
                        <tr className='text-center align-middle'>
                          <th>{t("page.admin.user_list.th_sl")}</th>
                          <th>{t("page.admin.user_list.th_name")}</th>
                          <th>{t("page.admin.user_list.th_age")}</th>
                          <th>{t("page.admin.user_list.th_mail")}</th>
                          <th>{t("page.admin.user_list.th_actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(currentItems).length === 0 ? (
                          <tr>
                          <td colSpan={6} className="text-center">{t("page.admin.user_list.no_user")}</td>
                        </tr>
                        ) : (
                          currentItems.map((item: any, index: number) => (
                            <tr key={index} className='text-center align-middle' style={{ lineHeight: '0.5' }}>
                              <td>{item.SerialId}</td>                            
                              <td>{item.FullName}</td>
                              <td>{item.Age}</td>
                              <td>{item.Mail}</td>
                              <td className='action_btn' style={{ lineHeight: '0.5' }}>
                                <button type="button" className={`btn btn-primary btn-sm`} onClick={() => handleViewClick(item.Id)}>
                                {t("page.admin.user_list.view_button")}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>

                    </div>          
                  </Col>                               
                </Row>                
                <Row> 
                  <Paginations
                    currentItems={currentItems}
                    itemsPerPage={itemsPerPage}
                    handleItemsPerPageChange={handleItemsPerPageChange}
                    handlePageChange={handlePageChange}
                    totalPages={totalPages}
                    MAX_VISIBLE_PAGES={MAX_VISIBLE_PAGES}
                  />                     
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

export default UserList;

//********AZURE BLOB STORAGE SERVICE*********//
let blobName_Tags: string = '';
let allTags: any = [];
let filteredTagList: any[] =[];

interface ParsedData  {
  [key: string]: { isActive: boolean };
};

interface TagDetails {
  questionnaire: {
    [key: string]: any; // Define the structure of the questionnaire if known
  };
}

let dataArray: any[] =[];
async function ReadUsers(){
  try{
    if(blobName_Tags == ''){
      blobName_Tags = process.env.NEXT_PUBLIC_USER_BLOB_NAME || '';
    }     
    const response = await fetch(`/api/blob/read?blobName=${blobName_Tags}`);
    const result = await response.json();   
    let jsonString = result.message;    
    jsonString = jsonString.replace(/^"|"$/g, "");    
    console.log('json: ',jsonString)
    
    const jsonObject = JSON.parse(jsonString);
    console.log('jsonObject: ',jsonObject);
    
    let dataArray: any[] = Object.keys(jsonObject).map((key, index) => {
      const user = jsonObject[key];
      return {
        Id: key,
        SerialId: index + 1, 
        FullName: user.personalInfo.Name,
        Age: user.personalInfo.Age,
        Mail: user.personalInfo.Email
      };
    });
    console.log('dataArray: ',dataArray);
    return dataArray;
  }catch(error:any){
      console.error("Error: ", error.message);
      return false;
  }
}