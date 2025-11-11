export const BuilderTrickNode = () => {
    return null;
};


// "use client";

// import { useState, useCallback, useMemo, useEffect } from "react";
// import {
//   ReactFlow,
//   type Node,
//   type Edge,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   Handle,
//   Position,
//   type Connection,
//   Panel,
//   MarkerType,
//   getBezierPath,
// } from "@xyflow/react";
// import "@xyflow/react/dist/style.css";
// import { Plus, X, RotateCcw, Search, Move } from "lucide-react";
// import { supabase } from "@/utils/supabase/client";
// import { useTheme } from "next-themes";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";

// // Types
// interface Trick {
//   id: string;
//   name: string;
//   slug: string;
//   prerequisite_ids: string[] | null;
//   difficulty_level: number | null;
//   subcategory?: {
//     name: string;
//     slug: string;
//     master_category?: {
//       name: string;
//       slug: string;
//       color: string | null;
//     };
//   };
// }

// interface MasterCategory {
//   id: string;
//   name: string;
//   slug: string;
//   color: string | null;
//   icon_name: string | null;
// }

// interface BuilderTrickNodeData {
//   trick: Trick;
//   categoryColor: string;
//   level: number;
// }

// interface Level {
//   id: number;
//   position: number; // x for vertical flow, y for horizontal flow
//   name: string;
// }

// interface TrickPosition {
//   trickId: string;
//   levelId: number;
//   positionInLevel: number;
// }

// // Custom Node Component for Builder
// const BuilderTrickNode = ({
//   data,
//   selected,
// }: {
//   data: BuilderTrickNodeData;
//   selected?: boolean;
// }) => {
//   const { trick, categoryColor, level } = data;

//   return (
//     <div
//       className={`px-4 py-3 rounded-lg border-2 cursor-move transition-all
//         min-w-[180px] max-w-[220px] text-center relative
//         ${
//           selected
//             ? "bg-primary/10 border-primary shadow-lg"
//             : "bg-card border-border hover:border-muted-foreground shadow-md"
//         }`}
//     >
//       <Handle
//         type="target"
//         position={Position.Left}
//         className="!bg-blue-500 !w-3 !h-3"
//       />

//       {/* Level indicator */}
//       <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
//         {level + 1}
//       </div>

//       {/* Drag handle indicator */}
//       <div className="absolute top-1 right-1 text-muted-foreground">
//         <Move className="w-3 h-3" />
//       </div>

//       <div className="font-semibold text-sm mb-1 text-foreground">
//         {trick.name}
//       </div>
//       {trick.difficulty_level && (
//         <div className="text-xs text-muted-foreground">
//           Difficulty: {trick.difficulty_level}/10
//         </div>
//       )}
//       <div className="text-xs text-muted-foreground mt-1">
//         {trick.subcategory?.master_category?.name || "Unknown Category"}
//       </div>

//       <Handle
//         type="source"
//         position={Position.Right}
//         className="!bg-green-500 !w-3 !h-3"
//       />
//     </div>
//   );
// };

// // Custom Edge Component with X button on hover
// const CustomEdge = ({
//   id,
//   sourceX,
//   sourceY,
//   targetX,
//   targetY,
//   sourcePosition,
//   targetPosition,
//   style = {},
//   markerEnd,
//   data,
// }: any) => {
//   const [isHovered, setIsHovered] = useState(false);

//   const [edgePath, labelX, labelY] = getBezierPath({
//     sourceX,
//     sourceY,
//     sourcePosition,
//     targetX,
//     targetY,
//     targetPosition,
//   });

//   const handleDelete = () => {
//     if (data?.onDelete) {
//       data.onDelete(id);
//     }
//   };

