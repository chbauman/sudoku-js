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
var col1 = "#B00";
var col2 = "#0A85FF";
var veryLightH = "#EEE";
var smallDigCol = "#DFD";
var rowColSquareForbidCol = "#FDD";
var sameDigCol = "#FBB";
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
                let col = (hyp) ? col2 : col1;
                let h = hyp;
                digits[i].style.color = col;
                digits[i].style.borderColor = col;                
                if (!choosingHyp || v == 0) {
                    $("#digits").on("click", "#digit-" + String(i), function (e) {
                        if (large || v == 0) {
                            T[y][x] = v;
                            Tref[y][x].style.color = col;
                        }
                        setCell(y, x, v, large, true);
                        if (h) hyps.push(Tref[y][x]);
                        //e.stopPropagation();
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
                        Tref[y][x].style.color = "#AAF";
                        Tref[y][x].setAttribute("clickable", 0);
                        setCell(y, x, v, large, true);
                        finishedHypChoosing();
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
    var lastHyp = hyps[-1];
    var y = lastHyp[0][0], x = lastHyp[0][1];
    T = lastHyp[1];

}

//function hypothesis1() {
//    if(!hyp) {
//        document.getElementById("but1").style.color="#B8B8B8";
//        document.getElementById("but2").style.color="#000";
//        document.getElementById("but3").style.color="#000";
//        hyp = true;
//    }
//}
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
//function hypothesis3() {
//    var i;
//    console.log(hyps);
//    for(i=0;i<hyps.length;i++) {
//        hyps[i].innerHTML = "";
//        var y = Number(hyps[i].getAttribute("y"));
//        var x = Number(hyps[i].getAttribute("x"));
//        T[y][x] = 0;
//    }
//    hyps = []
//    hyp = false;
//    document.getElementById("but1").style.color="#000";
//    document.getElementById("but2").style.color="#B8B8B8";
//    document.getElementById("but3").style.color="#B8B8B8";
////}
function restart() {
    unhighlightAll();
    var i,j;
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            //if (Tref[i][j].getAttribute("clickable") == 1) {
            if (Tinit[i][j] == 0) {
                Tref[i][j].setAttribute("clickable", 1);
                T[i][j] = 0;
                Tref[i][j].style.backgroundColor = "";
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
