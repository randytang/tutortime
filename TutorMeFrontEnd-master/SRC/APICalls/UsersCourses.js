import * as SecureStore from 'expo-secure-store';
export default async() => {

    const apiprefix = 'http://www.fancybearstutoring.com/profile/users-courses/'; 
    const token = await SecureStore.getItemAsync("token"); 

    const request ={
        method : 'GET',
        headers : {
            'Content-Type' : 'application/json',
            'Authorization' : `Token ${token}`,
            'Accept' :  'application/json'
        },
    }

    try {
        const res = await fetch(apiprefix,request);
        const response = await res.json();
        return response;
    } 
    catch (error) {
        
    }
}