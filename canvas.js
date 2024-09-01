const canvas = document.getElementById("renderScreen");
const ctx = canvas.getContext("2d", {"alpha": false});

const insert = document.getElementById("insert");
const delayInput = document.getElementById("delay");
const rotateButton = document.getElementById("rotate");
const flipXButton = document.getElementById("flipX");
const flipYButton = document.getElementById("flipY");

const X = 300;
const Y = 300;
const XM = X - 1;
const YM = Y - 1;
const WID = canvas.width;
const HEI = canvas.length;

var playing = false;
var delay = 5;
var ghost = true;

var cursor = [150,150];

function arr2d(x,y,val) {
    var array = new Array(x);
    for(var i = 0; i < x; i++)
        array[i] = new Array(y);
    for(x2 = 0; x2 < x; x2++) {
        for(y2 = 0; y2 < y; y2++)
            array[x2][y2] = val;
    }
    return array;
}

function arr2dCopy(x, y, arr) {
    var array = new Array(x);
    for(var i = 0; i < x; i++)
        array[i] = new Array(y);
    for(x2 = 0; x2 < x; x2++) {
        for(y2 = 0; y2 < y; y2++)
            array[x2][y2] = arr[x2][y2];
    }
    return array;
}

var map = arr2d(X,Y,0);
var save = arr2d(X,Y,0);

var shapes = [
    /* gosper glider */ [0,0, 1,0, 1,1, 0,1, 10,0, 10,1, 10,2, 10,-1, 10,-2, 9,-2, 9,-3, 9,2, 9,3, 11,0, 11,1, 11,-1, 12,0, 21,-1, 21,-2, 21,-3, 23,-1, 23,-3, 24,0, 24,-1, 24,-2, 24,-3, 24,-4, 25,0, 26,0, 25,1, 26,1, 25,-4, 26,-4, 25,-5, 26,-5, 34,-1, 34,-2, 35,-1, 35,-2],
    /* twin gun */ [0,0, 1,0, 1,1, 0,1, 0,7, 1,7, 1,8, 0,8, 16,0, 16,-1, 17,-1, 18,-1, 19,-1, 19,0, 20,0, 20,1, 21,1, 20,2, 19,3, 18,3, 17,2, 17,1, 18,5, 19,5, 20,6, 20,7, 21,7, 20,8, 19,8, 19,9, 18,9, 17,9, 16,9, 16,8, 17,7, 17,6, 28,5, 29,5, 29,6, 30,7, 31,7, 32,6, 32,5, 33,4, 33,3, 32,3, 31,3, 30,3, 30,4, 29,4, 29,10, 29,11, 28,11, 29,12, 30,12, 30,13, 31,13, 32,13, 33,13, 33,12, 32,11, 32,10, 31,9, 30,9, 48,11, 48,12, 49,12, 49,11, 48,5, 49,5, 48,4, 49,4],
    /* twin single gun */ [0,0, 1,0, 1,1, 0,1, 0,7, 1,7, 1,8, 0,8, 16,0, 16,-1, 17,-1, 18,-1, 19,-1, 19,0, 20,0, 20,1, 21,1, 20,2, 19,3, 18,3, 17,2, 17,1, 18,5, 19,5, 20,6, 20,7, 21,7, 20,8, 19,8, 19,9, 18,9, 17,9, 16,9, 16,8, 17,7, 17,6, 29,6, 30,6, 31,5, 31,4, 30,4, 32,4, 32,3, 32,2, 31,2, 31,1, 30,1, 30,2, 29,2, 28,2, 27,3, 27,4, 27,5, 28,5, 29,8, 30,8, 31,9, 31,10, 30,10, 32,10, 32,11, 32,12, 31,12, 31,13, 30,13, 30,12, 29,12, 28,12, 27,11, 27,10, 27,9, 28,9, 47,10, 48,10, 48,11, 47,11, 47,4, 48,4, 47,3, 48,3],
    /* twin head (left)*/ [0,0, 1,0, 1,1, 0,1, 0,7, 1,7, 1,8, 0,8, 16,0, 16,-1, 17,-1, 18,-1, 19,-1, 19,0, 20,0, 20,1, 21,1, 20,2, 19,3, 18,3, 17,2, 17,1, 18,5, 19,5, 20,6, 20,7, 21,7, 20,8, 19,8, 19,9, 18,9, 17,9, 16,9, 16,8, 17,7, 17,6],
    /* arrowhead (left)*/ [0,0, 1,0, 1,1, 0,1, 10,0, 10,1, 10,2, 10,-1, 10,-2, 9,-2, 9,-3, 9,2, 9,3, 11,0, 11,1, 11,-1, 12,0],
    /* twin head (right) */ [-12, -1, -12, 0, -12, 8, -12, 9, -11, -1, -11, 1, -11, 2, -11, 6, -11, 7, -11, 9, -10, -1, -10, 3, -10, 5, -10, 9, -9, -1, -9, 0, -9, 3, -9, 5, -9, 8, -9, 9, -8, 0, -8, 1, -8, 2, -8, 6, -8, 7, -8, 8, -7, 1, -7, 7, -1, 0, -1, 1, -1, 7, -1, 8, 0, 0, 0, 1, 0, 7, 0, 8],
    /* arrowhead (right) */ [-12, -4, -12, -3, -12, 1, -12, 2, -11, -3, -11, -2, -11, -1, -11, 0, -11, 1, -10, -2, -10, -1, -10, 0, -9, -1, -1, -1, -1, 0, 0, -1, 0, 0],
    /* Medium spaceship */ [0, -3, 0, -1, 1, 0, 2, -4, 2, 0, 3, 0, 4, -3, 4, 0, 5, -2, 5, -1, 5, 0],
    /* small spaceship */ [0, -3, 0, -1, 1, 0, 2, 0, 3, -3, 3, 0, 4, -2, 4, -1, 4, 0]
]
var currentShape = 0;