//   return (
//     <>
//       <path
//         id={id}
//         style={style}
//         className="react-flow__edge-path"
//         d={edgePath}
//         markerEnd={markerEnd}
//         fill="none"
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       />
//       {isHovered && (
//         <g>
//           <circle
//             cx={labelX}
//             cy={labelY}
//             r="12"
//             fill="white"
//             stroke="#ef4444"
//             strokeWidth="2"
//             className="cursor-pointer drop-shadow-sm"
//             onClick={handleDelete}
//           />
//           <text
//             x={labelX}
//             y={labelY}
//             textAnchor="middle"
//             dominantBaseline="middle"
//             fontSize="14"
//             fontWeight="bold"
//             fill="#ef4444"
//             className="cursor-pointer pointer-events-none select-none"
//             onClick={handleDelete}
//           >
//             ×
//           </text>
//         </g>
//       )}
//     </>
//   );
// };

// // Main Builder Component
// export function SkillTreeBuilder() {
//   const { theme } = useTheme();

//   // Flow direction state
//   const [flowDirection, setFlowDirection] = useState<"horizontal" | "vertical">(
//     "horizontal"
//   );

//   // Canvas state
//   const [canvasTricks, setCanvasTricks] = useState<Trick[]>([]);
//   const [levels, setLevels] = useState<Level[]>([
//     { id: 0, position: 0, name: "Level 1" },
//   ]);
//   const [trickPositions, setTrickPositions] = useState<TrickPosition[]>([]);

//   // Available tricks for selection
//   const [allTricks, setAllTricks] = useState<Trick[]>([]);
//   const [categories, setCategories] = useState<MasterCategory[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [filteredTricks, setFilteredTricks] = useState<Trick[]>([]);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

//   // UI state
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [isAddTrickDialogOpen, setIsAddTrickDialogOpen] = useState(false);

//   // Utility function to adjust color brightness for dark mode
//   const adjustColorForTheme = (color: string) => {
//     if (theme !== "dark" || !color) return color;

//     const hex = color.replace("#", "");
//     const r = Number.parseInt(hex.substr(0, 2), 16);
//     const g = Number.parseInt(hex.substr(2, 2), 16);
//     const b = Number.parseInt(hex.substr(4, 2), 16);

//     const lighten = (c: number) =>
//       Math.min(255, Math.floor(c + (255 - c) * 0.4));

//     const newR = lighten(r).toString(16).padStart(2, "0");
//     const newG = lighten(g).toString(16).padStart(2, "0");
//     const newB = lighten(b).toString(16).padStart(2, "0");

//     return `#${newR}${newG}${newB}`;
//   };

//   // Fetch data on mount
//   useEffect(() => {
//     if (!supabase) return;
//     fetchCategories();
//     fetchAllTricks();
//   }, [supabase]);

//   useEffect(() => {
//     let filtered = allTricks;

//     // Filter by category
//     if (selectedCategory && selectedCategory !== "all") {
//       filtered = filtered.filter(
//         (trick) => trick.subcategory?.master_category?.id === selectedCategory
//       );
//     }

//     // Filter by search query
//     if (searchQuery.trim()) {
//       const query = searchQuery.toLowerCase();
//       filtered = filtered.filter(
//         (trick) =>
//           trick.name.toLowerCase().includes(query) ||
//           trick.subcategory?.name.toLowerCase().includes(query) ||
//           trick.subcategory?.master_category?.name.toLowerCase().includes(query)
//       );
//     }

//     // Filter by difficulty
//     if (difficultyFilter !== "all") {
//       const [min, max] = difficultyFilter.split("-").map(Number);
//       filtered = filtered.filter((trick) => {
//         if (!trick.difficulty_level) return difficultyFilter === "none";
//         return trick.difficulty_level >= min && trick.difficulty_level <= max;
//       });
//     }

//     setFilteredTricks(filtered);
//   }, [selectedCategory, allTricks, searchQuery, difficultyFilter]);

//   const fetchCategories = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("master_categories")
//         .select("id, name, slug, color, icon_name")
//         .eq("is_active", true)
//         .order("sort_order");

//       if (error) throw error;
//       setCategories(data || []);
//     } catch (err) {
//       console.error("Error fetching categories:", err);
//       setError("Failed to load categories");
//     }
//   };

