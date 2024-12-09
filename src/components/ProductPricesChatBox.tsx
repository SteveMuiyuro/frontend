import React, {
  useState,
  FormEvent,
  ChangeEvent,
  useRef,
  useEffect,
  useContext,
} from "react";
import { FaArrowUp } from "react-icons/fa6";
import { MdOutlineAttachFile } from "react-icons/md";
import { FaStop } from "react-icons/fa6";
import { Message, Data, RecentPrs } from "../types";
import Results from "./Results";
import { FaDownload, FaTimes } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import Files from "./Files";
import { Context } from "../App";
import { IoMdArrowRoundBack } from "react-icons/io";
import { formatDateWithSuffix } from "../helper";


pdfjsLib.GlobalWorkerOptions.workerSrc = `/node_modules/pdfjs-dist/build/pdf.worker.mjs`;

const ProductPriceChatBox: React.FC = () => {

  const [isFileLoading, setIsFileLoading] = useState(false); // New state for file loading
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [introMessage, setIntroMessage] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isExit, setIsExit] = useState(false);
  const [nextPrompt, setNextPrompt] = useState<string | null>(null)
  const [isActiveBackButton, setActiveBackButton] = useState(false)
  const [rfqsResult, setRfqsResult] = useState<string | null>(null)
  const [recentPrsResult, setRecentPrsResult] = useState<string | null>()
  const [bestQuoteResult, setBestQuoteResult] = useState<string | null>(null)
  const [availableWorkflowsResult, setAvailableWorkflowsResult] = useState<string | null>(null)
  const [priorityResult, setPriorityResult] = useState<string | null>(null)
  const [selectedPRResult, setSelectedPRResult] = useState<string | null>(null)
  const [rfqDetailResults,setRfqDetailResults] = useState<string | null>(null)




  const context = useContext(Context);

  if (!context) {
    throw new Error("Items must be used within a context provider");
  }
  const { messages, setMessages, inputValue, setInputValue, isRequestLoading, setRequestLoading, isAssignWorkflow, setIsAssignWorkflow, isCheckProgress, setIsCheckProgress, isCreatePO, setIsCreatePO, isCreateRFQ, setIsCreateRFQ, setIsRecommendQuotes,  isRecommendQuotes, isProductPrice, setProductPrice, isLoading, setIsLoading,userName, userId } = context;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() && !attachedFile) return; // Ensure we have either a prompt or a file
    if (isFileLoading) return; // Prevent submission while file is loading

    const userMessage: Message = {
      type: "user",
      text: inputValue,
      files: attachedFile ? [attachedFile] : [], // Attach the current file
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setInputValue("");
    setAttachedFile(null);
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    const product_prices_endpoint = 'https://ai-feature-backend.onrender.com/product_prices'
    const create_request_endpoint = 'https://ai-feature-backend.onrender.com/create_request'
    const assign_workflow_endpoint = 'https://ai-feature-backend.onrender.com/assign_workflow'
    const check_progress_endpoint = 'https://ai-feature-backend.onrender.com/check_progress'
    const create_rfq_endpoint = 'https://ai-feature-backend.onrender.com/create_rfq'
    const recommend_quotes_endpoint = 'https://ai-feature-backend.onrender.com/recommend_quotes'
    const create_purchase_order_endpoint = 'http://localhost:5000/create_purchase_order'
    const get_product_price_endpoint = 'https://ai-feature-backend.onrender.com/get_product_prices'

    const activeUrl = isRequestLoading
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
          : product_prices_endpoint

    try {

      const response = await fetch( activeUrl , {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isRequestLoading ||
          isAssignWorkflow ||
          isCheckProgress ||
          isCreatePO ||
          isCreateRFQ ||
          isRecommendQuotes||
          isProductPrice
            ? { message: inputValue, userId: userId, userName:userName }
            : { prompt: `${inputValue} ${fileContent || ""}`, limit: 8 }
        ),
        signal: controller.signal,
      } as RequestInit);

      if(activeUrl === product_prices_endpoint){
        setActiveBackButton(true)
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      console.log(data)

          // Handle end of session
      if (data.exit === true) {
        resetStateAndExit(data);
        return;
      }

      if (isProductPrice) {
        setIntroMessage(data.response.message);
        const botMessage: Message = data.response.suppliers
        ? { type: "bot", data: data.response.suppliers }
        : { type: "bot", text: data.response}


      setMessages((prevMessages) => [...prevMessages, botMessage]);

      }

      else if (isRecommendQuotes) {
          setIntroMessage(data.response.message);

          const botMessage: Message = data.available_rfqs
            ? { type: 'bot', rfqs: data.available_rfqs }
            : data.best_quotes
            ? { type: 'bot', rfqs: data.best_quotes }
            : { type: 'bot', text: data.response };

          setMessages((prevMessages) => [...prevMessages, botMessage]);
        }

        else if (isCreateRFQ) {
          setIntroMessage(data.response.message);

          const botMessage: Message = data.recent_prs
            ? { type: 'bot', recentPrs: data.recent_prs }
            : data.rfq_details
            ? { type: 'bot', rfqDetails: data.rfq_details}
            : { type: 'bot', text: data.response };

          setMessages((prevMessages) => [...prevMessages, botMessage]);
        }

      else if (isAssignWorkflow) {
          setIntroMessage(data.response.message);

          const botMessage: Message = data.recent_prs
            ? { type: "bot", recentPrs: data.recent_prs }
            : data.available_workflows
            ? { type: "bot", recentPrs: data.available_workflows}
            : { type: "bot", text: data.response}

          setMessages((prevMessages) => [...prevMessages, botMessage]);
        }

      else if (isCheckProgress) {
          setIntroMessage(data.response.message);
          console.log(selectedPRResult)

          const botMessage: Message = data.recent_prs
            ? { type: "bot", recentPrs: data.recent_prs }
            : data.selected_PR
            ? { type: "bot", selectedPR: data.selected_PR}
            : { type: "bot", text: data.response}

          setMessages((prevMessages) => [...prevMessages, botMessage]);
        }



      else if(isRequestLoading){
        setIntroMessage(data.response.message);

        const botMessage: Message = data.priorities
        ? { type: "bot", priorities: data.priorities}
        : { type: "bot", text: data.response}

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      }

      else {
        setIntroMessage(data.message);
        const botMessage: Message = data.suppliers
        ? { type: "bot", data: data.suppliers }
        : { type: "bot", text: data.response}

      setMessages((prevMessages) => [...prevMessages, botMessage]);

      }

      if(data.available_rfqs){
        setRfqsResult(data.response)
      }

      if(data.best_quotes){
        setBestQuoteResult(data.response)
      }

      if(data.priorities){
        setPriorityResult(data.response)
      }

      if(data.selected_PR){
        setSelectedPRResult(data.response)
      }

      if(data.available_workflows){
        setAvailableWorkflowsResult(data.response)
      }

      if(data.recent_prs){
        setRecentPrsResult(data.response)
      }

      if(data.rfq_details){
        setRfqDetailResults(data.response)
      }

      if(data.next_prompt){
        setNextPrompt(data.next_prompt)
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        const errorMessage: Message = {
          type: "bot",
          text: "Error retrieving data",
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    }

    setIsLoading(false);
    setAbortController(null);
  };


  const resetStateAndExit = (data:Data) => {
    // Add the final bot message to indicate the end of the session
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "bot", text: data.response },
    ]);

    // Clear other states
    setRequestLoading(false);
    setIsAssignWorkflow(false);
    setIsCheckProgress(false);
    setIsCreatePO(false);
    setIsCreateRFQ(false);
    setIsRecommendQuotes(false);
    setProductPrice(false);
    setIsExit(true);
    setIsLoading(false);

    // Delay clearing the messages to ensure "Thank you" message displays
    setTimeout(() => {
      setMessages([]);
      setIsExit(false);
    }, 5000); // Adjust the delay as needed for smooth display
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
    }
  };
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type === "application/pdf") {
      setAttachedFile(file);
      setIsFileLoading(true); // Start loading state for file processing

      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileContent = event.target?.result as ArrayBuffer;

        try {
          const pdf = await pdfjsLib.getDocument({ data: fileContent }).promise;
          let extractedText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            extractedText += pageText + "\n";
          }
          console.log(extractedText);

          setFileContent(extractedText);
        } catch (error) {
          console.error("Error loading PDF: ", error);
        } finally {
          setIsFileLoading(false); // End loading state for file processing
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };
  const handleBackClick = () => {
    setRequestLoading(false);
    setIsAssignWorkflow(false);
    setIsCheckProgress(false);
    setIsCreatePO(false);
    setIsCreateRFQ(false);
    setIsRecommendQuotes(false);
    setProductPrice(false);
    setIsExit(false);
    setIsLoading(false);
    setMessages([])
    setActiveBackButton(false)

  };
  const handleRemoveFile = () => {
    setAttachedFile(null); // Clear the attached file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input field to null
    }
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col items-center min-h-screen relative">
       {!isRequestLoading && !isAssignWorkflow && !isCheckProgress && !isCreatePO && !isCreateRFQ && !isRecommendQuotes && !isProductPrice && (messages.length === 0 && !isExit && <Files userName={userName} />)}
      <div className="chat-messages ml-8 md:w-[680px] max-h-[80vh] overflow-y-auto mb-20 no-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="flex flex-col justify-start w-full mt-[70px]"
          >
            {/* Bot message with data */}
            {msg?.type === "bot" && msg?.data ? (
              <div className="flex flex-col gap-[20px] justify-center items-baseline w-full">
                <div className="flex items-start justify-start w-full gap-5">
                  <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex flex-shrink-0 self-start"></div>
                  {introMessage && (
                    <p className="p-[12px] max-w-[400px] md:max-w-[610px] flex bg-blue-100 rounded-lg">{introMessage}</p>
                  )}
                </div>
                <div className="flex flex-col items-center w-full">
                  <div className="flex flex-col gap-5 w-[300px] md:w-full flex-wrap items-start">
                    {msg.data.map((result, i) => (
                      <Results key={i} result={result} />
                    ))}
                  </div>

                  <div className="flex items-start justify-start w-full gap-5">
                  {nextPrompt && <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex flex-shrink-0 self-start"></div>}
                  {nextPrompt && <p className="bg-blue-100 p-[10px] mr-10 rounded-lg">{nextPrompt}</p>}
                  </div>
                </div>
              </div>
            ):msg?.type === "bot" && msg?.rfqDetails ? (
              /* Bot message with rfqDetails */
              <div className="flex flex-col gap-5 w-full">
                <div className="flex items-start justify-start w-full gap-5">
                  {rfqDetailResults && <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex flex-shrink-0 self-start"></div>}

                  <div className="flex flex-col gap-4">
                  {rfqDetailResults && <p className="bg-blue-100 p-[10px] mr-10 rounded-lg">{rfqDetailResults}</p>}
                    <div className="flex flex-col gap-3 p-4 bg-blue-100 rounded-lg shadow-md">
                      <p><strong>Items:</strong> {msg.rfqDetails.items}</p>
                      <p><strong>Due Date:</strong> {formatDateWithSuffix(msg.rfqDetails.dueDate)}</p>
                      <p><strong>Description:</strong> {msg.rfqDetails.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ):msg?.type === "bot" && msg?.selectedPR ? (
              /* Bot message with selectedPR */
              <div className="flex flex-col gap-5 w-full">
                <div className="flex items-start justify-start w-full gap-5">
                {selectedPRResult && <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex flex-shrink-0 self-start"></div>}
                <div className="flex flex-col gap-4">
                {selectedPRResult && <p className="bg-blue-100 p-[10px] mr-10 rounded-lg">{selectedPRResult}</p>}
                  <div className="flex flex-col gap-3 p-4 bg-blue-100 rounded-lg shadow-md">
                    <p><strong>Status:</strong> {msg.selectedPR.status}</p>
                    <p><strong>Title:</strong> {msg.selectedPR.title}</p>
                    {msg.selectedPR.workflow && <p><strong>Workflow Assigned:</strong> {msg.selectedPR.workflow}</p>}
                    {msg.selectedPR.approving_department && <p><strong>Approving Department:</strong> {msg.selectedPR.approving_department}</p>}
                    {msg.selectedPR.actions.length > 0 && <p><strong>Actions:</strong></p>}
                    {msg.selectedPR.actions.length > 0 && (
                          <div>
                            <p><strong>Actions:</strong></p>
                            <ul className="list-disc pl-5">
                              {msg.selectedPR.actions.map((action, i) => (
                                <li key={i}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    <p><strong>Created At:</strong> {formatDateWithSuffix(msg.selectedPR.created_at)}</p>
                    {msg.selectedPR.department && <p><strong>Department:</strong> {msg.selectedPR.department}</p>}
                  </div>
                </div>
                </div>
              </div>
            ): msg?.type === "bot" && msg?.priorities ? (
              <div className="flex items-start justify-start gap-5 w-full">
                   {priorityResult && <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex flex-shrink-0 self-start"></div>}
                   <div className="flex flex-col gap-4">
                      {priorityResult && <p className="bg-blue-100 p-[10px] mr-10 rounded-lg">{priorityResult}</p>}
                      <div className="flex gap-2">
                        {msg.priorities.map((priority, i) => (
                          <p key={i} className="bg-blue-100 p-2 rounded-lg shadow-md text-sm max-w-[100px]">
                            {priority}
                          </p>
                        ))}
                      </div>
                   </div>

              </div>):msg?.type === "bot" && msg?.recentPrs ? (
              <div className="flex flex-col items-start justify-start min-w-auto gap-5">
                {/* Intro message */}
                {introMessage && (
                  <p className="p-[12px] max-w-[400px] md:max-w-[610px] flex bg-blue-100 rounded-lg">
                    {introMessage}
                  </p>
                )}

                <div className="flex items-start justify-start w-full gap-5">

                  <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-start justify-start w-full gap-5">


                  <div className="flex flex-col gap-4">

                      {/* Case 1: recentPrs is an array of RecentPrs objects */}
                    {Array.isArray(msg.recentPrs) && typeof msg.recentPrs[0] === "object" && recentPrsResult && (
                      <>
                       <div className="flex items-start justify-start w-full gap-5">
                        {(recentPrsResult) && <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex flex-shrink-0 self-start"></div>}
                        <div className="flex flex-col gap-4">
                        {recentPrsResult && <p className="bg-blue-100 p-[10px] mr-10 rounded-lg">{recentPrsResult}</p>}
                        <div className="grid grid-cols-2 gap-4 text-sm bg-blue-100 p-4 rounded-lg md:max-w-[610px]">
                          {/* Headers */}
                          <div className="font-bold text-start">Request ID</div>
                          <div className="font-bold text-start">Title</div>
                          {/* Map over RecentPrs */}
                          {msg.recentPrs?.map((pr , i) => (
                            <React.Fragment key={`recent-pr-${i}`}>
                              <div className="text-start font-medium">{(pr as RecentPrs).requestId}</div>
                              <div className="text-start">{(pr as RecentPrs).title}</div>
                            </React.Fragment>
                          ))}
                        </div>
                        </div>
                      </div>
                      </>
                    )}

                    {/* Case 2: recentPrs is a Workflows array */}

                    {Array.isArray(msg.recentPrs) && typeof msg.recentPrs[0] === "string" && availableWorkflowsResult &&(
                      <>
                       <div className="flex items-start justify-start w-full gap-5">
                          {availableWorkflowsResult && <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex flex-shrink-0 self-start"></div>}
                          <div className="flex flex-col gap-4">
                          {availableWorkflowsResult && <p className="bg-blue-100 p-[10px] mr-10 rounded-lg">{availableWorkflowsResult}</p>}
                          <div className="flex flex-col gap-3 bg-blue-100 p-4 min-w-auto rounded-lg md:max-w-auto">
                          {/* <div className="font-bold text-start mb-2">Workflows</div> */}
                          {/* Map over Workflows */}
                          {msg.recentPrs?.map((workflow, i) => (
                            <div
                              key={`workflow-${i}`}
                              className="text-start bg-blue-200 p-3 rounded-lg"
                            >
                              {typeof workflow === "string" && workflow}
                            </div>
                          ))}
                        </div>
                          </div>
                      </div>
                      </>
                    )}
                  </div>
                  </div>
                  </div>
                </div>
              </div>
            ) :
            msg?.type === "bot" && msg?.rfqs ? (
              <div className="flex items-start justify-start min-w-auto gap-5">
                <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex flex-shrink-0 self-start"></div>
                {introMessage && (
                  <p className="p-[12px] max-w-[400px] md:max-w-[610px] flex bg-blue-100 rounded-lg">{introMessage}</p>
                )}
                <div className="flex flex-col gap-3 ">

                {msg?.rfqs && Array.isArray(msg.rfqs) && (
                    <>
                      {/* Conditionally render based on the type of rfqs */}
                      {typeof msg.rfqs[0] === 'object' && 'ID' in msg.rfqs[0] && rfqsResult && (
                        <div className="p-[12px] max-w-[400px] md:max-w-[610px] md:flex md:text-justify text-start bg-blue-100 rounded-lg">
                          {rfqsResult}
                        </div>
                      )}
                            {msg?.rfqs && msg.rfqs.some(result => typeof result === 'object' && 'ID' in result && 'Title' in result) && (
                              <div className="grid grid-cols-2 gap-4 w-full text-sm bg-blue-100 p-4 rounded-lg">

                                <div className="font-bold text-start">ID</div>
                                <div className="font-bold text-start">Title</div>


                                {msg.rfqs.map((result, i) => {
                                  if (typeof result === 'object' && 'ID' in result && 'Title' in result) {
                                    return (
                                      <React.Fragment key={`rfq-${i}`}>
                                        <div className="text-start font-medium">{result.ID}</div>
                                        <div className="text-start">{result.Title}</div>

                                      </React.Fragment>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            )}

                      {typeof msg.rfqs[0] === 'object' && 'quote' in msg.rfqs[0] && bestQuoteResult && (
                        <div className="p-[12px] max-w-[400px] md:max-w-[610px] md:flex md:text-justify text-start bg-blue-100 rounded-lg">
                          {bestQuoteResult}
                        </div>
                      )}

                      {msg.rfqs.map((result, i) => {
                        if (typeof result === 'object' && 'quote' in result) {
                          const { item, quantity,  price, vendor} = result.quote;
                          return (
                                    <div
                                      key={`quote-${i}`}
                                      className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 max-w-[400px] md:max-w-[610px] text-sm bg-blue-100 p-4 rounded-lg"
                                    >
                                      {/* Titles (Header Row for md and larger) */}
                                      <div className="hidden md:block font-bold text-center">Vendor</div>
                                      <div className="hidden md:block font-bold text-center">Item</div>
                                      <div className="hidden md:block font-bold text-center">Quantity</div>
                                      <div className="hidden md:block font-bold text-center">Price Per Unit</div>
                                      <div className="hidden md:block font-bold text-center">Total</div>

                                      <div className="font-bold md:hidden text-left">Vendor</div>
                                      <div className="text-right md:text-center">
                                        {vendor.firstName} {vendor.lastName}
                                      </div>
                                      <div className="font-bold md:hidden text-left">Item</div>
                                      <div className="text-right md:text-center">{item}</div>

                                      <div className="font-bold md:hidden text-left">Quantity</div>
                                      <div className="text-right md:text-center">{quantity}</div>

                                      <div className="font-bold md:hidden text-left">Price Per Unit</div>
                                      <div className="text-right md:text-center">{price}</div>

                                      <div className="font-bold md:hidden text-left">Total</div>
                                      <div className="text-right md:text-center">
                                        {new Intl.NumberFormat('en-US').format(quantity * price)}
                                      </div>
                                    </div>

                          );
                        }
                        // Fallback for unexpected cases
                        return null;
                      })}
                    </>
                  )}
                </div>
            </div>
            ):

            msg?.type === "bot" && msg?.text ? (
              /* Bot message with text */
              <div className="flex gap-[20px] justify-start w-[300px] md:w-full">
                <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex-shrink-0"></div>
                <div>
                  {msg.files && msg.files.length > 0 && (
                    <div className="mb-2 w-full bg-slate-950">
                      {msg.files.map((file, fileIndex) => (
                        <div
                          key={fileIndex}
                          className="flex items-center justify-between mb-1 p-2 border border-gray-300 bg-gray-100 rounded-md"
                        >
                          <div className="truncate">{file.name}</div>
                          <a
                            href={URL.createObjectURL(file)}
                            download={file.name}
                          >
                            <FaDownload className="text-gray-500 cursor-pointer" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-[12px] max-w-[400px] md:max-w-[610px] md:flex md:text-justify text-start bg-blue-100 flex rounded-lg">
                    {msg.text}
                  </div>
                </div>
              </div>
            ) : msg?.type === "user" ? (
              /* User message */
              <div className="flex gap-[20px] justify-start w-[300px] md:w-full">
                <div className="w-[32px] h-[32px] rounded-full  flex-shrink-0">
                  <img
                    src="/images/Profile_image.jpeg"
                    alt="profile_image"
                    className="rounded-full"
                  />
                </div>
                <div>
                  <div className="p-[12px] max-w-[400px] md:max-w-[610px] bg-gray-300 flex rounded-lg">
                    {msg.text}
                  </div>
                  {msg.files && msg.files.length > 0 && (
                    <div className="mt-2">
                      {msg.files.map((file, fileIndex) => (
                        <div
                          key={fileIndex}
                          className="flex items-center justify-between mb-1 p-2 border border-gray-300 bg-gray-100 rounded-md"
                        >
                          <div className="truncate">{file.name}</div>
                          <a
                            href={URL.createObjectURL(file)}
                            download={file.name}
                          >
                            <FaDownload className="text-gray-500 cursor-pointer" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Default message rendering */
              <div className="flex gap-[20px] justify-start items-center md:w-full">
                <img
                  className="w-[32px] h-[32px] rounded-full"
                  src="./images/Profile_image.jpeg"
                  alt=""
                />
                <div className="p-[5px] max-w-[300px] mr-10 px-[10px] md:p-[12px]md: min-w-[300px] text-start bg-gray-300 flex rounded-lg">
                  {msg?.text}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading  && (
          <div className="flex gap-[20px] justify-start w-full mt-[70px]">
            <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex-shrink-0"></div>
            <div className="flex flex-col gap-5 w-full">
              <div className="flex justify-start items-center text-gray-600 gap-2">
                <AiOutlineLoading3Quarters className="animate-spin" size={24} />
                <p>Please wait as I process your request...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      <div className="fixed bottom-1 w-full flex justify-center md:w-[680px]">
        <form
          onSubmit={handleSubmit}
          className="md:w-[680px] rounded-[40px] md:min-h-[68px] flex flex-col relative bottom-3 box-border bg-gray-300"
        >

          {/* Display attached file */}
          {attachedFile && (
            <div className="flex items-center justify-between w-[250px] md:w-[250px] ml-6 mb-2 p-2 border border-gray-300 bg-white rounded-md shadow-sm relative mt-2  ">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <MdOutlineAttachFile className="text-white h-6 w-6 rotate-45" />
                </div>
                <div className="w-[180px] truncate font-semibold text-gray-700">
                  {attachedFile.name}
                </div>
                <FaTimes
                  className="text-gray-500 hover:text-red-500 cursor-pointer ml-auto p-2 absolute -right-0.5 -top-0.5"
                  style={{ fontSize: "30px" }}
                  onClick={handleRemoveFile}
                />
              </div>
            </div>
          )}

          {/* Textarea */}
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder="Ask anything..."
            className="md:placeholder:outline-none rounded-[40px] placeholder:text-sm w-[300px] md:w-full md:min-h-[68px] resize-none bg-gray-300 px-10 md:px-14 md:pr-14 relative py-6 outline-none"
            ref={textAreaRef}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as FormEvent);
              }
            }}
          />

          {/* Submit button */}
          <button
            className={`absolute rounded-full h-[32px] w-[32px] bottom-5 right-3 md:bottom-5 md:right-3 flex justify-center items-center ${
              isLoading
                ? "bg-[#072630]"
                : inputValue || attachedFile
                ? "bg-[#072630]"
                : "bg-gray-400"
            }`}
            type={isLoading ? "button" : "submit"}
            onClick={isLoading ? handleStop : undefined}
            disabled={!inputValue && !attachedFile && !isLoading}
          >
            {isLoading ? (
              <FaStop className="text-white cursor-pointer" />
            ) : (
              <FaArrowUp
                className={`text-white cursor-${
                  inputValue || attachedFile ? "pointer" : "not-allowed"
                }`}
              />
            )}
          </button>

          {/* File input for attachments */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept=".txt, .pdf, .docx"
          />

          {/* Attach file button */}
          <button
            type="button"
            className="absolute rounded-full h-[32px] w-[32px] bottom-5 left-2 md:bottom-5 md:left-2 flex justify-center items-center md:text-lg"
            onClick={handleAttachClick}
          >
            <MdOutlineAttachFile className="text-gray-500 h-[25px] w-[25px] rotate-45 cursor-pointer" />
          </button>

          {isActiveBackButton && <button
            type="button"
            className="absolute rounded-full h-[32px] w-[32px] bottom-20 left-4 md:bottom-20 md:left-4 flex justify-center items-center md:text-lg"
            onClick={handleBackClick}
          >
            <div className="flex gap-1 text-blue-400 font-medium items-center justify-center">
            <IoMdArrowRoundBack className="h-[25px] w-[25px]  cursor-pointer"/>
            <p>Back</p>

            </div>

          </button>}


        </form>
      </div>
    </div>
  );
};

export default ProductPriceChatBox;
