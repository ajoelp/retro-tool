import {Button} from "./Button";
import {useStartTimer} from "../hooks/boards";
import {useBoardState} from "../contexts/BoardProvider";
import {useEffect, useRef, useState} from "react";
import {PausedState, StartState} from "@retro-tool/api-interfaces";

export function Timer() {

  const {board} = useBoardState();
  const { setTimerState } = useStartTimer(board!.id)
  const [timeRemaining, setTimeRemaining] = useState(0);

  const boardRef = useRef<typeof board>(board)
  boardRef.current = board

  const numberOfMinutes = 5;
  const startTime = Date.now();
  const endTime = Date.now() + (60 * numberOfMinutes * 1000);

  console.log(board);

  useEffect(() => {
    console.log('board:',boardRef.current);
    const interval = setInterval(() => {
      if(!boardRef.current || !boardRef.current.timer) return;
      const timer = boardRef.current.timer as StartState
      console.log('time!', timer.state.endTime - Date.now())
      setTimeRemaining(
        calculateTimeRemaining(timer)
      )
      return () => {
        clearInterval(interval)
      }
    }, 1000)
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

  return(
    <div className="flex items-center">
      <p className="mr-2">{timeRemaining}</p>
      <Button onClick={() => start()} className="mr-2">
        Start
      </Button>
      <Button onClick={() => stop()}>
        Stop
      </Button>
    </div>
  )
}
