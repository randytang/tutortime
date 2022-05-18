import * as SecureStore from 'expo-secure-store';

export default async ({subject, location, date,time, tutor_id}) => {

    const  apiprefix = 'http://www.fancybearstutoring.com/users/request-appt/';
    const token = await SecureStore.getItemAsync("token");
    console.log(date + " date");
    console.log(time + " time")
    const request = {
        method : "POST",
        headers : {'Content-Type' : 'application/json',
                    'Authorization' : `Token ${token}`,
                    'Accept' :  'application/json'           
        },
        body : JSON.stringify({
            subject : `${subject}`,
            location : `${location}`,
            date : `${date}`,
            time : `${time}`,
            tutor_id : `${tutor_id}`
        })
    }
    try {
        const res = await fetch(apiprefix, request);
        const response = await res.json();
        console.log(response);
        console.log("response was good");
        console.log(new Date());
        return res.ok;
    } catch (error) {
        console.log(error);   
    }
   
}