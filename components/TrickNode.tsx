import { Handle, Position } from "@xyflow/react";
import { TrickNodeData } from "./skill-tree.types";

const TrickNode = ({ data }: { data: TrickNodeData }) => {
  const { trick, completed, onToggle, categoryColor, isMobile } = data;

  return (
    <div
      onClick={() => onToggle(trick.id)}
      className={`
        px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
        min-w-[180px] max-w-[220px] text-center font-bold
        ${
          completed
            ? "border-green-800 border-2 bg-green-800 shadow-xl text-white"
            : "bg-white border-gray-300 hover:border-gray-400 shadow-md text-black"
        }
      `}
      style={
        completed
          ? {
              borderColor: "#32792cff", // Tailwind green-800
              backgroundColor: "#36b32bff", // Tailwind green-800
              color: "#fff", // White text
            }
          : undefined
      }
    >
      <Handle
        type="target"
        position={isMobile ? Position.Top : Position.Left}
        className="opacity-0"
      />
      <div className="font-sbold text-md mb-1 capitalize">{trick.name}</div>
      {/* {trick.difficulty_level && (
        <div className="text-xs text-gray-500">
          Difficulty: {trick.difficulty_level}/10
        </div>
      )} */}
      {/* {trick.prerequisite_ids && trick.prerequisite_ids.length > 0 && (
        <div className="text-xs text-gray-400 mt-1">
          {trick.prerequisite_ids.length} prerequisite
          {trick.prerequisite_ids.length > 1 ? "s" : ""}
        </div>
      )} */}
      <Handle
        type="source"
        position={isMobile ? Position.Bottom : Position.Right}
        className="opacity-0"
      />
    </div>
  );
};

export default TrickNode;
