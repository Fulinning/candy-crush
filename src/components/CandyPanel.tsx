import React from 'react';

interface Iprops {
  squareData: string[][];
  tempSquare: (startSquare: number[], endSquare: number[]) => void
}

function CandyPanel (props: Iprops) {
  const { squareData, tempSquare } = props
  let _isDraging: boolean= false
  let startSquare: number[] = []
  let endSquare: number[] = []
  
  const _handleMouseDown = (startRow: number, startCol: number): void => {
    _isDraging = true
    startSquare = [startRow, startCol]
  }

  const _handleMouseEnter = (endRow: number, endCol: number): void => {
    if (!_isDraging) return
    _isDraging = false
    endSquare = [endRow, endCol]
    const [startX, startY] = startSquare;
    const [endX, endY] = endSquare;
    // 如果值是一样的或者是斜着移动，就不交换方块
    if (squareData[startX][startY] !== squareData[endX][endY] && (startX - endX === 0 || startY - endY === 0)) {
      tempSquare(startSquare, endSquare)
      _initStartSquareAndEndSquare()
    }
  }

  const _handleMouseUp = (): void => {
    _isDraging = false
  }

  const _handleMouseLeave = (): void => {
    _isDraging = false
  }

  const _initStartSquareAndEndSquare = (): void => {
    startSquare = []
    endSquare = []
  }

  return (
    <div
      className="candy-panel"
      onMouseLeave={() => _handleMouseLeave()}
    >
      {
        squareData.map((row, rowIndex) => {
          return (
            <div key={`${Math.random().toFixed(4)}`} className="candy-row">
              {
                row.map((col, colIndex) => {
                  return (
                    <div
                      key={`${Math.random().toFixed(4)}`}
                      className={`candy-item ${col}`}
                      onMouseDown={() => _handleMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => _handleMouseEnter(rowIndex, colIndex)}
                      onMouseUp={() => _handleMouseUp()}
                    />
                  )
                })
              }
            </div>
          )
        })
      }
    </div>
  )
}

export default CandyPanel