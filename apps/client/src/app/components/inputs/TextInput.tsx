import { FormControl, FormControlProps } from './FormControl';
import { forwardRef, useMemo } from 'react';
import { classNames } from '../../utils/classNames';

type TextInputProps = Omit<FormControlProps, 'children'> & {
  isLoading?: boolean;
} & JSX.IntrinsicElements['input'];

export const TextInput = forwardRef<any, TextInputProps>((props, ref) => {
  const {
    isLoading,
    className,
    label,
    errors,
    type = 'text',
    ...inputProps
  } = props;

  const isInvalid = errors && errors.length > 0;

  const extraProps = useMemo(() => {
    if (isInvalid) {
      return {
        'aria-invalid': true,
        'aria-describedby': `${props.name}-error`,
      };
    }
    return {};
  }, [isInvalid, props.name]);

  const classes = classNames(
    'block w-full border-gray-300 pr-10 focus:outline-none sm:text-sm rounded-md',
    isInvalid &&
      'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
  );

  return (
    <FormControl
      name={props.name}
      label={label}
      className={className}
      errors={errors}
    >
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          className={classes}
          type={type}
          {...extraProps}
          {...inputProps}
          ref={ref}
        />
      </div>
    </FormControl>
  );
});
