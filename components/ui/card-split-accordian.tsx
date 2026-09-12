'use client';

import React, { useState, type FC } from 'react';
import { motion, MotionConfig, type Transition } from 'motion/react';
import { ChevronDown, Send, Layers } from 'lucide-react';
import { HiCursorArrowRipple } from 'react-icons/hi2';
import { IoIosTimer } from 'react-icons/io';
import { PiHandTap } from 'react-icons/pi';
import useMeasure from 'react-use-measure';

export interface AccordionItemData {
  id: number;
  title: string;
  icon: React.ReactNode;
  content: string;
}

interface AccordionItemProps {
  item: AccordionItemData;
  setOpenId: (id: number | null) => void;
  index: number;
  total: number;
  openIndex: number;
}

export interface AccordionProps {
  items?: AccordionItemData[];
  className?: string;
}

const springTransition: Transition = {
  type: 'spring',
  stiffness: 600,
  damping: 50,
  mass: 1,
};

export const DEFAULT_ITEMS: AccordionItemData[] = [
  {
    id: 1,
    title: 'What is Interaction Design?',
    icon: <HiCursorArrowRipple className="size-4 -rotate-12 text-sky-400" />,
    content:
      'Interaction design focuses on creating engaging interfaces with well-thought-out behaviors and actions.',
  },
  {
    id: 2,
    title: 'Principles & Patterns',
    icon: <Layers className="size-4 text-emerald-400" />,
    content:
      'Fundamental guidelines and repeated solutions that ensure consistency and usability in design.',
  },
  {
    id: 3,
    title: 'Usability & Accessibility',
    icon: <PiHandTap className="size-4 -rotate-12 text-amber-400" />,
    content:
      'Designing experiences that are easy to use and accessible to people of all abilities.',
  },
  {
    id: 4,
    title: 'Prototyping & Testing',
    icon: <Send className="size-4 text-indigo-400" />,
    content:
      'Rapid experimentation and validation of ideas through prototypes and real user testing.',
  },
  {
    id: 5,
    title: 'UX Optimisation',
    icon: <IoIosTimer className="size-4 text-rose-400" />,
    content:
      'Improving user experience by analyzing behavior and refining interactions over time.',
  },
];

export const AccordionItem: FC<AccordionItemProps> = ({
  item,
  setOpenId,
  index,
  total,
  openIndex,
}) => {
  const [ref, bounds] = useMeasure();
  const isOpen = index === openIndex;

  const isFirst = index === 0;
  const isLast = index === total - 1;

  const isBeforeOpen = index === openIndex - 1;
  const isAfterOpen = index === openIndex + 1;

  const isAlone = (isAfterOpen && isLast) || (isBeforeOpen && isFirst);

  const BORDER_WIDTH = '1px';
  const BORDER_STYLE = 'solid';
  const borderTopWidth =
    isFirst || isAfterOpen || isOpen ? BORDER_WIDTH : '0px';
  const borderBottomWidth =
    isLast || isBeforeOpen || isOpen ? BORDER_WIDTH : '0px';
  const borderLeftWidth = BORDER_WIDTH;
  const borderRightWidth = BORDER_WIDTH;

  let borderTopLeftRadius = 0;
  let borderTopRightRadius = 0;
  let borderBottomLeftRadius = 0;
  let borderBottomRightRadius = 0;

  if (isOpen || isAlone) {
    borderTopLeftRadius = 20;
    borderTopRightRadius = 20;
    borderBottomLeftRadius = 20;
    borderBottomRightRadius = 20;
  } else if (isBeforeOpen) {
    borderBottomLeftRadius = 20;
    borderBottomRightRadius = 20;
  } else if (isAfterOpen) {
    borderTopLeftRadius = 20;
    borderTopRightRadius = 20;
  } else if (isFirst) {
    borderTopLeftRadius = 20;
    borderTopRightRadius = 20;
  } else if (isLast) {
    borderBottomLeftRadius = 20;
    borderBottomRightRadius = 20;
  }

  return (
    <MotionConfig transition={springTransition}>
      <motion.li layout className="list-none">
        <motion.div
          animate={{
            borderTopLeftRadius,
            borderTopRightRadius,
            borderBottomLeftRadius,
            borderBottomRightRadius,
          }}
          className="overflow-hidden border-solid border-zinc-800 bg-zinc-900/90 backdrop-blur-md will-change-transform shadow-lg transition-colors hover:border-zinc-700"
          style={{
            borderTopWidth,
            borderBottomWidth,
            borderLeftWidth,
            borderRightWidth,
            borderStyle: BORDER_STYLE,
            marginBlock: isOpen ? '10px' : '0px',
          }}
        >
          <button
            type="button"
            onClick={() => setOpenId(isOpen ? null : item.id)}
            className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 ring-1 ring-white/10">
                {item.icon}
              </span>

              <span className="text-sm font-semibold text-zinc-100 md:text-base">
                {item.title}
              </span>
            </div>

            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="size-5 text-zinc-400" />
            </motion.div>
          </button>

          <motion.div
            initial={false}
            animate={{
              height: isOpen ? bounds.height : 0,
              opacity: isOpen ? 1 : 0,
            }}
            className="overflow-hidden will-change-transform"
          >
            <div ref={ref}>
              <div className="px-4 pb-4 pt-1 text-xs font-normal leading-relaxed text-zinc-400 md:text-sm">
                {item.content}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.li>
    </MotionConfig>
  );
};

export const CardSplitAccordion: FC<AccordionProps> = ({ items, className = '' }) => {
  const defaultItems = items ?? DEFAULT_ITEMS;
  const [openId, setOpenId] = useState<number | null>(null);
  const openIndex = defaultItems.findIndex((item) => item.id === openId);

  return (
    <div className={`flex w-full flex-col items-center justify-center p-2 ${className}`}>
      <ul className="w-full max-w-xl space-y-0 p-0 m-0">
        {defaultItems.map((item, index) => (
          <AccordionItem
            key={item.id}
            item={item}
            setOpenId={setOpenId}
            index={index}
            total={defaultItems.length}
            openIndex={openIndex}
          />
        ))}
      </ul>
    </div>
  );
};

export default CardSplitAccordion;
