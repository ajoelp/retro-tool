import { AnimatePresence, motion } from 'framer-motion';
import {ReactNode} from "react";

const Sizes = {
  sm: 'sm:max-w-lg sm:w-full',
  md: 'sm:max-w-2xl sm:w-full',
  lg: 'sm:max-w-4xl sm:w-full',
};

type BaseDialogProps = {
  children: ReactNode;
  closeDialog?: () => void;
  footer?: () => JSX.Element;
  active?: boolean;
  size?: keyof typeof Sizes;
};

export function BaseDialog({ children, closeDialog, footer: Footer, active = true, size = 'sm' }: BaseDialogProps) {
  return (
    <AnimatePresence>
      <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            onClick={() => {
              closeDialog?.();
            }}
          ></div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>

          {active && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className={`inline-block relative align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${Sizes[size]} z-50`}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">{children}</div>
              {Footer && (
                <div className="flex flex-row-reverse bg-gray-50 px-4 py-3">
                  <Footer />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
}
