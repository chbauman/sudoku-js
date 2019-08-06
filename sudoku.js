var T = Array.from(new Array(9), () => new Array(9).fill(0));
var Tref = Array.from(new Array(9), () => new Array(9));
var Tsol = Array.from(new Array(9), () => new Array(9).fill(0));
var Tinit = Array.from(new Array(9), () => new Array(9));
var digits = new Array(10);


var hyps = [];
var choosingHyp = false;
//var coeff = [ 0, 1, 9, 81, 729, 6561, 59049, 531441, 4782969];

var TsubHTMLTables = Array.from(new Array(9), () => new Array(9));
var TsubBinaryTables = Array.from(new Array(9), () => new Array(9));
var TminiCells = Array.from(new Array(9), () => new Array(9));

var DEBUG = true;

// Input State Variables
var upBut, downBut;
var large = true;

var curX = -1;
var curY = 0;

// Some Colors
var col1 = "#0A85FF";
var veryLightH = "#EEE";
var smallDigCol = "#DFD";
var rowColSquareForbidCol = "#FDD";
var sameDigCol = "#FBB";
var hypCol = "#1aa3b8";
var lightH = "#FDD";
var normH = "#BBB";

// Appends the string: log as a new line to the log for debugging.
function log(str) {
    document.getElementById("log-txt").innerHTML += str + "<br />"
}

function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

function randomOrderCells() {
    var i,j;
    var arr = []
    for (i=0;i<9;i++) {
        for (j=0;j<9;j++) {
            arr.push([i,j]);
        }
    }
    return shuffle(arr);
}

// Change digit input mode
function toggleLargeSmall() {
    but2 = large ? upBut : downBut;
    but1 = !large ? upBut : downBut;
    but1.style.color = col1;
    but1.style.borderColor = col1;
    but2.style.color = "black";
    but2.style.borderColor = "black";
    large = !large;
}
function enlarge() {
    if (!large) {
        toggleLargeSmall();
        log("enlarged");
    }
}
function shrink() {
    if (large) {
        toggleLargeSmall();
        log("shrunken");
    }
}

// Removes digit in mini cell
function resetMiniCell(y, x, n) {
    TminiCells[y][x][n - 1].innerHTML = "";
    TsubBinaryTables[y][x][n - 1] = false;
}
// Puts digit in mini cell
function setMiniCell(y, x, n) {
    TminiCells[y][x][n - 1].innerHTML = n.toString();
    TsubBinaryTables[y][x][n - 1] = true;
}
// Add small digit if not yet present, else remove it
function toggleMiniCell(y, x, n) {
    var alreadySet = TsubBinaryTables[y][x][n - 1];
    if (alreadySet) {
        TminiCells[y][x][n - 1].innerHTML = "";
    } else {
        TminiCells[y][x][n - 1].innerHTML = n.toString();
    }
    TsubBinaryTables[y][x][n - 1] = !alreadySet;   
}

// Removes small digits that become inadmissible after setting
// (y, x) to n.
function eliminateSmallDigs(y, x, n){
    var i;
    var xFloor = x - x % 3;
    var yFloor = y - y % 3;
    for (i = 0; i < 9; i++) {
        // Rows and Cols
        resetMiniCell(y, i, n);
        resetMiniCell(i, x, n);
        // Square
        resetMiniCell(yFloor + i % 3, xFloor + parseInt(i / 3), n);
    }
}

// Set cell (y, x) with value n (0 for empty cell)
function setCell(y, x, n, largeMode = true, highlightCells = false) {
    var i;
    if (n == 0) {        
        // Remove all if only small digits present
        Tref[y][x].innerHTML = "";
        Tref[y][x].appendChild(TsubHTMLTables[y][x]);
        for (i = 0; i < 9; i++) {
            resetMiniCell(y, x, i + 1);
        }
    }
    else {
        if (largeMode) {
            Tref[y][x].innerHTML = n.toString();
            eliminateSmallDigs(y, x, n);
            if (highlightCells) highlight(y, x);
        } else {            
            toggleMiniCell(y, x, n);      
        }        
    }
}

