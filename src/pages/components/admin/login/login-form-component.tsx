import React, { cloneElement, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, CardTitle, CardBody, Button, Form, FormGroup, Label, Input,     } from 'reactstrap';
import { notFound, useRouter } from 'next/navigation'
import styles from './login-component.module.scss';
import _common from '../../../styles/common.module.scss'

//ADMIN LOGIN FORM - LOGIN FORM CONTAINS TWO INPUT FIELDS, USER NAME AND PASSWORD AND A BUTTON TO SUBMIT THE INFORMATION TO THE BACKEND
function LoginForm(){        
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    //LOGIN BUTTON CLICK EVENT - AFTER LOGIN API WILL BE CALLED FROM THE EVENT
    const adminLogin_event = () => {            
        if (username.trim() === ''){
            alert("enter user name!")
            return false;            
        }  
        if (password.trim() === ''){
            alert("enter password!")
            return false;            
        }        
       
        // Authenticate Admin
        authUser(username, password).then((checkAdmin) => {
            if(checkAdmin){
                localStorage.setItem("auth", "abcdefg");
                router.push('/admin/user-lists');
            }else{
                alert("enter valid user and password")
            }
        }).catch((error)=>{
            console.error(error);
            alert("Invalid user and password")
        })
    };

    return (
        <div className={styles['admin-login-from']}>
            <div className={styles['login-from-container']}>
                <div className={styles['login-card']}>
                    <Card className={_common.card_body} style={{border:'none'}}>
                        <CardTitle tag="h5" className="border-bottom p-3 mb-0">                    
                            Admin Portal: Login
                        </CardTitle>
                        <CardBody>
                            <Form>
                                <FormGroup>                                        
                                    <Row >                                        
                                        <Col lg="12" className={styles['input-container']}>
                                            <label htmlFor="username" className={styles['custom-label']}>User Name:</label>
                                            <input type="text" id="username" className={styles['custom-input']} placeholder='enter user name' value={username} onChange={(e) => setUsername(e.target.value)} />
                                        </Col>                                        
                                    </Row>  
                                    <Row>                                        
                                        <Col lg="12" className={styles['input-container']}>
                                            <label htmlFor="password" className={styles['custom-label']}>Password:</label>
                                            <input type="password" id="password" className={styles['custom-input']} placeholder='enter password' value={password} onChange={(e) => setPassword(e.target.value)} />
                                        </Col>                                        
                                    </Row> 
                                    <Row>                                        
                                        <Col lg="12">   
                                            <button type="button" onClick={adminLogin_event} className={styles.admin_login_btn}>Login</button>
                                        </Col>                                        
                                    </Row>                                            
                                </FormGroup>                                                                                        
                            </Form>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

async function authUser(userName: string, password: string) {
    try {
        const adminLoginBlob = process.env.NEXT_PUBLIC_ADMIN_AUTH_BLOB_NAME;

        // Send request to BLOB API
        let response = await fetchApi();
        if (response != null) {
            const credentials = response.data;
            // Authentication check
            if (credentials.hasOwnProperty(userName) && credentials[userName] === password) {
                return true;
            }
        }
        return false;
    } catch (error:any) {
        console.error("Error: ", error.message);
        return false;
    }
}

async function fetchApi (){
    const adminLoginBlob = process.env.NEXT_PUBLIC_ADMIN_AUTH_BLOB_NAME
    let reqObject = {
        blobName:adminLoginBlob
    };
    const response = await fetch(`/api/blob/read?blobName=${adminLoginBlob}`);
    const result = await response.json();
    return result;

};

export default LoginForm;