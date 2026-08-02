// @param: slider | density     | Snowflakes | 70   | 20-200
// @param: slider | fallSpeed   | Fall Speed | 1.0  | 0.3-3.0
// @param: slider | flakeSize   | Flake Size | 3.0  | 1.0-8.0
// @param: slider | snowOpacity | Opacity    | 0.85 | 0.1-1.0

(() => {
  log("[snowfall] start");

  var density   = r_pref_num("density")     || 70;
  var fallSpeed = r_pref_num("fallSpeed")   || 1.0;
  var flakeSize = r_pref_num("flakeSize")   || 3.0;
  var opacity   = r_pref_num("snowOpacity") || 0.85;

  var app = r_msg2(r_class("UIApplication"), "sharedApplication");
  var win = r_msg2(app, "keyWindow");
  if (!win || win === "0x0") { log("[snowfall] no keyWindow, abort"); return; }
  var rootLayer = r_msg2(win, "layer");

  // Мост не умеет передавать сырые структуры (CGPoint/CGSize), поэтому
  // геометрию выставляем по одному числовому полю через KVC key-path:
  // CALayer официально поддерживает "position.x/y", "bounds.size.width/height".
  var kPosX = r_nsstr("position.x");
  var kPosY = r_nsstr("position.y");
  var kBW   = r_nsstr("bounds.size.width");
  var kBH   = r_nsstr("bounds.size.height");
  var kFall = r_nsstr("fall");

  function setNum(obj, keyPathStr, value) {
    var num = r_msg2(r_class("NSNumber"), "numberWithDouble:", value);
    r_msg2_main(obj, "setValue:forKeyPath:", num, keyPathStr);
  }
  function getNum(obj, keyPathStr) {
    var num = r_msg2(obj, "valueForKeyPath:", keyPathStr);
    return r_msg2(num, "doubleValue");
  }

  var screenW = getNum(rootLayer, kBW);
  var screenH = getNum(rootLayer, kBH);
  log("[snowfall] screen " + screenW + "x" + screenH);
  if (!screenW || !screenH) { log("[snowfall] bad screen size, abort"); return; }

  var cgWhite = r_msg2(r_msg2(r_class("UIColor"), "whiteColor"), "CGColor");

  var count = Math.max(10, Math.round(density));
  for (var i = 0; i < count; i++) {
    var size = flakeSize * (0.5 + Math.random());
    var x    = Math.random() * screenW;

    var flake = r_msg2(r_class("CALayer"), "layer");

    setNum(flake, kBW, size);
    setNum(flake, kBH, size);
    setNum(flake, kPosX, x);
    setNum(flake, kPosY, -size);

    r_msg2_main(flake, "setBackgroundColor:", cgWhite);
    r_msg2_main(flake, "setCornerRadius:", size / 2);
    r_msg2_main(flake, "setOpacity:", opacity * (0.6 + Math.random() * 0.4));

    r_msg2_main(rootLayer, "addSublayer:", flake);

    // Падение навсегда — целиком на стороне Core Animation,
    // JS в этом больше не участвует.
    var dur  = (6 + Math.random() * 6) / fallSpeed;
    var from = r_msg2(r_class("NSNumber"), "numberWithDouble:", -size);
    var to   = r_msg2(r_class("NSNumber"), "numberWithDouble:", screenH + size);

    var anim = r_msg2(r_class("CABasicAnimation"), "animationWithKeyPath:", kPosY);
    r_msg2_main(anim, "setFromValue:", from);
    r_msg2_main(anim, "setToValue:", to);
    r_msg2_main(anim, "setDuration:", dur);
    r_msg2_main(anim, "setRepeatCount:", 100000);
    r_msg2_main(anim, "setTimeOffset:", Math.random() * dur);

    r_msg2_main(flake, "addAnimation:forKey:", anim, kFall);
  }

  log("[snowfall] spawned " + count + " flakes");
})();
