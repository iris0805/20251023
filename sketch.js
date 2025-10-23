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
    // 5. 分数文本显示 (这是您关注的部分)
    // -----------------------------------------------------------------
    
    colorMode(RGB); // 切换回 RGB 模式以绘制文本
    
    // 调整文本位置和颜色，使其在白色或黑色背景下都清晰可见
    let mainTextY = height / 2 - 50; 
    let scoreTextY = height / 2 + 50;
    
    if (fireworks.length > 0) {
        // 烟火模式（黑色背景）: 文本使用亮色并稍微上移，避免烟火遮挡
        mainTextY = height / 2 - 100; 
        scoreTextY = height / 2 + 0;
        fill(255, 255, 0); // 亮黄色
    } else {
        // 非烟火模式（白色背景）: 文本使用深色
        fill(50);
    }
    
    // A. 顶部鼓励/提示文本
    textSize(80); 
    textAlign(CENTER);
    
    if (percentage >= 90) {
        // 90分以上：文本颜色已经在上方设置为亮黄或绿色
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

    // B. 具体得分文本 (总是显示在主文本下方)
    textSize(50);
    if (fireworks.length > 0) {
        fill(255); // 烟火模式下，得分数字用白色
    } else {
        fill(50); // 非烟火模式下，得分数字用深灰色
    }
    
    text(`得分: ${finalScore}/${maxScore}`, width / 2, scoreTextY + 50);

    
    // -----------------------------------------------------------------
    // C. 几何图形反映 (为了简洁和专注于烟火，这里可以省略，或者您保留它们)
    // -----------------------------------------------------------------
    if (percentage >= 90 && fireworks.length === 0) {
        // 仅在非烟火模式下显示几何图形，避免与烟火重叠
        fill(0, 200, 50, 150); // 绿色的圆圈
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 60 && fireworks.length === 0) {
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, 150, 150);
    }
}
