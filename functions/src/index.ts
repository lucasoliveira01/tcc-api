import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

const app = express();
admin.initializeApp({
    credential: admin.credential.cert(require("../serviceAccountKey.json")),
    databaseURL: "https://fiscaliza-8b2f4.firebaseio.com/"
});

app.use(cors({ origin: true }));

app.post('/request', (req, res) => {
    admin.database().ref('/request').push(req.body, () => {
        updateDatabase();
        res.send({
            status: 'Ok'
        })
    });
});

app.get('/request/:id', function (req, res) {
    const usersRef = admin.database().ref('/request');
    // const targetUid = req.params.id;
    // let id: string | null;
    // tslint:disable-next-line: no-floating-promises
    const requires: any[] = [];
    usersRef.orderByChild('id').once("value", function (snapshot) {
        snapshot.forEach((childSnapshot) => {
            requires.push(childSnapshot.val());
        });
        res.send({
            data: requires
        })
    });       
});

app.get('/request/:userId/:id', function (req, res) {
    const usersRef = admin.database().ref('/request');
    const targetUid = req.params.id;
    let require: any;
    console.log('targetUid ' + targetUid);
    let id: string | null;
    // tslint:disable-next-line: no-floating-promises
    usersRef.orderByChild('id').once("value", function (snapshot) {

        snapshot.forEach((childSnapshot) => {
            
            const childData = childSnapshot.val();

            const found = (childData.id == targetUid);

            if (found) {
                require = childData;
            }
            return found;
        });
        if (!id) {
            console.log('Not Found for uid:' + targetUid);
        }
        res.send({
            data: require
        })
    });
});

app.put('/request/:id', function (req, res) {
    const usersRef = admin.database().ref('/request');
    const uid = req.params.id;
    const data = req.body;

    // tslint:disable-next-line: no-floating-promises
    usersRef.child(uid).update(data, function (err) {
        if (err) {
            res.send(err);
        } else {
            updateDatabase();
            // tslint:disable-next-line: no-floating-promises
            res.json({ "message": "successfully update data", "result": true });
        }
    });
});

app.get('/getRequest/:id', function (req, res) {
    const usersRef = admin.database().ref('/request');
    const targetUid = req.params.id;
    console.log('targetUid ' + targetUid);
    let id: string | null;
    // tslint:disable-next-line: no-floating-promises
    usersRef.orderByChild('id').once("value", function (snapshot) {

        snapshot.forEach((childSnapshot) => {

            const childKey = childSnapshot.key;
            console.log('childKey ' + childKey);
            const childData = childSnapshot.val();
            console.log('childData.id ' + childData.id);

            const found = (childData.id == targetUid);
            console.log('found ' + found);

            if (found) {
                id = childKey;
            }
            return found;
        });
        if (!id) {
            console.log('Not Found for uid:' + targetUid);
        }
        res.send({
            key: id
        })
    });
});

function updateDatabase() {
    const usersRef = admin.database().ref('/update');
    const nextVal = Math.floor(Math.random() * 10000);
    const data = {
        update: nextVal
    };

    usersRef.update(data, function (err) {
        if (err) {
            return err;
        } else {
            // tslint:disable-next-line: no-floating-promises
            return true;
        }
    });
}

exports.api = functions.https.onRequest(app);

