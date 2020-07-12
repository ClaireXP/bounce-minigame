/* global
loadImage,
image,
createCanvas,
background,
mouseX,
mouseY,
noCursor,
random,
text,
textSize,
createButton,
colorMode,
HSB,
fill,
stroke,
cursor,
ARROW,
second,
millis,
rect,
createSlider,
frameRate,
storeItem,
getItem,
*/

let xCan = window.innerWidth-15;
let yCan = window.innerHeight-15;

let can, paddle, p, balls, ppb;

let game = false;
let type;
let score = 0;
let highscore;
let lives;

let w = xCan/12;
if(w >= 75) w = 75;

let maxVel = 3;
let txt = .8;
if(xCan<400){
  maxVel = 2;
  txt = .5;
  w*=1.2;
}if(xCan > 600) txt = 1;

let survivalBtn, freeplayBtn, unlimitedBtn, menuBtn, playAgainBtn, pauseBtn, cheatsBtn;
let freqSlider, wSlider;

let magicSec, firstMilli, another;
let freq = 8;

function preload(){
  paddle = loadImage('https://cdn.glitch.com/13200784-0c12-47b6-be44-1232a5975d42%2FpingPongPaddle.png?v=1594432657713');
  ppb = loadImage('https://cdn.glitch.com/13200784-0c12-47b6-be44-1232a5975d42%2Fppb.png?v=1594435876316');
  
  if(getItem("highscore") != null) highscore = getItem("highscore");
  else highscore = 0;
}

function setup(){
  frameRate(90);
  refresh();
}

function draw(){
  if(game){
    updateScreen();
    if(type == "survival" && balls.length>0) score++;
    
    //Check to see that the system clock aligns with either of the magic numbers
    //After a ball has been spawned, set var another to true to prevent extra spawns
    if(second()%freq == magicSec && !another){ 
      addBall();
      another = true;
    }if(second()%freq == magicSec+1) another = false;
  }
}

function refresh(){
  p = {
    width: 3*w,
    height: w,
    mX: xCan/2,
    mY: yCan/3,
    x: mouseX,
    y: yCan/3,
    x1: mouseX + 150,
    y1: yCan/3 + 50,
    maxY: yCan/2,
  }
  
  balls = [];  
  can = createCanvas(xCan, yCan);
  
  colorMode(HSB);
  background(175, 5, 95);
  fill(175, 40, 80);
  stroke(175, 40, 80);
  textSize(50);
  text("Bounce!", xCan/2-88, yCan/2-100);
  
  survivalBtn = createButton("SURVIVAL");
  button(survivalBtn, xCan/2-88, yCan/2, 200, 50, survive);
  
  freeplayBtn = createButton("FREEPLAY");
  button(freeplayBtn, xCan/2-88, yCan/2-70, 200, 50, freeplay);
  
  unlimitedBtn = createButton("UNLIMITED");
  button(unlimitedBtn, xCan/2-88, yCan/2+70, 200, 50, unlimited);
}

function mouseMoved(can){
  if(mouseY>p.maxY && game) noCursor();
  else cursor(ARROW);
  
  updateP()
}

function touchStarted(){
  updateP();
}

function touchMoved(){
  updateP();
}

function updateP(){
  p.mX = mouseX;  
  if(mouseY>p.maxY) p.mY = mouseY;
  p.x = p.mX - p.width/2;
  p.y = p.mY - p.height/2;
  p.x1 = p.x + p.width;
  p.y1 = p.y + p.height;
}

function updateScreen(){
  background(175, 5, 95);
  
  image(paddle, p.mX-p.width/2, p.mY-p.height/2, p.width, p.height);
  checkColl();
  
  textSize(20*txt);
  text("Score: " +score, xCan/4+15, yCan-15);
  if(type!="unlimited" && freq==8 && (p.height==w || (w>=75 && p.height==12)) && score>highscore) highscore = score;
  text("High Score (Legit): " +highscore, xCan/2+15, yCan-15);
  text("Lives: " +lives, 15, yCan-15);
}

function checkColl(){
  for(const o of balls){ 
    updateX(o);
    updateY(o);
    image(ppb, o.x, o.y, o.r, o.r);
    
    if((o.y+o.r<=p.y1 && o.y>p.y-2*o.r) && (o.x>p.x+p.width/8 && o.x+o.r<p.x1)){
      if(o.yDelt>0){
        o.yDelt=-o.yDelt;
        if(type == "freeplay" || type == "unlimited") score += balls.length*100;
        
        let xPCen = (p.x+p.width/8 + p.x1+p.width/8)/2;
        let xOCen = o.x + o.r/2;
        o.xDelt=Math.round(xOCen-xPCen)/8;
      }
    }
  }
}

