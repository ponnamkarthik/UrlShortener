const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');
const cors = require('cors')
var request = require('request');
var cheerio = require('cheerio');
var UrlD = require('url');

const ui_url = "http://urlshrt.ga/";

const app = express();


app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');
app.use(express.static('static'));
app.use(cors());

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

const firestoreApp = firebaseApp.firestore();

app.get('/index', (req, res) => {
    res.redirect(ui_url);
});

app.get('/delete', (req, res) => {
    var uid = req.query.uid;
    var code = req.query.code;

    if(uid) {
        firestoreApp.collection('urls')
        .where("uid", "==", uid)
        .where("code", "==", code)
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                doc.ref.delete();
            })
            res.send({ "error": false, "msg": "Delete Successful" })
        })
        .catch(err => {
            console.log(err);
            res.send({ "error": true, "msg": "Unable to Delete" });
        })
    }
}) 
app.get('/data', (req, res) => {
    var uid = req.query.uid;
    if(uid) {
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
            console.log(err)
            res.send({ "error": true, "msg": "Unknown error" });
        })
    } else {
        res.send({ "error": true, "msg": "Invalid user"})
    }
});

app.get('/add', (req, res) => {
    var url = req.query.url;
    var code = req.query.code;
    var uid = req.query.uid;
    var auto = req.query.auto;
    var title = "";

    var hostname = (UrlD.parse(url)).hostname;
    title = hostname;

    var base_url = "https://urlst.ga/"

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
                uid: uid,
                short_url: base_url + code,
                title: title
            })
            .then(docRef => {
                docRef.get()
                .then(data => {
                    res.send({"error": false, "msg": "Url added Successfully.", "short_url": data.data().short_url })
                });
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

app.get('/:code', (req,res) => {
    var code = req.params.code;
    firestoreApp.collection('urls').where("code", "==", code).get()
    .then((data) => {
        var user_link = [];
        data.forEach((doc) => {
            user_link.push(doc.data());
            var view = doc.data().views;
            doc.ref.update({
                views: view+1
            });
        })
        if(user_link.length > 0) {
            res.redirect(user_link[0].url);
        } else {
            res.render('index');
        }
    })
    .catch((err) => {
        res.render('index');
    })
})

exports.urlapp = functions.https.onRequest(app);
