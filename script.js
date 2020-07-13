//Importing various functions, events, variables, etc from the p5 library
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

//Sets variables to width and height of the provided window minus 15 pixels --> Will use as canvas width and height
let xCan = window.innerWidth-15;
let yCan = window.innerHeight-15;

//Declares the global variables but does not initialize
let can, paddle, p, balls, ppb;

//Variables key to the basic game mechanics
let game = false;
let type;
let score = 0;
let highscore;
let lives;

//Sets w to the pixel width of the window/12 with a maximum value of 75 pixels --> Used to dimension ping pong ball and paddle among others
let w = xCan/12;
if(w >= 75) w = 75;

//Sets the max velocity of the ping pong balls
let maxVel = 3;

//Sets the text size multiplier
let txt = .8;

//Alters scaling if the screen is small enough across to be a mobile device or close to full screen accordingly
if(xCan<400){
  maxVel = 2;
  txt = .5;
  w*=1.2;
}if(xCan > 600) txt = 1;

//Declaring more global variable that will become buttons and sliders
let survivalBtn, freeplayBtn, unlimitedBtn, menuBtn, playAgainBtn, pauseBtn, cheatsBtn;
let freqSlider, wSlider;

//Part of the automatic ping pong ball adding system found mainly in lines 89-92 and 264
//Every ping pong ball create has the millisecond it was created recorded to make sure another ball is not created within the same second
//The frequency is how often, in seconds, a new ping pong ball is added
let magicSec, firstMilli, another;
let freq = 8;


//This function is run once following initializating
function preload(){
  //Loads images to given variables
  paddle = loadImage('https://cdn.glitch.com/13200784-0c12-47b6-be44-1232a5975d42%2FpingPongPaddle.png?v=1594432657713');
  ppb = loadImage('https://cdn.glitch.com/13200784-0c12-47b6-be44-1232a5975d42%2Fppb.png?v=1594435876316');
  
  //Retrieves high score from local server if played on the device before --> mechanism found mainly in 164 and 225
  if(getItem("highscore") != null) highscore = getItem("highscore");
  else highscore = 0;
}

//This function is run once after preload is finished
function setup(){
  frameRate(90);
  refresh(); //Line 104
}

//This function is run infinitely many times
function draw(){
  if(game){
    updateScreen(); //Line 181
    //Updates score for survival by adding one as long as there's at least one ping pong ball in play
    if(type == "survival" && balls.length>0) score++;
    
    //Checks to see that the system clock aligns with either of the magic numbers
    //After a ball has been spawned, sets var another to true to prevent extra spawns
    if(second()%freq == magicSec && !another){ 
      addBall(); //Line 274
      another = true;
    }if(second()%freq == magicSec+1) another = false;
  }
}

function refresh(){
  //Object oriented --> The paddle, p, has a ton of variables specifically associated with it
  //width, height, mouseX pos, mouseY pos, top left x pos, top left y pos, bottom right x pos, bottom right y pos, max y pos --> all of the paddle
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
  
  //Sets up balls as a list that will contain a number of singular ping pong balls
  balls = [];
  
  //Creates a canvas that allows for images, drawing, text, ect
  can = createCanvas(xCan, yCan);
  
  //Sets the background to a pale blue
  colorMode(HSB);
  background(175, 5, 95);
  
  //Spawns title text in a teal-ish blue
  fill(175, 40, 80);
  stroke(175, 40, 80);
  textSize(50);
  text("Bounce!", xCan/2-88, yCan/2-100);
  
  //Creates buttons for the 3 game modes --> Survival, Freeplay, and Unlimited
  //In survival, the player has one life and is awarded points for simply staying alive
  survivalBtn = createButton("SURVIVAL");
  button(survivalBtn, xCan/2-88, yCan/2, 200, 50, survive);
  
  //In freeplay, the player has 3 lives, but is only awarded points for successfully hitting the ping pong balls
  freeplayBtn = createButton("FREEPLAY");
  button(freeplayBtn, xCan/2-88, yCan/2-70, 200, 50, freeplay);
  
  //In unlimited, the player has unlimited lives and is awarded points for successfully hitting the ping pong balls
  //Unlimited does not alter the high score as it would be highly unfair
  unlimitedBtn = createButton("UNLIMITED");
  button(unlimitedBtn, xCan/2-88, yCan/2+70, 200, 50, unlimited);
}

