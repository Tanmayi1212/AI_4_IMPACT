import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface CyberDropdownProps {
  value: string;
  options: readonly string[];
  placeholder: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
}

export default function CyberDropdown({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
}: CyberDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }

      const target = event.target as Node;
      if (!rootRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const selectedText = value || placeholder;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={[
          "group relative w-full rounded-xl border border-[rgba(141,54,213,0.28)]",
          "bg-[linear-gradient(180deg,rgba(141,54,213,0.12),rgba(141,54,213,0.06))]",
          "px-4 py-[13px] text-left font-[var(--font-dm-sans)] text-sm outline-none transition-all duration-300",
          "hover:border-[rgba(141,54,213,0.5)] hover:bg-[linear-gradient(180deg,rgba(141,54,213,0.16),rgba(141,54,213,0.08))]",
          "focus-visible:border-[#8D36D5] focus-visible:shadow-[0_0_0_3px_rgba(141,54,213,0.2),0_0_22px_rgba(141,54,213,0.2)]",
          disabled ? "cursor-not-allowed opacity-65" : "cursor-pointer",
        ].join(" ")}
      >
        <span className={value ? "text-[#EDE8F5]" : "text-[rgba(237,232,245,0.42)]"}>{selectedText}</span>
        <span
          className={[
            "pointer-events-none absolute right-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45",
            "border-b-2 border-r-2 border-[#8D36D5] transition-transform duration-300",
            isOpen ? "-translate-y-[30%] -rotate-135" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={[
              "absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border",
              "border-[rgba(141,54,213,0.45)] bg-[#1A1031]",
              "shadow-[0_16px_36px_rgba(5,4,12,0.62),0_0_24px_rgba(141,54,213,0.26)]",
              "backdrop-blur",
            ].join(" ")}
          >
            <ul role="listbox" className="max-h-64 overflow-y-auto py-1.5">
              {options.map((option) => {
                const isSelected = option === value;

                return (
                  <li key={option}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                      }}
                      className={[
                        "flex w-full items-center justify-between px-4 py-2.5 text-left font-[var(--font-dm-sans)] text-[13px] transition-all duration-200",
                        isSelected
                          ? "bg-[rgba(141,54,213,0.24)] text-[#F2E6FF]"
                          : "text-[rgba(237,232,245,0.85)] hover:bg-[rgba(141,54,213,0.14)] hover:text-[#F2E6FF]",
                      ].join(" ")}
                    >
                      <span>{option}</span>
                      <span
                        className={[
                          "h-1.5 w-1.5 rounded-full transition-opacity duration-200",
                          isSelected
                            ? "opacity-100 bg-[#8D36D5] shadow-[0_0_10px_#8D36D5]"
                            : "opacity-0 bg-transparent",
                        ].join(" ")}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
