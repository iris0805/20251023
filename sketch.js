// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------

// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字

// -----------------------------------------------------------------
// 步驟二：煙火特效所需的全域變數及類別
// -----------------------------------------------------------------
let fireworks = []; // 储存所有 Firework 对象的数组
let gravity;        // 重力向量
let firework_launched = false; // 标记是否已经放过烟火，避免连续放

// --- 粒子类 (Particle Class) ---
class Particle {
    constructor(x, y, hue, firework) {
        this.pos = createVector(x, y);
        this.firework = firework; 
        this.lifespan = 255;
        this.hue = hue;
        this.vel = createVector(0, 0); 
        this.acc = createVector(0, 0); 
        
        if (this.firework) {
            // 烟火主体向上发射
            this.vel = createVector(0, random(-12, -8));
        } else {
            // 爆炸碎片向随机方向散射
            this.vel = p5.Vector.random2D();
            this.vel.mult(random(2, 10));
        }
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        if (!this.firework) {
            this.vel.mult(0.9); // 阻力
            this.lifespan -= 4; 
        }
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    done() {
        return this.lifespan < 0;
    }

    show() {
        colorMode(HSB);
        if (!this.firework) {
            // 爆炸碎片使用较小的点和生命周期透明度
            strokeWeight(2);
            stroke(this.hue, 255, 255, this.lifespan);
        } else {
            // 烟火主体使用较大的点
            strokeWeight(4);
            stroke(this.hue, 255, 255);
        }
        point(this.pos.x, this.pos.y);
        colorMode(RGB); 
    }
}

// --- 烟火主体类 (Firework Class) ---
class Firework {
    constructor() {
        this.hue = random(255);
        // 在画布底部随机位置创建
        this.firework = new Particle(random(width), height, this.hue, true);
        this.exploded = false;
        this.particles = [];
    }

    update() {
        if (!this.exploded) {
            this.firework.applyForce(gravity);
            this.firework.update();
            
            // 检查是否达到爆炸点 (速度开始向下时爆炸)
            if (this.firework.vel.y >= 0) {
                this.exploded = true;
                this.explode();
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].applyForce(gravity);
            this.particles[i].update();
            if (this.particles[i].done()) {
                this.particles.splice(i, 1);
            }
        }
    }

    explode() {
        // 爆炸，创建 100 个碎片粒子
        for (let i = 0; i < 100; i++) {
            let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hue, false);
            this.particles.push(p);
        }
    }

    show() {
        if (!this.exploded) {
            this.firework.show();
        }
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].show();
        }
    }

    done() {
        return this.exploded && this.particles.length === 0;
    }
}


window.addEventListener('message', function (event) {
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        finalScore = data.score;
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // 关键步骤: 接收到新分数时，重置烟火标记并重新绘图
        firework_launched = false; // 确保可以根据新分数重新触发
        if (typeof redraw === 'function') {
            redraw(); 
        }
    }
}, false);


// =================================================================
// 步驟三：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    createCanvas(windowWidth / 2, windowHeight / 2); 
    colorMode(HSB, 255); // 使用 HSB 颜色模式，方便控制烟火颜色
    gravity = createVector(0, 0.2); // 定义重力
    background(255); 
    noLoop(); // 初始设置 noLoop()
} 

function draw() { 
    // 背景，稍微透明以制造烟火拖尾效果
    background(0, 0, 0, 25); // 黑色背景，透明度 25 (只有在触发烟火时才需要这个黑色背景)

    // 计算百分比
    let percentage = (finalScore / maxScore) * 100;
    
    // -----------------------------------------------------------------
    // A. 烟火特效触发逻辑
    // -----------------------------------------------------------------
    if (percentage >= 90 && !firework_launched) {
        // 当分数达到 90% 以上且尚未触发过烟火时
        
        // 强制进入循环模式以渲染动画
        loop(); 
        
        // 连续发射 5 个烟火
        for (let i = 0; i < 5; i++) {
            // 使用 setTimeout 延迟发射，制造连续效果
            setTimeout(() => {
                fireworks.push(new Firework());
            }, i * 300); // 每隔 300 毫秒发射一个
        }
        
        firework_launched = true; // 设置标记，防止在同一分数下重复生成
        
    } else if (percentage < 90 && firework_launched) {
        // 如果分数低于 90，且烟火已经放完，则停止循环 (仅在没有烟火粒子时)
        if(fireworks.length === 0) {
             noLoop(); 
             background(255); // 恢复白色背景
        }
    }

    // 更新和显示所有烟火
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].show();

        // 移除已完成的烟火
        if (fireworks[i].done()) {
            fireworks.splice(i, 1);
        }
    }
    
    // 如果没有烟火正在活动，且 noLoop 尚未被调用，确保背景是白色的，并停止循环
    if (fireworks.length === 0 && percentage < 90 && firework_launched) {
        noLoop(); 
        background(255);
    }
    
    // -----------------------------------------------------------------
    // B. 分数文本和几何图形显示 (保持原有逻辑)
    // -----------------------------------------------------------------
    colorMode(RGB); // 切换回 RGB 模式以绘制文本和几何图形
    
    // 如果正在放烟火，文本可以稍微改变颜色或位置，避免被烟火遮盖
    let textYOffset = (firework_launched && percentage >= 90) ? 0 : -50;

    textSize(80); 
    textAlign(CENTER);
    
    if (percentage >= 90) {
        fill(255, 255, 0); // 烟火模式下，文字改为黄色更清晰
        text("恭喜！優異成績！", width / 2, height / 2 + textYOffset);
        
    } else if (percentage >= 60) {
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage > 0) {
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
        
    } else {
        fill(150);
        text(scoreText, width / 2, height / 2);
    }

    // 显示具体分数
    textSize(50);
    fill(200); // 烟火模式下，分数文本改为浅色
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50 + textYOffset);
    
    
    // 几何图形反映 (为了配合烟火，我们在这里省略了几何图形，或者您可以调整它们的位置)
}
