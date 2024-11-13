import { createContext, useState, useEffect } from "react";
import ProductPricesChatBox from "./components/ProductPricesChatBox"
import './index.css'
import { ContextTypes, Message } from "./types";



export const Context = createContext<ContextTypes|null>(null)

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRequestLoading, setRequestLoading] = useState(false);
  const [isAssignWorkflow, setIsAssignWorkflow] = useState(false);
  const [isCheckProgress, setIsCheckProgress] = useState(false);
  const [isCreatePO, setIsCreatePO] = useState(false);
  const [isProductPrice, setProductPrice] = useState(false)
  const [isCreateRFQ, setIsCreateRFQ] = useState(false);
  const [isRecommendQuotes, setIsRecommendQuotes] = useState(false);
  const [inputValue, setInputValue] = useState<string>(""); // New input state
  const [isLoading, setIsLoading] = useState(false);

  const userId = "234";
  const userName = "steve";



  const handleCreatePurchaseRequest = (item: string) => {
     console.log(item)

    // Set the relevant state based on the item
    switch (item) {
      case "Create a Purchase Request":
        setRequestLoading(true);
        break;
      case "Assign Request to Approval Workflow":
        setIsAssignWorkflow(true);
        break;
      case "Check Request Progress":
        setIsCheckProgress(true);
        break;
      case "Create RFQ/RFP for Purchase Request":
        setIsCreateRFQ(true);
        break;
      case "Recommendations for Best Quotes":
        setIsRecommendQuotes(true);
        break;
      case "Create Purchase Order":
        setIsCreatePO(true);
        break;
      case "Know the price of an item":
        setProductPrice(true);
        break;
      default:
        console.log("No matching action for this item.");
    }
  };

  // Trigger the network request when any of the states change
  useEffect(() => {
    const create_request_endpoint = 'http://localhost:5000/create_request';
    const assign_workflow_endpoint = 'http://localhost:5000/assign_workflow';
    const check_progress_endpoint = 'http://localhost:5000/check_progress';
    const create_rfq_endpoint = 'http://localhost:5000/create_rfq';
    const recommend_quotes_endpoint = 'http://localhost:5000/recommend_quotes';
    const create_purchase_order_endpoint = 'http://localhost:5000/create_purchase_order';
    const get_product_price_endpoint = 'https://ai-feature-backend.onrender.com/get_product_prices'

    const fetchData = async () => {
      try {
        const endpoint = isRequestLoading
          ? create_request_endpoint
          : isAssignWorkflow
          ? assign_workflow_endpoint
          : isCheckProgress
          ? check_progress_endpoint
          : isCreateRFQ
          ? create_rfq_endpoint
          : isRecommendQuotes
          ? recommend_quotes_endpoint
          : isCreatePO
          ? create_purchase_order_endpoint
          : isProductPrice
          ? get_product_price_endpoint
          : "";

        if (!endpoint) {
          console.log("No endpoint matched.");
          return;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "start",
            userId,
            userName
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

    // Only call fetchData if one of the states is true
    if (isRequestLoading || isAssignWorkflow || isCheckProgress || isCreateRFQ || isRecommendQuotes || isCreatePO || isProductPrice) {
      fetchData();
    }
  }, [isRequestLoading, isAssignWorkflow, isCheckProgress, isCreateRFQ, isRecommendQuotes, isCreatePO, isProductPrice]);

  return (
    <div>
      <Context.Provider
        value={{
          handleCreatePurchaseRequest,
          messages,
          setMessages,
          isRequestLoading,
          inputValue,
          setInputValue,
          setRequestLoading,
          isAssignWorkflow,
          isCheckProgress,
          isCreatePO,
          isRecommendQuotes,
          isCreateRFQ,
          setIsAssignWorkflow,
          setIsCheckProgress,
          setIsCreatePO,
          setIsCreateRFQ,
          setIsRecommendQuotes,
          isProductPrice,
          setProductPrice,
          isLoading,
          setIsLoading,

        }}
      >
        <ProductPricesChatBox />
      </Context.Provider>
    </div>
  );
}

export default App;