//   const fetchAllTricks = async () => {
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from("tricks")
//         .select(
//           `
//           id,
//           name,
//           slug,
//           prerequisite_ids,
//           difficulty_level,
//           subcategory:subcategories!inner(
//             name,
//             slug,
//             master_category:master_categories!inner(
//               id,
//               name,
//               slug,
//               color
//             )
//           )
//         `
//         )
//         .eq("is_published", true)
//         .order("difficulty_level", { ascending: true, nullsFirst: true });

//       if (error) throw error;

//       const tricksData = (data || []).map((trick: any) => ({
//         ...trick,
//         subcategory: trick.subcategory?.[0]
//           ? {
//               name: trick.subcategory[0].name,
//               slug: trick.subcategory[0].slug,
//               master_category: trick.subcategory[0].master_category?.[0]
//                 ? {
//                     id: trick.subcategory[0].master_category[0].id,
//                     name: trick.subcategory[0].master_category[0].name,
//                     slug: trick.subcategory[0].master_category[0].slug,
//                     color: trick.subcategory[0].master_category[0].color,
//                   }
//                 : undefined,
//             }
//           : undefined,
//       }));

//       setAllTricks(tricksData);
//     } catch (err) {
//       console.error("Error fetching tricks:", err);
//       setError("Failed to load tricks");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addLevel = () => {
//     const newLevelId = Math.max(...levels.map((l) => l.id)) + 1;
//     const newPosition =
//       flowDirection === "horizontal"
//         ? Math.max(...levels.map((l) => l.position)) + 350
//         : Math.max(...levels.map((l) => l.position)) + 250;

//     const newLevel = {
//       id: newLevelId,
//       position: newPosition,
//       name: `Level ${newLevelId + 1}`,
//     };

//     setLevels((prev) => [...prev, newLevel]);
//     setSuccess(`Added ${newLevel.name}`);
//     setTimeout(() => setSuccess(null), 3000);
//   };

//   const removeLevel = (levelId: number) => {
//     if (levels.length <= 1) {
//       setError("Cannot remove the last level");
//       setTimeout(() => setError(null), 3000);
//       return;
//     }

//     // Check if any tricks are assigned to this level
//     const tricksInLevel = trickPositions.filter((tp) => tp.levelId === levelId);
//     if (tricksInLevel.length > 0) {
//       setError("Cannot remove level with tricks. Move tricks first.");
//       setTimeout(() => setError(null), 3000);
//       return;
//     }

//     setLevels((prev) => prev.filter((l) => l.id !== levelId));
//     setSuccess("Level removed");
//     setTimeout(() => setSuccess(null), 3000);
//   };

//   const updateLevelName = (levelId: number, newName: string) => {
//     setLevels((prev) =>
//       prev.map((l) => (l.id === levelId ? { ...l, name: newName } : l))
//     );
//   };

//   const addTrickToCanvas = (trick: Trick, targetLevelId?: number) => {
//     if (canvasTricks.find((t) => t.id === trick.id)) {
//       setError("Trick already added to canvas");
//       setTimeout(() => setError(null), 3000);
//       return;
//     }

//     // Assign to first level if no target specified
//     const levelId = targetLevelId ?? levels[0].id;
//     const existingTricksInLevel = trickPositions.filter(
//       (tp) => tp.levelId === levelId
//     );
//     const positionInLevel = existingTricksInLevel.length;

//     setCanvasTricks((prev) => [...prev, trick]);
//     setTrickPositions((prev) => [
//       ...prev,
//       {
//         trickId: trick.id,
//         levelId,
//         positionInLevel,
//       },
//     ]);

//     setIsAddTrickDialogOpen(false);
//     setSuccess(
//       `Added ${trick.name} to ${levels.find((l) => l.id === levelId)?.name}`
//     );
//     setTimeout(() => setSuccess(null), 3000);
//   };

//   const moveTrickToLevel = (trickId: string, newLevelId: number) => {
//     const existingTricksInLevel = trickPositions.filter(
//       (tp) => tp.levelId === newLevelId
//     );
//     const positionInLevel = existingTricksInLevel.length;

//     setTrickPositions((prev) =>
//       prev.map((tp) =>
//         tp.trickId === trickId
//           ? { ...tp, levelId: newLevelId, positionInLevel }
//           : tp
//       )
//     );

