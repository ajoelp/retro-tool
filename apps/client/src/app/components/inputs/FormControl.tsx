import { ReactNode } from 'react';

export type FormControlProps = {
  isRequired?: boolean;
  name: string;
  label: string;
  errors?: string[] | string;
  className?: string;
  hint?: string;
  children?: ReactNode;
};

export function FormControl(props: FormControlProps) {
  const normalizedErrors =
    props.errors == null || Array.isArray(props.errors)
      ? props.errors
      : [props.errors];
  return (
    <div className={props.className}>
      <div className="flex justify-between">
        <label
          htmlFor={props.name}
          className="block text-sm font-medium text-gray-700"
        >
          {props.label}
        </label>
        {props.hint && (
          <span className="text-sm text-gray-500" id="hint">
            {props.hint}
          </span>
        )}
      </div>
      {props.children}
      {normalizedErrors?.map((error) => (
        <p className="mt-2 text-sm text-red-600" key={error}>
          {error}
        </p>
      ))}
    </div>
  );
}
