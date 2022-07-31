import { Board } from '@prisma/client';
import { DialogProps } from 'dialog-manager-react';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCopyToClipboard } from 'react-use';
import { Button } from '../../components/Button';
import { BoardToMarkdown } from '../../utils/BoardToMarkdown';
import { BaseDialog } from './BaseDialog';

type BoardExportDialogProps = {
  board: Board;
} & DialogProps;

export default function BoardExportDialog(props: BoardExportDialogProps) {
  const { active, board, closeDialog } = props;
  const [, copy] = useCopyToClipboard();
  const queryClient = useQueryClient();

  const result = useMemo(() => {
    return new BoardToMarkdown(queryClient, board.id).build();
  }, [board.id, queryClient]);

  const footer = () => {
    return (
      <div>
        <Button variant="white" className="mr-2" onClick={() => copy(result)}>
          Copy to clipboard
        </Button>

        <Button variant="primary" onClick={closeDialog}>
          Continue
        </Button>
      </div>
    );
  };

  return (
    <BaseDialog footer={footer} closeDialog={props.closeDialog}>
      <h3
        className="text-lg leading-6 font-medium text-gray-900"
        id="modal-title"
      >
        {board.title} Export
      </h3>
      <div className="mt-2">
        <textarea
          className="resize border p-1 bg-transparent whitespace-pre rounded"
          defaultValue={result}
          readOnly={true}
        ></textarea>
      </div>
    </BaseDialog>
  );
}
