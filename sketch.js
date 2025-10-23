function draw() { 
    // 计算百分比
    let percentage = (finalScore / maxScore) * 100;
    
    // -----------------------------------------------------------------
    // 1. 背景和循环控制
    // -----------------------------------------------------------------
    if (percentage >= 90 || fireworks.length > 0) {
        // 如果分数达到 90 或当前有烟火在活动，使用黑色透明背景以创建拖尾效果
        background(0, 0, 0, 25); 
        loop(); // 确保在有烟火活动时持续循环
    } else {
        // 否则，使用白色背景并清除
        background(255); 
    }

    // -----------------------------------------------------------------
    // 2. 烟火特效触发逻辑
    // -----------------------------------------------------------------
    if (percentage >= 90 && !firework_launched) {
        // 当分数达到 90% 以上且尚未触发过烟火时
        
        // 连续发射 5 个烟火
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                fireworks.push(new Firework());
            }, i * 300); // 每隔 300 毫秒发射一个
        }
        
        firework_launched = true; // 设置标记
    }

    // -----------------------------------------------------------------
    // 3. 更新和显示所有烟火
    // -----------------------------------------------------------------
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].show();

        // 移除已完成的烟火
        if (fireworks[i].done()) {
            fireworks.splice(i, 1);
        }
    }
    
    // -----------------------------------------------------------------
    // 4. 烟火结束时的循环停止和重置逻辑
    // -----------------------------------------------------------------
    if (fireworks.length === 0 && firework_launched) {
        if (percentage < 90) {
             // 烟火放完且分数低于 90，停止动画循环
             noLoop(); 
        } else {
             // 烟火放完但分数仍大于等于 90，重置标记，允许下一轮烟火
             firework_launched = false; 
        }
    }
    
    // -----------------------------------------------------------------
    // 5. 分数文本显示 (位于画布中央偏下)
    // -----------------------------------------------------------------
    
    colorMode(RGB); // 切换回 RGB 模式以绘制文本
    
    // 文本的Y坐标：将其放置在画布中央 (height/2) 附近
    const mainTextY = height / 2 + 50; 
    const scoreTextY = height / 2 + 130; 
    
    // 根据背景模式设置文本颜色
    if (fireworks.length > 0) {
        // 烟火模式（黑色背景）：文本使用亮色
        fill(255, 255, 0); // 亮黄色 (主文本)
    } else {
        // 非烟火模式（白色背景）：文本使用深色
        fill(50);
    }
    
    // A. 顶部鼓励/提示文本 (textSize: 80)
    textSize(80); 
    textAlign(CENTER);
    
    if (percentage >= 90) {
        text("恭喜！優異成績！", width / 2, mainTextY);
        
    } else if (percentage >= 60) {
        fill(255, 181, 35); // 黄色
        text("成績良好，請再接再厲。", width / 2, mainTextY);
        
    } else if (percentage > 0) {
        fill(200, 0, 0); // 红色
        text("需要加強努力！", width / 2, mainTextY);
        
    } else {
        fill(150);
        text(scoreText, width / 2, height / 2); // 初始文本
    }

    // B. 具体得分文本 (位于下方，textSize: 50)
    textSize(50);
    if (fireworks.length > 0) {
        fill(255); // 烟火模式下，得分数字用白色
    } else {
        fill(50); // 非烟火模式下，得分数字用深灰色
    }
    
    text(`得分: ${finalScore}/${maxScore}`, width / 2, scoreTextY);

    
    // -----------------------------------------------------------------
    // 6. 几何图形反映 (仅在非烟火模式下显示)
    // -----------------------------------------------------------------
    if (fireworks.length === 0) {
        if (percentage >= 90) {
            fill(0, 200, 50, 150); // 绿色的圆圈
            noStroke();
            circle(width / 2, height / 2 - 100, 150); // 放置在画布上半部
            
        } else if (percentage >= 60) {
            fill(255, 181, 35, 150);
            rectMode(CENTER);
            rect(width / 2, height / 2 - 100, 150, 150); // 放置在画布上半部
        }
    }
}
