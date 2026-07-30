// @param: switch | enableSnow | Enable Snow Effect | true

(() => {
    log("[SnowTweak] Starting tweak initialization...");

    try {
        // 1. Get main UIApplication instance
        var appClass = r_class("UIApplication");
        if (!appClass) {
            log("[SnowTweak] Error: UIApplication class not found.");
            return;
        }

        var app = r_msg2(appClass, "sharedApplication");
        if (!app) {
            log("[SnowTweak] Error: Could not get sharedApplication.");
            return;
        }

        var win = r_msg2(app, "keyWindow");
        if (!win) {
            log("[SnowTweak] Error: Could not get keyWindow.");
            return;
        }

        // 2. Create Particle Emitter Layer
        var emitterClass = r_class("CAEmitterLayer");
        if (!emitterClass) {
            log("[SnowTweak] Error: CAEmitterLayer class not found.");
            return;
        }

        var emitter = r_msg2(emitterClass, "layer");

        // Set Emitter Shape to Line
        var shapeStr = r_nsstr("line");
        if (r_responds(emitter, "setEmitterShape:")) {
            r_msg2(emitter, "setEmitterShape:", shapeStr);
        }

        // 3. Load SF Symbol for snowflake (circle.fill)
        var imgClass = r_class("UIImage");
        var sfName = r_nsstr("circle.fill");
        var snowImg = r_msg2(imgClass, "systemImageNamed:", sfName);
        var cgImg = r_msg2(snowImg, "CGImage");

        // 4. Configure Particle Cell Properties
        var cellClass = r_class("CAEmitterCell");
        var cell = r_msg2(cellClass, "emitterCell");

        if (r_responds(cell, "setContents:")) {
            r_msg2(cell, "setContents:", cgImg);
        }
        if (r_responds(cell, "setBirthRate:")) {
            r_msg2(cell, "setBirthRate:", 12.0);
        }
        if (r_responds(cell, "setLifetime:")) {
            r_msg2(cell, "setLifetime:", 10.0);
        }
        if (r_responds(cell, "setVelocity:")) {
            r_msg2(cell, "setVelocity:", 45.0);
        }
        if (r_responds(cell, "setVelocityRange:")) {
            r_msg2(cell, "setVelocityRange:", 15.0);
        }
        if (r_responds(cell, "setScale:")) {
            r_msg2(cell, "setScale:", 0.03);
        }
        if (r_responds(cell, "setScaleRange:")) {
            r_msg2(cell, "setScaleRange:", 0.02);
        }

        // 5. Attach Cell to Emitter Layer
        var arrayClass = r_class("NSArray");
        var cells = r_msg2(arrayClass, "arrayWithObject:", cell);
        r_msg2(emitter, "setEmitterCells:", cells);

        // 6. Attach Layer to SpringBoard Main Window on Main Thread
        var winLayer = r_msg2(win, "layer");
        r_msg2_main(winLayer, "addSublayer:", emitter);

        // Memory cleanup for allocated NSStrings
        r_msg2(shapeStr, "release");
        r_msg2(sfName, "release");

        log("[SnowTweak] Snow layer successfully added to SpringBoard!");
    } catch (err) {
        log("[SnowTweak] Error encountered: " + err);
    }
})();
