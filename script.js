
const socket = io('https://api.drawevolver.com:8081');

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

let connected = false;

let imagedisplaysize = 5;
let initialwh = 50;

let firstimagepadding = 0.4;
let treerowpadding = 0.4;
let treepadding = 0.2;



let treex = 850;
let treey = 540;

let mousex = 0;
let mousey = 0;

let lastmousex = 0;
let lastmousey = 0;

let dmousex = 0;
let dmousey = 0;

let centerx = 520;
let centery = 700;

let zoom = 2;

let leftclickdown = false;
let lastleftclick = false;

let justclicked = false;
let justclickpos = [0,0];
let dragmode = false;
let zoommode = true;
let deltascroll = 0;


let drawbackgroundframe = false;
let drawmode = false;
let drawjustclicked = false;
let drawjustclickpos = [0,0];
let drawdragmode = false;
let drawzoommode = true;
let drawdrawmode = false;
let drawcolorpicker = false;
let drawdeltascroll = 0;

console.log("ver 5");

let drawcolorpallete = [[[51,0,0],[51,25,0],[51,51,0],[25,51,0],[0,51,0],[0,51,25],[0,51,51],[0,25,51],[0,0,51],[25,0,51],[51,0,51],[51,0,25],[0,0,0]],[[102,0,0],[102,51,0],[102,102,0],[51,102,0],[0,102,0],[0,102,51],[0,102,102],[0,51,102],[0,0,102],[51,0,102],[102,0,102],[102,0,51],[32,32,32]],[[153,0,0],[153,76,0],[153,153,0],[76,153,0],[0,153,0],[0,153,76],[0,153,153],[0,76,153],[0,0,153],[76,0,153],[153,0,153],[153,0,76],[64,64,64]],[[204,0,0],[204,102,0],[204,204,0],[102,204,0],[0,204,0],[0,204,102],[0,204,204],[0,102,204],[0,0,204],[102,0,204],[204,0,204],[204,0,102],[96,96,96]],[[255,0,0],[255,128,0],[255,255,0],[128,255,0],[0,255,0],[0,255,128],[0,255,255],[0,128,255],[0,0,255],[127,0,255],[255,0,255],[255,0,127],[128,128,128]],[[255,51,51],[255,153,51],[255,255,51],[153,255,51],[51,255,51],[51,255,153],[51,255,255],[51,153,255],[51,51,255],[153,51,255],[255,51,255],[255,51,153],[160,160,160]],[[255,102,102],[255,178,102],[255,255,102],[178,255,102],[102,255,102],[102,255,178],[102,255,255],[102,178,255],[102,102,255],[178,102,255],[255,102,255],[255,102,178],[192,192,192]],[[255,153,153],[255,204,153],[255,255,153],[204,255,153],[153,255,153],[153,255,204],[153,255,255],[153,204,255],[153,153,255],[204,153,255],[255,153,255],[255,153,204],[224,224,224]],[[255,204,204],[255,229,204],[255,255,204],[229,255,204],[204,255,204],[204,255,229],[204,255,255],[204,229,255],[204,204,255],[229,204,255],[255,204,255],[255,204,229],[255,255,255]]]


let drawzoom = 7;
let drawcenterx = canvas.width/2;
let drawcentery = canvas.height/2;
let drawcolor = [0,1,1];



let draggingdrawslider = false;
let draggingvs = false;
let draggingh = false;

let drawsize = 1;
let drawsizeslider = drawsize;

let huemap = document.createElement("img");
huemap.src = "map-hue.png";

let huebar = document.createElement("img");
huebar.src = "bar-hue.png";

let closeicon = document.createElement("img");
closeicon.src = "closeicon.png";
let colorpickicon = document.createElement("img");
colorpickicon.src = "colorpickicon.png"
let drawicon = document.createElement("img");
drawicon.src = "drawicon.png";
let refreshicon = document.createElement("img");
refreshicon.src = "refreshicon.png"
let reseticon = document.createElement("img");
reseticon.src = "reseticon.png"
let rightarrowicon = document.createElement("img");
rightarrowicon.src = "rightarrow.png"
let leftarrowicon = document.createElement("img");
leftarrowicon.src = "leftarrow.png";
let scrollicon = document.createElement("img");
scrollicon.src = "scrollicon.png"

let searchicon = document.createElement("img");
searchicon.src = "searchicon.png"
let loadingicon = document.createElement("img");
loadingicon.src = "loadingicon.png"
let crossicon = document.createElement("img");
crossicon.src = "crossicon.png"

let copyicon = document.createElement("img");
copyicon.src = "copyicon.png";

let uploadicon = document.createElement("img");
uploadicon.src = "uploadicon.png";
let tutorial = document.createElement("img");
tutorial.src = "tutorial.png";




let backgroundcolor = "#EBEBEB";
let outlinecolor = "#53B6FF";
let backgrounddarkcolor = "#DCDCDC";
let buttoncolor = "#CCCCCC";
let darkbuttoncolor = "#808080";
let textcolor = "#1C9FFF";




let zoomspeed = 1.2;
let hoveredimage = null;
let drawhoveredimage = null;

let firstimage = document.createElement("img");
firstimage.src = "firstimage.png";
let firstimageoriginal = document.createElement("img");
firstimageoriginal.src = "firstimage.png";

console.log(firstimageoriginal);

let drawtree = {

  myid: "0",
  myimage: firstimage,
  myoriginalimage: firstimageoriginal,
  personalid: 0,
  uuid: 0,
  mylength: -1,
  requests: new Set(),
  scroll: 0,
  indexpos: 0,
  images:[],
  children:[]

}

socket.on("connect", () => {

  connected = true;

})


setInterval(draw, 10)



let uuidcount = 0;
function getuuid(){
  uuidcount++;
  return uuidcount;
}

function addnotification(notification, length, fadeouttime){

  let parent = document.getElementById("notifications");
  let created = document.createElement("p");

  created.classList.add("notification");
  created.innerText = notification;

  parent.appendChild(created);

  $(".notification").click(function(){
    this.parentNode.removeChild(this);
  })

  $(created).hide().fadeIn(300);

  setTimeout(() => {
    $(created).fadeOut(fadeouttime)
  }, length)

}

function coordconvert(x,y,cx,cy,zoom){

  let dx = x - canvas.width/2;
  let dy = y - canvas.height/2;
  dx /= zoom;
  dy /= zoom;
  x = cx + dx;
  y = cy + dy;

  return {x:x, y:y};

}

function convertcoord(x,y,cx,cy,zoom){


  return {

    x: (x - cx)*zoom + canvas.width/2,
    y: (y - cy)*zoom + canvas.height/2

  }

}

