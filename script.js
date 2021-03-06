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

var scale = 4;

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;
  
function makeBitmap(asset_name, auto_scale) {
  if (asset_name == null) {
    return null;
  }
  if (asset_name == "") return null;

  var asset =  map_loader.getResult(asset_name);
  var bitmap = new createjs.Bitmap(asset);
  if (bitmap === null) return null;
  if (bitmap.getBounds() === null) {
    console.log("bad file " + asset_name);
    return null;
  }
  console.log("Bitmap: " + asset_name); //  + " " + bitmap);
  var lwd2e = bitmap.getBounds().width;
  var lht2e = bitmap.getBounds().height;
  if (auto_scale) {
  //  bitmap.scaleX = wd/lwd2e;
  //  bitmap.scaleY = ht/lht2e;
  }
  //console.log("exits_scaleX " + exits_scaleX + ", Y " + exits_scaleY + " " + lwd2 + " " + lht2);
  bitmap.cache(0,0,lwd2e,lht2e);
  return bitmap;
}

function Cloud(parent_container, x, y) {
  console.log("Cloud " + parent_container);
  var im = makeBitmap("cloud", false);
  //im.scaleX = scale;
  //im.scaleY = scale;
  im.x = x;
  im.y = y;

  parent_container.addChild(im);

  this.update = function() {
    if (Math.random() < 0.1) {
      im.x += 1;
      if (im.x > wd) im.x = -10;
    }
  }
  return this;
}

  var getPixel = function(bitmap, x,y) {
    if (bitmap == undefined) return 0;
    //console.log(bitmap + " " + x + " " + y);
    // TODO replace mask_scaleX/Y with something stored in bitmap
    var test_x = x / bitmap.scaleX;
    var test_y = y / bitmap.scaleY;
    if (test_x < 0) return 0;
    if (test_y < 0) return 0;
    if (test_x >= bitmap.getBounds().width) return 0;
    if (test_y >= bitmap.getBounds().height) return 0;

    //console.log("get mask " + test_x + " " + test_y);
    var data = bitmap.cacheCanvas.getContext("2d").getImageData(test_x, test_y, 1, 1).data; 
    return data[0];
  }

function Item(json_data) {
  this.json = json_data;
  
  this.name = this.json.image;
  this.container = new createjs.Container();
  
  var image = makeBitmap(this.json.image, false);
  this.container.addChild(image); 
  this.container.x = this.json.x; // * scale;
  this.container.y = this.json.y; // * scale;
  image.regX = image.getBounds().width/2;
  image.regY = image.getBounds().height/2;
  //image.scaleX = scale;
  //image.scaleY = scale;

  return this;
}

// TBD - maybe obstacles should just be items
function Obstacle(json_data) {
  this.json = json_data;
  this.name = this.json.image; 
  this.key = this.json.key;
  this.sound = this.json.sound;
  this.container = new createjs.Container();
  this.mask_container = new createjs.Container();

  //console.log("Obstacle " + this.name);
  var mask = makeBitmap(this.json.mask, true);
  this.mask_container.addChild(mask);
  var asset = makeBitmap(this.json.image, true);
  this.container.addChild(asset);

  this.getMask = function(x,y) {
    var val = getPixel(mask, x, y);
    return val;
  }

  return this;
}

