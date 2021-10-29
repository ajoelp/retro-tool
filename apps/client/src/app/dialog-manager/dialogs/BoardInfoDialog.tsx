import { Board } from '@prisma/client';
import { DialogProps } from 'dialog-manager-react';
import { useCopyToClipboard, useLocation } from 'react-use';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/inputs/TextInput';
import { BaseDialog } from './BaseDialog';

type BoardInfoDialogProps = {
  board: Board;
} & DialogProps;

export default function BoardInfoDialog(props: BoardInfoDialogProps) {
  const { active, board, closeDialog } = props;
  const location = useLocation();
  const [, copy] = useCopyToClipboard();

  const inviteCode = `${location.origin}/invites/${board.inviteCode}`;

  const confirmDialog = () => {
    window.localStorage.setItem(`board-info-shown-${board.id}`, 'true');
    closeDialog();
  };

  return (
    <BaseDialog closeDialog={props.closeDialog}>
      <h3
        className="text-lg leading-6 font-medium text-gray-900"
        id="modal-title"
      >
        Invite Members
      </h3>
      <div className="flex flex-row mt-2">
        <TextInput
          type="text"
          className="pr-2"
          value={inviteCode}
          name="invite_code"
          label="Invite users to this board by sharing the link below."
        />
        <div className="flex items-end">
          <Button onClick={() => copy(inviteCode)}>Copy</Button>
        </div>
      </div>
    </BaseDialog>
  );
}
