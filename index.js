// initialize GSAP Inertia plugin
gsap.registerPlugin(InertiaPlugin);
// Declare variables to store the grid dimensions
var $snap = $("#snap"),
    $liveSnap = $("#liveSnap"),
    $container = $("#container"),
    gridWidth = 100,
    gridHeight = 100,
    gridSize = 5,
    gridRows = gridSize,
    gridColumns = gridSize,
    i,
    j,
    x,
    y;

////////////////////////GRID///////////////////////

// create the grid cells
for (i = 0; i < gridRows * gridColumns; i++) {
    y = Math.floor(i / gridColumns) * gridHeight;
    x = (i * gridWidth) % (gridColumns * gridWidth);
    $("<div/>", {class: "cell", id: "cell" + [i]}).css({position: "absolute", border: "1px solid #fff", backgroundColor: "#ddd", width: gridWidth - 1, height: gridHeight - 1, top: y, left: x}).appendTo($container);
}

// set the Draggable grid
gsap.set($container, {
    height: gridRows * gridHeight + 8,
    width: gridColumns * gridWidth + 8
});

////////////////////////BLUE BOXES///////////////////////

// populate the grid with blue boxes, minus the bottom 2 rows
// give each box a common class and a unique, sequential id
for (j = 0; j < (gridRows - 2) * gridColumns; j++) {
    y = Math.floor(j / gridColumns) * gridHeight;
    x = (j * gridWidth) % (gridColumns * gridWidth);
    $("<div/>", {class: "box", id: "box" + [j]}).css({position: "absolutere", border: "1px solid #fff", width: gridWidth - 1, height: gridHeight - 1, top: y, left: x}).appendTo($container);
}

// populate the 2nd from last row, leaving the last 2 columns empty
// give each box a common class and a unique, sequential id
for (j = 0; j < (gridRows - (gridRows - 1)) * (gridColumns - 2); j++) {
    y = Math.floor(j / gridColumns + (gridRows - 2)) * gridHeight;
    x = (j * gridWidth) % ((gridColumns - 2) * gridWidth);
    $("<div/>", {class: "box", id: "box" + [j + (gridColumns * (gridRows - 2))]}).css({position: "absolute", border: "1px solid #fff", width: gridWidth - 1, height: gridHeight - 1, top: y, left: x}).appendTo($container);
}

// populate the last row, leaving the last 2 columns empty
// give each box a common class and a unique, sequential id
for (j = 0; j < (gridRows - (gridRows - 1)) * (gridColumns - 2); j++) {
    y = Math.floor(j / gridColumns + (gridRows - 1)) * gridHeight;
    x = (j * gridWidth) % ((gridColumns - 2) * gridWidth);
    $("<div/>", {class: "box", id: "box" + [j + (gridColumns * (gridRows - 2) + (gridColumns - 2))]}).css({position: "absolute", border: "1px solid #fff", width: gridWidth - 1, height: gridHeight - 1, top: y, left: x}).appendTo($container);
}

//declare a variable representing the .box class
var boxes = document.querySelectorAll(".box");

// set the size of the boxes in relation to the grid
gsap.set(boxes, {
    width: gridWidth - 4,
    height: gridHeight - 4
});

////////////////////////PLAYER/////////////////////////////

// create the 'player' block 
$("<div/>", {class: "player", id: "player"}).css({position: "relative", border: "1px solid #fff", width: gridWidth - 1, height: gridHeight - 1}).appendTo($container);

// place the player block in the bottom right corner of the grid (final cell in the index)
gsap.set("#player", {top: gridHeight * (gridRows - 1), left: gridWidth * (gridColumns - 1)});

//declare a variable representing the player
var player = document.querySelector(".player");

// set the size of the player block in relation to the grid
gsap.set(player, {
    width: gridWidth - 3,
    height: gridHeight - 3
});

// declare a variable representing the '.cell' class
var gridCell = document.querySelectorAll(".cell");

// declare a constant representing the GSAP 'getProperty' method
var getter = gsap.getProperty;

