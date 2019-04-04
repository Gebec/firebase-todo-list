const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const sanitizeHtml = require('sanitize-html');

firebase.initializeApp();

exports.todos = functions.https.onRequest((req, res) => {
  const method = req.method;

  if (method === 'OPTIONS') {
    return handlePreflight(req, res);
  } else {
    return cors(req, res, () => {
      switch(method) {
        case 'GET': handleGet(req, res); break;
        case 'PUT': handlePut(req, res); break;
        case 'POST': handlePost(req, res); break;
        case 'DELETE': handleDelete(req, res); break;
        default: handlePreflight(req, res);
      }
    });
  }
});

const response = (res, code = 200, data = 'no data') => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  return res.status(code).send(data);
}
const handlePreflight = (req, res) => {
  return response(res);
}

const handleGet = (req, res) => {
  return firebase
          .database()
          .ref('/todos')
          .once('value')
          .then(data => {
            formated = data.val() ? JSON.stringify(data) : {};
            return response(res, 200, formated);
          })
}

const handlePut = (req, res) => {
  const title = req.body.title ? sanitizeHtml(req.body.title, { allowedTags: [], allowedAttributes: [] }): req.body;
  const currTime = firebase.database.ServerValue.TIMESTAMP;
  const newTodo = {};
  const todoData = {
    title: title,
    done: false,
    created: currTime,
  }

  let newKey = firebase
                      .database()
                      .ref()
                      .child('todos')
                      .push()
                      .key;

  newTodo['/todos/' + newKey] = todoData;

  return firebase
          .database()
          .ref()
          .update(newTodo)
          .then(() => {
            return response(res, 200, JSON.stringify(newTodo));
          })
          .catch(err => {
            return res.status(401).send(err)
          });
}

const handlePost = (req, res) => {
  return response(res);
}

const handleDelete = (req, res) => {
  return response(res);
}