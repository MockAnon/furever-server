// import Debug from 'debug';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';


require('dotenv').config();

// firebase
const firebase = require('firebase-admin'); 
//const serviceAccount = require('./serviceAccountKey.json');

// const serviceAccount = {
//   "type": "service_account",
//   "project_id": process.env.PROJ_ID,
//   "private_key_id": process.env.KEY_ID,
//   "private_key": process.env.PRIV_KEY.replace(/\\n/g, '\n'),
//   "client_email": process.env.CL_EMAIL,
//   "client_id": process.env.CL_ID,
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-oxfsb%40furever-7cf38.iam.gserviceaccount.com"
// };

const serviceAccount = JSON.parse(process.env.FIREBASE_CRED);


firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

// data helper
const db = firebase.firestore();
const settings = { /* your settings... */ timestampsInSnapshots: true };
db.settings(settings);
const DataHelpers = require('./helpers/data-helpers.js')(db);

// Setup express and environment
const app = express();

// Enable All CORS Requests
app.use(cors());

// const debug = Debug('server:app');
app.set('env', process.env.APP_ENV || 'development');

// HTTP Request logging (disabled in test mode)
if (app.settings.env !== 'test') {
  const loggerType = app.settings.env == 'production' ? 'common' : 'dev';
  app.use(logger(loggerType));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use('/user', require('./routes/userRoutes.js')(DataHelpers));
app.use('/pets', require('./routes/petsRoutes.js')(DataHelpers));
app.use('/pet', require('./routes/petRoutes.js')(DataHelpers));
app.use('/populate', require('./routes/populateRoutes.js')(DataHelpers));
app.use('/extras', require('./routes/extrasRoutes.js')(DataHelpers));
// JARON ADDED route
app.use('/events', require('./routes/eventsRoutes.js')(DataHelpers));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// uncomment below for prod, else it removes all error messages

// // error handler
// app.use((err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//   // render the error page
//   res.status(err.status || 500);
//   res.json(err);
// });

// Handle uncaughtException
// process.on('uncaughtException', (err) => {
//   console.log('Caught exception: %j', err);
//   process.exit(1);
// });

export default app;