// Sets layout according to T
function updateGrid() {
    var i,j;
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            setCell(i,j,T[i][j], true, false);
            Tref[i][j].style.color='';
            Tref[i][j].style.backgroundColor='';
        }
    }
}

// 2D and 3D array deep copy functions
function deepCopy2D(arr) {
    var arrLen = arr.length;
    var newArr = new Array(arrLen);
    var i;
    for (i = 0; i < arrLen; i++) {
        newArr[i] = arr[i].slice();            
    }
    return newArr;
}
function deepCopy3D(arr) {
    var arrLen = arr.length;
    var newArr = new Array(arrLen);
    var i;
    for (i = 0; i < arrLen; i++) {
        newArr[i] = deepCopy2D(arr[i]);
    }
    return newArr;
}

// Initializing function
function init() {

    solveSudoku(testHard);
    var i, j, k;
    var tbl = document.getElementById("grid");
    for (i = 0; i < 9; i++) {
        var r = tbl.insertRow(-1);
        r.className = "gridRow";
        for (j = 0; j < 9; j++) {
            Tref[i][j] = r.insertCell(-1);
            Tref[i][j].className = "gridCell";
            if (i%3 == 0) Tref[i][j].className += " topBorder";
            if (i%3 == 2) Tref[i][j].className += " bottomBorder";
            if (j%3 == 0) Tref[i][j].className += " leftBorder";
            if (j%3 == 2) Tref[i][j].className += " rightBorder";
            var y = document.createAttribute("y");
            var x = document.createAttribute("x");
            var click = document.createAttribute("clickable");
            click.value = 0;
            y.value = i;
            x.value = j;
            Tref[i][j].setAttributeNode(y);
            Tref[i][j].setAttributeNode(x);
            Tref[i][j].setAttributeNode(click);

            TminiCells[i][j] = new Array(9);
            var subTab = document.createElement("table");
            subTab.className = "innerTable";
            var currRow;
            var currCell;
            for (k = 0; k < 9; k++) {
                if (k % 3 == 0) {
                    currRow = subTab.insertRow(-1);
                    currRow.className = "gridRow";
                }
                currCell = currRow.insertCell(-1);
                currCell.innerHTML = "";
                currCell.className = "subGridCell"
                TminiCells[i][j][k] = currCell;
            }
            Tref[i][j].appendChild(subTab);

            TsubHTMLTables[i][j] = subTab;
            TsubBinaryTables[i][j] = new Array(9).fill(false);
        }
    }
    // click on cells
    $("#grid").on("click", ".gridCell", function(e) {
        clickCell(this);
        e.stopPropagation();
    });

    // digits
    for(i=0;i<10;i++)
        digits[i] = document.getElementById("digit-" + String(i));

    // Buttons
    i = $('#digits').height();
    j = $('#buttons1').height();
    j = Math.floor( (i-j)/2 ) + 4;
    $('#buttons1').height( i-j );
    $('#buttons1').css("margin-top", String(j)+"px");
    document.getElementById("digits").style.display = "none";
    document.getElementById("but1").style.color="#000";
    document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color = "#B8B8B8";

    setTimeout(function () { getRandomGrid(96); }, 250);

    document.getElementById("digits").style.display = "inline-block";
    document.getElementById("buttons1").style.display = "none";

    // Remove log if not debugging
    if (DEBUG == false) {
        log("Not debugging!");
        var element = document.getElementById("show-log-button");
        element.parentNode.removeChild(element);
    }

    // Assign buttons
    upBut = document.getElementById("up-but");
    downBut = document.getElementById("down-but");
    upBut.style.color = col1;
    upBut.style.borderColor = col1;

    // Save initial sudoku
     
}

function allowed(A, y, x) {
    var i;
    var res = [];
    var arr = new Array(10).fill(true); 
    if (A[y][x] > 0) return res;
    for(i=0;i<9;i++) arr[A[y][i]] = false;
    for(i=0;i<9;i++) arr[A[i][x]] = false;
    for(i=0;i<9;i++)
        arr[ A[ y-(y%3) + Math.floor(i/3)][x-(x%3) + (i%3) ] ] = false;
    for(i=1;i<10;i++)
        if (arr[i]) res.push(i);
    return res;
}

