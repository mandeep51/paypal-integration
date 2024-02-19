import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from "axios";
import path from "path";

dotenv.config()




const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PORT = 8888 } = process.env;
const base = "https://api-m.sandbox.paypal.com";
const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
  })
);

const port = process.env.PORT || 4004;

app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

const generateAccessToken = async () => {
    try {
      if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        console.log("MISSING_API_CREDENTIALS");
        return;
      }
      const auth = Buffer.from(
        PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
      ).toString("base64");

      const response = await axios.post(`${base}/v1/oauth2/token`,{
        grant_type : 'client_credentials'
      },{
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      })

      const data = response.data
      if(data){
        return data.access_token;
      }
    } catch (error) {
      console.error("Failed to generate Access Token:", error);
    }
  };

  // generateAccessToken()

// const createOrder = async () => {
 
//   const accessToken = await generateAccessToken();
//   const url = ${base}/v2/checkout/orders;
//   const payload = {
//     intent: "CAPTURE",
//     purchase_units: [
//       {
//         amount: {
//           currency_code: "USD",
//           value: "100.00",
//         },
//       },
//     ],
//   };
//   const response = await axios.post(url,payload,{
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: Bearer ${accessToken},
//       "PayPal-Partner-Attribution-Id": "BN-CODE",
//       "PayPal-Auth-Assertion": "PAYPAL-AUTH-ASSERTION",
//     },
//   })
//   console.log(response.data)

//   // return handleResponse(response);
// };

const createOrder = async () => {
  try {
    const accessToken = await generateAccessToken();
    console.log(accessToken,'accessTOken')
    const url = `${base}/v2/checkout/orders`;
    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "10.00",
          },
        },
      ],
      payment_source: {
         paypal: { 
          // email_address:'mandeepkaurdev@netfrux.com',
          // name:{
          //   given_name:'mandeep',
          //   surname:'sallan'
          // },
          
          // address:{
          //   address_line_1:'Sahibzada ajit singh nagar,mohali',
          //   country_code:'IN'
          // },
          experience_context: { 
      
            return_url: "http://localhost:3000/success", 
            cancel_url: "http://localhost:3000/failure" 
          } 
        }
       } 
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`

        
      },
    });

    // Handle the response data
    console.log(response.data);
 
    return response.data.id // Assuming handleResponse function is defined elsewhere
  } catch (error) {
    // Handle errors
    console.error("Failed to create order:", error);
   
   
  }
};

// createOrder()


let get_order_detail =async (id:string)=>{
 try{
  let accessToken = await generateAccessToken()
  let response= await axios.get(`${base}/v2/checkout/orders/${id}`, {
    headers: {
      "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
    }
});
console.log(response.data,'rrrrrrr')
 }
 catch(err){
  console.log(err,'err in getting detail')
 }
}

// get_order_detail('4A072764BV4230544')


let capture_order = async (order_id: string) => {
  try {
      const accessToken = await generateAccessToken();
      const response = await axios.post(`${base}/v2/checkout/orders/${order_id}/capture`, null, {
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`
          }
      });

      console.log(response.data, 'capture order response');
      return response.data;
  } catch (error) {
      console.error("Failed to capture order:", error);
  }
};


app.get("/api/paypal/create-order",async(req,res)=>{
  try{
  let id = await createOrder()

  res.send({id:id})
  }
  catch(err){
    console.log(err)
    res.send({message:err})
  }
  
})

app.post("/api/paypal/capture-order",async(req,res)=>{
  let {orderID} = req.body
  try{
  let data= await capture_order(orderID)
  res.send(data)
  }
  catch(err){
    console.log(err)
    res.send({message:err})
  }
})







app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});