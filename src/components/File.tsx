import { useContext } from "react";
import { BsFileEarmarkCheck } from "react-icons/bs";
import { Context } from "../App";
function File({ item}: { item: string}) { // Define the prop type correctly

  const context = useContext(Context)


  if (!context) {
    throw new Error("File component must be used within a ContextProvider");
  }
  const { handleCreatePurchaseRequest } = context;

  return (
    <div className="flex justify-start items-center gap-5">
      <BsFileEarmarkCheck size={24} className="text-green-700"/>
     {<button onClick={() => handleCreatePurchaseRequest(item)}>{item}</button>}
    </div>
  );
}

export default File