function bestHypothesis(A) {
    var i,j,s;
    var bSc = 10;
    var bCoords = [9,9];
    var bAll = [];
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            if (A[i][j] == 0) {
                s = allowed(A, i,j);
                n = s.length;
                if (n<bSc) {
                    bSc = n;
                    bCoords = [i,j];
                    bAll = s;
                }
            }
        }
    }
    return [ bAll, bCoords[0], bCoords[1] ];
}

function _findAcceptableGrid() {
    var i;
    var [all, y, x] = bestHypothesis(T);
    if (y==9) return true;
    if (all.length==0) return false; // invalid grid
    all = shuffle(all);
    for (i=0;i<all.length;i++) {
        T[y][x] = all[i];
        if(_findAcceptableGrid()) return true;
    }
}
function findAcceptableGrid() {
    var i,j;
    for(i=0;i<9;i++) { for(j=0;j<9;j++) T[i][j] = 0; }
    while(_findAcceptableGrid() != true) {
        for(i=0;i<9;i++) { for(j=0;j<9;j++) T[i][j] = 0; }
    }
    for(i=0;i<9;i++) { for(j=0;j<9;j++) Tsol[i][j] = T[i][j]; }
}

function _findValidityClass(A, n) {
    var i;
    var sol = -1;
    var [all, y, x] = bestHypothesis(A);
    if (y==9) return 1;
    if (all.length==0) return -1; // invalid grid
    // if (all.length > 1) n++; // make a new hypothesis
    for (i=0;i<all.length;i++) {
        A[y][x] = all[i];
        r = _findValidityClass(A, n);
        A[y][x] = 0;
        if (r >= 0) {
            if (sol >= 0) return -2; // at least two solutions exist
            // sol = r;
            sol = all.length * r;
        } else if (r==-2) return -2;
    }
    return sol;
}

function _getRandomGrid2(nlevel) {
    var i, j, v, y1, x1, y2, x2, s;
    var sc = -2;
    var zeros = [];
    var kept = [];
    for(i=0;i<9;i++) { for(j=0;j<9;j++) kept.push([i,j]); }
    findAcceptableGrid();
    for(i=0;i<nlevel;i++) {
        j = Math.floor(Math.random() * kept.length);
        y1 = kept[j][0]; x1 = kept[j][1];
        T[y1][x1] = 0;
        v = _findValidityClass(T, 0);
        if(v < 0) T[y1][x1] = Tsol[y1][x1];
        else {
            sc = v; zeros.push([y1,x1]);
            kept[j] = kept[kept.length-1]; kept.pop();
        }
        j = Math.floor(Math.random() * kept.length);
        y1 = kept[j][0]; x1 = kept[j][1];
        s = Math.floor(Math.random() * zeros.length);
        y2 = zeros[s][0]; x2 = zeros[s][1];
        T[y1][x1] = 0; T[y2][x2] = Tsol[y2][x2];
        v = _findValidityClass(T, 0);
        if(v < sc)
            {
                T[y1][x1] = Tsol[y1][x1];
                T[y2][x2] = 0;
            }
        else {
            sc = v;
            zeros[s] = [y1, x1];
            kept[j] = [y2, x2];
        }
    }

    // Copy it to Tinit
    Tinit = deepCopy2D(T);
    for (i = 0; i < 9; i++) {
        log("T = " + T[0][i].toString() + ", Tinit = " + Tinit[0][i].toString());
    }   
    return sc;
}

