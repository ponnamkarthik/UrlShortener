const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');


const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');
app.use(express.static('static'));


const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

const firestoreApp = firebaseApp.firestore();

app.get('/data', (req, res) => {
    var uid = req.query.uid;

    firestoreApp.collection('urls').where("uid", "==", uid)
    .get()
    .then(querySnapshot => {
        var all_user_links = [];
        querySnapshot.forEach((doc) => {
            all_user_links.push(doc.data());
        })
        res.send(all_user_links);
    })
    .catch(err => {
        res.send({ "error": true, "msg": "Unknown error" });
    })
});

app.get('/add', (req, res) => {
    var url = req.query.url;
    var code = req.query.code;
    var uid = req.query.uid;
    var auto = req.query.auto

    if(!code || auto) {
        code = makeid();
    }
    
    var exists = false;

    firestoreApp.collection('urls').where("code", "==", code).get()
    .then((data) => {
        data.forEach((doc) => {
            if(doc.data().code == code) {
                exists = true;
            }
        })
        if(exists) {
            res.send({"error": true, "msg": "Short code already taken"});
        } else {
            /**Write Data */
            firestoreApp.collection('urls').add({
                code: code,
                url: url,
                views: 0,
                uid: uid
            })
            .then(docRef => {
                docRef.get()
                .then(data => res.send({"error": false, "msg": "Url added Successfully."}));
            })
            .catch(err => {
                res.send({"error": true, "msg": "Unknown error."});
            })
        }
    })
    .catch((err) => {
        res.send(err);
    })

});

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

app.get('/error', (req,res) => {
    res.render('index');
})

app.get('/:code', (req,res) => {
    var code = req.params.code;
    firestoreApp.collection('urls').where("code", "==", code).get()
    .then((data) => {
        var user_link = [];
        data.forEach((doc) => {
            user_link.push(doc.data());
        })
        if(user_link.length > 0) {
            res.redirect(user_link[0].url);
        } else {
            res.send({"error": true, "msg": "Unknown Error"});
        }
    })
    .catch((err) => {
        res.send({"error": true, "msg": "Unknown Error"});
    })
})

exports.urlapp = functions.https.onRequest(app);
