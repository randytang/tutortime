import { NavigationContainer } from "@react-navigation/native";
import { Alert } from "react-native"
import * as SecureStore from 'expo-secure-store';
//import App from "../App";

//api end point where login attempt is made
//should be stored as an evironment variable to keep our
//api end point out of view
const apiPrefix = 'http://www.fancybearstutoring.com/get-a-token/' 
//'http://127.0.0.1:8000/get-a-token/' 

export default async ({
    username,
    password
    }) => {

    const uri =`${apiPrefix}`;

    const loginRequest = {
        method : 'POST',
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({username : `${username}`, password: `${password}`})
    };

    try{
        const res = await fetch(uri, loginRequest);

        const response = await res.json();
        console.log(response);

        if(response.token){
            try{
                StoreToken("token" , response.token);
                StoreToken("user-id", String(response.user_id));
                StoreToken("email", response.email);
                return response;
            }
            catch(exception){
                console.log("oops");
                return false;
            }
        }
    }catch(exception){
        console.log("something went wrong");
    }  
}

async function StoreToken(key, value){
    await SecureStore.setItemAsync(key, value);
}
