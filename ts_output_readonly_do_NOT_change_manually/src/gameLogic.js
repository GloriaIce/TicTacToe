var Point = (function () {
    function Point() {
        this.toString = function () {
            return '(x: ${this.x}, y:${this.y})';
        };
    }
    return Point;
}());
var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 14; //14
    gameLogic.COLS = 14; //14
    gameLogic.OPERATIONS = 8;
    gameLogic.SHAPEHEIGHT = 5;
    gameLogic.SHAPEWIDTH = 5;
    gameLogic.SHAPENUMBER = 21;
    gameLogic.GROUPNUMBER = 2; /// 4
    gameLogic.STARTANCHOR4 = [0, gameLogic.COLS - 1, gameLogic.ROWS * (gameLogic.COLS - 1), gameLogic.ROWS * gameLogic.COLS - 1];
    gameLogic.STARTANCHOR = [0, gameLogic.ROWS * gameLogic.COLS - 1]; // [0, 14 * 14];
    gameLogic.SHAPEMAX = 168;
    /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
    function getInitialBoard() {
        var board = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i][j] = '';
            }
        }
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function getInitShapeStatus() {
        var status = [];
        for (var j = 0; j < gameLogic.GROUPNUMBER; j++) {
            status[j] = [];
            for (var i = 0; i < gameLogic.SHAPENUMBER; i++) {
                status[j][i] = true;
            }
        }
        return status;
    }
    gameLogic.getInitShapeStatus = getInitShapeStatus;
    function getInitPrevAnchor() {
        var ret = [];
        for (var p = 0; p < gameLogic.GROUPNUMBER; p++) {
            ret[p] = [];
            for (var i = 0; i < gameLogic.ROWS * gameLogic.COLS; i++) {
                ret[p][i] = true;
            }
        }
        return ret;
    }
    gameLogic.getInitPrevAnchor = getInitPrevAnchor;
    function getInitPlayerStatus() {
        return [true, true, true, true];
    }
    gameLogic.getInitPlayerStatus = getInitPlayerStatus;
    function getInitShapes() {
        var shapes = [];
        // init all shapes 
        shapes = [{
                id: 0, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0],
                pt: 4,
            },
            {
                id: 1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0],
                pt: 1,
            },
            {
                id: 2, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3, 4, 5, 6, 7],
                pt: 4,
            },
            {
                id: 3, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3],
                pt: 2,
            },
            {
                id: 4, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '1', '1', '1', '1'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3],
                pt: 3,
            },
            {
                id: 5, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3],
                pt: 3,
            },
            {
                id: 6, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '1', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3, 4, 5, 6, 7],
                pt: 4,
            },
            {
                id: 7, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3],
                pt: 3,
            },
            {
                id: 8, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3, 4, 5, 6, 7],
                pt: 4,
            },
            {
                id: 9, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '1', '0', '0', '0'],
                    ['0', '1', '1', '1', '1'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3, 4, 5, 6, 7],
                pt: 5,
            },
            {
                id: 10, row: -1, column: -1,
                frame: [['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3],
                pt: 5,
            },
            {
                id: 11, row: -1, column: -1,
                frame: [['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '1', '1'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3],
                pt: 5,
            },
            {
                id: 12, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '1'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3, 4, 5, 6, 7],
                pt: 5,
            },
            {
                id: 13, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '1', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '1', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3, 4, 5, 6, 7],
                pt: 5,
            },
            {
                id: 14, row: -1, column: -1,
                frame: [['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0']],
                ops: [0, 1, 2, 3],
                pt: 5,
            },
            {
                id: 15, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3, 4, 5, 6, 7],
                pt: 5,
            },
            {
                id: 16, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '1', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3, 4, 5, 6, 7],
                pt: 5,
            },
            {
                id: 17, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3, 4, 5, 6, 7],
                pt: 5,
            },
            {
                id: 18, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3, 4, 5, 6, 7],
                pt: 5,
            },
            {
                id: 19, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0],
                pt: 5,
            },
            {
                id: 20, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '1', '1', '1', '1'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']],
                ops: [0, 1, 2, 3, 4, 5, 6, 7],
                pt: 5,
            }
        ];
        return shapes;
    }
    gameLogic.getInitShapes = getInitShapes;
    function aux_printArray(frame) {
        var ret = "";
        for (var i = 0; i < frame.length; i++) {
            ret += frame[i].toString() + "\n\r";
        }
        return ret;
    }
    gameLogic.aux_printArray = aux_printArray;
    function aux_print1dArray(frame, col) {
        var ret = "   0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9\n\r  ----------------------------------------";
        for (var i = 0; i < frame.length; i++) {
            if (i % col === 0) {
                ret += "\n\r" + (Math.floor(i / col) % 10) + "|";
            }
            ret += frame[i].toString() + ",";
        }
        ret += "  ----------------------------------------\n\r";
        return ret;
    }
    gameLogic.aux_print1dArray = aux_print1dArray;
    function aux_printFrame(frame, height) {
        var ret = "   0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9\n\r  ----------------------------------------\n\r";
        for (var i = 0; i < height; i++) {
            var tmp = angular.copy(frame[i]);
            if (tmp === null || tmp === undefined) {
                continue;
            }
            for (var j = 0; j < tmp.length; j++) {
                if (tmp[j] == '') {
                    tmp[j] = ' ';
                }
            }
            if (i >= 10) {
                ret += "" + i + "|" + tmp.toString() + "|\n\r";
            }
            else {
                ret += " " + i + "|" + tmp.toString() + "|\n\r";
            }
        }
        ret += "  ----------------------------------------\n\r";
        return ret;
    }
    gameLogic.aux_printFrame = aux_printFrame;
    function aux_printCoordinator(numbers) {
        var ret = "";
        for (var i = 0; i < numbers.length; i++) {
            ret += "(" + parseIJ(numbers[i]).toString() + ")";
            ret += ", ";
        }
        return ret;
    }
    gameLogic.aux_printCoordinator = aux_printCoordinator;
    function getShapeByTypeAndOperation(shapeType, operationType) {
        var allShapes = getInitShapes();
        //log.log("shapeType:", shapeType);
        var shape = allShapes[shapeType];
        var rotation = operationType % 4;
        // only vertical flip. Horizontal flip <=> vertical flip + 180 rotation.
        var flip = Math.floor(operationType / 4);
        var retShape = angular.copy(shape);
        //log.log("shapeId=", shapeType);
        //log.log("rotation=", rotation);
        //log.log("flip=", flip);
        //log.log("origin shape")
        //console.log(aux_printFrame(shape.frame, SHAPEHEIGHT));
        // vertical flip
        if (flip == 1) {
            for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
                for (var j = 0; j < gameLogic.SHAPEWIDTH / 2; j++) {
                    var tmp = retShape.frame[i][j];
                    retShape.frame[i][j] = retShape.frame[i][gameLogic.SHAPEWIDTH - j - 1];
                    retShape.frame[i][gameLogic.SHAPEWIDTH - j - 1] = tmp;
                }
            }
        }
        //log.log("After flipping Allshape:")
        //console.log(aux_printFrame(retShape.frame, SHAPEHEIGHT));
        // rotation
        var rotateAny = function (retShape, rotation) {
            var rotate90 = function (input) {
                var tmpFrame = angular.copy(input);
                for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
                    for (var j = 0; j < gameLogic.SHAPEWIDTH; j++) {
                        tmpFrame[i][j] = input[gameLogic.SHAPEHEIGHT - j - 1][i];
                    }
                }
                return tmpFrame;
            };
            var ret = angular.copy(retShape.frame);
            //console.log("Before rotation:");
            //console.log(aux_printFrame(ret, SHAPEHEIGHT));
            for (var i = 0; i < rotation; i++) {
                //console.log("Roate=", i);
                ret = rotate90(ret);
                //console.log("After rotation:");
                //console.log(aux_printFrame(ret, SHAPEHEIGHT));
            }
            return ret;
        };
        retShape.frame = rotateAny(retShape, rotation);
        //log.log("After rotation Allshape:")
        //console.log(aux_printFrame(retShape.frame, SHAPEHEIGHT));
        return retShape;
    }
    gameLogic.getShapeByTypeAndOperation = getShapeByTypeAndOperation;
    function getShapeType(shapeId) {
        return Math.floor(shapeId / gameLogic.OPERATIONS);
    }
    gameLogic.getShapeType = getShapeType;
    function getShapeOpType(shapeId) {
        return shapeId % gameLogic.OPERATIONS;
    }
    gameLogic.getShapeOpType = getShapeOpType;
    function getShapeId(originShapeId, rotation, flip) {
        return originShapeId * gameLogic.OPERATIONS + rotation + (flip ? 4 : 0);
    }
    gameLogic.getShapeId = getShapeId;
    function getShapeFromShapeID(shapeId) {
        var operationType = getShapeOpType(shapeId);
        var shapeType = getShapeType(shapeId);
        return getShapeByTypeAndOperation(shapeType, operationType);
    }
    gameLogic.getShapeFromShapeID = getShapeFromShapeID;
    function getInitialState() {
        return {
            board: getInitialBoard(),
            delta: null,
            shapeStatus: getInitShapeStatus(),
            playerStatus: getInitPlayerStatus(),
            anchorStatus: getInitPrevAnchor(),
        };
    }
    gameLogic.getInitialState = getInitialState;
    function getAllMargin(shape) {
        // top, left, bottom, right
        var ret = [0, 0, 0, 0];
        // sum of all the columns
        var colSum = [0, 0, 0, 0, 0];
        // sum of all the rows
        var rowSum = [0, 0, 0, 0, 0];
        for (var i = 0; i < gameLogic.SHAPEWIDTH; i++) {
            for (var j = 0; j < gameLogic.SHAPEHEIGHT; j++) {
                if (shape.frame[i][j] == '1') {
                    rowSum[i] += 1;
                    colSum[j] += 1;
                }
            }
        }
        //console.log("colSum=", colSum.toString());
        //console.log("rowSum=", rowSum.toString());
        var marginVal = 1;
        // top, left margin
        for (var i = 1; i >= 0; i--) {
            if (colSum[i] > 0) {
                ret[1] = marginVal;
            }
            if (rowSum[i] > 0) {
                ret[0] = marginVal;
            }
            marginVal++;
        }
        // right, bottom margin
        marginVal = 1;
        for (var i = 3; i < gameLogic.SHAPEWIDTH; i++) {
            if (colSum[i] > 0) {
                ret[3] = marginVal;
            }
            if (rowSum[i] > 0) {
                ret[2] = marginVal;
            }
            marginVal++;
        }
        return ret;
    }
    gameLogic.getAllMargin = getAllMargin;
    function adjustPositionByShapeId(row, col, shapeId) {
        if (shapeId === undefined || shapeId === -1) {
            return [row, col];
        }
        var shape = getShapeFromShapeID(shapeId);
        return adjustPosition(row, col, shape);
    }
    gameLogic.adjustPositionByShapeId = adjustPositionByShapeId;
    function adjustPosition(row, col, shape) {
        var ret = [row, col];
        var margins = getAllMargin(shape);
        // check valid with board, center and margin
        var up = row;
        var left = col;
        var bottom = gameLogic.ROWS - 1 - row;
        var right = gameLogic.COLS - 1 - col;
        if (up < margins[0]) {
            ret[0] += (margins[0] - up);
        }
        if (left < margins[1]) {
            ret[1] += (margins[1] - left);
        }
        if (bottom < margins[2]) {
            ret[0] -= (margins[2] - bottom);
        }
        if (right < margins[3]) {
            ret[1] -= (margins[3] - right);
        }
        return ret;
    }
    function checkValidShapePlacement(row, col, shape) {
        var ret = true;
        var margins = getAllMargin(shape);
        // TODO check valid with board, center and margin
        var up = row;
        var left = col;
        var bottom = gameLogic.ROWS - 1 - row;
        var right = gameLogic.COLS - 1 - col;
        return up >= margins[0] && left >= margins[1] && bottom >= margins[2] && right >= margins[3];
    }
    gameLogic.checkValidShapePlacement = checkValidShapePlacement;
    function getBoardActionFromShapeID(row, col, shapeId) {
        var shape = getShapeFromShapeID(shapeId);
        return getBoardAction(row, col, shape, gameLogic.ROWS, gameLogic.COLS);
    }
    gameLogic.getBoardActionFromShapeID = getBoardActionFromShapeID;
    function getShapeActionFromShapeID(row, col, shapeId, SHAPEROW, SHAPECOL) {
        var shape = getShapeFromShapeID(shapeId);
        return getBoardAction(row, col, shape, SHAPEROW, SHAPECOL);
    }
    gameLogic.getShapeActionFromShapeID = getShapeActionFromShapeID;
    function getBoardAction(row, col, shape, BOARDROWS, BOARDCOLS) {
        var board = [];
        // fill the shape matrix into the board;
        for (var i = 0; i < BOARDROWS; i++) {
            board[i] = [];
            for (var j = 0; j < BOARDCOLS; j++) {
                board[i][j] = '';
            }
        }
        var margins = getAllMargin(shape);
        for (var i = -margins[0]; i <= margins[2]; i++) {
            for (var j = -margins[1]; j <= margins[3]; j++) {
                var val = shape.frame[Math.floor(gameLogic.SHAPEHEIGHT / 2) + i][Math.floor(gameLogic.SHAPEWIDTH / 2) + j];
                if (val == '1' && row + i >= 0 && row + i < BOARDROWS && col + j >= 0 && col + j < BOARDCOLS) {
                    board[row + i][col + j] = val;
                }
            }
        }
        return board;
    }
    gameLogic.getBoardAction = getBoardAction;
    function isTie(board, playerStatus) {
        var over = true;
        var winner = '';
        for (var i = 0; i < gameLogic.GROUPNUMBER; i++) {
            if (playerStatus[i] === true) {
                over = false;
                continue;
            }
        }
        if (over) {
            return true;
        }
        else {
            return false;
        }
    }
    function getScore(board) {
        var score = [];
        for (var i = 0; i < gameLogic.GROUPNUMBER; i++) {
            score[i] = 0;
        }
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (board[i][j] !== '') {
                    var idx = +board[i][j];
                    score[idx]++;
                }
            }
        }
        return score;
    }
    gameLogic.getScore = getScore;
    function getWinner(board, playerStatus) {
        var over = true;
        var winner = '';
        for (var i = 0; i < gameLogic.GROUPNUMBER; i++) {
            if (playerStatus[i] === true) {
                over = false;
                continue;
            }
        }
        if (over) {
            var scores = getScore(board);
            var maxval = 0;
            var maxIdx = -1;
            for (var i = 0; i < gameLogic.GROUPNUMBER; i++) {
                if (maxval < scores[i]) {
                    maxval = scores[i];
                    maxIdx = -1;
                }
            }
            if (maxIdx >= 0) {
                winner = maxIdx + '';
            }
        }
        return winner;
    }
    function getRecomandAnchor(board, turnIndexBeforeMove) {
        if (noPreviousMove(board, turnIndexBeforeMove)) {
            return [gameLogic.STARTANCHOR[turnIndexBeforeMove]];
        }
        var boundary = [];
        var diri = [-1, 0, 1, 0];
        var dirj = [0, 1, 0, -1];
        var dirj8 = [-1, 0, 1, 0, -1, -1, 1, 1];
        var diri8 = [0, 1, 0, -1, 1, -1, -1, 1];
        // get all boundary around turnIndexBeforeMove's teritory
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (("" + turnIndexBeforeMove) !== board[i][j]) {
                    continue;
                }
                for (var k = 0; k < dirj8.length; k++) {
                    var ni = i + diri8[k];
                    var nj = j + dirj8[k];
                    if (nj >= 0 && nj < gameLogic.COLS && ni >= 0 && ni < gameLogic.ROWS && board[ni][nj] == '') {
                        var hashcode = ni * gameLogic.COLS + nj;
                        if (boundary.indexOf(hashcode) == -1) {
                            boundary.push(hashcode);
                        }
                    }
                }
            }
        }
        //console.log("boundary for ", turnIndexBeforeMove, ":");
        //console.log(aux_printCoordinator(boundary));
        var ret = [];
        for (var k = 0; k < boundary.length; k++) {
            var j = boundary[k] % gameLogic.COLS;
            var i = Math.floor(boundary[k] / gameLogic.COLS);
            // check adjecent, if adjecent to any blocks, then unavailble
            var skip = false;
            for (var t = 0; t < diri.length; t++) {
                var nj = j + diri[t];
                var ni = i + dirj[t];
                if (nj >= 0 && nj < gameLogic.COLS && ni >= 0 && ni < gameLogic.ROWS && board[ni][nj] == ('' + turnIndexBeforeMove)) {
                    skip = true;
                    break;
                }
            }
            if (skip) {
                continue;
            }
            ret.push(i * gameLogic.COLS + j);
        }
        return ret;
    }
    gameLogic.getRecomandAnchor = getRecomandAnchor;
    function noPreviousMove(board, turnIndexBeforeMove) {
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (board[i][j] == '' + turnIndexBeforeMove) {
                    return false;
                }
            }
        }
        return true;
    }
    gameLogic.noPreviousMove = noPreviousMove;
    function parseIJ(hashcode) {
        var j = hashcode % gameLogic.COLS;
        var i = Math.floor(hashcode / gameLogic.COLS);
        return [i, j];
    }
    gameLogic.parseIJ = parseIJ;
    function checkSquareOverlap(board, boardAction) {
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (boardAction[i][j] == '') {
                    continue;
                }
                // check conflict
                if (boardAction[i][j] == '1' && board[i][j] != '') {
                    return false;
                }
            }
        }
        return true;
    }
    gameLogic.checkSquareOverlap = checkSquareOverlap;
    function checkSquareAdj(board, boardAction, turnIndexBeforeMove) {
        var diri = [0, -1, 0, 1];
        var dirj = [-1, 0, 1, 0];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (boardAction[i][j] == '') {
                    continue;
                }
                // adjecent
                for (var k = 0; k < dirj.length; k++) {
                    var ni = i + diri[k];
                    var nj = j + dirj[k];
                    if (nj >= 0 && nj < gameLogic.COLS && ni >= 0 && ni < gameLogic.ROWS
                        && boardAction[ni][nj] != '1'
                        && board[ni][nj] == ('' + turnIndexBeforeMove)) {
                        //console.log("points at (", i, ",", j, ") adjacent with:(", ni, ",", nj, ")");
                        return false;
                    }
                }
            }
        }
        return true;
    }
    gameLogic.checkSquareAdj = checkSquareAdj;
    function getBoardAnchor(board, anchorStatus, turnIndexBeforeMove) {
        var boardAnchor = [];
        // fill the shape matrix into the board;
        for (var i = 0; i < gameLogic.ROWS; i++) {
            boardAnchor[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                boardAnchor[i][j] = '';
            }
        }
        var possibleAnchors = gameLogic.getPossibleAnchor(board, turnIndexBeforeMove);
        //aux_printCoordinator(possibleAnchors);
        for (var i = 0; i < possibleAnchors.length; i++) {
            if (anchorStatus[turnIndexBeforeMove][possibleAnchors[i]]) {
                var coord = gameLogic.parseIJ(possibleAnchors[i]);
                boardAnchor[coord[0]][coord[1]] = '1';
            }
        }
        //console.log(aux_printFrame(boardAnchor, COLS));
        return boardAnchor;
    }
    gameLogic.getBoardAnchor = getBoardAnchor;
    function getPossibleAnchor(board, turnIndexBeforeMove) {
        var possibleAnchor = [];
        // 0. if not territory, anchor is init state
        if (noPreviousMove(board, turnIndexBeforeMove)) {
            //console.log("no previous move");
            possibleAnchor.push(gameLogic.STARTANCHOR[turnIndexBeforeMove]);
        }
        else {
            possibleAnchor = getRecomandAnchor(board, turnIndexBeforeMove);
        }
        //console.log(turnIndexBeforeMove);
        //console.log(possibleAnchor);
        return possibleAnchor;
    }
    gameLogic.getPossibleAnchor = getPossibleAnchor;
    function checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove) {
        // 0. if not territory, anchor is init state
        var possibleAnchor = getPossibleAnchor(board, turnIndexBeforeMove);
        //console.log("possible Anchors for ", turnIndexBeforeMove, " :");
        //console.log(aux_printCoordinator(possibleAnchor));
        // 1.has at least one anchor
        var foundAnchor = false;
        for (var k = 0; k < possibleAnchor.length; k++) {
            var i = Math.floor(possibleAnchor[k] / gameLogic.COLS);
            var j = possibleAnchor[k] % gameLogic.COLS;
            if (boardAction[i][j] == '1') {
                foundAnchor = true;
                break;
            }
        }
        if (!foundAnchor) {
            return false;
        }
        // not conflict with existing teritory and not adjacent to teritory
        if (!checkSquareOverlap(board, boardAction) ||
            !checkSquareAdj(board, boardAction, turnIndexBeforeMove)) {
            return false;
        }
        return true;
    }
    gameLogic.checkLegalMove = checkLegalMove;
    function shapePlacement(boardAfterMove, boardAction, turnIndexBeforeMove) {
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (boardAction[i][j] == '1') {
                    boardAfterMove[i][j] = '' + turnIndexBeforeMove;
                }
            }
        }
    }
    gameLogic.shapePlacement = shapePlacement;
    function updateShapeStatus(shapeStatus, shapeId, turnIndexBeforeMove) {
        var ret = angular.copy(shapeStatus);
        ret[turnIndexBeforeMove][getShapeType(shapeId)] = false;
        return ret;
    }
    gameLogic.updateShapeStatus = updateShapeStatus;
    function updatePlayerStatus(playerStatus, turnIndexBeforeMove, nextstep) {
        var ret = angular.copy(playerStatus);
        if (nextstep.valid === false) {
            ret[turnIndexBeforeMove] = false;
        }
        return ret;
    }
    gameLogic.updatePlayerStatus = updatePlayerStatus;
    function getErrorMsg(error) {
        var errMsg = "";
        var errMsgs = ["Invalid Shapes. ", "Piece out of board. ", "Place piece to touch your corner and never touch your side. ", "Pieces overlap. "];
        for (var i = 0; i < 4; i++) {
            var e = error >> i;
            if ((e & 0x1) == 1) {
                errMsg += errMsgs[i];
            }
        }
        return errMsg;
    }
    gameLogic.getErrorMsg = getErrorMsg;
    function checkLegalMoveForGame(board, row, col, turnIndexBeforeMove, shapeId, checkStrong) {
        //console.log("[checkLegalMoveForGame]col:", col, " row", row, " SI:", shapeId);
        if (shapeId === undefined || shapeId < 0 || shapeId >= gameLogic.SHAPEMAX) {
            return false;
        }
        var shape = getShapeFromShapeID(shapeId);
        if (!checkValidShapePlacement(row, col, shape)) {
            return false;
        }
        var boardAction = getBoardAction(row, col, shape, gameLogic.ROWS, gameLogic.COLS);
        if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
            if (checkStrong) {
                return false;
            }
        }
        // add checkStrong here to make overlap possible, add check in the confirm phase
        if (!checkSquareOverlap(board, boardAction)) {
            if (checkStrong) {
                return false;
            }
        }
        return true;
    }
    gameLogic.checkLegalMoveForGame = checkLegalMoveForGame;
    /**
     *
     * @param board
     * @param row
     * @param col
     * @param turnIndexBeforeMove
     * @param shapeId
     * @param checkStrong
     *
     * @return error: 8 (overlap) 4 (illegal) 2 (out of board) 1 (invalid shape)
     */
    function checkLegalMoveForGameWitError(board, row, col, turnIndexBeforeMove, shapeId, checkStrong) {
        //console.log("[checkLegalMoveForGame]col:", col, " row", row, " SI:", shapeId);
        var error = 0;
        if (shapeId === undefined || shapeId < 0 || shapeId >= gameLogic.SHAPEMAX) {
            error += 1;
            return { valid: false, error: error };
        }
        var shape = getShapeFromShapeID(shapeId);
        if (!checkValidShapePlacement(row, col, shape)) {
            error += 2;
            return { valid: false, error: error };
        }
        var boardAction = getBoardAction(row, col, shape, gameLogic.ROWS, gameLogic.COLS);
        if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
            error += 4;
            if (checkStrong) {
                return { valid: false, error: error };
            }
        }
        // add checkStrong here to make overlap possible, add check in the confirm phase
        if (!checkSquareOverlap(board, boardAction)) {
            error += 8;
            if (checkStrong) {
                return { valid: false, error: error };
            }
        }
        return { valid: true, error: error };
    }
    gameLogic.checkLegalMoveForGameWitError = checkLegalMoveForGameWitError;
    /** return true if all the players die */
    function endOfMatch(playerStatus) {
        for (var i = 0; i < playerStatus.length; i++) {
            if (playerStatus[i]) {
                return false;
            }
        }
        return true;
    }
    gameLogic.endOfMatch = endOfMatch;
    function mapShapeToPos(frow, fcol, board, shape, frameX, frameY, turnIndexBeforeMove) {
        var CTR = Math.floor(gameLogic.SHAPEWIDTH / 2);
        var row = frow - frameX + CTR;
        var col = fcol - frameY + CTR;
        if (!checkValidShapePlacement(row, col, shape)) {
            return { board: [], valid: false, row: -1, col: -1 };
        }
        var boardAction = getBoardAction(row, col, shape, gameLogic.ROWS, gameLogic.COLS);
        if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
            return { board: [], valid: false, row: -1, col: -1 };
        }
        return { board: boardAction, valid: true, row: row, col: col };
    }
    function getAllCorners(shape) {
        var corners = [];
        var dirx = [-1, 0, 1, 0];
        var diry = [0, -1, 0, 1];
        for (var i = 0; i < gameLogic.SHAPEWIDTH; i++) {
            for (var j = 0; j < gameLogic.SHAPEHEIGHT; j++) {
                var empty = [0, 0, 0, 0];
                if (shape.frame[i][j] === '1') {
                    for (var t = 0; t < 4; t++) {
                        var nx = dirx[t] + i;
                        var ny = diry[t] + j;
                        if (nx < 0 || nx > gameLogic.SHAPEWIDTH - 1 || ny < 0 || ny > gameLogic.SHAPEHEIGHT - 1 || shape.frame[nx][ny] === '0') {
                            empty[t] = 1;
                        }
                    }
                }
                for (var t = 0; t < 4; t++) {
                    if (empty[t] === 1 && empty[(t + 1) % 4] === 1) {
                        corners.push([i, j]);
                    }
                }
            }
        }
        return corners;
    }
    function getNextPossibleMoveList(prevAnchor, board, shapeStatus, turnIndexBeforeMove) {
        var retList = [];
        var anchors = getRecomandAnchor(board, turnIndexBeforeMove);
        var freeShapeIds = [];
        var allshape = getInitShapes();
        var invalidAnchors = [];
        for (var i = 0; i < gameLogic.SHAPENUMBER; i++) {
            if (shapeStatus[turnIndexBeforeMove][i] === true) {
                freeShapeIds.push(i);
            }
        }
        var hasMove = false;
        for (var t = 0; t < anchors.length; t++) {
            var anchor = anchors[t];
            /*
            if (prevAnchor !== undefined && prevAnchor[turnIndexBeforeMove][anchor] === false) {
              continue;
            }
            */
            var row = parseIJ(anchor)[0];
            var col = parseIJ(anchor)[1];
            for (var id = 0; id < freeShapeIds.length; id++) {
                var shapeId = freeShapeIds[id];
                var stdShape = allshape[shapeId];
                for (var _i = 0, _a = stdShape.ops; _i < _a.length; _i++) {
                    var op = _a[_i];
                    var shape = getShapeByTypeAndOperation(freeShapeIds[id], op);
                    var realShapeId = shapeId * gameLogic.OPERATIONS + op;
                    var corners = getAllCorners(shape);
                    for (var c = 0; c < corners.length; c++) {
                        var frameX = corners[c][0];
                        var frameY = corners[c][1];
                        var action = mapShapeToPos(row, col, board, shape, frameX, frameY, turnIndexBeforeMove);
                        if (action.valid) {
                            hasMove = true;
                            retList.push({ row: action.row, col: action.col, shapeId: realShapeId, pt: shape.pt });
                        }
                    }
                }
            }
            // add it to invalid anchor, and purning these anchors for latter search
            /*
            if (prevAnchor !== undefined) {
              prevAnchor[turnIndexBeforeMove][row * COLS + col] = false;
            }
            invalidAnchors.push(row * COLS + col);
            */
        }
        var unique = {};
        var distinct = [];
        for (var _b = 0, retList_1 = retList; _b < retList_1.length; _b++) {
            var move = retList_1[_b];
            var moveId = move.shapeId * gameLogic.ROWS * gameLogic.COLS + move.row * gameLogic.ROWS + move.col;
            if (unique[moveId] === undefined || unique[moveId] === 0) {
                distinct.push(move);
            }
            unique[moveId] = 1;
        }
        return { invalidAnchors: invalidAnchors, valid: hasMove, moves: distinct };
    }
    gameLogic.getNextPossibleMoveList = getNextPossibleMoveList;
    function sortMoves(moves) {
        return moves.sort(function (a, b) { return b.pt - a.pt; });
    }
    gameLogic.sortMoves = sortMoves;
    /**
     * find a possible next move for this turn user
     * @param board
     * @param shapeStatus
     * @param turnIndexBeforeMove
     * @return board:Board,valid:boolean, the board in return is an boardAction only contains the shape
     */
    function getNextPossibleShape(prevAnchor, board, shapeStatus, turnIndexBeforeMove) {
        var retBoard = [];
        var anchors = getRecomandAnchor(board, turnIndexBeforeMove);
        var freeShapeIds = [];
        var allshape = getInitShapes();
        var invalidAnchors = [];
        for (var i = 0; i < gameLogic.SHAPENUMBER; i++) {
            if (shapeStatus[turnIndexBeforeMove][i] === true) {
                freeShapeIds.push(i);
            }
        }
        var hasMove = false;
        for (var t = 0; t < anchors.length; t++) {
            var anchor = anchors[t];
            if (prevAnchor !== undefined && prevAnchor[turnIndexBeforeMove][anchor] === false) {
                continue;
            }
            var row = parseIJ(anchor)[0];
            var col = parseIJ(anchor)[1];
            for (var id = 0; id < freeShapeIds.length; id++) {
                var shapeId = freeShapeIds[id];
                var stdShape = allshape[shapeId];
                for (var _i = 0, _a = stdShape.ops; _i < _a.length; _i++) {
                    var op = _a[_i];
                    var shape = getShapeByTypeAndOperation(freeShapeIds[id], op);
                    var realShapeId = shapeId * gameLogic.OPERATIONS + op;
                    var corners = getAllCorners(shape);
                    for (var c = 0; c < corners.length; c++) {
                        var frameX = corners[c][0];
                        var frameY = corners[c][1];
                        var action = mapShapeToPos(row, col, board, shape, frameX, frameY, turnIndexBeforeMove);
                        if (action.valid) {
                            return { invalidAnchors: invalidAnchors, board: angular.copy(action.board), valid: action.valid, shapeId: realShapeId, row: action.row, col: action.col };
                        }
                    }
                }
            }
            // add it to invalid anchor, and purning these anchors for latter search
            if (prevAnchor !== undefined) {
                prevAnchor[turnIndexBeforeMove][row * gameLogic.COLS + col] = false;
            }
            invalidAnchors.push(row * gameLogic.COLS + col);
        }
        return { invalidAnchors: invalidAnchors, board: retBoard, valid: false, shapeId: -1, row: -1, col: -1 };
    }
    gameLogic.getNextPossibleShape = getNextPossibleShape;
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col with shapeId.
     * row and col is the center point of the shape.
     * shapdId is a mix of different shape and the rotation of the shape, starts from 1, 0 is a initial
     */
    function createMove(stateBeforeMove, row, col, shapeId, turnIndexBeforeMove) {
        console.log("player ", turnIndexBeforeMove, "'s turn");
        if (shapeId < 0) {
            throw new Error("Wrong shapeid");
        }
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        var shapeStatus = stateBeforeMove.shapeStatus;
        if (!shapeStatus[turnIndexBeforeMove][getShapeType(shapeId)]) {
            throw new Error("Shape already been used");
        }
        var shape = getShapeFromShapeID(shapeId);
        // if the shape placement is not on the board
        // use in game.ts
        if (!checkValidShapePlacement(row, col, shape)) {
            throw new Error("Shape not on the board");
        }
        var boardAction = getBoardAction(row, col, shape, gameLogic.ROWS, gameLogic.COLS);
        //console.log("boardAction:")
        //console.log(aux_printFrame(boardAction, COLS))
        var board = stateBeforeMove.board;
        var playerStatus = stateBeforeMove.playerStatus;
        if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
            throw new Error("One can only make a move in an empty position!");
        }
        if (getWinner(board, playerStatus) !== '' || isTie(board, playerStatus)) {
            throw new Error("Can only make a move if the game is not over!");
        }
        var boardAfterMove = angular.copy(board);
        shapePlacement(boardAfterMove, boardAction, turnIndexBeforeMove);
        var shapeStatusAfterMove = angular.copy(shapeStatus);
        shapeStatusAfterMove[turnIndexBeforeMove][getShapeType(shapeId)] = false;
        /*
        console.log("boardAfterMove:")
        console.log(aux_printFrame(boardAfterMove, COLS))
        console.log(aux_printArray(shapeStatusAfterMove));
        */
        var anchorStatus = stateBeforeMove.anchorStatus;
        //TODO implement the last check
        var nextstep = getNextPossibleShape(anchorStatus, boardAfterMove, shapeStatusAfterMove, turnIndexBeforeMove);
        var anchorStatusAfterMove = angular.copy(anchorStatus);
        for (var _i = 0, _a = nextstep.invalidAnchors; _i < _a.length; _i++) {
            var anchorPos = _a[_i];
            anchorStatusAfterMove[turnIndexBeforeMove][anchorPos] = false;
        }
        console.log(boardAfterMove);
        console.log("possibleMove");
        if (nextstep.valid) {
            console.log("Has Moves move for ", turnIndexBeforeMove);
        }
        else {
            console.log("No More Move moves for ", turnIndexBeforeMove);
        }
        console.log("board");
        console.log(nextstep.board);
        //console.log("anchor status");
        //console.log(anchorStatusAfterMove);
        console.log(aux_printFrame(nextstep.board, gameLogic.ROWS));
        //console.log("anchorStatus");
        //console.log(aux_print1dArray(anchorStatusAfterMove[turnIndexBeforeMove], COLS));
        var playerStatusAfterMove = updatePlayerStatus(playerStatus, turnIndexBeforeMove, nextstep);
        var winner = getWinner(boardAfterMove, playerStatusAfterMove);
        var endMatchScores;
        var turnIndex;
        if (winner !== '' || isTie(boardAfterMove, playerStatusAfterMove)) {
            // Game over.
            turnIndex = -1;
            // The score is measured by the blocks unused.
            endMatchScores = getScore(boardAfterMove);
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            // Ready for changing to four player
            turnIndex = getNextTurn(turnIndexBeforeMove, playerStatusAfterMove);
            //turnIndex = (turnIndexBeforeMove + 1) % GROUPNUMBER;
            if (turnIndex == -1) {
                endMatchScores = getScore(boardAfterMove);
            }
            else {
                endMatchScores = null;
            }
        }
        // Here delta should be all the blocks covered by the new move
        var delta = { row: row, col: col, shapeId: shapeId };
        var state = {
            delta: delta,
            board: boardAfterMove,
            shapeStatus: shapeStatusAfterMove,
            playerStatus: playerStatusAfterMove,
            anchorStatus: anchorStatusAfterMove,
        };
        return { endMatchScores: endMatchScores, turnIndex: turnIndex, state: state };
    }
    gameLogic.createMove = createMove;
    function createInitialMove() {
        return {
            endMatchScores: null, turnIndex: 0,
            state: getInitialState()
        };
    }
    gameLogic.createInitialMove = createInitialMove;
    function getNextTurn(turnIndexBeforeMove, playerStatus) {
        var turnIdx = -1;
        for (var i = 0; i < gameLogic.GROUPNUMBER; i++) {
            var t = (turnIndexBeforeMove + i + 1) % gameLogic.GROUPNUMBER;
            if (playerStatus[t] == true) {
                return t;
            }
        }
        return turnIdx;
    }
    function transformMarginsToAbosolute(margins) {
        var ret = [];
        var CTR = Math.floor(gameLogic.SHAPEWIDTH / 2);
        ret[0] = CTR - margins[0];
        ret[1] = CTR - margins[1];
        ret[2] = CTR + margins[2];
        ret[3] = CTR + margins[3];
        return ret;
    }
    function getNextShapeFrom(shapeBoard, ColIdx) {
        var oH = shapeBoard.board.length;
        var oW = oH > 0 ? shapeBoard.board[0].length : 0;
        var start = -1;
        var i = ColIdx;
        for (; i < oW; i++) {
            var isBlank = true;
            for (var j = 0; j < oH; j++) {
                if (shapeBoard.board[j][i] === "1") {
                    isBlank = false;
                    break;
                }
            }
            if (!isBlank && start === -1) {
                start = i;
                continue;
            }
            if (isBlank && start > 0 && (i - 1 > start)) {
                return { start: start, end: i - 1 };
            }
        }
        return { start: start, end: i };
    }
    gameLogic.getNextShapeFrom = getNextShapeFrom;
    function getShapeMarkMatrix() {
        return [
            [0, 0, 0, 15, 0, 0, 0, 7, 13, 0, 0, 0, 7, 9, 0, 0, 0, 7, 5, 13, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [3, 9, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 3, 13],
            [6, 12, 0, 0, 7, 4, 13, 0, 0, 7, 5, 5, 13, 0, 0, 7, 5, 12, 0, 0, 7, 12, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 11],
            [11, 0, 0, 0, 0, 0, 10, 0, 0, 10, 0, 0, 0, 0, 3, 5, 13, 0, 3, 5, 12, 0, 10],
            [6, 5, 5, 13, 0, 7, 4, 13, 0, 6, 5, 13, 0, 7, 12, 0, 0, 0, 14, 0, 0, 0, 10],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],
            [11, 0, 0, 0, 3, 13, 0, 3, 13, 0, 0, 0, 3, 13, 0, 0, 11, 0, 0, 0, 0, 0, 14],
            [2, 9, 0, 3, 12, 0, 0, 10, 0, 0, 0, 7, 8, 0, 0, 7, 0, 13, 0, 0, 11, 0, 0],
            [6, 12, 0, 14, 0, 0, 0, 6, 13, 0, 0, 0, 14, 0, 0, 0, 14, 0, 0, 7, 4, 5, 13]
        ];
    }
    gameLogic.getShapeMarkMatrix = getShapeMarkMatrix;
    // get ShapeBoard information
    function getAllShapeMatrix_hardcode() {
        var shapeBoard = { board: [], cellToShape: [], shapeToCell: [] };
        shapeBoard = {
            board: [
                ['0', '0', '0', '1', '0', '0', '0', '1', '1', '0', '0', '0', '1', '1', '0', '0', '0', '1', '1', '1', '0', '0', '0'],
                ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                ['1', '1', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '1', '1'],
                ['1', '1', '0', '0', '1', '1', '1', '0', '0', '1', '1', '1', '1', '0', '0', '1', '1', '1', '0', '0', '1', '1', '0'],
                ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                ['0', '0', '0', '0', '0', '0', '1', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '1'],
                ['1', '0', '0', '0', '0', '0', '1', '0', '0', '1', '0', '0', '0', '0', '1', '1', '1', '0', '1', '1', '1', '0', '1'],
                ['1', '1', '1', '1', '0', '1', '1', '1', '0', '1', '1', '1', '0', '1', '1', '0', '0', '0', '1', '0', '0', '0', '1'],
                ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1'],
                ['1', '0', '0', '0', '1', '1', '0', '1', '1', '0', '0', '0', '1', '1', '0', '0', '1', '0', '0', '0', '0', '0', '1'],
                ['1', '1', '0', '1', '1', '0', '0', '1', '0', '0', '0', '1', '1', '0', '0', '1', '1', '1', '0', '0', '1', '0', '0'],
                ['1', '1', '0', '1', '0', '0', '0', '1', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '1', '1', '1', '1']
            ],
            shapeToCell: [
                [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 0 }, { x: 3, y: 1 }],
                [{ x: 0, y: 3 }],
                [{ x: 2, y: 5 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }],
                [{ x: 0, y: 7 }, { x: 0, y: 8 }],
                [{ x: 3, y: 9 }, { x: 3, y: 10 }, { x: 3, y: 11 }, { x: 3, y: 12 }],
                [{ x: 0, y: 12 }, { x: 0, y: 13 }, { x: 1, y: 13 }],
                [{ x: 2, y: 17 }, { x: 3, y: 15 }, { x: 3, y: 16 }, { x: 3, y: 17 }],
                [{ x: 0, y: 17 }, { x: 0, y: 18 }, { x: 0, y: 19 }],
                [{ x: 2, y: 21 }, { x: 2, y: 22 }, { x: 3, y: 20 }, { x: 3, y: 21 }],
                [{ x: 6, y: 0 }, { x: 7, y: 0 }, { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }],
                [{ x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 }],
                [{ x: 5, y: 9 }, { x: 6, y: 9 }, { x: 7, y: 9 }, { x: 7, y: 10 }, { x: 7, y: 11 }],
                [{ x: 6, y: 14 }, { x: 6, y: 15 }, { x: 6, y: 16 }, { x: 7, y: 13 }, { x: 7, y: 14 }],
                [{ x: 5, y: 20 }, { x: 6, y: 18 }, { x: 6, y: 19 }, { x: 6, y: 20 }, { x: 7, y: 18 }],
                [{ x: 5, y: 22 }, { x: 6, y: 22 }, { x: 7, y: 22 }, { x: 8, y: 22 }, { x: 9, y: 22 }],
                [{ x: 9, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 1 }, { x: 11, y: 0 }, { x: 11, y: 1 }],
                [{ x: 9, y: 4 }, { x: 9, y: 5 }, { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 11, y: 3 }],
                [{ x: 9, y: 7 }, { x: 9, y: 8 }, { x: 10, y: 7 }, { x: 11, y: 7 }, { x: 11, y: 8 }],
                [{ x: 9, y: 12 }, { x: 9, y: 13 }, { x: 10, y: 11 }, { x: 10, y: 12 }, { x: 11, y: 12 }],
                [{ x: 9, y: 16 }, { x: 10, y: 15 }, { x: 10, y: 16 }, { x: 10, y: 17 }, { x: 11, y: 16 }],
                [{ x: 10, y: 20 }, { x: 11, y: 19 }, { x: 11, y: 20 }, { x: 11, y: 21 }, { x: 11, y: 22 }] // 20
            ],
            cellToShape: [
                [-1, -1, -1, 1, -1, -1, -1, 3, 3, -1, -1, -1, 5, 5, -1, -1, -1, 7, 7, 7, -1, -1, -1],
                [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1],
                [0, 0, -1, -1, -1, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6, -1, -1, -1, 8, 8],
                [0, 0, -1, -1, 2, 2, 2, -1, -1, 4, 4, 4, 4, -1, -1, 6, 6, 6, -1, -1, 8, 8, -1],
                [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
                [-1, -1, -1, -1, -1, -1, 10, -1, -1, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 13, -1, 14],
                [9, -1, -1, -1, -1, -1, 10, -1, -1, 11, -1, -1, -1, -1, 12, 12, 12, -1, 13, 13, 13, -1, 14],
                [9, 9, 9, 9, -1, 10, 10, 10, -1, 11, 11, 11, -1, 12, 12, -1, -1, -1, 13, -1, -1, -1, 14],
                [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 14],
                [15, -1, -1, -1, 16, 16, -1, 17, 17, -1, -1, -1, 18, 18, -1, -1, 19, -1, -1, -1, -1, -1, 14],
                [15, 15, -1, 16, 16, -1, -1, 17, -1, -1, -1, 18, 18, -1, -1, 19, 19, 19, -1, -1, 20, -1, -1],
                [15, 15, -1, 16, -1, -1, -1, 17, 17, -1, -1, -1, 18, -1, -1, -1, 19, -1, -1, 20, 20, 20, 20]
            ]
        };
        return shapeBoard;
    }
    gameLogic.getAllShapeMatrix_hardcode = getAllShapeMatrix_hardcode;
    //TODO
    function getAllShapeMatrix_withWidth(width) {
        var shapeBoard = { board: [], cellToShape: [], shapeToCell: [] };
        shapeBoard.board = [];
        for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
            shapeBoard.board[i] = [];
            shapeBoard.cellToShape[i] = [];
        }
        var originSB = getAllShapeMatrix();
        var oH = originSB.board.length;
        var oW = oH > 0 ? originSB.board[0].length : 0;
        var idx = 0;
        var shapeId = 0;
        var row = 0;
        var col = 0;
        while (idx < oW) {
            var shapeIdx = getNextShapeFrom(originSB, 0);
            ////console.log("get ", shapeIdx.start, "-", shapeIdx.end);
            var len = shapeIdx.end - shapeIdx.start + 1;
            if (col + len >= width) {
                col = 0;
                row += gameLogic.SHAPEHEIGHT;
                for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
                    shapeBoard.board[row + i] = [];
                    shapeBoard.cellToShape[row + i] = [];
                }
            }
            for (var j = shapeIdx.start; j <= shapeIdx.end; j++) {
                for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
                    shapeBoard.board[row + i][col] = originSB.board[i][j];
                    shapeBoard.cellToShape[row + i][col] = originSB.cellToShape[i][j];
                }
                col++;
            }
            if (col < width) {
                for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
                    shapeBoard.board[row + i][col] = '';
                    shapeBoard.cellToShape[row + i][col] = -1;
                }
                col++;
            }
            idx = shapeIdx.end + 1;
        }
        return shapeBoard;
    }
    gameLogic.getAllShapeMatrix_withWidth = getAllShapeMatrix_withWidth;
    function getAllShapeMatrix() {
        var shapeBoard = { board: [], cellToShape: [], shapeToCell: [] };
        shapeBoard.board = [];
        var allshape = getInitShapes();
        var height = gameLogic.SHAPEHEIGHT;
        for (var i = 0; i < height; i++) {
            shapeBoard.board[i] = [];
            shapeBoard.cellToShape[i] = [];
        }
        var begin = 0;
        for (var k = 0; k < gameLogic.SHAPEHEIGHT; k++) {
            shapeBoard.board[k][begin] = '0';
            shapeBoard.cellToShape[k][begin] = -1;
        }
        begin++;
        for (var i = 0; i < allshape.length; i++) {
            var shape = allshape[i];
            var margins = getAllMargin(shape);
            var index = transformMarginsToAbosolute(margins);
            //console.log(aux_printArray(shape.frame))
            //console.log(index)
            shapeBoard.shapeToCell[i] = [];
            for (var j = index[1]; j <= index[3]; j++) {
                for (var k = 0; k < gameLogic.SHAPEHEIGHT; k++) {
                    shapeBoard.board[k][begin] = shape.frame[k][j];
                    if (shape.frame[k][j] === '1') {
                        var pos = { x: k, y: begin };
                        shapeBoard.shapeToCell[i].push(pos);
                        shapeBoard.cellToShape[k][begin] = shape.id;
                    }
                    else {
                        shapeBoard.cellToShape[k][begin] = -1;
                    }
                }
                begin++;
            }
            for (var k = 0; k < gameLogic.SHAPEHEIGHT; k++) {
                shapeBoard.board[k][begin] = '0';
                shapeBoard.cellToShape[k][begin] = -1;
            }
            begin++;
        }
        return shapeBoard;
    }
    gameLogic.getAllShapeMatrix = getAllShapeMatrix;
    function forSimpleTestHtml() {
        /*
        var move = gameLogic.createMove(null, 0, 0, 0, 0);
        log.log("move=", move);
        */
        var shapeId = 40;
        log.log("Test input=", shapeId);
        log.log("Expeced Type=", 0);
        log.log("Expeced rotate=", 1);
        log.log("Expeced flip=", 1);
        var shape = getShapeFromShapeID(shapeId);
        log.log("frame:", shape);
        log.log("final shape:");
        //console.log(aux_printFrame(shape.frame, SHAPEHEIGHT));
        var margins = getAllMargin(shape);
        log.log("margin=", margins);
        log.log(checkValidShapePlacement(0, 0, shape));
        log.log(checkValidShapePlacement(0, 1, shape));
        log.log(checkValidShapePlacement(1, 0, shape));
        log.log(checkValidShapePlacement(0, 1, shape));
        var boardAction = getBoardAction(2, 2, shape, gameLogic.ROWS, gameLogic.COLS);
        //console.log(aux_printFrame(boardAction, COLS))
    }
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
    function forSimplePlayTestHtml() {
        var board = getInitialBoard();
        var turnIndexBeforeMove = 0;
        shapePlacement(board, getBoardAction(2, 1, getShapeFromShapeID(40), gameLogic.ROWS, gameLogic.COLS), 1);
        var actionRow = [0, 4, 2, 1, 4];
        var actionCol = [1, 3, 3, 2, 5];
        var actionShapeId = [40, 40, 40, 0, 40];
        for (var i = 0; i < actionShapeId.length; i++) {
            var row = actionRow[i];
            var col = actionCol[i];
            var shapeId = actionShapeId[i];
            var shape = getShapeFromShapeID(shapeId);
            if (!checkValidShapePlacement(row, col, shape)) {
                console.log("Shape not on the board");
            }
            var boardAction = getBoardAction(row, col, shape, gameLogic.ROWS, gameLogic.COLS);
            console.log("turnindex:", turnIndexBeforeMove);
            console.log("boardAction turn:", turnIndexBeforeMove, "row:", row, ", col:", col, "shape:", shapeId);
            console.log(aux_printFrame(boardAction, gameLogic.COLS));
            if (checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
                shapePlacement(board, boardAction, turnIndexBeforeMove);
                turnIndexBeforeMove = 1 - turnIndexBeforeMove;
                console.log("Board:");
                console.log(aux_printFrame(board, gameLogic.COLS));
            }
            else {
                console.log("Fail to add shape on the board. Board:");
                console.log(aux_printFrame(board, gameLogic.COLS));
            }
        }
        var shapeBoard = getAllShapeMatrix_hardcode();
        console.log(aux_printArray(shapeBoard.board));
        console.log(shapeBoard.board.length, ",", shapeBoard.board[0].length);
        //let shapeBoardWWidth = getAllShapeMatrix_withWidth(20);
        //console.log(aux_printArray(shapeBoardWWidth.board));
        //console.log(shapeBoardWWidth.board.length, ",", shapeBoardWWidth.board[0].length);
        var aux_printcell = function (frame) {
            var ret = "";
            for (var i = 0; i < frame.length; i++) {
                for (var j = 0; j < frame[i].length; j++) {
                    if (frame[i][j] == undefined) {
                        frame[i][j] = " ";
                    }
                }
            }
            for (var i = 0; i < frame.length; i++) {
                ret += frame[i].toString() + "\n\r";
            }
            return ret;
        };
        console.log(aux_printcell(shapeBoard.cellToShape));
        var aux_printshape = function (frame) {
            var ret = "";
            for (var i = 0; i < frame.length; i++) {
                ret += i.toString() + ": ";
                for (var j = 0; j < frame[i].length; j++) {
                    ret += "(" + frame[i][j].x + "," + frame[i][j].y + ") ";
                }
                ret += "\n\r";
            }
            return ret;
        };
        console.log(aux_printshape(shapeBoard.shapeToCell));
    }
    gameLogic.forSimplePlayTestHtml = forSimplePlayTestHtml;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map