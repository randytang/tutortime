import * as SecureStore from 'expo-secure-store';

export default async({id, notes})=> {
    const apiPrefix = `http://www.fancybearstutoring.com/appts/deny/${id}/`;
    const token = await SecureStore.getItemAsync("token");
    console.log("notes " + notes);
    const request = {
        method : "POST",
        headers : {'Content-Type' : 'application/json',
                        'Authorization' : `Token ${token}`,
                        'Accept' :  'application/json'           
            },
        body:JSON.stringify({
            notes : `${notes}`
        })
    }

    const res = await fetch(apiPrefix, request);
    const response = await res.text();
    console.log(response);
}