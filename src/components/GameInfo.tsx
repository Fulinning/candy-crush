import React from 'react';

interface IProp {
  step: number;
  point: number;
  endPoint: number;
  initGame: () => void
}

function GameInfo (props: IProp) {
  return (
    <div>
      <div>
        <span>剩余步数: <b>{props.step}</b> 步</span>
        <span>目标分数: <b>{props.endPoint}</b> 分</span>
      </div>
      <div>
        <span>当前得分: <b>{props.point}</b> 分</span>
        <button className="restart" onClick={props.initGame}>重新开始</button>
      </div>
    </div>
  )
}

export default GameInfo