//     const levelName = levels.find((l) => l.id === newLevelId)?.name;
//     setSuccess(`Moved trick to ${levelName}`);
//     setTimeout(() => setSuccess(null), 3000);
//   };

//   // Remove trick from canvas
//   const removeTrickFromCanvas = (trickId: string) => {
//     setCanvasTricks((prev) => prev.filter((t) => t.id !== trickId));
//     setTrickPositions((prev) => prev.filter((tp) => tp.trickId !== trickId));
//     setSuccess("Removed trick from canvas");
//     setTimeout(() => setSuccess(null), 3000);
//   };

//   // Clear canvas
//   const clearCanvas = () => {
//     setCanvasTricks([]);
//     setTrickPositions([]);
//     setLevels([{ id: 0, position: 0, name: "Level 1" }]);
//     setSuccess("Canvas cleared");
//     setTimeout(() => setSuccess(null), 3000);
//   };

//   const [flowNodes, setNodes, onNodesChange] = useNodesState([]);
//   const [flowEdges, setEdges, onEdgesChange] = useEdgesState([]);

//   const { nodes, edges } = useMemo(() => {
//     if (canvasTricks.length === 0) return { nodes: [], edges: [] };

//     // Create nodes positioned according to their level assignments
//     const nodes: Node[] = canvasTricks.map((trick) => {
//       const trickPosition = trickPositions.find(
//         (tp) => tp.trickId === trick.id
//       );
//       const level = levels.find((l) => l.id === (trickPosition?.levelId ?? 0));

//       if (!level || !trickPosition) {
//         // Fallback positioning
//         return {
//           id: trick.id,
//           type: "builderTrickNode",
//           position: { x: 0, y: 0 },
//           data: {
//             trick,
//             categoryColor:
//               trick.subcategory?.master_category?.color || "#3b82f6",
//             level: 0,
//           },
//           dragHandle: ".cursor-move",
//         };
//       }

//       const categoryColor =
//         trick.subcategory?.master_category?.color || "#3b82f6";
//       const nodeSpacing = 140;
//       const levelOffset = 50;

//       return {
//         id: trick.id,
//         type: "builderTrickNode",
//         position:
//           flowDirection === "horizontal"
//             ? {
//                 x: level.position + levelOffset,
//                 y: trickPosition.positionInLevel * nodeSpacing + 50,
//               }
//             : {
//                 x: trickPosition.positionInLevel * 250 + 50,
//                 y: level.position + levelOffset,
//               },
//         data: {
//           trick,
//           categoryColor,
//           level: level.id,
//         },
//         dragHandle: ".cursor-move",
//       };
//     });

//     // Use existing edges from state
//     return { nodes, edges: flowEdges };
//   }, [canvasTricks, levels, flowDirection, trickPositions, flowEdges]);

//   const handleEdgeDelete = useCallback((edgeId: string) => {
//     setEdges((edges) => edges.filter((edge) => edge.id !== edgeId));
//     setSuccess("Connection removed");
//     setTimeout(() => setSuccess(null), 3000);
//   }, []);

//   const onConnect = useCallback(
//     (connection: Connection) => {
//       if (!connection.source || !connection.target) return;

//       // Prevent self-connections
//       if (connection.source === connection.target) {
//         setError("Cannot connect a trick to itself");
//         setTimeout(() => setError(null), 3000);
//         return;
//       }

//       // Check if connection already exists
//       const existingEdge = flowEdges.find(
//         (edge) =>
//           edge.source === connection.source && edge.target === connection.target
//       );

//       if (existingEdge) {
//         setError("Connection already exists");
//         setTimeout(() => setError(null), 3000);
//         return;
//       }

//       // Create new edge with custom styling and delete functionality
//       const newEdge: Edge = {
//         id: `${connection.source}-${connection.target}`,
//         source: connection.source!,
//         target: connection.target!,
//         type: "custom",
//         animated: true,
//         style: {
//           stroke: theme === "dark" ? "#60a5fa" : "#3b82f6",
//           strokeWidth: 2,
//         },
//         markerEnd: {
//           type: MarkerType.ArrowClosed,
//           color: theme === "dark" ? "#60a5fa" : "#3b82f6",
//         },
//         data: {
//           onDelete: handleEdgeDelete,
//         },
//       };

