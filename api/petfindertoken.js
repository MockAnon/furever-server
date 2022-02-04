import rp from 'request-promise-native';
import queryString from 'query-string';
import parser from 'fast-xml-parser';
const axios = require('axios');

module.exports = function APICall() {
  //auth url first
  let uriAuth = 'https://api.petfinder.com/v2/oauth2/token';

    axios.post(uriAuth, {
        'grant_type': 'client_credentials',
        'client_id': process.env.PETFINDER_APIKEY,
        'client_secret': process.env.PETFINDER_SECRET,
        })
    .then(function (response) {
        let token = response.data.token_type + " " + response.data.access_token;
        return console.log("RESPONSE FOR THIS", token);
    })
    .catch(function (error) {
        return console.log("ERROR RESPONSE", error);
    });

};

//http://api.petfinder.com/pet.find?animal=dog&count=500&key=BVmZ1LLnjqOrv5AjhXvwQcXo3QB5EwZpQgAa17Nn&location=toronto%2Contario&offset=0&output=full