//Runs anytime the mouse is moved over the canvas, can
function mouseMoved(can){
  //Causes the cursor to disappear if it overlaps with the paddle
  //The player can only move the paddle up to half way up the screen
  if(mouseY>p.maxY && game) noCursor();
  else cursor(ARROW);
  
  updateP() //Line 171
}

//Runs whenever the screen is pressed on a mobile device
function touchStarted(){
  updateP(); //Line 171
}

//Runs whenever a finger is dragged on a mobile device
function touchMoved(){
  updateP(); //Line 171
}

//Updates the values for the location of the paddle to align with the location of the mouse (or finger if mobile)
function updateP(){
  p.mX = mouseX;  
  if(mouseY>p.maxY) p.mY = mouseY;
  p.x = p.mX - p.width/2;
  p.y = p.mY - p.height/2;
  p.x1 = p.x + p.width;
  p.y1 = p.y + p.height;
}

function updateScreen(){
  //Redraws the background to remove old images, texts, etc from previous frames
  background(175, 5, 95);
  
  //Updates the image of the paddle
  image(paddle, p.mX-p.width/2, p.mY-p.height/2, p.width, p.height);
  
  checkColl(); //Line 200
  
  //Updates score, high score, and lives text
  textSize(20*txt);
  text("Score: " +score, xCan/4+15, yCan-15);
  //The line below checks to make sure that the default values are true (to prevent cheating)
  //and that the game isn't unlimited lives before updating high score if needed
  if(type!="unlimited" && freq==8 && (p.height==w || (w>=75 && p.height==12)) && score>highscore) highscore = score;
  text("High Score (Legit): " +highscore, xCan/2+15, yCan-15);
  text("Lives: " +lives, 15, yCan-15);
}

function checkColl(){
  //Goes through each ping pong ball object that has been created
  for(const o of balls){ 
    updateX(o); //Line 225
    updateY(o); //Line 232
    //Updates the actual image of the ping pong ball
    image(ppb, o.x, o.y, o.r, o.r);
    
    //Basically creates collision boxes using the variables stored in the paddle and ping pong balls to see if any of them have collided
    if((o.y+o.r<=p.y1 && o.y>p.y-2*o.r) && (o.x>p.x+p.width/8 && o.x+o.r<p.x1)){
      if(o.yDelt>0){
        //Makes the ping pong "bounce" off the paddle
        o.yDelt=-o.yDelt;
        
        //Awards the user points for collision if playing freeplay or unlimited
        if(type == "freeplay" || type == "unlimited") score += balls.length*100;
        
        //To spice things up, causes the ping pong ball to bounce off at different extremes in the x direction depending on point of contact
        let xPCen = (p.x+p.width/8 + p.x1+p.width/8)/2;
        let xOCen = o.x + o.r/2;
        o.xDelt=Math.round(xOCen-xPCen)/8;
      }
    }
  }
}

function updateX(o){
    //Causes the ping pong ball to "bounce" off the side walls and update x
    if(o.x>=xCan-o.r || o.x<=0){
      o.xDelt=-o.xDelt;
    }o.x+=o.xDelt;
  }

function updateY(o){
  //Causes the ping pong ball to "bounce" off the ceiling
  if(o.y<=0 && o.yDelt<0) o.yDelt=-o.yDelt;
  
  //Factors in "gravity" and updates y
  o.y+=(o.yDelt*.5+o.yDelt*o.y*.03);
  
  //Subtracts a life if the ping pong falls to the bottom of the screen if lives are not inifinite
  if(o.y>=yCan-o.r && o.yDelt>0){
    if(lives!="infinite") lives--;
    if(lives==0) gameOver(); //Line 246
  }
}

function gameOver(){
  //Stops the screen and really all values from updating
  game = false;
  
  //Goes through the list of ping pong balls and deletes them
  for(const o of balls) balls.pop();
  balls.pop();
  
  //Removes the pause button and allows the user to see their cursor arrow again
  pauseBtn.remove();
  cursor(ARROW);
  
  //Generates a menu with navigation capability
  rect(xCan/2-135, yCan/2-115, 280, 260);
  
  menuBtn = createButton("MAIN MENU");
  button(menuBtn, xCan/2-88, yCan/2+70, 200,50, main); //Line INSERT main() LINE

  cheatsBtn = createButton("OPTIONS");
  button(cheatsBtn, xCan/2-88, yCan/2, 200,50, cheats); //Line INSERT cheats() LINE
  
  playAgainBtn = createButton("PLAY AGAIN");
  button(playAgainBtn, xCan/2-88, yCan/2-70, 200,50, again); //Line INSERT again() LINE
  
  //Saves the high score to the local server
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
