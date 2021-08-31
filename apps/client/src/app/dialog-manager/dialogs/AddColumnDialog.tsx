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
  Input,
} from '@chakra-ui/react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

type ConfirmationDialogProps = {
  onSuccess?: (columnName: string) => void;
} & DialogProps;

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
  const { active, onSuccess, closeDialog } = props;
  const { register, handleSubmit, watch } = useForm();

  const confirmDialog = (data: any) => {
    onSuccess?.(data.name);
    closeDialog();
  };

  return (
    <Modal isOpen={active} onClose={closeDialog}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Column</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(confirmDialog)}>
            <FormControl id="columnName" isRequired>
              <FormLabel>What should the column be named?</FormLabel>
              <Input
                required
                type="columnName"
                {...register('name', { required: true })}
              />
            </FormControl>
          </form>
        </ModalBody>

        <ModalFooter>
          <Flex alignItems="center" justifyContent="center">
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => confirmDialog(watch())}
            >
              Create
            </Button>
            <Button variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
