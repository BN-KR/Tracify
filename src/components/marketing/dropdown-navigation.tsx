"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItem = {
  id: number;
  label: string;
  href?: string;
  subMenus?: {
    title: string;
    items: {
      label: string;
      description: string;
      href: string;
      icon: React.ElementType;
    }[];
  }[];
};

type DropdownNavigationProps = {
  navItems: NavItem[];
};

export function DropdownNavigation({ navItems }: DropdownNavigationProps) {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  return (
    <nav className="flex items-center gap-1">
      <ul className="flex items-center gap-1">
        {navItems.map((item) => (
          <li
            key={item.id}
            className="relative"
            onMouseEnter={() => setActiveItem(item.id)}
            onMouseLeave={() => setActiveItem(null)}
          >
            {item.subMenus ? (
              <button
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 font-mono text-[13px] transition-colors focus:outline-none",
                  activeItem === item.id ? "text-white" : "text-[#666666] hover:text-white"
                )}
              >
                {item.label}
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    activeItem === item.id ? "rotate-180" : ""
                  )}
                />
              </button>
            ) : (
              <Link
                href={item.href || "#"}
                className="block px-4 py-2 font-mono text-[13px] text-[#666666] hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            )}

            <AnimatePresence>
              {item.subMenus && activeItem === item.id && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute left-0 top-full pt-2 z-[60]"
                >
                  <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 min-w-[320px] md:min-w-[480px]">
                    <div className={cn(
                      "grid gap-8",
                      item.subMenus.length > 1 ? "grid-cols-2" : "grid-cols-1"
                    )}>
                      {item.subMenus.map((section, idx) => (
                        <div key={idx} className="flex flex-col gap-4">
                          <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#666666]">
                            {section.title}
                          </h4>
                          <div className="flex flex-col gap-1">
                            {section.items.map((subItem, sIdx) => (
                              <Link
                                key={sIdx}
                                href={subItem.href}
                                className="group flex items-start gap-4 p-2 hover:bg-[#161616] transition-colors"
                              >
                                <div className="mt-0.5 shrink-0 p-1 border border-[#2A2A2A] bg-[#050505] text-[#999999] group-hover:text-white group-hover:border-[#3A3A3A] transition-colors">
                                  <subItem.icon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-mono text-[13px] text-white">
                                    {subItem.label}
                                  </span>
                                  <span className="font-sans text-[11px] text-[#999999] leading-relaxed">
                                    {subItem.description}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </nav>
  );
}
