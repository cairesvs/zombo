var pageLoaded = false;

window.onload = function () {
    pageLoaded = true;
    init();
}

var mapWidth = 32;
var mapHeight = 32;
var tileSize = 16;
var zoom = 2;

var level = new Array(mapWidth * mapHeight);
for (var y = 0; y < mapHeight; y++) {

    for (var x = 0; x < mapWidth; x++) {
        level[x + y * mapWidth] = {
            land: 0,
        }
    }
}

var imagesToLoad = 0;

var tileImage = loadImage("assets/icons.png");
var spriteData;

function loadImage(path) {
    var image = new Image();
    imagesToLoad++;
    image.onload = function () {
        imagesToLoad--;
        if (imagesToLoad == 0) {
            spriteData = Sprite();
            init();
        }
    }
    image.src = path;
    return image;
}

function scaleImageData(ctx, imageData, scale) {
    var scaled = ctx.createImageData(imageData.width * scale, imageData.height * scale);
    var subLine = ctx.createImageData(scale, 1).data
    for (var row = 0; row < imageData.height; row++) {
        for (var col = 0; col < imageData.width; col++) {
            var sourcePixel = imageData.data.subarray(
                (row * imageData.width + col) * 4,
                (row * imageData.width + col) * 4 + 4
            );
            for (var x = 0; x < scale; x++) subLine.set(sourcePixel, x * 4)
            for (var y = 0; y < scale; y++) {
                var destRow = row * scale + y;
                var destCol = col * scale;
                scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4)
            }
        }
    }

    return scaled;
}

function Sprite() {
    var x = y = 0;
    var w = h = 256;
    var img = tileImage;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

    context.drawImage(img, 0, 0, w, h);
    return context.getImageData(x, y, img.width, img.height);
}

function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index + 0] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;
}


var palette = {
    white: { r: 255, b: 255, g: 255, a: 255 },
    light_gray: { r: 173, b: 173, g: 173, a: 255 },
    dark_gray: { r: 81, b: 81, g: 81, a: 255 },
    black: { r: 0, b: 0, g: 0, a: 255 },
}

// function Color(imageData, ctx, w, h) {
//     this.imageData = imageData;
//     this.ctx = ctx;
//     this.w = w;
//     this.h = h;
// }

// Object.assign(Color, {
// })

function Color(imageData, ctx, w, h) {
    var data = ctx.createImageData(w, h)
    var pixels = imageData.data;

    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            index = (x + y * imageData.width) * 4;

            var r = pixels[index + 0];
            var g = pixels[index + 1];
            var b = pixels[index + 2];
            var a = pixels[index + 3];

            if (r === 81 && g === 81 && b === 81) {
                setPixel(data, x, y, 255, 0, b, a);
            } else {
                setPixel(data, x, y, r, g, b, a);
            }

            var r = data.data[index + 0];
            var g = data.data[index + 1];
            var b = data.data[index + 2];
            var a = data.data[index + 3];
        }
    }

    return data;
}


function init() {
    if (!pageLoaded || imagesToLoad > 0) return;
    var mapCanvas = document.getElementById("map");

    var maxZoom = 300;
    var aspectRatio = 16 / 9;
    zoom = Math.max(Math.floor(mapCanvas.height / maxZoom + 1), mapCanvas.width / (maxZoom * aspectRatio) + 1);

    mapCanvas.width = (window.innerWidth);
    mapCanvas.height = (window.innerHeight);

    var ctx = mapCanvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(zoom, 0, 0, zoom, 0, 0);

    console.time("create sprites")
    for (var y = 0; y < 32; y++) {
        for (var x = 0; x < 32; x++) {
            var cx = x << 3;
            var cy = y << 3;

            var data = Color(spriteData, ctx, 8, 8);
            ctx.putImageData(data, cx, cy);
        }
    }
    console.timeEnd("create sprites")
}