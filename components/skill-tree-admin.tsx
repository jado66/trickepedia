"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Connection,
  MarkerType,
  Panel,
  type EdgeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { Save, RefreshCw, Trash2, Info } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useTheme } from "next-themes";

// Types
interface Trick {
  id: string;
  name: string;
  slug: string;
  prerequisite_ids: string[] | null;
  difficulty_level: number | null;
  subcategory?: {
    name: string;
    slug: string;
    master_category?: {
      name: string;
      slug: string;
      color: string | null;
    };
  };
}

interface MasterCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon_name: string | null;
}

interface TrickNodeData {
  trick: Trick;
  categoryColor: string;
  isModified: boolean;
}

// Custom Node Component for Admin
const AdminTrickNode = ({ data }: { data: TrickNodeData }) => {
  const { trick, categoryColor, isModified } = data;

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 cursor-move transition-all
        min-w-[180px] max-w-[220px] text-center relative
        ${
          isModified
            ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-500 shadow-lg"
            : "bg-card border-border hover:border-muted-foreground shadow-md"
        }
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-500 !w-3 !h-3"
      />

      {isModified && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          !
        </div>
      )}

      <div className="font-semibold text-sm mb-1 text-foreground">
        {trick.name}
      </div>
      {trick.difficulty_level && (
        <div className="text-xs text-muted-foreground">
          Difficulty: {trick.difficulty_level}/10
        </div>
      )}
      {trick.prerequisite_ids && trick.prerequisite_ids.length > 0 && (
        <div className="text-xs text-muted-foreground mt-1">
          {trick.prerequisite_ids.length} prerequisite
          {trick.prerequisite_ids.length > 1 ? "s" : ""}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-green-500 !w-3 !h-3"
      />
    </div>
  );
};

