import { BsFileEarmarkCheck } from "react-icons/bs";

function File({ item }: { item: string }) { // Define the prop type correctly
  return (
    <div className="flex justify-start items-center gap-5">
      <BsFileEarmarkCheck size={24} className="text-green-700"/>
      <button>{item}</button>
    </div>
  );
}

export default File