window.addEventListener('mousemove', setmousepos, false);
window.addEventListener('mousedown', mousedown);
window.addEventListener('mouseup', mouseup);
window.addEventListener("wheel", zoomin);
window.addEventListener('keydown', keydown);


let keylistener = "";


function keydown(e){
  let key = e.key;
  if(e.key == "Backspace"){
    key = "/"

  }

  keylistener += key;
}
function mousedown(e){
  leftclickdown = true;
}
function mouseup(e){
  leftclickdown = false;
}
function setmousepos(e){

  let pos = getMousePos(canvas, e);

  dmousex += mousex - pos.x;
  dmousey += mousey - pos.y;

  mousex = pos.x
  mousey = pos.y

}
function zoomin(e){

  deltascroll += e.deltaY < 0 ? -1 : 1

}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}
scalecanvas:{
var scalecanvas = document.createElement("canvas");
scalecanvas.width = 50;
scalecanvas.height = 50;
var scalecontext = scalecanvas.getContext("2d");
scalecanvas.imageSmoothingEnabled = false;
document.body.append(scalecanvas);
scalecanvas.style.opacity = 0;
}

function getPixelArray(image,w,h){
  scalecontext.fillStyle = "rgba(255,255,255,1)"
  scalecontext.fillRect(0,0,50,50);

  image.setAttribute('crossOrigin', '');

  scalecontext.drawImage(image, 0, 0);
  let data = scalecontext.getImageData(0, 0, w, h);;
  return data;
}
function scaleImageData(image,w,h){
  let scalefactorx = w / image.width;
  let scalefactory = h / image.height;

  scalecontext.putImageData(image,0,0);
  scalecontext.scale(scalefactorx,scalefactory);

  let output = scalecontext.getImageData(0,0,w,h);

  return output;
}

function imagedata_to_image(image,w,h){
  scalecontext.putImageData(image,0,0);
  return scalecanvas.toDataURL();
}

function setjustclicked(){
  if(leftclickdown && !lastleftclick){
    justclicked = true;
    justclickpos = [mousex, mousey, centerx, centery];
    dragmode = true;
  }

}
function adjustdrag(){
  centerx = justclickpos[2] + (justclickpos[0] - mousex) / zoom;
  centery = justclickpos[3] + (justclickpos[1] - mousey) / zoom;
}

function drawadjustdrag(){

  drawcenterx = drawjustclickpos[2] + (drawjustclickpos[0] - mousex) / drawzoom;
  drawcentery = drawjustclickpos[3] + (drawjustclickpos[1] - mousey) / drawzoom;

}

function hoveroutline(){


  let open = true;

  for(var a = 0; a < hoveredimage[0].children.length; a++){

    if(hoveredimage[0].children[a].indexpos == hoveredimage[6]){

      open = a;


    }

  }

  let image = rightarrowicon;

  if(open !== true) image = leftarrowicon;

  ctx.fillStyle = "rgba(0,0,0,0.4)"
  ctx.fillRect(hoveredimage[1], hoveredimage[2], hoveredimage[3], hoveredimage[4]);

  ctx.drawImage(image, hoveredimage[1], hoveredimage[2], hoveredimage[3], hoveredimage[4]);


  if(justclicked){


    if(open !== true){
      hoveredimage[0].children.splice(open, 1);
    }
    else if(open){

      console.log("open child");

      let original = document.createElement("img");
      original.src = hoveredimage[7].src;

      let newchild = {
        myimage: hoveredimage[7],
        myoriginalimage: original,
        myid: hoveredimage[0].myid + "/" + hoveredimage[5],
        personalid: hoveredimage[5],
        uuid: getuuid(),
        mylength: -1,
        requests: new Set(),
        scroll: 0,
        indexpos: hoveredimage[6],
        images:[],
        children:[]
      }

      hoveredimage[0].children.push(newchild);



    }


  }

  hoveredimage = null;
}
function drawhoveroutline(){


  ctx.fillStyle = "rgba(0,0,0,0.3)"
  ctx.fillRect(drawhoveredimage[1], drawhoveredimage[2], drawhoveredimage[3], drawhoveredimage[4]);
  ctx.drawImage(drawicon, drawhoveredimage[1], drawhoveredimage[2], drawhoveredimage[3], drawhoveredimage[4]);
  //ctx.stroke();




  if(justclicked){
    drawbackgroundframe = ctx.getImageData(0,0,canvas.width,canvas.height);
    drawmode = true;
  }

  if(!drawmode) drawhoveredimage = null;
}

function swapdrawcanvas(){
  if(leftclickdown && !lastleftclick){
    drawjustclicked = true;
    drawjustclickpos = [mousex,mousey,drawcenterx,drawcentery];
    drawdragmode = true;
  }

  drawdeltascroll = deltascroll;

  justclicked = false;
  //dragmode = false;
  zoommode = false;
  deltascroll = 0;
  //justclickpos = [0,0];
}

function draw() {

  ctx.fillStyle = backgroundcolor;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  setjustclicked();

  if(drawmode) swapdrawcanvas();

  if(dragmode && !drawmode) adjustdrag();


  if(connected) iteratetree();


  let tutorialsize = 20;

  let tutorialposx = 0
  let tutorialposy = 500;

  let tutorialpos = convertcoord(tutorialposx, tutorialposy, centerx, centery, zoom);

  ctx.drawImage(tutorial, tutorialpos.x, tutorialpos.y, initialwh*tutorialsize * zoom, initialwh * tutorialsize * zoom);

  if(drawtree.images.length > 0){
    drawthetree();


    if(!drawmode){
      if(hoveredimage != null){
        hoveroutline();
      }

      if(drawhoveredimage != null){
        drawhoveroutline();
      }
    }




  }


  if(deltascroll != 0){
    canvaszoom();
  }

  if(drawmode) drawdraw();

  lastleftclick = leftclickdown;

  if(!leftclickdown){
    dragmode = false;
    drawdragmode = false;
  }
  justclicked = false;
  deltascroll = 0;

  lastmousex = mousex;
  lastmousey = mousey;
  keylistener = "";



}


function checksetimagearray(){
  if(drawhoveredimage[0].myimagearray == undefined){

    let newimageelement = document.createElement("img");
    newimageelement.src = drawhoveredimage[0].myimage.src;
    drawhoveredimage[0].myimage = newimageelement;
    drawhoveredimage[0].myimagearray = getPixelArray(drawhoveredimage[0].myimage,50,50);

  }
}

function updatecanvasboard(convert=true){
  if(convert) drawhoveredimage[0].myimage.src = imagedata_to_image(drawhoveredimage[0].myimagearray);

}

