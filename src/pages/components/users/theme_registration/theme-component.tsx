'use client'
import React, { useEffect,useState,ReactNode } from 'react';
import themeStyleCom from "./theme-component.module.scss"
import { useRouter } from 'next/navigation'

import { Card, Row, Col, CardTitle, CardBody,Modal } from 'reactstrap';
import { useSearchParams } from 'next/navigation'
import { Loader,Paginations } from '../../common/common';
import { useTranslation } from 'next-i18next';

const DEFAULT_ITEMS_PER_PAGE = 5;
const MAX_VISIBLE_PAGES = 4;


interface ParsedData  {
    [key: string]: { isActive: boolean };
};

let checkedQuestionsOptions: { [key: string]: string[] } = {};
type AllSelectedOptions = { [key: string]: string[] };
const initialSelectedOptions: AllSelectedOptions = {};
let allSelectedQuestionOptions: AllSelectedOptions = initialSelectedOptions;

type QuestionProps ={
    qIndex: number;
    onQuestionChange: (question: any) => void;
    question: any;
    selectedOptionsFromThemeList: AllSelectedOptions;
    checkedOptions: any;
    handleCheckboxChange:any;
    isRegisterNew:boolean;
    t:any;
}

let isUpdateOrSave = false;
interface ThemeData {
    [key: string]: {
        [key: string]: any;
    };
}