/*
function _getRandomGrid2(nlevel) {
    var i, j, k, v, y1, x1, y2, x2, x3, y3, s;
    var sc = -2;
    var zeros = [];
    var kept = [];
    for(i=0;i<9;i++) { for(j=0;j<9;j++) kept.push([i,j]); }
    findAcceptableGrid();
    for(i=0;i<nlevel;i++) {
        // first step
        j = Math.floor(Math.random() * kept.length);
        y1 = kept[j][0]; x1 = kept[j][1];
        T[y1][x1] = 0;
        v = _findValidityClass(T, 0);
        if(v < 0) T[y1][x1] = Tsol[y1][x1];
        else {
            sc = v; zeros.push([y1,x1]);
            kept[j] = kept[kept.length-1]; kept.pop();
        }
        // second step
        j = Math.floor(Math.random() * kept.length);
        k = Math.floor(Math.random() * (kept.length-1));
        if (j==k) k = kept.length-1;
        if (j<k) { s=j;j=k;k=s; }
        y1 = kept[j][0]; x1 = kept[j][1];
        y2 = kept[k][0]; x2 = kept[k][1];
        s = Math.floor(Math.random() * zeros.length);
        y3 = zeros[s][0]; x3 = zeros[s][1];
        T[y1][x1] = 0; T[y2][x2] = 0; T[y3][x3] = Tsol[y3][x3];
        v = _findValidityClass(T, 0);
        if(v < sc)
            {
                T[y1][x1] = Tsol[y1][x1];
                T[y2][x2] = Tsol[y2][x2];
                T[y3][x3] = 0;
            }
        else {
            sc = v;
            zeros[s] = [y1, x1]; zeros.push([y2,x2]);
            kept[j] = kept[kept.length-1]; kept.pop();
            kept[k] = [y3, x3];
        }
    }
    return sc;
}
*/

function setClickableTrefT() {    
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            if (T[i][j] == 0) Tref[i][j].setAttribute("clickable", 1);
            else {
                Tref[i][j].setAttribute("clickable", 0);
                Tref[i][j].style.color = '';
            }
        }
    }
}

function _getRandomGrid(nlevel) {
    console.log(_getRandomGrid2(nlevel));
    updateGrid();
    setClickableTrefT();
    // make clickable
    $( "#waiting" ).popup( "close" )
    //$.mobile.loading().hide();
    hyp = false;
    document.getElementById("but1").style.color="#000";
    document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color="#B8B8B8";
}
function getRandomGrid(nlevel) {
    $( "#waiting" ).popup( "open" )
    //$.mobile.loading().show();
    setTimeout(function() { _getRandomGrid(nlevel); }, 0);
}

function elsewhere() {
    if (curX >= 0) {
        //Tref[curY][curX].style.backgroundColor = "";
        //log("i = " + curY.toString() + ", j = " + curX.toString() + " set to \"\" in elsewhere()");
        curX = -1;
    }    
    log("elsewhere()")
    //document.getElementById("digits").style.display = "none";
    //document.getElementById("buttons1").style.display = "inline-block";
}

function fillSmallDigits() {
    var i, j, k;
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            if (T[i][j] == 0) {
                // Enable all digits that are admissible
                var a = allowed(T, i, j);
                for (k = 0; k < a.length; k++) {
                    setMiniCell(i, j, a[k]);
                }
            }
        }
    }
}

// Highlight the current cell and all same numbers in grid
function highlight(y, x) {
    log("highlighting")
    var currDig = T[y][x];
    var i, j;
    var xFloor = x - x % 3;
    var yFloor = y - y % 3;
    for (i = 0; i < 9; i++) { 
        Tref[y][i].style.backgroundColor = rowColSquareForbidCol;
        Tref[i][x].style.backgroundColor = rowColSquareForbidCol;
        Tref[yFloor + i % 3][xFloor + parseInt(i / 3)].style.backgroundColor = rowColSquareForbidCol;
        for (j = 0; j < 9; j++) {
            if (T[i][j] == currDig) {
                Tref[i][j].style.backgroundColor = sameDigCol;    
            }
            if (T[i][j] == 0 && TsubBinaryTables[i][j][currDig - 1]) {
                Tref[i][j].style.backgroundColor = smallDigCol;  
            }
        }
    }
    Tref[y][x].style.backgroundColor = normH;   
}

function unhighlightAll() {
    var i, j;
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            Tref[i][j].style.backgroundColor = "";
        }
    }
}

