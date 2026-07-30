// @param: switch | enableSnow | Enable Snow Effect | true

(() => {
    log("[SnowTweak] Starting safe initialization...");

    try {
        // 1. Получаем главное окно SpringBoard
        var appClass = r_class("UIApplication");
        var app = r_msg2(appClass, "sharedApplication");
        if (!app) {
            log("[SnowTweak] Error: sharedApplication is null");
            return;
        }

        var win = r_msg2(app, "keyWindow");
        if (!win) {
            log("[SnowTweak] Error: keyWindow is null");
            return;
        }

        log("[SnowTweak] Window found successfully.");

        // 2. Создаем генератор частиц
        var emitterClass = r_class("CAEmitterLayer");
        var emitter = r_msg2(emitterClass, "layer");

        // Получаем размеры экрана
        var winBounds = r_msg2(win, "bounds");
        r_msg2_main(emitter, "setFrame:", winBounds);

        // 3. Создаем базовую снежинку (белая круглая точка через CIColor/UIColor)
        var cellClass = r_class("CAEmitterCell");
        var cell = r_msg2(cellClass, "emitterCell");

        // Настройки физики снега
        r_msg2(cell, "setBirthRate:", 12.0);
        r_msg2(cell, "setLifetime:", 10.0);
        r_msg2(cell, "setVelocity:", 40.0);
        r_msg2(cell, "setVelocityRange:", 15.0);
        r_msg2(cell, "setScale:", 0.05);
        r_msg2(cell, "setScaleRange:", 0.02);

        // Устанавливаем белый цвет для частиц
        var colorClass = r_class("UIColor");
        var whiteColor = r_msg2(colorClass, "whiteColor");
        var cgColor = r_msg2(whiteColor, "CGColor");
        
        if (r_responds(cell, "setColor:")) {
            r_msg2(cell, "setColor:", cgColor);
        }

        // 4. Привязываем частицы к слою
        var arrayClass = r_class("NSArray");
        var cells = r_msg2(arrayClass, "arrayWithObject:", cell);
        r_msg2(emitter, "setEmitterCells:", cells);

        // 5. Безопасно добавляем слой в главное окно СТРОГО в основном потоке (Main Thread)
        var winLayer = r_msg2(win, "layer");
        r_msg2_main(winLayer, "addSublayer:", emitter);

        log("[SnowTweak] SUCCESS: Snow layer attached without crash!");

    } catch (err) {
        log("[SnowTweak] CRITICAL ERROR: " + err);
    }
})();
