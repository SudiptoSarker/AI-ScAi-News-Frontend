'use-clent'

import { useState,useEffect } from 'react';
import { Table, Modal } from 'react-bootstrap';
import { Card, Row, Col, CardTitle, CardBody, Button, Label, Input, FormText,CardSubtitle } from 'reactstrap';
import { useRouter } from 'next/navigation'

import tagRegisterStyles from "./tags-component.module.scss"

import _common from '../../../styles/common.module.scss';
import { Loader,Paginations } from '../../common/common';
import { useTranslation } from 'next-i18next';

//DEFAULT ITEM FOR PER PAGE ROW
const DEFAULT_ITEMS_PER_PAGE = 5;
const MAX_VISIBLE_PAGES = 4; // Maximum number of visible page numbers


//DELETE MODAL
interface DeleteConfirmModalProps {
  showModal: boolean;
  handleClose: () => void;
  handleDelete: () => void;
  t:any;
}
const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ showModal, handleClose, handleDelete,t }) => {
  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t("page.admin.tags.delete_modal_header")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{t("page.admin.tags.delete_modal_text_1")}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} className="btn btn-secondary">
          {t("page.admin.tags.delete_modal_cancel_button_text")}
        </Button>
        <Button variant="danger" onClick={handleDelete} className="btn btn-danger" id='delete_tag_btn'>
          {t("page.admin.tags.delete_modal_delete_button_text")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const TagRegister = () => {   
  const [validationError, setValidationError] = useState(''); 
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [editText, setEditText] = useState('');
  const [deleteText, setDeleteText] = useState('');
  const [isDeleteTag, setIsDeleteTag] = useState(false);
  const { t } = useTranslation();

  //*******Testing:start********//
  const [adminTagList, setAdminTagList] = useState<Array<any>>([]);
  let data: Array<any> = [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseTagList:any = await ReadTags();
        setAdminTagList(responseTagList);        
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
 
  //PAGINATION START
  const [currentPage, setCurrentPage] = useState(0); 
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  type TagItem ={
    TagName: string;
    Questionnaire: string;    
  }
  data = adminTagList;
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
  //PAGINATION END
  const [isTagEditable, setIsTagsEditable] = useState(false);

  const [inputValue, setInputValue] = useState('');

  const handleAddTags = (action:any) => { 
    if (action === 'add') {
      if (!inputValue.trim()) {
        setValidationError(t("page.admin.tags.add_validation"));
      } else {
        setValidationError(''); // Reset validation error when input is not empty
        const fetchData = async () => {
          try {  
            setLoading(true);             
            const responseTagList:any = await WriteTagIntoBlob(inputValue,setValidationError,setSuccessMessage,action,editText,t);            
            const updatedResponseTagList:any = await ReadTags();
            setAdminTagList(updatedResponseTagList);            
            if (responseTagList.success) {             
            }

          } catch (error) {
            console.error(error);
          }finally {
            setInputValue('');
            setLoading(false);
          }
        };
    
        fetchData();
      }
    } else {
      setIsTagsEditable(false);    
      setInputValue('');
      setSuccessMessage('');
      if (!inputValue.trim()) {
        setValidationError('Enter a tag name!');
      } else {
        setValidationError(''); // Reset validation error when input is not empty
        const fetchData = async () => {
          try {  
            setLoading(true);  
            const responseTagList:any = await WriteTagIntoBlob(inputValue,setValidationError,setSuccessMessage,action,editText,t);
            const updatedResponseTagList:any = await ReadTags();
            setAdminTagList(updatedResponseTagList);           
          } catch (error) {
            console.error(error);
          }finally {
            setLoading(false);
          }
        };
    
        fetchData();
      }
    }    
  };
  
  const handleEditClick = (id:any, text:any) => {    
     setEditText(text);
     setInputValue(text);
    setIsTagsEditable(true);    
  };

  const router = useRouter();
  const handleNotGeneratedTagsClick = (text: string, isGenerated: boolean) => {
    router.push(`/admin/questionnaire?tag=${text}&generated=${isGenerated}`);          
  };

  //DELETE MODAL: START  
  const [showModal, setShowModal] = useState(false);  
  const handleDeleteClick = (id:any, text:any) => {    
    setIsDeleteTag(true);
    setDeleteText(text);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleDeleteConfirmed = () => { 
    setValidationError(''); 
    const fetchData = async () => {
      try {  
        setLoading(true);  
        const responseTagList:any = await WriteTagIntoBlob(deleteText,setValidationError,setSuccessMessage,isDeleteTag,deleteText,t);
        const updatedResponseTagList:any = await ReadTags();
        setAdminTagList(updatedResponseTagList);
        setIsTagsEditable(false);    
        setInputValue('');
        setSuccessMessage('');        
        setCurrentPage(0);
      } catch (error) {
        console.error(error);
      }finally {
        setLoading(false);
      }
    };
    fetchData();
    setShowModal(false);
  };

  //DELETE MODAL: END   
  const handleUndo = () => {
      setEditText('');
      setInputValue('');   
      setSuccessMessage('');  
      setValidationError(''); 
      setIsTagsEditable(false);    
  };

  return (
    <div className={`${_common.card_body}`}>
      <Row>
            <Col lg="1"></Col>
            <Col lg="10">
                <Card>
                    <CardTitle tag="h5" className="border-bottom p-3 mb-0">                    
                        {t("page.admin.tags.page_header")}
                    </CardTitle>
                    <CardBody>
                    <h5 className="card-title">
                    {t("page.admin.tags.section_header1")}
                    </h5>
                    <br/>
                    <Row>                               
                        <Col lg="2"><Label for="tagNameInput" className='tag_name_lbl'>{t("page.admin.tags.field_1")}:</Label></Col>
                        <Col lg="10">                          
                          <input id='tagNameInput' name="tag_name" placeholder={t("page.admin.tags.placeholder")} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="input-group input-group-sm mb-3" />

                          {validationError && (
                            <div className="text-danger">
                              {validationError}
                            </div>
                          )}
                          {successMessage && (
                            <div className="text-success">
                              {successMessage}
                            </div>
                          )}
                        </Col>                        
                    </Row>                    
                    <br/>                    
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm me-2" 
                            onClick={() => handleUndo()}
                        >
                            {t("page.admin.tags.undo_button")}
                        </button>

                        <button
                            type="button"
                            className={isTagEditable ? 'btn btn-warning btn-sm me-2' : 'btn btn-success btn-sm me-2'}
                            onClick={() => handleAddTags(isTagEditable ? 'edit' : 'add')}
                        >
                            {isTagEditable ? t("page.admin.tags.update_button_text") : t("page.admin.tags.add_button_text")}
                        </button>
                    </div>
                    </CardBody>
                </Card>
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
              <CardTitle tag="h5">{t("page.admin.tags.section_header2")}</CardTitle>
              <CardSubtitle className="mb-2 text-muted" tag="h6"></CardSubtitle>
              <Row>                        
                <Col lg="12">        
                  <div className="table-responsive">                   
                    <Table bordered hover>
                      <thead>                    
                        <tr className='text-center align-middle'>                          
                            <th>{t("page.admin.tags.th_id")}</th>
                            <th>{t("page.admin.tags.th_tag_name")}</th>
                            <th>{t("page.admin.tags.th_questionnaire")}</th>
                            <th>{t("page.admin.tags.th_actions")}</th>         
                        </tr>
                      </thead>
                      <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td className="text-center">No tags available</td>
                        </tr>
                      ) : (
                        currentItems.map((tag: any, index: number) => (
                          <tr key={startIndex + index} className='text-center align-middle'>
                            <td>{startIndex + index + 1}</td>
                            <td>{tag['TagName']}</td>
                            <td>
                              {tag && tag.Questionnaire === 'Generated' ? (
                                <h6><span style={{cursor:'pointer'}} className="badge bg-success" onClick={() => handleNotGeneratedTagsClick(tag['TagName'], true)}>{t("page.admin.tags.generated")}</span></h6>
                              ) : (
                                <h6><span style={{cursor:'pointer'}} className="badge bg-danger" onClick={() => handleNotGeneratedTagsClick(tag['TagName'], false)}>{t("page.admin.tags.not_generated")}</span></h6>
                              )}
                            </td>
                            <td className='action_btn'>
                              <button type="button" className={`btn btn-warning btn-sm tag_edit_btn`} onClick={() => handleEditClick(startIndex + index + 1, tag['TagName'])}>
                              {t("page.admin.tags.edit_button")}
                              </button>
                              <button type="button" className={`btn btn-danger btn-sm ${tagRegisterStyles.tag_delete_btn}`} onClick={() => handleDeleteClick(startIndex + index + 1, tag['TagName'])}>{t("page.admin.tags.delete_button")}</button>
                              <DeleteConfirmModal
                                showModal={showModal}
                                handleClose={handleModalClose}
                                handleDelete={handleDeleteConfirmed}
                                t={t}
                              />
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

export default TagRegister;

//********AZURE BLOB STORAGE SERVICE*********//
let blobName_Tags: string = '';
interface Questionnaire {
  [question: string]: string[];
}
interface Country {
  created_at: string;
  updated_at: string;
  isActive: boolean;
  questionnaire: Questionnaire;
}
interface JsonObject {
  [country: string]: Country;
}

function filterByIsActiveTrue(jsonObject: JsonObject): JsonObject {
  const filteredObject: JsonObject = {};
  for (const country in jsonObject) {
      if (jsonObject[country].isActive) {
          filteredObject[country] = jsonObject[country];
      }
  }
  return filteredObject;
}

let dataArray: any[] =[];
async function ReadTags(){
  try{
    if(blobName_Tags == ''){
      blobName_Tags = process.env.NEXT_PUBLIC_ADMIN_TAG_BLOB_NAME || '';
    }     
    const response = await fetch(`/api/blob/read?blobName=${blobName_Tags}`);
    const result = await response.json();   
    let jsonString = result.message;    
    jsonString = jsonString.replace(/^"|"$/g, "");     
    const jsonObject = JSON.parse(jsonString);
    const filterJson = filterByIsActiveTrue(jsonObject);

    dataArray = Object.keys(filterJson).map((tagName) => ({
      TagName: tagName,
      Questionnaire: Object.keys(filterJson[tagName].questionnaire).length > 0 ? 'Generated' : 'Not Generated',
    }));

    return dataArray;
  }catch(error:any){
      console.error("Error: ", error.message);
      return false;
  }
}

async function WriteTagIntoBlob(tag_name:any,setValidationError:any,setSuccessMessage:any,action:any,editText:any,t:any){  
  try{ 
    let existingTagName ='';

    const updateOrAddTag = (json:any, tagName:any) => {                    
      const tagNameLower = tagName.toLowerCase();
      existingTagName = Object.keys(json).find(key => key.toLowerCase() === tagNameLower) || '';
      if(existingTagName === ''){
        existingTagName = tagName;
      }
      const existingTag = json[existingTagName]; 

      if(action === true ){      
        const isUpdateTag = json[editText];        
        
        const updatedJson = {
          ...json,
          [`${existingTagName}`]: {
            created_at: new Date(isUpdateTag.created_at).toLocaleDateString(),
            updated_at: new Date().toLocaleDateString(),
            isActive: false,
            questionnaire: isUpdateTag.questionnaire
          }
        };                 
        return { json: updatedJson, isNew: true }; 
      }
      else{           
        if (existingTag) {          
          // Tag already exists, update the name and set updated_at
          const updatedJson = {
            ...json,
            [existingTagName]: {
              ...existingTag,
              created_at: new Date(existingTag.created_at).toLocaleDateString(),
              updated_at: new Date().toLocaleDateString(),
              isActive: true 
  
            }
          };   

          return { json: updatedJson, isNew: false };
        } 
        else {         
          //check for update tags
          const isUpdateTag = json[editText];                    
          if (isUpdateTag){            
            const updatedJson = {
              ...json,
              [`${existingTagName}`]: {
                created_at: new Date(isUpdateTag.created_at).toLocaleDateString(),
                updated_at: new Date().toLocaleDateString(),
                isActive: true,
                questionnaire: isUpdateTag.questionnaire
              }              
            };            
            delete updatedJson[editText]; // Remove the old tag name
            return { json: updatedJson, isNew: true };
          }else{
            // Tag doesn't exist, create a new tag
            const newTag = {
              [`${existingTagName}`]: {
                created_at: new Date().toLocaleDateString(),
                updated_at: "",
                isActive: true,
                questionnaire: {                 
                }
              }
            };
            const updatedJson = { ...json, ...newTag };
            return { json: updatedJson, isNew: true };
          }        
        }        
      }
    };
      
    //WRITE TAG LIST INTO BLOB STORAGE
    const adminTagBlob:any = process.env.NEXT_PUBLIC_ADMIN_TAG_BLOB_NAME
    
    const response = await fetch(`/api/blob/read?blobName=${adminTagBlob}`);
    const result = await response.json();   
    let jsonString = result.message;    
    jsonString = jsonString.replace(/^"|"$/g, "");            

    if (jsonString !== ""){      
      const parsedData = JSON.parse(jsonString);                      
      const { json: updatedRes, isNew } = updateOrAddTag(parsedData, tag_name);       
      
      let isActiveFalse = true;  

      if(!isNew){
        isActiveFalse = parsedData[existingTagName]["isActive"];
      }

      if (!isNew && isActiveFalse) {              
        // Tag already exists, show validation error
        setSuccessMessage('');
        setValidationError(t("page.admin.tags.tag_exists_validation"));
      } else {     
        setValidationError('');                       
        const response = await fetch(`/api/blob/write?blobName=${adminTagBlob}&overwriteCase=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedRes),
        });     
        setSuccessMessage(t("page.admin.tags.success_msg"));        
      }
    }else{
      const { json: updatedRes, isNew } = updateOrAddTag([], tag_name);
      setValidationError('');      
      setSuccessMessage(t("page.admin.tags.success_msg"));
    }    
    return false;

  }catch(error:any){
      console.error("Error: ", error.message);
      return false
  }
}  