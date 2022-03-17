const paymentMethods = {
  upi: ["vpa"],
  wallets: ["wallet"],
  netbanking: ["bank"],
  card: [
    "number",
    "name",
    "expiry_month",
    "expiry_year",
    "cvv",
    "emi_duration", // only required if method is emi
  ],
  emandate: ["account_number", "ifsc", "name"],
};

var data = {
  amount: 5000, // in currency subunits. Here 1000 = 1000 paise, which equals to ₹10
  currency: "INR", // Default is INR. We support more than 90 currencies.
  email: "shubham@example.com",
  contact: "9123456780",
  order_id: "", // Replace with Order ID generated in Step 4
  method: "card",

  // method specific fields


  card:{
    number:6070123456789012,
    name: "shubham jha",
    expiry_month:12,
    expiry_year:25,
    cvv:123,
  }
  
  
};

var btn = document.querySelector("#btn");
var razorpay = new Razorpay({
  key: "YOUR_KEY" // "rzp_test_NYYmXq35Jf5yP8"
  // logo, displayed in the popup
  //image: "https://i.imgur.com/n5tjHFD.png",
});

btn.addEventListener("click", function (event) {
  event.preventDefault();
  startPayment();
});

function fetchPaymentMethods() {
  razorpay.once("ready", function (response) {
    console.log(response.methods);
  });
}

async function startPayment() {
  fetchPaymentMethods();

  const orderId = await getOrderId();
  data.order_id = orderId;
  razorpay.createPayment(data);
  razorpay.on("payment.success", function (resp) {
    const { razorpay_payment_id, razorpay_signature, razorpay_order_id } = resp;
    verifyPayment(razorpay_payment_id, razorpay_signature, data.order_id);
  }); // will pass payment ID, order ID, and Razorpay signature to success handler.

  razorpay.on("payment.error", function (resp) {
    console.log(resp);
  }); // will pass error object to error handler
}

async function verifyPayment(
  razorpay_payment_id,
  razorpay_signature,
  razorpay_order_id
) {
  try {
    console.log({
      razorpay_payment_id,
      razorpay_signature,
      razorpay_order_id,
    });
    const res = await fetch("/verify", {
      method: "POST",
      body: JSON.stringify({
        razorpay_payment_id,
        razorpay_signature,
        razorpay_order_id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (data.verified) {
      alert("Success");
      return;
    }
    alert("Payment is not verified");
  } catch (err) {
    console.log(err);
  }
}

async function getOrderId() {
  const res = await fetch("/create/order");
  const data = await res.json();
  return data.id;
}