function drawcolorpickermode(pos){


    let rgbcolor = HSVToRGB(drawcolor[0], drawcolor[1], drawcolor[2]);

    let changedpixel = false;

    let dx = mousex - pos.x;
    let dy = mousey - pos.y;

    let ir = 1;

    let px = dx;
    let py = dy;

    if(px > 0 && px < 50 * drawzoom && py > 0 && py < 50 * drawzoom){

        px /= 50 * drawzoom;
        py /= 50 * drawzoom;

        pixelx = Math.floor( px * 50 );
        pixely = Math.floor( py * 50 );

        if(pixelx < 0 || pixely < 0 || pixelx >= 50 || pixely >= 50) return;;

        let index = pixely * 50 + pixelx;
        index *= 4;

        ctx.beginPath();
        //ctx.rect(pos.x + pixelx * drawzoom, pos.y + pixely * drawzoom, drawzoom, drawzoom);

        ctx.arc(pos.x + (pixelx+0.5) * drawzoom, pos.y + (pixely+0.5) * drawzoom, drawzoom/2, 0, 2 * Math.PI, false)
        ctx.lineWidth = 3;
        ctx.strokeStyle = `rgba(0,0,0,255)`;
        ctx.stroke();

        if(drawjustclicked){

          let arr = drawhoveredimage[0].myimagearray.data
          let rgb = [arr[index],arr[index+1],arr[index+2]];

          console.log("rgb: " + rgb);

          let hsv = RGBToHSV(rgb[0],rgb[1],rgb[2]);

          console.log("hsv: " + hsv);

          drawcolor = hsv;

          drawcolorpicker = false;

        }

    }



    if(!leftclickdown){
      drawdrawmode = false;
    }

    return changedpixel;

}
function drawcanvasboard(pos){


  let rgbcolor = HSVToRGB(drawcolor[0], drawcolor[1], drawcolor[2]);

  let changedpixel = false;

  let dx = mousex - pos.x;
  let dy = mousey - pos.y;

  let sdx = lastmousex - pos.x;
  let sdy = lastmousey - pos.y;

  let ddx = dx - sdx;
  let ddy = dy - sdy;

  let sum = Math.sqrt( (ddx * ddx) + (ddy * ddy) ) * drawzoom;

  mdx = ddx / (sum == 0 ? 1 : sum);
  mdy = ddy / (sum == 0 ? 1 : sum);

  let ir = 1;

  for(var a = 0; a <= sum; a += ir){

    let px = sdx + mdx * a;
    let py = sdy + mdy * a;

    if(px > 0 && px < 50 * drawzoom && py > 0 && py < 50 * drawzoom){

        px /= 50 * drawzoom;
        py /= 50 * drawzoom;

        pixelx = Math.floor( px * 50 );
        pixely = Math.floor( py * 50 );

        for(var ipixely = pixely - Math.ceil( drawsize / 2 )+1; ipixely <= pixely + Math.floor( drawsize / 2 ); ipixely++){
          for(var ipixelx = pixelx - Math.ceil( drawsize / 2 )+1; ipixelx <= pixelx + Math.floor( drawsize / 2 ); ipixelx++){

            if(ipixelx < 0 || ipixely < 0 || ipixelx >= 50 || ipixely >= 50) continue;

            let index = ipixely * 50 + ipixelx;
            index *= 4;

            if(a + ir > sum){

              ctx.beginPath();
              ctx.rect(pos.x + ipixelx * drawzoom, pos.y + ipixely * drawzoom, drawzoom, drawzoom);
              ctx.lineWidth = 3;
              ctx.strokeStyle = `rgba(${rgbcolor[0]}, ${rgbcolor[1]}, ${rgbcolor[2]}, 255)`;
              ctx.stroke();


            }

            if(drawjustclicked){
              drawdrawmode = true;
            }

            if(drawdrawmode){

              changedpixel = true;
              drawdragmode = false;

              let arr = drawhoveredimage[0].myimagearray.data
              arr[index] = rgbcolor[0];
              arr[index+1] = rgbcolor[1];
              arr[index+2] = rgbcolor[2];
              arr[index+3] = 255;

            }

          }
        }





    }


  }

  if(!leftclickdown){
    drawdrawmode = false;
  }

  return changedpixel;

}
/*
function drawpallete(x, y){

  let padding = 0.5;
  let squaresize = 3;

  for(var a = drawcolorpallete.length-1; a >= 0; a-- ){
    for(var b = drawcolorpallete[a].length-1; b >= 0; b--){

      let dy = (drawcolorpallete.length - 1 - a);
      dy *= (padding + squaresize);

      let dx = (drawcolorpallete[a].length - 1 - b);
      dx *= (padding + squaresize);

      let pos = convertcoord(x - dx - squaresize, y + dy, drawcenterx, drawcentery, drawzoom);

      let r = drawcolorpallete[a][b][0];
      let g = drawcolorpallete[a][b][1];
      let bl = drawcolorpallete[a][b][2];


      ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, 1)`;
      ctx.fillRect(pos.x, pos.y, squaresize * drawzoom, squaresize * drawzoom);

      let coll = pointcolliding(mousex, mousey, pos.x, pos.y, squaresize*drawzoom, squaresize*drawzoom);

      if(coll){
        ctx.beginPath();
        ctx.rect(pos.x, pos.y, squaresize * drawzoom, squaresize * drawzoom);
        ctx.lineWidth = 3;
        ctx.strokeStyle = `rgba(255,255,255,1)`;
        ctx.stroke();

        if(drawjustclicked){

          drawcolor = [r,g,bl];


        }
      }

      if(drawcolor+"" == [r,g,bl]+""){

        ctx.beginPath();
        ctx.rect(pos.x, pos.y, squaresize * drawzoom, squaresize * drawzoom);
        ctx.lineWidth = 5;
        ctx.strokeStyle = `rgba(255,255,255,1)`;
        ctx.stroke();


      }

    }
  }



}
*/

