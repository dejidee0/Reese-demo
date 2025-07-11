export const initializePaystack = (email, amount, onSuccess, onClose) => {
  if (typeof window === "undefined") {
    console.error("Paystack not available on server");
    onClose();
    return;
  }

  if (!window.PaystackPop) {
    console.error("Paystack not loaded");
    onClose();
    return;
  }

  const handler = PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder",
    email,
    amount: amount * 100, // Convert to kobo
    currency: "NGN",
    callback: (response) => {
      onSuccess(response);
    },
    onClose: () => {
      onClose();
    },
  });

  handler.openIframe();
};

export const verifyPayment = async (reference) => {
  try {
    const response = await fetch(`/api/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reference }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false, error: error.message };
  }
};
