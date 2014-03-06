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

var cat;
var wd;
var ht;
var stage;
var loader;

document.onkeydown = handleKeyDown;

function Cat(x, y, container) {
  
  var cont = new createjs.Container();
  cont.x = x;
  cont.y = y;
  cont.scaleX = 8;
  cont.scaleY = cont.scaleX;
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
    {src:"assets/cat_leg.png", id:"cat_leg"}
  ];

  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest);

}

function handleComplete() {
  cat = new Cat(wd/2, ht/2, stage); 

  stage.update();
}

function handleKeyDown(e) {
  if (!e) { var e = window.event; } 

  cat.update();
  return false;
}
