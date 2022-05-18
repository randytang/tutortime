import { Alert } from "react-native";

const apiPrefix = 'http://www.fancybearstutoring.com/signup/'

export default async({
    firstName,
    lastName,
    userName,
    email,
    password,
    password2,
    school
}) => {
    const createUser = {
        method : "POST",
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({first_name : firstName, last_name : lastName, username : userName, 
                                email : email, password : password,password2 : password2, school : school})
    }

    try {
        //console.log("Got here");
        const  res = await fetch(apiPrefix, createUser);
        const response = await res.json();
        console.log(response);
        if (res.ok){
            return true;
        }
        else{
            //Alert.alert(response);
            return response;
        }
    } catch (error) {
        console.log(error);
    }
}