import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";
import { useRouter } from "next/router";
import { useState } from "react";

// This value is from the props in the UI
const style = {"layout":"vertical"};

// Custom component to wrap the PayPalButtons and show loading spinner
const ButtonWrapper = ({ showSpinner }) => {
    let router = useRouter()
    const [{ isPending }] = usePayPalScriptReducer();
    let [order_id,set_order_id]=useState('')

    console.log(order_id,'ooooooooooo')

    function createOrder() {
        return fetch("http://localhost:8000/api/paypal/create-order")
            .then((response) => response.json())
            .then((order) => {
                set_order_id(order.id)
                return order.id;
            });
    }
    
    function onApprove(data) {
        // replace this url with your server
      
        return fetch('http://localhost:8000/api/paypal/capture-order', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orderID: data.orderID,
            }),
        })
            .then((response) => response.json())
            .then((orderData) => {
                let status = orderData.status
                if(status==='COMPLETED')
                router.push("/success")
            });
    }
    

    return (
        <>
            { (showSpinner && isPending) && <div className="spinner" /> }
            <PayPalButtons
                style={style}
                disabled={false}
                forceReRender={[style]}
                fundingSource={undefined}
                createOrder={createOrder}
                onApprove={onApprove}
            />
        </>
    );
}

export default function App() {
    return (
        <div style={{ maxWidth: "750px", minHeight: "200px" }}>
            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_CLIENT_ID, components: "buttons", currency: "USD" }}>
                <ButtonWrapper showSpinner={false} />
            </PayPalScriptProvider>
        </div>
    );
}