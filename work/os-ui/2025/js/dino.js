function topWall(obj) {
    return obj.y;
}
function bottomWall(obj) {
    return obj.y + obj.height;
}
function leftWall(obj) {
    return obj.x;
}
function rightWall(obj) {
    return obj.x + obj.width;
}

// DINOSAUR
function Dinosaur (x, dividerY) {
    this.width = 70;
    this.height = 70;
    this.x = x;
    this.y = dividerY - this.height;
    this.vy = 0;
    this.jumpVelocity = -20;
    this.img = new Image();
    this.img.src = "../img/dino.svg";
    this.isJump = false;
}
Dinosaur.prototype.draw = function(context, frame) {
    if(this.isJump) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(frame * 4 * Math.PI / 180);
        context.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
        context.restore();

    } else {
        context.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
};

Dinosaur.prototype.jump = function() {
    this.isJump = true;
    this.vy = this.jumpVelocity;
};
Dinosaur.prototype.update = function(divider, gravity) {
    this.y += this.vy;
    this.vy += gravity;
    if (bottomWall(this) > topWall(divider) && this.vy > 0) {
        this.y = topWall(divider) - this.height;
        this.vy = 0;
        this.isJump = false;
        return;
    }
};
// ----------
// DIVIDER
function Divider (gameWidth, gameHeight) {
    this.width = gameWidth;
    this.height = 5;
    this.x = 0;
    this.y = gameHeight - this.height - Math.floor(0.2 * gameHeight);
}
Divider.prototype.draw = function(context) {
    context.fillStyle = "white";
    context.fillRect(this.x, this.y, this.width, this.height);
};
// ----------

// ----------
// CACTUS
function Cactus(gameWidth, groundY){
    this.width = 16;
    this.height = (Math.random() > 0.5) ? 30 : 70;
    this.x = gameWidth;
    this.y = groundY - this.height;
}

Cactus.prototype.draw = function(context){
    var oldFill = context.fillStyle;

    context.fillStyle = `rgb(
        ${Math.floor(255 * Math.random())},
        ${Math.floor(255 * Math.random())},
        0)`;

    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = oldFill;
};

function Stars(gameWidth, groundY){
    this.width = 2;
    this.x = gameWidth + Math.random() * 1000;
    this.y = groundY - Math.floor(Math.random() * groundY);
    this.variant = Math.random();
}

Stars.prototype.draw = function(context){
    context.fillStyle = `rgb(
        ${Math.floor(255 * Math.random())},
        ${Math.floor(255 * Math.random())},
        ${Math.floor(255 * Math.random())})`;
    context.beginPath();
    context.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
    context.closePath();
    context.fill();

}

function ResultWindow(gameWidth, gameHeight, score) {
    this.width = 200;
    this.height = 150;
    this.x = gameWidth / 2 - this.width / 2;
    this.y = gameHeight / 2 - this.height / 2;
    this.score = score;
}

ResultWindow.prototype.draw = function(context) {
    context.fillStyle = "rgba(10, 10, 10, 0.8)";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = "white";
    context.font = "10px Arial";
    context.fillText("Game Over", this.x + 20, this.y + 40);
    context.fillText("Score: " + this.score, this.x + 20, this.y + 80);
    context.fillText("Press Ctrl + Enter to restart", this.x + 20, this.y + 120);
}
// ----------
// GAME
function Game () {
    var canvas = document.getElementById("game");
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d");
    this.context.fillStyle = "brown";
    document.spacePressed = false;
    document.addEventListener("keydown", function(e) {
        if (e.key === " ") this.spacePressed = true;
    });
    document.addEventListener("keyup", function(e) {
        if (e.key === " ") this.spacePressed = false;
    });
    this.gravity = 1.5;
    this.divider = new Divider(this.width, this.height);
    this.dino = new Dinosaur(Math.floor(0.1 * this.width), this.divider.y);
    this.cacti = [];
    this.stars = [];
    this.resultWindow = null;


    this.runSpeed = -10;
    this.paused = true;
    this.noOfFrames = 0;
}

Game.prototype.spawnCactus = function(probability){
    if(Math.random() <= probability){
        this.cacti.push(new Cactus(this.width, this.divider.y));
    }
}

Game.prototype.spawnStar = function(){
    this.stars.push(new Stars(this.width, this.divider.y));
}

Game.prototype.start = function() {
    this.dino = new Dinosaur(Math.floor(0.1 * this.width), this.divider.y);
    this.cacti = [];
    this.stars = [];
    this.paused = false;
    this.noOfFrames = 0;
    this.score = 0;
}

Game.prototype.update = function () {
    if(this.paused){
        return;
    }

    if (document.spacePressed == true && bottomWall(this.dino) >= topWall(this.divider)) {
        this.dino.jump(this.context);
    }
    this.dino.update(this.divider, this.gravity);

    if(this.cacti.length > 0 && rightWall(this.cacti[0]) < 0) {
        this.cacti.shift();
    }

    if(this.cacti.length == 0){
        this.spawnCactus(0.5);
    } else if (
        this.cacti.length > 0
        && this.width - leftWall(this.cacti[this.cacti.length-1]) > this.jumpDistance + 150) {
        this.spawnCactus(0.05);
    }


    for (i = 0; i < this.cacti.length; i++){
        this.cacti[i].x += this.runSpeed;
    }

    for(i = 0; i < this.cacti.length; i++){
        if(
            rightWall(this.dino) >= leftWall(this.cacti[i])
            && leftWall(this.dino) <= rightWall(this.cacti[i])
            && bottomWall(this.dino) >= topWall(this.cacti[i])) {
            this.paused = true;
            this.resultWindow = new ResultWindow(this.width, this.height, this.score);

        }
        this.noOfFrames++;
        this.score = Math.floor(this.noOfFrames/10);
    }

    if(this.noOfFrames % 5 === 0)
        this.spawnStar();


    for (i = 0; i < this.stars.length; i++){
        this.stars[i].x += this.runSpeed + this.runSpeed * this.stars[i].variant;
        if(this.stars[i].x < -200)
            this.stars.shift();
    }

    this.jumpDistance = Math.floor(this.runSpeed * (2 * this.dino.jumpVelocity) / this.gravity);
};
Game.prototype.draw = function () {
    this.context.clearRect(0, 0, this.width, this.height);
    this.divider.draw(this.context);
    this.dino.draw(this.context, this.noOfFrames);
    for (i = 0; i < this.cacti.length; i++){
        this.cacti[i].draw(this.context);
    }

    for (i = 0; i < this.stars.length; i++){
        this.stars[i].draw(this.context);
    }

    var oldFill = this.context.fillStyle;
    this.context.fillStyle = "white";

    if(this.dino.isJump) {
        this.context.fillText(this.score, this.width-40 + Math.random() * 5, 20 + Math.random() * 5, 20);
    } else {
        this.context.fillText(this.score, this.width-40, 20, 20);
    }
    this.context.fillStyle = oldFill;

    if(this.paused) {
        this.resultWindow.draw(this.context);
    }
};

var game = new Game();
var gameFrame;
function main (timeStamp) {
    if(gameFrame)
        clearInterval(gameFrame);

    gameFrame = setInterval(function(){
        game.update();
        game.draw();
    }, 1000/60);
}

//enter key input
$(document).on("keydown", function(e){
    if(e.ctrlKey && e.keyCode == 13) {
        game.resultWindow = null;
        game.start();
        $(".error_text_wrap").addClass("display_none");
        $(".error_bg_grid").addClass("display_none");
        window.requestAnimationFrame(main);
    }
});
