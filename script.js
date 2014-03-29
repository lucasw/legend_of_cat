/*
 Copyright Lucas Walter March 2014
 
 This file is part of Legend of Cat.

 Foobar is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Foobar is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 
 */

var use_sound = false;
var levels = [];
var level;
var cat;
var wd;
var ht;
var stage;
var loader;
var map_loader;
var snd_loader;
var map_data;


var KEYCODE_UP = 38;
var KEYCODE_DOWN = 40;
var KEYCODE_LEFT = 37;
var KEYCODE_RIGHT = 39;


document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

function Cloud(parent_container) {
  var asset =  map_loader.getResult("cloud");

}
  
function makeBitmap(asset_name, auto_scale) {
  if (asset_name == null) {
    return null;
  }
  if (asset_name == "") return null;

  var asset =  map_loader.getResult(asset_name);
  var bitmap = new createjs.Bitmap(asset);
  if (bitmap == null) return null;
  console.log(asset_name + " " + bitmap);
  var lwd2e = bitmap.getBounds().width;
  var lht2e = bitmap.getBounds().height;
  if (auto_scale) {
    bitmap.scaleX = wd/lwd2e;
    bitmap.scaleY = ht/lht2e;
  }
  //console.log("exits_scaleX " + exits_scaleX + ", Y " + exits_scaleY + " " + lwd2 + " " + lht2);
  bitmap.cache(0,0,lwd2e,lht2e);
  return bitmap;
}

function Level(json_data) {
  
  var json = json_data;
  this.name = json.image;
  
  console.log("loading " + this.name + " " + json_data.exits + " " + json.exits);
  this.container = new createjs.Container();
  
  var exits = makeBitmap(json.exits,true);
  if (exits != null) this.container.addChild(exits);
  
  var mask = makeBitmap(json.mask,true); 
  if (mask != null) this.container.addChild(mask);

  var bg_container = new createjs.Container();
  this.container.addChild(bg_container);

  var bg = makeBitmap(json.bg,true);
  if (bg != null) this.bg_container.addChild(lev);

  var lev = makeBitmap(json.image,true);
  this.container.addChild(lev);

  for (var i = 0; i < json.obstacles.length; i++) {
    console.log(json.obstacles[i].image);
    var asset = makeBitmap(json.obstacles[i].image,true);
    this.container.addChild(asset);
  }

  var getPixel = function(bitmap, x,y) {
    if (bitmap == undefined) return 0;
    // TODO replace mask_scaleX/Y with something stored in bitmap
    var test_x = x / mask.scaleX;
    var test_y = y / mask.scaleY;
    if (test_x < 0) return 0;
    if (test_y < 0) return 0;
    if (test_x >= lwd2) return 0;
    if (test_y >= lht2) return 0;

    //console.log("get mask " + test_x + " " + test_y);
    var data = bitmap.cacheCanvas.getContext("2d").getImageData(test_x, test_y, 1, 1).data; 
    return data[0];
  }

  this.getMask = function(x,y) {
    return getPixel(mask, x, y);
  }

  var getExit = function(x,y) {
    return getPixel(exits, x, y);
  }

  this.transitionNewLevel = function(new_level, player_container) {
    // TODO replace with map later
    for (var i = 0; i < levels.length; i++) {
      if (levels[i].name === new_level.level) {
        console.log("going from " + level.name + " to " + levels[i].name + " " + 
            new_level.x + " " + new_level.y);
        stage.removeChild(level.container);
        level = levels[i];
        stage.addChildAt(level.container, 0);
        console.log(level.name);
        player_container.x = new_level.x * mask_scaleX;
        player_container.y = new_level.y * mask_scaleY;
        stage.update();
        return true;
      }
    }
    console.log("could not transition to level " + new_level.level);
    return false;
  }
  this.doExit = function(player_container) {
    // see if the pixel value of the current exit position matches the value of an exit
    // then update the stage and player_container position to move to the new level
    var exit_val = getExit(player_container.x, player_container.y);
    if (exit_val === 0) return;
    //console.log("exit val " + exit_val);

    for (var i = 0; i < json.connections.length; i++) {
      if (exit_val == json.connections[i].value) {
        return this.transitionNewLevel(json.connections[i], player_container);
      }
    }
    return false;
  }

  this.getSong = function() {
    return json.music;
  }

  return this;
}

