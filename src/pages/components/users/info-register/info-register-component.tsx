'use client'
import { useEffect, useState } from "react"
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next';

let profileObject: any = {}

let _array: (string | any)[] = [];
let getUserconfigData = async () => {    
    let _settingsArray = [];
    const userInfoFormConfigBlob = process.env.NEXT_PUBLIC_USER_INFO_FORM_CONFIG_BLOB_NAME
    let response = await fetch(`/api/blob/read?blobName=${userInfoFormConfigBlob}`, { cache: 'no-store' });    
    let _data = await response.json();
    
    _array = JSON.parse(_data.message);   
    if (_array.length > 0) {
        for (let item of _array) {
            _settingsArray.push(item.fieldName)
            profileObject[item.fieldName] = ''
        }
    }
    
    return _settingsArray;
}
// loader
const Loader = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img
            src="/images/scai/loader.gif"
            alt="Loading..."
            style={{ width: '22%', height: '10%', borderRadius: '20px' }} // Set the desired width and height for loader
        />
    </div>
);

export default function InfoRegister() {
    const router = useRouter();
    const [profile, setProfile] = useState(profileObject)
    const [inputFields, setInputFields] = useState<Array<any>>([])
    // State to manage the read-only status
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState<any>('');
    const { t } = useTranslation();
    useEffect(() => {
        setUserId(localStorage.getItem('userid'));
    
        const fetchData = async () => {
            try {
                let configData = await getUserconfigData();
                console.log('configData: ',configData);

                setInputFields(configData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    
    }, []); // This effect runs only once after the initial render
    
    useEffect(() => {
        const getUserProfileData = async () => {
            const userProfileBlob = process.env.NEXT_PUBLIC_USER_BLOB_NAME;
            let response = await fetch(`/api/blob/read?blobName=${userProfileBlob}`, { cache: 'no-store' });
            let _data = await response.json();
            if (_data.message.length > 0) {
                const data = JSON.parse(_data.message);
                if (data.hasOwnProperty(userId)) {
                    const personalInfo = data[userId].personalInfo;
                    setProfile(personalInfo);
                }
            }
        };
        
        getUserProfileData();
    }, [userId]); // This effect runs whenever userId changes      
    

    function formateUserData(userInfo: any) {
        let formattedData: any = {};
        let user: any = {}
        let _id: any = '';

        _id = userId;
        user.personalInfo = userInfo;
        user.isActive = true;
        user.createdBy = 'user';
        user.createdDate = Date.now();
        user.updatedBy = '';
        user.updatedDate = '';
        formattedData[_id] = user;

        return formattedData;
    }
    
    
    // Define an interface for validation status
    interface ValidationStatus {
        [fieldName: string]: boolean | undefined; // Keys are field names, values indicate validation status
    }

    // Define validationStatus state using the interface
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>({});
    const handleValidation = (fieldName: any, value: string,isRequired:boolean) => {        
        const isValid = value.trim() !== '' || !isRequired; // Check if the field is not empty unless it's not required
        
        setValidationStatus(prevState => ({
            ...prevState,
            [fieldName]: isValid
        }));
    };
    
    const [isFormValid, setIsFormValid] = useState(false);
    useEffect(() => {
        const isValid = Object.values(validationStatus).every(status => status !== false);
        setIsFormValid(isValid);       
        // setValidationStatus(prevState => ({
        //     ...prevState,
        //     [fieldName]: isValid
        // }));
        // _array.map((field, index) => {
        //     console.log('testing-33');
        //     //const inputClassName = field.isRequired ? 'form-control required' : 'form-control';
        //     const inputClassName = field.isRequired ? 'required' : '';
        //     console.log('inputClassName',inputClassName)
        //     console.log('profile[field.fieldName]',profile[field.fieldName])
        //     let isValidField = true;
        //     if(inputClassName == 'required'){
        //         if(profile[field.fieldName] == ''){
        //             isValidField = false;
        //             setValidationStatus(prevState => ({
        //                 ...prevState,
        //                 [field.fieldName]: isValidField
        //             }));
        //         }
        //     }
        // })

    }, [validationStatus]);

    

    async function handleSubmit(event: any) {
        //alert(`${x} is required.`);         
        //console.log('validationStatus: ',validationStatus);
        

        event.preventDefault();
        // if (isFormValid){
        //     const userInfoBlob = process.env.NEXT_PUBLIC_USER_BLOB_NAME;
        //     const formData = new FormData(event.target);
        //     let _personalInfoObj: any = {}
        //     for (let x of inputFields) {
        //         _personalInfoObj[x] = formData.get(x)
        //         if (_personalInfoObj[x] === '' && inputFields.find(field => field.fieldName === x)?.isRequired) {
        //             // If the field is required and empty, show an error message and return false
        //             alert(`${x} is required.`);
        //             return false;
        //         }
        //     }
    
        //     let userData = formateUserData(_personalInfoObj);
    
        //     let response = await fetch(`/api/blob/read?blobName=${userInfoBlob}`, { cache: 'no-store' });
            
        //     if (response.ok == true) {
        //         let _data = await response.json();
        //         let users_information = JSON.parse(_data.message);            
    
        //         if (users_information.hasOwnProperty(userId)) {
        //             // when update
        //             let updatedData = users_information[userId].personalInfo = _personalInfoObj;               
        //             const response = await fetch(`/api/blob/write?blobName=${userInfoBlob}&overwriteCase=true`, {
        //                 method: 'POST',
        //                 headers: {
        //                     'Content-Type': 'application/json',
        //                 },
        //                 body: JSON.stringify(users_information),
        //             });
    
        //             if(response.ok){
        //                 router.push('/users/theme_registration');
        //             }
        //         }
        //         else {
        //             // when insert
        //             let storeData = Object.assign(users_information, userData);
        //             const response = await fetch(`/api/blob/write?blobName=${userInfoBlob}&overwriteCase=true`, {
        //                 method: 'POST',
        //                 headers: {
        //                     'Content-Type': 'application/json',
        //                 },
        //                 body: JSON.stringify(storeData),
        //             });
    
        //             if(response.ok){
        //                 router.push('/users/theme_registration');
        //             }
        //         }
        //     }
        //     else {
        //         // if blob does not exists
    
        //         const response = await fetch(`/api/blob/write?blobName=${userInfoBlob}`, {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //             },
        //             body: JSON.stringify(userData),
        //         });
    
    
        //         if (response.ok) {
        //         }
        //     }
        // }        
    }
    return (
        <>
            <div className="row">
                <div className="col-1"></div>
                <div className="col-10">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="admin_personal_form_title">{t("page.users.info_register.info_register_section_header")}</h4>                            
                            <form className="row" onSubmit={(event) => handleSubmit(event)} id="user_info_form">
                                {                                    
                                    _array.map((field, index) => {
                                        //const inputClassName = field.isRequired ? 'form-control required' : 'form-control';
                                        const inputClassName = field.isRequired ? 'required' : '';                                        
                                        let isValidField = true;
                                        if(inputClassName == 'required'){
                                            if(profile[field.fieldName] == ''){
                                                isValidField = false;
                                                // setValidationStatus(prevState => ({
                                                //     ...prevState,
                                                //     [field.fieldName]: false
                                                // }));
                                            }
                                        }
                                        // console.log('field.fieldName',field.fieldName)
                                        // console.log('profile',profile[field.fieldName])
                                        // const isValid = value.trim() !== '' || !isRequired;        
                                        // setValidationStatus(prevState => ({
                                        //     ...prevState,
                                        //     [fieldName]: isValid
                                        // }));

                                        
                                        return (                                            
                                            <div className="col-6 mb-3" key={index}>
                                                <label htmlFor={field.fieldName} className="form-label">
                                                    {field.fieldName}
                                                    {field.isRequired && <span style={{ color: 'red' }}> **</span>}
                                                </label>
                                                <input 
                                                    type="text" 
                                                    className={`form-control ${inputClassName} ${validationStatus[field.fieldName] === false ? 'is-invalid' : ''}`} // Apply 'is-invalid' class if validation fails
                                                    id={field.fieldName} 
                                                    placeholder={'enter ' + field.fieldName} 
                                                    name={field.fieldName} 
                                                    defaultValue={profile[field.fieldName]} 
                                                    onBlur={(e) => handleValidation(field.fieldName, e.target.value,field.isRequired)} // Validate on blur
                                                />
                                                {validationStatus[field.fieldName] === false && <div className="invalid-feedback">This field is required</div>} {/* Show validation message if validation fails */}
                                            </div>
                                        )
                                    })
                                }
                                {/* <div className="offset-10 col-2 d-flex justify-content-end">
                                    <button type="button" className="btn btn-success btn-sm">{t("page.users.info_register.save_button_text")}</button>                                    
                                </div> */}
                                <div className="offset-10 col-2 d-flex justify-content-end">
                                    <button type="submit" className="btn btn-success btn-sm">{t("page.users.info_register.save_button_text")}</button>                                    
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-1"></div>
            </div>
        </>
    );
}
