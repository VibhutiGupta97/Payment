const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AW8tViMGf7a2WwOVzDuPoPk7ARdw2O6bHJujl4m0HymJ2vn1iWsS6hE8tGcRqsTIg3_mHcRPkSGxVzf-',
    'client_secret': 'EBHE5Js5q_ZE_dGrVDtfdB-SGLHKXbFM679uYXhOANZbigIgOArSJzTV2WxUGu_Ko6D4FY4br2DHXJ4h'
});
const app = express();

app.set('view engine', 'ejs');

app.get('/',(req,res) => res.render('index'));

app.post('/pay',(req,res)=>{
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Speeding Ticket",
                    "sku": "item",
                    "price": "400",
                    "currency": "INR",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "INR",
                "total": "400"
            },
            "description": "Challan for Speeding Ticket."
        }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i=0;i <payment.links.length;i++){
                if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                }

            }
        }
    });
});
app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "INR",
                "total": "400.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));
app.listen(3000, () => console.log('Server Started'));
