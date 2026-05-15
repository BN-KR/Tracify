const steps = [
  { id: "project", label: "Create project" },
  { id: "api-key", label: "API key" },
  { id: "install", label: "Install SDK" },
  { id: "waiting", label: "Waiting" },
  { id: "success", label: "First span" },
];

export type OnboardingStepId = (typeof steps)[number]["id"];

export function OnboardingProgress({
  currentStep,
}: {
  currentStep: OnboardingStepId;
}) {
  const activeIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="border-b border-[#2A2A2A] p-4">
      <div className="mb-4 text-[11px] uppercase tracking-wide text-[#999999]">
        {activeIndex + 1} / {steps.length} {steps[activeIndex]?.label}
      </div>
      <ol className="grid grid-cols-5 gap-2">
        {steps.map((step, index) => {
          const active = index === activeIndex;
          const complete = index < activeIndex;

          return (
            <li key={step.id} className="min-w-0">
              <div
                className={
                  complete || active
                    ? "mb-2 h-0.5 bg-white"
                    : "mb-2 h-0.5 bg-[#2A2A2A]"
                }
              />
              <div
                className={
                  active
                    ? "truncate text-[10px] uppercase tracking-wide text-white"
                    : "truncate text-[10px] uppercase tracking-wide text-[#666666]"
                }
              >
                {step.label}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
