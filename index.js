const express = require('express');
const req = require('express/lib/request');
const path = require('path');
const { check, validationResult } = require('express-validator');

var myApp = express();

myApp.use(express.urlencoded({ extended: true }));

//Setup DB Connection
const mongoose = require('mongoose');
const { stringify } = require('querystring');
mongoose.connect('mongodb://localhost:27017/customer', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// Setup model for the collection
const Customer = mongoose.model('Customer', {
    name: String,
    email: String,
    phone: Number,
    address: String,
    city: String,
    postCode: String,
    province: String,
    pinkRoseQuantity: Number,
    greenRoseQuantity: Number,
    redRoseQuantity: Number,
    pinkRosePrice: Number,
    greenRosePrice: Number,
    redRosePrice: Number,
    shippingCharges: Number,
    subTotal: Number,
    tax: Number,
    total: Number,
})

// Set path to public and views folder.
myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname + '/public'));
myApp.set('view engine', 'ejs');

myApp.get('/', function (req, res) {
    res.render('form');
});

var phoneRegex = /^[0-9]{3}\-?[0-9]{3}\-?[0-9]{4}$/; // 123-123-1234 OR 1231231234

function checkRegex(userInput, regex) {
    if (regex.test(userInput))
        return true;
    else
        return false;
}

function customPhoneValidation(value) {
    if (!checkRegex(value, phoneRegex)) {
        throw new Error('Please enter correct format: 123-123-1234 OR 1231231234!');
    }
    return true;
}

myApp.post('/', [
    check('name', 'Name is required!').notEmpty(),
    check('address', 'Address is required!').notEmpty(),
    check('city', 'City is required!').notEmpty(),
    check('province', 'Province is required!').notEmpty(),
    check('email', 'Please enter a valid email address!').isEmail(),
    check('phone', '').custom(customPhoneValidation),
    check('postCode', 'Postal Code is required').notEmpty()
], function (req, res) {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        res.render('form', { errors: errors.array() });
    }

    else {
        var redRoseQuantity = 0;
        var pinkRoseQuantity = 0;
        var greenRoseQuantity = 0;
        var shippingCharges = 20;
        var name = req.body.name;
        var email = req.body.email;
        var phone = req.body.phone;
        var address = req.body.address;
        var city = req.body.city;
        var postCode = req.body.postCode;
        var province = req.body.province;
        redRoseQuantity = req.body.redRoseQuantity;
        pinkRoseQuantity = req.body.pinkRoseQuantity;
        greenRoseQuantity = req.body.greenRoseQuantity;
        var pinkRosePrice;
        var greenRosePrice;
        var redRosePrice;
        var subTotal;
        var tax;
        var total;
        pinkRosePrice = pinkRoseQuantity * 12;
        greenRosePrice = greenRoseQuantity * 14;
        redRosePrice = redRoseQuantity * 10;
        subTotal = pinkRosePrice + greenRosePrice + redRosePrice + shippingCharges;
        tax = subTotal * 0.13;
        total = subTotal + tax;
        subTotal = subTotal.toFixed(2);
        tax = tax.toFixed(2);
        total = total.toFixed(2);
        var pageData = {
            name: name,
            email: email,
            phone: phone,
            address: address,
            city: city,
            postCode: postCode,
            province: province,
            pinkRoseQuantity: pinkRoseQuantity,
            greenRoseQuantity: greenRoseQuantity,
            redRoseQuantity: redRoseQuantity,
            pinkRosePrice: pinkRosePrice,
            greenRosePrice: greenRosePrice,
            redRosePrice: redRosePrice,
            shippingCharges: shippingCharges,
            subTotal: subTotal,
            tax: tax,
            total: total
        }
        var myCustomer = new Customer(pageData);

        //Save order in DB
        myCustomer.save().then(function () {
            console.log("New order Created");
        })
        res.render('form', pageData);
    };

});

myApp.get('/allOrders', (req, res) => {
    //Use DB model name
    //Fetches data from DB
    Customer.find({}).exec(function (errs, customers) {
        console.log(errs);
        res.render('allOrders', { customers: customers }); // second parameter should match with second parameter of function
    })
})


myApp.listen(8082);