function Level(json_data) {
  
  var json = json_data;
  this.name = json.name;
  
  console.log("Level " + this.name);
  this.mask_container = new createjs.Container();
  this.container = new createjs.Container();
  
  var exits = makeBitmap(json.exits,true);
  if (exits != null) this.container.addChild(exits);
    
  var mask = makeBitmap(json.mask,true); 
  if (mask != null) this.mask_container.addChild(mask);
  this.container.addChild(this.mask_container);

  var layers = [];
  if (json.layers) {
  for (var i = 0; i < json.layers.length; i++) {
    var layer_container = new createjs.Container();
    this.container.addChild(layer_container);
    console.log("Layer " + layers.length);
    layers.push(layer_container);
    
    var bitmap = makeBitmap(json.layers[i].image, true);
    if (bitmap != null) layer_container.addChild(bitmap);
  }
  }

  var clouds = [];
  if (json.clouds > 0) {
    console.log("clouds " + this.name + " " + json.clouds);

    for (var i = 0; i < json.clouds; i++) {
      var x = wd * Math.random();
      var y = ht * 0.4 * Math.random();
      var cloud = new Cloud(layers[0], x, y); 
      clouds.push(cloud);
    }
  }
  

  this.getLayer = function(mask_val) {
    if (json.layers === undefined) return null;
    for (var i = 0; i < json.layers.length; i++) {
      //console.log("get layer " + mask_val + " " + i + " " 
      //    + json.layers[i].value +  " " + layers[i]);
      if (mask_val == json.layers[i].value) {
        return layers[i];
      }
    }
    return null;
  }

  var items = [];
  for (var i = 0; i < json.items.length; i++) {
    var item = new Item(json.items[i]);

    var layer = this.getLayer(json.items[i].value);
    if (layer !== null) {
      layer.addChild(item.container);
      items.push(item);
    }

  }
  
  var obstacles = [];
  if (json.obstacles !== undefined) {
  for (var i = 0; i < json.obstacles.length; i++) {
    var obstacle = new Obstacle(json.obstacles[i]);
    this.mask_container.addChild(obstacle.mask_container); 
    var layer = this.getLayer(json.obstacles[i].value);
    if (layer !== null) {
      layer.addChild(obstacle.container);
      obstacles.push(obstacle);
    }
  }
  }

  this.getItem = function(x,y) {
    for (var i = 0; i < items.length; i++) {
      console.log(x + " " + y + ", " + items[i].container.x + " " + items[i].container.y);
      if ((Math.abs(x - items[i].container.x) < 32) && 
          (Math.abs(y - items[i].container.y) < 32)) {
        //console.log("got item");
        var got_item = items[i];
        items.splice(i, 1);
        this.container.removeChild(got_item.container);
        if (got_item.json.sound !== undefined)
          var inst = createjs.Sound.play(got_item.json.sound, delay=1500);
        return got_item;
      }
    }
    return null;
  }

  this.putItem = function(item, x, y) {
    var used_item = false;
    for (var i = 0; i < obstacles.length; i++) {
      var ob = obstacles[i];
      if ((x >= ob.json.x1) && (x <= ob.json.x2) &&
          (y >= ob.json.y1) && (y <= ob.json.y2)) {
        if (item.name === ob.key) {
          var layer = this.getLayer(json.obstacles[i].value);
          if (layer !== null) {
            console.log("used item " + item.name + " in " + ob.name); 
            createjs.Sound.play(ob.sound, delay= 200); //, createjs.Sound.INTERUPT_LATE);
            obstacles.splice(i, 1);
            layer.removeChild(ob.container);
            used_item = true;
          }
          break;
        }
      }
    
    } // loop through obstacles

    if (!used_item) {
      this.container.addChild(item.container); 
      items.push(item);
      item.container.x = x;
      item.container.y = y;
    }
    return used_item;
  }
  
  this.getMask = function(x,y) {
    var val = getPixel(mask, x, y);
    //console.log(name + " val " + val + ", " + obstacles.length);
    for (var i = 0; i < obstacles.length; i++) {
      var val_ob = obstacles[i].getMask(x,y);
      //if (val_ob.name === undefined) {
      //  console.log("ERROR " + i + " " + val_ob + " undefined");
      //}
      //else 
      // 128 is 'transparent'
      if ((val_ob !== undefined) && (val_ob !== 128)) {
        val = val_ob;
        console.log(y);
        console.log("obstacle " + obstacles[i].name + " " + i + " : "
            + obstacles[i].json.mask + " " 
            + x + " " + y + ", " + val_ob);
      }
    }
    return val;
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
        // Cat is at 1
        player_container.x = parseInt(new_level.x);
        player_container.y = parseInt(new_level.y);
        cat.level_transition = true;
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
    //console.log("exit val " + exit_val);
    if (exit_val === 0) return;

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

  this.update = function() {
    for (var i = 0; i < clouds.length; i++) {
      clouds[i].update();
    }
  }

  return this;
}

function Cat(x, y) {
 
  mask_val = 0;
  var cont = new createjs.Container();
  cont.x = x;
  cont.y = y;
  //cont.scaleX = 4;
  //cont.scaleY = cont.scaleX;
  cont.regX = 16;
  cont.regY = 30;

  var legs1 = new createjs.Container();
  legs1.x = 6;
  legs1.y = 16;
  cont.addChild(legs1);
  
  var leg_asset =  loader.getResult("cat_leg");
  var leg1 = new createjs.Bitmap(leg_asset);
  var leg2 = new createjs.Bitmap(leg_asset);
  leg1.x = -2;
  leg1.regX = 8;
  leg1.regY = 0;
  leg2.x = 10;
  //leg2.regX = 8;
  //leg2.regY = 8;
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

  var item = null;

  this.action = function(val) {
    if (val) {
      console.log("meow");
      var inst;
      leg1.rotation = 90;
      //if (use_sound) {
      //}

      if (item === null) {
        item = level.getItem(cont.x, cont.y);
        if (item !== null) {
          console.log("got item " + item.name);
          item.container.x = -16;
          item.container.y = 16;
          cont.addChild(item.container);
          inst = createjs.Sound.play("meow2"); //, createjs.Sound.INTERUPT_LATE);
        } else {
          inst = createjs.Sound.play("meow"); //, createjs.Sound.INTERUPT_LATE);
        }
      } else {
        cont.removeChild(item.container);
        var used_item = level.putItem(item, cont.x + -24 * cont.scaleX, cont.y);
        item = null;
        if (used_item) {
          inst = createjs.Sound.play("meow3"); //, createjs.Sound.INTERUPT_LATE);

        } else {
          inst = createjs.Sound.play("meow4"); //, createjs.Sound.INTERUPT_LATE);
        }
      }
        
      inst.volume = 0.3;
    } else {
      if (item === null)
        leg1.rotation = 0;
    }
    
  }
  
  var cur_layer = null;
  this.level_transition = false;
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
      if (item === null) {
        legs1.y = 16 - counter/3;
      }
      legs2.y = 16 - 8/3 + counter/3;
    } else if (counter < 16) {
      c2 = counter - 8;
      if (item === null) {
        legs1.y = 16 - 8/3 + c2/3;
      }
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
  } // did move
    
    if (Math.random() < 0.01) {
      if (legs1.x == 6) legs1.x = 5;
      else if (legs1.x != 6) legs1.x = 6;
    }
      
    var new_mask_val = level.getMask(cont.x, cont.y);
    if ((new_mask_val !== mask_val) || (this.level_transition)) {
      // TBD test if undefined
      var new_layer = level.getLayer(new_mask_val);
      if (new_layer !== null) {
        if (cur_layer !== null) cur_layer.removeChild(cont);
        console.log("went to new layer " + new_mask_val + " on " + level.name);
        new_layer.addChild(cont);
        this.level_transition = false;
      } else {
        console.log("ERROR new layer on " + level.name + " is null " 
            + new_mask_val + ", xy " + cont.x + " " + cont.y);
      }
      console.log(mask_val + " " + new_mask_val + ", " + cur_layer + " " + new_layer);
   
      cur_layer = new_layer;
      mask_val = new_mask_val;
    }
  } // Cat update
  

  var last_dx = 0;
  var last_dy = 0;

  this.testMove = function(dx, dy) {
    // For some reason x + y was getting interpretted as string concatenation, there must
    // be caller that is sending string like vars instead of ints?
    var new_x = parseInt(cont.x) + parseInt(dx);
    var new_y = parseInt(cont.y) + parseInt(dy);
    var pix_l = level.getMask(new_x - 13, new_y);
    var pix_m = level.getMask(new_x + 0, new_y);
    var pix_r = level.getMask(new_x + 13, new_y);
    //console.log(level.name + " mask val " + pix + " at " + new_x + " " + new_y + " ( " + cont.y + " + " + dy + " ) ");
    return ((pix_l > 128) && (pix_m > 128) && (pix_r > 128));
  }

  var did_move = false;
  this.move = function(dx, dy) {
    dx = parseInt(dx);
    dy = parseInt(dy);
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
   
    //console.log(did_move + " " + dx + " " + dy + ", " + cont.x + " " + cont.y + " " + level.name);
    //console.log(did_move + " " + dx + " " + last_dx);
    // console.log("pix " + new_x + " " + new_y + " " + pix[0]);

    if (did_move) {
      cont.x = parseInt(cont.x) + parseInt(dx);
      cont.y = parseInt(cont.y) + parseInt(dy);
      if (dx !== 0) last_dx = dx;
      if (dy !== 0) last_dy = dy;
    }
   
    // if the player is standing on an exit pixel, move them to the new level
    level.doExit(cont)

    return did_move;
  }

  return this;
}

