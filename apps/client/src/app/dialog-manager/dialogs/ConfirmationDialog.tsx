import { DialogProps } from 'dialog-manager-react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
} from '@chakra-ui/react';

type ConfirmationDialogProps = {
  title: string;
  message: string;
  onCancel?: () => void;
  onSuccess?: () => void;
} & DialogProps;

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
  const { onCancel, active, title, message, onSuccess, closeDialog } = props;

  const cancelDialog = () => {
    onCancel?.();
    closeDialog();
  };
  const confirmDialog = () => {
    onSuccess?.();
    closeDialog();
  };

  return (
    <Modal isOpen={active} onClose={cancelDialog}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{message}</ModalBody>

        <ModalFooter>
          <Flex alignItems="center" justifyContent="center">
            <Button colorScheme="blue" mr={3} onClick={confirmDialog}>
              Yes
            </Button>
            <Button variant="ghost" onClick={cancelDialog}>
              No
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
