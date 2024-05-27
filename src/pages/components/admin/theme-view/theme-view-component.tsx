'use client'
import React, { useEffect,useState,ReactNode } from 'react';
import themeStyleCom from "./theme-view-component.module.scss"
import PaginatedItems from '../../common/pagination/paginate';
import { Paginations } from '../../common/common';

import { Card, Row, Col, CardTitle, CardBody,Modal } from 'reactstrap';
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'next-i18next';

type Props = {
    children: ReactNode;
};
type QuestionProps ={
    qIndex: number;
    onQuestionChange: (question: any) => void;
    question: any;
    selectedOptions: string[];
    t:any;
}
interface ParsedData  {
    [key: string]: { isActive: boolean };
};

function Question({ qIndex, onQuestionChange, question, selectedOptions,t }: QuestionProps) {
    // console.log('qIndex: ',qIndex);
    // console.log('onQuestionChange: ',onQuestionChange);
    // console.log('question: ',question);
    // console.log('selectedOptions: ',selectedOptions);
    // return false;

    const [title, setQuestionTitle] = useState(question.title);
    const [options, setOptions] = useState(question.options);

    useEffect(() => {
        setQuestionTitle(question.title);
        setOptions(question.options);
    }, [question]);

    useEffect(() => {
        question.title = title;
        question.options = options;
        onQuestionChange(question);
    }, [title, options]);

    return (
        <div className={`${themeStyleCom.question_container}`} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '10px', padding: '20px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
            <Row>
                <Col lg="12">
                    <div className="d-flex justify-content-between">
                        <h6 className="card-title text-success question_title" style={{ marginRight: '5px', textAlign: 'left' }}>
                        {t("page.admin.theme_view.question_text")}-{qIndex + 1}:
                        </h6>
                        <span
                            className={`input-group input-group-sm mb-3 ms-2 ${themeStyleCom['question_title_input']}`}
                            dangerouslySetInnerHTML={{ __html: title }}
                        ></span>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col lg="1">
                </Col>
                <Col lg="11">
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '3px' }}>                        
                        {options.map((option: string) => {
                            // Check if the current option belongs to the selected options for the current question
                            console.log('selectedOptionsFromThemeList: ',selectedOptions);
                            // return false;
                            const isOptionSelected = !!selectedOptions[title] && selectedOptions[title].includes(option);

                            return (
                                <label key={option} style={{ marginRight: '20px', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        className={`${themeStyleCom['common-input']} question_options`}
                                        name={title}
                                        value={option}
                                        checked={isOptionSelected}
                                        disabled={!isOptionSelected} // Make checkbox readonly if the option is selected
                                        style={{ marginRight: '5px' }}
                                    />
                                    <span style={{ borderRadius: '5px', padding: '2px', border: '0px solid #ccc' }}>{option}</span>
                                </label>
                            );
                        })}
                    </div>
                </Col>
            </Row>
        </div>
    );
}


let qTagName: string = '';
let isUpdateOrSave = false;

let allTagList: any[] = [];
interface ThemeData {
    [key: string]: {
        [key: string]: any;
    };
  }

