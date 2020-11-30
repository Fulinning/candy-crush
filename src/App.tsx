import React from 'react';
import Header from './components/Header'
import GameInfo from './components/GameInfo'
import CandyPanel from './components/CandyPanel'
import './App.css';

interface IProp {}
interface IState {
  step: number;
  point: number;
  endPoint: number;
  squareData: string[][];
}

interface ISquare {
  row: number,
  col: number
}

interface INeedClearSquareBlock {
  type: SpecialCandy,
  range: string[],
  specialCandyPosition?: string
}

enum SpecialCandy {
  None,
  FishClear,
  RowClear,
  ColClear,
  BoomClear,
  SameColorKill,
  ChangeColorKill
}

class App extends React.Component<IProp, IState> {
  constructor (props: IProp) {
    super(props)
    this.state = {
      step: 0,
      point: 0,
      endPoint: 20,
      squareData: [],
    }
  }

  private _squareLength: number = 10
  private _candyPool: string[] = ['red', 'green', 'blue', 'yellow', 'orange', 'purple']
  private _movedSquare: string[] = [] // 移动的方块列表，保存着方块的坐标，形如1,2、3,4这样


  public componentDidMount () {
    this.initGame()
  }

  private _getRandomCandy = () => {
    return this._candyPool[Math.floor(Math.random() * 6)]
  }

  // 初始化二维数组
  private _initSquareData = (): void => {
    const { squareData } = this.state
    for (let i = 0; i < this._squareLength; i++) {
      // 设置每一行为一个长度为_squareLength的数组
      squareData[i] = new Array(this._squareLength)
      for (let j = 0; j < this._squareLength; j++) {
        squareData[i][j] = this._getRandomCandy()
      }
    }
    this.setState({ squareData })
  }

  // 得到需要删除的方块列表
  private _getNeedClearSquareList = (): number[][] => {
    const needClearSquareList: number[][] = [];
    const { squareData } = this.state
    for (let x: number = 0; x < this._squareLength; x++) {
      for (let y: number = 0; y < this._squareLength; y++) {
        if (squareData[x][y] === '' || squareData[x][y].endsWith('_detele')) {
          continue;
        }
        let x0: number = x;
        let x1: number = x;
        let y0: number = y;
        let y1: number = y;
        while (x0 >= 0 && squareData[x0][y] === squareData[x][y]) {
          --x0;
        }
        while (x1 < this._squareLength && squareData[x1][y] === squareData[x][y]) {
          ++x1;
        }
        while (y0 >= 0 && squareData[x][y0] === squareData[x][y]) {
          --y0;
        }
        while (y1 < this._squareLength && squareData[x][y1] === squareData[x][y]) {
          ++y1;
        }

        if (x1 - x0 > 3 || y1 - y0 > 3) {
          needClearSquareList.push([x, y])
        }
      }
    }
    return needClearSquareList
  }

  private _resetSquareData = (needClearSquareList: number[][]) => {
    const { squareData } = this.state
    for (const square of needClearSquareList) {
      squareData[square[0]][square[1]] = ''
    }
    this.setState({ squareData })
  }

  private _squareFail = () => {
    const { squareData } = this.state
    const m: number = 10
    const n: number = 10
    for (let j: number = 0; j < n; ++j) {
      let t: number = m - 1
      for (let i: number = m - 1; i >= 0; --i) {
        if (squareData[i][j] !== '') {
          // 交换值
          [squareData[i][j], squareData[t][j]] = [squareData[t][j], squareData[i][j]]
          t -= 1
        }
      }
    }
  }

