import ConfirmationDialog from './ConfirmationDialog';
import { render } from '@testing-library/react';

describe('ConfirmationDialog', () => {
  it('renders', () => {
    const { getByText } = render(
      <ConfirmationDialog
        title={'Dialog Title'}
        message={'Dialog Message'}
        closeDialog={jest.fn()}
        active={false}
      />,
    );

    expect(getByText('Dialog Title')).toBeInTheDocument();
    expect(getByText('Dialog Message')).toBeInTheDocument();
  });
});
