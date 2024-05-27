 'use-clent'

import { useState,useEffect, SetStateAction } from 'react';
import { ListGroup, Table, Pagination, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import { Card, Row, Col, CardTitle, CardBody, Button, Form, FormGroup, Label, Input, FormText,CardSubtitle } from 'reactstrap';
import { Loader,Paginations } from '../../common/common';
import styles from "./user-config-component.module.css";
import { useTranslation } from 'next-i18next';

interface WriteResponse {
  message: string; // Adjust the type according to your actual response structure
  // Other properties if any
}
function AdminPersonalInfoFieldList(){
  const [showModal, setShowModal] = useState(false);
  //const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [buttonText, setButtonText] = useState('Add');
  const [inputValue, setInputValue] = useState('');
  const [inputPositionValue, setInputPositionValue] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [dataList, setDataList] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [nameFieldError, setNameFieldError] = useState('');
  const [positionError, setPositionError] = useState('');

  const { t } = useTranslation();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {    
  //       let configList = await getConfigList();
  //       setDataList(configList);
  //     } catch (error) {
  //       // Handle errors if necessary
  //       console.error(error);
  //     }finally {
  //       // Set loading to false whether the request is successful or not
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [dataList]); 
  useEffect(() => {
    const fetchData = async () => {
      try {    
        let configList = await getConfigList();
        console.log('configList: ',configList);
        setDataList(configList);
      } catch (error) {
        // Handle errors if necessary
        console.error(error);
      } finally {
        // Set loading to false whether the request is successful or not
        setLoading(false);
      }
    };
  
    fetchData();
  }, []); // Removed dataList from the dependency array


  const handleDeleteClick = (row: Row) => {
    setShowModal(true);
    setSelectedRow(row);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  async function handleDeleteConfirmed(){   
    setLoading(true);
    const userInfoFormConfigBlob = process.env.NEXT_PUBLIC_USER_INFO_FORM_CONFIG_BLOB_NAME
    let _dataArray= [];
    let _updatedArray = [];
    setShowModal(false);

    var response = await fetch(`/api/blob/read?blobName=${userInfoFormConfigBlob}`);
    const result = await response.json();
    let jsonString = result.message;  
    jsonString = jsonString.replace(/^"|"$/g, "");  
    _dataArray = JSON.parse(jsonString);      
   
    for (let item of _dataArray) {
        if (selectedRow && item.id !== selectedRow.id) {
            _updatedArray.push(item);
        }
    }
    
    var tempResponse = await fetch(`/api/blob/write?blobName=${userInfoFormConfigBlob}&overwriteCase=true`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(_updatedArray),
    });   
    const  writeResponse: WriteResponse = await tempResponse.json();            
    if(writeResponse.message =='Store blob successfully'){
      setInputValue('')
      setInputPositionValue('')
      setIsRequired(false)
      setLoading(false)
    }
    let configList = await getConfigList();
    console.log('configList: ',configList);
    setDataList(configList);
  };
  interface Row {
    id: any;
    fieldName: string;
    position: number;
    isRequired: boolean;
  }
  

  const handleEditClick = (row: Row) => {    
    // Set the input values and state based on the properties of the 'row' object
    setInputValue(row.fieldName);
    setInputPositionValue(row.position.toString()); // Convert number to string
    setIsRequired(row.isRequired);
    setButtonText('Update');
    setSelectedRow(row); // This line causes the error
  };
  
  async function onSubmitClick(){     
    setLoading(true);   
    const userInfoFormConfigBlob = process.env.NEXT_PUBLIC_USER_INFO_FORM_CONFIG_BLOB_NAME
    let _dataArray =[];
    let _fieldNameError = false;
    let _positionNameError = false;
    let exitsFlag = false;

    if(inputValue == ''){
      _fieldNameError = true
    } 
    if (inputPositionValue === '' || parseFloat(inputPositionValue) <= 0) {
      _positionNameError = true
    }
    

    if(_fieldNameError == true || _positionNameError == true){
      setLoading(false);
      setNameFieldError(_fieldNameError ? 'Name Field Required':'')
      setPositionError(_positionNameError ? 'Position Required': '')
    }
    else{      
      setNameFieldError('')
      setPositionError('')
      if(buttonText.toLowerCase()=='add'){                
        let response = await fetch(`/api/blob/read?blobName=${userInfoFormConfigBlob}`);
        const result = await response.json();   
        let jsonString = result.message;    
        jsonString = jsonString.replace(/^"|"$/g, "");     
        _dataArray = JSON.parse(jsonString);        
        
        interface FormData {
          id: string;
          position: string;
          fieldName: string;
          isRequired: boolean;
          createdDate: number;
          createdBy: string;
          updatedDate: number;
          updatedBy: string;
          isActive: boolean;
        }

        const _obj: FormData = {
          id: Math.random().toString(36).substring(2) + Date.now().toString(36),
          position: inputPositionValue,
          fieldName: inputValue,
          isRequired: isRequired,
          createdDate: Date.now(),
          createdBy: '',
          updatedDate: Date.now(),
          updatedBy: '',
          isActive: true,
        };        

        let isValidReq:boolean = false;
        let isPositionExists:boolean = false;
        let isNameExists:boolean = false;
        
        for(let item of _dataArray){
          if(item.position == _obj.position){
            exitsFlag = true;
            isPositionExists = true;
            break
          }
        }
        if(isPositionExists){
          setPositionError('Position already exists');
          setLoading(false);
          return false;
        }

        for(let item of _dataArray){
          console.log('item.field_name: ',item);
          if(item.fieldName.toLowerCase() == _obj.fieldName.toLowerCase()){
            isNameExists = true;
            break
          }
        }
        if(isNameExists){
          setPositionError(t("page.admin.user_config.field_exists_validation"));
          setLoading(false);
          return false;
        }
        
        _dataArray.push(_obj);                     
        var tempResponse = await fetch(`/api/blob/write?blobName=${userInfoFormConfigBlob}&overwriteCase=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(_dataArray),
        });
        const  writeResponse: WriteResponse = await tempResponse.json();            
        if(writeResponse.message =='Store blob successfully'){
          setInputValue('')
          setInputPositionValue('')
          setIsRequired(false)
          exitsFlag=false;
          setLoading(false);

          let configList = await getConfigList();
          console.log('configList: ',configList);
          setDataList(configList);
        }

    }
      else{    
        let response = await fetch(`/api/blob/read?blobName=${userInfoFormConfigBlob}`);
        const result = await response.json();   
        let jsonString = result.message;    
        jsonString = jsonString.replace(/^"|"$/g, "");     
        _dataArray = JSON.parse(jsonString);
        let updatedArray = [];

        let isValidReq:boolean = false;
        let isPositionExists:boolean = false;
        let isNameExists:boolean = false;
        
        for(let item of _dataArray){
          if (selectedRow && item.id !== selectedRow.id) {
            if(item.position == inputPositionValue){
              isPositionExists = true;
              break
            }
          }
        }
        if(isPositionExists){
          setPositionError('Position already exists');
          setLoading(false);
          return false;
        }

        for(let item of _dataArray){
          console.log('item.field_name: ',item);
          if(item.fieldName.toLowerCase() == inputValue.toLowerCase()){
            isNameExists = true;
            break
          }
        }
        if(isNameExists){
          setPositionError(t("page.admin.user_config.field_exists_validation"));
          setLoading(false);
          return false;
        }

        for(let item of _dataArray){          
          if (selectedRow && item.id !== selectedRow.id) {
            if(item.position.toString() == inputPositionValue.toString()){
              exitsFlag = true
              break;
            }
          }        
        }            

        for(let item of _dataArray){
          if (selectedRow && item.id == selectedRow.id){
            item.fieldName = inputValue;
            item.position = inputPositionValue;
            item.isRequired = isRequired
            item.updatedBy = ''
            item.updatedDate = Date.now()
            updatedArray.push(item);
          }
          else{
            updatedArray.push(item);
          }
        }          
        var tempResponse = await fetch(`/api/blob/write?blobName=${userInfoFormConfigBlob}&overwriteCase=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedArray),
        });
        const  writeResponse: WriteResponse = await tempResponse.json();            
        if(writeResponse.message =='Store blob successfully'){
          setInputValue('')
          setInputPositionValue('')
          setIsRequired(false)
          setButtonText('Add')
          exitsFlag=false;
          setLoading(false)

          let configList = await getConfigList();
          console.log('configList: ',configList);
          setDataList(configList);
        }
      }
    }
  }

  const sortedDataList = [...dataList].sort((a, b) => {
      return parseInt(a.position) - parseInt(b.position);
  });
  return (
    <div>
      <Row>
        <Col lg="1"></Col>
        <Col lg="10">
        <Card>
          <CardTitle tag="h4" className="border-bottom p-3 mb-0">                    
          {t("page.admin.user_config.page_header")}
          </CardTitle>
          <CardBody>
          <h6 className="card-title">{t("page.admin.user_config.section_title1")}</h6>
          <Row>
              <Col lg="12">
                  <p className="mb-2 text-success card-subtitle">
                  {t("page.admin.user_config.other_text1")}<br/><br/>{t("page.admin.user_config.other_text2")}
                  </p>
              </Col>
          </Row>                    
          <br/>
          <Form>
              <FormGroup>
                  <Row>
                      <Col lg="3">
                        <Label for="field_name" className='tag_name_lbl'>{t("page.admin.user_config.input_1")}:</Label>
                      </Col>
                      <Col lg="9">
                        <input id="field_name" placeholder={t("page.admin.user_config.input_1_placeholder")} type="text"   value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="input-group input-group-sm mb-3"/>                                              
                        <p className='text-danger'>{nameFieldError}</p>
                      </Col>
                  </Row>  
                  <Row>
                      <Col lg="3"><Label for="field_position" className='tag_name_lbl'>{t("page.admin.user_config.input_2")}:</Label></Col>
                      <Col lg="6">
                        <input id="field_position" placeholder={t("page.admin.user_config.input_2_placeholder")} type="number"  className="input-group input-group-sm mb-3" value={inputPositionValue} onChange={(e) => setInputPositionValue(e.target.value)}/>
                        <p className='text-danger'>{positionError}</p>
                      </Col>
                      <Col lg="3" className='check_posotion'>
                          <FormGroup check>
                              <Label for="required_checkbox">{t("page.admin.user_config.input_3")}:</Label> <Input id='required_checkbox' type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)}/> 
                          </FormGroup>
                      </Col>
                  </Row>                                                      
              </FormGroup>       
                                                          
          </Form>          
          <button type="button" className={buttonText.toLowerCase()=='update' ? 'btn btn-warning btn-sm float-end' : 'btn btn-success btn-sm float-end'} onClick={onSubmitClick}> {buttonText.toLowerCase()=='update'? t("page.admin.user_config.update_text"):t("page.admin.user_config.add_text")}</button>     
          </CardBody>
        </Card>
        </Col>  
        <Col lg="1"></Col>               
      </Row>

      <Row>
        <Col lg="1"></Col>   
        <Col lg="10">   
        {loading? <Loader/>:(
                    <Card>
                    <CardBody>
                      <CardTitle tag="h5">{t("page.admin.user_config.section_title2")}</CardTitle>
                      <CardSubtitle className="mb-2 text-muted" tag="h6"></CardSubtitle>
                      <Row>                        
                        <Col lg="12">        
                          <div className="table-responsive">
                            <Table bordered hover>
                              <thead>
                                <tr className='text-center align-middle'>
                                  <td>{t("page.admin.user_config.th_position")}</td>
                                  <td>{t("page.admin.user_config.th_field_name")}</td>
                                  <td>{t("page.admin.user_config.th_type")}</td>
                                  <td>{t("page.admin.user_config.th_action")}</td>
                                  </tr>
                              </thead>
                              <tbody>
                                {sortedDataList.map((row:any, rowindex) => (     
                                  <tr className='text-center align-middle' key={rowindex}>
                                    <td>{row.position as never}</td>
                                    <td>{row.fieldName}</td>
                                    <td>{row.isRequired ? <h6><span className="badge bg-success">{t("page.admin.user_config.required_text")}</span></h6> : <h6><span className="badge bg-warning">{t("page.admin.user_config.not_required_text")}</span></h6>}</td>
                                    <td>
                                      <button type="button" className="btn btn-warning btn-sm tag-edit-btn" onClick={() => handleEditClick(row)}>{t("page.admin.user_config.edit_button")}</button>
                                      <span style={{ margin: "0 5px" }}></span> {/* Add space here */}
                                      <button type="button" className="btn btn-danger btn-sm tag-delete-btn" onClick={() => handleDeleteClick(row)}>{t("page.admin.user_config.delete_button")}</button>
                                      <DeleteConfirmModal
                                        showModal={showModal}
                                        handleClose={handleModalClose}
                                        handleDeleteConfirm={handleDeleteConfirmed}
                                        t={t}
                                      />
                                    </td>
                                  </tr>                                            
                                ))}  
                              </tbody>
                            </Table>                   
                          </div>          
                        </Col>                               
                      </Row>
                      <Row>    
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

export default AdminPersonalInfoFieldList;

let getConfigList = async ()=>{
  const userInfoFormConfigBlob = process.env.NEXT_PUBLIC_USER_INFO_FORM_CONFIG_BLOB_NAME;
  const response = await fetch(`/api/blob/read?blobName=${userInfoFormConfigBlob}`);
  const result = await response.json();   
  let jsonString = result.message;    
  jsonString = jsonString.replace(/^"|"$/g, "");     
  let _array = JSON.parse(jsonString);
  return _array;
}

//DELETE MODAL
interface DeleteConfirmModalProps {
  showModal: boolean;
  handleClose: () => void;
  handleDeleteConfirm: () => void;
  t:any;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ showModal, handleClose, handleDeleteConfirm,t }) => {
  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t("page.admin.user_config.delete_modal_header")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{t("page.admin.user_config.delete_modal_text")}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} className="btn btn-secondary">
        {t("page.admin.user_config.delete_modal_cancel_button")}
        </Button>
        <Button variant="danger" onClick={handleDeleteConfirm} className="btn btn-danger" id='delete_tag_btn'>
        {t("page.admin.user_config.delete_modal_delete_button")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};





