"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { VALIDATOR_DISCLAIMER, MVP_QUESTIONS } from "@/lib/constants";
import { FOUNDATIONAL_TIER_ID } from "@/lib/tiers";
import { useCanvasStore } from "@/lib/store";
import { useCanvasActions } from "./use-canvas-actions";
import { RefObject, useMemo } from "react";
import { ReactFlowInstance } from "reactflow";
import { DefinitionRow, EpistemicSource } from "@/lib/types";

type Props = {
    flowRef: RefObject<HTMLDivElement | null>;
    flowInstanceRef: RefObject<ReactFlowInstance | null>;
};

export function NodeInspector({ flowRef, flowInstanceRef }: Props) {
    const store = useCanvasStore();
    const actions = useCanvasActions();

    const selectedNode = store.nodes.find((n) => n.id === store.selectedNodeId) ?? null;

    // Accordion state
    const [deepenArgumentExpanded, setDeeprenArgumentExpanded] = useState(false);
    const [epistemicSourcesExpanded, setEpistemicSourcesExpanded] = useState(false);
    const [keyTermsExpanded, setKeyTermsExpanded] = useState(false);

    // Prepare active presuppositions mapped with labels
    const activePresuppositions = useMemo(() => {
        if (!store.presuppositions) return [];
        const active = [];
        for (const [key, answer] of Object.entries(store.presuppositions)) {
            if (answer.mode === "position") {
                const question = MVP_QUESTIONS.find(q => q.id === key);
                const label = question ? question.label : key;
                active.push({ id: key, label, value: answer.value });
            }
        }
        return active;
    }, [store.presuppositions]);

    // Local state for Toulmin fields
    const [grounds, setGrounds] = useState("");
    const [warrant, setWarrant] = useState("");
    const [backing, setBacking] = useState("");
    const [qualifier, setQualifier] = useState<"necessarily" | "probably" | "presumably" | "possibly" | "in_most_cases" | "">("necessarily");
    const [rebuttal, setRebuttal] = useState("");

    // Local state for epistemic sources
    const [epistemicSources, setEpistemicSources] = useState<EpistemicSource[]>([]);

    // Local state for key terms / definitions
    const [linkedDefinitions, setLinkedDefinitions] = useState<DefinitionRow[]>([]);

    // Update local state when selectedNode changes
    useEffect(() => {
        if (selectedNode) {
            setGrounds(selectedNode.data.grounds ?? "");
            setWarrant(selectedNode.data.warrant ?? "");
            setBacking(selectedNode.data.backing ?? "");
            setQualifier((selectedNode.data.qualifier ?? "necessarily") as "necessarily" | "probably" | "presumably" | "possibly" | "in_most_cases" | "");
            setRebuttal(selectedNode.data.rebuttal ?? "");
            setEpistemicSources((selectedNode.data.epistemic_sources ?? []) as EpistemicSource[]);

            // Fetch linked definitions
            fetchLinkedDefinitions(selectedNode.id);
        }
    }, [selectedNode?.id, store.selectedNodeId]);

    const fetchLinkedDefinitions = useCallback(async (nodeId: string) => {
        try {
            const response = await fetch(`/api/node-definitions?node_id=${nodeId}`);
            if (response.ok) {
                const data = await response.json();
                setLinkedDefinitions(data.definitions ?? []);
            }
        } catch (error) {
            console.error("Failed to fetch linked definitions:", error);
        }
    }, []);

    const handleGroundsChange = (value: string) => {
        setGrounds(value);
    };

    const handleGroundsBlur = (value: string) => {
        if (selectedNode) {
            store.updateNodeData(selectedNode.id, { grounds: value });
            void actions.patchNode(selectedNode.id, { grounds: value });
        }
    };

    const handleWarrantChange = (value: string) => {
        setWarrant(value);
    };

    const handleWarrantBlur = (value: string) => {
        if (selectedNode) {
            store.updateNodeData(selectedNode.id, { warrant: value });
            void actions.patchNode(selectedNode.id, { warrant: value });
        }
    };

    const handleBackingChange = (value: string) => {
        setBacking(value);
    };

    const handleBackingBlur = (value: string) => {
        if (selectedNode) {
            store.updateNodeData(selectedNode.id, { backing: value });
            void actions.patchNode(selectedNode.id, { backing: value });
        }
    };

    const handleQualifierChange = (value: string) => {
        const qualValue = value as "necessarily" | "probably" | "presumably" | "possibly" | "in_most_cases" | "";
        setQualifier(qualValue);
        if (selectedNode) {
            const qualifierToStore = qualValue === "" ? null : qualValue;
            store.updateNodeData(selectedNode.id, { qualifier: qualifierToStore });
            void actions.patchNode(selectedNode.id, { qualifier: qualifierToStore });
        }
    };

    const handleRebuttalChange = (value: string) => {
        setRebuttal(value);
    };

    const handleRebuttalBlur = (value: string) => {
        if (selectedNode) {
            store.updateNodeData(selectedNode.id, { rebuttal: value });
            void actions.patchNode(selectedNode.id, { rebuttal: value });
        }
    };

    const handleInsertPresupposition = (target: "warrant" | "backing", pIndexStr: string) => {
        if (!pIndexStr) return;
        const pIndex = parseInt(pIndexStr, 10);
        const p = activePresuppositions[pIndex];
        if (!p || !selectedNode) return;
        const textToInsert = `[Presupposition: ${p.label} — ${p.value}]`;
        if (target === "warrant") {
            const newText = warrant ? `${warrant}\n${textToInsert}` : textToInsert;
            setWarrant(newText);
            handleWarrantBlur(newText);
        } else {
            const newText = backing ? `${backing}\n${textToInsert}` : textToInsert;
            setBacking(newText);
            handleBackingBlur(newText);
        }
    };

    const toggleEpistemicSource = (source: EpistemicSource) => {
        let updatedSources: EpistemicSource[];
        if (epistemicSources.includes(source)) {
            updatedSources = epistemicSources.filter(s => s !== source);
        } else {
            updatedSources = [...epistemicSources, source];
        }
        setEpistemicSources(updatedSources);
        if (selectedNode) {
            store.updateNodeData(selectedNode.id, { epistemic_sources: updatedSources });
            void actions.patchNode(selectedNode.id, { epistemic_sources: updatedSources });
        }
    };

    const handleLinkDefinition = (definitionId: string) => {
        if (selectedNode) {
            void actions.linkDefinition(selectedNode.id, definitionId);
            fetchLinkedDefinitions(selectedNode.id);
        }
    };

    const handleUnlinkDefinition = (definitionId: string) => {
        if (selectedNode) {
            void actions.unlinkDefinition(selectedNode.id, definitionId);
            fetchLinkedDefinitions(selectedNode.id);
        }
    };

    const epistemicSourceOptions: Array<{ value: EpistemicSource; label: string }> = [
        { value: "canonical_scripture", label: "Scripture" },
        { value: "general_conference", label: "Conference" },
        { value: "scripture", label: "LDS Standard Works" },
        { value: "prophetic_teaching", label: "Prophetic Teaching" },
        { value: "historical_record", label: "Historical Record" },
        { value: "theological_reasoning", label: "Theological Reasoning" },
        { value: "philosophical_argument", label: "Philosophical" },
        { value: "comparative_religion", label: "Comparative Religion" },
        { value: "personal_revelation", label: "Personal Revelation" },
        { value: "scholarly_consensus", label: "Scholarly" },
        { value: "scriptural_exegesis", label: "Scriptural Exegesis" },
    ];

    const availableDefinitions = store.definitions?.filter(def => !linkedDefinitions.some(ld => ld.id === def.id)) ?? [];

    if (!store.inspectorOpen) {
        return null;
    }

    return (
        <aside className="liquid-panel border-l border-border p-5 text-foreground flex flex-col h-full overflow-y-auto w-[360px]">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="type-h2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Inspector</h2>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="glass"
                        onClick={() => store.setInspectorOpen(false)}
                    >
                        Close
                    </Button>
                </div>
            </div>

            {!selectedNode ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
                    <p className="type-body">Select a node to edit its theology, add citations, and run validation.</p>
                </div>
            ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
                    <div className="type-kicker text-accent/80 tracking-widest">
                        {selectedNode.data.tier_id === FOUNDATIONAL_TIER_ID ? "Core Truth" : "Theological Doctrine"}
                    </div>

                    <div className="space-y-1.5">
                        <label className="type-label text-muted">Title</label>
                        <Input
                            value={String(selectedNode.data.title ?? "")}
                            onChange={(e) => store.updateNodeData(selectedNode.id, { title: e.target.value })}
                            onBlur={(e) => void actions.patchNode(selectedNode.id, { title: e.target.value })}
                            className="bg-glass-strong border-border/50 focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="type-label text-muted">Tier</label>
                        <Select
                            value={selectedNode.data.tier_id ?? ""}
                            onChange={(e) => {
                                const newTierId = e.target.value;
                                if (newTierId) void actions.moveNodeToTier(selectedNode.id, newTierId);
                            }}
                            className="w-full bg-glass-strong border-border/50 focus:border-accent text-sm"
                            disabled={selectedNode.data.tier_id === FOUNDATIONAL_TIER_ID} // Core truths cannot change tier this way
                        >
                            {store.tiers.map((tier) => (
                                <option key={tier.id} value={tier.id}>
                                    {tier.name}
                                </option>
                            ))}
                        </Select>
                        {selectedNode.data.tier_id === FOUNDATIONAL_TIER_ID && (
                            <p className="text-[10px] text-muted/70 italic mt-1 px-1">Core truths belong exclusively to the Foundational Dogma tier.</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="type-label text-muted">Tags (Comma separated)</label>
                        <Input
                            value={selectedNode.data.tags?.join(", ") ?? ""}
                            placeholder="e.g. eschatology, priesthood"
                            onChange={(e) => {
                                const tagsList = e.target.value.split(",").map(t => t.trim()).filter(t => t.length > 0);
                                store.updateNodeData(selectedNode.id, { tags: tagsList });
                            }}
                            onBlur={(e) => {
                                const tagsList = e.target.value.split(",").map(t => t.trim()).filter(t => t.length > 0);
                                void actions.patchNode(selectedNode.id, { tags: tagsList.length ? tagsList : null });
                            }}
                            className="bg-glass-strong border-border/50 text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="type-label text-muted">Description / Premise</label>
                        <Textarea
                            value={String(selectedNode.data.description ?? "")}
                            rows={4}
                            onChange={(e) => store.updateNodeData(selectedNode.id, { description: e.target.value })}
                            onBlur={(e) => void actions.patchNode(selectedNode.id, { description: e.target.value })}
                            className="bg-glass-strong border-border/50 focus:border-accent text-sm leading-relaxed resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="type-label text-muted">Notes & Citations</label>
                        <Textarea
                            value={String(selectedNode.data.notes ?? "")}
                            rows={3}
                            onChange={(e) => store.updateNodeData(selectedNode.id, { notes: e.target.value })}
                            onBlur={(e) => void actions.patchNode(selectedNode.id, { notes: e.target.value })}
                            className="bg-glass-strong border-border/50 focus:border-accent text-sm leading-relaxed resize-none"
                        />
                    </div>

                    {/* Deepen Argument Accordion */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setDeeprenArgumentExpanded(!deepenArgumentExpanded)}
                            className="type-label text-accent/70 hover:text-accent transition-colors flex items-center gap-2 w-full text-left"
                        >
                            <span>{deepenArgumentExpanded ? "▼" : "▶"}</span>
                            Deepen Argument
                        </button>
                        {deepenArgumentExpanded && (
                            <div className="space-y-3 pl-4 border-l border-accent/20 mt-2">
                                <p className="type-small text-muted">
                                    Structure your reasoning: What's your evidence? What principle connects it to your claim?
                                </p>

                                <div className="space-y-1.5">
                                    <label className="type-label text-muted">Grounds / Evidence</label>
                                    <Textarea
                                        value={grounds}
                                        onChange={(e) => handleGroundsChange(e.target.value)}
                                        onBlur={(e) => handleGroundsBlur(e.target.value)}
                                        rows={3}
                                        placeholder="What facts or evidence support your claim?"
                                        className="bg-glass-strong border-border/50 focus:border-accent text-sm leading-relaxed resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="type-label text-muted">Warrant / Reasoning Principle</label>
                                        {activePresuppositions.length > 0 && (
                                            <Select
                                                onChange={(e) => {
                                                    handleInsertPresupposition("warrant", e.target.value);
                                                    e.target.value = "";
                                                }}
                                                className="w-[140px] h-6 text-xs bg-glass-strong border-border/50 text-accent/80 p-0 pl-1 py-0 rounded"
                                            >
                                                <option value="">+ Insert Presup</option>
                                                {activePresuppositions.map((p, i) => (
                                                    <option key={p.id} value={i}>{p.id}: {p.label}</option>
                                                ))}
                                            </Select>
                                        )}
                                    </div>
                                    <Textarea
                                        value={warrant}
                                        onChange={(e) => handleWarrantChange(e.target.value)}
                                        onBlur={(e) => handleWarrantBlur(e.target.value)}
                                        rows={3}
                                        placeholder="What principle or rule connects the evidence to your claim?"
                                        className="bg-glass-strong border-border/50 focus:border-accent text-sm leading-relaxed resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="type-label text-muted">Backing / Deeper Justification</label>
                                        {activePresuppositions.length > 0 && (
                                            <Select
                                                onChange={(e) => {
                                                    handleInsertPresupposition("backing", e.target.value);
                                                    e.target.value = "";
                                                }}
                                                className="w-[140px] h-6 text-xs bg-glass-strong border-border/50 text-accent/80 p-0 pl-1 py-0 rounded"
                                            >
                                                <option value="">+ Insert Presup</option>
                                                {activePresuppositions.map((p, i) => (
                                                    <option key={p.id} value={i}>{p.id}: {p.label}</option>
                                                ))}
                                            </Select>
                                        )}
                                    </div>
                                    <Textarea
                                        value={backing}
                                        onChange={(e) => handleBackingChange(e.target.value)}
                                        onBlur={(e) => handleBackingBlur(e.target.value)}
                                        rows={3}
                                        placeholder="Why is the warrant itself valid or reliable?"
                                        className="bg-glass-strong border-border/50 focus:border-accent text-sm leading-relaxed resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="type-label text-muted">Qualifier</label>
                                    <Select
                                        value={qualifier}
                                        onChange={(e) => handleQualifierChange(e.target.value)}
                                        className="w-full bg-glass-strong border-border/50 focus:border-accent text-sm"
                                    >
                                        <option value="">Select qualifier</option>
                                        <option value="necessarily">Necessarily</option>
                                        <option value="probably">Probably</option>
                                        <option value="presumably">Presumably</option>
                                        <option value="possibly">Possibly</option>
                                        <option value="in_most_cases">In Most Cases</option>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="type-label text-muted">Rebuttal / Counterarguments</label>
                                    <Textarea
                                        value={rebuttal}
                                        onChange={(e) => handleRebuttalChange(e.target.value)}
                                        onBlur={(e) => handleRebuttalBlur(e.target.value)}
                                        rows={3}
                                        placeholder="What objections or exceptions exist?"
                                        className="bg-glass-strong border-border/50 focus:border-accent text-sm leading-relaxed resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Epistemic Sources Accordion */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setEpistemicSourcesExpanded(!epistemicSourcesExpanded)}
                            className="type-label text-accent/70 hover:text-accent transition-colors flex items-center gap-2 w-full text-left"
                        >
                            <span>{epistemicSourcesExpanded ? "▼" : "▶"}</span>
                            Epistemic Sources
                        </button>
                        {epistemicSourcesExpanded && (
                            <div className="space-y-3 pl-4 border-l border-accent/20 mt-2">
                                <div className="grid grid-cols-2 gap-2">
                                    {epistemicSourceOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => toggleEpistemicSource(option.value)}
                                            className={`px-3 py-2 rounded-full border text-sm transition-colors ${epistemicSources.includes(option.value)
                                                ? "bg-accent/20 border-accent/40 text-accent"
                                                : "bg-glass border-border/30 text-muted"
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Key Terms Accordion */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setKeyTermsExpanded(!keyTermsExpanded)}
                            className="type-label text-accent/70 hover:text-accent transition-colors flex items-center gap-2 w-full text-left"
                        >
                            <span>{keyTermsExpanded ? "▼" : "▶"}</span>
                            Key Terms
                        </button>
                        {keyTermsExpanded && (
                            <div className="space-y-3 pl-4 border-l border-accent/20 mt-2">
                                {linkedDefinitions.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="type-label text-muted">Linked Definitions</label>
                                        <div className="flex flex-wrap gap-2">
                                            {linkedDefinitions.map(def => (
                                                <div
                                                    key={def.id}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-sm text-accent"
                                                >
                                                    <span>{def.term}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUnlinkDefinition(def.id)}
                                                        className="text-accent/70 hover:text-accent transition-colors"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {availableDefinitions.length > 0 && (
                                    <div className="space-y-1.5">
                                        <label className="type-label text-muted">Add Definition</label>
                                        <Select
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleLinkDefinition(e.target.value);
                                                    e.target.value = "";
                                                }
                                            }}
                                            className="w-full bg-glass-strong border-border/50 focus:border-accent text-sm"
                                        >
                                            <option value="">Select a definition...</option>
                                            {availableDefinitions.map(def => (
                                                <option key={def.id} value={def.id}>
                                                    {def.term}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                )}

                                {linkedDefinitions.length === 0 && availableDefinitions.length === 0 && (
                                    <p className="type-small text-muted">No definitions available.</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <Button
                            type="button"
                            onClick={() => void actions.validateNode(selectedNode.id)}
                            className="w-full justify-center bg-accent text-accent-foreground hover:bg-accent/80 hover:shadow-glow transition-all font-semibold"
                        >
                            Analyze Consistency with AI
                        </Button>
                    </div>

                    {selectedNode.data.validation_status && (
                        <div className={`mt-4 liquid-panel-strong p-4 rounded-md border-l-4 ${selectedNode.data.validation_status === 'contradiction' ? 'border-l-danger' : selectedNode.data.validation_status === 'warning' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                            <div className="type-kicker mb-2 flex items-center gap-2">
                                <span className={
                                    selectedNode.data.validation_status === 'contradiction' ? 'text-danger' :
                                        selectedNode.data.validation_status === 'warning' ? 'text-yellow-500' : 'text-green-500'
                                }>
                                    ●
                                </span>
                                {String(selectedNode.data.validation_status).toUpperCase()}
                            </div>
                            <p className="type-body text-[13px] leading-relaxed text-foreground/90">{String(selectedNode.data.validation_critique ?? "")}</p>
                            <p className="type-small mt-3 text-[10px] text-muted border-t border-border/50 pt-2">{VALIDATOR_DISCLAIMER}</p>
                        </div>
                    )}

                    <div className="pt-8 mb-4">
                        <Button
                            type="button"
                            variant="primary"
                            className="w-full bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white transition-colors"
                            disabled={Boolean(selectedNode.data.is_locked)}
                            onClick={() => void actions.requestNodeDeletion(selectedNode.id)}
                        >
                            Delete Node
                        </Button>
                    </div>
                </div>
            )}
        </aside>
    );
}