  private _fillSquare = () => {
    const { squareData } = this.state
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (squareData[i][j] === '') {
          squareData[i][j] = this._getRandomCandy()
        }
      }
    }
  }

  private _clearSquare = (needClearSquareList: number[][]) => {
    this._resetSquareData(needClearSquareList);
    this._squareFail();
    this._fillSquare();
  }

  // 初始化清除方块
  private _initClearSquare = () => {
    let needClearSquareList: number[][] = this._getNeedClearSquareList()
    while (needClearSquareList.length) {
      this._clearSquare(needClearSquareList);
      needClearSquareList = this._getNeedClearSquareList()
    }
  }
  
  private _tempSquare = (startSquare: number[], endSquare: number[]) => {
    const { squareData } = this.state;
    const [startX, startY] = startSquare;
    const [endX, endY] = endSquare;
    [squareData[startX][startY], squareData[endX][endY]] = [squareData[endX][endY], squareData[startX][startY]]
  }

  private _checkSquareAndClearOrTempBack = (startSquare: number[], endSquare: number[]) => {
    let needClearSquareBlockList: INeedClearSquareBlock[] = this._getNeedClearSquareBlockList()
    if (!needClearSquareBlockList.length) {
      this._tempSquare(startSquare, endSquare)
    } else {
      while (needClearSquareBlockList.length) {
        // this._clearSquare(needClearSquareBlockList);
        needClearSquareBlockList = this._getNeedClearSquareBlockList()
      }
    }
  }

  private _getNeedClearSquareBlockList = (): INeedClearSquareBlock[] => {
    const needClearSquareBlock: INeedClearSquareBlock[] = []
    const { squareData } = this.state
    squareData.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        const sameColorSquareBlock: string[] = this._getSameColorSquareBlock(rowIndex, colIndex, [])
      })
    })
    return needClearSquareBlock
  }

  // 获取这个方块上下左右四个方向相同颜色的方块，通过递归调用，可获得与当前方块相同颜色的所有连通方块
  private _getSameColorSquareBlock = (row: number, col: number, list: string[]): string[] => {
    const { squareData } = this.state
    const currentColor: string = squareData[row][col]
    list.push(`${row},${col}`)
    const listString = list.join('|')
    if (row - 1 >= 0 && squareData[row - 1][col] === currentColor && !listString.includes(`${row - 1},${col}`)) {
      this._getSameColorSquareBlock(row - 1, col, list)
    }
    if (row + 1 <= this._squareLength && squareData[row + 1][col] === currentColor && !listString.includes(`${row + 1},${col}`)) {
      this._getSameColorSquareBlock(row + 1, col, list)
    }
    if (col - 1 >= 0 && squareData[row][col - 1] === currentColor && !listString.includes(`${row},${col - 1}`)) {
      this._getSameColorSquareBlock(row, col - 1, list)
    }
    if (col + 1 <= this._squareLength && squareData[row][col + 1] === currentColor && !listString.includes(`${row},${col + 1}`)) {
      this._getSameColorSquareBlock(row, col + 1, list)
    }
    return list
  }

  // 检查这个连通方块区域是否需要被清除
  private _checkSameColorSquare = (sameColorSquareBlock: string[]): INeedClearSquareBlock | undefined => {
    if (sameColorSquareBlock.length < 3) return
    const positionList: string[][] = sameColorSquareBlock.map(item => item.split(',')) // ['1,2', '1,3'] => [['1', '2'], ['1', '3']]
    const connectRowMaxLength = this._getConnectRowMaxLength(positionList)
    const connectColMaxLength = this._getConnectColMaxLength(positionList)
    const rowRange = this._getRowRange(positionList)
    const colRange = this._getColRange(positionList)
    // const type: SpecialCandy = this._getSpacialCandyType(sameColorSquareBlock.length, connectRowMaxLength, connectColMaxLength, rowRange, colRange)
  }

  // 得到相连接的行的最大长度
  private _getConnectRowMaxLength = (positionList: string[][]): number => {
    return Math.max(...positionList.map(mapItem => positionList.filter(item => item[0] === mapItem[0]).length))
  }

  // 得到相连接的列的最大长度
  private _getConnectColMaxLength = (positionList: string[][]): number => {
    return Math.max(...positionList.map(mapItem => positionList.filter(item => item[1] === mapItem[1]).length))
  }

  // 得到行的最大跨度
  private _getRowRange = (positionList: string[][]): number => {
    const rowList = positionList.map(item => Number(item[0]))
    return Math.max(...rowList) - Math.min(...rowList) + 1
  }

  // 得到列的最大跨度
  private _getColRange = (positionList: string[][]): number => {
    const colList = positionList.map(item => Number(item[1]))
    return Math.max(...colList) - Math.min(...colList) + 1
  }

  // private _getSpacialCandyType = (length: number, connectRowLength: number, connectColLength: number, rowRange: number, colRange: number): SpecialCandy => {
  //   if (length === 3 && (rowRange === 1 || colRange === 1)) {
  //     return SpecialCandy.None
  //   }
  // }

  public initGame = () => {
    this._initSquareData()
    this._initClearSquare();
  }

  public tempSquareAndClear = (startSquare: number[], endSquare: number[]): void => {
    this._tempSquare(startSquare, endSquare)
    this._movedSquare = [startSquare.join(), endSquare.join()]
    this._checkSquareAndClearOrTempBack(startSquare, endSquare)
  }

  public render (): JSX.Element {
    const { step, point, endPoint, squareData } = this.state
    return (
      <div className="app">
        <Header />
        <GameInfo
          step={step}
          point={point}
          endPoint={endPoint}
          initGame={() => this.initGame()}
        />
        <CandyPanel 
          squareData={squareData}
          tempSquare={this.tempSquareAndClear}
        />
      </div>
    )
  }
}

export default App;
