import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { Board } from '@prisma/client';
import { DialogProps } from 'dialog-manager-react';
import { useCopyToClipboard } from 'react-use';
import styled from 'styled-components';
import { Textarea } from '../../components/Textarea';
import { useMemo } from 'react';
import { BoardToMarkdown } from '../../utils/BoardToMarkdown';
import { useQueryClient } from 'react-query';

type BoardExportDialogProps = {
  board: Board;
} & DialogProps;

const Code = styled(Textarea)`
  border: 1px solid #efefef;
  padding: 1rem;
  white-space: pre;
`;

export default function BoardExportDialog(props: BoardExportDialogProps) {
  const { active, board, closeDialog } = props;
  const [, copy] = useCopyToClipboard();
  const queryClient = useQueryClient();

  const result = useMemo(() => {
    return new BoardToMarkdown(queryClient, board.id).build();
  }, [board.id, queryClient]);

  return (
    <Modal isOpen={active} onClose={closeDialog} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{board.title} Export</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Code value={result} />
        </ModalBody>

        <ModalFooter>
          <Flex alignItems="center" justifyContent="center">
            <Button colorScheme="blue" mr={3} onClick={() => copy(result)}>
              Copy to clipboard
            </Button>
            <Button colorScheme="blue" mr={3} onClick={closeDialog}>
              Continue
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
