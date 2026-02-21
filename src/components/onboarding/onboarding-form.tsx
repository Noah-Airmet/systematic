"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MVP_QUESTIONS } from "@/lib/constants";
import { detectContradictions, validateS1Ranks } from "@/lib/presuppositions";
import { Presuppositions, S1RankValue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const S1_MODELS: Array<keyof S1RankValue> = [
  "penal_substitution",
  "moral_influence",
  "christus_victor",
  "ransom",
  "solidarity",
];

function emptyS1(): S1RankValue {
  return {
    penal_substitution: 4,
    moral_influence: 3,
    christus_victor: 2,
    ransom: 1,
    solidarity: 0,
  };
}

export function OnboardingForm({ systemId, initial }: { systemId: string; initial: Presuppositions }) {
  const [values, setValues] = useState<Presuppositions>(initial);
  const [saveState, setSaveState] = useState("Saved");
  const router = useRouter();

  const contradictions = useMemo(() => detectContradictions(values), [values]);

  async function save(next: Presuppositions) {
    setSaveState("Saving...");
    const response = await fetch(`/api/systems/${systemId}/presuppositions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presuppositions: next }),
    });
    setSaveState(response.ok ? "Saved" : "Save failed");
  }

  function updateQuestion(id: string, update: Presuppositions[string]) {
    const next = { ...values, [id]: update };
    setValues(next);
    void save(next);
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="liquid-panel rounded-2xl px-5 py-3 type-small muted flex justify-between items-center bg-black/40 border-white/10 backdrop-blur-md">
        <span>Framework Presuppositions</span>
        <span className="text-accent/80 font-medium tracking-wide">Status: {saveState}</span>
      </div>

      {MVP_QUESTIONS.map((question) => {
        const current = values[question.id] ?? { mode: "undecided" as const };
        const isChoice = question.type === "choice";
        const isS1 = question.id === "S1";

        // Check if current value is custom (not in predefined options)
        const isCustomValue = isChoice && current.mode === "position" && typeof current.value === "string" && !("options" in question && (question.options as readonly string[]).includes(current.value));

        return (
          <div key={question.id} className="liquid-panel rounded-3xl px-6 py-7 border-white/5 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <h3 className="type-h2 mb-5 font-semibold tracking-tight text-white/90 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-lg font-mono">{question.id}</span>
              </div>
              <span>{question.label}</span>
            </h3>
            <p className="type-small muted mb-4 -mt-3">
              {question.id.startsWith("E") ? "Epistemology: Study of knowledge and truth." :
                question.id.startsWith("M") ? "Metaphysics: Study of reality and existence." :
                  question.id.startsWith("T") ? "Theology Proper: Study of the nature of God." :
                    question.id.startsWith("A") ? "Anthropology: Study of human nature and agency." :
                      question.id.startsWith("S") ? "Soteriology: Study of salvation and atonement." : ""}
            </p>

            {isChoice && "options" in question && (
              <div className="space-y-3 mb-6">
                {(question.options as readonly string[]).map((opt) => (
                  <Button
                    key={opt}
                    type="button"
                    variant={current.mode === "position" && current.value === opt ? "primary" : "secondary"}
                    className={`w-full justify-start text-left px-5 py-4 h-auto text-[15px] font-medium transition-all ${current.mode === "position" && current.value === opt ? "ring-2 ring-white/20" : ""}`}
                    onClick={() => updateQuestion(question.id, { mode: "position", value: opt })}
                  >
                    {opt}
                  </Button>
                ))}

                {/* Custom "Other" Option */}
                <div className={`rounded-xl border transition-all ${isCustomValue ? "border-white/30 bg-white/10 ring-2 ring-white/20" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                  <div
                    className="flex p-2 items-center cursor-text min-h-[56px]"
                    onClick={() => {
                      if (!isCustomValue) {
                        updateQuestion(question.id, { mode: "position", value: "" });
                      }
                    }}
                  >
                    <span className="type-small font-semibold pl-3 pr-2 text-white/70">Other:</span>
                    <Input
                      value={isCustomValue ? current.value as string : ""}
                      onChange={(e) => updateQuestion(question.id, { mode: "position", value: e.target.value })}
                      placeholder="Type your own position..."
                      className="bg-transparent border-none shadow-none focus-visible:ring-0 text-[15px] font-medium h-auto py-2 px-0 w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {isS1 && (
              <div className="mb-6 space-y-4">
                {current.mode !== "position" && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full justify-center px-5 py-4 h-auto text-[15px] font-medium"
                    onClick={() => updateQuestion(question.id, { mode: "position", value: emptyS1() })}
                  >
                    Define Atonement Ranks
                  </Button>
                )}
                {current.mode === "position" && typeof current.value === "object" && (
                  <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                    {(() => {
                      const rankValue = current.value as S1RankValue;
                      return S1_MODELS.map((model) => (
                        <div key={model} className="flex items-center gap-4">
                          <span className="flex-1 capitalize text-white/80 font-medium tracking-wide text-sm">{model.replace("_", " ")}</span>
                          <Select
                            value={String(rankValue[model])}
                            onChange={(e) => {
                              const nextVal: S1RankValue = {
                                ...rankValue,
                                [model]: Number(e.target.value),
                              };
                              updateQuestion(question.id, { mode: "position", value: nextVal });
                            }}
                            className="w-24 bg-white/5 border-white/10 text-center"
                          >
                            {[1, 2, 3, 4, 5].map((idx, i) => (
                              <option key={i} value={i} className="bg-black text-white">
                                Rank {idx}
                              </option>
                            ))}
                          </Select>
                        </div>
                      ));
                    })()}
                    {!validateS1Ranks(current.value as S1RankValue) ? (
                      <p className="type-small text-danger mt-2 bg-danger/10 p-2 rounded text-center">Ranks must be exactly 1 through 5 uniquely.</p>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Sub-actions for Undecided/Not Foundational */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant={current.mode === "undecided" ? "secondary" : "ghost"}
                className={`flex-1 text-xs py-2 h-auto text-white/60 hover:text-white ${current.mode === "undecided" ? "bg-white/10 text-white" : ""}`}
                onClick={() => updateQuestion(question.id, { mode: "undecided" })}
              >
                Undecided
              </Button>
              <Button
                type="button"
                variant={current.mode === "not_foundational" ? "secondary" : "ghost"}
                className={`flex-1 text-xs py-2 h-auto text-white/60 hover:text-white ${current.mode === "not_foundational" ? "bg-white/10 text-white" : ""}`}
                onClick={() => updateQuestion(question.id, { mode: "not_foundational" })}
              >
                Not Foundational
              </Button>
            </div>
          </div>
        );
      })}

      {contradictions.length > 0 ? (
        <section className="rounded-3xl border border-danger/30 bg-danger/10 p-6 shadow-glow backdrop-blur-md animate-in fade-in">
          <h3 className="type-h3 text-danger font-bold flex items-center gap-2 mb-3">
            <span className="bg-danger text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">!</span>
            Structural Tensions Detected
          </h3>
          <ul className="space-y-2 type-body text-[14px] text-white/90">
            {contradictions.map((c) => (
              <li key={c.pair} className="flex gap-2">
                <strong className={`font-semibold ${c.severity === 'hard' ? 'text-danger' : 'text-yellow-500'}`}>[{c.severity.toUpperCase()}]</strong>
                <span className="leading-relaxed">{c.message}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex justify-center pt-8 pb-12 relative z-10 w-full">
        <Button
          type="button"
          onClick={() => router.push(`/systems/${systemId}/canvas`)}
          className="px-10 py-4 text-base tracking-wide bg-white text-black hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105 rounded-full font-bold"
        >
          Initialize Canvas Architecture
        </Button>
      </div>
    </div>
  );
}
