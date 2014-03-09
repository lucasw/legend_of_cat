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

var level;
var cat;
var wd;
var ht;
var stage;
var loader;

var KEYCODE_UP = 38;
var KEYCODE_DOWN = 40;
var KEYCODE_LEFT = 37;
var KEYCODE_RIGHT = 39;


document.onkeydown = handleKeyDown;

function Level(container) {
   
  var mask_asset =  loader.getResult("level_mask");
  var mask = new createjs.Bitmap(mask_asset);
  var lwd2 = mask.getBounds().width;
  var lht2 = mask.getBounds().height;
  var mask_scaleX = wd/lwd2;
  var mask_scaleY = ht/lht2;
  console.log("mask_scaleX " + mask_scaleX + ", Y " + mask_scaleY + " " + lwd2 + " " + lht2);
  mask.cache(0,0,lwd2,lht2);
  container.addChild(mask);
  

  var lev_asset =  loader.getResult("level");
  var lev = new createjs.Bitmap(lev_asset);
  
  var lwd = lev.getBounds().width;
  var lht = lev.getBounds().height;
  lev.scaleX = wd/lwd;
  lev.scaleY = ht/lht;
  container.addChild(lev);
  
  stage.update();

  this.getMask = function(x,y) {
    var test_x = x / mask_scaleX;
    var test_y = y / mask_scaleY;

    console.log("get mask " + test_x + " " + test_y);
    var data = mask.cacheCanvas.getContext("2d").getImageData(test_x, test_y, 1, 1).data; 
    return data;
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
 
  var last_dx = 0;
  var last_dy = 0;

  this.testMove = function(dx, dy) {
    var pix = level.getMask(cont.x + dx, cont.y + dy);
    return (pix[0] > 128);
  }
  this.move = function(dx, dy) {
    if (dx > 0) cont.scaleX = -Math.abs(cont.scaleX);
    else if (dx < 0) cont.scaleX = Math.abs(cont.scaleX);
    
    //console.log("dxy " + dx + " " + dy); 
    var did_move = true;
    if (this.testMove(dx, dy)) {
      
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

    //console.log("pix " + new_x + " " + new_y + " " + pix[0]);

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
    {src:"assets/level_test_dither.png", id:"level"},
    {src:"assets/level_test_mask.png", id:"level_mask"},
    {src:"assets/cat_body.png", id:"cat_body"},
    {src:"assets/cat_head.png", id:"cat_head"},
    {src:"assets/cat_leg.png", id:"cat_leg"}
  ];

  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest);

}


function handleComplete() {
  level = new Level(stage);
  cat = new Cat(wd/2, 3*ht/4, stage); 
  stage.update();
}

function handleKeyDown(e) {
  if (!e) { var e = window.event; } 

  var update = true;
  var dx = 0; 
  var dy = 0;
  switch (e.keyCode) {
    case KEYCODE_LEFT:
      dx = -1;
      break;
    case KEYCODE_RIGHT:
      dx = 1;
      break;
    case KEYCODE_UP:
      dy = -1;
      break;
    case KEYCODE_DOWN:
      dy = 1;
      break;
    default:
      update = false;
      break;
  }

  if (update) {
    if (cat.move(dx, dy))
      cat.update();
    return false;
  }

}
