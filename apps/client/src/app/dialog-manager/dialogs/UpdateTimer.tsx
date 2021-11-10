import { DialogProps } from 'dialog-manager-react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/inputs/TextInput';
import { BaseDialog } from './BaseDialog';

type UpdateTimerDialogProps = {
  onSuccess?: (minutes: number) => void;
  currentTime: number;
} & DialogProps;

export default function UpdateTimerDialog(props: UpdateTimerDialogProps) {
  const { active, onSuccess, closeDialog, currentTime } = props;
  const { register, handleSubmit, watch } = useForm();

  const confirmDialog = (data: any) => {
    onSuccess?.(data.minutes);
    closeDialog();
  };

  console.log(watch());

  const footer = () => {
    return (
      <div>
        <Button variant="white" className="mr-2" onClick={closeDialog}>
          Close
        </Button>

        <Button variant="primary" onClick={() => confirmDialog(watch())}>
          Save
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
        Update Timer
      </h3>
      <div className="mt-2">
        <form onSubmit={handleSubmit(confirmDialog)}>
          <TextInput
            label="Timer minutes"
            type="number"
            defaultValue={currentTime}
            required
            {...register('minutes', { required: true })}
          />
          <input />
        </form>
      </div>
    </BaseDialog>
  );
}
