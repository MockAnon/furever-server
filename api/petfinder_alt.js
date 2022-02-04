import rp from 'request-promise-native';
import queryString from 'query-string';
import parser from 'fast-xml-parser';

module.exports = function APICall(method, params) {
  //auth url first
  let uriAuth = 'https://api.petfinder.com/v2/oauth2/token';

  var options = {
    method: 'POST',
    uri: uriAuth,
    body: {
      grant_type: 'client_credentials',
      client_id: process.env.PETFINDER_APIKEY,
      client_secret: process.env.PETFINDER_SECRET,
    },
    json: true // Automatically stringifies the body to JSON
  };

  // specifies the uri endpoint to make a request to
  let uriEnd = `http://api.petfinder.com/${method}`;

  // if params is not defined, set it to be an empty object
  params = params || {};

  // adds the api key to the params, and converts any params into query strings


  const query = queryString.stringify(params);
  uriEnd += `?${query}`;


  //First get token, if successful then get data.
  let returnToken = async function() { 
    return "Hello" 
  };
  returnToken();

  var token = rp(options)
    .then(function (parsedBody) {
      // POST succeeded...
      let token = parsedBody.token_type + " " + parsedBody.access_token;
      // console.log("DATA", token);
      return token;
    })
    .then(function (data) {
      console.log(data);
      return rp(uriEnd)
      //.then(result => parser.parse(result))
      .then(result => console.log("DOES THIS WORK", result))
      .catch(err => err);
    })
    .catch(function (err) {
      // POST failed...
      return console.log("POST FAILED");
    });

  
  // const getToken = new Promise((resolve, reject) => {
  //   if(token != null) {
  //       resolve(token);
  //     } else {
  //       reject();
  //     }
  // });

  // token.then(result => {
  //   console.log("GREAT", result);
  //   return rp(uriEnd)
  //     .then(result => parser.parse(result))
  //     .catch(err => err);
  // }).catch(err => err);
};


//http://api.petfinder.com/pet.find?animal=dog&count=500&key=BVmZ1LLnjqOrv5AjhXvwQcXo3QB5EwZpQgAa17Nn&location=toronto%2Contario&offset=0&output=full