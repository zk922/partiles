let canvas = document.getElementById('myCanvas'),
    ctx = canvas.getContext('2d');
//粒子化的时候的像素倍率、粒子大小
const rate = 3;
const size = 2;
//粒子的随机偏移度
const diverge = 6;
// /画布宽高
let [cw, ch] = [canvas.width, canvas.height];
//动画效果
let type = 'floating';
//换算后的行列粒子数
let [rows, cols] = [Math.ceil(cw/rate), Math.ceil(ch/rate)];
//有效粒子的集合
let particles = [],
    particleActive = 0;
const maxPaticleActive = 40;
//粒子对象构建方法
function Particle(x , y, fillstyle){
    //x,y原本粒子的行列位置，实际像素位置为x*rate，y*rate
    this.x = x;
    this.y = y;
    //确定动画效果后，粒子初始行列偏移位置
    this.sx = x;
    this.sy = y;
    //粒子的目标偏移位置
    this.tx = x;
    this.ty = y;
    this.fillStyle = fillstyle;
    this.diverge = diverge;
    this.active = false;
    this.direction = Math.random()*2*Math.PI;
}
Particle.prototype = {
    'constructor': Particle,
    'init' : function(){
        switch (type){
            case 'floating':
                this.tx = this.sx = this.x + (Math.random()-0.5)*this.diverge;
                this.ty = this.sy = this.y + (Math.random()-0.5)*this.diverge;
                if(Math.random()<maxPaticleActive/particles.length && particleActive<maxPaticleActive){
                    this.active = true;
                    particleActive++;
                }
                break;
        }
        return this;
    },
    'getTargetPositon' : function (){
        switch (type){
            case 'floating':
                if(particleActive<maxPaticleActive && Math.random()<maxPaticleActive/particles.length){
                    this.active = true;
                    particleActive++;
                }
                if(!this.active){
                    return this;
                }
                if(this.tx>cw || this.ty>ch || this.tx<0 || this.ty<0){
                    this.tx = this.sx;
                    this.ty = this.sy;
                    this.active = false;
                    particleActive--;
                    return this;
                }
                // this.tx = this.x + (Math.random()-0.5)*this.diverge;
                // this.ty = this.y + (Math.random()-0.5)*this.diverge;
                this.tx = this.tx + Math.cos(this.direction)*0.2;
                this.ty = this.ty + Math.sin(this.direction)*0.2;
                break;
        }
        return this;
    },
    'paint' : function(){
        ctx.save();
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(this.tx*rate, this.ty*rate, size, size);
        ctx.restore();
        return this;
    }
};

//输入文本
function drawText(text){
    ctx.save();
    ctx.font = 'bold 200px Microsoft Yahe';
    ctx.fillStyle = '#83d0f2';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text , cw/2, ch/2);
    ctx.restore();
    getParticleData();
}
//输入图片
function drawImg(imgSrc){
    let img = new Image();
    img.src = imgSrc;
    img.onload = function () {
        ctx.save();
        ctx.drawImage(this, cw/2-this.width/2, ch/2-this.height/2);
        ctx.restore();
        getParticleData();
    }
}

//获取粒子对象列表
function getParticleData(){
    let imageData = ctx.getImageData(0, 0, cw, ch);
    ctx.clearRect(0, 0, cw, ch);
    /*
    * 第i行，j列位置的粒子第一个像素的信息在data中位置
    * r: (i*imageData.width+j)*rate*4
    * g: (i*imageData.width+j)*rate*4+1
    * b: (i*imageData.width+j)*rate*4+2
    * a: (i*imageData.width+j)*rate*4+3
    */
    for(let i=0; i<cols; i++){
        for(let j=0; j<rows; j++){
            if(imageData.data[(i*imageData.width+j)*4*rate + 3] >= 140){
                let fillstyle = 'rgba('+ imageData.data.slice((i*imageData.width+j)*rate*4, (i*imageData.width+j)*rate*4+4).join(',') +')';
                let particle = new Particle(j, i, fillstyle);
                particles.push(particle.init());
            }
        }
    }
    return particles;
}
// drawText('粒子化');
drawImg('./logo.png');
function initAnimate(animate) {
    particles.forEach(function (v, i, a) {
        v.init();
    });
    animate();
}
function animate() {
    ctx.clearRect(0, 0, cw, ch);
    particles.forEach(function (v, i, a) {
        v.paint().getTargetPositon();
    });
    requestAnimationFrame(animate);
}
initAnimate(animate);




