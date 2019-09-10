var T = Array.from(new Array(9), () => new Array(9).fill(0));
var Tref = Array.from(new Array(9), () => new Array(9));
var Tsol = Array.from(new Array(9), () => new Array(9).fill(0));
var Tinit = Array.from(new Array(9), () => new Array(9));
var digits = new Array(10);

// 0: Normal
// 1: Wrong (checked)
// 2: Current Hypothesis
// 3: Current Hypothesis Wrong (checked)
var Marked = Array.from(new Array(9), () => new Array(9).fill(0));
var sudLvl;

// Hypotheses
var hyps = [];
var choosingHyp = false;
//var coeff = [ 0, 1, 9, 81, 729, 6561, 59049, 531441, 4782969];

// Pencil marks
var TsubHTMLTables = Array.from(new Array(9), () => new Array(9));
var TsubBinaryTables = Array.from(new Array(9), () => new Array(9));
var TminiCells = Array.from(new Array(9), () => new Array(9));

var DEBUG = false;

var sol_available = false;
var inputtingOwnSud = false;

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
var hypCol = "#0C5";
var lightH = "#FDD";
var normH = "#BBB";
var wrongCol = "#F00";
var wrongHypCol = "#B00";

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
        if (Marked[y][x] > 0) {
            Marked[y][x] = 0;
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
function range(n) {
    let arr = new Array(n);
    for (i = 0; i < n; ++i) {
        arr[i] = i;
    }
    return arr;
}

// Shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function permuteSuds(s, s_sol, n = 5) {

    // Permute digits
    let num_per = range(9);
    shuffle(num_per);
    for (i = 0; i < 9; ++i) {
        for (k = 0; k < 9; ++k) {
            let val = s_sol[i][k];
            let val_new = num_per[val - 1] + 1;
            s_sol[i][k] = val_new;
            if (s[i][k] != 0) {
                s[i][k] = val_new
            }
        }
    }

    // Make copy
    let sol_copy;
    let s_copy;

    // New Permutation
    let per3 = range(3);
    
    let n_shuff;
    for (n_shuff = 0; n_shuff < n; ++n_shuff) {

        // Copy again
        sol_copy = deepCopy2D(s_sol);
        s_copy = deepCopy2D(s);

        // Permute rows
        for (k = 0; k < 3; ++k) {
            shuffle(per3);
            let offs = k * 3;
            for (i = 0; i < 3; ++i) {
                s_sol[offs + i] = sol_copy[offs + per3[i]].slice();
                s[offs + i] = s_copy[offs + per3[i]].slice();
            }
        }
        // Copy again
        sol_copy = deepCopy2D(s_sol);
        s_copy = deepCopy2D(s);

        // Permute cols
        for (k = 0; k < 3; ++k) {
            shuffle(per3);
            let offs = k * 3;
            for (i = 0; i < 3; ++i) {
                for (j = 0; j < 9; ++j) {
                    s_sol[j][offs + i] = sol_copy[j][offs + per3[i]];
                    s[j][offs + i] = s_copy[j][offs + per3[i]];
                }
            }
        }

        // Copy again
        sol_copy = deepCopy2D(s_sol);
        s_copy = deepCopy2D(s);

        // Permute rows of squares
        shuffle(per3);
        for (k = 0; k < 3; ++k) {
            let offs = per3[k] * 3;
            let offs_k = k * 3;
            for (i = 0; i < 3; ++i) {
                s_sol[offs_k + i] = sol_copy[offs + i].slice();
                s[offs_k + i] = s_copy[offs + i].slice();
            }
        }

        // Copy again
        sol_copy = deepCopy2D(s_sol);
        s_copy = deepCopy2D(s);

        // Permute cols of squares
        shuffle(per3);
        for (k = 0; k < 3; ++k) {
            let offs = per3[k] * 3;
            let offs_k = k * 3;
            for (i = 0; i < 3; ++i) {
                for (j = 0; j < 9; ++j) {
                    s_sol[j][offs_k + i] = sol_copy[j][offs + i];
                    s[j][offs_k + i] = s_copy[j][offs + i];
                }
            }
        }
    }
}