function clickCell(cell) {
    unhighlightAll();
    var c = Number(cell.getAttribute("clickable"));
    var y = Number(cell.getAttribute("y"));
    var x = Number(cell.getAttribute("x"));
    if (T[y][x] > 0) {
        highlight(y, x);
    }    
    if (c == 1) {
        if (false && curX >= 0) {
            Tref[curY][curX].style.backgroundColor = "";
            log("i = " + curY.toString() + ", j = " + curX.toString() + " set to \"\" in clickCell()");
        }
        $("#digits").off("click", "**");
        curY = y;
        curX = x;
        cell.style.backgroundColor = "#BBB";
        log("i = " + curY.toString() + ", j = " + curX.toString() + " set to #BBB in clickCell()");
        log("chH in clickCell: " + choosingHyp.toString());

        // Enable all digits that are admissible
        var a = allowed(T, y, x);
        var d = new Array(10).fill(false);
        for (i = 0; i < a.length; i++) d[a[i]] = true;
        d[0] = true;
        for (i = 0; i < 10; i++) {
            if (d[i]) {
                let v = i;
                digits[i].style.color = col1;
                digits[i].style.borderColor = col1;                
                if (!choosingHyp || v == 0) {
                    $("#digits").on("click", "#digit-" + String(i), function (e) {
                        if (large || v == 0) {
                            T[y][x] = v;
                            Tref[y][x].style.color = col1;
                        }
                        setCell(y, x, v, large, true);
                    });
                } else {
                    $("#digits").on("click", "#digit-" + String(i), function (e) {
                        // Save current version
                        var hypTuple = [[y, x], T, TsubBinaryTables];
                        T = deepCopy2D(T);
                        TsubBinaryTables = deepCopy3D(TsubBinaryTables);
                        hyps.push(hypTuple);
                        setClickableTrefT();
                        T[y][x] = v;
                        Tref[y][x].style.color = hypCol;
                        Tref[y][x].setAttribute("clickable", 0);
                        setCell(y, x, v, large, true);
                        finishedHypChoosing();
                        enableHypRejection();
                        log("Saved current.");
                    });
                }
                
            } else {
                digits[i].style.color = "#B8B8B8";
                digits[i].style.borderColor = "#B8B8B8";
                digits[i].style.cursor = "pointer";
            }
        }
    } else {
        $("#digits").off("click", "**");
        for (i = 0; i < 10; i++) {
            digits[i].style.color = "#B8B8B8";
            digits[i].style.borderColor = "#B8B8B8";
            digits[i].style.cursor = "pointer";
        }
        elsewhere();
    }
}

// Enable shrink mode 
function finishedHypChoosing() {
    if (choosingHyp == false) return;
    var down_but = document.getElementById("down-but");
    var hyp_but = document.getElementById("but1");
    down_but.onclick = shrink;
    down_but.style.color = "";
    down_but.style.borderColor = "";
    hyp_but.style.color = "";
    choosingHyp = false;
    //log("chH after finishedHypChoosing: " + choosingHyp.toString());
}

// Enable / disable the hypothesis rejection button
function enableHypRejection() {
    var rejBut = document.getElementById("but3");
    rejBut.style.color = "#000";
    rejBut.onclick = hypothesis3;
}
function disableHypRejection() {
    var rejBut = document.getElementById("but3");
    rejBut.style.color = "#B8B8B8";
    rejBut.onclick = null;
}