function Cat(x, y, container) {
  
  var cont = new createjs.Container();
  cont.x = x;
  cont.y = y;
  cont.scaleX = 4;
  cont.scaleY = cont.scaleX;
  cont.regX = 16;
  cont.regY = 16;
  container.addChild(cont);

  var legs1 = new createjs.Container();
  legs1.x = 6;
  legs1.y = 16;
  cont.addChild(legs1);
  
  var leg_asset =  loader.getResult("cat_leg");
  var leg1 = new createjs.Bitmap(leg_asset);
  var leg2 = new createjs.Bitmap(leg_asset);
  leg1.x = -10;
  leg2.x = 10;
  legs1.addChild(leg1); 
  legs1.addChild(leg2); 
  
  var legs2 = new createjs.Container();
  legs2.x = legs1.x + 4;
  legs2.y = legs1.y;
  cont.addChild(legs2);

  var leg3 = new createjs.Bitmap(leg_asset);
  var leg4 = new createjs.Bitmap(leg_asset);
  leg3.x = -10;
  leg4.x = 10;
  legs2.addChild(leg3); 
  legs2.addChild(leg4); 
  
  var tail = new createjs.Bitmap(leg_asset);
  tail.x = 21;
  cont.addChild(tail);
  
  var body = new createjs.Bitmap(loader.getResult("cat_body"));
  cont.addChild(body);
  var head = new createjs.Bitmap(loader.getResult("cat_head"));
  cont.addChild(head);
  head.x = -8;
  head.y = -2;


  var counter = 0;
  this.update = function() {
  
  if (did_move) {
    if (counter > 8) {
      head.y = -2;
    } else {
      head.y = -3;
    }
    if (Math.floor(counter/4) % 2 == 0) {
      tail.x = 22;
    } else {
      tail.x = 21;
    }

    if (counter < 8) {
      legs1.y = 16 - counter/3;
      legs2.y = 16 - 8/3 + counter/3;
    } else if (counter < 16) {
      c2 = counter - 8;
      legs1.y = 16 - 8/3 + c2/3;
      legs2.y = 16 - c2/3;
    } else {
      counter = -1;
    }

    counter += 1;
  } else {
    // move a little sometimes
    if (Math.random() < 0.01) {
      if (tail.x == 22) tail.x = 21
      else if (tail.x == 21) tail.x = 22
    }
    if (Math.random() < 0.01) {
      if (head.y == -2) head.y = -3;
      else if (head.y == -3) head.y = -2;
    }
  }
    
    if (Math.random() < 0.01) {
      if (legs1.x == 6) legs1.x = 5;
      else if (legs1.x != 6) legs1.x = 6;
    }
      
  stage.update();

  }
 
  var last_dx = 0;
  var last_dy = 0;

  this.testMove = function(dx, dy) {
    var pix = level.getMask(cont.x + dx, cont.y + dy);
    return (pix > 128);
  }

  var did_move = false;
  this.move = function(dx, dy) {
    if (dx > 0) cont.scaleX = -Math.abs(cont.scaleX);
    else if (dx < 0) cont.scaleX = Math.abs(cont.scaleX);
    
    //console.log("dxy " + dx + " " + dy); 
    did_move = true;
    if ((dx === 0) && (dy === 0)) {
      did_move = false;
    } else if (this.testMove(dx, dy)) {
      
    } else if ((dx !== 0) && (last_dy !== 0) && this.testMove(0, last_dy)) {
      dx = 0;
      dy = last_dy;
      //console.log("y dxy " + dx + " " + dy); 
    } else if ((dy !== 0) && (last_dx !== 0) && this.testMove(last_dx, 0)) {
      dx = last_dx;
      dy = 0;
      //console.log("x dxy " + dx + " " + dy); 
    } else {
      did_move = false;
    }
    
    //console.log(did_move + " " + dx + " " + last_dx);
    // console.log("pix " + new_x + " " + new_y + " " + pix[0]);

    if (did_move) {
      cont.x += dx;
      cont.y += dy;
      if (dx !== 0) last_dx = dx;
      if (dy !== 0) last_dy = dy;
    }
   
    // if the player is standing on an exit pixel, move them to the new level
    level.doExit(cont)

    return did_move;
  }

  return this;
}

