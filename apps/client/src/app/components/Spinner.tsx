import { classNames } from '../utils/classNames';

export function Spinner({ className, ...props }: JSX.IntrinsicElements['svg']) {
  return (
    <svg
      fill="none"
      viewBox="0 0 247 247"
      className={classNames(className, 'animate-spin')}
      {...props}
    >
      <path
        d="M123.5 71.827c19.545 0 35.389-15.855 35.389-35.414C158.889 16.855 143.045 1 123.5 1S88.111 16.855 88.111 36.413c0 19.559 15.844 35.414 35.389 35.414Z"
        fill="#8CE99A"
        stroke="#2F9E44"
        strokeWidth=".5"
      />
      <path
        d="M210.611 158.998c19.545 0 35.389-15.855 35.389-35.413 0-19.559-15.844-35.414-35.389-35.414s-35.389 15.855-35.389 35.414c0 19.558 15.844 35.413 35.389 35.413Z"
        fill="#D0BFFF"
        stroke="#7048E8"
        strokeWidth=".5"
      />
      <path
        d="M36.389 158.998c19.545 0 35.389-15.855 35.389-35.413 0-19.559-15.844-35.414-35.39-35.414C16.845 88.171 1 104.026 1 123.585c0 19.558 15.844 35.413 35.389 35.413Z"
        fill="#74C0FC"
        stroke="#1C7ED6"
        strokeWidth=".5"
      />
      <path
        d="M123.5 246.169c19.545 0 35.389-15.855 35.389-35.413 0-19.558-15.844-35.413-35.389-35.413s-35.389 15.855-35.389 35.413c0 19.558 15.844 35.413 35.389 35.413Z"
        fill="#FFA8A8"
        stroke="#F03E3E"
        strokeWidth=".5"
      />
    </svg>
  );
}