const ThemeView = () => {
    const searchParams = useSearchParams();
    let userId:any = searchParams.get('userId') || ''; 
    let userWiseThemeId:any = searchParams.get('themeId') || '';    
    const { t } = useTranslation();
    const [questions, setQuestions] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(false);     
    const [tags, setAdminTagList] = useState<Array<any>>([]);    
    const [selectedTag, setSelectedTag] = useState<any>('');
    const [user_title, setUserTitle] = useState<any>();
    const [user_request, setUserRequest] = useState<any>();       
    const [themeDataFiltered, setThemeDataFiltered] = useState<ThemeData | null>(null);  
    
    const [selected_themeTag, setSelectedTagName] = useState<any>();
    const [selected_themeTitle, setSelectedTitle] = useState<any>();
    const [selected_themeRequest, setSelectedRequest] = useState<any>();
    const [selected_themeResponse,setThemeResponse] = useState<Array<any>>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {                    
                //LOAD USER THEME                
                const themesResponse = await ReadThemes(userId,userWiseThemeId);  
                const themesData: ThemeData = JSON.parse(themesResponse.message);  
                const filteredData = themesData[userId][userWiseThemeId] || null;                                
                
                let selectedThemeTag:any = filteredData.themeTag;
                let selectedThemeTitile:any = filteredData.themeTitle;                
                let selectedThemeRequest:any = filteredData.themeRequest;               

                setSelectedTagName (selectedThemeTag);
                setSelectedTitle (selectedThemeTitile);
                setSelectedRequest (selectedThemeRequest);

                let userThemeRes:any = filteredData.themeResponse;                
                setThemeResponse(userThemeRes);
                setThemeDataFiltered(filteredData);      

                const responseTagList:any[] = await ReadTags();      
                setAdminTagList(responseTagList);  
                
                const resQuestionnaire = await ReadQuestions(selectedThemeTag);
               
                if (typeof resQuestionnaire === 'string') { // Check if resQuestionnaire is a string
                    const dataObject = JSON.parse(resQuestionnaire);
                    const questionnaire = dataObject.questionnaire;                                

                    // Define the type of qBank explicitly
                    type Question = { id: number; title: string; options: string[] };
                    const qBank: Question[] = Object.entries(questionnaire).map(([title, options], id) => ({
                        id: id + 1,
                        title,
                        options: options as string[] // Explicitly define the type of options as string[]
                    }));
                    setQuestions(qBank);                        
                }
            } catch (error) {            
                console.error(error);
            }finally {           
            }
        };

        fetchData();
        
    }, [selected_themeTag]);
    
    const site_resource = ['https://b.hatena.ne.jp/','https://foodpanda.com/','https://lonelyplanet.com/','https://airbnb.com/','https://goodreads.com/','https://amazon.com/']            
    function handleQuestionChecked(question: { id: number; title: any; options: any; }){        
        let updatedQuestions = questions.map(q=>{
            if(q.id == question.id){
                return {...q, title:question.title, options: question.options}
            }
            return q
        })

        setQuestions(updatedQuestions)
    }

    //submit the theme and store in  blob storage
    function onSubmitTheme() {
        const themeTag = qTagName;    
        // Initialize an object to store the checked options grouped by question title
        const themeResponse:any = {};        
        const checkedCheckboxes = document.querySelectorAll('.question_options:checked');        
        checkedCheckboxes.forEach(checkbox => {            
            const questionTitle:any = checkbox.getAttribute('name');            
            const optionValue = (checkbox as HTMLInputElement).value;            
            if (themeResponse.hasOwnProperty(questionTitle)) {                
                themeResponse[questionTitle].push(optionValue);
            } else {                
                themeResponse[questionTitle] = [optionValue];
            }
        });                

        // Extract the values of the checked checkboxes
        const checkedSite = document.querySelectorAll('.site_name:checked');        
        const themeSite = 'https://b.hatena.ne.jp/';
        const themeTitle = user_title; 
        const themeRequest = user_request; 
        const currentDate = new Date().toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        // Create JSON object
        const themeData = {
            "sudiptosarker": {
                "theme1": {
                    "themeTag": themeTag,
                    "themeSite": themeSite,
                    "themeTitle": themeTitle,
                    "themeRequest": themeRequest,
                    "themeResponse": themeResponse,
                    "created_at": currentDate,
                    "updated_at": currentDate,
                    "deleted_at": "",
                    "isActive": true
                }
            }
        };

        let isSuccess = WriteThemes(themeData);    
    }
         
    async function handleTagChange(tag:any) {        
        qTagName = tag;     
        setSelectedTag(tag);                    
        const resQuestionnaire:any = await ReadQuestions(qTagName);
        
        let qBank:any = [];
    
        if (resQuestionnaire === null || resQuestionnaire === undefined || Object.keys(resQuestionnaire).length === 0) {               
            // If resQuestionnaire is empty, assign an empty array to qBank
            qBank = [];
        } else {
            // Extract the questionnaire object
            const dataObject = JSON.parse(resQuestionnaire);
            const questionnaire = dataObject.questionnaire;                        
    
            // Convert questionnaire object to qBank format
            qBank = Object.entries(questionnaire).map(([title, options], id) => ({
                id: id + 1,
                title,
                options
            }));
        }        
    
        setQuestions(qBank);
    };

     // Function to clear all fields
     const clearFields = () => {        
        setUserTitle('');
        setUserRequest('');
        setSelectedTag('');        
        setQuestions([]);
    };

    // Function to handle "Register New" button click
    const handleRegisterNewClick = () => {
        // Call the function to clear all fields
        clearFields();
    };
    // Function to handle input change
    const handleInputChange = (e:any) => {
        setUserTitle(e.target.value);
    };
    const handleRequestChange = (e:any) => {
        setUserRequest(e.target.value);
    };
    // console.log('questions: ',questions);
    // console.log('selected_themeResponse: ',selected_themeResponse);
    // return false;

    return(     
        <Card>
            <Row>
                <Col lg="1"></Col>   
                <Col lg="10">                                       
                    <CardBody className={`${themeStyleCom['card_body']}`}>
                        <CardTitle tag="h5" className="border-bottom p-3 mb-0">                    
                            {t("page.admin.theme_view.page_header")}
                        </CardTitle>
                        <CardTitle tag="h6" className={`border-bottom p-2 mb-0 ${themeStyleCom['secton_card_title']}`} style={{ backgroundColor: '#f0f0f0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>              
                            <label className="h5" id="tag_name">{t("page.admin.theme_view.section_header1")}</label>
                            <p className={`${themeStyleCom['tag_instruction']}`}>{t("page.admin.theme_view.other_text1")}</p>                                                             
                            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
                                {tags.map((tag: any) => (
                                    <label key={tag} style={{ marginRight: '20px', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            className={`${themeStyleCom['common-input']}`}
                                            type="radio"
                                            value={tag}
                                            checked={selected_themeTag === tag}
                                            disabled={true} // Disable all radio buttons
                                            style={{ marginRight: '5px', opacity: 1 }} // Set opacity for visual indication
                                        />
                                        <span className="radio-custom"></span>
                                        <span style={{ borderRadius: '5px', padding: '5px', border: '0px solid #ccc' }}>{tag}</span>
                                    </label>
                                ))}
                            </div>
                        </CardTitle>

                        {loading ? (
                            <Loader /> // Show Loader if loading is true
                        ) : (
                            <div className="row mt-2">
                                <div className="col-12 title_clear_form" style={{ marginTop: '1px' }}>
                                    <Row className="align-items-center">
                                        <Col lg="12">
                                        <div className="d-flex align-items-center">
                                            <label className="mb-0 me-2 fw-bold" style={{ textAlign: 'center' }}>{t("page.admin.theme_view.input_1")}:</label>
                                            <input
                                                type="text"
                                                className={`form-control title_input me-2 ${themeStyleCom['common-input']}`}
                                                style={{ height: '38px' }}
                                                value={selected_themeTitle}
                                                readOnly // Add the readOnly attribute
                                                onChange={handleInputChange} // Although readOnly prevents user input, you can keep onChange if you want to handle some changes
                                            />                                            
                                        </div>
                                        </Col>
                                    </Row>  
                                </div>
                                                                
                                {selected_themeTag ? (
                                    <div className="col-12" style={{ marginTop: '20px' }}>
                                        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                                            <h4>{t("page.admin.theme_view.section_header2")}</h4>
                                            <p className={`${themeStyleCom['question_sub_heading']}`}>{t("page.admin.theme_view.other_text2")}</p>
                                        </div>
                                        {questions.length > 0 ? (                                                        
                                            <PaginatedItems items={questions.map((_question, index) => <Question key={_question.id} qIndex={index} onQuestionChange={handleQuestionChecked} question={_question} selectedOptions={selected_themeResponse} t={t} />)} />                                            
                                        ) : (
                                            <div className="card border shadow-lg mx-auto mt-4" style={{ maxWidth: '800px' }}>
                                                <div className="card-body text-center">
                                                    <h6 className="card-text">{t("page.admin.theme_view.no_question")}</h6>
                                                </div>
                                            </div>                                        
                                        )}
                                    </div>
                                ) : (                                    
                                    <div className="card border shadow-lg mx-auto mt-4" style={{ maxWidth: '800px' }}>
                                        <div className="card-body text-center">
                                            <h6 className="card-text">{t("page.admin.theme_view.other_text3")}</h6>
                                        </div>
                                    </div>
                                )}

                                <div className="col-12 user_request" style={{ marginTop: '20px' }}>
                                    <Row className="align-items-center">
                                        <Col lg="2"><h6 className="mb-0">{t("page.admin.theme_view.other_text4")}:</h6></Col>   
                                        <Col lg="10">
                                            <div className="d-flex flex-column align-items-center">                                               
                                                <textarea
                                                    id="request"
                                                    className="form-control mt-2"
                                                    rows={3}
                                                    value={selected_themeRequest} // Assign selected_themeRequest to the value attribute
                                                    readOnly // Add the readOnly attribute
                                                    onChange={handleRequestChange} // Although readOnly prevents user input, you can keep onChange if you want to handle some changes
                                                ></textarea>
                                            </div>
                                        </Col>   
                                    </Row>  
                                </div>                                
                          
                            </div>
                        )}   
                                                                    
                    </CardBody>

                </Col>   
                <Col lg="1"></Col>   
            </Row>                                            
        </Card>
    )
};
export default ThemeView;

//********AZURE BLOB STORAGE SERVICE*********//
let blobName_Tags: string = '';
let allTags: any = [];

//READ ALL TAGS
async function ReadTags (){
    let filteredTagList: any[] =[];
    if(blobName_Tags == ''){
        blobName_Tags = process.env.NEXT_PUBLIC_ADMIN_TAG_BLOB_NAME || '';
    }     
    const response = await fetch(`/api/blob/read?blobName=${blobName_Tags}`);
    const result = await response.json();
    const jsonString = result.message;
    const parsedData: ParsedData = JSON.parse(jsonString);      
    //STORE THE RESPONSE INTO GLOBAL VARIABLE
    allTags = parsedData;    

    for(let tag in parsedData){
        let isActive = parsedData[tag].isActive;

        if(isActive){
            filteredTagList.push(tag);
        }
    }
    return filteredTagList;    
};

async function ReadThemes(userId:any,themeId:any){  
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
//READ TAG WISE QUESTIONS
async function ReadQuestions(qTagName: string){        
    
    try{       
        
        if(allTags == ''){                        
            blobName_Tags = process.env.NEXT_PUBLIC_ADMIN_TAG_BLOB_NAME || '';
            let response = await fetch(`/api/blob/read?blobName=${blobName_Tags}`) || [];
            const result = await response.json();            
            const jsonString = result.message;                  
            const parsedData = JSON.parse(jsonString); 
            allTags = parsedData;        
        }
                
        if (allTags && allTags[qTagName]) {
            const filteredRes = allTags[qTagName];

            const resJson = JSON.stringify(filteredRes, null, 2)                       
            return resJson ;
        }
        else{
            return [];
        }                      
    }catch(error:any){
        console.error("Error: ", error.message);
        return false
    }
}

//WRITE USER THEMES
async function WriteThemes(questionnaireJSON: { sudiptosarker: { theme1: { themeTag: string; themeSite: string; themeTitle: undefined; themeRequest: undefined; themeResponse: {}; created_at: string; updated_at: string; deleted_at: string; isActive: boolean; }; }; }){       
    try{
        let userThemeBlob = process.env.NEXT_PUBLIC_USER_THEME_BLOB_NAME   
        const response = await fetch(`/api/blob/write?blobName=${userThemeBlob}&overwriteCase=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionnaireJSON),
        });     
        alert('Blob Store successful');
    }catch(error){
        return false        
    }  finally {
        //setLoading(false); 
    }
}

//*****LOADER****/
const Loader = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img
        src="/images/scai/loader.gif"
        alt="Loading..."
        style={{ width: '22%', height: '10%', borderRadius: '20px' }} // Set the desired width and height for loader
        />
    </div>
);
