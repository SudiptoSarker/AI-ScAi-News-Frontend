'use client'
import React, { useEffect } from 'react';
import { useState } from "react";
import { Modal  } from 'react-bootstrap';
import { Card, Row, Col, CardTitle, CardBody, Button} from 'reactstrap';
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

import questionnaireStyles from "./questionnaire-component.module.scss";
import PaginatedItems from '../../common/pagination/paginate';
import { Loader } from '../../common/common';
import { useTranslation } from 'next-i18next';

type questionFunProp = {
    onQuestionChange: (question: any) => void;
    onQuestionRemove: (question: { id: string }) => void; 
    question: any;
    t:any;
}

function Question({onQuestionChange,onQuestionRemove,question,t } : questionFunProp){
    const[title,setTitle ] = useState(question.title)
    const[options,setOptions] = useState(question.options)
    
    //When option value is changed, set the updated option value into option array.
    function onOptionChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {     
        let previousOption = [...options];
        previousOption[index] = e.target.value;
        setOptions(previousOption);
    }

    //new option create and update the option array with the new option data. 
    function onGenerateNewOption(_question: any){
        let previousOption = [...options]
        previousOption.push('')
        setOptions(previousOption)
    }

    // remove question's option
    function onRemoveOption(index: any){        
        let previousOption = [...options];
        let itemIndex = previousOption.indexOf(index);        
        previousOption.splice(index,1);        
        if(previousOption.length >0){
            setOptions(previousOption);
        }        
    }

    //update the quesiton change effectt 
    useEffect(()=>{
        question.title = title
        question.options = []
        question.options = options
       onQuestionChange(question)
   },[title,options]);

   // delete question pop up/modal
   const [showModal, setShowModal] = useState(false);
   const handleDeleteClick = () => {                    
       setShowModal(true);
   };  
   const handleModalClose = () => {
       setShowModal(false);
   };
   const handleDeleteConfirmed = () => {           
       onQuestionRemove(question);        
       setShowModal(false);
   };   

    return(
        <div className="question_container">            
            <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: '5px', whiteSpace: 'nowrap' }}>
                <i className={`bi bi-trash text-danger ${questionnaireStyles['remove_icon']}`} onClick={() => handleDeleteClick()}></i>
                <h6 className={`${questionnaireStyles['card-title']} text-success mb-0`} style={{ marginLeft: '10px', marginRight: '10px' }}>
                    {t("page.admin.questionnaire.question_text")}:
                </h6>
                <input
                    className={`form-control form-control-sm ${questionnaireStyles['question_title_input']} ${questionnaireStyles['custome_input_field']}`}
                    type="text"
                    value={title}
                    name="name"
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ marginRight: '10px' }} // Add margin-right style to create space
                    placeholder='Enter the question.'
                />
                <i className={`bi bi-plus-circle text-success ${questionnaireStyles['create_option']}`} onClick={() => onGenerateNewOption(question)}></i>
            </div>            
            <div className={`${questionnaireStyles['option_container']}`}>
                <Row>
                    <Col lg="1">                        
                    </Col>
                    <Col lg="11">     
                    <div className="row">
                        {options.map((option:any, index:any) => (
                            <div key={index} className={`col-6 ${questionnaireStyles['option']}`} style={{ marginBottom: '1px' }}>
                                <div className="input-group" style={{ borderRadius: '7px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5px 0', lineHeight: '1.5' }}>
                                    <span className={`${questionnaireStyles['input-group-text']} ms-4`} style={{ textAlign: 'center', padding: '3px', marginRight: '5px', backgroundColor: 'rgba(209, 231, 240, 0.8)', color: '#000', borderRadius: '5px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}>Option-{index + 1}</span>
                                    <input
                                        className={`form-control form-control-sm ms-2 ${questionnaireStyles['input_element']} option_title ${questionnaireStyles['custome_input_field']}`}
                                        type="text"
                                        value={options[index]}
                                        onChange={(e) => onOptionChange(e, index)}
                                        style={{ borderRadius: '5px', marginBottom: '0px' }} // Added marginBottom
                                        placeholder='Enter the option.'
                                    />                                    
                                    <i className={`bi bi-dash-circle text-danger ${questionnaireStyles['remove_option']}`} style={{ backgroundColor: 'transparent' }} onClick={() => onRemoveOption(index)}></i>
                                </div>
                            </div>
                        ))}
                    </div>                                                                         
                    </Col>  
                </Row> 
                <DeleteConfirmModal
                    showModal={showModal}
                    handleClose={handleModalClose}
                    handleDelete={handleDeleteConfirmed}
                    t={t}   
                />
            </div>
        </div>
    );
}

