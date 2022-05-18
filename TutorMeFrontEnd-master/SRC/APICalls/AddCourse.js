import * as SecureStore from 'expo-secure-store';

export default async ({course, year, semester}) => {
    const apiprefix = `http://www.fancybearstutoring.com/profile/add/course/`;

    const token = await SecureStore.getItemAsync("token");

    const request = {
        method : "POST",
        headers : {'Content-Type' : 'application/json',
                    'Authorization' : `Token ${token}`,
                    'Accept' :  'application/json' 
                  },
        body : JSON.stringify({
                course_pk : course , 
                year : year,
                semester: semester
                })
    }

    const res = await fetch (apiprefix, request);
    const response = await res.json();
    console.log(res.ok);
    return res.ok;
}

