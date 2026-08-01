const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { items } = req.body;
    const origin = req.headers.origin || `http://localhost:3000`;
    const successUrl = `${origin}/success.html`;
    const cancelUrl = `${origin}/index.html`;

    const lineItems = items.map((item) => ({
      name: item.name,
      amount: Math.round(item.price * 100),
      currency: "PHP",
      quantity: item.quantity,
    }));

    const response = await axios.post(
      "https://api.paymongo.com/v2/checkout_sessions",
      {
        data: {
          attributes: {
            line_items: lineItems,
            payment_method_types: ["gcash", "paymaya", "card", "qrph", "dob"],
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            success_url: successUrl,
            cancel_url: cancelUrl,
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.PAYMONGO_SECRET_KEY}:",
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      },
    );

    const checkoutUrl = response.data.data.attributes.checkout_url;
    res.status(200).json({ checkoutUrl });
  } catch (error) {
    console.error("PayMongo API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create PayMongo checkout session" });
  }
};
