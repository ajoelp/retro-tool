import {Button} from "./Button";
import {useStartTimer} from "../hooks/boards";
import {useBoardState} from "../contexts/BoardProvider";
import {useEffect, useState} from "react";
import {StartState} from "@retro-tool/api-interfaces";

export function Timer() {

  const {board} = useBoardState();
  const { setTimerState } = useStartTimer(board!.id)
  const [timeRemaining, setTimeRemaining] = useState(0);

  const numberOfMinutes = 5;
  const startTime = Date.now();
  const endTime = Date.now() + (60 * numberOfMinutes * 1000);

  console.log(board);

  useEffect(() => {
    const interval = setInterval(() => {
      if(!board) return;
      const timer = board.timer as StartState
      console.log('time!', timer.state.endTime - Date.now())
      setTimeRemaining(
        timer.state.endTime - Date.now()
      )
      return () => {
        clearInterval(interval)
      }
    }, 1000)
  }, [board!.timer])

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
    return ''
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