let gTagName: string = '';
interface ParsedData  {
    [key: string]: { isActive: boolean };
};
interface Question {
    id: string;
    title: string;
    options: string[];
}
const AdminQuestionnaireGenerate = () => {
    const router = useRouter();    
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);     
    const searchParams = useSearchParams(); 
    gTagName = searchParams.get('tag') || '';    
    const { t } = useTranslation();
    let isGenerated: boolean;    
    const[isUpdate,setIsUpdate] = useState(false);

    useEffect(() => {
        setLoading(true);    
        const fetchData = async () => {
            try {
                const resQuestionnaire:any = await GetQuestionnaire(gTagName);
                console.log('resQuestionnaire: ',resQuestionnaire);
                const dataObject = JSON.parse(resQuestionnaire);                
                if (Object.keys(dataObject.questionnaire).length !== 0) {
                    isGenerated = true;
                    setIsUpdate(true);
                    // Extract the questionnaire object                    
                    const questionnaire = dataObject.questionnaire;                
                    const qBank:any = Object.entries(questionnaire).map(([title, options], id) => ({
                        id: id + 1,
                        title,
                        options
                    }));     
                    setQuestions(qBank);
                }
                else{
                    isGenerated = false;
                    setIsUpdate(false);
                }
            } 
            catch (error) {
                console.error(error);
            } 
        };

        fetchData().finally(() => setLoading(false));
    }, [gTagName]); 
    const [questionCount, setQuestionCount] = useState<number | undefined>(undefined);
    const [optCount, setOptCount] = useState<number | undefined>(undefined);
   
    const [questionCountError, setQuestionCountError] = useState<string>('');
    const [optCountError, setOptCountError] = useState<string>('');

    const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setQuestionCount(isNaN(value) || value <= 0 ? undefined : value); // Set to undefined if value is NaN or <= 0
        setQuestionCountError('');
    };
    
    const handleOptCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (value >= 2) {
            // Update the state or perform any other necessary actions
            setOptCount(value);
        } else {
            // If the input value is less than 2, set it to 2
            setOptCount(2);
        }
        //setOptCount(isNaN(value) || value <= 0 ? undefined : value); // Set to undefined if value is NaN or <= 0
        setOptCountError('');
    }

    async function handleGenerateQuestion() {               
        const qCount = questionCount ;
        const oCount = optCount;
        if (!qCount || !oCount) {
            if (!questionCount) {
                setQuestionCountError('Question count required!');
            }
            if (!optCount) {
                setOptCountError('Option count required!');
            }
            return false;
        }

        setLoading(true);
        try {    
            let url = process.env.NEXT_PUBLIC_API_URL;           
            let response = await fetch(`https://scai-news-test2.azurewebsites.net/api/get_questions?tag_name=${gTagName}&count=${qCount}&opt_count=${oCount}`);                     
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const filteredRes = data[gTagName];
            const resJson = JSON.stringify(filteredRes, null, 2)
            
            // Extract the questionnaire object
            const dataObject = JSON.parse(resJson);
            const questionnaire = dataObject.questionnaire;
            
            const qBank:any = Object.entries(questionnaire).map(([title, options], id) => ({
                id: id + 1,
                title,
                options
            }));     
            setQuestions(qBank)             
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false); 
        }
    }

    //Create question button click event
    function handleCreateQuestion(){
        const qCount = questionCount ;
        const oCount = optCount;
        if (!qCount || !oCount) {
            // Set error messages if counts are not provided
            if (!questionCount) {
                setQuestionCountError('Question count required!');
            }
            if (!optCount) {
                setOptCountError('Option count required!');
            }
            return false;
        }        
        let newQuestionsArray = [];

        for (let i = 0; i < questionCount; i++) {
            let options = Array(optCount).fill('');
            
            let newQuestion = {
                id: Math.random().toString(36).substring(2) + Date.now().toString(36),            
                title: '',            
                options: options            
            };

            newQuestionsArray.push(newQuestion);
        }

        // Update the state once with all the new questions
        setQuestions([...newQuestionsArray, ...questions]);      
    }
    
    function handleQuestionChange(question: Question) {
        const updatedQuestions: Question[] = questions.map((q: Question) => {
            if (q.id === question.id) {
                return { ...q, title: question.title, options: question.options };
            }
            return q;
        });
    
        setQuestions(updatedQuestions);
    }  

    //submit or update questionnaire button click event  
    const handleSubmitQuestions = (isGenerated:boolean) => {         
        let isValidReq:boolean = validateQuestions(questions);
        if(isValidReq){
            setLoading(true);    
            const updatedQuestions: { id: string; title: string; options: string[] }[] = questions.map((question: any) => ({
                id: question.id,
                title: question.title,
                options: question.options,
            }));                
            const questionnaireJSON = generateQuestionnaireData(gTagName);
            const responseJson = JSON.stringify(questionnaireJSON, null, 2);
            const isWriteBlob = GenerateTags(questionnaireJSON, setLoading,isGenerated);
               
            router.replace('/admin/tags');   
        }                
    }

    const validateQuestions = (questions: Question[]) => {
        for (const category in questions) {
            const questionTitle = questions[category].title;
            const optionArray = questions[category].options;
            if (questionTitle.trim() === '') {
                alert(`Enter question title.`);
                return false;
            }            
            console.log('optionArray: ',optionArray);
            if (!optionArray.every(item => item.trim() !== "")) {
                alert("Enter option.");
                return false;
            }           
        }
        return true;
    };

    //question delete click event
    function onQuestionRemove(question: { id: string }) {     
        if(questions.length >1){
            setQuestions(questions.filter(q => q.id.toString() !== question.id.toString())); 
        }
        else{
            alert("Please do not delete all the questions!");
        }                  
    }
  
    const generateQuestionnaireData = (gTagName: string) => {        
        const currentDate = new Date().toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        interface Questionnaire {
            [key: string]: any;
        }
        
        const responseData: {
            [key: string]: {
                created_at: string;
                updated_at: string;
                isActive: boolean;
                questionnaire: Questionnaire; // Define a type for the questionnaire property
            };
        } = {
            [`${gTagName}`]: {
                created_at: currentDate,
                updated_at: currentDate,
                isActive: true,
                questionnaire: {}, // Initialize questionnaire as an empty object
            },
        };
        
        type questionForEachProp = {
            title: string;
            options: any;
        }
        questions.forEach((question: questionForEachProp) => {
            responseData[gTagName].questionnaire[question.title] = question.options;            
        });                    
        return responseData;
    };

    return(   
        <>
        {!gTagName ? (               
            <Card>
            <CardTitle tag="h5" className="border-bottom p-3 mb-0">                    
            {t("page.admin.questionnaire.section_header")}
            </CardTitle> 
            <CardBody>   
                <p className="text-danger">{t("page.admin.questionnaire.invalid_url")}</p>                 
            </CardBody>
        </Card>
        ) : (
            <Card>
                <CardTitle tag="h5" className="border-bottom p-3 mb-0">                    
                    {t("page.admin.questionnaire.section_header")}
                </CardTitle> 
                <CardTitle tag="h6" className="border-bottom p-2 mb-0">                   
                    <div className="text-muted mb-0" style={{ fontSize: '0.9rem', fontFamily: 'Yu Gothic' }}>
                        <p style={{ fontWeight: 'bold' }}>Instructions:</p>
                        <p style={{ fontSize: '0.7rem', fontFamily: 'Yu Gothic', color: '#6c757d' }}>
                            <span style={{ color: '#3366cc', fontWeight: 'bold' }}>{t("page.admin.questionnaire.text_1")}</span><br />                            
                       
                            <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{t("page.admin.questionnaire.text_2")}</span><br />                            
                       
                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>{t("page.admin.questionnaire.text_3")}</span><br />                            
                        </p>
                    </div>

                </CardTitle>                        
                <CardTitle tag="h6" className="border-bottom p-2 mb-0">
                    <div className={`d-flex justify-content-end align-items-center ${questionnaireStyles.header_container}`}>
                        <div className="me-auto">
                            <label className="h5 me-2" id={questionnaireStyles.tag_name}>{gTagName}</label>
                        </div>

                        <div className="d-flex align-items-center">
                            <div className="d-flex flex-column position-relative">
                                <input 
                                    className={`form-control form-control-sm ${questionnaireStyles.generate_textbox} ${questionnaireStyles.custome_input_field} ${questionnaireStyles.smaller_input} ${questionnaireStyles.custom_smaller_input}`} 
                                    type="number" 
                                    id="option_count" 
                                    value={optCount}
                                    onChange={handleOptCountChange}
                                    placeholder={t("page.admin.questionnaire.option_count_placeholder")}
                                    style={{ width: '130px', opacity: 0.8 }} // Set width and opacity inline
                                    min="2" // Set minimum value to 2
                                />
                                {/* Display option count error message */}
                                {optCountError && <div className="text-danger" style={{ fontSize: '10px' }}>{optCountError}</div>}     
                            </div>
                            <div className="d-flex flex-column position-relative" style={{ marginLeft: '10px' }}> {/* Added marginLeft */}
                                <input 
                                    className={`form-control form-control-sm me-2 ${questionnaireStyles.generate_textbox} ${questionnaireStyles.custome_input_field} ${questionnaireStyles.smaller_input} ${questionnaireStyles.custom_smaller_input}`} 
                                    type="number" 
                                    id="question_no"   
                                    value={questionCount}
                                    onChange={handleQuestionCountChange}             
                                    placeholder={t("page.admin.questionnaire.question_count_placeholder")}
                                    style={{ width: '130px', opacity: 0.8 }} // Set width and opacity inline
                                    min="1" // Set minimum value to 1
                                />        
                                {/* Display question count error message */}
                                {questionCountError && <div className="text-danger" style={{ fontSize: '10px' }}>{questionCountError}</div>} {/* Added inline style */}
                            </div>
                            <button type="button" className='btn btn-primary btn-sm me-2' style={{ width: '120px' }} onClick={handleGenerateQuestion}><i className="bi bi-arrow-clockwise"></i> {t("page.admin.questionnaire.generate_button")}</button>                                    
                            <button type="button" className='btn btn-primary btn-sm me-2' style={{ width: '120px' }} onClick={handleCreateQuestion}><i className="bi bi-plus"></i> {t("page.admin.questionnaire.create_button")}</button>
                        </div>

                    </div>
                </CardTitle>
                <CardBody>
                    <div className="row mt-2">
                        <div className="col-12">
                            {loading ? (
                                <Loader />
                            ) : (
                                questions.length > 0 ? (
                                    <PaginatedItems items={questions.map((_question: any, index: number) => (
                                        <Question
                                            key={_question.id}
                                            onQuestionChange={handleQuestionChange}
                                            onQuestionRemove={onQuestionRemove}
                                            question={_question}
                                            t={t}
                                        />
                                    ))} />
                                ) : (
                                    <h6>{t("page.admin.questionnaire.no_question")}</h6>
                                )
                            )}
                        </div>
                        <div className="offset-11 col-1 mt-2 d-flex justify-content-end">
                            {questions.length > 0 && (                                
                                <button
                                    type="button"
                                    className='btn btn-success btn-sm'
                                    onClick={() => handleSubmitQuestions(isGenerated)}
                                    style={{
                                        borderRadius: '5px',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                        fontWeight: 'normal',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0px',
                                        minWidth: 'auto',
                                        flex: '0 0 auto',
                                    }}
                                >
                                    {isUpdate ? t("page.admin.questionnaire.update_text") : t("page.admin.questionnaire.save_text")}
                                </button>
                            )}
                        </div>

                    </div>
                </CardBody>
            </Card>
        )}
        </>
    )
}