function getHue(red,green,blue) {

    r /= 255;
    g /= 255;
    b /= 255;

    min = Math.min(Math.min(red, green), blue);
    max = Math.max(Math.max(red, green), blue);

    if (min == max) {
        return 0;
    }

    hue = 0;
    if (max == red) {
        hue = (green - blue) / (max - min);

    } else if (max == green) {
        hue = 2 + (blue - red) / (max - min);

    } else {
        hue = 4 + (red - green) / (max - min);
    }

    hue = hue / 6;
    if (hue < 0) hue = hue + 1;

    return hue;
}
function hueToRGB(h){
    kr = (5+h*6) % 6 //5
    kg = (3+h*6) % 6 //3
    kb = (1+h*6) % 6 //1

    r = 1 - Math.max(Math.min(kr, Math.min(4-kr, 1)), 0)
    g = 1 - Math.max(Math.min(kg, Math.min(4-kg, 1)), 0)
    b = 1 - Math.max(Math.min(kb, Math.min(4-kb, 1)), 0)

    return [r*255, g*255, b*255]
}
function RGBToHSV(r,g,b){
    max = Math.max(r, Math.max(g, b));
    min = Math.min(r, Math.min(g, b));

    hue = getHue(r,g,b);
    saturation = (max == 0) ? 0 : 1 - (1 * min / max);
    value = max / 255;

    return [hue,saturation,value];
}
function HSVToRGB(hue, saturation, value){

    hue *= 360;

    hi = (Math.floor(hue / 60)) % 6;
    f = hue / 60 - Math.floor(hue / 60);

    value = value * 255;
    v = (value);
    p = (value * (1 - saturation));
    q = (value * (1 - f * saturation));
    t = (value * (1 - (1 - f) * saturation));

    if (hi == 0) return [v, t, p];
    else if (hi == 1) return [q, v, p];
    else if (hi == 2) return [p, v, t];
    else if (hi == 3) return [p, q, v];
    else if (hi == 4) return [t, p, v];
    else return [v, p, q];
}
function drawpallete(x,y,sx,sy,hp,hw){

  let pos = convertcoord(x,y,drawcenterx,drawcentery,drawzoom);



  ctx.drawImage(huebar, pos.x + sx * drawzoom + hp * drawzoom, pos.y, hw*drawzoom, sy*drawzoom)

  let hbutton = drawoutlinebutton(pos.x + sx * drawzoom + hp * drawzoom, pos.y, hw*drawzoom, sy*drawzoom, "rgba(0,0,0,0)", "rgba(0,0,0,1)", 4, drawjustclicked, draggingh);
  if(hbutton == "clicked"){
    draggingh = true;
  }
  if(draggingh){

    if(!leftclickdown) draggingh = false;
    drawdragmode = false;
    drawdrawmode = false;
    drawcolorpicker = false;

    let newh = (mousey - pos.y) / (sy*drawzoom);

    if(newh < 0) newh = 0;
    if(newh > 1) newh = 1;

    drawcolor[0] = newh;

  }

  let hsv = drawcolor;
  let hue = hsv[0];
  let saturation = hsv[1];
  let value = hsv[2];



  let huesize = sy / 40;

  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.fillRect(pos.x + sx * drawzoom + hp * drawzoom, pos.y + sy*hue*drawzoom - (huesize/2) * drawzoom, hw*drawzoom, (huesize)*drawzoom);



  let hrgb = hueToRGB(hue);

  let indicatorradius = sy/40;

  ctx.fillStyle = "rgba(" + hrgb[0] + "," + hrgb[1] + "," + hrgb[2] + "," + 1 + ")";
  ctx.fillRect(pos.x,pos.y, sx*drawzoom, sy*drawzoom);
  ctx.drawImage(huemap, pos.x,pos.y, sx*drawzoom, sy*drawzoom);


  let vsbutton = drawoutlinebutton(pos.x,pos.y, sx*drawzoom, sy*drawzoom, "rgba(0,0,0,0)", "rgba(0,0,0,1)", 4, drawjustclicked, draggingvs);
  if(vsbutton == "clicked"){
    draggingvs = true;
  }
  if(draggingvs){

    if(!leftclickdown) draggingvs = false;
    drawdragmode = false;
    drawdrawmode = false;
    drawcolorpicker = false;

    let newsaturation = (mousex - pos.x) / (sx*drawzoom);

    if(newsaturation < 0) newsaturation = 0;
    if(newsaturation > 1) newsaturation = 1;

    let newvalue = (mousey - pos.y) / (sy*drawzoom);

    newvalue = 1 - newvalue;

    if(newvalue > 1) newvalue = 1;
    if(newvalue < 0) newvalue = 0;

    drawcolor[1] = newsaturation;
    drawcolor[2] = newvalue;

  }



  let rgb = HSVToRGB(drawcolor[0], drawcolor[1], drawcolor[2]);

  ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + 1 + ")";
  ctx.beginPath();
  ctx.arc(pos.x + sx * saturation * drawzoom, pos.y + sy * (1 - value) * drawzoom, indicatorradius * drawzoom, 0, 2 * Math.PI, false);
  ctx.fill();

  let indicatorstroke = indicatorradius / 4;

  ctx.lineWidth = indicatorstroke / 2 * drawzoom;
  ctx.strokeStyle = 'rgba(0,0,0,1)';
  ctx.stroke();

  ctx.arc(pos.x + sx * saturation * drawzoom, pos.y + sy * (1 - value) * drawzoom, (indicatorradius) * drawzoom, 0, 2 * Math.PI, false);
  ctx.strokeStyle = 'rgba(255,255,255,1)';
  ctx.stroke();






}
function drawsizesliderf(x, y, w, mw, h){


  let pos = convertcoord(x-w,y,drawcenterx,drawcentery,drawzoom);

  let barheight = h;

  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.fillRect(pos.x, pos.y, w * drawzoom, barheight * drawzoom);

  ctx.fillStyle = "rgba(255,255,255,1)";

  let rectwidth = w/40;
  let rectheight = h * 4;

  let xpos = x + (drawsizeslider / mw) * w - rectwidth/2 - w;
  let ypos = y - rectheight / 2 + barheight / 2;

  let pos2 = convertcoord(xpos, ypos, drawcenterx, drawcentery, drawzoom)

  ctx.fillRect(pos2.x, pos2.y, rectwidth * drawzoom, rectheight * drawzoom);

  if(pointcolliding(mousex, mousey, pos.x, pos2.y, w * drawzoom, rectheight * drawzoom)){

    ctx.beginPath();
    ctx.rect(pos2.x, pos2.y, rectwidth * drawzoom, rectheight * drawzoom);
    ctx.lineWidth = 3;
    ctx.strokeStyle = `rgba(0,0,0,1)`;
    ctx.stroke();


    if(drawjustclicked){
      draggingdrawslider = true;
      drawdragmode = false;
      drawcolorpicker = false;
    }

  }

  if(draggingdrawslider){

    ctx.beginPath();
    ctx.rect(pos2.x, pos2.y, rectwidth * drawzoom, rectheight * drawzoom);
    ctx.lineWidth = 3;
    ctx.strokeStyle = `rgba(0,0,0,1)`;
    ctx.stroke();

    let dx = mousex - pos.x

    if(dx <= 0) drawsizeslider = 0;
    else if(dx > w * drawzoom) drawsizeslider = mw;
    else{
      drawsizeslider = ( dx / (w * drawzoom) ) * mw
    }

    drawsize = Math.ceil(drawsizeslider);



  }

  if(drawsize == 0) drawsize = 1;

  let pos3 = convertcoord(x - w/2 - drawsize / 2, ypos + barheight + 4, drawcenterx, drawcentery, drawzoom)

  ctx.fillRect(pos3.x, pos3.y, drawsize*drawzoom, drawsize*drawzoom);

  ctx.beginPath();



  for(var a = 0; a < drawsize; a++){

    for(var b = 0; b < drawsize; b++){

      ctx.rect(pos3.x + a*drawzoom, pos3.y + b*drawzoom, 1 * drawzoom, 1 * drawzoom);

    }
  }


  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(0,0,0,1)`;
  ctx.stroke();

  if(!leftclickdown) draggingdrawslider = false;


}

function drawdraw(){



  ctx.fillStyle = "rgba(0,0,0,0.1)"
  ctx.fillRect(0,0,canvas.width,canvas.height);

  let pos = convertcoord(canvas.width/2 - 25, canvas.height/2 - 25, drawcenterx, drawcentery, drawzoom)

  ctx.drawImage(drawhoveredimage[0].myimage, pos.x, pos.y, 50 * drawzoom, 50 * drawzoom);

  checksetimagearray();


  let change = false;

  if(!drawcolorpicker){
    change = drawcanvasboard(pos);
  }
  else{
    drawcolorpickermode(pos);
  }

  updatecanvasboard(change);

  drawpallete(canvas.width/2 - 75, canvas.height/2 - 25, 40, 40, 1, 5);
  drawsizesliderf(canvas.width/2 - 29, canvas.height/2 + 18, 46, 35, 1);


  let exitbuttonwidth = 20;
  let exitbuttonheight = 10;
  let exitbuttonposx = 19;
  let exitbuttonpos = convertcoord(canvas.width/2 + exitbuttonposx - 25, canvas.height/2 + 25, drawcenterx, drawcentery, drawzoom);
  let exitbutton = drawoutlinebutton(exitbuttonpos.x, exitbuttonpos.y, exitbuttonwidth * drawzoom, exitbuttonheight * drawzoom, darkbuttoncolor, "rgba(0,0,0,1)", 5, drawjustclicked)
  ctx.drawImage(closeicon, exitbuttonpos.x, exitbuttonpos.y, exitbuttonwidth * drawzoom, exitbuttonheight * drawzoom);

  let resetbuttonwidth = 10;
  let resetbuttonheight = 10;
  let resetbuttonpos = convertcoord(canvas.width/2 + exitbuttonwidth + 1 - 25 + exitbuttonposx, canvas.height/2 + 25, drawcenterx, drawcentery, drawzoom);
  let resetbutton = drawoutlinebutton(resetbuttonpos.x, resetbuttonpos.y, resetbuttonwidth * drawzoom, resetbuttonheight * drawzoom, darkbuttoncolor, "rgba(0,0,0,1)", 5, drawjustclicked)
  ctx.drawImage(reseticon, resetbuttonpos.x, resetbuttonpos.y, resetbuttonwidth * drawzoom, resetbuttonheight * drawzoom)

  let colorpickwidth = 10;
  let colorpickheight = 10;
  let colorpickpos = convertcoord(canvas.width/2 - 25, canvas.height/2 + 25, drawcenterx, drawcentery, drawzoom);
  let colorpickbutton = drawoutlinebutton(colorpickpos.x, colorpickpos.y, colorpickwidth * drawzoom, colorpickheight * drawzoom, darkbuttoncolor, "rgba(0,0,0,1)", 5, drawjustclicked)
  ctx.drawImage(colorpickicon, colorpickpos.x, colorpickpos.y, colorpickwidth * drawzoom, colorpickheight * drawzoom)

  if(colorpickbutton == "clicked"){
    drawcolorpicker = true;
  }


  if(resetbutton == "clicked"){



    drawhoveredimage[0].myimage.src = drawhoveredimage[0].myoriginalimage.src;

    drawhoveredimage[0].myimagearray = getPixelArray(drawhoveredimage[0].myoriginalimage, 50, 50);

    updatecanvasboard(true);


  }



  if(exitbutton == "clicked"){
    drawmode = false;
    drawhoveredimage = null;
  }


  drawjustclicked = false;

  if(drawdeltascroll != 0) drawcanvaszoom();
  if(drawdragmode) drawadjustdrag();




}

function drawcanvaszoom(){

  let values = calculatezoomadjust(mousex, mousey, drawcenterx, drawcentery, drawzoom, drawdeltascroll)
  drawcenterx = values.centerx;
  drawcentery = values.centery;
  drawzoom = values.zoom;

}

function canvaszoom(){
  let values = calculatezoomadjust(mousex, mousey, centerx, centery, zoom, deltascroll);

  centerx = values.centerx;
  centery = values.centery;
  zoom = values.zoom;
}
function calculatezoomadjust(mousex, mousey, centerx, centery, zoom, deltascroll){

  let mousepos = coordconvert(mousex, mousey, centerx, centery, zoom);

  let dx = (mousepos.x - centerx);
  let dy = (mousepos.y - centery);

  if(deltascroll < 0){
    zoom *= zoomspeed;
    dx /= zoomspeed;
    dy /= zoomspeed;
    centerx = mousepos.x - dx;
    centery = mousepos.y - dy;
  }
  else{
    zoom /= zoomspeed;
    dx *= zoomspeed;
    dy *= zoomspeed;
    centerx = mousepos.x - dx;
    centery = mousepos.y - dy;
  }

  return {centerx: centerx, centery: centery, zoom: zoom}


}

function drawthetree(){

  let start = []
  let newarr = [drawtree];


  while(newarr.length > 0){



    start = [...newarr];
    newarr = [];



    while(start.length > 0){


      let shoulddraw = drawval(start[start.length-1]);

      if(shoulddraw){

        newarr = newarr.concat(start[start.length-1].children);

        for(var a = 0; a < start[start.length-1].children.length; a++){
          start[start.length-1].children[a].parent = start[start.length-1];
        }
      }





      start.pop();

    }

  }


}
function drawval(part){

  let z;
  let d;
  let s;
  let myindexpos = 0;

  let size = treerowpadding*(imagedisplaysize) + (imagedisplaysize) + firstimagepadding;

  if(part.dragging == undefined || !leftclickdown) part.dragging = false;
  if(part.searchinput == undefined) part.searchinput = ["", false, "false", 0];

  if(part.myid == "0"){

    part.posx = treex;
    part.posy = treey;


    z = 1;
    d = initialwh * size;
    s = initialwh;

  }
  else{

    z = size ** (part.myid.split("/").length - 2);
    d = initialwh / z;
    s = (d) / size;


    let parentscroll = Math.floor(part.parent.scroll);
    myindexpos = part.parent.images.indexOf(part.indexpos);


    if(myindexpos < parentscroll || myindexpos > parentscroll + imagedisplaysize - 2){
      return false;
    }

    part.posx = part.parent.posx + d + d*treepadding;
    part.posy = part.parent.posy + ( (myindexpos+1 - parentscroll) * d) + ( (myindexpos+1 - parentscroll) * (d*treerowpadding) + d*firstimagepadding )

  }


  let pos = convertcoord(
    part.posx,
    part.posy,
    centerx,centery,zoom
  );





  ctx.beginPath();
  ctx.rect(pos.x, pos.y, s*zoom, d*zoom);
  ctx.lineWidth = s/4 * zoom;
  ctx.strokeStyle = backgrounddarkcolor;
  ctx.stroke();

  ctx.fillStyle = backgrounddarkcolor;
  ctx.fillRect(pos.x, pos.y, s*zoom, d*zoom);
  ctx.drawImage(part.myimage, pos.x, pos.y, s*zoom, s*zoom)

  uploadbutton = false;
  if(part.myimagearray != undefined){
    let uploadbuttonheight = 0.15 * s;
    let uploadbuttonwidth = s;
    uploadbutton = drawoutlinebutton(pos.x, pos.y + s*zoom, uploadbuttonwidth * zoom, uploadbuttonheight * zoom, darkbuttoncolor, "rgba(0,0,0,1)", 4, justclicked);
    if(new Date().getTime() % 1000 > 1000/2)ctx.drawImage(uploadicon, pos.x, pos.y + s*zoom, uploadbuttonwidth * zoom, uploadbuttonheight * zoom)
  }

  if(uploadbutton == "clicked"){

    part.uploading = true;

    socket.emit("uploadimage", part.myid, part.myimagearray.data, "", part.uuid);

  }

  if(pointcolliding(mousex,mousey, pos.x, pos.y, s*zoom, s*zoom) && !drawmode && !part.uploading){

    let copyheight = 0.2;
    let copywidth = 0.2;
    let copypadding = 0.03;
    let copybuttonid = drawoutlinebutton(pos.x + s*zoom - (copywidth + copypadding) * s * zoom, pos.y + (copypadding)*s*zoom, copywidth*s*zoom, copyheight*s*zoom, buttoncolor, "rgba(50,50,50,1)",4, justclicked );
    ctx.drawImage(copyicon, pos.x + s*zoom - (copywidth + copypadding) * s * zoom, pos.y + (copypadding)*s*zoom, copywidth*s*zoom, copyheight*s*zoom);

    if(copybuttonid == "clicked"){


      let copiedid = part.myid;

      copyTextToClipboard(copiedid);
      addnotification(`Copied 'full ID' to clipboard: ` + copiedid, 3000, 500);

    }

    if(uploadbutton == false && copybuttonid == false){

      drawhoveredimage = [part,pos.x,pos.y,s*zoom,s*zoom];


    }

  }

  let searchboxheight = 0.2;
  let searchboxpadding = 0.3;
  let searchboxwidth = 0.78;
  let searchgoboxpadding = 0.02;
  let searchinputmaxlength = 9;


  let searchbox = drawoutlinebutton(pos.x , pos.y + s * zoom + searchboxpadding * s * zoom, s*searchboxwidth*zoom, s*searchboxheight*zoom, "rgba(255,255,255,1)", "rgba(50,50,50,1)",4, justclicked );


  if(part.searchinput[1]){

    ctx.beginPath();
    ctx.rect(pos.x, pos.y + s * zoom + searchboxpadding * s * zoom, s*searchboxwidth*zoom, s*searchboxheight*zoom);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(170,170,0)";
    ctx.stroke();

  }

  let searchgobox = drawoutlinebutton(pos.x + s * zoom * (searchgoboxpadding + searchboxwidth) , pos.y + s * zoom + searchboxpadding * s * zoom, s*zoom - s * zoom * (searchgoboxpadding + searchboxwidth), s*searchboxheight*zoom, darkbuttoncolor, "rgba(50,50,50,1)",4, justclicked );


  if(part.searchinput[2] == "false"){
    ctx.drawImage(searchicon, pos.x + s * zoom * (searchgoboxpadding + searchboxwidth) , pos.y + s * zoom + searchboxpadding * s * zoom, s*zoom - s * zoom * (searchgoboxpadding + searchboxwidth), s*searchboxheight*zoom)

  }
  if(part.searchinput[2] == "searching"){
    ctx.drawImage(loadingicon, pos.x + s * zoom * (searchgoboxpadding + searchboxwidth) , pos.y + s * zoom + searchboxpadding * s * zoom, s*zoom - s * zoom * (searchgoboxpadding + searchboxwidth), s*searchboxheight*zoom)
  }
  if(part.searchinput[2] == "badsearch"){
    ctx.drawImage(crossicon, pos.x + s * zoom * (searchgoboxpadding + searchboxwidth) , pos.y + s * zoom + searchboxpadding * s * zoom, s*zoom - s * zoom * (searchgoboxpadding + searchboxwidth), s*searchboxheight*zoom)
  }

  if(part.searchinput[2] == "badsearch" && new Date().getTime() > part.searchinput[3]){
    part.searchinput[2] = "false";
  }


  if(searchgobox == "clicked"){

    let input = parseInt(part.searchinput[0]);

    part.searchinput[2] = "searching";
    console.log("search image");
    socket.emit("getpath", part.myid + `/${input}.png`, "searchimage", part.uuid)


  }

  if(part.searchinput[1]){

    for(var a = 0; a < keylistener.length; a++){

      if(part.searchinput[0].length <= searchinputmaxlength && parseInt(keylistener[a])+"" != "NaN") part.searchinput[0] += keylistener[a];
      if(keylistener[a] == "/") part.searchinput[0] = part.searchinput[0].substring(0, part.searchinput[0].length - 1);

    }

  }

  if(searchbox == "clicked"){

    part.searchinput[1] = true;

  }
  if(justclicked && searchbox != "clicked"){

    part.searchinput[1] = false;
  }



  let fs = Math.floor(0.1 * s * zoom)

  ctx.font = `${fs}px Comic Sans MS`;
  ctx.strokeStyle = "black";

  let lw = Math.floor(0.017 * s * zoom);

  ctx.lineWidth = lw
  ctx.fillStyle = textcolor;
  ctx.textAlign = "left";


  let text = part.searchinput[0];

  if(text.length == 0 && !part.searchinput[1]) text = "Search ID here.";

  if(lw >= 1) ctx.strokeText(text, pos.x + 0.02 * s * zoom, pos.y + s * zoom + fs/2 + searchboxheight/2 * s * zoom + searchboxpadding * s * zoom - 0.01 * s * zoom);
  ctx.fillText(text, pos.x + 0.02 * s * zoom, pos.y + s * zoom + fs/2 + searchboxheight/2 * s * zoom + searchboxpadding * s * zoom - 0.01 * s * zoom);


  let refreshbuttonwidth = 1;
  let refreshbuttonheight = 0.2;
  let refreshbuttonpadding = 0.05;

  let refreshbutton = drawoutlinebutton(pos.x, pos.y + (refreshbuttonpadding + searchboxheight + searchboxpadding) * s * zoom + s * zoom, refreshbuttonwidth * zoom * s,  s*refreshbuttonheight*zoom, "rgba(255,100,100,1)", "rgba(50,50,50,1)",4, justclicked );

  ctx.drawImage(refreshicon, pos.x, pos.y + (refreshbuttonpadding + searchboxheight + searchboxpadding) * s * zoom + s * zoom, refreshbuttonwidth * zoom * s,  s*refreshbuttonheight*zoom)

  if(refreshbutton == "clicked"){
    part.images = [];
    part.children = [];
    part.mylength = -1;
    part.requests = new Set();
    part.scroll = 0;
  }


  //drawlabel(part.personalid, pos.x + s*zoom / 2, pos.y + s*zoom);

  if(part.images.length >= imagedisplaysize){
    part.scrollmax = part.images.length - Math.floor( imagedisplaysize /2 );

    let scrollstartposy = s + s*firstimagepadding + s*treerowpadding;
    let scrollheight = d;
    let scrollbarheight = s;
    let scrollbarwidth = s/8;
    let scrollmaxy = scrollheight - scrollbarheight - scrollstartposy;
    let scrolly = scrollmaxy * (part.scroll / part.scrollmax);
    let scrollcolor = darkbuttoncolor;



    let barcoll = pointcolliding(mousex, mousey, pos.x - scrollbarwidth * zoom, pos.y + scrollstartposy*zoom, scrollbarwidth * zoom, d*zoom - scrollstartposy*zoom)
    let scroll = pointcolliding(mousex, mousey, pos.x - scrollbarwidth * zoom, pos.y + scrolly * zoom + scrollstartposy * zoom, scrollbarwidth*zoom, scrollbarheight*zoom);

    if(scroll && justclicked) scroll = "clicked";

    if(barcoll && justclicked && scroll != "clicked"){
      scroll = "teleport";
    }

    if(scroll == "clicked" || scroll == "teleport"){
      part.dragging = mousey - (pos.y + scrollstartposy*zoom + scrolly*zoom)

      if(scroll == "teleport"){

        part.dragging = (scrollbarheight / 2) * zoom;
      }


      dragmode = false;
    }

    if(part.dragging !== false){

      let newspot = mousey - part.dragging;

      newspot -= pos.y + scrollstartposy*zoom;

      if(newspot <= 0) newspot = 0;
      if(newspot > scrollmaxy * zoom) newspot = scrollmaxy * zoom;

      newspot /= zoom;
      newspot /= scrollmaxy;
      newspot *= part.scrollmax;

      part.scroll = newspot;

      if(part.scroll < 0) part.scroll = 0;

    }

    scrolly = scrollmaxy * (part.scroll / part.scrollmax);


    let thinness = 0.05;
    ctx.fillStyle = buttoncolor;
    ctx.fillRect(pos.x - scrollbarwidth * zoom + s * thinness * zoom, pos.y + scrollstartposy*zoom, scrollbarwidth * zoom - 2 * s * thinness * zoom, d*zoom - scrollstartposy*zoom)

    drawoutlinebutton(pos.x - scrollbarwidth * zoom + s * thinness/2 * zoom, pos.y + scrolly * zoom + scrollstartposy * zoom, scrollbarwidth*zoom - s * thinness * zoom, scrollbarheight*zoom, scrollcolor, outlinecolor,2, justclicked, part.dragging || barcoll);

    if(part.uploading){

      ctx.fillStyle = "rgba(0,0,0,0.3)"
      ctx.fillRect(pos.x, pos.y, s*zoom, s*zoom);

    }

    ctx.drawImage(scrollicon, pos.x - scrollbarwidth * zoom + s * thinness/2 * zoom, pos.y + scrolly * zoom + scrollstartposy * zoom, scrollbarwidth*zoom - s * thinness * zoom, scrollbarheight*zoom)

  }

  function drawlabel(text, x, y, scale){

    y += Math.floor(0.15 * s * zoom);

    ctx.font = `${Math.floor(0.17 * s * zoom)}px Comic Sans MS`;
    ctx.strokeStyle = "black";

    let lw = Math.floor(0.017 * s * zoom);

    ctx.lineWidth = lw
    ctx.fillStyle = textcolor;
    ctx.textAlign = "center";

    if(lw >= 1) ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  }

  let flooredscroll = Math.floor(part.scroll);

  for(var a = Math.max( flooredscroll,0 ); a < flooredscroll + imagedisplaysize-1 && a < part.images.length; a++){
    //drawimage(part.images[a].image,part.posx,part.posy + (a - part.scroll)*s,s,s);

    let pos = convertcoord(
      part.posx,
      part.posy + (a+1 - flooredscroll)*s + (a+1 -flooredscroll)*(s*treerowpadding) + s*firstimagepadding,
      centerx,centery,zoom
    );

    let isopen = false;

    for(var child = 0; child < part.children.length; child++){
      if(part.children[child].indexpos == part.images[a]) isopen = true;
    }

    if(isopen) drawoutlinebutton(pos.x, pos.y, s*zoom, s*zoom + s * 0.2 * zoom, "rgba(0,0,0,0)", outlinecolor, 0.05 * s * zoom, part.images, isopen);
    ctx.drawImage(part.images[a].image, pos.x , pos.y, s*zoom, s*zoom)

    ctx.fillStyle = buttoncolor;
    ctx.fillRect(pos.x, pos.y + s*zoom, s*zoom, s * 0.2 * zoom);

    drawlabel(part.images[a].id, pos.x + s*zoom / 2, pos.y + s*zoom);

    if(pointcolliding(mousex,mousey, pos.x, pos.y, s*zoom, s*zoom)){

      hoveredimage = [part,pos.x,pos.y,s*zoom,s*zoom,part.images[a].id,part.images[a],part.images[a].image];

    }


  }

  return true;




}


function iteratetree(){

  let start = []
  let newarr = [drawtree];


  while(newarr.length > 0){



    start = [...newarr];
    newarr = [];

    while(start.length > 0){

      executeval(start[start.length-1]);
      newarr = newarr.concat(start[start.length-1].children);
      start.pop();

    }


  }

}
function executeval(part){

  if(part.mylength == -1){


    if(part.requests.has(-1)) return;
    part.requests.add(-1);

    console.log("request text");
    socket.emit("getpath", part.myid + "/info.txt", "", part.uuid)

  }

  else if(part.images.length == 0){

    for(var a = part.mylength-1; a >= 0 && a > part.mylength-1-5; a--){

      if(part.requests.has(a)) return;
      part.requests.add(a);


      console.log("request image");
      socket.emit("getpath", part.myid + `/${a}.png`, "", part.uuid)

    }

  }
  else if( part.images.length - Math.floor(part.scroll) - imagedisplaysize < 0){

    let diff =  -(part.images.length - Math.floor(part.scroll) - imagedisplaysize);

    let start = part.images[part.images.length-1].id-1

    for(var a = start; a > start-diff && a >= 0; a--){

      if(part.requests.has(a)) return;
      part.requests.add(a);

      console.log("request image");
      socket.emit("getpath", part.myid + `/${a}.png`, "", part.uuid)

    }

  }

}

function drawoutlinebutton(x,y,w,h,color,hovercolor,hoverwidth,justclickeda,autohover=false){

  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);

  if(autohover){
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.lineWidth = hoverwidth;
    ctx.strokeStyle = hovercolor;
    ctx.stroke();
  }

  if(pointcolliding(mousex, mousey, x, y, w, h)){

    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.lineWidth = hoverwidth;
    ctx.strokeStyle = hovercolor;
    ctx.stroke();

    if(justclickeda) return "clicked";
    return "hovered";

  }

  return false;

}

function pointcolliding(x,y,x2,y2,w,h){

  return x > x2 && x < x2 + w && y > y2 && y < y2 + h

}

socket.on("path", data => {



  if(data.ping != ""){

    if(data.ping == "searchimage"){

      let path = data.path;
      let uuid = data.uuid;

      if(path.endsWith(".png")) path = path.split(".png")[0];

      path = path.split("/");

      let obj = getpath(path, uuid);



      if(data.data == "nonexistent"){

        console.log("IT DONt exist");

        obj.searchinput[2] = "badsearch";
        obj.searchinput[3] = new Date().getTime() + 850;

        return;

      }

      let theid = parseInt(path[path.length-1]);

      let imageelement = document.createElement("img");

      let array = new Uint8Array(data.data);
      var blob = new Blob([array], {'type': 'image/png'});
      let url = URL.createObjectURL(blob);

      imageelement.src = url;

      let newimage = {
        id: theid,
        image: imageelement,
        sort: "search"
      }

      obj.images.unshift(newimage);
      obj.scrollmax += 1;
      obj.searchinput[2] = "false";

    }

  }
  else if(data.type == "image"){

    console.log(data);

    let path = data.path;
    let uuid = data.uuid;

    if(path.endsWith(".png")) path = path.split(".png")[0];

    path = path.split("/");

    let obj = getpath(path, uuid);

    let theid = parseInt(path[path.length-1]);

    let imageelement = document.createElement("img");

    let array = new Uint8Array(data.data);
    var blob = new Blob([array], {'type': 'image/png'});
    let url = URL.createObjectURL(blob);

    imageelement.src = url;

    let newimage = {
      id: theid,
      image: imageelement,
      sort: "sort"
    }

    let le = obj.images.length;
    for(var a = 0; a < obj.images.length; a++){

      if(theid > obj.images[a].id && obj.images[a].sort == "sort"){
        obj.images.splice(a, 0, newimage)
        break;
      }

    }
    if(obj.images.length == le || obj.images.length == 0)obj.images.push(newimage);

    obj.scrollmax += 1;




  }

  else if(data.type == "text"){

    console.log("RECIEVED TEXT DATA ");

    console.log(data);

    let path = data.path;
    let uuid = data.uuid;

    if(path.endsWith(".txt")) path = path.split(".txt")[0];

    path = path.split("/");

    let obj = getpath(path, uuid);

    obj.mylength = data.data["length"];

  }


});

function getpath(path, uuid = "none"){
  //path = path.split("/");

  console.log("uuid: " + uuid);

  let objs = [drawtree];
  let newobjs = [];

  for(var a = 1; a < path.length-1; a++){

    for(var b = 0; b < objs.length; b++){

      for(var c = 0; c < objs[b].children.length; c++){

        if(objs[b].children[c].personalid == parseInt(path[a])){

          newobjs.push(objs[b].children[c]);

        }

      }

    }

    objs = [...newobjs];
    newobjs = [];

  }

  console.log("final list of objs: ")
  console.log(objs);

  if(uuid == "none") return objs[0];
  else{
    for(var a = 0; a < objs.length; a++){

      if(objs[a].uuid == uuid){

        console.log("return it");

        return objs[a];
      }
    }
  }

}


socket.on("uploadedimage", (path, newid, ping, uuid) => {

  console.log("uuid: " + uuid + " ping: " + ping)

  path = path.split("/");
  path.push(newid+"");

  let obj = getpath(path, uuid);

  obj.uploading = false;


  if(newid == "failed"){
    return;
  }

  let newimage = document.createElement("img");
  newimage.src = obj.myimage.src;




  let newobj = {

    id: newid,
    image: newimage,
    sort: "first"

  }


  obj.images.unshift(newobj);

  obj.requests.add(newid);



  delete obj.myimagearray;






})

socket.on("notification", (data) => {


  addnotification(data.notification, data.time, 500);


})

function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

  //
  // *** This styling is an extra step which is likely not required. ***
  //
  // Why is it here? To ensure:
  // 1. the element is able to have focus and selection.
  // 2. if the element was to flash render it has minimal visual impact.
  // 3. less flakyness with selection and copying which **might** occur if
  //    the textarea element is not visible.
  //
  // The likelihood is the element won't even render, not even a
  // flash, so some of these are just precautions. However in
  // Internet Explorer the element is visible whilst the popup
  // box asking the user for permission for the web page to
  // copy to the clipboard.
  //
  // Place in the top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  // Avoid flash of the white box if rendered for any reason.
  textArea.style.background = 'transparent';
  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
  } catch (err) {
    console.log('unable to copy');
  }

  document.body.removeChild(textArea);
}