function life() {
    var count;
    var tmp = arr2dCopy(X,Y,map);
    for(x = 0; x < X; x++) {
        for(y = 0; y < Y; y++) {
            count = tmp[(x+1)%X][y] + tmp[(x+1)%X][(y+1)%Y] + tmp[x][(y+1)%Y] + tmp[(x+XM)%X][(y+1)%Y] + tmp[(x+XM)%X][y] + tmp[(x+XM)%X][(y+YM)%Y] + tmp[x][(y+YM)%Y] + tmp[(x+1)%X][(y+YM)%Y];
            if(tmp[x][y] === 0 && count == 3) {
                map[x][y] = 1;
            }
            if(tmp[x][y] === 1 && (count < 2 || count > 3)) {
                map[x][y] = 0;
            }
        }
    }
}

function updateScreen() {
    ctx.clearRect(0,0,750,750);
    var x, y;
    if(ghost) {
        ctx.fillStyle = "gray";
        var tmp = shapes[currentShape];
        for(var i = tmp.length/2 - 1; i >= 0; --i) {
            x = (cursor[0] + tmp[i*2] + X)%X;
            y = (cursor[1] + tmp[i*2 + 1] + X)%X;
            ctx.fillRect(x*2.5, y*2.5, 2.5, 2.5);
        }
    }
    ctx.fillStyle = "white";
    for(x = 0; x < X; x++) {
        for(y = 0; y < Y; y++) {
            if(map[x][y] == 1) {
                ctx.fillRect(x*2.5, y*2.5, 2.5, 2.5);
            }
        }
    }
    ctx.fillStyle = "red";
    ctx.fillRect(cursor[0]*2.5, cursor[1]*2.5, 2.5, 2.5);

}

function updateAll() {
    if(playing) {
        life();
        updateScreen();
    }
}
updateScreen();


var interval = setInterval(updateAll, delay);

