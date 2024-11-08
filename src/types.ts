export type Supplier = {
  supplier: string;
  product_name: string;
  price: string;
  location: string;
  product_image_url: string;
  supplier_contact:string;
  email:string;
  website:string;
}

export type Message = {
  type: 'user' | 'bot';
  text?: string; // For user text and error messages
  data?: Supplier[]; // For bot responses with supplier data
  files?: File[];  // New field for attachments
};


export type ContextTypes = {
  handleCreatePurchaseRequest: (item: string) => void,
  messages:Message[],
  setMessages:React.Dispatch<React.SetStateAction<Message[]>>,
  isRequestLoading:boolean,
  inputValue:string,
  setInputValue:React.Dispatch<React.SetStateAction<string>>,
  setRequestLoading:React.Dispatch<React.SetStateAction<boolean>>,
  isAssignWorkflow:boolean,
  isCheckProgress:boolean,
  isCreatePO:boolean,
  isRecommendQuotes:boolean,
  isCreateRFQ:boolean,
  setIsAssignWorkflow:React.Dispatch<React.SetStateAction<boolean>>,
  setIsCheckProgress:React.Dispatch<React.SetStateAction<boolean>>,
  setIsCreatePO:React.Dispatch<React.SetStateAction<boolean>>,
  setIsCreateRFQ:React.Dispatch<React.SetStateAction<boolean>>,
  setIsRecommendQuotes:React.Dispatch<React.SetStateAction<boolean>>
  isProductPrice:boolean
  setProductPrice:React.Dispatch<React.SetStateAction<boolean>>
}


export type Data = {
    exit?: boolean; // Boolean to indicate end of session
    response: string; // Final message to be displayed when exiting
    next_prompt?: string; // Optional next prompt if session continues
    suppliers?: Supplier[]; // Optional suppliers array if fetching supplier data
    message?: string; // Optional message field if `isProductPrice` is false
}