// Start choosing hypothesis digit
function hypothesis1() {
    if (!choosingHyp) {
        // Choose hypothesis digit
        enlarge();
        var down_but = document.getElementById("down-but");
        var hyp_but = document.getElementById("but1");
        hyp_but.style.color = "#F00";
        down_but.onclick = null;
        down_but.style.color = "#B8B8B8";
        down_but.style.borderColor = "#B8B8B8";
        down_but.style.cursor = "pointer";
        choosingHyp = true;
        if (curX >= 0) {
            clickCell(Tref[curY][curX]);
        }        
    } else {
        // Cancel choosing a hypothesis digit
        finishedHypChoosing();
    }
    log("chH after hypothesis1: " + choosingHyp.toString());
}
function hypothesis3() {
    var nHyps = hyps.length;
    var lastHyp = hyps[nHyps - 1];
    
    // Set fixed digits
    if (nHyps < 2) {
        T = Tinit;
        updateGrid();
        setClickableTrefT();
    } else {
        T = hyps[nHyps - 2][1];
        updateGrid();
        setClickableTrefT();
        // TODO: Prev. Hyp
        var y = hyps[nHyps - 2][0][0], x = hyps[nHyps - 2][0][1];
        Tref[y][x].style.color = "#AAF";
        Tref[y][x].setAttribute("clickable", 0);
    }
    // Current uncertain digits
    T = lastHyp[1];
    TsubBinaryTables = lastHyp[2];
    var i, j, k;
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            if (T[i][j] > 0) {
                setCell(i, j, T[i][j], true, false);
                if (Tref[i][j].getAttribute("clickable") == 1) {
                    Tref[i][j].style.color = col1;
                }
            } else {
                for (k = 0; k < 9; k++) {
                    if (TsubBinaryTables[i][j][k]) {
                        setMiniCell(i, j, k + 1);
                    }
                }
            }
        }
    }
    // Remove rejected hypothesis
    hyps.pop();
    if (nHyps == 1) {
        disableHypRejection();
    }
}

function hypothesis2() {
    var i;
    console.log(hyps);
    for(i=0;i<hyps.length;i++) hyps[i].style.color = col1;
    hyps = []
    hyp = false;
    document.getElementById("but1").style.color="#000";
    document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color="#B8B8B8";
}

function restart() {
    unhighlightAll();
    var i,j;
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            if (Tinit[i][j] == 0) {
                Tref[i][j].setAttribute("clickable", 1);
                T[i][j] = 0;
                Tref[i][j].style.backgroundColor = "";
                Tref[i][j].style.color = "";
                setCell(i, j, 0);
            }
        }
    }
    hyp = false;
    document.getElementById("but1").style.color="#000";
    document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color="#B8B8B8";

}
function newRandomGrid(nlevel) {
    $( "#newGrid" ).popup( "close" );
    setTimeout(function() { getRandomGrid(nlevel); }, 250);
}

function solve() {
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            if (T[i][j]==0) {
                T[i][j] = Tsol[i][j];
                setCell(i,j, T[i][j]);
                Tref[i][j].style.color = "#B8B8B8";
            } else if (T[i][j] != Tsol[i][j]) {
                T[i][j] = Tsol[i][j];
                setCell(i,j, T[i][j]);
                Tref[i][j].style.color = "#B8B8B8";
                Tref[i][j].style.backgroundColor = "#FBB";
            }
        }
    }
    hyp = false;
    document.getElementById("but1").style.color="#000";
    document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color="#B8B8B8";
}
// Checks if any input digits are wrong and sets their background to
// red.
function check() {
    log("Checking Sudoku: ");
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            if ((T[i][j] != Tsol[i][j])&&(T[i][j] != 0)) {
                Tref[i][j].style.backgroundColor = "#FBB";
                log("i = " + i.toString() + ", j = " + j.toString() + " set to #FBB in check()");
            }
        }
    }
}



// The above sudoku generator sucks, so this is my own (work in progress)

function getSum(a, b) {
    return a + b;
}

// Test Sudoku
var testHard = [
    [8, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 3, 6, 0, 0, 0, 0, 0],
    [0, 7, 0, 0, 9, 0, 2, 0, 0],

    [0, 5, 0, 0, 0, 7, 0, 0, 0],
    [0, 0, 0, 0, 4, 5, 7, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 3, 0],

    [0, 0, 1, 0, 0, 0, 0, 6, 8],
    [0, 0, 8, 5, 0, 0, 0, 1, 0],
    [0, 9, 0, 0, 0, 0, 4, 0, 0]
];

