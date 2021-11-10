import { useStartTimer } from '../hooks/boards';
import { useBoardState } from '../contexts/BoardProvider';
import { useMemo, useRef, useState } from 'react';
import { PausedState, StartState } from '@retro-tool/api-interfaces';
import { useInterval } from '../hooks/useInterval';
import { useDialogs } from '../dialog-manager';

function formatTime(time: number) {
  const minutes = Math.floor(time / 60000);
  const timeRemaining = time - minutes * 60000;
  const seconds = Math.floor(timeRemaining / 1000);
  return [minutes, seconds]
    .map((number) => number.toString().padStart(2, '0'))
    .join(':');
}

type IconProps = {
  className?: string;
};

const PlayIcon = ({ className }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
    </svg>
  );
};

const PauseIcon = ({ className }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M14 19h4V5h-4M6 19h4V5H6v14z" fill="currentColor" />
    </svg>
  );
};

const RestartIcon = ({ className }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        d="M12 4c2.1 0 4.1.8 5.6 2.3 3.1 3.1 3.1 8.2 0 11.3-1.8 1.9-4.3 2.6-6.7 2.3l.5-2c1.7.2 3.5-.4 4.8-1.7 2.3-2.3 2.3-6.1 0-8.5C15.1 6.6 13.5 6 12 6v4.6l-5-5 5-5V4M6.3 17.6C3.7 15 3.3 11 5.1 7.9l1.5 1.5c-1.1 2.2-.7 5 1.2 6.8.5.5 1.1.9 1.8 1.2l-.6 2c-1-.4-1.9-1-2.7-1.8z"
        fill="currentColor"
      />
    </svg>
  );
};

export function Timer() {
  const { board } = useBoardState();
  const { setTimerState } = useStartTimer(board!.id);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [defaultMinutes, setDefaultMinutes] = useState(5);
  const defaultTitle = useRef<string>();
  const { openDialog } = useDialogs();

  const sound = useMemo(() => {
    const audio = new Audio('/assets/notification.mp3');
    audio.load();
    return audio;
  }, []);

  const boardRef = useRef<typeof board>(board);
  boardRef.current = board;

  const defaultDuration = 60 * defaultMinutes * 1000;

  useInterval(() => {
    if (!boardRef.current || !boardRef.current.timer) return;
    const timer = boardRef.current.timer as StartState;
    const newTimeRemaining = calculateTimeRemaining(timer);

    if (!defaultTitle.current) {
      defaultTitle.current = window.document.title;
    }

    if (timer.type === 'start' && newTimeRemaining > 0) {
      window.document.title = `${formatTime(newTimeRemaining)} - ${
        defaultTitle.current
      }`;
    } else {
      window.document.title = defaultTitle.current;
    }

    setTimeRemaining((old) => {
      if (old > 0 && newTimeRemaining === 0) {
        sound.play();
      }
      return newTimeRemaining;
    });
  }, 500);

  const calculateTimeRemaining = (timer: StartState | PausedState | null) => {
    if (timer === null) return defaultDuration;
    if (timer.type === 'start') {
      const calculated = timer.state.endTime - Date.now();
      return calculated > 0 ? calculated : 0;
    }
    return timer.state.totalDuration;
  };

  const start = () => {
    const time = timeRemaining > 0 ? timeRemaining : defaultDuration;
    return setTimerState({
      timer: {
        type: 'start',
        state: {
          startTime: Date.now(),
          endTime: Date.now() + time,
        },
      },
    });
  };

  const stop = () => {
    return setTimerState({
      timer: {
        type: 'paused',
        state: {
          totalDuration: timeRemaining,
        },
      },
    });
  };

  const reset = async (time = defaultDuration) => {
    await setTimerState({
      timer: {
        type: 'paused',
        state: {
          totalDuration: 0,
        },
      },
    });
    await setTimerState({
      timer: {
        type: 'start',
        state: {
          startTime: Date.now(),
          endTime: Date.now() + time,
        },
      },
    });
  };

  const iconClasses = 'w-4 h-4 text-gray-900 dark:text-white';

  const timer = board?.timer as StartState | PausedState | null;
  return (
    <div className="flex items-center rounded text-xs bg-white dark:bg-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-offset-2 border overflow-hidden dark:border-gray-800">
      <button
        className="px-2.5 py-1.5 font-mono"
        onClick={() =>
          openDialog('updateTimer', {
            currentTime: defaultMinutes,
            onSuccess(time) {
              setDefaultMinutes(time);
              reset(60 * time * 1000);
            },
          })
        }
      >
        {formatTime(timeRemaining)}
      </button>
      {timeRemaining !== 0 && (
        <>
          {timer == null || timer?.type === 'paused' ? (
            <button
              className="px-2.5 py-1.5 hover:bg-gray-50 dark:bg-gray-600"
              onClick={start}
            >
              <PlayIcon className={iconClasses} />
            </button>
          ) : (
            <button
              className="px-2.5 py-1.5 hover hover:bg-gray-50 dark:hover:bg-gray-600"
              onClick={() => stop()}
            >
              <PauseIcon className={iconClasses} />
            </button>
          )}
        </>
      )}
      <button
        className="px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-600"
        onClick={() => reset()}
      >
        {timeRemaining <= 0 ? (
          <PlayIcon className={iconClasses} />
        ) : (
          <RestartIcon className={iconClasses} />
        )}
      </button>
    </div>
  );
}
