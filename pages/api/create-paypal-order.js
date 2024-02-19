export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed', allowedMethods: ['POST'] });
    }

    const { cart } = req.body;

    try {
        const orderId = await createOrder(products);
        return res.status(200).json({ orderId });
    } catch (error) {
        console.error('Error creating PayPal order:', error.message);
        return res.status(500).json({ error: 'Error creating PayPal order' });
    }
}