import express from 'express';

import rp from 'request-promise-native';
import cheerio from 'cheerio';
import axios from 'axios';

import petfinder from '../api/petfinder';


import sanitizePetfinder from '../helpers/sanitize-petfinder';


const router = express.Router();
const imageRegex = RegExp('srcs*=s*"(.+?)"');
//token start
let uriAuth = 'https://api.petfinder.com/v2/oauth2/token';

module.exports = (dataHelpers) => {
  router.get('/dogbreeds', async (req, res) => {
    // constructs options to do a cheerio web scrape
    // const options = {
      // uri: 'https://www.petfinder.com/dog-breeds',
    //   uri: 'https://api.petfinder.com/v2/types/dog/breeds',
    //   transform(body) {
    //     return cheerio.load(body);
    //   }
    // };
    let dogBreeds = [];

    axios.post(uriAuth, {
        'grant_type': 'client_credentials',
        'client_id': process.env.PETFINDER_APIKEY,
        'client_secret': process.env.PETFINDER_SECRET,
        })
      .then(function (response) {
        let token = response.data.token_type + " " + response.data.access_token;
        //console.log("RESPONSE FOR THIS", token);
        axios.get('https://api.petfinder.com/v2/types/dog/breeds',{ headers: { 'User-Agent': 'Request-Promise', 'Authorization': token }})
          .then((response) => {
            let breeds = response.data.breeds;
            // iterates through dog breeds
            async function processArray() {
              for (let i = 0; i < breeds.length; i++) {
                const name = breeds[i].name;
                const url = breeds[i]._links.type.href;
                // return console.log(url);
                dogBreeds.push({
                  name,
                  url
                });
              }
            }

            processArray();

            // selects the breeds list, and iterates through each one
            // $('#breed_select option').each((i, el) => {
            //   const name = $(el).text();
            //   const url = $(el).attr('value');
            //   dogBreeds.push({
            //     name,
            //     url
            //   });
            // });
            console.log("Dog Breed", dogBreeds);
            return dataHelpers.saveBreeds('dog', dogBreeds).then(result => result);
          })
          .then(result => res.json(result))
          .catch((err) => {
            console.log(err);
            res.json(err);
          });
      })
      .catch(function (error) {
        return console.log("ERROR RESPONSE", error);
      });


    // sends request, grab all the HTML and load into $ (cheerio)
    // rp(options)
    //   .then(($) => {
        // selects the breeds list, and iterates through each one
        // $('#breed_select option').each((i, el) => {
        //   const name = $(el).text();
        //   const url = $(el).attr('value');
          // pushes extracted dog breed into array
      //     dogBreeds.push({
      //       name,
      //       url
      //     });
      //   });
      //   return dataHelpers.saveBreeds('dog', dogBreeds).then(result => result);
      // })
      // .then(result => res.json(result))
      // .catch((err) => {
      //   console.log(err);
      //   res.json(err);
      // });

  });

  router.get('/catbreeds', async (req, res) => {
    // constructs options to do a cheerio web scrape
    const options = {
      uri: 'https://www.petfinder.com/cat-breeds',
      transform(body) {
        return cheerio.load(body);
      }
    };
    const catBreeds = [];

    // sends request, grab all the HTML and load into $ (cheerio)
    rp(options)
      .then(($) => {
        // selects the breeds list, and iterates through each one
        $('#breed_select option').each((i, el) => {
          const name = $(el).text();
          // .trim();
          const url = $(el).attr('value');
          // pushes extracted cat breed into array
          catBreeds.push({
            name,
            url
          });
        });
        return dataHelpers.saveBreeds('cat', catBreeds).then(result => result);
      })
      .then(result => res.json(result))
      .catch((err) => {
        console.log(err);
        res.json(err);
      });
  });

  router.get('/catcare', async (req, res) => {
    try {
      // grabs the entire list of breeds from db
      const breeds = await dataHelpers.getBreeds('cat');

      // creates the search tags
      breeds.forEach((cat) => {
        const personalityTag = `${cat.name} Cat Personality`;
        const traitsTag = `${cat.name} Cat Breed Traits`;
        const options = {
          uri: cat.url,
          transform(body) {
            return cheerio.load(body);
          }
        };

        const catInfo = {};

        // makes API call to grab the personality and traits
        rp(options)
          .then(($) => {
            // looks for h2 that contains the personality tag
            const personality = $('h2')
              .filter((i, el) => $(el).text() === personalityTag)
              .parent()
              .html()
              .trim();

            catInfo.personality = personality;
            return $;
          })
          .then(($) => {
            // looks for h2 that contains the traits tag
            const traits = $('h2')
              .filter((i, el) => $(el).text() === traitsTag)
              .parent()
              .html()
              .trim();

            catInfo.traits = traits;
            return $;
          })
          .then(($) => {
            // grabs the image of the breed
            const imageHTML = $('.left')
              .filter('.left')
              .html()
              .trim();
            const imageUrl = imageRegex.exec(imageHTML);
            catInfo.image = `<img src='${imageUrl[1]}' />`;
          })
          .then(() => dataHelpers.saveInfo('cat', cat.name, catInfo).then(() => 'Ok'));
      });

      res.json('ok');
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  });

  router.get('/dogcare', async (req, res) => {
    try {
      // grabs the entire list of breeds from db
      const breeds = await dataHelpers.getBreeds('dog');

      breeds.forEach((dog) => {
        const tempermentTag = `${dog.name} Dog Temperament`;
        const careTag = `${dog.name} Dog Care`;
        const healthTag = `${dog.name} Dog Health`;
        const options = {
          uri: dog.url,
          transform(body) {
            return cheerio.load(body);
          }
        };

        const dogInfo = {};

        // makes API call to grab the temperment, care, and health
        rp(options)
          .then(($) => {
            const temperment = $('h2')
              .filter((i, el) => $(el).text() === tempermentTag)
              .parent()
              .html()
              .trim();

            dogInfo.temperment = temperment;
            return $;
          })
          .then(($) => {
            const care = $('h2')
              .filter((i, el) => $(el).text() === careTag)
              .parent()
              .html()
              .trim();

            dogInfo.care = care;
            return $;
          })
          .then(($) => {
            const health = $('h2')
              .filter((i, el) => $(el).text() === healthTag)
              .parent()
              .html()
              .trim();

            dogInfo.health = health;
            return $;
          })
          .then(($) => {
            const imageHTML = $('.left')
              .filter('.left')
              .html()
              .trim();
            const imageUrl = imageRegex.exec(imageHTML);
            dogInfo.image = `<img src='${imageUrl[1]}' />`;
          })
          .then(() => dataHelpers.saveInfo('dog', dog.name, dogInfo).then(() => 'Ok'));
      });

      res.json('ok');
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  });

  // function to grab the (count * 500) amount of Cats from petfinder and seed into db
  router.get('/cat/:count', async (req, res) => {
    let options = {};
    // loops through count number of times, gets 500 cats each call
    for (let i = 0; i < req.params.count; i++) {
      options = {
        location: 'toronto,ontario',
        output: 'full',
        count: 500,
        offset: i * 500,
        animal: 'cat'
      };
      try {
        const result = await petfinder('pet.find', options);
        const sanitized = await sanitizePetfinder(result);
        const output = await dataHelpers.insertMultiplePets(sanitized);
      } catch (e) {
        console.log('Error', e);
        res.json(e);
      }
    }
    res.json('ok');
  });

  // same as above
  // router.get('/dog/:count', async (req, res) => {
  router.get('/dog/:count', async (req, res) => {
    let options = {};
    for (let i = 0; i < req.params.count; i++) {
      // options = {
      //   location: 'toronto,ontario',
      //   output: 'full',
      //   count: 500,
      //   offset: i * 500,
      //   animal: 'dog'
      // };
      options = {
        location: 'toronto, ontario',
        limit: 100,
        page: i + 1,
        type: 'dog'
      };
      try {
        // const token = await petfindertoken();
        // console.log("TOKENS", token);
        //const token = await petfindertoken();
        //const result = await petfinder('pet.find', options);
        const result = await petfinder('animals', options);
        const sanitized = await sanitizePetfinder(result);
        const output = await dataHelpers.insertMultiplePets(sanitized);
      } catch (e) {
        console.log('Error', e);
        res.json(e);
      }
    }
    res.json('ok');
  });

  return router;
};