//       setEdges((edges) => [...edges, newEdge]);

//       const sourceTrick = canvasTricks.find((t) => t.id === connection.source);
//       const targetTrick = canvasTricks.find((t) => t.id === connection.target);

//       setSuccess(`Connected ${sourceTrick?.name} → ${targetTrick?.name}`);
//       setTimeout(() => setSuccess(null), 3000);
//     },
//     [flowEdges, canvasTricks, theme, handleEdgeDelete]
//   );

//   const onNodeDragStop = useCallback(
//     (event: any, node: Node) => {
//       // Update trick position based on new node position
//       const trickPosition = trickPositions.find((tp) => tp.trickId === node.id);
//       if (!trickPosition) return;

//       // Find the closest level based on the new position
//       let closestLevel = levels[0];
//       let minDistance = Number.MAX_VALUE;

//       levels.forEach((level) => {
//         const distance =
//           flowDirection === "horizontal"
//             ? Math.abs(node.position.x - level.position)
//             : Math.abs(node.position.y - level.position);

//         if (distance < minDistance) {
//           minDistance = distance;
//           closestLevel = level;
//         }
//       });

//       // Update trick position if it moved to a different level
//       if (closestLevel.id !== trickPosition.levelId) {
//         moveTrickToLevel(node.id, closestLevel.id);
//       }
//     },
//     [trickPositions, levels, flowDirection]
//   );

//   const edgeTypes = useMemo(
//     () => ({
//       custom: CustomEdge,
//     }),
//     []
//   );

//   const nodeTypes = useMemo(
//     () => ({
//       builderTrickNode: BuilderTrickNode,
//     }),
//     []
//   );

//   // Update flow when nodes change
//   useEffect(() => {
//     setNodes(nodes);
//   }, [nodes, setNodes]);

//   // Update edges when theme changes
//   useEffect(() => {
//     setEdges((edges) =>
//       edges.map((edge) => ({
//         ...edge,
//         style: {
//           ...edge.style,
//           stroke: theme === "dark" ? "#60a5fa" : "#3b82f6",
//         },
//         markerEnd: {
//           ...edge.markerEnd,
//           color: theme === "dark" ? "#60a5fa" : "#3b82f6",
//         },
//       }))
//     );
//   }, [theme]);

//   const renderLevelLines = () => {
//     return levels.map((level) => (
//       <div key={level.id} className="absolute">
//         {/* Level line */}
//         <div
//           className={`${
//             flowDirection === "horizontal"
//               ? "h-full w-0.5 bg-primary/30"
//               : "w-full h-0.5 bg-primary/30"
//           }`}
//           style={{
//             [flowDirection === "horizontal"
//               ? "left"
//               : "top"]: `${level.position}px`,
//           }}
//         />

//         {/* Level label */}
//         <div
//           className={`absolute bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium ${
//             flowDirection === "horizontal"
//               ? "top-2 -translate-x-1/2"
//               : "left-2 -translate-y-1/2"
//           }`}
//           style={{
//             [flowDirection === "horizontal"
//               ? "left"
//               : "top"]: `${level.position}px`,
//           }}
//         >
//           {level.name}
//         </div>
//       </div>
//     ));
//   };

//   const renderAddTrickDialog = () => (
//     <Dialog open={isAddTrickDialogOpen} onOpenChange={setIsAddTrickDialogOpen}>
//       <DialogTrigger asChild>
//         <Button>
//           <Plus className="w-4 h-4 mr-2" />
//           Add Trick
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-4xl max-h-[80vh]">
//         <DialogHeader>
//           <DialogTitle>Add Trick to Canvas</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-4">
//           {/* Search and Filters */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//               <Input
//                 placeholder="Search tricks..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>

