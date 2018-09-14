const hasLoginEne = (value) => {
  if(value.key === 'eneLogin')
      return value.value
}
const removeLoginEne = (value) => {
  return value.key !== 'eneLogin';
}

var varCustomer =  pm.request.headers.filter(hasLoginEne).length > 0 ? 
                            pm.request.headers.filter(hasLoginEne)[0].value : false;
pm.request.headers = pm.request.headers.filter(removeLoginEne);

if(varCustomer){
    
    console.log('Request com login!\nInciando validações...\n');
    
    const varToken = pm.environment.get('token');
    
    const parseJwt = (token) => {
        
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(atob(base64));
    }
    
    const isValidToken = (token)=>{
        if(token){
            return true;
        }else{
            return false;
        }
    }
    
    const isExpiratedToken = (token, parseJwt) =>{
    
        if (parseJwt(token).exp <= Date.now()){
            return true;
        }else{
            console.log('Token expirado!');
            return false;
        }
    }
    
    const isCustomerValid = (token, newCustomer, parseJwt) =>{
        var oldCustomer = parseJwt(token).cpfCnpj;
        if(newCustomer == oldCustomer){
            return true;
        }else{
            return false;
        }
    }
    
    const postRequest ={
      
        // url: URL omitida,
        method: 'POST',
         header: {
            'Content-Type':'application/json',
            'Authorization': pm.environment.get('Authorization')
        },
        body: {
            mode: 'application/json',
            raw: JSON.stringify(
              {
                "username": varCustomer,
                "password": pm.environment.get('password'),
                "logInfo": {
                    "cpfCnpj": varCustomer,
                    "deviceUuid": pm.environment.get('deviceUuid'),
                    "userName": varCustomer
                }
            })
        }
    };
    
    const login = () => pm.sendRequest(postRequest, function (err, res) {

        if(res){
            var responseJson = res.json();
            postman.setEnvironmentVariable("token", responseJson.token);
        }
    });
    
    
    if(isValidToken(varToken) && isExpiratedToken(varToken, parseJwt) && isCustomerValid(varToken, varCustomer, parseJwt)){
            console.log('Token válido para esse usuário.');
    }else{
        console.log('Token inválido para esse usuário e/ou ou expirado! Um novo token será gerado.');
        login();
    }
}else{
    console.log('Request sem login!');
}