//reviewed
class Game
{
  constructor()
  {
    //used for JSON loading
    this.canvas = null;
    this.dataLoaded = false;
    this.myAssets = new AssetLoader();
    this.ws = null;
  }
    /**
  * initWorld
  * @desc Initialises game world
  */
  initWorld()
  {
    //websocket for multiplayer
    this.ws = new WebSocket("ws://localhost:8080/wstest");
    this.ws.onopen = function() {
     var message = {}
     message.type = "test"
     message.data = "hello"

     this.ws.send(JSON.stringify(message));
     this.messageHandler = new HandleMessage();

     this.ws.addEventListener('message', this.messageHandler.handle);     
   };
    //Music
    gameNamespace.BackgroundMusic = new Audio(gameNamespace.game.myAssets.data["Audio"]["BACKGROUNDMUSIC"]);
    //loop
    gameNamespace.BackgroundMusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
    }, false);
    //gameNamespace.BackgroundMusic.play();                   /////////////////////////////////uncomment later //////////////////////////////////////
    //sounds
    gameNamespace.ExplosionSound = new Audio(gameNamespace.game.myAssets.data["Audio"]["EXPLOSIONSOUND"]);
    gameNamespace.MoveSound = new Audio(gameNamespace.game.myAssets.data["Audio"]["MOVESOUND"]);
    gameNamespace.posOne = 0;
    gameNamespace.posTwo = -880;
    //enum for different game states
    gameNamespace.GamestateEnum = {
                                    MAIN:0,
                                    GAME:1,
                                    OPTIONS:2,
                                    TUTORIAL:3,
                                    HIGHSCORE:4,
                                    EXIT:5,
                                    DIFFICULTY:6,
                                    MULTIPLAYER:7
                                  }
    //3 player positions on screen
    gameNamespace.PlayerPosEnum = {
                                  LEFT: 50,
                                  MID : 203,
                                  RIGHT : 350
    }
    //we start at main
    gameNamespace.gamestate = gameNamespace.GamestateEnum.MAIN;
    //context
    gameNamespace.ctx;
    //initialise canvas
    this.initCanvas();
    console.log("Initialising Game World");
    //canvas touch events used for swipe detection
    gameNamespace.canvas.addEventListener("touchstart", gameNamespace.game.canvasStart);
    gameNamespace.canvas.addEventListener("touchmove", gameNamespace.game.canvasMove);
    gameNamespace.canvas.addEventListener("touchend", gameNamespace.game.canvasEnd);

    //creates both background divs
    this.createDiv("<img src=" + gameNamespace.game.myAssets.data["Images"]["BACKGROUNDIMG"] + ">","backgroundOneDiv",0,0,false);
    this.createDiv("<img src=" + gameNamespace.game.myAssets.data["Images"]["BACKGROUNDIMG"] + ">","backgroundTwoDiv",0,0,false);
    //Text Divs Main
    this.createDiv('Space Runner',"MAIN",110,100,true);
    this.createDiv("PLAY","GAME",110,300,true);
    this.createDiv("MULTIPLAYER", "MULTIPLAYER", 110, 350, true);
    this.createDiv("OPTIONS","OPTIONS",110,400,true);
    this.createDiv("TUTORIAL","TUTORIAL",110,450,true);
    this.createDiv("HIGHSCORE","HIGHSCORE",110,500,true);
    this.createDiv("EXIT","EXIT",110,550,true);
    //swipe detection
    gameNamespace.startingPosX = -100;
    gameNamespace.startingPosY = -100;

    gameNamespace.endingPosX = -100;
    gameNamespace.endingPosY = -100;

    gameNamespace.startingTime = 0;
    gameNamespace.endingTime = 0;

    gameNamespace.swipeLength = 0;
    //player movement
    gameNamespace.movingLeft = false;
    gameNamespace.movingRight = false;
    gameNamespace.moveSpeed = 10;
    //play
    gameNamespace.currentPosition = gameNamespace.PlayerPosEnum.MID;
    gameNamespace.score = 0;
    //mid
    gameNamespace.currentPositionPixels = 203;
    gameNamespace.asteroidPosY = [-50,-350,-650];
    gameNamespace.asteroidMoveSpeed = 1;
    gameNamespace.currentAsteroidMoveSpeed = 1;
    gameNamespace.explode = false;
    gameNamespace.alive = false;
    //animating explosion
    gameNamespace.startAnimation;
    gameNamespace.stopAnimation;
    //astroid initial spawn
    gameNamespace.asteroidRotation = [gameNamespace.game.RandomPos(),gameNamespace.game.RandomPos(),gameNamespace.game.RandomPos()];
    this.createDiv("<img src=" + gameNamespace.game.myAssets.data["Images"]["ASTEROIDIMG"] + ">", "ASTEROIDONE",gameNamespace.game.RandomPos(),-50,false);
    this.createDiv("<img src=" + gameNamespace.game.myAssets.data["Images"]["ASTEROIDIMG"] + ">", "ASTEROIDTWO",gameNamespace.game.RandomPos(),-250,false);
    this.createDiv("<img src=" + gameNamespace.game.myAssets.data["Images"]["ASTEROIDIMG"] + ">", "ASTEROIDTHREE",gameNamespace.game.RandomPos(),-450,false);
    this.createDiv("<img src=" + gameNamespace.game.myAssets.data["Images"]["OPTIONSSYMBOLIMG"] + ">","optionsSymbol",440,10,true);
    //explosion images
    gameNamespace.listOfExplosions = ["<img src=" + gameNamespace.game.myAssets.data["Images"]["EXPLOSIONIMGONE"] + ">","<img src=" + gameNamespace.game.myAssets.data["Images"]["EXPLOSIONIMGTWO"] + ">",
                                      "<img src=" + gameNamespace.game.myAssets.data["Images"]["EXPLOSIONIMGTHREE"] + ">","<img src=" + gameNamespace.game.myAssets.data["Images"]["EXPLOSIONIMGFOUR"] + ">",
                                      "<img src=" + gameNamespace.game.myAssets.data["Images"]["EXPLOSIONIMGFIVE"] + ">","<img src=" + gameNamespace.game.myAssets.data["Images"]["EXPLOSIONIMGSIX"] + ">",
                                      "<img src=" + gameNamespace.game.myAssets.data["Images"]["EXPLOSIONIMGSEVEN"] + ">","<img src=" + gameNamespace.game.myAssets.data["Images"]["EXPLOSIONIMGEIGHT"] + ">",
                                      "<img src=" + gameNamespace.game.myAssets.data["Images"]["EXPLOSIONIMGNINE"] + ">","<img src=" + gameNamespace.game.myAssets.data["Images"]["EXPLOSIONIMGTEN"] + ">"];
    gameNamespace.explosionCurrentIndex = 0;
    this.createDiv("<img src=" + gameNamespace.game.myAssets.data["Images"]["PLAYERIMG"] + ">","PLAYER",gameNamespace.PlayerPosEnum.MID,720,true);
    this.createDiv("Score: 0", "PLAYSCORE",10,10,false);
    this.createDiv(gameNamespace.listOfExplosions[0],"EXPLOSION",-250,-250,false);
    gameNamespace.asteroids = ["ASTEROIDONE", "ASTEROIDTWO", "ASTEROIDTHREE"];
    for(var i = 0; i <3; i++)
    {
      document.getElementById(gameNamespace.asteroids[i]).style.width = 88 + "px";
      document.getElementById(gameNamespace.asteroids[i]).style.height = 96 + "px";
    }
    document.getElementById("PLAYER").style.width = 88 + "px";
    document.getElementById("PLAYER").style.height = 66 + "px";

    this.createDiv("GAME OVER", "GAMEOVER", 125,250,false);
    this.createDiv("Restart", "GAMERESTART",125,450,true);
    this.createDiv("Main Menu", "GAMEMAINMENU",125,500,true);
    //options
    this.createDiv("PLAY","optionsResume",110,450,true);
    this.createDiv("MAIN MENU","optionsMain",110,550,true);
    this.createDiv("SOUND","optionsSound",105,250,true);
    this.createDiv("MUSIC","optionsMusic",305,250,true);
    //difficulty screen
    this.createDiv("EASY","difficultyEasy",110,200,true);
    this.createDiv("MEDIUM","difficultyMedium",110,300,true);
    this.createDiv("HARD","difficultyHard",110,400,true);
    //HIGHSCORE
    gameNamespace.currentHighest = "";
    gameNamespace.currentHighestDifficulty = "";
    this.createDiv("Current Best","highscoreCurrent",110,100,false);
    this.createDiv(gameNamespace.currentHighest,"highscoreOutputN",110,250,false);
    this.createDiv(gameNamespace.currentHighestDifficulty,"highscoreOutputD",110,300,false);
    this.createDiv("MAIN MENU", "highscoreMainMenu", 110,400,true);
    //tutorial
    gameNamespace.tutorialMessageNumber = 0;
    this.createDiv("Swipe left to move Left", "tutorialMessage",85,150,false);
    this.createDiv("PLAY", "tutorialPlay",200,450,true);
    //MULTIPLAYER
    this.createDiv("MAIN MENU", "multiplayerMainMenu", 110, 500, true);
    this.createDiv("CONNECTING", "multiplayerMessage", 110, 350, false);
    //list to hold text divs on main menu
    //powerups slow time avoidcollision bullet double points
    this.createDiv("")
    gameNamespace.difficultyScreenDivs = ["difficultyEasy","difficultyMedium","difficultyHard"];
    gameNamespace.mainMenuTextDivs = ["MAIN","GAME","MULTIPLAYER","OPTIONS","TUTORIAL","HIGHSCORE","EXIT"];
    gameNamespace.playGameDivs = ["optionsSymbol", "PLAYER", "PLAYSCORE", "ASTEROIDONE", "ASTEROIDTWO", "ASTEROIDTHREE","EXPLOSION"];
    gameNamespace.optionisDivs = ["optionsMain","optionsResume","optionsSound","optionsMusic"];
    gameNamespace.gameOverDivs = ["GAMEOVER","GAMERESTART","GAMEMAINMENU"];
    gameNamespace.tutorialDivs =["tutorialMessage"];
    gameNamespace.highscoreDivs = ["highscoreCurrent","highscoreOutputN","highscoreOutputD","highscoreMainMenu"];
    gameNamespace.multiplayerTextDivs = ["multiplayerMainMenu", "multiplayerMessage"];
    //initialise visibility
    gameNamespace.flipOnce = false;
    gameNamespace.game.flipVisibility(gameNamespace.playGameDivs, false);
    gameNamespace.game.flipVisibility(gameNamespace.optionisDivs, false);
    gameNamespace.game.flipVisibility(gameNamespace.gameOverDivs, false);
    gameNamespace.game.flipVisibility(gameNamespace.difficultyScreenDivs, false);
    gameNamespace.game.flipVisibility(gameNamespace.tutorialDivs, false);
    gameNamespace.game.flipVisibility(gameNamespace.highscoreDivs,false);
    gameNamespace.game.flipVisibility(gameNamespace.multiplayerTextDivs,false);
    //font and font size of Divs main
    gameNamespace.game.divFontColourSize("MAIN","impact","white","48");
    gameNamespace.game.divFontColourSize("GAME","impact","white","38");
    gameNamespace.game.divFontColourSize("MULTIPLAYER", "impact", "white", "38");
    gameNamespace.game.divFontColourSize("OPTIONS","impact","white","38");
    gameNamespace.game.divFontColourSize("TUTORIAL","impact","white","38");
    gameNamespace.game.divFontColourSize("HIGHSCORE","impact","white","38");
    gameNamespace.game.divFontColourSize("EXIT","impact","white","38");
    //options
    gameNamespace.game.divFontColourSize("optionsMain","impact","white","38");
    gameNamespace.game.divFontColourSize("optionsResume","impact","white","38");
    gameNamespace.game.divFontColourSize("optionsSound","impact","green","38");
    gameNamespace.game.divFontColourSize("optionsMusic","impact","green","38");
    //player
    gameNamespace.game.divFontColourSize("PLAYSCORE","impact","white","38");
    gameNamespace.game.divFontColourSize("GAMEOVER","impact","white","52");
    gameNamespace.game.divFontColourSize("GAMERESTART","impact","white","38");
    gameNamespace.game.divFontColourSize("GAMEMAINMENU","impact","white","38");
    gameNamespace.game.update();
    //difficulty
    gameNamespace.game.divFontColourSize("difficultyEasy","impact","green","38");
    gameNamespace.game.divFontColourSize("difficultyMedium","impact","white","38");
    gameNamespace.game.divFontColourSize("difficultyHard","impact","white","38");
    //highscore
    gameNamespace.game.divFontColourSize("highscoreCurrent","impact","white","38");
    gameNamespace.game.divFontColourSize("highscoreOutputN","impact","white","38");
    gameNamespace.game.divFontColourSize("highscoreOutputD","impact","white","38");
    gameNamespace.game.divFontColourSize("highscoreMainMenu","impact","white","38");
    //tutorial
    gameNamespace.game.divFontColourSize("tutorialMessage", "impact", "white", "38");
    gameNamespace.game.divFontColourSize("tutorialPlay", "impact", "white", "38");
    document.getElementById("tutorialPlay").style.visibility = "hidden";
    //multiplayer
    gameNamespace.game.divFontColourSize("multiplayerMainMenu", "impact", "white", "38");
    gameNamespace.game.divFontColourSize("multiplayerMessage", "impact", "white", "38");
  //  gameNamespace.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
    window.addEventListener("keydown", function(e)
      {
          // Space and arrow keys
          if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1)
          {
            //makes it so the keys defined above ignore their default command
            e.preventDefault();
          }
      }, false);
  }
 /**
 * update
 * @desc calls draw and itself recursively also updates animations
 */
 update()
 {
   //resets background
   if(gameNamespace.posOne > 880)
   {
     gameNamespace.posOne = 0-880;
   }
   if(gameNamespace.posTwo > 880)
   {
     gameNamespace.posTwo = -880;
   }
   //incrementing background
   gameNamespace.posOne++;
   document.getElementById("backgroundOneDiv").style.top = gameNamespace.posOne + 'px';

   gameNamespace.posTwo++;
   document.getElementById("backgroundTwoDiv").style.top = gameNamespace.posTwo + 'px';
   gameNamespace.game.draw();
   //update menus
   gameNamespace.game.UpdateMenus();
   //if in tutorial
   if(gameNamespace.gamestate === 3)
   {
     if(gameNamespace.alive === false)
     {
        gameNamespace.game.flipVisibility(gameNamespace.gameOverDivs);
     }
     if(gameNamespace.movingLeft === true)
     {
       if(gameNamespace.tutorialMessageNumber === 0)
       {
         document.getElementById("tutorialMessage").style.left = 60 + "px";
         document.getElementById("tutorialMessage").innerHTML = "Swipe right to move right";
         gameNamespace.tutorialMessageNumber =1;
       }
          //if were already left
         if(gameNamespace.currentPosition === gameNamespace.PlayerPosEnum.LEFT)
         {
           gameNamespace.movingLeft = false;
         }
         //if were mid
         if(gameNamespace.currentPosition === gameNamespace.PlayerPosEnum.MID)
         {
           //move from mid to left
           gameNamespace.game.MoveLeft(gameNamespace.PlayerPosEnum.MID,gameNamespace.PlayerPosEnum.LEFT);
         }
         if(gameNamespace.currentPosition === gameNamespace.PlayerPosEnum.RIGHT)
         {
           //move from right to mid
           gameNamespace.game.MoveLeft(gameNamespace.PlayerPosEnum.RIGHT,gameNamespace.PlayerPosEnum.MID);
         }
     }
     //if were moving right
     if(gameNamespace.movingRight === true)
     {
       if(gameNamespace.tutorialMessageNumber === 1)
       {
        document.getElementById("tutorialMessage").style.left = 120 + "px";
         document.getElementById("tutorialMessage").innerHTML = "Dodge Asteroids";
         gameNamespace.tutorialMessageNumber =2;
       }
          //if were left
         if(gameNamespace.currentPosition === gameNamespace.PlayerPosEnum.LEFT)
         {
           //move from left to MID
           gameNamespace.game.MoveRight(gameNamespace.PlayerPosEnum.LEFT,gameNamespace.PlayerPosEnum.MID);
         }
         //if were mid
         if(gameNamespace.currentPosition === gameNamespace.PlayerPosEnum.MID)
         {
           //move from mid to Right
           gameNamespace.game.MoveRight(gameNamespace.PlayerPosEnum.MID,gameNamespace.PlayerPosEnum.RIGHT);
         }
         //if were already right
         if(gameNamespace.currentPosition === gameNamespace.PlayerPosEnum.RIGHT)
         {
           gameNamespace.movingRight = false;
         }
     }
     if(gameNamespace.tutorialMessageNumber === 2)
     {
        document.getElementById("tutorialPlay").style.visibility = "visible";
     }
   }
   //if were in the play gamestate
   if(gameNamespace.gamestate === 1)
   {
     //shielded
     // document.getElementById("PLAYER").style.opacity = "0.5";

     //scalable difficulty
     if(gameNamespace.score > 50)
     {
       if(gameNamespace.asteroidMoveSpeed < gameNamespace.currentAsteroidMoveSpeed + 1)
       {
         gameNamespace.asteroidMoveSpeed += 0.1;
       }
     }
     if(gameNamespace.score > 100)
     {
       if(gameNamespace.asteroidMoveSpeed < gameNamespace.currentAsteroidMoveSpeed + 2)
       {
         gameNamespace.asteroidMoveSpeed += 0.1;
       }
     }
     if(gameNamespace.score > 150)
     {
       if(gameNamespace.asteroidMoveSpeed < gameNamespace.currentAsteroidMoveSpeed + 3)
       {
         gameNamespace.asteroidMoveSpeed += 0.1;
       }
     }
     if(gameNamespace.score <= 50)
     {
       gameNamespace.asteroidMoveSpeed = gameNamespace.currentAsteroidMoveSpeed;
     }

     if(gameNamespace.alive === false)
     {
       gameNamespace.game.flipVisibility(gameNamespace.gameOverDivs);
     }
     if(gameNamespace.explode === true)
     {
       document.getElementById("optionsSymbol").style.visibility = "hidden";
       if(parseInt(gameNamespace.score) > gameNamespace.currentHighest)
       {
         gameNamespace.currentHighest = parseInt(gameNamespace.score);
         document.getElementById("highscoreOutputN").innerHTML = "Score: " + parseInt(gameNamespace.score);
         if(document.getElementById("difficultyEasy").style.color === "green")
         {
           document.getElementById("highscoreOutputD").innerHTML = "Difficulty: EASY";
           gameNamespace.currentHighestDifficulty = "EASY";
         }
         if(document.getElementById("difficultyMedium").style.color === "green")
         {
            document.getElementById("highscoreOutputD").innerHTML ="Difficulty: Medium";
            gameNamespace.currentHighestDifficulty = "MEDIUM";
         }
         if(document.getElementById("difficultyHard").style.color === "green")
         {
           document.getElementById("highscoreOutputD").innerHTML ="Difficulty: HARD";
           gameNamespace.currentHighestDifficulty = "HARD";
         }
       }
       if(document.getElementById("EXPLOSION").style.left === -250 + 'px')
       {
         if(document.getElementById("optionsSound").style.color === "green")
         {
            gameNamespace.ExplosionSound.play();
         }
         gameNamespace.startAnimation = new Date();
       }
       gameNamespace.stopAnimation = new Date();
       var temp = gameNamespace.currentPosition + 'px';
       document.getElementById("EXPLOSION").style.left = temp;
       document.getElementById("EXPLOSION").style.top = 720 + 'px';
       if(gameNamespace.stopAnimation - gameNamespace.startAnimation > 40)
       {
         gameNamespace.startAnimation = new Date();
         gameNamespace.explosionCurrentIndex++;
       }
       document.getElementById("EXPLOSION").innerHTML = gameNamespace.listOfExplosions[gameNamespace.explosionCurrentIndex];
       if(gameNamespace.explosionCurrentIndex >= 10)
       {
         document.getElementById("EXPLOSION").style.left = -250 + 'px';
         document.getElementById("EXPLOSION").style.top = -250 + 'px';
         gameNamespace.explosionCurrentIndex = 0;
         gameNamespace.explode = false;
       }

     }
     gameNamespace.game.CheckCollisions();
     gameNamespace.game.UpdateAsteroids();
     if(gameNamespace.alive === true)
        gameNamespace.score +=0.1;
     document.getElementById("PLAYSCORE").innerHTML = "Score: " + parseInt(gameNamespace.score);
    // console.log(document.getElementById("PLAYER").width());
     //if were moving left
     if(gameNamespace.movingLeft === true)
     {
          //if were already left
         if(gameNamespace.currentPosition === gameNamespace.PlayerPosEnum.LEFT)
         {
           gameNamespace.movingLeft = false;
         }
         //if were mid
         if(gameNamespace.currentPosition === gameNamespace.PlayerPosEnum.MID)
         {
           //move from mid to left
           gameNamespace.game.MoveLeft(gameNamespace.PlayerPosEnum.MID,gameNamespace.PlayerPosEnum.LEFT);
         }
         if(gameNamespace.currentPosition === gameNamespace.PlayerPosEnum.RIGHT)
         {
           //move from right to mid
           gameNamespace.game.MoveLeft(gameNamespace.PlayerPosEnum.RIGHT,gameNamespace.PlayerPosEnum.MID);
         }
     }
     //if were moving right
     if(gameNamespace.movingRight === true)
     {
          //if were left
         if(gameNamespace.currentPosition === gameNamespace.PlayerPosEnum.LEFT)
         {
           //move from left to MID
           gameNamespace.game.MoveRight(gameNamespace.PlayerPosEnum.LEFT,gameNamespace.PlayerPosEnum.MID);
         }
         //if were mid
         if(gameNamespace.currentPosition === gameNamespace.PlayerPosEnum.MID)
         {
           //move from mid to Right
           gameNamespace.game.MoveRight(gameNamespace.PlayerPosEnum.MID,gameNamespace.PlayerPosEnum.RIGHT);
         }
         //if were already right
         if(gameNamespace.currentPosition === gameNamespace.PlayerPosEnum.RIGHT)
         {
           gameNamespace.movingRight = false;
         }
   }
 }
   //recursively calls update of game : this method
   window.requestAnimationFrame(gameNamespace.game.update);
 }
 Reset()
 {
  document.getElementById("optionsSymbol").style.visibility = "visible";
  document.getElementById("optionsResume").innerHTML = "PLAY";
  gameNamespace.alive = false;
  gameNamespace.explode = false;
  gameNamespace.score = 0;
  gameNamespace.asteroidMoveSpeed = 1;
  document.getElementById("PLAYER").style.left = 203 + 'px';
  gameNamespace.currentPosition = gameNamespace.PlayerPosEnum.MID;
  gameNamespace.currentPositionPixels = 203;
  gameNamespace.game.SpawnAsteroid(gameNamespace.asteroids[0],0,true);
  gameNamespace.game.SpawnAsteroid(gameNamespace.asteroids[1],1,true);
  gameNamespace.game.SpawnAsteroid(gameNamespace.asteroids[2],2,true);
 }
 UpdateAsteroids()
 {
   for(var i = 0; i < gameNamespace.asteroids.length; i++)
   {
      gameNamespace.asteroidRotation[i] += 1;
      gameNamespace.asteroidPosY[i] += gameNamespace.asteroidMoveSpeed;
      document.getElementById(gameNamespace.asteroids[i]).style.transform = "rotate(" + gameNamespace.asteroidRotation[i] + "deg)";
      document.getElementById(gameNamespace.asteroids[i]).style.top = gameNamespace.asteroidPosY[i] + "px";
      if(gameNamespace.asteroidPosY[i] > 900)
      {
          gameNamespace.game.SpawnAsteroid(gameNamespace.asteroids[i],i,false);
      }
   }


 }
 CheckCollisions()
 {
   for(var i = 0; i < 3; i++)
   {
     var temp = gameNamespace.currentPosition + 'px';
     if(temp === document.getElementById(gameNamespace.asteroids[i]).style.left)
     {
       if(gameNamespace.asteroidPosY[i] >= 650 && gameNamespace.asteroidPosY[i] < 761)
       {
          if(gameNamespace.alive === true)
          {
            gameNamespace.alive = false;
           document.getElementById("PLAYER").style.visibility = "hidden";
           gameNamespace.explode = true;
          }
       }
     }
   }
 }

 SpawnAsteroid(id, index, fromStart)
 {
   gameNamespace.asteroidRotation[index] = gameNamespace.game.RandomPos();
   document.getElementById(id).style.visibility = "hidden";
   if(fromStart === false)
    gameNamespace.asteroidPosY[index] = -50;
  else
  {
    gameNamespace.asteroidPosY[0] = -50;
    gameNamespace.asteroidPosY[1] = -350;
    gameNamespace.asteroidPosY[2] = -650;
  }
   document.getElementById(id).style.left = gameNamespace.game.RandomPos() + "px";
   document.getElementById(id).style.visibility = "visible";
 }
 /**
 * draw
 * @desc draws the sprites
 */

 draw()
 {
   gameNamespace.ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
 }
 /**
* initCanvas
* @desc initialises the canvas
*/
RandomPos()
{
  var pos = Math.floor(Math.random()*3)
  if(pos === 0)
    return 50;
  if(pos === 1)
    return 203;
  if(pos === 2)
    return 350;
}
MoveRight(currentSpot, desiredSpot)
{
  if(gameNamespace.movingRight === true)
  {
    //only called once per swipe
    if(gameNamespace.moveSpeed === 10)
    {
      if(document.getElementById("optionsSound").style.color === "green")
      {
        gameNamespace.MoveSound.pause();
        gameNamespace.MoveSound.play();
      }
     document.getElementById("PLAYER").innerHTML = "<img src=" + gameNamespace.game.myAssets.data["Images"]["PLAYERRIGHTIMG"] + ">";
    }
    //move left by x pixels
     document.getElementById("PLAYER").style.left = currentSpot + gameNamespace.moveSpeed + 'px';
     gameNamespace.moveSpeed += 10;
     gameNamespace.currentPositionPixels+=10;
     if(gameNamespace.currentPositionPixels > desiredSpot)
     {
       gameNamespace.currentPositionPixels = desiredSpot;
     }
     if(gameNamespace.currentPositionPixels === desiredSpot)
     {
       document.getElementById("PLAYER").innerHTML = "<img src=" + gameNamespace.game.myAssets.data["Images"]["PLAYERIMG"] + ">";
       document.getElementById("PLAYER").style.left = desiredSpot;
       gameNamespace.currentPosition = desiredSpot;
       gameNamespace.moveSpeed = 10;
       gameNamespace.movingRight = false;
     }
   }
}
MoveLeft(currentSpot,desiredSpot)
{
  if(gameNamespace.movingLeft === true)
  {
    //only called once per swipe
    if(gameNamespace.moveSpeed === 10)
    {
      if(document.getElementById("optionsSound").style.color === "green")
      {
        gameNamespace.MoveSound.pause();
        gameNamespace.MoveSound.play();
      }
     document.getElementById("PLAYER").innerHTML = "<img src=" + gameNamespace.game.myAssets.data["Images"]["PLAYERLEFTIMG"] + ">";
    }
    //move left by x pixels
     document.getElementById("PLAYER").style.left = currentSpot - gameNamespace.moveSpeed + 'px';
     gameNamespace.moveSpeed += 10;
     gameNamespace.currentPositionPixels-=10;
     if(gameNamespace.currentPositionPixels < desiredSpot)
     {
       gameNamespace.currentPositionPixels = desiredSpot;
     }
     if(gameNamespace.currentPositionPixels === desiredSpot)
     {
       document.getElementById("PLAYER").innerHTML = "<img src=" + gameNamespace.game.myAssets.data["Images"]["PLAYERIMG"] + ">";
       gameNamespace.currentPosition = desiredSpot;
        document.getElementById("PLAYER").style.left = desiredSpot;
       gameNamespace.moveSpeed = 10;
       gameNamespace.movingLeft = false;
     }
   }

}
initCanvas()
{
  gameNamespace.canvas = document.createElement("canvas");
  gameNamespace.canvas.id = "canvas";
  gameNamespace.canvas.width = window.innerWidth;
  gameNamespace.canvas.height = window.innerHeight;
  document.body.appendChild(gameNamespace.canvas);
  gameNamespace.ctx = gameNamespace.canvas.getContext("2d");

}
//flips the passed in divs visibilty
flipVisibility(divsToFlip, flipBool)
{
  for(var i = 0; i < divsToFlip.length; i++)
  {
    if(document.getElementById(divsToFlip[i]).style.visibility = "visible" && flipBool === false)
    {
      document.getElementById(divsToFlip[i]).style.visibility = "hidden";
    }
    else {
      document.getElementById(divsToFlip[i]).style.visibility = "visible";
    }

  }
}
//creates a div passing in the html the id its position and whether its clickable
createDiv(divType,divID,divPosX,divPosY,clickable)
{
  var div = document.createElement("div");
  div.innerHTML = divType;
  div.id = divID;
  div.style.left=divPosX + 'px';
  div.style.top=divPosY+ 'px';
  div.style.position='absolute';
  if(clickable === true)
  {
    div.addEventListener("touchstart", gameNamespace.game.onTouchStart.bind(null,divID));
  }
  else {
     div.style.pointerEvents = "none";
  }
  document.body.appendChild(div);
}
//changes font colour and size useful for clicking on divs
divFontColourSize(name,font,colour,size)
{
  document.getElementById(name).style.color = colour;
  document.getElementById(name).style.font = size + "px " + font;
}
//currently just prevents the screen from moving
canvasStart(e)
{
  e.preventDefault();
  if(gameNamespace.gamestate === 1 || gameNamespace.gamestate === 3)
  {
    var touches = e.touches;
    gameNamespace.startingPosX = touches[0].clientX;
    gameNamespace.startingPosY = touches[0].clientY;
    gameNamespace.startingTime = new Date();
  }
}
canvasMove(e)
{
  if(gameNamespace.gamestate === 1|| gameNamespace.gamestate === 3)
  {
    e.preventDefault();
    var touches = e.touches;
    gameNamespace.endingPosX = touches[0].clientX;
    gameNamespace.endingPosY = touches[0].clientY;
  }
}
canvasEnd(e)
{
  e.preventDefault();
  if((gameNamespace.gamestate === 1 || gameNamespace.gamestate === 3) &&gameNamespace.endingPosX !== -100)
  {
    gameNamespace.endingTime = new Date();
    gameNamespace.swipeLength = Math.sqrt((
                                         (gameNamespace.endingPosX - gameNamespace.startingPosX)
                                         *(gameNamespace.endingPosX - gameNamespace.startingPosX)
                                         ) + ((gameNamespace.endingPosY - gameNamespace.startingPosY)
                                         *(gameNamespace.endingPosY - gameNamespace.startingPosY)));
    if(gameNamespace.swipeLength > 120)
    {
      if(gameNamespace.endingTime - gameNamespace.startingTime < 150)
      {
        if(gameNamespace.startingPosX < gameNamespace.endingPosX)
        {
          if(document.getElementById("PLAYER").style.visibility === "visible")
          {
           gameNamespace.movingRight = true;
          }
        }
        if(gameNamespace.startingPosX > gameNamespace.endingPosX)
        {
          if(document.getElementById("PLAYER").style.visibility === "visible")
          {

           gameNamespace.movingLeft = true;
          }
        }
      }
    }
  }
}
/**
* ontouchstart
* @desc prints the starting position also saves that position and the time of the touch
*/
UpdateMenus()
{
  //main
 if(gameNamespace.gamestate === 0)
 {
   if(gameNamespace.flipOnce === false)
   {
     gameNamespace.game.Reset();
     gameNamespace.flipOnce = true;
     gameNamespace.game.flipVisibility(gameNamespace.mainMenuTextDivs,true);
     gameNamespace.game.flipVisibility(gameNamespace.playGameDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.optionisDivs, false);
     gameNamespace.game.flipVisibility(gameNamespace.gameOverDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.difficultyScreenDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.highscoreDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.tutorialDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.multiplayerTextDivs,false);
   }
 }
 //play
 if(gameNamespace.gamestate === 1)
 {
   if(gameNamespace.flipOnce === false)
   {
     gameNamespace.alive = true;
     gameNamespace.flipOnce = true;
     document.getElementById("optionsResume").innerHTML = "RESUME";
     gameNamespace.game.flipVisibility(gameNamespace.mainMenuTextDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.playGameDivs,true);
     gameNamespace.game.flipVisibility(gameNamespace.optionisDivs, false);
     gameNamespace.game.flipVisibility(gameNamespace.gameOverDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.difficultyScreenDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.highscoreDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.tutorialDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.multiplayerTextDivs,false);
   }
 }
 //options
 if(gameNamespace.gamestate === 2)
 {
   if(gameNamespace.flipOnce === false)
   {
     gameNamespace.flipOnce = true;
     gameNamespace.game.flipVisibility(gameNamespace.mainMenuTextDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.playGameDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.optionisDivs, true);
     gameNamespace.game.flipVisibility(gameNamespace.gameOverDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.difficultyScreenDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.highscoreDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.tutorialDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.multiplayerTextDivs,false);
   }
 }
 //tutorial
 if(gameNamespace.gamestate === 3)
 {
   if(gameNamespace.flipOnce === false)
   {
      gameNamespace.alive = true;
     gameNamespace.flipOnce = true;
     gameNamespace.game.flipVisibility(gameNamespace.mainMenuTextDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.playGameDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.optionisDivs, false);
     gameNamespace.game.flipVisibility(gameNamespace.gameOverDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.difficultyScreenDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.highscoreDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.tutorialDivs,true);
     gameNamespace.game.flipVisibility(gameNamespace.multiplayerTextDivs,false);
     document.getElementById("PLAYER").style.visibility = "visible";
   }
 }
 //highscore
 if(gameNamespace.gamestate === 4)
 {
   if(gameNamespace.flipOnce === false)
   {
     gameNamespace.flipOnce = true;
     gameNamespace.game.flipVisibility(gameNamespace.mainMenuTextDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.playGameDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.optionisDivs, false);
     gameNamespace.game.flipVisibility(gameNamespace.gameOverDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.difficultyScreenDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.highscoreDivs,true);
     gameNamespace.game.flipVisibility(gameNamespace.tutorialDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.multiplayerTextDivs,false);
   }
 }
 //difficulty
 if(gameNamespace.gamestate === 6)
 {
   if(gameNamespace.flipOnce === false)
   {
     gameNamespace.flipOnce = true;
     gameNamespace.game.flipVisibility(gameNamespace.multiplayerTextDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.mainMenuTextDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.playGameDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.optionisDivs, false);
     gameNamespace.game.flipVisibility(gameNamespace.gameOverDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.difficultyScreenDivs,true);
     gameNamespace.game.flipVisibility(gameNamespace.highscoreDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.tutorialDivs,false);
   }
 }
 //MULTIPLAYER
 if(gameNamespace.gamestate === 7)
 {
   if(gameNamespace.flipOnce === false)
   {
     gameNamespace.game.Reset();
     gameNamespace.flipOnce = true;
     gameNamespace.game.flipVisibility(gameNamespace.multiplayerTextDivs,true);
     gameNamespace.game.flipVisibility(gameNamespace.mainMenuTextDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.playGameDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.optionisDivs, false);
     gameNamespace.game.flipVisibility(gameNamespace.gameOverDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.difficultyScreenDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.highscoreDivs,false);
     gameNamespace.game.flipVisibility(gameNamespace.tutorialDivs,false);
   }
 }
}
onTouchStart(id,e)
{
    e.preventDefault();
    gameNamespace.flipOnce = false;
    var touches = e.touches;
    //mainMenu
    if("GAME" === id)
    {
      gameNamespace.gamestate = gameNamespace.GamestateEnum.DIFFICULTY;
    }
    if("OPTIONS" === id)
    {
      gameNamespace.gamestate = gameNamespace.GamestateEnum.OPTIONS;
    }
    if("tutorialPlay" === id)
    {
      gameNamespace.tutorialMessageNumber = 0;
      document.getElementById("tutorialMessage").style.left = 85 + "px";
      document.getElementById("tutorialMessage").innerHTML = "Swipe left to move Left";
      document.getElementById("tutorialPlay").style.visibility = "hidden";
      gameNamespace.gamestate = gameNamespace.GamestateEnum.DIFFICULTY;
    }
    if("TUTORIAL" === id)
    {
      gameNamespace.gamestate = gameNamespace.GamestateEnum.TUTORIAL;
    }
    if("MULTIPLAYER" === id)
    {
      gameNamespace.gamestate = gameNamespace.GamestateEnum.MULTIPLAYER;
    }
    if("HIGHSCORE" === id)
    {
      if(gameNamespace.currentHighestDifficulty === "EASY")
      {
        document.getElementById("highscoreOutputD").style.color = "green";
      }
      if(gameNamespace.currentHighestDifficulty === "MEDIUM")
      {
        document.getElementById("highscoreOutputD").style.color = "yellow";
      }
      if(gameNamespace.currentHighestDifficulty === "HARD")
      {
        document.getElementById("highscoreOutputD").style.color = "red";
      }
      gameNamespace.gamestate = gameNamespace.GamestateEnum.HIGHSCORE;
    }
    if("highscoreMainMenu" === id)
    {
      gameNamespace.gamestate = gameNamespace.GamestateEnum.MAIN;
    }
    if("EXIT" === id)
    {
      gameNamespace.gamestate = gameNamespace.GamestateEnum.EXIT;
    }
    //playscreen
    if("optionsSymbol" === id)
    {
      gameNamespace.gamestate = gameNamespace.GamestateEnum.OPTIONS;
    }
    if("optionsMain" === id || "GAMEMAINMENU" === id || "multiplayerMainMenu" === id)
    {
      gameNamespace.gamestate = gameNamespace.GamestateEnum.MAIN;
    }
    if("optionsResume" === id)
    {
      gameNamespace.gamestate = gameNamespace.GamestateEnum.GAME;
    }
    if("optionsSound" === id)
    {
        if(document.getElementById("optionsSound").style.color === "green")
        {
          document.getElementById("optionsSound").style.color = "red";
        }
        else {
          document.getElementById("optionsSound").style.color = "green";
        }
    }
    if("optionsMusic" === id)
    {
        if(document.getElementById("optionsMusic").style.color === "green")
        {
          document.getElementById("optionsMusic").style.color = "red";
          gameNamespace.BackgroundMusic.pause();
        }
        else {
          document.getElementById("optionsMusic").style.color = "green";
          gameNamespace.BackgroundMusic.addEventListener('ended', function() {
          this.currentTime = 0;
          this.play();
          }, false);
          gameNamespace.BackgroundMusic.play();
        }
    }
    if("difficultyEasy" === id)
    {
      document.getElementById("difficultyEasy").style.color = "green";
      document.getElementById("difficultyMedium").style.color = "white";
      document.getElementById("difficultyHard").style.color = "white";
      gameNamespace.currentAsteroidMoveSpeed = 1;
      gameNamespace.gamestate = gameNamespace.GamestateEnum.GAME;
    }
    if("difficultyMedium" === id)
    {
      document.getElementById("difficultyEasy").style.color = "white";
      document.getElementById("difficultyMedium").style.color = "green";
      document.getElementById("difficultyHard").style.color = "white";
      gameNamespace.currentAsteroidMoveSpeed = 2;
      gameNamespace.gamestate = gameNamespace.GamestateEnum.GAME;
    }
    if("difficultyHard" === id)
    {
      document.getElementById("difficultyEasy").style.color = "white";
      document.getElementById("difficultyMedium").style.color = "white";
      document.getElementById("difficultyHard").style.color = "green";
      gameNamespace.currentAsteroidMoveSpeed = 3;
      gameNamespace.gamestate = gameNamespace.GamestateEnum.GAME;
    }
    if("GAMERESTART" === id)
    {
      gameNamespace.game.Reset();
    }
}
}
