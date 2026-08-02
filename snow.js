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
  log("[snowfall] prefs d=" + density + " s=" + fallSpeed + " sz=" + flakeSize + " o=" + opacity);

  // Экран НЕ читаем обратно из ObjC: чтение double-возвращающих методов
  // (valueForKeyPath -> doubleValue) через этот мост даёт мусор (в
  // прошлом логе screen пришёл как "0x1x0x1"), а потом это ещё и
  // ломает арифметику в JS ("0x1" + size = склейка строк, а не сумма).
  // Поэтому просто берём фиксированные границы с запасом под любой iPhone.
  var SCREEN_W = 430;
  var FALL_Y   = 1100;

  var app = r_msg2(r_class("UIApplication"), "sharedApplication");
  var win = r_msg2(app, "keyWindow");
  if (!win || win === "0x0") { log("[snowfall] no keyWindow, abort"); return; }
  var rootLayer = r_msg2(win, "layer");

  var kPosX = r_nsstr("position.x");
  var kPosY = r_nsstr("position.y");
  var kBW   = r_nsstr("bounds.size.width");
  var kBH   = r_nsstr("bounds.size.height");
  var kFall = r_nsstr("fall");

  function setNum(obj, keyPathStr, value) {
    var num = r_msg2(r_class("NSNumber"), "numberWithDouble:", value);
    r_msg2_main(obj, "setValue:forKeyPath:", num, keyPathStr);
  }

  var cgWhite = r_msg2(r_msg2(r_class("UIColor"), "whiteColor"), "CGColor");

  var count = Math.max(10, Math.round(density));
  for (var i = 0; i < count; i++) {
    if (i % 10 === 0) log("[snowfall] flake " + i + "/" + count);

    var size = flakeSize * (0.5 + Math.random());
    var x    = Math.random() * SCREEN_W;

    var flake = r_msg2(r_class("CALayer"), "layer");

    setNum(flake, kBW, size);
    setNum(flake, kBH, size);
    setNum(flake, kPosX, x);
    setNum(flake, kPosY, -size);

    r_msg2_main(flake, "setBackgroundColor:", cgWhite);
    r_msg2_main(flake, "setCornerRadius:", size / 2);
    r_msg2_main(flake, "setOpacity:", opacity * (0.6 + Math.random() * 0.4));

    r_msg2_main(rootLayer, "addSublayer:", flake);

    var dur = (6 + Math.random() * 6) / fallSpeed;

    var anim = r_msg2(r_class("CABasicAnimation"), "animationWithKeyPath:", kPosY);
    r_msg2_main(anim, "setFromValue:", r_msg2(r_class("NSNumber"), "numberWithDouble:", -size));
    r_msg2_main(anim, "setToValue:",   r_msg2(r_class("NSNumber"), "numberWithDouble:", FALL_Y));
    r_msg2_main(anim, "setDuration:", dur);
    r_msg2_main(anim, "setRepeatCount:", 100000);
    r_msg2_main(anim, "setTimeOffset:", Math.random() * dur);

    r_msg2_main(flake, "addAnimation:forKey:", anim, kFall);
  }

  log("[snowfall] spawned " + count + " flakes, done");
})();
