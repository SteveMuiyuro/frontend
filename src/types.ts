export type Supplier = {
  supplier: string;
  product_name: string;
  price: string;
  location: string;
  product_image_url: string;
  supplier_contact:string;
  email:string;
  product_url:string;
}

export type Message = {
  type: 'user' | 'bot';
  priorities?:string[];
  text?: string; // For user text and error messages
  data?: Supplier[]; // For bot responses with supplier data
  files?: File[];  // New field for attachments
  rfqs?:RFQ[] | BestQuotes[];  // bestQuotes?:BestQuotes[]
  recentPrs?:RecentPrs[] | Workflows
  selectedPR?:SelectedPR
  rfqDetails?:CreatedRFQ
  available_quotes?:Quote[]
  final_quote?:Quote

};

type CreatedRFQ = {
  items: string,
  dueDate: string,
  description: string,
  type: string,
  status: string,
  createdAt: string,
  updatedAt: string,
  requestId: string,

}

type SelectedPR = {
  status: string,
  title: string,
  workflow: string,
  approving_department: string,
  actions: string[]
  created_at: string,
  department: string,
}

type Workflow = string;
type Workflows = Workflow[];


export type RecentPrs = {
  requestId:string,
  title:string
}

type RFQ = {
  ID:number,
  Title:string,
}

type Quote = {
  item:string,
  quantity:number,
  price:number,
  vendor:Vendor,
  delivery_date:string,
  id:string
}

type BestQuotes ={
  criteria_matched:string,
  quote:Quote
}

type Vendor = {
  firstName:string,
  lastName:string
}

export type ContextTypes = {
  handleRequest: (item: string) => void,
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
  setIsLoading:React.Dispatch<React.SetStateAction<boolean>>
  isLoading:boolean
  userName:string,
  userId:string
}


export type Data = {
    exit?: boolean; // Boolean to indicate end of session
    response: string; // Final message to be displayed when exiting
    next_prompt?: string; // Optional next prompt if session continues
    suppliers?: Supplier[]; // Optional suppliers array if fetching supplier data
    message?: string; // Optional message field if `isProductPrice` is false
}
