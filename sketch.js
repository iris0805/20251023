// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------

// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字

// (新增) 煙火相關的全域變數
let fireworks = []; // 儲存所有煙火物件的陣列
let gravity;        // 重力向量

window.addEventListener('message', function (event) {
    // 執行來源驗證...
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // ----------------------------------------
        // (新增) 檢查是否滿分以觸發煙火
        // ----------------------------------------
        if (finalScore > 0 && maxScore > 0 && finalScore === maxScore) {
            // 滿分！發射 3-5 個煙火
            let numFireworks = floor(random(3, 6));
            for (let i = 0; i < numFireworks; i++) {
                fireworks.push(new Firework());
            }
            loop(); // <<<<< 關鍵：啟動 p5.js 動畫迴圈
        }
        
        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製
        // ----------------------------------------
        if (typeof redraw === 'function') {
            // 立即重繪一次以顯示最新分數
            // 如果 loop() 啟動了, 這只是動畫的第一幀
            // 如果 loop() 沒啟動, 這就是靜態的唯一一幀
            redraw(); 
        }
    }
}, false);


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    // ... (其他設置)
    createCanvas(windowWidth / 2, windowHeight / 2); 
    
    // (修改) 初始化重力，並設定顏色模式
    gravity = createVector(0, 0.2);
    colorMode(HSB); // HSB 模式讓煙火顏色更鮮豔
    
    noLoop(); // 預設保持不循環，直到被觸發
} 

function draw() { 
    // (修改) 根據是否在動畫中，決定背景的繪製方式
    if (!isLooping()) {
        // 如果是靜態顯示（沒有動畫），使用實心背景
        colorMode(RGB); // 恢復成 RGB 模式繪製 UI
        background(255);
    } else {
        // 如果在動畫中，使用半透明背景來製作拖尾效果
        colorMode(RGB); // 確保 UI 顏色正確
        noStroke();
        fill(255, 25); // (R, G, B, Alpha) - 淺淺的白色，透明度 25
        rectMode(CORNER);
        rect(0, 0, width, height);
    }
    
    // 計算百分比
    let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;

    textSize(80); 
    textAlign(CENTER);
    
    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    // -----------------------------------------------------------------
    colorMode(RGB); // 確保文字顏色使用 RGB
    if (percentage >= 90) {
        fill(0, 200, 50); 
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
    } else if (percentage >= 60) {
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
    } else if (percentage > 0) {
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
    } else {
        fill(150);
        // (修改) 處理尚未收到分數的狀況
        let displayText = (scoreText === "") ? "等待分數中..." : scoreText;
        text(displayText, width / 2, height / 2);
    }

    // 顯示具體分數
    textSize(50);
    fill(50);
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (畫面反映二)
    // -----------------------------------------------------------------
    
    if (percentage >= 90) {
        fill(0, 200, 50, 150); 
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
    } else if (percentage >= 60) {
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        noStroke();
        rect(width / 2, height / 2 + 150, 150, 150);
    }
    
    // -----------------------------------------------------------------
    // C. (新增) 繪製、更新和清理煙火
    // -----------------------------------------------------------------
    
    let allFireworksDone = true; // 假設所有煙火都放完了
    
    // 倒著遍歷陣列，這樣才能安全地在迴圈中刪除元素
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].show();
        
        if (fireworks[i].isDone()) {
            fireworks.splice(i, 1); // 移除已經放完的煙火
        } else {
            allFireworksDone = false; // 只要還有一個沒放完，就設為 false
        }
    }

    // (新增) 如果所有煙火都放完了，且陣列已空，就停止動畫
    if (allFireworksDone && fireworks.length === 0 && isLooping()) {
        noLoop(); // 停止動畫
        // 並且強制重繪一次，這次 draw() 會因為 isLooping() == false 
        // 而使用實心背景，清除所有殘影
        redraw(); 
    }
}


// =================================================================
// (新增) D. 煙火效果的 Class (類別)
// =================================================================

/**
 * 煙火的 "火花" 顆粒
 */
class Particle {
    constructor(x, y, hue) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D(); // 隨機的 2D 方向
        this.vel.mult(random(1, 8));     // 隨機的爆炸力道
        this.acc = createVector(0, 0);
        this.lifespan = 255; // 生命值 (用於透明度)
        this.hue = hue;        // 繼承煙火的顏色
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0); // 重設加速度
        this.lifespan -= 5; // 漸漸消失
    }

    done() {
        return (this.lifespan < 0);
    }

    show() {
        colorMode(HSB); // 使用 HSB 模式
        noStroke();
        // 越接近消失，飽和度越低
        let saturation = map(this.lifespan, 0, 255, 0, 100);
        fill(this.hue, saturation, 100, this.lifespan / 255);
        ellipse(this.pos.x, this.pos.y, 6, 6);
    }
}


/**
 * 煙火 "火箭" 本身
 */
class Firework {
    constructor() {
        // 從底部隨機 x 位置發射
        this.pos = createVector(random(width), height);
        // 往上的速度
        this.vel = createVector(0, random(-17, -10));
        this.acc = createVector(0, 0);
        this.exploded = false; // 是否已爆炸
        this.particles = [];   // 儲存爆炸後的火花
        this.hue = random(255); // 隨機指定一個顏色 (色相)
    }

    applyForce(force) {
        this.acc.add(force);
    }

    // 更新火箭或火花
    update() {
        if (!this.exploded) {
            // --- 火箭階段 ---
            this.applyForce(gravity);
            this.vel.add(this.acc);
            this.pos.add(this.vel);
            this.acc.mult(0);

            // 如果火箭速度歸零 (到達頂點)，就爆炸
            if (this.vel.y >= 0) {
                this.explode();
            }
        } else {
            // --- 爆炸階段 ---
            // 更新所有火花
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].applyForce(gravity);
                this.particles[i].update();
                if (this.particles[i].done()) {
                    this.particles.splice(i, 1);
                }
            }
        }
    }

    // 爆炸！
    explode() {
        this.exploded = true;
        // 產生 100 個火花顆粒
        for (let i = 0; i < 100; i++) {
            this.particles.push(new Particle(this.pos.x, this.pos.y, this.hue));
        }
    }

    // 檢查煙火是否完全結束
    isDone() {
        return (this.exploded && this.particles.length === 0);
    }

    // 繪製火箭或火花
    show() {
        colorMode(HSB);
        if (!this.exploded) {
            // --- 畫火箭 ---
            stroke(this.hue, 100, 100);
            strokeWeight(4);
            point(this.pos.x, this.pos.y);
        } else {
            // --- 畫火花 ---
            for (let particle of this.particles) {
                particle.show();
            }
        }
    }
}
