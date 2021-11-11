import { DialogProps } from 'dialog-manager-react';
import { CardType } from '@retro-tool/api-interfaces';
import { AnimatePresence, motion } from 'framer-motion';
import { CardWrapper } from '../../components/Card';

type CardChildrenDialogProps = DialogProps & {
  card: CardType;
};

export default function CardChildrenDialog(props: CardChildrenDialogProps) {
  const { active, closeDialog, card } = props;
  return (
    <AnimatePresence>
      {active && (
        <div className="fixed top-0 left-0 w-screen h-screen overflow-y-scroll flex flex-col z-50">
          <motion.button
            className="absolute top-0 left-0 h-screen w-screen bg-white dark:bg-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            onClick={closeDialog}
          />
          <div className="w-full max-w-2xl m-auto relative z-50 grid grid-cols-2 gap-2 ">
            {card.children?.map((child, index) => (
              <CardWrapper
                card={card}
                index={index}
                hasChildren={false}
                isGroupedOver={false}
                isDragging={false}
              />
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