var testEasy = [
    [0, 8, 0, 0, 3, 0, 0, 0, 2],
    [7, 0, 0, 0, 5, 0, 9, 0, 0],
    [0, 0, 9, 7, 6, 2, 0, 0, 8],

    [0, 0, 0, 6, 0, 0, 5, 8, 0],
    [0, 5, 0, 0, 0, 0, 0, 4, 0],
    [0, 7, 4, 0, 0, 3, 0, 0, 0],

    [3, 0, 0, 1, 4, 6, 7, 0, 0],
    [0, 0, 7, 0, 9, 0, 0, 0, 3],
    [1, 0, 0, 0, 7, 0, 0, 9, 0]
];
function logSudoku(sud) {
    var i, j, k, n;
    var lineStr = "";
    for (i = 0; i < 9; i++) {
        lineStr = "";
        for (j = 0; j < 9; j++) {
            lineStr += " " + sud[i][j];
        }
        log(lineStr);
    }
}
// Returns: 0: no change, 1: found new number, -1: invalid
function uniquePlaceInCol(sud, adm) {
    var i, j, k, n;
    var colOcc, colOccPos;
    var res = 0;
    // For each row/col/square i
    for (i = 0; i < 9; i++) {
        // For each number n
        for (n = 0; n < 9; n++) {
            colOcc = 0;
            colOccPos = 0;
            // For each cell in i      
            for (j = 0; j < 9; j++) {
                // Cols
                if (sud[i][j] == n + 1) {
                    // Number already set in this cell
                    colOcc = -1;
                    break;
                } else if (sud[i][j] == 0) {
                    // No number set in cell
                    if (colOcc < 0) log("fuuuck");
                    colOcc += adm[i][j][n];
                    if (adm[i][j][n] == 1) {
                        colOccPos = j;
                    }                    
                }
            }            
            if (colOcc == 0) {
                // Nowhere to put the number
                return -1;
            } else if (colOcc == 1) {
                // Found new number
                sud[i][colOccPos] = n + 1;
                res = 1;


                //log("n = " + (n + 1).toString());
                //log("colOccPos: " + colOccPos.toString());
                //log("Admis: ");
                //logSudoku(adm[i]);
                //log("Modif Sud");
                //logSudoku(sud);
                return res;                
            }
        }
    }
    return res;
}
function uniquePlaceInRow(sud, adm) {
    var i, j, k, n;
    var colOcc, colOccPos;
    var res = 0;
    // For each row/col/square i
    for (i = 0; i < 9; i++) {
        // For each number n
        for (n = 0; n < 9; n++) {
            colOcc = 0;
            colOccPos = 0;
            // For each cell in i      
            for (j = 0; j < 9; j++) {
                // Cols
                if (sud[j][i] == n + 1) {
                    colOcc = -1;
                    break;
                } else if (sud[j][i] == 0) {                    
                    colOcc += adm[j][i][n];
                    if (adm[j][i][n] == 1) {
                        colOccPos = j;
                    }
                }
            }
            if (colOcc == 0) {
                // Nowhere to put the number
                return -1;
            } else if (colOcc == 1) {
                // Found new number
                sud[colOccPos][i] = n + 1;
                res = 1;
            }
        }
    }
    return res;
}
function uniquePlaceInSquare(sud, adm) {
    var i, j, k, n;
    var ix, iy, jx, jy, i_n, j_n;
    var colOcc, pos1, pos2;
    var res = 0;
    // For each row/col/square i
    for (i = 0; i < 9; i++) {
        ix = i % 3;
        iy = Math.floor(i / 3);
        // For each number n
        for (n = 0; n < 9; n++) {
            colOcc = 0;
            colOccPos = 0;
            // For each cell in i      
            for (j = 0; j < 9; j++) {
                jx = j % 3;
                jy = Math.floor(j / 3);
                i_n = ix * 3 + jx;
                j_n = iy * 3 + jy;               
                // Cols
                if (sud[i_n][j_n] == n + 1) {
                    colOcc = -1;
                    break;
                } else if (sud[i_n][j_n] == 0) {
                    colOcc += adm[i_n][j_n][n];
                    if (adm[i_n][j_n][n] == 1) {
                        pos1 = i_n;
                        pos2 = j_n;
                    }
                }
            }
            if (colOcc == 0) {
                // Nowhere to put the number
                return -1;
            } else if (colOcc == 1) {
                // Found new number
                sud[pos1][pos2] = n + 1;
                res = 1;
            }
        }
    }
    return res;
}
// Returns: 0: no change, 1: found new number, -1: invalid
function uniqueNumberInCell(sud, adm) {
    var i, j, k, n;
    var numPoss;
    var res = 0;
    // For each cell (i, j)
    for (i = 0; i < 9; i++) {   
        for (j = 0; j < 9; j++) {
            // For each number n
            if (sud[i][j] == 0) {
                numPoss = adm[i][j].reduce(getSum, 0);
                //numPoss = Math.sum(...adm[i][j]);
                if (numPoss == 1) {
                    for (k = 0; k < 9; k++) {
                        if (adm[i][j][k] == 1) {
                            sud[i][j] = k + 1;
                            adm[i][j][k] = 0;
                        }
                    }
                    res = 1;
                } else if (numPoss == 0) {
                    return -1;
                }
            }            
        }
    }
    return res;
}
// Basically the autofill
function updateAdmissibility(sud, adm) {
    var i, j;
    var all, el;
    // For each row/col/square i
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            adm[i][j] = new Array(9).fill(0);
            all = allowed(sud, i, j);
            for (el of all) {
                adm[i][j][el - 1] = 1;
            }
        }
    }
}


