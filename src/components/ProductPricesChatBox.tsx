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
import { Message, Data } from "../types";
import Results from "./Results";
import { FaDownload, FaTimes } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import Files from "./Files";
import { Context } from "../App";
import { IoMdArrowRoundBack } from "react-icons/io";

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


  const context = useContext(Context);

  if (!context) {
    throw new Error("Items must be used within a context provider");
  }
  const { messages, setMessages, inputValue, setInputValue, isRequestLoading, setRequestLoading, isAssignWorkflow, setIsAssignWorkflow, isCheckProgress, setIsCheckProgress, isCreatePO, setIsCreatePO, isCreateRFQ, setIsCreateRFQ, setIsRecommendQuotes,  isRecommendQuotes, isProductPrice, setProductPrice, isLoading, setIsLoading, } = context;

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

    const product_prices_endpoint = 'https://backend-api-pjri.onrender.com/product_prices'
    const create_request_endpoint = 'http://localhost:5000/create_request'
    const assign_workflow_endpoint = 'http://localhost:5000/assign_workflow'
    const check_progress_endpoint = 'http://localhost:5000/check_progress'
    const create_rfq_endpoint = 'http://localhost:5000/create_rfq'
    const recommend_quotes_endpoint = 'http://localhost:5000/recommend_quotes'
    const create_purchase_order_endpoint = 'http://localhost:5000/create_purchase_order'
    const get_product_price_endpoint = 'https://backend-api-pjri.onrender.com/get_product_prices'

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
            ? { message: inputValue }
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

      } else {
        setIntroMessage(data.message);
        const botMessage: Message = data.suppliers
        ? { type: "bot", data: data.suppliers }
        : { type: "bot", text: data.response}

      setMessages((prevMessages) => [...prevMessages, botMessage]);

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
    }, 4000); // Adjust the delay as needed for smooth display
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
       {!isRequestLoading && !isAssignWorkflow && !isCheckProgress && !isCreatePO && !isCreateRFQ && !isRecommendQuotes && !isProductPrice && (messages.length === 0 && !isExit && <Files />)}
      <div className="chat-messages ml-8 md:w-[680px] max-h-[80vh] overflow-y-auto mb-20 no-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="flex flex-col justify-start w-full mt-[70px]"
          >
            {/* Bot message with data */}
            {msg?.type === "bot" && msg?.data ? (
              <div className="flex flex-col gap-[20px] justify-center items-baseline w-full">
                <div className="flex items-center justify-start w-full gap-5">
                  <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex flex-shrink-0"></div>
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
                  <div className="flex items-center justify-start w-full gap-5">
                  {nextPrompt && <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex flex-shrink-0"></div>}
                  {nextPrompt && <p className="bg-blue-100 p-[10px] mr-10 rounded-lg">{nextPrompt}</p>}
                  </div>
                </div>
              </div>
            ) : msg?.type === "bot" && msg?.text ? (
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
                <div className="p-[5px] max-w-[300px] mr-10 px-[10px] md:p-[12px]md: min-w-[300px] text-start bg-green-200 flex rounded-lg">
                  {msg?.text}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading  && (
          <div className="flex gap-[20px] justify-start w-full mt-[70px]">
            <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500"></div>
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
