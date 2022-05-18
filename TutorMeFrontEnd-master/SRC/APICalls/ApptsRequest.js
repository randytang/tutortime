const apiPrefix = 'http://www.fancybearstutoring.com/profile/users-appts-ordered/'

export default async({
    token,
})=> {
    const getAppts = {
        method : 'GET',
        headers : {'Content-Type' : 'application/json',
                    'Authorization' : `Token ${token}`            
        },
    }

    try{
        const res = await fetch(apiPrefix, getAppts);
        const response = await res.json();
        //console.log(response);
        return response;
    }catch(exception){
        console.log(exception);
    }
}