document.addEventListener("keydown", function(event) {
    switch(event.key) {
        case ' ':
            if(playing) {
                playing = false;
                document.getElementById("status").textContent = "Paused";
            }
            else {
                playing = true;
                document.getElementById("status").textContent = "Playing";
            }
            break;
        case 'Enter': case '`':
            if(map[cursor[0]][cursor[1]] == 1)
                map[cursor[0]][cursor[1]] = 0;
            else
                map[cursor[0]][cursor[1]] = 1;
            updateScreen();
            break;
        case 'ArrowDown':
            cursor[1] = (cursor[1] + 1)%Y;
            updateScreen();
            break;
        case 'ArrowUp':
            cursor[1] = (cursor[1] + YM)%Y;
            updateScreen();
            break;
        case 'ArrowLeft':
            cursor[0] = (cursor[0] + XM)%X;
            updateScreen();
            break;
        case 'ArrowRight':
            cursor[0] = (cursor[0] + 1)%X;
            updateScreen();
            break;
        case '\\':
            for(x = 0; x < X; x++) {
                for(y = 0; y < Y; y++)
                    map[x][y] = 0;
            }
            playing = false;
            document.getElementById("status").textContent = "Paused";
            updateScreen();
            break;
        case 'h':
            for(x = 0; x < X; x++) {
                for(y = 0; y < Y; y++) {
                    if(Math.random() <= 0.5)
                        map[x][y] = 1;
                    else
                        map[x][y] = 0;
                }
            }
            updateScreen();
            break;
        case 'c':
            for(var x = 0; x < X; x++) {
                for(var y = 0; y < Y; y++)
                    save[x][y] = map[x][y];
            }
            break;
        case 'v':
            for(var x = 0; x < X; x++) {
                for(var y = 0; y < Y; y++)
                    map[x][y] = save[x][y];
            }
            document.getElementById("status").textContent = "Paused";
            playing = false;
            updateScreen();
            break;
        case '.':
            life();
            updateScreen();
            break;
        case 'p':
            var tmp = shapes[currentShape];
            for(var i = tmp.length/2 - 1; i >= 0; --i) {
                map[(cursor[0] + X + tmp[i*2])%X][(cursor[1] + Y + tmp[i*2 + 1])%Y] ^= 1;
            }
            updateScreen();
            break;
        case 'l':
            var tmp = [];
            for(var x = 0; x < X; x++) {
                for(var y = 0; y < Y; y++) {
                    if(map[x][y] == 1) {
                        tmp.push(x-cursor[0]);
                        tmp.push(y-cursor[1]);
                    }
                }
            }
            console.log(Array(tmp));
            break;
        case 'g':
            ghost = !ghost;
            updateScreen();
            break;
        case 'y':
            flipY();
            break;
        case 'x':
            flipX();
            break;
        case 'r':
            rotate();
            break;
        case 'w':
            ghost = true;
            for(var i = shapes[currentShape].length - 1; i >= 0; i -= 2)
                shapes[currentShape][i] = (shapes[currentShape][i] + Y - 1)%Y;
            updateScreen();
            break;
        case 's':
            ghost = true;
            for(var i = shapes[currentShape].length - 1; i >= 0; i -= 2)
                shapes[currentShape][i] = (shapes[currentShape][i] + Y + 1)%Y;
            updateScreen();
            break;
        case 'a':
            ghost = true;
            for(var i = shapes[currentShape].length - 2; i >= 0; i -= 2)
                shapes[currentShape][i] = (shapes[currentShape][i] + X - 1)%X;
            updateScreen();
            break;
        case 'd':
            ghost = true;
            for(var i = shapes[currentShape].length - 2; i >= 0; i -= 2)
                shapes[currentShape][i] = (shapes[currentShape][i] + X + 1)%X;
            updateScreen();
            break;
    }
});

canvas.addEventListener("click", function(event) {
    var clickX = event.clientX;
    var clickY = event.clientY;
    if(event.shiftKey) {
        clickX = Math.floor(((clickX - 350) / 750) * X - X/2);
        clickY = Math.floor(((clickY - 10) / 750) * Y - Y/2);
        for(var i = shapes[currentShape].length - 2; i >= 0; i -= 2) {
            shapes[currentShape][i] = (shapes[currentShape][i] + clickX + X)%X;
            shapes[currentShape][i + 1] = (shapes[currentShape][i + 1] + clickY + Y)%Y;
        }
    }
    else {
        clickX = Math.floor(((clickX - 350) / 750) * X);
        clickY = Math.floor(((clickY - 10) / 750) * Y);
        cursor = [clickX, clickY];
    }
    updateScreen();
});
insert.addEventListener("change", function() {
    currentShape = eval(document.getElementById("insert").value);
    if(ghost)
        updateScreen();
})
delayInput.addEventListener("change", function() {
    delay = eval(document.getElementById("delay").value);
    clearInterval(interval);
    interval = setInterval(updateAll,delay);
})

rotateButton.addEventListener("click", rotate);
flipXButton.addEventListener("click", flipX);
flipYButton.addEventListener("click", flipY);

function rotate() {
    var tmp = shapes[currentShape];
    var tmpc = [0,0];
    for(var i = tmp.length/2 - 1; i >= 0; --i) {
        tmpc = [tmp[i*2], tmp[i*2 + 1]];
        tmp[i*2] = -tmpc[1];
        tmp[i*2 + 1] = tmpc[0];
    }
    if(ghost)
        updateScreen();
}

function flipX() {
    var tmp = shapes[currentShape];
    for(var i = tmp.length/2 - 1; i >= 0; --i) {
        tmp[i*2 + 1] = -tmp[i*2 + 1];
    }
    if(ghost)
        updateScreen();
}

function flipY() {
    var tmp = shapes[currentShape];
    for(var i = tmp.length/2 - 1; i >= 0; --i) {
        tmp[i*2] = -tmp[i*2];
    }
    if(ghost)
        updateScreen();
}