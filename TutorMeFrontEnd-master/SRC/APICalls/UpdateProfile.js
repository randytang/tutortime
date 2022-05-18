import * as SecureStore from 'expo-secure-store';

export default async ({first_name, last_name, email, year, about }) => {
    const apiprefix = `http://www.fancybearstutoring.com/profile/update/`;
    const token = await SecureStore.getItemAsync('token');
    const request = {
        method : "POST",
        headers : {'Content-Type' : 'application/json',
        'Authorization' : `Token ${token}`,
        'Accept' :  'application/json'},
        body : JSON.stringify({
            first_name : `${first_name}`,
            last_name : last_name,
            email : email,
            year : year,
            about : about
        })
    }

    const res = await fetch(apiprefix, request);
    const response = await res.json();
    SecureStore.setItemAsync("email", email);
    return true;
    
}