// Main Admin Component
export function SkillTreeAdmin() {
  const { theme } = useTheme();

  // Utility function to adjust color brightness for dark mode
  const adjustColorForTheme = (color: string) => {
    if (theme !== "dark" || !color) return color;

    // Convert hex to RGB
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Lighten the color for dark mode (increase brightness by 40%)
    const lighten = (c: number) =>
      Math.min(255, Math.floor(c + (255 - c) * 0.4));

    const newR = lighten(r).toString(16).padStart(2, "0");
    const newG = lighten(g).toString(16).padStart(2, "0");
    const newB = lighten(b).toString(16).padStart(2, "0");

    return `#${newR}${newG}${newB}`;
  };

  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [originalTricks, setOriginalTricks] = useState<Trick[]>([]);
  const [modifiedTricks, setModifiedTricks] = useState<Map<string, string[]>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Fetch master categories on mount
  useEffect(() => {
    if (!supabase) return;

    fetchCategories();
  }, [supabase]);

  // Fetch tricks when category changes
  useEffect(() => {
    if (!supabase) return;

    if (selectedCategory) {
      fetchTricksByCategory(selectedCategory);
    }
  }, [selectedCategory, supabase]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("master_categories")
        .select("id, name, slug, color, icon_name")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      setCategories(data || []);

      if (data && data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    }
  };

  const fetchTricksByCategory = async (categoryId: string) => {
    setLoading(true);
    setError(null);
    setModifiedTricks(new Map());

    try {
      const { data, error } = await supabase
        .from("tricks")
        .select(
          `
          id,
          name,
          slug,
          prerequisite_ids,
          difficulty_level,
          subcategory:subcategories!inner(
            name,
            slug,
            master_category:master_categories!inner(
              id,
              name,
              slug,
              color
            )
          )
        `
        )
        .eq("subcategory.master_category.id", categoryId)
        .eq("is_published", true)
        .order("difficulty_level", { ascending: true, nullsFirst: true });

      if (error) throw error;

      const tricksData = (data || []).map((trick: any) => ({
        ...trick,
        subcategory: trick.subcategory?.[0]
          ? {
              name: trick.subcategory[0].name,
              slug: trick.subcategory[0].slug,
              master_category: trick.subcategory[0].master_category?.[0]
                ? {
                    name: trick.subcategory[0].master_category[0].name,
                    slug: trick.subcategory[0].master_category[0].slug,
                    color: trick.subcategory[0].master_category[0].color,
                  }
                : undefined,
            }
          : undefined,
      }));
      setTricks(tricksData);
      setOriginalTricks(JSON.parse(JSON.stringify(tricksData)));
    } catch (err) {
      console.error("Error fetching tricks:", err);
      setError("Failed to load tricks");
    } finally {
      setLoading(false);
    }
  };

  const nodeTypes = useMemo(
    () => ({
      adminTrickNode: AdminTrickNode,
    }),
    []
  );

  // Handle connection (edge creation) - this sets prerequisites
  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;

    setTricks((currentTricks) => {
      const newTricks = [...currentTricks];
      const targetTrick = newTricks.find((t) => t.id === params.target);

      if (targetTrick) {
        const currentPrereqs = targetTrick.prerequisite_ids || [];
        if (!currentPrereqs.includes(params.source)) {
          targetTrick.prerequisite_ids = [...currentPrereqs, params.source];

          // Track modification
          setModifiedTricks((prev) => {
            const newMap = new Map(prev);
            newMap.set(params.target!, targetTrick.prerequisite_ids!);
            return newMap;
          });
        }
      }

      return newTricks;
    });

    setSuccess(`Added prerequisite connection`);
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  // Handle edge deletion - removes prerequisites
  const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    deletedEdges.forEach((edge) => {
      setTricks((currentTricks) => {
        const newTricks = [...currentTricks];
        const targetTrick = newTricks.find((t) => t.id === edge.target);

        if (targetTrick && targetTrick.prerequisite_ids) {
          targetTrick.prerequisite_ids = targetTrick.prerequisite_ids.filter(
            (id) => id !== edge.source
          );

          // Track modification
          setModifiedTricks((prev) => {
            const newMap = new Map(prev);
            newMap.set(edge.target, targetTrick.prerequisite_ids!);
            return newMap;
          });
        }

        return newTricks;
      });
    });

    setSuccess(`Removed prerequisite connection(s)`);
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  // Handle right-click on edges for quick delete
  const onEdgeContextMenu: EdgeMouseHandler = useCallback(
    (event, edge) => {
      event.preventDefault();

      // Create confirmation before deleting
      if (
        confirm(
          `Remove prerequisite connection?\n${edge.source} → ${edge.target}`
        )
      ) {
        onEdgesDelete([edge]);
      }
    },
    [onEdgesDelete]
  );

  // Save changes to database
  const saveChanges = async () => {
    if (modifiedTricks.size === 0) {
      setError("No changes to save");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Update each modified trick
      for (const [trickId, prerequisiteIds] of modifiedTricks.entries()) {
        const { error } = await supabase
          .from("tricks")
          .update({
            prerequisite_ids:
              prerequisiteIds.length > 0 ? prerequisiteIds : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", trickId);

        if (error) throw error;
      }

      setSuccess(`Successfully updated ${modifiedTricks.size} trick(s)`);
      setModifiedTricks(new Map());
      setOriginalTricks(JSON.parse(JSON.stringify(tricks)));

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error saving changes:", err);
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Reset changes
  const resetChanges = () => {
    setTricks(JSON.parse(JSON.stringify(originalTricks)));
    setModifiedTricks(new Map());
    setSuccess("Changes reset");
    setTimeout(() => setSuccess(null), 3000);
  };

  // Build nodes and edges from tricks
  const { nodes, edges } = useMemo(() => {
    if (tricks.length === 0) return { nodes: [], edges: [] };

    const currentCategory = categories.find((c) => c.id === selectedCategory);
    const categoryColor = currentCategory?.color || "#3b82f6";
    const themeAdjustedCategoryColor = adjustColorForTheme(categoryColor);

    const trickById = new Map<string, Trick>();
    tricks.forEach((trick) => {
      trickById.set(trick.id, trick);
    });

    // Create nodes with temporary positions
    let nodes: Node[] = tricks.map((trick) => ({
      id: trick.id,
      type: "adminTrickNode",
      position: { x: 0, y: 0 },
      data: {
        trick,
        categoryColor,
        isModified: modifiedTricks.has(trick.id),
      },
    }));

    // Create edges
    const edges: Edge[] = [];
    const edgeSet = new Set<string>();

    tricks.forEach((trick) => {
      if (trick.prerequisite_ids && trick.prerequisite_ids.length > 0) {
        trick.prerequisite_ids.forEach((prereqId) => {
          if (trickById.has(prereqId)) {
            const edgeId = `${prereqId}-${trick.id}`;
            if (!edgeSet.has(edgeId)) {
              edgeSet.add(edgeId);
              edges.push({
                id: edgeId,
                source: prereqId,
                target: trick.id,
                type: "smoothstep",
                animated: modifiedTricks.has(trick.id),
                deletable: true,
                focusable: true,
                style: {
                  stroke: modifiedTricks.has(trick.id)
                    ? "#f59e0b"
                    : themeAdjustedCategoryColor,
                  strokeWidth: 2,
                  cursor: "pointer",
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: modifiedTricks.has(trick.id)
                    ? "#f59e0b"
                    : themeAdjustedCategoryColor,
                },
                className: "hover:stroke-red-500 transition-colors",
              });
            }
          }
        });
      }
    });

    // Apply Dagre layout
    if (nodes.length > 0) {
      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));
      dagreGraph.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 180 });

      const nodeWidth = 220;
      const nodeHeight = 100;

      nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      });

      edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
      });

      dagre.layout(dagreGraph);

      nodes = nodes.map((node) => {
        const { x, y } = dagreGraph.node(node.id);
        return {
          ...node,
          position: {
            x: x - nodeWidth / 2,
            y: y - nodeHeight / 2,
          },
        };
      });
    }

    return { nodes, edges };
  }, [tricks, categories, selectedCategory, modifiedTricks]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  // Update flow when nodes/edges change
  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b p-4 shadow-sm hidden lg:block">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-foreground">
            Skill Tree Admin
          </h1>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-all font-medium
                  ${
                    selectedCategory === category.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-muted-foreground"
                  }
                `}
                style={{
                  borderColor:
                    selectedCategory === category.id
                      ? adjustColorForTheme(category.color || "#3b82f6") ||
                        undefined
                      : undefined,
                  backgroundColor:
                    selectedCategory === category.id
                      ? `${adjustColorForTheme(
                          category.color || "#3b82f6"
                        )}15` || undefined
                      : undefined,
                  color:
                    selectedCategory === category.id
                      ? adjustColorForTheme(category.color || "#3b82f6") ||
                        undefined
                      : undefined,
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-2 rounded z-50">
          {error}
        </div>
      )}

      {success && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-300 px-4 py-2 rounded z-50">
          {success}
        </div>
      )}

      {/* Tree View */}
      <div className="flex-1 relative hidden lg:block">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-lg font-medium text-foreground">
              Loading tricks...
            </div>
          </div>
        )}

        {tricks.length > 0 && (
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgesDelete={onEdgesDelete}
            onEdgeContextMenu={onEdgeContextMenu}
            nodeTypes={nodeTypes}
            colorMode={theme === "dark" ? "dark" : "light"}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            deleteKeyCode={["Delete", "Backspace"]}
            selectNodesOnDrag={false}
            edgesFocusable={true}
            elementsSelectable={true}
          >
            <Controls />
            {/* @ts-expect-error this comes from reactflow */}
            <Background variant="dots" gap={20} size={1} />

            {/* Control Panel */}
            <Panel
              position="top-right"
              className="bg-card border rounded-lg p-4 shadow-lg space-y-3"
            >
              <div className="text-sm font-semibold text-foreground">
                Admin Controls
              </div>

              <div className="space-y-2">
                <button
                  onClick={saveChanges}
                  disabled={modifiedTricks.size === 0 || saving}
                  className={`
                    w-full px-3 py-2 rounded flex items-center justify-center gap-2
                    ${
                      modifiedTricks.size > 0
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  <Save size={16} />
                  {saving
                    ? "Saving..."
                    : `Save Changes (${modifiedTricks.size})`}
                </button>

                <button
                  onClick={resetChanges}
                  disabled={modifiedTricks.size === 0}
                  className={`
                    w-full px-3 py-2 rounded flex items-center justify-center gap-2
                    ${
                      modifiedTricks.size > 0
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  <RefreshCw size={16} />
                  Reset Changes
                </button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
                <div className="flex items-center gap-1">
                  <Info size={12} />
                  <span>Instructions:</span>
                </div>
                <ul className="ml-4 space-y-1">
                  <li>
                    • Drag from green handle to blue handle to create
                    prerequisite
                  </li>
                  <li>• Click on an edge to select it (turns orange)</li>
                  <li>• Press Delete or Backspace to remove selected edge</li>
                  <li>• Right-click on edge for delete option</li>
                  <li>• Yellow nodes have unsaved changes</li>
                </ul>
              </div>
            </Panel>
          </ReactFlow>
        )}
      </div>

      {/* Please view on desktop */}
      <div className="lg:hidden p-8 text-center">
        <p className="text-lg font-medium">
          Please view the Skill Tree Admin on a desktop or laptop for the best
          experience.
        </p>
      </div>
    </div>
  );
}
