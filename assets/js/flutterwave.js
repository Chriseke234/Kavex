/**
 * Kavex Flutterwave Engine
 * Secure Escrow Payment Orchestration
 */

window.kavexFLW = {
    async initializePayment(orderData) {
        try {
            // 1. Initiate Order in Backend (Creates pending record)
            const initiateResponse = await fetch('/.netlify/functions/initiate-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const { config, order_id } = await initiateResponse.json();

            // 2. Launch FLW Checkout
            FlutterwaveCheckout({
                public_key: window.__env.FLW_PUBLIC_KEY,
                tx_ref: config.tx_ref,
                amount: orderData.total_amount,
                currency: orderData.currency,
                payment_options: "card, banktransfer, ussd",
                meta: {
                    order_id: order_id,
                    escrow: true,
                    consumer_id: orderData.buyer_id
                },
                customer: {
                    email: window.kavexAuth.currentUser?.email,
                    phone_number: orderData.buyer_phone || "",
                    name: orderData.buyer_name || "",
                },
                customizations: {
                    title: "Kavex Limited",
                    description: "B2B Bulk Order Escrow",
                    logo: "https://kavex.com/assets/images/logo-icon.png",
                },
                callback: async function(payment) {
                    console.log("FLW Callback:", payment);
                    if (payment.status === "successful") {
                        // 3. Verify on Backend
                        const verifyRes = await fetch('/.netlify/functions/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                transaction_id: payment.transaction_id,
                                tx_ref: payment.tx_ref,
                                order_id: order_id
                            })
                        });
                        const verData = await verifyRes.json();
                        
                        if (verData.verified) {
                            showSuccessScreen(order_id);
                        } else {
                            alert("Payment verification failed. Please contact Kavex support.");
                        }
                    } else {
                        alert("Payment failed: " + payment.message);
                    }
                },
                onclose: function() {
                    console.log("Payment closed");
                    const payBtn = document.querySelector('#pay-btn');
                    if (payBtn) {
                        payBtn.disabled = false;
                        payBtn.textContent = 'Pay Securely';
                    }
                }
            });
        } catch (err) {
            console.error("Initiation Error:", err);
            throw err;
        }
    }
};

function showSuccessScreen(order_id) {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('order-ref-display').textContent = `#KVX-${order_id.slice(-8).toUpperCase()}`;
    }
}
