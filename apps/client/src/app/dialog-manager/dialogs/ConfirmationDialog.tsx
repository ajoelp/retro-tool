import { DialogProps } from 'dialog-manager-react';
import { Button } from '../../components/Button';
import { BaseDialog } from './BaseDialog';

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

  const footer = () => {
    return (
      <div>
        <Button variant="white" onClick={cancelDialog} className="mr-3">
          No
        </Button>
        <Button variant="primary" onClick={confirmDialog}>
          Yes
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
        {title}
      </h3>
      <div className="mt-2">{message}</div>
    </BaseDialog>
  );
}