// Initializing function
function init() {
    
    //solveSudoku(testHard);
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
    //document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color = "#B8B8B8";

    setTimeout(function () { loadRandomSud(4); }, 250);

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

function elsewhere() {
    if (curX >= 0) {
        //Tref[curY][curX].style.backgroundColor = "";
        //log("i = " + curY.toString() + ", j = " + curX.toString() + " set to \"\" in elsewhere()");
        curX = -1;
    }    
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
    unhighlightAll();
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
                        checkSolvedSud();
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
                        Marked[y][x] = 2;
                        Tref[y][x].setAttribute("clickable", 0);
                        setCell(y, x, v, large, true);
                        finishedHypChoosing();
                        enableHypRejection();
                        checkSolvedSud();
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

function checkSolvedSud() {
    let slvd = checkSolved(T);
    if (!slvd) {
        return;
    }
    let vid_src = "./gifs/gj.mp4";
    let title = "You solved it!! :)"
    if (sudLvl == -2) {
        vid_src = "./gifs/uncivilized.mp4";
        title = "You used the solver :(";
    } else if (sudLvl == -1) {
        vid_src = "./gifs/thumbs_up.mp4";
        title = "You solved your own sudoku.";
    } else if (sudLvl == 0) {
        vid_src = "./gifs/yoda_fear.mp4";
        title = "Do not fear the harder ones.";
    } else if (sudLvl < 5) {
        vid_src = "./gifs/good.mp4";
        title = "Now try another one.";
    } else if (sudLvl == 8) {
        vid_src = "./gifs/unlim_power.mp4";
        title = "Nothing you can't solve.";
    }
    document.getElementById("fin-vid").src = vid_src;
    document.getElementById("solved-h").src = title;
    $("#win").popup("open");
    console.log(sudLvl);
}

// Enable shrink mode 
function finishedHypChoosing() {
    if (choosingHyp == false) return;
    enableSmallDigs();
    var hyp_but = document.getElementById("but1");
    hyp_but.style.color = "";
    choosingHyp = false;
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
function disableSmallDigs() {
    log("Disabled down button")
    enlarge();
    var down_but = document.getElementById("down-but");
    down_but.onclick = null;
    down_but.style.color = "#B8B8B8";
    down_but.style.borderColor = "#B8B8B8";
    down_but.style.cursor = "pointer";
}
function enableSmallDigs() {
    var down_but = document.getElementById("down-but");
    down_but.onclick = shrink;
    down_but.style.color = "";
    down_but.style.borderColor = "";
}

// Start choosing hypothesis digit
function hypothesis1() {
    
    if (!choosingHyp) {
        // Choose hypothesis digit
        disableSmallDigs()
        var hyp_but = document.getElementById("but1");
        hyp_but.style.color = "#F00";
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
        Tref[y][x].style.color = hypCol;
        Marked[y][x] = 3;
        Marked[lastHyp[0][0]][lastHyp[0][1]] = 0;
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

function input_own_sudoku() {   

    if (!inputtingOwnSud) {
        log("Own Input")

        // Toggle State and Button color
        inputtingOwnSud = true;
        sol_available = false;
        var own_but = document.getElementById("own_sud");
        own_but.style.color = "#F00";

        // Remove current sudoku
        var i, j, k;
        for (i = 0; i < 9; i++) {
            for (j = 0; j < 9; j++) {
                T[i][j] = 0;
                setCell(i, j, 0, true, false);
                Tref[i][j].style.color = '';
                Tref[i][j].style.backgroundColor = '';
                Tref[i][j].setAttribute("clickable", 1);
            }
        }
        disableSmallDigs();

    } else {
        log("Done inputting own sudoku!")
        sudLvl = -1;

        // Toggle State
        inputtingOwnSud = false;
        var own_but = document.getElementById("own_sud");
        own_but.style.color = "";

        // Activate small numbers and set set numbers to unclickable
        Tinit = deepCopy2D(T);
        setClickableTrefT();
        enableSmallDigs();
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
    //document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color="#B8B8B8";

}

// Sets the sudoku to the one specified with the string 'ret_sud'.
function set_sud_from_str(ret_sud) {

    $("#newGrid").popup("close");
    $("#waiting").popup("open")

    let s_and_sol_str = ret_sud.substr(13, 324);
    let s_str = s_and_sol_str.substr(0, 162);
    let s_sol_str = s_and_sol_str.substr(162, 162);
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {
            let tot_ind_t2 = 2 * (i * 9 + j);
            let e_s = parseInt(s_str.substr(tot_ind_t2, 2));
            let e_sol = parseInt(s_sol_str.substr(tot_ind_t2, 2));
            T[i][j] = e_s;
            Tsol[i][j] = e_sol;
        }
    }

    // Shuffle
    permuteSuds(T, Tsol);

    Tinit = deepCopy2D(T);
    if (!sol_available) sol_available = true;
    updateGrid();
    setClickableTrefT();
    hyp = false;
    $("#waiting").popup("close")
}

// Reads a random sudoku from the file and loads it.
function loadRandomSud(lvl = 7) {

    if (inputtingOwnSud) {
        input_own_sudoku();
    }
    sudLvl = lvl; 

    console.log("Trying to load fucking file");
    var f_name = "./data/ext_lvl_" + lvl.toString() + ".txt";
    fetch(f_name)
        .then(response => response.text())
        .then((data) => {
            var items = data.split("\n");
            var n_s = items.length - 1;
            let s_ind = Math.floor(Math.random() * n_s);
            let sud_str = items[s_ind];
            console.log(sud_str);
            set_sud_from_str(sud_str);
            console.log("Fuckkkk");
        })
}

function solve() {
    if (sol_available == false) return;
    sudLvl = -2;
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
    //document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color="#B8B8B8";
}

// Checks if any input digits are wrong and sets their background to
// red.
function check() {
    if (sol_available == false) return;
    console.log("Checking Sudoku: ");
    for(i=0;i<9;i++) {
        for (j = 0; j < 9; j++) {
            let tot_ind = i * 9 + j;
            if ((T[i][j] != Tsol[i][j]) && (T[i][j] != 0)) {
                console.log(tot_ind.toString() + " is " + Tsol[i][j].toString());
                let curr_mar = Marked[i][j]
                console.log(curr_mar)
                if (curr_mar == 2) {
                    Tref[i][j].style.color = wrongHypCol;
                    Marked[i][j] = 3;
                    console.log("your fucking hypothesis is wrong");
                } else {
                    Tref[i][j].style.color = wrongCol;
                    Marked[i][j] = 1;
                }
            }
        }
    }
}

// The above sudoku generator sucks, so this is my own (work in progress)
// This one does not work well though.

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