//             <Select
//               value={selectedCategory}
//               onValueChange={setSelectedCategory}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Filter by category" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Categories</SelectItem>
//                 {categories.map((category) => (
//                   <SelectItem key={category.id} value={category.id}>
//                     {category.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Select
//               value={difficultyFilter}
//               onValueChange={setDifficultyFilter}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Filter by difficulty" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Difficulties</SelectItem>
//                 <SelectItem value="none">No Difficulty Set</SelectItem>
//                 <SelectItem value="1-3">Beginner (1-3)</SelectItem>
//                 <SelectItem value="4-6">Intermediate (4-6)</SelectItem>
//                 <SelectItem value="7-8">Advanced (7-8)</SelectItem>
//                 <SelectItem value="9-10">Expert (9-10)</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Results Summary */}
//           <div className="flex items-center justify-between text-sm text-muted-foreground">
//             <span>
//               Showing {filteredTricks.length} of {allTricks.length} tricks
//             </span>
//             {(searchQuery ||
//               selectedCategory !== "all" ||
//               difficultyFilter !== "all") && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => {
//                   setSearchQuery("");
//                   setSelectedCategory("all");
//                   setDifficultyFilter("all");
//                 }}
//               >
//                 Clear Filters
//               </Button>
//             )}
//           </div>

//           {/* Tricks List */}
//           <div className="max-h-96 overflow-y-auto space-y-2">
//             {filteredTricks.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 No tricks found matching your criteria
//               </div>
//             ) : (
//               filteredTricks.map((trick) => {
//                 const isAdded = canvasTricks.some((t) => t.id === trick.id);
//                 const categoryColor = trick.subcategory?.master_category?.color;

//                 return (
//                   <div
//                     key={trick.id}
//                     className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
//                   >
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-1">
//                         <div className="font-medium">{trick.name}</div>
//                         {trick.difficulty_level && (
//                           <Badge variant="secondary" className="text-xs">
//                             Difficulty {trick.difficulty_level}/10
//                           </Badge>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                         <span
//                           className="w-3 h-3 rounded-full"
//                           style={{
//                             backgroundColor: adjustColorForTheme(
//                               categoryColor || "#3b82f6"
//                             ),
//                           }}
//                         />
//                         <span>{trick.subcategory?.master_category?.name}</span>
//                         <span>•</span>
//                         <span>{trick.subcategory?.name}</span>
//                       </div>
//                     </div>
//                     <Button
//                       size="sm"
//                       onClick={() => addTrickToCanvas(trick)}
//                       disabled={isAdded}
//                       variant={isAdded ? "secondary" : "default"}
//                     >
//                       {isAdded ? "Added" : "Add"}
//                     </Button>
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );

//   return (
//     <div className="w-full h-screen flex flex-col bg-background">
//       {/* Header */}
//       <div className="bg-card border-b p-4 shadow-sm">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex items-center justify-between mb-4">
//             <h1 className="text-2xl font-bold text-foreground">
//               Skill Tree Builder
//             </h1>
//             <div className="flex items-center gap-2">
//               <Select
//                 value={flowDirection}
//                 onValueChange={(value: "horizontal" | "vertical") =>
//                   setFlowDirection(value)
//                 }
//               >
//                 <SelectTrigger className="w-32">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="horizontal">Horizontal</SelectItem>
//                   <SelectItem value="vertical">Vertical</SelectItem>
//                 </SelectContent>
//               </Select>

//               {renderAddTrickDialog()}

//               <Button variant="outline" onClick={addLevel}>
//                 Add Level
//               </Button>

//               <Button variant="outline" onClick={clearCanvas}>
//                 <RotateCcw className="w-4 h-4 mr-2" />
//                 Clear
//               </Button>
//             </div>
//           </div>

//           {canvasTricks.length > 0 && (
//             <div className="space-y-2">
//               <div className="flex flex-wrap gap-2">
//                 {canvasTricks.map((trick) => {
//                   const trickPosition = trickPositions.find(
//                     (tp) => tp.trickId === trick.id
//                   );
//                   const level = levels.find(
//                     (l) => l.id === trickPosition?.levelId
//                   );

