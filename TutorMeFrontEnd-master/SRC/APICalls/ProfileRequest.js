import * as SecureStore from 'expo-secure-store';


export default async({userId, token}) => {

    userId = parseInt(userId);
    
    const apiprefix = `http://www.fancybearstutoring.com/profile/users-basic/${userId}/`;
    const request = {
        method : 'GET',
        headers : {'Content-Type' : 'application/json',
                    'Authorization' : `Token ${token}`,
                    'Accept' :  'application/json'           
        },
    }

    try {
        const res = await fetch(apiprefix, request);
        const response = await res.json();
        return response;   
    } 
    catch (error) {
        console.log(error);
        return "oops";
    }
}

