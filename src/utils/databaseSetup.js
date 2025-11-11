// Database setup checker
import supabase from "./supabase";

export const checkDatabaseSetup = async () => {
  try {
    // Test if the customers table exists
    const { data, error } = await supabase
      .from("customers")
      .select("id")
      .limit(1);

    if (error) {
      if (
        error.message.includes('relation "public.customers" does not exist')
      ) {
        return {
          isSetUp: false,
          error:
            "Database tables not created. Please run the SQL schema from database_schema.sql in your Supabase SQL Editor first.",
          solution:
            "Copy the entire content of database_schema.sql and run it in your Supabase SQL Editor.",
        };
      }
      if (
        error.message.includes("406") ||
        error.message.includes("Not Acceptable")
      ) {
        return {
          isSetUp: false,
          error:
            "Database access issue. Tables may exist but RLS policies are blocking access.",
          solution:
            "Ensure RLS policies are properly set up in the database_schema.sql file.",
        };
      }
      return {
        isSetUp: false,
        error: `Database error: ${error.message}`,
        solution:
          "Check your Supabase database setup and ensure tables are created correctly.",
      };
    }

    return {
      isSetUp: true,
      error: null,
      solution: null,
    };
  } catch (err) {
    return {
      isSetUp: false,
      error: `Connection error: ${err.message}`,
      solution: "Check your Supabase URL and API key configuration.",
    };
  }
};

export const createMockOrderData = (customerData, cartItems) => {
  // Fallback function to create order data without database
  return {
    orderNumber: `ORD${Date.now()}`,
    customer: customerData,
    items: cartItems,
    totalAmount: cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
    status: "pending",
    paymentStatus: "pending",
    createdAt: new Date().toISOString(),
    easypaisaDetails: {
      accountNumber:
        import.meta.env.VITE_EASYPAISA_ACCOUNT_NUMBER || "03XX-XXXXXXX",
      accountTitle:
        import.meta.env.VITE_EASYPAISA_ACCOUNT_TITLE || "Your Store Name",
      instructions: [
        "1. Open Easypaisa Mobile App",
        "2. Go to Send Money",
        "3. Enter the account number above",
        "4. Enter the exact amount shown",
        "5. Add reference: Order #" + `ORD${Date.now()}`,
        "6. Complete the transaction",
        "7. Save the transaction receipt",
      ],
    },
  };
};
