const express = require('express');
const path = require('path');
const Razorpay = require('razorpay');
const { validatePaymentVerification } = require('../razorpay/node_modules/razorpay/dist/utils/razorpay-utils');
const app = express();
const port = 3000;
let orderId = 0;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


var instance = new Razorpay({
  key_id:  'YOUR_KEY',  //'YOUR_KEY_ID', 
  key_secret: 'YOUR_SECRET' //'YOUR_KEY_SECRET', 
});



app.get('/create/order', async (req, res) => {
    const order = await instance.orders.create({
        amount: 5000,
        currency: "INR",
        receipt: `receipt#${orderId++}`,
      });
      console.log(order)
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(order));
});

app.post('/verify', async (req, res) => {
    const {razorpay_payment_id,razorpay_signature,razorpay_order_id} = req.body;
    console.log("body", req.body)
    if(!razorpay_payment_id || !razorpay_signature ||  !razorpay_order_id){
        res.status(400).send({verified:false})
        return;
    }
    const isValid = validatePaymentVerification({"order_id": razorpay_order_id, "payment_id": razorpay_payment_id }, razorpay_signature, 'nVg1Cjws8e4hQhA975tWz1Ah');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({verified:isValid}));
});



app.listen(port, () => {
  console.log(`app listening on port ${port}!`)
});