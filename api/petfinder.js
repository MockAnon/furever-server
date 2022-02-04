import rp from 'request-promise-native';
import queryString from 'query-string';
import parser from 'fast-xml-parser';
import axios from 'axios';

module.exports = function APICall(method, params) {
  // specifies the uri endpoint to make a request to
  let uri = `https://api.petfinder.com/v2/${method}`;
  // if params is not defined, set it to be an empty object
  params = params || {};

  // adds the api key to the params, and converts any params into query strings
  const query = queryString.stringify(params);
  uri += `?${query}`;

  //token start
  let uriAuth = 'https://api.petfinder.com/v2/oauth2/token';

  return new Promise(resolve => {
    axios.post(uriAuth, {
        'grant_type': 'client_credentials',
        'client_id': process.env.PETFINDER_APIKEY,
        'client_secret': process.env.PETFINDER_SECRET,
        })
    .then(function (response) {
        let token = response.data.token_type + " " + response.data.access_token;
        //console.log("RESPONSE FOR THIS", token);
        axios.get(uri,{ headers: { 'User-Agent': 'Request-Promise', 'Authorization': token }})
          .then(function (response) {
            // handle success
            return resolve(response.data);
          })
          .catch(function (error) {
            // handle error
            return resolve(console.log("Final ERROR", error));
          });
    })
    .catch(function (error) {
        return resolve(console.log("ERROR RESPONSE", error));
    });
  });
};