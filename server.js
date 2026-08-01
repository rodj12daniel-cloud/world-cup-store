require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors());

// Get your secret key from PayMongo Dashboard -> Developers -> Keys
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
if (!PAYMONGO_SECRET_KEY) {
    console.warn("Missing PAYMONGO_SECRET_KEY environment variable. Checkout creation will fail until it is set.");
}

app.post("/api/create-checkout", async (req, res) => {
    try {
        const { items } = req.body;
        const origin = req.headers.origin || `http://localhost:${PORT}`;

        // Transform cart items into PayMongo format
        // Note: PayMongo amounts are in centavos (e.g., 500 PHP = 50000)
        const lineItems = items.map(item => ({
            name: item.name,
            amount: Math.round(item.price * 100),
            currency: "PHP",
            quantity: item.quantity
        }));

        // Call PayMongo API
        const response = await axios.post(
            "https://api.paymongo.com/v2/checkout_sessions",
            {
                data: {
                    attributes: {
                        line_items: lineItems,
                        payment_method_types: [
                            "gcash",
                            "paymaya",
                            "card",
                            "qrph",
                            "dob" // Direct Online Banking (BPI/UnionBank)
                        ],
                        send_email_receipt: true,
                        show_description: true,
                        show_line_items: true,
                        success_url: `${origin}/success.html`,
                        cancel_url: `${origin}/index.html`
                    }
                }
            },
            {
                headers: {
                    // PayMongo uses Basic Auth with the secret key as username
                    Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // Send the generated PayMongo Checkout URL back to the frontend
        const checkoutUrl = response.data.data.attributes.checkout_url;
        res.json({ checkoutUrl });

    } catch (error) {
        console.error("PayMongo API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create PayMongo checkout session" });
    }
});

app.listen(PORT, () => {
    console.log(`PayMongo backend server running on http://localhost:${PORT}`);
});