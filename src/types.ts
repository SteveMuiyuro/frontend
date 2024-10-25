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
  handleCreatePurchaseRequest:() => Promise<void>,
  messages:Message[],
  setMessages:React.Dispatch<React.SetStateAction<Message[]>>,
  isRequestLoading:boolean,
  inputValue:string,
  setInputValue:React.Dispatch<React.SetStateAction<string>>
  setRequestLoading:React.Dispatch<React.SetStateAction<boolean>>
}
