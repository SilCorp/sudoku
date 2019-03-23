module.exports = function solveSudoku(matrix) {
    // Клонируем исходную матрицу
    let sudoku = [];
    matrix.forEach(function (array) {
        sudoku.push(array.slice());
    });

    function getNumOfSec(row, col){
        let j = Math.floor(col / 3);
        let i = Math.floor(row / 3);
        return i * 3 + j;
    }
    function ZeroCell(rowIndex, colIndex){
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.values = [];
    }
    function Sector(){
        this.numbers = [];
        this.zeroCells = [];
        this.rows = {};
        this.columns = {};
    }

    // Сектора с их числами
    let sectors = new Array(9);
    for (let i = 0; i < 9; i++) {
        sectors[i] = new Sector();
    }
    sectors.getAllZeroCells = function() {
        let Result = [];
        for (let i = 0; i < this.length; i++) {
            let sector = this[i];
            for (let j = 0; j < sector.zeroCells.length; j++) {
                let zeroCell = sector.zeroCells[j];
                Result.push(zeroCell);
            }
        }
        return Result;
    };

    // Заполняем сектора, принадлежащими им числами и пустыми клетками
    // Инициализируем в секторах поля со строками и столбцами
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let numOfSec = getNumOfSec(i, j);
            if (sudoku[i][j] === 0) {
                let newZeroCell = new ZeroCell(i, j);
                sectors[numOfSec].zeroCells.push(newZeroCell);

                let rowSec = sectors[numOfSec].rows[i];
                let columnSec = sectors[numOfSec].columns[j];
                if (!rowSec) {
                    sectors[numOfSec].rows[i] = {
                        colIndex: [],
                        values: []
                    };
                    rowSec = sectors[numOfSec].rows[i];
                }
                if (!columnSec) {
                    sectors[numOfSec].columns[j] = {
                        rowIndex: [],
                        values: []
                    };
                    columnSec = sectors[numOfSec].columns[j];
                }
                rowSec.colIndex.push(j);
                columnSec.rowIndex.push(i);
                continue;
            }
            sectors[numOfSec].numbers.push(sudoku[i][j]);
        }
    }

    let zeroCells = sectors.getAllZeroCells();
    // Если нулевых ячеек нет, возвращаем решенную Судоку
    if (zeroCells.length === 0) {
        return sudoku;
    }
    // Заполняем пустые клетки возможными значениями
    for (let value = 1; value <= 9; value++) {
        for (let i = 0; i < zeroCells.length; i++) {
            let row = zeroCells[i].rowIndex;
            let col = zeroCells[i].colIndex;
            let numOfSec = getNumOfSec(row, col);

            //Проверки на сектор, строку и столбец
            let sectorCheck = sectors[numOfSec].numbers.indexOf(value);
            let rowColCheck = false;
            for (let i = 0; i < 9; i++) {
                if (sudoku[row][i] === value ||
                    sudoku[i][col] === value) {
                    rowColCheck = true;
                    break;
                }
            }
            // Если все проверки пройдены
            if (sectorCheck === -1 &&
                !rowColCheck) {
                // Добавляем число
                zeroCells[i].values.push(value);

                // И данные в сектор для последующей обработки
                let rowSec = sectors[numOfSec].rows[row];
                let columnSec = sectors[numOfSec].columns[col];

                if (rowSec.values.indexOf(value) === -1) {
                    rowSec.values.push(value);
                }
                if (columnSec.values.indexOf(value) === -1) {
                    columnSec.values.push(value);
                }
            }
        }
    }

    /*
    Находим строку или столбец в секторе,
    где количество возможных значений равно количеству нулевых ячеек в
    этом столбце/строке. И удаляет эти значения из других ячеек столбца/строки
    и из остальных ячеек этого сектора (т.е из других строк, кроме тем самых найденных ячеек)
     */
    for (let secIndex = 0; secIndex < 9; secIndex++) {
        let sector = sectors[secIndex];
        for (let key in sector.rows) {
            let row = sector.rows[key];
            if (row.colIndex.length === row.values.length) {
                for (let i = 0; i < zeroCells.length; i++) {
                    if (zeroCells[i].rowIndex == key &&
                        row.colIndex.indexOf(zeroCells[i].colIndex) === -1){
                        zeroCells[i].values = zeroCells[i].values.filter(function (value) {
                            return (row.values.indexOf(value) === -1)
                        })
                    }
                }
            }
        }
        for (let key in sector.columns) {
            let column = sector.columns[key];
            if (column.rowIndex.length === column.values.length) {
                for (let i = 0; i < zeroCells.length; i++) {
                    if (zeroCells[i].colIndex == key &&
                        column.rowIndex.indexOf(zeroCells[i].rowIndex) === -1){
                        zeroCells[i].values = zeroCells[i].values.filter(function (value) {
                            return (column.values.indexOf(value) === -1)
                        })
                    }
                }
            }
        }
    }

    // Находим минимальное кол-во возможных значений ячейки
    let minCountValues = 9;
    let minValuesIndex = 0;
    for (let i = 0; i < zeroCells.length; i++) {
        // Если в пустой ячейке нет возможных значений, значит судоку
        // составлена не верно, возвращаем false
        if (zeroCells[i].values.length === 0) {
            return false;
        }
        if (minCountValues > zeroCells[i].values.length) {
            minCountValues = zeroCells[i].values.length;
            minValuesIndex = i;
        }
    }

    // Если minCountValues = 1 заполняем судоку
    // и переходим на следующую итерацию
    if (minCountValues === 1) {
        // Смотрим все пустые клетки и заполняем судоку
        for (let i = 0; i < zeroCells.length; i++) {
            let cell = zeroCells[i];
            // Если в клетке возможно только одно значение,
            if (cell.values.length === 1) {
                let foundValue = cell.values[0];
                let row = cell.rowIndex;
                let col = cell.colIndex;

                // Заполняем им судоку
                sudoku[row][col] = foundValue;
            }
        }
        return solveSudoku(sudoku);
    }
    // В противном случае перебираем варианты возможных значений
    else {
        let cell = zeroCells[minValuesIndex];
        let possibleValues = cell.values;
        let row = cell.rowIndex;
        let col = cell.colIndex;
        for (let i = 0; i < possibleValues.length; i++) {
            sudoku[row][col] = possibleValues[i];
            let solvedSudoku = solveSudoku(sudoku);
            if (solvedSudoku) {
                return solvedSudoku;
            }
        }
    }
};
