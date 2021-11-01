import { render } from '@testing-library/react';
import AddColumnDialog from './AddColumnDialog';

describe('AddColumnDialog', () => {
  it('renders', () => {
    const { getByText } = render(
      <AddColumnDialog closeDialog={jest.fn} active={false} />,
    );

    expect(getByText('Create Column')).toBeInTheDocument();
  });
});
