import File from "../components/File"
import { BiListCheck } from "react-icons/bi";
import { LuFileSearch } from "react-icons/lu";
import { LuListChecks } from "react-icons/lu";
import { LuPackageSearch } from "react-icons/lu";
import Suggested from "../components/Suggested"

function Files() {

    const files = [
        "Create a Purchase Request",
        "Assign Request to Approval Workflow",
        "Check Request Progress",
        "Create RFQ/RFP for Purchase Request",
        "Recomendations for Best Quotes",
        "Create Purchase Order"
      ];

const elements = files.map((item, i) => (<File key={i} item={item} />));

const suggested = [
    {
        title:"Summarize this page",
        icon:<BiListCheck size={25} className="text-gray-500"/>
    },
    {
       title: "Ask a question about this page",
       icon:<LuFileSearch size={24} className="text-gray-800"/>
    },
    {
       title: "Create action items",
       icon:<LuListChecks size={24} className="text-green-700"/>
    },
    {
        title:"Know the price of an item",
        icon:<LuPackageSearch size={24} className="text-[#822be0]"/>
    }
];

const suggestions = suggested.map((item, i) => (<Suggested key={i}  title={item.title} icon={item.icon} />));

  return (

    <div className="md:w-[680px] min-w-[300px] h-[80vh] flex flex-col justify-center items-center gap-5 ">


        <div className="flex flex-col justify-center gap-2">
        <p className="text-[#838F94] text-sm">Hi Paul Umukoro! How can I help you today</p>
        <p className="text-[#838F94] text-sm">Suggested</p>
        {suggestions}
        <p className="text-sm text-[#838F94]">Files</p>
        {elements}
        </div>
    </div>
  )
}

export default Files