function updateX(o){
    //Updates x
    if(o.x>=xCan-o.r || o.x<=0){
      o.xDelt=-o.xDelt;
    }o.x+=o.xDelt;
  }

function updateY(o){
  //Updates y with respects to current location --> Factors in "gravity"
  if(o.y<=0 && o.yDelt<0) o.yDelt=-o.yDelt;
  o.y+=(o.yDelt*.5+o.yDelt*o.y*.03);
  
  if(o.y>=yCan-o.r && o.yDelt>0){
    if(lives!="infinite") lives--;
    if(lives==0) gameOver();
  }
}

function gameOver(){
  game = false;
  for(const o of balls) balls.pop();
  balls.pop();
  
  pauseBtn.remove();
  cursor(ARROW);
  
  rect(xCan/2-135, yCan/2-115, 280, 260);
  
  menuBtn = createButton("MAIN MENU");
  button(menuBtn, xCan/2-88, yCan/2+70, 200,50, main);

  cheatsBtn = createButton("OPTIONS");
  button(cheatsBtn, xCan/2-88, yCan/2, 200,50, cheats);
  
  playAgainBtn = createButton("PLAY AGAIN");
  button(playAgainBtn, xCan/2-88, yCan/2-70, 200,50, again);
  
  storeItem("highscore", highscore);
}

function addBall(){
  balls.push({
    r: w/2,
    x: xCan/2,
    y: yCan/8,
    xDelt: random(-5,5),
    yDelt: random(-maxVel/2.0,-maxVel),
    sec: Math.round(millis()/1000),
  });
}

function survive(){
  type = "survival"
  letsPlay();
}

function freeplay(){
  type = "freeplay"
  letsPlay();
}

function unlimited(){
  type = "unlimited"
  letsPlay();
}

function letsPlay(){
  if(type == "survival") lives = 1;
  else if(type == "freeplay") lives = 3;
  else lives = "infinite";
  
  survivalBtn.remove();
  freeplayBtn.remove();
  unlimitedBtn.remove();
  
  pauseBtn = createButton("| |");
  button(pauseBtn, xCan-34, 10, 40, 40, pause);
  
  score = 0;
  magicSec = (second()+2) % freq;
  game = true;
}

function main(){
  closeGameOver();
  refresh();
}

function again(){
  closeGameOver();
  letsPlay();
}

function closeGameOver(){
  menuBtn.remove();
  playAgainBtn.remove();
  cheatsBtn.remove();
}

function pause(){
  game = false;
  cursor(ARROW);
  
  pauseBtn.remove();
  
  rect(xCan/2-135, yCan/2-115, 280, 260);
  
  menuBtn = createButton("MAIN MENU");
  button(menuBtn, xCan/2-88, yCan/2+70, 200,50, main);

  cheatsBtn = createButton("OPTIONS");
  button(cheatsBtn, xCan/2-88, yCan/2, 200,50, cheats);
  
  playAgainBtn = createButton("CONTINUE");
  button(playAgainBtn, xCan/2-88, yCan/2-70, 200,50, cont);
}

function cont(){
  closeGameOver();
  updateScreen();
  
  pauseBtn = createButton("| |");
  button(pauseBtn, xCan-34, 10, 40, 40, pause);
  
  magicSec = (second()+2) % freq;
  another = false;
  game = true;
}

function cheats(){
  closeGameOver();
  freqSlider = createSlider(3, 60, freq);
  freqSlider.position(xCan/2-25, yCan/2+70+35/2);
  
  wSlider = createSlider(2, xCan, p.width);
  wSlider.position(xCan/2-25, yCan/2+35/2);
  
  playAgainBtn = createButton("BACK");
  button(playAgainBtn, xCan/2-88, yCan/2-70, 200,50, back);
  
  image(ppb, xCan/2-90, yCan/2+70, 30, 30);
  image(paddle, xCan/2-90, yCan/2, 35, 35);
}

function back(){
  pauseBtn = createButton("| |");
  button(pauseBtn, xCan-34, 10, 40, 40, pause);
  
  playAgainBtn.remove();
  wSlider.remove();
  freqSlider.remove();
  
  freq = freqSlider.value();
  p.width = wSlider.value();
  p.height = p.width*1/3;
  
  if(lives>0) pause();
  else refresh();
}

function button(n, x, y, w, h, funct){
  n.position(x, y);
  n.size(w, h);
  n.mousePressed(funct);
}
