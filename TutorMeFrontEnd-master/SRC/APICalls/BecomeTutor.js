import * as SecureStore from 'expo-secure-store';

export default async({id})=> {
    const apiPrefix = `http://www.fancybearstutoring.com/profile/users-groups/${id}/`;
    const token = await SecureStore.getItemAsync("token");
    const tutor = "tutor";
    const request = {
        method : "POST",
        headers : {'Content-Type' : 'application/json',
                        'Authorization' : `Token ${token}`,
                        'Accept' :  'application/json'           
            },
        body:JSON.stringify({
            groups : `${tutor}`
        })
    }

    const res = await fetch(apiPrefix, request);
    const response = await res.text();
    console.log(response);
}