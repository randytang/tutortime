const apiPrefix = 'http://www.fancybearstutoring.com/school/';

export default async ({
    query
}) => {
    const searchRequest = {
        method : 'GET',
    }

    const queryEncoded = encodeURIComponent(query);
    const uri = `${apiPrefix}${queryEncoded}`

    try {
        const res = await fetch(uri);
        const response = await res.json();
        //console.log(response);
        return response;   
    } 
    catch (error) {
        
    }
}