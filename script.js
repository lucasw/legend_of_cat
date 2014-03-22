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

var levels = [];
var level;
var cat;
var wd;
var ht;
var stage;
var loader;
var map_loader;
var map_data;


var KEYCODE_UP = 38;
var KEYCODE_DOWN = 40;
var KEYCODE_LEFT = 37;
var KEYCODE_RIGHT = 39;


document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

function Level(image, mask) {
   
  this.container = new createjs.Container();
  var mask_asset =  map_loader.getResult(mask);
  var mask = new createjs.Bitmap(mask_asset);
  var lwd2 = mask.getBounds().width;
  var lht2 = mask.getBounds().height;
  var mask_scaleX = wd/lwd2;
  var mask_scaleY = ht/lht2;
  //console.log("mask_scaleX " + mask_scaleX + ", Y " + mask_scaleY + " " + lwd2 + " " + lht2);
  mask.cache(0,0,lwd2,lht2);
  this.container.addChild(mask);
  

  var lev_asset =  map_loader.getResult(image);
  var lev = new createjs.Bitmap(lev_asset);
  
  var lwd = lev.getBounds().width;
  var lht = lev.getBounds().height;
  lev.scaleX = wd/lwd;
  lev.scaleY = ht/lht;
  this.container.addChild(lev);
  
  //stage.update();

  this.getMask = function(x,y) {
    var test_x = x / mask_scaleX;
    var test_y = y / mask_scaleY;
    if (test_x < 0) return 0;
    if (test_y < 0) return 0;
    if (test_x >= lwd2) return 0;
    if (test_y >= lht2) return 0;

    //console.log("get mask " + test_x + " " + test_y);
    var data = mask.cacheCanvas.getContext("2d").getImageData(test_x, test_y, 1, 1).data; 
    return data[0];
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
    stage.update();
  }

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
      return true;
    }
    
    return false;
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

  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest);

}


function handleComplete() {

  map_data = loader.getResult("map_data"); //, true);
  //console.log(map_data);
  console.log(map_data.manifest.length);
  
  map_loader = new createjs.LoadQueue(false);
  map_loader.addEventListener("complete", mapHandleComplete);
  map_loader.loadManifest(map_data.manifest);
}

function mapHandleComplete() {
  // create all the levels
  for (var i = 0; i < map_data.levels.length; i++) {
    var new_level = new Level(map_data.levels[i].image, map_data.levels[i].mask);
    levels.push(new_level);
  }

  level = levels[0];
  stage.addChild(level.container);

  cat = new Cat(wd/2, 3*ht/4, stage); 
  stage.update();

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

    if (cat.move(dx, dy))
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

  // not working yet
  var key = e.keyCode; //String.fromCharCode( e.keyCode ).charCodeAt(0);
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
