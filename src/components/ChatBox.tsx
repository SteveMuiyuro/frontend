import React, {
  useState,
  FormEvent,
  ChangeEvent,
  useRef,
  useEffect,
} from "react";
import { FaArrowUp } from "react-icons/fa6";
import { MdOutlineAttachFile } from "react-icons/md";
import { FaStop } from "react-icons/fa6";
import { Message } from "../types";
import Results from "./Results";
import { FaDownload, FaTimes } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import * as pdfjsLib from "pdfjs-dist/build/pdf";


pdfjsLib.GlobalWorkerOptions.workerSrc = `/node_modules/pdfjs-dist/build/pdf.worker.mjs`;

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false); // New state for file loading
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [submittedFiles, setSubmittedFiles] = useState<File[]>([]);
  const [introMessage, setIntroMessage] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submittedFileUrl, setSubmittedFileUrl] = useState<string | null>
  (null); // To store file image URL
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();


    if (!inputValue.trim() && !attachedFile) return; // Ensure we have either a prompt or a file
    if (isFileLoading) return; // Prevent submission while file is loading

    const userMessage: Message = {
      type: "user",
      text: inputValue,
      files: attachedFile ? [attachedFile] : [],  // Attach the current file
    };


    console.log(userMessage)

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Reset attachment after submission


    // if (attachedFile) {
    //   setSubmittedFiles((prevFiles) => [...prevFiles, attachedFile]);
    //     // Store the file's URL for later use
    // const fileUrl = URL.createObjectURL(attachedFile);
    // setSubmittedFileUrl(fileUrl);  // Store the URL of the attached file
    // }

    setInputValue("");
    setAttachedFile(null);
    setIsLoading(true);


    const controller = new AbortController();
    setAbortController(controller);



    try {
      const response = await fetch("https://backend-api-pjri.onrender.com/product_prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `${inputValue} ${fileContent ? fileContent : ""}`,
          limit: 4,
        }),
        signal: controller.signal,
      } as RequestInit);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.message) {
        setIntroMessage(data.message);
      }

      const botMessage: Message = data.suppliers
        ? { type: "bot", data: data.suppliers }
        : { type: "bot", text: data.response };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
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
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            extractedText += pageText + "\n";
          }

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
    <div className="chat-messages ml-8 md:w-[680px] max-h-[80vh] overflow-y-auto mb-20 no-scrollbar">
      {messages.map((msg, index) => (
        <div
          key={index}
          className="flex flex-col justify-start w-full mt-[70px]"
        >
          {/* Bot message with data */}
          {msg.type === "bot" && msg.data ? (
            <div className="flex flex-col gap-[20px] justify-center items-baseline w-full">
              <div className="flex items-center justify-start w-full gap-5">
                <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex flex-shrink-0"></div>
                {introMessage && (
                  <p className="bg-transparent mr-10">{introMessage}</p>
                )}
              </div>
              <div className="flex flex-col items-center w-full">
                <div className="flex flex-col gap-5 w-[300px] md:w-full flex-wrap items-start">
                  {msg.data.map((result, i) => (
                    <Results key={i} result={result} />
                  ))}
                </div>
              </div>
            </div>
          ) : msg.type === "bot" && msg.text ? (
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
                        <a href={URL.createObjectURL(file)} download={file.name}>
                          <FaDownload className="text-gray-500 cursor-pointer" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-[12px] max-w-[400px] md:max-w-[610px] md:flex md:text-justify text-start bg-gray-300 flex rounded-lg">
                  {msg.text}
                </div>
              </div>
            </div>
          ) : msg.type === "user" ? (
            /* User message */
            <div className="flex gap-[20px] justify-start w-[300px] md:w-full">
              <div className="w-[32px] h-[32px] rounded-full  flex-shrink-0">
                <img src="/images/Profile_image.jpeg" alt="profile_image" className="rounded-full" />
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
                        <a href={URL.createObjectURL(file)} download={file.name}>
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
              <div className="p-[5px] max-w-[300px] mr-10 px-[10px] md:p-[12px] text-start bg-gray-300 flex rounded-lg">
                {msg.text}
              </div>
            </div>
          )}
        </div>
      ))}

      {isLoading && (
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
          <div className="flex items-center justify-between w-[300px] md:w-[250px] ml-6 mb-2 p-2 border border-gray-300 bg-white rounded-md shadow-sm relative mt-2 ">
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
          placeholder="Ask about a product..."
          className="md:placeholder:outline-none rounded-[40px] placeholder:text-sm w-[300px] md:w-full md:min-h-[68px] resize-none bg-gray-300 px-10 md:px-14 md:pr-14 relative py-6"
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
      </form>
    </div>
  </div>
  );
};

export default ChatBox;
