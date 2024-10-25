import { createContext, useState } from "react";
import ProductPricesChatBox from "./components/ProductPriceChatBox"
import "./index.css"
import { ContextTypes, Message } from "./types";



export const Context = createContext<ContextTypes|null>(null)

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRequestLoading, setRequestLoading] = useState(false)
  const [inputValue, setInputValue] = useState<string>("");  // New input state

  const userId = "123"

  const handleCreatePurchaseRequest = async () => {
    setRequestLoading(true);


    try {
      const response = await fetch("https://backend-api-pjri.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "start",
          userId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage: Message = { type: "bot", text: data.response };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error starting chat:", error);
      const errorMessage: Message = {
        type: "bot",
        text: "Error starting chat.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };




  return (
    <div>
      <Context.Provider value={{
        handleCreatePurchaseRequest,
        messages,
        setMessages,
        isRequestLoading,
        inputValue,
        setInputValue,
        setRequestLoading
      }}>
      <ProductPricesChatBox />
      </Context.Provider>
    </div>
  );
}

export default App
