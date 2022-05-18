import * as SecureStore from "expo-secure-store";

export default async ({SearchParam}) => {
    const apiprefix = `http://www.fancybearstutoring.com/search/courses/`;

    console.log(SearchParam);

    const token = await SecureStore.getItemAsync("token");
    console.log(token);
    const request = {
        method : 'POST',
        headers : {'Content-Type' : 'application/json',
                    'Authorization' : `Token ${token}`,
                    'Accept' :  'application/json'           
        },
        body : JSON.stringify({course_input : `${SearchParam}`})
    }

    const res = await fetch(apiprefix, request);
    const response = await res.json();
    //const resAsText = await res.text();
    //console.log(resAsText);
    return response;
}