// declare a function that checks if each grid cell is occupied by a blue block and adds or removes the '.is-empty' class accordingly
function checkIfEmpty() {
    for (i = 0; i < gridCell.length; i++) {
        for (j = 0; j < boxes.length; j++) {
            var cellX = getter(gridCell[i], "left");
            var cellY = getter(gridCell[i], "top");
            var boxX = (Math.round((getter(boxes[j], "x")) / gridWidth) * gridWidth) + (getter(boxes[j], "left"));
            var boxY = (Math.round((getter(boxes[j], "y")) / gridHeight) * gridHeight) + (getter(boxes[j], "top"));
            if (cellX === boxX && cellY === boxY) {
                $(gridCell[i]).removeClass("is-empty");
                break;
            } else if (cellX !== boxX || cellY !== boxY) {
                $(gridCell[i]).addClass("is-empty");
            }
        }
    }
}

// declare a function that brings the 'you-win' div to the front and animates from zero to one opacity
// animates the 'instructions' text from 1 to 0 opacity
function youWon() {
    $(".you-win").css("z-index", 1050);
    gsap.to(".you-win", {opacity: 1, duration: 3});
    gsap.to(".instructions", {opacity: 0, duration: 3});
    gsap.to("#reset", {opacity: 1, delay: 3, duration: 3});
} ;

// reload the page when the 'reset' button is clicked
function reset() {
    location.reload();
} ;

// declare a function that moves the player one cell towards the top if that cell is unoccupied, or one cell to the left if the cell above is occupied. If both cells are occupied the player stays in place. 
// plays the 'you won' animation when the player reaches the exit (cell zero)
function movePlayer() {
    var playerX = getter(player, "x");
    var playerY = getter(player, "y");
    var playerCell = (((((((gridRows * gridWidth) + playerY) / gridWidth) - 1) * gridColumns) + 1) + ((((gridColumns * gridWidth) + playerX) / gridWidth) - 1) - 1);
    if ($("#cell" + [playerCell - gridColumns]).hasClass("is-empty")) {
        gsap.to(player, {y: (playerY - gridHeight)});
        playerCell -= gridColumns;
    } else if ($("#cell" + [playerCell - 1]).hasClass("is-empty")) {
        gsap.to(player, {x: (playerX - gridWidth)});
        playerCell -= 1;
    } else {
        return;
    }
    if (playerCell === 0) {
        youWon();
    } else {
        return;
    }
}

//////////////////////DRAGGABLE//////////////////////////////////

// declare a function that apllies the Draggable plug-in to the '.box' class according to the selected option, including snapping and collision detection
function update() {
      liveSnap = $liveSnap.prop("unchecked");
    Draggable.create(".box", {
        bounds: $container,
        edgeResistance: 0.90,
        type: "x,y",
        //declare an on-drag function that ends dragging after the length of one cell, or if 2 boxes try to occupy the same cell
        onDrag: function (e) {
            for (j = 0; j < boxes.length; j++) {
                if (this.hitTest(boxes[j])) {
                    this.endDrag(e);
                } else if (this.hitTest(player)) {
                    this.endDrag(e);
                } else if (this.x > (this.startX + gridWidth)) {
                    this.endDrag(e);
                } else if (this.x < (this.startX - gridWidth)) {
                    this.endDrag(e);
                } else if (this.y > (this.startY + gridHeight)) {
                    this.endDrag(e);
                } else if (this.y < (this.startY - gridHeight)) {
                    this.endDrag(e);
                }
            }
        },
        onDragEnd: function () {
            checkIfEmpty();
            movePlayer();
        },
        inertia: true,
        throwResistance: 5000000,
        dragResistance: 0.65,
        overShootTolderance: 0.1,
        autoScroll: false,
        liveSnap: liveSnap,
        lockAxis: true,
        // declare functions that snap the boxes to the x & y axes of the grid after drag is released
        snap: {
            x: function (endValue) {
                return Math.round(endValue / gridWidth) * gridWidth;
            },
            y: function (endValue) {
                return Math.round(endValue / gridHeight) * gridHeight;
            }
        }
    });
}

update();