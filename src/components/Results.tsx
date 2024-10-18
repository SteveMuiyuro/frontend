import { IoLocationOutline } from "react-icons/io5";
import { RiPhoneLine } from "react-icons/ri";
import { MdOutlineEmail } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
import { Supplier } from "../types";

type ResultsProps = {
  result: Supplier;
};

function Results({ result }: ResultsProps) {

  return (
    <div className="text-gray-800 flex items-start flex-col md:flex-row md:gap-[50px] ml-10 mb-3 md:ml-20 mr-10 md:w-auto">
      <img
        className="object-cover w-[100px] h-[120px] md:w-[100px] md:h-[150px] mb-5"
        src={result.product_image_url === "/static/placeholder.png" ? "./images/placeholder.png" : result.product_image_url}
        alt={result.product_name}
      />
      <div className="flex flex-col">
        <p>{result.product_name}</p>
        <p className="font-bold">{result.price}</p>
        <p className="font-medium py-1">{result.supplier}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-5 md:mb-2">
          <div className="flex justify-start items-center gap-2">
            <IoLocationOutline className="flex  flex-shrink-0" />
            <p className="text-sm">{result.location}</p>
          </div>
          <div className="flex justify-start items-center gap-2">
            <RiPhoneLine className="flex  flex-shrink-0" />
            <p className="text-sm break-words">{result.supplier_contact === "" ? "Not Available": result.supplier_contact} </p>
          </div>
        </div>
        <div className="grid grid-cols-1 items-center justify-center md:grid-cols-2 gap-1 md:gap-5">
          <div className="flex justify-start items-center gap-2">
            <MdOutlineEmail className="flex  flex-shrink-0" />
            <p className="text-sm">{result.email === "" ? "Not Available": result.email}</p>
          </div>
          <div className="flex justify-start items-center gap-2 max-w-[300px] md:max-w-[680px]">
            <IoIosLink className="flex flex-shrink-0" />
            <a
              href={result.website }
              target="_blank"
              className="text-sm break-words"
              style={{ wordBreak: "break-all" }}
            >
              {result.website === "" ? "Not Available": result.website}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;
