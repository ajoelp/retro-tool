import {useStartTimer} from "../hooks/boards";
import {useBoardState} from "../contexts/BoardProvider";
import {useEffect, useRef, useState} from "react";
import {PausedState, StartState} from "@retro-tool/api-interfaces";
import {PauseIcon, PlayIcon, XCircleIcon} from "@heroicons/react/solid";

function formatTime (time: number) {
  const minutes = Math.floor(time / 60000)
  const timeRemaining = time - minutes * 60000
  const seconds = Math.floor(timeRemaining / 1000)
  return [minutes, seconds]
    .map(number => number.toString().padStart(2, '0'))
    .join(':')
}

export function Timer() {

  const {board} = useBoardState();
  const { setTimerState } = useStartTimer(board!.id)
  const [timeRemaining, setTimeRemaining] = useState(0);

  const boardRef = useRef<typeof board>(board)
  boardRef.current = board

  const numberOfMinutes = 5;
  const startTime = Date.now();
  const defaultDuration = 60 * numberOfMinutes * 1000;
  const endTime = Date.now() + defaultDuration;

  useEffect(() => {
    const interval = setInterval(() => {
      if(!boardRef.current || !boardRef.current.timer) return;
      const timer = boardRef.current.timer as StartState
      setTimeRemaining(
        calculateTimeRemaining(timer)
      )
      return () => {
        clearInterval(interval)
      }
    }, 50)
  }, [])

  const calculateTimeRemaining = (timer: StartState | PausedState) => {
    if (timer.type === 'start') {
      return timer.state.endTime - Date.now()
    }
    return timer.state.totalDuration
  }

  const start = () => {
    setTimerState({
      timer: {
        type: "start",
        state: {
          startTime,
          endTime,
        }
      }
    })
  }

  const stop = () => {
    setTimerState({
      timer: {
        type: "paused",
        state: {
          totalDuration: timeRemaining
        }
      }
    })
  }

  const reset = () => {
    setTimerState({
      timer: {
        type: "paused",
        state: {
          totalDuration: defaultDuration
        }
      }
    })
  }

  const timer = board?.timer as StartState | PausedState | null;
  return(
    <div className="flex items-center">
      <p className="mr-2">{formatTime(timeRemaining)}</p>
      {
        timer?.type === 'paused'
            ? (<PlayIcon className='w-8 h-8 text-purple-600' onClick={start}/>) :(<PauseIcon className='w-8 h-8 text-purple-600' onClick={() => stop()}/>)
      }
      <XCircleIcon onClick={() => reset()} className="w-8 h-8 ml-2 text-purple-600"/>
    </div>
  )
}
