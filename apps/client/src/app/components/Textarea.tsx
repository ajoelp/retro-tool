import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

type TextareaProps = {
  value: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
};

type TextAreaWrapperProps = {
  $disabled?: boolean;
};
const TextAreaWrapper = styled.textarea<TextAreaWrapperProps>`
  width: 100%;
  ${({ $disabled }) => css`
    cursor: ${$disabled ? 'auto' : 'text'};
  `}
`;

export function Textarea({
  value: defaultValue,
  className,
  disabled,
  onChange,
}: TextareaProps) {
  const [value, setValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isFocused && value !== defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue, isFocused, value]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
  }, [value, defaultValue]);

  const onValueChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      onChange?.(e.target.value);
    },
    [onChange],
  );

  return (
    <TextAreaWrapper
      ref={ref}
      disabled={disabled}
      className={className}
      value={value}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      // onInput={onInput}
      $disabled={disabled}
      onChange={onValueChange}
    />
  );
}