//                   return (
//                     <Badge
//                       key={trick.id}
//                       variant="secondary"
//                       className="flex items-center gap-1"
//                     >
//                       <span
//                         className="w-2 h-2 rounded-full"
//                         style={{
//                           backgroundColor: adjustColorForTheme(
//                             trick.subcategory?.master_category?.color ||
//                               "#3b82f6"
//                           ),
//                         }}
//                       />
//                       {trick.name}
//                       <span className="text-xs opacity-70">
//                         ({level?.name})
//                       </span>
//                       <button
//                         onClick={() => removeTrickFromCanvas(trick.id)}
//                         className="ml-1 hover:text-destructive"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </Badge>
//                   );
//                 })}
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 {levels.map((level) => {
//                   const tricksInLevel = trickPositions.filter(
//                     (tp) => tp.levelId === level.id
//                   ).length;
//                   return (
//                     <Badge key={level.id} variant="outline" className="text-xs">
//                       {level.name}: {tricksInLevel} tricks
//                     </Badge>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Notifications */}
//       {error && (
//         <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-2 rounded z-50">
//           {error}
//         </div>
//       )}

//       {success && (
//         <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-300 px-4 py-2 rounded z-50">
//           {success}
//         </div>
//       )}

//       {/* Canvas */}
//       <div className="flex-1 relative">
//         {loading && (
//           <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
//             <div className="text-lg font-medium text-foreground">
//               Loading tricks...
//             </div>
//           </div>
//         )}

//         {/* Level Lines */}
//         {renderLevelLines()}

//         <ReactFlow
//           nodes={flowNodes}
//           edges={flowEdges}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           onConnect={onConnect}
//           onNodeDragStop={onNodeDragStop}
//           nodeTypes={nodeTypes}
//           edgeTypes={edgeTypes}
//           colorMode={theme === "dark" ? "dark" : "light"}
//           fitView
//           fitViewOptions={{ padding: 0.2 }}
//           selectNodesOnDrag={false}
//           edgesFocusable={true}
//           elementsSelectable={true}
//           connectionMode="loose"
//           snapToGrid={true}
//           snapGrid={[20, 20]}
//         >
//           <Controls />
//           {/* @ts-expect-error this comes from reactflow */}
//           <Background variant="dots" gap={20} size={1} />

//           <Panel
//             position="top-right"
//             className="bg-card border rounded-lg p-4 shadow-lg space-y-3 max-w-xs"
//           >
//             <div className="text-sm font-semibold text-foreground">
//               Builder Controls
//             </div>

//             <div className="text-xs text-muted-foreground space-y-1">
//               <div>Canvas Tricks: {canvasTricks.length}</div>
//               <div>Connections: {flowEdges.length}</div>
//               <div>Levels: {levels.length}</div>
//               <div>Flow: {flowDirection}</div>
//             </div>

//             {/* Level Management */}
//             <div className="border-t pt-2">
//               <div className="text-xs font-medium text-foreground mb-2">
//                 Levels
//               </div>
//               <div className="space-y-1 max-h-32 overflow-y-auto">
//                 {levels.map((level) => {
//                   const tricksInLevel = trickPositions.filter(
//                     (tp) => tp.levelId === level.id
//                   ).length;
//                   return (
//                     <div
//                       key={level.id}
//                       className="flex items-center justify-between text-xs"
//                     >
//                       <span className="text-muted-foreground">
//                         {level.name} ({tricksInLevel})
//                       </span>
//                       {levels.length > 1 && tricksInLevel === 0 && (
//                         <button
//                           onClick={() => removeLevel(level.id)}
//                           className="text-destructive hover:text-destructive/80"
//                         >
//                           <X className="w-3 h-3" />
//                         </button>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
//               <div>Instructions:</div>
//               <ul className="ml-2 space-y-1">
//                 <li>• Add tricks from any category</li>
//                 <li>• Drag tricks to reposition them</li>
//                 <li>• Drag from green to blue handle to connect</li>
//                 <li>• Hover over connections to see delete button</li>
//                 <li>• Tricks snap to closest level when moved</li>
//                 <li>• Root nodes should start at first level</li>
//               </ul>
//             </div>
//           </Panel>
//         </ReactFlow>
//       </div>
//     </div>
//   );
// }