var progress_rect;
var progress_bar;

function init() {
  // has to be the same string as canvas id in html
  stage = new createjs.Stage("Legend of Cat");

  wd = stage.canvas.width / scale;
  ht = stage.canvas.height / scale;
  
  stage.scaleX = scale;
  stage.scaleY = scale;

  progress_rect = new createjs.Shape();
  progress_rect.graphics.beginFill("#000000");
  progress_rect.graphics.drawRect(0, 0, 104, 44);
  progress_rect.graphics.endFill();
  progress_rect.x = wd/2 - 52;
  progress_rect.y = ht/2 - 22;
  
  progress_bar = new createjs.Shape();
  progress_bar.graphics.beginFill("#ffff88");
  progress_bar.graphics.drawRect(0, 0, 1, 40);
  progress_bar.graphics.endFill();
  progress_bar.x = wd/2 - 50;
  progress_bar.y = ht/2 - 20;
  stage.addChild(progress_rect);
  stage.addChild(progress_bar);
  stage.update();
  
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
  //console.log("loading " + (event ? event.progress : 0));
  if (event) 
    progress_bar.scaleX = 100 * event.progress;
  stage.update();
}

function loadMusic() {
  use_sound = createjs.Sound.initializeDefaultPlugins();
  console.log("use sound " + use_sound + " " + 
      map_data.assets_path + " " + map_data.snd_manifest);

  console.log(map_data.snd_manifest[0].src);

  createjs.Sound.alternateExtensions = ["mp3"];


  snd_loader = new createjs.LoadQueue(true, map_data.assets_path); 
  snd_loader.installPlugin(createjs.Sound);
  snd_loader.addEventListener("progress", handleSoundProgress);
  snd_loader.addEventListener("complete", soundHandleComplete);
  snd_loader.loadManifest(map_data.snd_manifest);
}

