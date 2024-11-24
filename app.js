const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./chave.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", async function(req, res){
    const dataSnapshot = await db.collection('carros').get();
    const data = [];
    dataSnapshot.forEach((doc) => {
        data.push({
            id: doc.id,
            modelo: doc.get('modelo'),
            ano: doc.get('ano'),
            cor: doc.get('cor'),
            marca: doc.get('marca'),
            placa: doc.get('placa'),
        });
    });
    res.render("consulta", { data });
})

app.get("/editar/:id", async function (req, res) {
    const dataSnapshot = await db.collection('carros').doc(req.params.id).get();
    const data = {
        id: dataSnapshot.id,
        modelo: dataSnapshot.get('modelo'),
        ano: dataSnapshot.get('ano'),
        cor: dataSnapshot.get('cor'),
        marca: dataSnapshot.get('marca'),
        placa: dataSnapshot.get('placa'),
    };

    res.render("editar", { data });
});

app.get("/excluir/:id", function (req, res) {
    db.collection('carros').doc(req.params.id).delete().then(function () {
        console.log('Deleted document');
        res.redirect('/consulta');
    });
});
app.post("/cadastrar", function(req, res){
    var result = db.collection('carros').add({
        modelo: req.body.modelo,
        ano: req.body.ano,
        cor: req.body.cor,
        marca: req.body.marca,
        placa: req.body.placa
    }).then(function(){
        console.log('Added document');
        res.redirect('/')
    })
})

app.post("/atualizar", function(req, res){
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})