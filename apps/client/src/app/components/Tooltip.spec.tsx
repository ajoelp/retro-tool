import { act, fireEvent, render, screen } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  it('will render the tooltip', async () => {
    const tooltipValue = 'This is the label';
    let element: HTMLParagraphElement | null = null;

    await act(async () => {

      render(
        <Tooltip label={tooltipValue}>
          <p
            ref={(ref) => {
              element = ref;
            }}
          >
            Hello
          </p>
        </Tooltip>,
      );
    });

      expect(element).toBeDefined();
      fireEvent.mouseOver(element!);
      jest.advanceTimersByTime(5000);
      expect(screen.getByText(tooltipValue)).toBeInTheDocument();
      fireEvent.mouseLeave(element!);
      jest.advanceTimersByTime(5000);
      expect(screen.queryByText(tooltipValue)).not.toBeInTheDocument();
  });
});