//****QUESTION COMPONENT TO GENERATE QUESTIONS AND OPTIONS*****/
function Question({ qIndex, onQuestionChange, question, selectedOptionsFromThemeList,checkedOptions,handleCheckboxChange,isRegisterNew,t }: QuestionProps) {
    const[title,setQuestionTitle ] = useState(question.title)
    const[options,setOptions] = useState(question.options)

    useEffect(() => {
        setQuestionTitle(question.title);
        setOptions(question.options);
    }, [question]);

    //update the quesiton change effectt 
    useEffect(()=>{
        question.title = title
        question.options = []
        question.options = options
       onQuestionChange(question)
   },[title,options]);

   const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
   const [alreadySelectedOptions, setAlreadySSelectedOptions] = useState<string[]>([]);      
    
   
  
    const handleOptionChange = (option: string,title:string) => {
        if (title in allSelectedQuestionOptions) {
            // Check if the option exists for the given title
            if (allSelectedQuestionOptions[title].includes(option)) {
                // Remove the option
                allSelectedQuestionOptions[title] = allSelectedQuestionOptions[title].filter((opt: string) => opt !== option);
                // If no options left, remove the title as well
                if (allSelectedQuestionOptions[title].length === 0) {
                    delete allSelectedQuestionOptions[title];
                }
            } else {
                // Option does not exist, add the option
                allSelectedQuestionOptions[title].push(option);
            }
        } else {
            // Title does not exist, add the title and option
            allSelectedQuestionOptions[title] = [option];
        }

        // // Initialize checkedQuestionsOptions if it's not already initialized
        if (!checkedQuestionsOptions) {
            checkedQuestionsOptions = {};
        }
        // Check if the title already exists in the checkedQuestionsOptions
        if (checkedQuestionsOptions.hasOwnProperty(title)) {
            // Check if the option is already selected for the given title
            const optionsForTitle = checkedQuestionsOptions[title];
            const optionIndex = optionsForTitle.indexOf(option);
            if (optionIndex !== -1) {
                // If the option is already selected, remove it
                optionsForTitle.splice(optionIndex, 1);
            } else {
                // If the option is not selected, add it
                optionsForTitle.push(option);
            }
        } else {
            // If the title doesn't exist in checkedQuestionsOptions, add it with the option
            checkedQuestionsOptions[title] = [option];
        }    
        // Check if the option is already selected
        const isOptionSelected = selectedOptions.includes(option);       

        // If the option is already selected, remove it
        if (isOptionSelected) {
            setSelectedOptions(selectedOptions.filter(item => item !== option));
        } else {
            // If the option is not selected, add it to selectedOptions
            setSelectedOptions([...selectedOptions, option]);
        }                

    };
    
    return(
        <div className={`${themeStyleCom.question_container}`} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '10px', padding: '20px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
             <Row>
                <Col lg="12">                                                            
                    <div className="d-flex justify-content-between">    
                        <h6 className="card-title text-success question_title" style={{ marginRight: '5px', textAlign: 'left' }}>
                            {t("page.users.theme_registration.question_text")}-{qIndex+1}:                
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
                            const isOptionAlreadyChecked = !!allSelectedQuestionOptions[title] && allSelectedQuestionOptions[title].includes(option);                            
                            return (                            
                                <label key={option} style={{ marginRight: '20px', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        className={`${themeStyleCom['common-input']} question_options`}
                                        name={title}
                                        value={option}
                                        // checked={isOptionOnchnageChecked || isOptionAlreadyChecked}
                                        // checked={selectedOptions.includes(option) || isOptionAlreadyChecked}
                                        checked={isOptionAlreadyChecked}
                                        onChange={() => handleOptionChange(option,title)} 
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

const ThemeRegister = () => {
    const router = useRouter();   
    const [questions, setQuestions] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(false); 
    const [tags, setAdminTagList] = useState<Array<any>>([]);
    const [user_title, setUserTitle] = useState<any>();
    const [user_request, setUserRequest] = useState<any>();       
    const { t } = useTranslation();
    const [userId, setUserId] = useState<any> ();
    const [userRole, setUserRole] = useState<any> ();
    const searchParams = useSearchParams();
    const [qTagName,setTagFromList] = useState('');    
    const [selected_themeTag, setSelectedTagName] = useState<any>();        
    const [selected_themeResponse, setThemeResponse] = useState<AllSelectedOptions>(initialSelectedOptions);
    const[isRegisterNew, setRegisterNew] = useState(false);
    
    let userWiseThemeId:any = searchParams.get('themeId') || '';     
    
    if(userWiseThemeId !==''){
        isUpdateOrSave = true;
    }
    else{
        isUpdateOrSave = false;
    }        

    // Define the fetchData function
    const fetchData = async (user_Id: string, userWiseThemeId: string) => {
        try {
        setLoading(true);
        setRegisterNew(false);

        if (isUpdateOrSave) {
            // LOAD USER THEME
            const themesResponse: ThemeData = await ReadThemes();
            const filteredData = themesResponse[user_Id][userWiseThemeId] || null;
            const selectedThemeTag = filteredData.themeTag;
            const selectedThemeTitle = filteredData.themeTitle;
            const selectedThemeRequest = filteredData.themeRequest;

            setSelectedTagName(selectedThemeTag);
            setTagFromList(selectedThemeTag);
            setUserTitle(selectedThemeTitle);
            setUserRequest(selectedThemeRequest);
            setThemeResponse(filteredData.themeResponse);
            console.log('filteredData.themeResponse: ',filteredData.themeResponse);
            const responseTagList: any[] = await ReadTags();
            setAdminTagList(responseTagList);

            const resQuestionnaire = await ReadQuestions(selectedThemeTag);

            if (typeof resQuestionnaire === 'string') {
            const dataObject = JSON.parse(resQuestionnaire);
            const questionnaire = dataObject.questionnaire;

            // Define the type of qBank explicitly
            type Question = { id: number; title: string; options: string[] };
            const qBank: Question[] = Object.entries(questionnaire).map(([title, options], id) => ({
                id: id + 1,
                title,
                options: options as string[]
            }));
            setQuestions(qBank);
            }
        } else {
            setTagFromList('');
            setSelectedTagName('');
            setUserTitle('');
            setUserRequest('');
            setThemeResponse({});

            const responseTagList: any[] = await ReadTags();
            setAdminTagList(responseTagList);
        }
        } catch (error) {
        console.error(error);
        } finally {
        setLoading(false);
        }
    };
  
    useEffect(() => {
        let user_Id = '';
        let user_role = '';
        if (typeof window !== 'undefined') {
          user_Id = localStorage.getItem('userid') || '';
          user_role = localStorage.getItem('role') || '';
    
          setUserId(user_Id);
          setUserRole(user_role);
        }
    
        if (user_Id) {
          fetchData(user_Id, userWiseThemeId);
        }
      }, [selected_themeTag, isUpdateOrSave, userWiseThemeId]); 
    
    allSelectedQuestionOptions = selected_themeResponse;
    //let tagName = 'Food';
    const site_resource = ['https://b.hatena.ne.jp/','https://foodpanda.com/','https://lonelyplanet.com/','https://airbnb.com/','https://goodreads.com/','https://amazon.com/']        
    //question change
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
        // Gather data from state and input fields
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
        //const themeSite = Array.from(checkedSite).map(checkbox => checkbox.value);        
        const themeSite = 'https://b.hatena.ne.jp/';
        const themeTitle = user_title; 
        const themeRequest = user_request; 
        const currentDate = new Date().toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const randomNumber1 = Math.floor(Math.random() * 1000);   
        let themeData={};                     
        if(isUpdateOrSave){
            //Update theme 
            themeData = {
                [userId]: {
                    [`${userWiseThemeId}`]: {
                        "themeTag": themeTag,
                        "themeSite": themeSite,
                        "themeTitle": themeTitle,
                        "themeRequest": themeRequest,
                        "themeResponse": allSelectedQuestionOptions,
                        "created_at": currentDate,
                        "updated_at": currentDate,
                        "deleted_at": "",
                        "isActive": true
                    }
                }
            }; 
        }else{
            // Create JSON object
            themeData = {
                [userId]: {
                    [`theme${randomNumber1}`]: {
                        "themeTag": themeTag,
                        "themeSite": themeSite,
                        "themeTitle": themeTitle,
                        "themeRequest": themeRequest,
                        "themeResponse": allSelectedQuestionOptions,
                        "created_at": currentDate,
                        "updated_at": currentDate,
                        "deleted_at": "",
                        "isActive": true
                    }
                }
            };   
        }
     
        // Now you have your themeData ready, you can use it as needed          
        let isSuccess = WriteThemes(userId,themeData,isUpdateOrSave,userWiseThemeId,{ t });  
        if(isUpdateOrSave){
            alert(`${t("page.users.theme_registration.update_alert")}`);
        }else{
            alert(`${t("page.users.theme_registration.save_alert")}`);
        } 
          // creating log for creating theme.
        fetchApi().then(function (data) {
            let _date = new Date();
            let timeStamp = _date.getFullYear() + '-' + _date.getMonth() + '-' + _date.getDate() + ' ' + _date.getHours() + ':' + _date.getMinutes() + ':' + _date.getSeconds();
            if (data == null) {
                let csvArray = [
                    ['userid', 'userrole', 'themetitle', 'feedtitle', 'activity', 'timestamp'],
                    [userId, userRole, themeTitle, '', 'create_theme', timeStamp]
                ];
                let csvContent = "";

                csvArray.forEach(function (rowArray) {
                    let row = rowArray.join(",");
                    csvContent += row + "\r\n";
                });               
            }
            else {
                let csvContent = "";
                let _mainArray = [];

                if (data.length > 0) {
                    let temp_array = data.split('\n');

                    if (temp_array.length > 0) {
                        temp_array.forEach(function (ra: any) {
                            let _subArray = ra.split(",");
                            _mainArray.push(_subArray);
                        });
                        _mainArray.push([userId, userRole, themeTitle, '', 'create_theme', timeStamp]);
                    }

                }
                else {
                    _mainArray = [
                        ['userid', 'userrole', 'themetitle', 'feedtitle', 'activity', 'timestamp'],
                        [userId, userRole, themeTitle, '', 'create_theme', timeStamp]
                    ];

                }

                _mainArray.forEach(function (rowArray) {
                    let row = rowArray.join(",");
                    csvContent += row + "\n";
                });

                fetch(`/api/write_csv?blobName=userActivity.csv&overwriteCase=true`, {
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
            }
        });
        router.push('/users/profile');
    }
       
    async function handleTagChange(tag:any) {  
        setCurrentPage(0);
        // qTagName = tag;    
        setTagFromList(tag);        
        // const resQuestionnaire:any = await ReadQuestions(qTagName);        
        const resQuestionnaire:any = await ReadQuestions(tag);        
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

    // REGISTER NEW: REFRESH THE PAGE
    const handleRegisterNewClick = () => {
        setUserTitle('');
        setUserRequest('');        
        setQuestions([]);
        setTagFromList('');
        if(isUpdateOrSave){
            router.push(`/users/theme_registration`);
        }
    };

    // Function to handle input change
    const handleInputChange = (e:any) => {
        setUserTitle(e.target.value);
    };
    const handleRequestChange = (e:any) => {
        setUserRequest(e.target.value);
    };

    //PAGINATION START
    const [currentPage, setCurrentPage] = useState(0); 
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = questions.slice(startIndex, endIndex);

    const totalPages = Math.ceil(questions.length / itemsPerPage);

    const handlePageChange = (selectedPage:any) => {
        setCurrentPage(selectedPage.selected);
    };

    const handleItemsPerPageChange = (event:any) => {
        const selectedItemsPerPage = parseInt(event.target.value, 10);
        setItemsPerPage(selectedItemsPerPage);
        setCurrentPage(0); // Reset to the first page when changing items per page
    };
    //PAGINATION END

    const [checkedOptions, setCheckedOptions] = useState<{ [key: string]: string[] }>({});
    const handleCheckboxChange = (questionTitle: string, optionValue: string) => {       
        setCheckedOptions(prevState => ({
            ...prevState,
            [questionTitle]: prevState[questionTitle]
                ? prevState[questionTitle].includes(optionValue)
                    ? prevState[questionTitle].filter(option => option !== optionValue)
                    : [...prevState[questionTitle], optionValue]
                : [optionValue]
        }));
    };
    return(     
        <Card>
            <Row>
                <Col lg="1"></Col>   
                <Col lg="10">
                    <CardTitle tag="h5" className="border-bottom p-3 mb-0">                    
                        {t("page.users.theme_registration.page_header_text")}
                    </CardTitle>   
                    <CardTitle tag="h6" className="border-bottom p-2 mb-0">                   
                        <span style={{ color: '#28a745', fontWeight: 'bold',fontSize: '0.7rem', fontFamily: 'Yu Gothic' }}>{t("page.users.theme_registration.instruction_for_tag")}</span>                          
                    </CardTitle>    
                    {loading ? (
                            <Loader /> // Show Loader if loading is true
                        ) : (                                              
                        <>
                        <CardTitle tag="h6" className={`border-bottom p-2 mb-0 ${themeStyleCom['secton_card_title']}`} style={{ backgroundColor: '#f0f0f0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                            <label className="h5" id="tag_name">{t("page.users.theme_registration.section_header_text")}</label>
                            <p className={`${themeStyleCom['tag_instruction']}`}>{t("page.users.theme_registration.section_header_small_text")}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
                                {tags.map((tag: any) => (
                                    <label key={tag} style={{ marginRight: '20px', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>

                                        <input
                                            className={`${themeStyleCom['common-input']}`}
                                            type="radio"
                                            value={tag}
                                            checked={qTagName === tag}
                                            onChange={() => handleTagChange(tag)}
                                            style={{ marginRight: '5px' }} />
                                        <span className="radio-custom"></span>
                                        <span style={{ borderRadius: '5px', padding: '5px', border: '0px solid #ccc' }}>{tag}</span>

                                    </label>
                                ))}
                            </div>
                        </CardTitle><CardBody className={`${themeStyleCom['card_body']}`}>
                            <div className="row mt-2">
                                <div className="col-12 title_clear_form" style={{ marginTop: '1px' }}>
                                    <Row className="align-items-center">
                                        <Col lg="12">
                                            <div className="d-flex align-items-center">
                                                <label className="mb-0 me-2 fw-bold" style={{ textAlign: 'center' }}>{t("page.users.theme_registration.input_label")}:</label>
                                                <input type="text" className={`form-control title_input me-2 ${themeStyleCom['common-input']}`} style={{ height: '38px' }} value={user_title} onChange={handleInputChange} />
                                                <button className="btn btn-success clear_form_btn" style={{ height: '38px' }} onClick={handleRegisterNewClick}>{t("page.users.theme_registration.button_text")}</button>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>

                                {qTagName ? (
                                    <div className="col-12" style={{ marginTop: '20px' }}>
                                        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                                            <h4>{t("page.users.theme_registration.other_header")}</h4>
                                            <p className={`${themeStyleCom['question_sub_heading']}`}>{t(("page.users.theme_registration.other_text"))}</p>
                                        </div>
                                        {currentItems.length > 0 ? (
                                            <>
                                                {currentItems.map((_question, index) => (
                                                    // <Question
                                                    //     key={startIndex + index} // Use startIndex + index as the key
                                                    //     qIndex={startIndex + index} // Use startIndex + index as the serial number
                                                    //     onQuestionChange={handleQuestionChecked}
                                                    //     question={_question}
                                                    //     selectedOptionsFromThemeList={selected_themeResponse}
                                                    //     t={t}
                                                    // />
                                                    <Question
                                                        key={startIndex + index}
                                                        qIndex={startIndex + index}
                                                        onQuestionChange={handleQuestionChecked}
                                                        question={_question}
                                                        selectedOptionsFromThemeList={selected_themeResponse}
                                                        checkedOptions={checkedOptions[_question.title] || []}
                                                        handleCheckboxChange={handleCheckboxChange} // Pass handleCheckboxChange as prop
                                                        isRegisterNew={isRegisterNew}
                                                        t={t} />
                                                ))}
                                                <Paginations
                                                    currentItems={currentItems}
                                                    itemsPerPage={itemsPerPage}
                                                    handleItemsPerPageChange={handleItemsPerPageChange}
                                                    handlePageChange={handlePageChange}
                                                    totalPages={totalPages}
                                                    MAX_VISIBLE_PAGES={MAX_VISIBLE_PAGES} />
                                            </>
                                        ) : (
                                            <div className="card border shadow-lg mx-auto mt-4" style={{ maxWidth: '800px' }}>
                                                <div className="card-body text-center">
                                                    <h6 className="card-text">{t("page.users.theme_registration.no_question")}</h6>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                ) : (
                                    <div className="card border shadow-lg mx-auto mt-4" style={{ maxWidth: '800px' }}>
                                        <div className="card-body text-center">
                                            <h6 className="card-text">{t("page.users.theme_registration.display_message")}</h6>
                                        </div>
                                    </div>
                                )}
                                <div className="col-12 user_request" style={{ marginTop: '20px' }}>
                                    <Row className="align-items-center">
                                        <Col lg="2"><h6 className="mb-0">{t("page.users.theme_registration.request_label")}:</h6></Col>
                                        <Col lg="10">
                                            <div className="d-flex flex-column align-items-center">
                                                <label htmlFor="request" className={`mb-0 text-success text-center ${themeStyleCom['request_instruction']}`}>
                                                    {t("page.users.theme_registration.missed_message")}
                                                </label>
                                                <textarea id="request" className="form-control mt-2" rows={3} value={user_request} onChange={handleRequestChange}></textarea>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>

                                <div className="offset-11 col-1" style={{ marginTop: '20px' }}>
                                    {questions.length > 0 && (
                                        <button
                                            type="button"
                                            className='btn btn-success btn-sm float-end'
                                            onClick={onSubmitTheme}
                                        >
                                            {isUpdateOrSave ? t("page.users.theme_registration.update_text") : t("page.users.theme_registration.save_text")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </CardBody></>
                    )} 
                </Col>   
                <Col lg="1"></Col>   
            </Row>                                            
        </Card>
    )
};
export default ThemeRegister;

async function fetchApi() {
    const response = await fetch(`/api/read_csv?blobName=userActivity.csv`);
    const result = await response.json();
    const data = await result.message;
    return data;
}

//********AZURE BLOB STORAGE SERVICE*********//
let blobName_Tags: string = '';
let allTags: any = [];

//READ ALL TAGS
async function ReadTags (){
    let filteredTagList: any[] =[];
    if(blobName_Tags == ''){
        blobName_Tags = process.env.NEXT_PUBLIC_ADMIN_TAG_BLOB_NAME || '';
        //blobName_Tags = process.env.NEXT_PUBLIC_USER_THEME_BLOB_NAME || '';
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
async function WriteThemes(userId:any,questionnaireJSON: { [x: number]: { [x: string]: { themeTag: string; themeSite: string; themeTitle: any; themeRequest: any; themeResponse: any; created_at: string; updated_at: string; deleted_at: string; isActive: boolean; }; }; },isThemeUpdate:boolean,userWiseThemeId:string,{ t }:any){               
    let allThemeRes:any = await ReadThemes();
                     
    if(isThemeUpdate){        
        if (allThemeRes[userId] && allThemeRes[userId][userWiseThemeId]) {
            // Update the theme response values
            allThemeRes[userId][userWiseThemeId].themeTag = questionnaireJSON[userId][userWiseThemeId].themeTag;
            allThemeRes[userId][userWiseThemeId].themeSite = questionnaireJSON[userId][userWiseThemeId].themeSite;
            allThemeRes[userId][userWiseThemeId].themeTitle = questionnaireJSON[userId][userWiseThemeId].themeTitle;
            allThemeRes[userId][userWiseThemeId].themeRequest = questionnaireJSON[userId][userWiseThemeId].themeRequest;

            allThemeRes[userId][userWiseThemeId].themeResponse = questionnaireJSON[userId][userWiseThemeId].themeResponse;
            allThemeRes[userId][userWiseThemeId].updated_at = questionnaireJSON[userId][userWiseThemeId].updated_at;
            allThemeRes[userId][userWiseThemeId].isActive = questionnaireJSON[userId][userWiseThemeId].isActive;
        }
    }else{
        if (allThemeRes.hasOwnProperty(userId)) {        
            // Merge the existing themes with the new theme from 'questionnaireJSON'
            allThemeRes[userId] = {
                ...allThemeRes[userId], // Keep the existing themes
                ...questionnaireJSON[userId] // Add the new theme
            };
        }else {
            // Add the entire response from 'questionnaireJSON' into 'allThemeRes'
            allThemeRes[userId] = questionnaireJSON[userId];
        }
    }    

    try{                       
        let userThemeBlob = process.env.NEXT_PUBLIC_USER_THEME_BLOB_NAME   
        const response = await fetch(`/api/blob/write?blobName=${userThemeBlob}&overwriteCase=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(allThemeRes),
        });   
        // if(isThemeUpdate){
        //     alert(`${t("page.users.theme_registration.update_alert")}`);
        // }else{
        //     alert(`${t("page.users.theme_registration.save_alert")}`);
        // }        
    }catch(error){
        return false        
    }  finally {
        //setLoading(false); 
    }
}
//READ ALL THEMES
async function ReadThemes (){
    let filteredTagList: any[] =[];
    let userThemeBlob = process.env.NEXT_PUBLIC_USER_THEME_BLOB_NAME || '';

    const response = await fetch(`/api/blob/read?blobName=${userThemeBlob}`);    
    const result = await response.json();
    const jsonString = result.message;
    const parsedData: ParsedData = JSON.parse(jsonString);    
    return parsedData;              
};