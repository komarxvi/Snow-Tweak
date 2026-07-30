// @param: switch | enableSnow | Enable Snow Effect | true

(() => {
    log("[SnowTweak] Starting tweak initialization...");

    try {
        var appClass = r_class("UIApplication");
        if (!appClass) return;

        var app = r_msg2(appClass, "sharedApplication");
        if (!app) return;

        var win = r_msg2(app, "keyWindow");
        if (!win) return;

        var emitterClass = r_class("CAEmitterLayer");
        if (!emitterClass) return;

        var emitter = r_msg2(emitterClass, "layer");

        // Растягиваем слой снега на весь экран
        var winBounds = r_msg2(win, "bounds");
        r_msg2(emitter, "setFrame:", winBounds);

        var shapeStr = r_nsstr("line");
        if (r_responds(emitter, "setEmitterShape:")) {
            r_msg2(emitter, "setEmitterShape:", shapeStr);
        }

        var imgClass = r_class("UIImage");
        var sfName = r_nsstr("circle.fill");
        var snowImg = r_msg2(imgClass, "systemImageNamed:", sfName);
        var cgImg = r_msg2(snowImg, "CGImage");

        var cellClass = r_class("CAEmitterCell");
        var cell = r_msg2(cellClass, "emitterCell");

        if (r_responds(cell, "setContents:")) r_msg2(cell, "setContents:", cgImg);
        if (r_responds(cell, "setBirthRate:")) r_msg2(cell, "setBirthRate:", 15.0);
        if (r_responds(cell, "setLifetime:")) r_msg2(cell, "setLifetime:", 8.0);
        if (r_responds(cell, "setVelocity:")) r_msg2(cell, "setVelocity:", 50.0);
        if (r_responds(cell, "setVelocityRange:")) r_msg2(cell, "setVelocityRange:", 15.0);
        if (r_responds(cell, "setScale:")) r_msg2(cell, "setScale:", 0.03);
        if (r_responds(cell, "setScaleRange:")) r_msg2(cell, "setScaleRange:", 0.02);

        var arrayClass = r_class("NSArray");
        var cells = r_msg2(arrayClass, "arrayWithObject:", cell);
        r_msg2(emitter, "setEmitterCells:", cells);

        var winLayer = r_msg2(win, "layer");
        r_msg2_main(winLayer, "addSublayer:", emitter);

        r_msg2(shapeStr, "release");
        r_msg2(sfName, "release");

        log("[SnowTweak] Snow layer successfully added!");
    } catch (err) {
        log("[SnowTweak] Error: " + err);
    }
})();