var music_inst = null;
//var map_complete = false;

function soundHandleComplete() {
  console.log("music and sound loaded" + snd_loader.getResult("arcadia"));
  loadMap();
}

var cur_song= "";

function manageMusic() {
  var song = level.getSong();
   
  if (cur_song !== song) {
    if (music_inst !== null) {
      music_inst.stop();
    }
    music_inst = createjs.Sound.play(song, { loop:-1 } );
    music_inst.volume = 0.25;
    console.log(song + " " + music_inst.playState);
    cur_song = song;
  } else {
    

  }

}

function mapHandleComplete() {
  stage.removeChild(progress_bar);
  stage.removeChild(progress_rect);
  // create all the levels
  for (var i = 0; i < map_data.levels.length; i++) {
    var new_level = new Level(
        map_data.levels[i] 
        );
    levels.push(new_level);

    if (new_level.name === map_data.start_level) {
      level = new_level;
    }
  }

  //level = levels[0];
  stage.addChild(level.container);

  cat = new Cat(wd/2, 3.7*ht/4);
  cat.update();
  
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
  
  var dval = 1;
  if (key_left) dx -= dval;
  if (key_right) dx += dval;
  if (key_up) dy -= dval;
  if (key_down) dy += dval;

  // TODO update all levels if things can happen off-screen
  level.update();

  manageMusic();
  cat.move(dx, dy);
  cat.update();
  
  stage.update();
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
    cat.action(val); 
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
