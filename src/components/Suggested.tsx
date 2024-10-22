type Props = {
    title:string|undefined,
    icon: JSX.Element
}

function Suggested({ title, icon }:Props) { // Define the prop type correctly
  return (
    <div className="flex justify-start items-center gap-5">
      {icon}
      <button>{title}</button>
    </div>
  );
}

export default Suggested
