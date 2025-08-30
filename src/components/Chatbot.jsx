import React, { useState, useEffect } from "react";
import Groq from "groq-sdk";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import dataContext from "../data/dataContext.json";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Enable browser usage
});

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I assist you today? Ask about our product categories or contact details!" },
  ]);
  const [input, setInput] = useState("");
  const [products, setProducts] = useState([]);

  // Fetch product data from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Check for contact-related queries
      if (
        input.toLowerCase().includes("contact") ||
        input.toLowerCase().includes("phone") ||
        input.toLowerCase().includes("email")
      ) {
        const botMessage = {
          sender: "bot",
          text: `Here are our contact details:\nPhone: ${dataContext.contactDetails.phone}\nEmail: ${dataContext.contactDetails.email}\nAddress: ${dataContext.contactDetails.address}`,
        };
        setMessages((prev) => [...prev, botMessage]);
        setInput("");
        return;
      }

      // Check for social media queries
      if (
        input.toLowerCase().includes("social media") ||
        input.toLowerCase().includes("instagram") ||
        input.toLowerCase().includes("whatsapp") ||
        input.toLowerCase().includes("tiktok")
      ) {
        const botMessage = {
          sender: "bot",
          text: `Here are our social media links:\nWhatsApp: ${dataContext.socialLinks.whatsapp}\nInstagram: ${dataContext.socialLinks.instagram}\nTikTok: ${dataContext.socialLinks.tiktok}`,
        };
        setMessages((prev) => [...prev, botMessage]);
        setInput("");
        return;
      }

      if (
        input.toLowerCase().includes("business") ||
        input.toLowerCase().includes("hours") ||
        input.toLowerCase().includes("open") ||
        input.toLowerCase().includes("24/7")

      ) {
        const botMessage = {
          sender: "bot",
          text: `${dataContext.businessHours.weekdays}`,
        };
        setMessages((prev) => [...prev, botMessage]);
        setInput("");
        return;
      }

      // Prepare context for GROQ based on Firebase data
      const productContext = products
        .map(
          (product) =>
            `Name: ${product.name}, Category: ${product.category}, Price: ₨${product.price}, Sale Price: ₨${product.salePrice || "N/A"}`
        )
        .join("\n");

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `
            Rules:
            - your name is Nianzaka.
            - Provide accurate information based on the following product data:
            - just be so specific. no more than 100 words.
            - don't show prices unless asked for.
            ${productContext}
            Query: "${input}"`,
          },
        ],
        model: "llama-3.3-70b-versatile", // Replace with the appropriate model if needed
      });

      const botMessage = {
        sender: "bot",
        text: completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const botMessage = {
        sender: "bot",
        text: "Sorry, there was an error processing your request. Please try again later.",
      };
      setMessages((prev) => [...prev, botMessage]);
      console.error("GROQ error:", error);
    }

    setInput("");
  };

  const handleClearHistory = () => {
    setMessages([
      { sender: "bot", text: "Hi! Nainzaka here..." },
    ]);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    handleClearHistory(); // Clear history when closing the chat
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chatbot Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#660033] text-white p-4 rounded-full shadow-xl hover:bg-[#4A0025] transition-all flex items-center justify-center"
        style={{
          boxShadow: "0 4px 14px rgba(102, 0, 51, 0.3)",
        }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chatbot Popup */}
      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl w-96 mt-4 overflow-hidden" style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}>
          {/* Header */}
          <div className="bg-[#660033] p-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Nainzaka Assistant</h3>
                <p className="text-xs opacity-80">How can I help you today?</p>
              </div>
              <button onClick={handleCloseChat} className="text-white opacity-70 hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 bg-gray-50 h-80 overflow-y-auto space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.sender === "bot" ? "bg-white text-gray-800 border border-gray-200" : "bg-[#660033] text-white"
                  }`}
                  style={{
                    boxShadow: msg.sender === "bot" ? "0 2px 4px rgba(0,0,0,0.05)" : "0 2px 4px rgba(102, 0, 51, 0.2)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#660033] focus:border-transparent outline-none transition-all"
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#660033] text-white px-4 rounded-xl hover:bg-[#4A0025] transition-all flex items-center justify-center"
                style={{
                  minWidth: "44px",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <button onClick={handleClearHistory} className="mt-3 text-xs text-[#660033] hover:text-[#4A0025] transition-colors">
              Clear conversation history
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;