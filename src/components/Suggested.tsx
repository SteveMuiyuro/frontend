import { useContext } from "react";
import { Context } from "../App";

type Props = {
    title:string,
    icon: JSX.Element
}

function Suggested({ title, icon }:Props) { // Define the prop type correctly
  const context = useContext(Context)


  if (!context) {
    throw new Error("File component must be used within a ContextProvider");
  }
  const { handleCreatePurchaseRequest } = context;
  return (
    <div className="flex justify-start items-center gap-5">
      {icon}
      <button onClick={() => handleCreatePurchaseRequest(title)}>{title}</button>
    </div>
  );
}

export default Suggested