function init() {
  // has to be the same string as canvas id in html
  stage = new createjs.Stage("Legend of Cat");

  wd = stage.canvas.width;
  ht = stage.canvas.height;

  var context = stage.canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;

  // TODO have a Cat.addManifest that populates this
  manifest = [
    {src:"assets/cat_body.png", id:"cat_body"},
    {src:"assets/cat_head.png", id:"cat_head"},
    {src:"assets/cat_leg.png", id:"cat_leg"},
    {src:"assets/map.json", id:"map_data"}
  ];

  loader = new createjs.LoadQueue(true);
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest);
}

function handleComplete() {
  //console.log("load sound complete " + snd_loader.getResult("arcadia"));
  //var inst = createjs.Sound.play("meow"); //,  {interrupt:createjs.Sound.INTERRUPT_NONE, loop:-1, volume:0.9});
  //inst.addEventListener("complete", test1);
  //console.log(inst.playState);

  map_data = loader.getResult("map_data"); //, true);
  //console.log(map_data);
  console.log(map_data.manifest.length);
 
  loadMusic();
}

function loadMap() {
  map_loader = new createjs.LoadQueue(true);
  map_loader.addEventListener("complete", mapHandleComplete);
  map_loader.loadManifest(map_data.manifest);
}

function handleSoundProgress(event) {
  console.log("loading " + (event ? event.progress : 0));
}

function loadMusic() {
  use_sound = createjs.Sound.initializeDefaultPlugins();
  console.log("use sound " + use_sound + " " + 
      map_data.assets_path + " " + map_data.snd_manifest);

  console.log(map_data.snd_manifest[0].src);

  createjs.Sound.alternateExtensions = ["mp3"];

  snd_loader = new createjs.LoadQueue(true, map_data.assets_path); 
  snd_loader.installPlugin(createjs.Sound);
  //snd_loader.addEventListener("progress", handleSoundProgress);
  snd_loader.addEventListener("complete", soundHandleComplete);
  snd_loader.loadManifest(map_data.snd_manifest);
}

var music_inst = null;
//var music_complete = false;
//var map_complete = false;

function soundHandleComplete() {
  console.log("music and sound loaded" + snd_loader.getResult("arcadia"));
  loadMap();
}

function manageMusic() {
  var song = level.getSong();
 
  if (music_inst == null) {
    music_inst = createjs.Sound.play(song, { loop:-1 } );
    console.log(song + " " + music_inst.playState);
  }
  music_complete = true;

}

function mapHandleComplete() {
  // create all the levels
  for (var i = 0; i < map_data.levels.length; i++) {
    var new_level = new Level(
        map_data.levels[i] 
        );
    levels.push(new_level);
  }

  level = levels[0];
  manageMusic();
  stage.addChild(level.container);

  cat = new Cat(wd/2, 3*ht/4, stage); 
  stage.update();
  
  startTicker();
}

function startTicker() {
  createjs.Ticker.on("tick", update);
  createjs.Ticker.setFPS(20);
}

var key_left = false;
var key_right = false;
var key_up = false;
var key_down = false;

function update() {
  var dx = 0; 
  var dy = 0;
  
  var dval = 3;
  if (key_left) dx -= dval;
  if (key_right) dx += dval;
  if (key_up) dy -= dval;
  if (key_down) dy += dval;

  cat.move(dx, dy);
  cat.update();
  return false;
}

function handleKeyDown(e) {
  if (!e) { var e = window.event; } 
  handleKey(e, true);
}
function handleKeyUp(e) {
  if (!e) { var e = window.event; } 
  handleKey(e, false);
}

function handleKey(e, val) {
  var update = true;

  var key = e.keyCode; //String.fromCharCode( e.keyCode ).charCodeAt(0);
  if (key == ' '.charCodeAt(0)) {
    console.log("meow");
    if (use_sound)
      createjs.Sound.play("meow"); //, createjs.Sound.INTERUPT_LATE);
  }
  if (key == 'A'.charCodeAt(0))  key_left = val; 
  if (key == 'D'.charCodeAt(0))  key_right = val; 
  if (key == 'W'.charCodeAt(0))  key_up = val; 
  if (key == 'S'.charCodeAt(0))  key_down = val; 
  //console.log(key + " " + e.keyCode + " " + 'A'.charCodeAt(0));

  switch (e.keyCode) {
    case KEYCODE_LEFT:
      key_left = val;
      break;
    case KEYCODE_RIGHT:
      key_right = val;
      break;
    case KEYCODE_UP:
      key_up = val;
      break;
    case KEYCODE_DOWN:
      key_down = val;
      break;
    default:
      update = false;
      //return true;
      break;
  }

  return false;

}
