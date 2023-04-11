const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config()
const Database = require('dbcmps369');

const sqlite3 = require('sqlite3').verbose();

const app = express();

// app.use(express.static(__dirname + '/public', { type: 'text/css' }));
// app.use(express.static('public', {
//   setHeaders: (res, path, stat) => {
//     res.set('Content-Type', 'text/css');
//   }
// }));

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.set('views', './views');

const db = new Database();

const startup = async () => {
    await db.connect();

    await db.schema('Contact', [
        { name: 'id', type: 'INTEGER' },
        { name: 'fName', type: 'TEXT' },
        { name: 'lName', type: 'TEXT' },
        { name: 'phNumber', type: 'TEXT' },
        { name: 'email', type: 'TEXT' },
        { name: 'street', type: 'TEXT' },
        { name: 'city', type: 'TEXT' },
        { name: 'state', type: 'TEXT' },
        { name: 'zip', type: 'TEXT' },
        { name: 'country', type: 'TEXT' },
        { name: 'contactByEmail', type: 'INTEGER' },
        { name: 'contactByPhone', type: 'INTEGER' },
        { name: 'contactByMail', type: 'INTEGER' },
    ], 'id');

    await db.schema('Users', [
        { name: 'id', type: 'INTEGER' },
        { name: 'fName', type: 'TEXT' },
        { name: 'lName', type: 'TEXT' },
        { name: 'userName', type: 'TEXT' },
        { name: 'hashedPassword', type: 'TEXT' },

    ], 'id')

    let userName = "cmps369";
    let password = "rcnj"
    const user = await db.read('Users', [{ column: 'userName', value: userName }]);
    if (user.length) {
        return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.create('Users',
        [
            { column: 'id', value: Math.floor(Math.random() * 1000) },
            { column: 'fName', value: "CMPS" },
            { column: 'lName', value: "369" },
            { column: 'userName', value: "cmps369" },
            { column: 'hashedPassword', value: hashedPassword }
        ])
}

startup()

app.get('/login', (req, res) => { res.render('login'); });
app.get('/signup', (req, res) => { res.render('signup'); });
app.get('/contacts', (req, res) => { res.render('contacts'); });

app.get('/', (req, res) => {
    res.render('contacts');
});

// Reference for the /:id page.
app.get("/layout", async (req, res) => {
    const contacts = await db.read('Contact', []);
    modifiedContacts = []
    console.log(contacts)

    for (let i = 0; i < contacts.length; i++) {
        tempObj = {}
        tempObj["id"] = contacts[i]['id']
        tempObj["name"] = contacts[i]["fName"] + " " + contacts[i]["lName"]
        tempObj["phone"] = contacts[i]["phNumber"]
        tempObj["email"] = contacts[i]["email"]
        tempObj["address"] = contacts[i]["city"] + ", " + contacts[i]["state"] + " " + contacts[i]["zip"] + " " + contacts[i]["country"]
        tempObj["cByEmail"] = contacts[i]["contactByEmail"] == 1 ? true : false
        tempObj["cByPhone"] = contacts[i]["contactByPhone"] == 1 ? true : false
        tempObj["cByMail"] = contacts[i]["contactByMail"] == 1 ? true : false
        modifiedContacts.push(tempObj)
    }
    console.log("Modified contacts", modifiedContacts)
    res.render("layout", { contacts: modifiedContacts })
})


app.get('/:id', async (req, res) => {

    const { id } = req.params;
    const contacts = await db.read('Contact', [{ column: "id", value: id }]);
    tempObj = {}
    console.log("contacts", contacts)

    if (contacts.length > 0) {
        tempObj["id"] = contacts[0]["id"];
        tempObj["name"] = contacts[0]["fName"] + " " + contacts[0]["lName"]
        tempObj["phone"] = contacts[0]["phNumber"]
        tempObj["email"] = contacts[0]["email"]
        tempObj["address"] = contacts[0]["city"] + ", " + contacts[0]["state"] + " " + contacts[0]["zip"] + " " + contacts[0]["country"]
        tempObj["cByEmail"] = contacts[0]["contactByEmail"] == 1 ? true : false
        tempObj["cByPhone"] = contacts[0]["contactByPhone"] == 1 ? true : false
        tempObj["cByMail"] = contacts[0]["contactByMail"] == 1 ? true : false
        res.render('individual', { contacts: tempObj });
        // process other properties of the contact
    } else {
        console.log("No contacts found with the specified id.");
    }
});

app.post('/contacts', async (req, res) => {
    let { firstName, lastName, phone, email, street, city, state, zip, country, cByMail, cByEmail, cByPhone } = req.body;
    let cByMailM = cByMail == "on" ? 1 : 0;
    let cByEmailM = cByEmail == "on" ? 1 : 0;
    let cByPhoneM = cByPhone == "on" ? 1 : 0;
    await db.create('Contact',
        [
            { column: 'id', value: Math.floor(Math.random() * 1000) },
            { column: 'fName', value: firstName },
            { column: 'lName', value: lastName },
            { column: 'phNumber', value: phone },
            { column: 'email', value: email },
            { column: 'street', value: street },
            { column: 'city', value: city },
            { column: 'state', value: state },
            { column: 'zip', value: zip },
            { column: 'country', value: country },
            { column: 'contactByEmail', value: cByEmailM },
            { column: 'contactByPhone', value: cByPhoneM },
            { column: 'contactByMail', value: cByMailM },
        ]
    );
    res.redirect('/layout');
});

app.get("", async (req, res) => {
    const contacts = await db.read('Contact', []);
    modifiedContacts = []
    for (let i = 0; i < contacts.length; i++) {
        tempObj = {}
        tempObj["id"] = contacts[i]["id"]
        tempObj["name"] = contacts[i]["fName"] + " " + contacts[i]["lName"]
        tempObj["phone"] = contacts[i]["phNumber"]
        tempObj["email"] = contacts[i]["email"]
        tempObj["address"] = contacts[i]["city"] + ", " + contacts[i]["state"] + " " + contacts[i]["zip"] + " " + contacts[i]["country"]
        tempObj["cByEmail"] = contacts[i]["contactByEmail"] == 1 ? true : false
        tempObj["cByPhone"] = contacts[i]["contactByPhone"] == 1 ? true : false
        tempObj["cByMail"] = contacts[i]["contactByMail"] == 1 ? true : false
        modifiedContacts.push(tempObj)
    }
    res.render("layout", { contacts: modifiedContacts })
})

app.post('/signup', async (req, res) => {
    const { fName, lName, userName, password, confirmPassword } = req.body;

    const user = await db.read('Users', [{ column: 'userName', value: userName }]);
    console.log(user)
    if (user.length) {
        //   res.status(409).send('User already exists');
        res.render('signup', { error: "User already exists" });
        return;
    }
    if (confirmPassword != password) {
        // res.status(409).send('Passwords do not match');
        res.render('signup', { error: "Passwords do not matchr" });
        return;
    }
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.create('Users',
        [
            { column: 'id', value: Math.floor(Math.random() * 1000) },
            { column: 'fName', value: fName },
            { column: 'lName', value: lName },
            { column: 'userName', value: userName },
            { column: 'hashedPassword', value: hashedPassword }
        ])

    res.redirect("/login");
});

app.post('/login', async (req, res) => {
    const { userName, password } = req.body;
    const user = await db.read('Users', [{ column: 'userName', value: userName }]);
    console.log(user)
    if (!user.length) {
        res.render('login', { error: "User not found" });
        return;
    }
    const passwordMatch = await bcrypt.compare(password, user[0].hashedPassword);
    if (!passwordMatch) {
        res.render('login', { error: 'Invalid password' });
        return;
    }
    res.redirect('/');
});

app.get('/contacts/:id/delete', async (req, res) => {
    const { id } = req.params;

    await db.delete('Contact', [{ column: 'id', value: id }]);

    res.redirect('/layout');
});

app.get('/contacts/:id/edit', async (req, res) => {
    const { id } = req.params;
    console.log(id)
    const contacts = await db.read('Contact', [{ column: 'id', value: id }]);
    console.log(contacts)
    if (!contacts.length) {
        res.redirect("/")
    }
    contacts[0]["contactByEmail"] = contacts[0]["contactByEmail"] == 1 ? true : false
    contacts[0]["contactByPhone"] = contacts[0]["contactByPhone"] == 1 ? true : false
    contacts[0]["contactByMail"] = contacts[0]["contactByMail"] == 1 ? true : false
    res.render('edit', { contacts: contacts[0] });
});

app.post('/:id/edit', async (req, res) => {

    const { id } = req.params;
    console.log(id)
    let { firstName, lastName, phone, email, street, city, state, zip, country, cByMail, cByEmail, cByPhone } = req.body;
    let cByMailM = cByMail == "on" ? 1 : 0;
    let cByEmailM = cByEmail == "on" ? 1 : 0;
    let cByPhoneM = cByPhone == "on" ? 1 : 0;
    await db.update('Contact',
        [
            { column: 'fName', value: firstName },
            { column: 'lName', value: lastName },
            { column: 'phNumber', value: phone },
            { column: 'email', value: email },
            { column: 'street', value: street },
            { column: 'city', value: city },
            { column: 'state', value: state },
            { column: 'zip', value: zip },
            { column: 'country', value: country },
            { column: 'contactByEmail', value: cByEmailM },
            { column: 'contactByPhone', value: cByPhoneM },
            { column: 'contactByMail', value: cByMailM }
        ],
        [{ column: 'id', value: id }]
    );
    res.redirect(`/layout`);
})

app.listen(3000, function () {
    console.log('Server started on port 3000');
});