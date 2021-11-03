import { Button } from './Button';
import { useStartTimer } from '../hooks/boards';
import { useBoardState } from '../contexts/BoardProvider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BoardWithColumn } from '../api';

export const formatTime = (milliseconds: number) => {
  if (!milliseconds) {
    return '00:00';
  }
  const minutes = Math.floor(milliseconds / 60000);
  const remainingMilliseconds = milliseconds - minutes * 60000;
  const seconds = Math.floor(remainingMilliseconds / 1000);

  return [minutes, seconds].map((t) => `${t}`.padStart(2, '0')).join(':');
};

function minutesToMiliseconds(minutes: number) {
  return 60 * minutes * 1000;
}

function calculateTimeRemaining(
  board?: BoardWithColumn | null,
  defaultTimeRemaining = 1,
) {
  if (!board || !board.timer) return minutesToMiliseconds(defaultTimeRemaining);
  if (board.timer.type === 'start') {
    const calculated = board.timer.state.endTime - Date.now();

    return calculated > 0 ? board.timer.state.endTime - Date.now() : 0;
  }
  return board.timer.state.totalDuration;
}

enum TimerStates {
  STARTED = 'started',
  STOPPED = 'stopped',
  COMPLETE = 'complete',
}

type UserBoardTimerState = {
  state: TimerStates;
  formattedTime: string;
  timeRemaining: number;
  start(): Promise<void>;
  stop(): Promise<void>;
  reset(): Promise<void>;
};

const useAnimationInterval = (callback: any, timeout = 1000) => {
  const ref = useRef<number>(performance.now());

  const step = useCallback(
    (timestamp: number) => {
      if (timestamp - ref.current > timeout) {
        ref.current = timestamp;
        callback();
      }
      requestAnimationFrame(step);
    },
    [callback, timeout],
  );

  useEffect(() => {
    const animationLoop = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animationLoop);
    };
  }, [callback, step, timeout]);
};

function useBoardTimerState(board: BoardWithColumn, defaultMinutes = 5) {
  const { setTimerState } = useStartTimer(board?.id);
  const boardRef = useRef(board);
  boardRef.current = board;

  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(board, defaultMinutes),
  );

  const timeRemainingRef = useRef(timeRemaining);
  timeRemainingRef.current = timeRemaining;

  const state = useMemo(() => {
    if (timeRemaining <= 0 || !board.timer) return TimerStates.COMPLETE;
    if (board.timer.type === 'start') return TimerStates.STARTED;
    return TimerStates.STOPPED;
  }, [board.timer, timeRemaining]);

  const reset = useCallback(() => {
    return setTimerState({
      timer: {
        type: 'paused',
        state: {
          totalDuration: minutesToMiliseconds(1),
        },
      },
    });
  }, [setTimerState]);

  const start = useCallback(async () => {
    if (state === TimerStates.COMPLETE) {
      setTimeRemaining(minutesToMiliseconds(defaultMinutes));
      await reset();
    }
    await setTimerState({
      timer: {
        type: 'start',
        state: {
          startTime: Date.now(),
          endTime: Date.now() + timeRemaining,
        },
      },
    });
  }, [defaultMinutes, reset, setTimerState, state, timeRemaining]);

  const stop = useCallback(() => {
    return setTimerState({
      timer: {
        type: 'paused',
        state: {
          totalDuration: timeRemaining,
        },
      },
    });
  }, [setTimerState, timeRemaining]);

  useAnimationInterval(() => {
    if (!board) return;

    const calculatedTimeRemaining = calculateTimeRemaining(boardRef.current);

    if (calculatedTimeRemaining <= 0 && board.timer?.type === 'start') {
      if (calculatedTimeRemaining !== 0) {
        setTimeRemaining(0);
      }
    } else {
      setTimeRemaining(calculateTimeRemaining(boardRef.current));
    }
  }, 1000);

  return {
    state,
    timeRemaining,
    start,
    stop,
    reset,
  };
}

export function Timer() {
  const { board } = useBoardState();
  const { timeRemaining, state, start, stop, reset } = useBoardTimerState(
    board as BoardWithColumn,
  );

  return (
    <div className="flex items-center">
      <p>{state}</p>
      <p className="mr-2">{formatTime(timeRemaining)}</p>
      {[TimerStates.STOPPED, TimerStates.COMPLETE].includes(state) && (
        <>
          <Button onClick={() => start()} className="mr-2">
            Start
          </Button>
          <Button onClick={() => reset()} className="mr-2">
            Reset
          </Button>
        </>
      )}
      {TimerStates.STARTED === state && (
        <Button onClick={() => stop()}>Stop</Button>
      )}
    </div>
  );
}
