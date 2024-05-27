'use-clent'

import { useState } from 'react';
import ReactPaginate from 'react-paginate';
import { ListGroup, Table, Pagination, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import { Card, Row, Col, CardTitle, CardBody, Button, Form, FormGroup, Label, Input, FormText,CardSubtitle } from 'reactstrap';
import {Loader,Paginations} from '../../common/common'
import { useTranslation } from 'next-i18next';


//DELETE MODAL
interface DeleteConfirmModalProps {
  showModal: boolean;
  handleClose: () => void;
  handleDelete: () => void;
}
const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ showModal, handleClose, handleDelete }) => {
  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} className="btn btn-secondary">
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} className="btn btn-danger" id='delete_tag_btn'>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


const AdminResourceSiteRegisterFormAndSiteList = () => {
  //TABLE DATA
  const data = [
    { No: 1, 'Site Name': 'https://b.hatena.ne.jp/', Configure: 'Done', Actions: 'Edit Delete' },
    { No: 2, 'Site Name': 'https://www.thedailystar.net/', Configure: 'Not Done', Actions: 'Edit Delete' },
    { No: 3, 'Site Name': 'https://www.japantimes.co.jp/', Configure: 'Not Done', Actions: 'Edit Delete' },
    { No: 4, 'Site Name': 'https://www.asahi.com/ajw/', Configure: 'Not Done', Actions: 'Edit Delete' },
    { No: 5, 'Site Name': 'https://b.hatena.ne.jp/', Configure: 'Not Done', Actions: 'Edit Delete' },
    { No: 6, 'Site Name': 'https://b.hatena.ne.jp/', Configure: 'Done', Actions: 'Edit Delete' },
    { No: 7, 'Site Name': 'https://www.japantimes.co.jp/', Configure: 'Done', Actions: 'Edit Delete' },
    { No: 8, 'Site Name': 'https://www.thedailystar.net/', Configure: 'Done', Actions: 'Edit Delete' },
    { No: 9, 'Site Name': 'https://www.thedailystar.net/', Configure: 'Done', Actions: 'Edit Delete' },
    { No: 10, 'Site Name': 'https://www.thedailystar.net/', Configure: 'Done', Actions: 'Edit Delete' },
    { No: 11, 'Site Name': 'https://www.thedailystar.net/', Configure: 'Done', Actions: 'Edit Delete' },
  ];

  const { t } = useTranslation();

  //const columns = ['No', 'Site Name', 'Configure', 'Actions'];
  //DEFAULT ITEM FOR PER PAGE ROW
  const items = Array.from({ length: data.length }, (_, index) => `Item ${index + 1}`);
  const DEFAULT_ITEMS_PER_PAGE = 5;
  const MAX_VISIBLE_PAGES = 4; // Maximum number of visible page numbers
  
  //DELETE MODAL: START
  const [showModal, setShowModal] = useState(false);

  const handleDeleteClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleDeleteConfirmed = () => {   
    setShowModal(false);
  };
  //DELETE MODAL: END

  //PAGINATION START
  const [currentPage, setCurrentPage] = useState(0); // Note: ReactPaginate uses 0-based indexing
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handlePageChange = (selectedPage: { selected: any; }) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleItemsPerPageChange = (event: { target: { value: string; }; }) => {
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

  //INPUT FORM FOR SITE RESOURCE PAGE
  const [rows, setRows] = useState([{ type: '', value: '' }]);
  // const [showMe, setShowMe] = useState(false);

  const handleAddRow = () => {  
    // setShowMe(!showMe);
    setRows([...rows, { type: '', value: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    const updatedRows:any = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  // const handleChange = (index: number, field: string, newValue: string) => {
  //   const updatedRows = [...rows];
  //   updatedRows[index][field] = newValue;
  //   setRows(updatedRows);
  // };
  const handleChange = (index: number, field: string, newValue: string) => {
    const updatedRows = [...rows];
    updatedRows[index][field as 'type' | 'value'] = newValue; // Direct type assertion
    setRows(updatedRows);
  };
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount(count + 1);
  };

  const handleDecrement = () => {
    if (count > 0) {
      setCount(count - 1);
    }
  };
  
  const handleEditClick = (id:any, text:any) => {    
      setEditText(text);
      // Set the input value based on the clicked button's text
      setInputValue(text);

    setIsTagsEditable(true);    
  };

  return (
    <div>
      
      <Row>
        <Col lg="1"></Col>
        <Col lg="10">
            <Card>
                <CardTitle tag="h5" className="border-bottom p-3 mb-0">                    
                    {t("page.admin.resource_sites.page_header")}
                </CardTitle>
                <CardBody>
                <h6 className="card-title">
                {t("page.admin.resource_sites.section_title1")}
                </h6>
                <br/>
                <Row>                               
                    <Col lg="2"><Label for="exampleEmail" className='tag_name_lbl'>{t("page.admin.resource_sites.input_field1")}:</Label></Col>
                    <Col lg="10">
                      <input id="exampleEmail" name="email" placeholder={t("page.admin.resource_sites.placeholder1")} type="text" className="input-group input-group-sm mb-3 custom-form-control"/>
                    </Col>                   
                </Row>                    
                <br/>
                <Row>                               
                    <Col lg="5"><Label for="exampleEmail" className='tag_name_lbl'>{t("page.admin.resource_sites.other_text1")}:</Label></Col>                        
                    <Col lg="7">
                        <p className='input_table_header'>{t("page.admin.resource_sites.other_text2")}</p>
                    </Col>                        

                </Row>  
                <Table bordered hover>
                  <thead>
                  <tr className='text-center align-middle'>   
                      <th>{t("page.admin.resource_sites.th_type")}</th>
                      <th>{t("page.admin.resource_sites.th_value")}</th>                          
                      <th>                                  
                        <i className="bi bi-plus-circle text-success custom-plus-circle-icon" onClick={handleAddRow}></i>                                             
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (                            
                      <tr key={index} >                             
                        <td>
                        <select value={row.type} onChange={(e) => handleChange(index, 'type', e.target.value)} className="form-select form-select-sm" aria-label="Default select example">                                  
                            <option value="">Select Type</option>
                            <option value="class">Class Name</option>
                            <option value="name">ID Name</option>
                            <option value="tag">Tag Name</option>
                        </select>
                        </td>
                        <td>
                          <input id="exampleEmail" name="email" placeholder={t("page.admin.resource_sites.placeholder2")} type="text"  className="input-group input-group-sm mb-3"/>  
                        </td>                                        
                        <td className='text-center align-middle'>                            
                          <i className="bi bi-dash-circle text-danger custom-minus-circle-icon" onClick={() => handleRemoveRow(index)}></i>                              
                        </td>                    
                      </tr>                           
                    ))}
                  </tbody>
                </Table>
                <button className="btn btn-success btn-sm float-end">{t("page.admin.resource_sites.save_btn")}</button>
                {/* <button type="button" className={isTagEditable ? 'btn btn-warning btn-sm float-end' : 'btn btn-success btn-sm float-end'}> {isTagEditable ? 'Edit' : 'Add'}</button>                            */}
                </CardBody>
            </Card>
        </Col>  
        <Col lg="1"></Col>       
      </Row>

      <Row>
        <Col lg="1"></Col>   
        <Col lg="10">     
          <Card>
            <CardBody>
              <CardTitle tag="h5">{t("page.admin.resource_sites.section_header2")}</CardTitle>
              <CardSubtitle className="mb-2 text-muted" tag="h6"></CardSubtitle>
              <Row>                        
                <Col lg="12">        
                  <div className="table-responsive">                    
                    <Table bordered hover>
                      <thead>
                        <tr className='text-center align-middle'>                          
                           <th>{t("page.admin.resource_sites.th_no")}</th>
                           <th>{t("page.admin.resource_sites.th_site_name")}</th>
                           <th>{t("page.admin.resource_sites.th_configure")}</th>
                           <th>{t("page.admin.resource_sites.th_actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                      {currentItems.map((row, rowindex) => (                                                    
                        <tr className='text-center align-middle' key={rowindex}>   
                          <td>{row.No}</td>
                          <td>{row["Site Name"]}</td>
                          {row.Configure =="Done" ? <td><h6><span className="badge bg-success">{t("page.admin.resource_sites.generated")}</span></h6></td>:<td><h6><span className="badge bg-danger">{t("page.admin.resource_sites.not_generated")}</span></h6> </td>}
                          <td className='action-btn'>        
                                        <button type="button" className="btn btn-warning btn-sm tag-edit-btn" onClick={() => handleEditClick(row.No, row["Site Name"])}>{t("page.admin.resource_sites.edit_btn")}</button>                                
                                        <span style={{ margin: "0 5px" }}></span> {/* Add space here */}
                                        <button type="button" className="btn btn-danger btn-sm tag-delete-btn" onClick={handleDeleteClick}>{t("page.admin.resource_sites.delete_btn")}</button>
                                        <DeleteConfirmModal
                                            showModal={showModal}
                                            handleClose={handleModalClose}
                                            handleDelete={handleDeleteConfirmed}
                                        />
                            </td>  
                        </tr>
                    ))}     
                    </tbody>
                    </Table>                   
                  </div>          
                </Col>                               
              </Row>
              <Paginations
                  currentItems={currentItems}
                  itemsPerPage={itemsPerPage}
                  handleItemsPerPageChange={handleItemsPerPageChange}
                  handlePageChange={handlePageChange}
                  totalPages={totalPages}
                  MAX_VISIBLE_PAGES={MAX_VISIBLE_PAGES}
              />  
            </CardBody>                
          </Card>
        </Col>      
        <Col lg="1"></Col>       
      </Row>

      <DeleteConfirmModal
        showModal={showModal}
         handleClose={handleModalClose}
         handleDelete={handleDeleteConfirmed}
       />
    </div>        
  );
};

export default AdminResourceSiteRegisterFormAndSiteList;

function setEditText(text: any) {
  throw new Error('Function not implemented.');
}
function setInputValue(text: any) {
  throw new Error('Function not implemented.');
}
function setIsTagsEditable(arg0: boolean) {
  throw new Error('Function not implemented.');
}

