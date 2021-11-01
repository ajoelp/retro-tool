import { ReactNode, useState } from 'react';
import { usePopper } from 'react-popper';
import { AnimatePresence, motion } from 'framer-motion';

type TooltipProps = {
  label: string;
  children: ReactNode;
};

export function isString(value: any): value is string {
  return Object.prototype.toString.call(value) === '[object String]';
}

export function Tooltip({ label, children }: TooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [referenceElement, setReferenceElement] =
    useState<HTMLSpanElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [{ name: 'arrow', options: { element: arrowElement } }],
  });

  return (
    <>
      <span
        tabIndex={-1}
        ref={setReferenceElement}
        onMouseOver={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </span>
      <AnimatePresence>
        {showTooltip && (
          <div
            {...attributes.popper}
            ref={setPopperElement}
            style={styles.popper}
          >
            <motion.div
              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 shadow"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              {label}
              <div ref={setArrowElement} style={styles.arrow} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
