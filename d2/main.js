let canvas = document.getElementById('myCanvas'),
    ctx = canvas.getContext('2d');
//粒子化的时候的像素倍率、粒子大小
const rate = 3;
const size = 2;
//单个粒子动画时长
const duration = 3000;

//画布宽高
let [cw, ch] = [canvas.width, canvas.height];
//动画效果
let type = 'gather';
//换算后的行列粒子数
let [rows, cols] = [Math.ceil(cw/rate), Math.ceil(ch/rate)];
//有效粒子的集合
let particles = [];
//开始时间与当前时间
let st = +new Date(),
    nt = +new Date();
let maxDelay = 0;

function easeInOut(t,b,c,d){
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
}
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
    this.delay = 0;
    this.duration = duration;
    this.cur_time = 0;
    this.fillStyle = fillstyle;
    this.finish = false;
}
Particle.prototype = {
    'constructor': Particle,
    'init' : function(){
        switch (type){
            case 'gather':
                this.sx = this.x + (Math.random()-0.5)*6;
                this.sy = this.y + (Math.random()-0.5)*6;
                this.tx = rows/2;
                this.ty = cols;
                break;
        }
        return this;
    },
    'getTargetPositon' : function (){
        switch (type){
            case 'gather':
                if(nt -st < this.delay){
                    return this;
                }
                this.tx = easeInOut(this.cur_time, rows/2, this.sx - rows/2, this.duration);
                this.ty = easeInOut(this.cur_time, cols, this.sy - cols, this.duration);
                this.cur_time = nt - st - this.delay;
                if(this.cur_time>this.duration){
                    this.finish = true;
                }
                // this.tx = this.tx + (this.sx - this.tx)/120;
                // this.ty = this.ty + (this.sy - this.ty)/120;
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
    let delay = 0;
    /*
    * 第i行，j列位置的粒子第一个像素的信息在data中位置
    * r: (i*imageData.width+j)*rate*4
    * g: (i*imageData.width+j)*rate*4+1
    * b: (i*imageData.width+j)*rate*4+2
    * a: (i*imageData.width+j)*rate*4+3
    */
    for(let i=0; i<cols; i++){
        let f = 0;
        for(let j=0; j<rows; j++){
            if(imageData.data[(i*imageData.width+j)*4*rate + 3] >= 140){
                f = 1;
                let fillstyle = 'rgba('+ imageData.data.slice((i*imageData.width+j)*rate*4, (i*imageData.width+j)*rate*4+4).join(',') +')';
                let particle = new Particle(j, i, fillstyle);
                particle.delay =  delay + Math.random()*2000;
                if(particle.delay>maxDelay){
                    maxDelay = particle.delay;
                }
                particles.push(particle.init());
            }
        }
        if(f){
            delay += 50;
            f = 0;
        }
    }
    return particles;
}
// drawText('粒子化');
drawImg('./logo.png');
function initAnimate() {
    particles.forEach(function (v, i, a) {
        v.init();
    });
}
function animate() {
    nt = +new Date();
    ctx.clearRect(0, 0, cw, ch);
    particles.forEach(function (v, i, a) {
        v.paint().getTargetPositon();
    });
    if(nt > maxDelay + duration + st + 1000){
        console.log('finished');
        cancelAnimationFrame(doAnimate);
        return;
    }
    requestAnimationFrame(animate);
}
initAnimate();
let doAnimate = requestAnimationFrame(animate);