function applySolvingStep(currRes, sud, adm, stepFun) {
    updateAdmissibility(sud, adm);
    if (currRes == -1) return -1;
    interRes = stepFun(sud, adm);
    if (interRes == -1) return -1;
    else return currRes + interRes;
}

// Use some easy techniques to find digits
function trySolving(sud, admisArray) {
    var res = 1;
    while (res > 0) {
        res = 0;
        res = applySolvingStep(res, sud, admisArray, uniqueNumberInCell);
        res = applySolvingStep(res, sud, admisArray, uniquePlaceInCol);
        res = applySolvingStep(res, sud, admisArray, uniquePlaceInRow);
        res = applySolvingStep(res, sud, admisArray, uniquePlaceInSquare);
        if (res == -1) break;
    }
    return res;
}

function solveSudokuWithRecursiveGuessing(sud, admisArray) {
    // Find cell with least possibilities
    updateAdmissibility(sud, admisArray);
    var minPoss = 9, currPoss;
    var i, j, x = -1, y = -1;
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            if (sud[i][j] == 0) {
                currPoss = admisArray[i][j].reduce(getSum, 0);
                if (currPoss < minPoss) {
                    minPoss = currPoss;
                    x = i;
                    y = j;
                }                
            }
        }
    }
    // Find all possible digits at that position    
    var admXY = admisArray[x][y];
    var admDigs = [];
    for (i = 0; i < 9; i++) {
        if (admXY[i] == 1) {
            admDigs.push(i);
        }
    }
    
    // Try solving using all possibilities
    var numSols = 0, res;
    var numAdmDigs = admDigs.length;
    var sudCopy, admCopy;
    for (i = 0; i < numAdmDigs; i++) {
        sudCopy = deepCopy2D(sud);
        admCopy = deepCopy3D(admisArray);
        sudCopy[x][y] = admDigs[i];
        res = trySolving(sudCopy, admCopy);
        log("SUDOKU");
        logSudoku(sudCopy);
        if (res == -1) continue;
        if (checkSolved(sudCopy)) {
            // Found valid solution
            numSols += 1;
        } else {
            // Recursion here
            log("RECURSIOOOOOOOONNNN");
            console.log("RECURSIOOOOOOOONNNN");
            numSols += solveSudokuWithRecursiveGuessing(sudCopy, admCopy, true);
        }
        if (numSols > 1) break;
    }
    sud = sudCopy;
    admisArray = admCopy;
    return numSols;
}

// Maybe not sufficient, checks if all digits are set
function checkSolved(sud) {
    var i, j;
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            if (sud[i][j] == 0) {
                return false;
            }
        }
    }
    return true;
}

function solveSudoku(sud) {
    var admisArray = Array.from(new Array(9), () => new Array(9));
    var i, j, k, n;
    // For each row/col/square i
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            admisArray[i][j] = new Array(9).fill(0);
        }
    }
    var res = 0;
    //res = solveSudokuWithRecursiveGuessing(sud, admisArray);
    log("Sud:");
    logSudoku(sud);
    log("res: " + res.toString());
}


