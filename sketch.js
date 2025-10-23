function draw() { 
    // 计算百分比
    let percentage = (finalScore / maxScore) * 100;
    
    // -----------------------------------------------------------------
    // 核心修改 1: 根据是否触发烟火，使用不同的背景
    // -----------------------------------------------------------------
    if (percentage >= 90 || fireworks.length > 0) {
        // 如果分数达到 90 或当前有烟火在活动，使用黑色透明背景以创建拖尾效果
        background(0, 0, 0, 25); 
    } else {
        // 否则，使用白色背景并清除
        background(255); 
    }

    // -----------------------------------------------------------------
    // 核心修改 2: 烟火特效触发和循环控制
    // -----------------------------------------------------------------
    if (percentage >= 90 && !firework_launched) {
        // 当分数达到 90% 以上且尚未触发过烟火时
        
        // 1. 强制进入循环模式以渲染动画
        loop(); 
        
        // 2. 连续发射 5 个烟火
        for (let i = 0; i < 5; i++) {
            // 使用 setTimeout 延迟发射，制造连续效果
            setTimeout(() => {
                fireworks.push(new Firework());
            }, i * 300); // 每隔 300 毫秒发射一个
        }
        
        firework_launched = true; // 设置标记，防止在同一分数下重复生成
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
    
    // -----------------------------------------------------------------
    // 核心修改 3: 烟火结束时的循环停止 (仅当烟火全部消失且分数低于 90 时)
    // -----------------------------------------------------------------
    if (fireworks.length === 0 && firework_launched) {
        // 烟火已经放完，且分数已接收（firework_launched=true表示已经处理过一次）
        
        // 检查是否需要停止循环
        if (percentage < 90) {
             // 如果分数低于 90，停止动画循环
             noLoop(); 
        } else {
             // 如果分数仍大于等于 90，重置 firework_launched 标记，允许再次触发烟火
             // 这将允许在下一次 draw() 运行时再次进入 `if (percentage >= 90 && !firework_launched)` 块，
             // 从而无限循环放烟火，直到分数低于 90
             firework_launched = false; 
        }
    }
    
    // -----------------------------------------------------------------
    // B. 分数文本和几何图形显示 (保持原有逻辑)
    // -----------------------------------------------------------------
    colorMode(RGB); // 切换回 RGB 模式以绘制文本和几何图形
    
    // 文本位置调整：如果在放烟火，可能需要调整文本位置，避免被特效遮挡
    let textYOffset = (fireworks.length > 0 && percentage >= 90) ? -100 : -50; 

    textSize(80); 
    textAlign(CENTER);
    
    if (percentage >= 90) {
        // 烟火模式下，文字改为黄色更清晰
        fill(255, 255, 0); 
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
    fill(200); 
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50 + textYOffset);
}