type delModalProp= {
    showModal: boolean;
    handleClose: () => void;
    handleDelete: () => void;
    t:any;
}

//DELETE MODAL FOR QUESTIONNAIRE
function DeleteConfirmModal ({ showModal, handleClose, handleDelete,t }:delModalProp){
    return (
        <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{t("page.admin.questionnaire.delete_modal_text_1")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{t("page.admin.questionnaire.delete_modal_text_2")}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} className='btn btn-secondary'>
                    {t("page.admin.questionnaire.cancel_button_text")}
                </Button>
                <Button variant="danger" onClick={handleDelete} className="btn btn-danger">
                    {t("page.admin.questionnaire.delete_button_text")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AdminQuestionnaireGenerate;

//********AZURE BLOB STORAGE SERVICE*********//
interface QuestionnaireJSON {
    [key: string]: any; // this is the structure of questionnaire JSON data
}
let allTagsWithQuestions: QuestionnaireJSON = {};

//read the questionnaire from blob storage 
async function GetQuestionnaire(gTagName: string){    
    try{        
        const adminTagBlob = process.env.NEXT_PUBLIC_ADMIN_TAG_BLOB_NAME
        const response = await fetch(`/api/blob/read?blobName=${adminTagBlob}`);
        const result = await response.json();
        const jsonString = result.message;        
        const parsedData: ParsedData = JSON.parse(jsonString);                    
        allTagsWithQuestions = parsedData;

        if (parsedData && parsedData[gTagName]) {
            const filteredRes = parsedData[gTagName];

            const resJson = JSON.stringify(filteredRes, null, 2)
            return resJson ;
        }else{
            return [];
        }                 
    }catch(error:any){
        console.error("Error: ", error.message);
        return false
    }
}

//GENERATE QUESTIONS FOR TAGS
async function GenerateTags(questionnaireJSON: { [x: string]: any; },setLoading: { (value: React.SetStateAction<boolean>): void; (arg0: boolean): void; },isGenerated:boolean){        
    allTagsWithQuestions[gTagName] = questionnaireJSON[gTagName];       
    
    try{
        const adminTagBlob = process.env.NEXT_PUBLIC_ADMIN_TAG_BLOB_NAME     
        const response = await fetch(`/api/blob/write?blobName=${adminTagBlob}&overwriteCase=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(allTagsWithQuestions),
        });   
        if(isGenerated)  {
            alert('Update Successfully');
        }else{
            alert('Save Successfully');
        }        
    }catch(error){
        return false        
    }  finally {
        setLoading(false); 
    }
}