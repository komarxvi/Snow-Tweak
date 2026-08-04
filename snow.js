// @param: slider | flakes | Snowflakes | 5 | 2-10

(() => {
  log("[snow] 1 start");

  var N = Math.floor(r_pref_num("flakes") || 5);
  if (N < 2)  N = 2;
  if (N > 10) N = 10;

  // Кэшируем классы — class-объекты никогда не деаллоцируются
  var clN = r_class("NSNumber");
  var clL = r_class("CALayer");
  var clA = r_class("CABasicAnimation");
  log("[snow] 2 classes ok");

  // Получаем корневой слой SpringBoard
  var app  = r_msg2(r_class("UIApplication"), "sharedApplication");
  var win  = r_msg2(app, "keyWindow");
  var root = r_msg2(win, "layer");
  log("[snow] 3 root=" + root);

  // Белый CGColor — два отдельных вызова, без вложенности
  var wht = r_msg2(r_class("UIColor"), "whiteColor");
  var cgW = r_msg2(wht, "CGColor");
  log("[snow] 4 cgW=" + cgW);

  // KVC key-path строки — один раз, живут на весь скрипт
  var kBW = r_nsstr("bounds.size.width");
  var kBH = r_nsstr("bounds.size.height");
  var kPX = r_nsstr("position.x");
  var kPY = r_nsstr("position.y");
  var kAK = r_nsstr("snow");
  log("[snow] 5 strings ok, N=" + N);

  for (var i = 0; i < N; i++) {
    var sz  = 2.5 + Math.random() * 3.5;
    var x   = 20  + Math.random() * 390;
    var dur = 7   + Math.random() * 7;
    var off = Math.random() * dur;
    log("[snow] flake " + i + " sz=" + sz.toFixed(1) + " x=" + x.toFixed(0));

    // Создаём CALayer
    var fl = r_msg2(clL, "layer");
    log("[snow] flake " + i + " layer=" + fl);

    // --- CALayer setters: r_msg2_main (доказано в diag.js шаги 8, 12) ---
    // NSNumber создаём вложенным r_msg2 прямо в аргументе — diag.js шаг 14 это делал и не упал
    r_msg2_main(fl, "setValue:forKeyPath:", r_msg2(clN, "numberWithDouble:", sz), kBW);
    r_msg2_main(fl, "setValue:forKeyPath:", r_msg2(clN, "numberWithDouble:", sz), kBH);
    r_msg2_main(fl, "setValue:forKeyPath:", r_msg2(clN, "numberWithDouble:", x),  kPX);
    r_msg2_main(fl, "setBackgroundColor:", cgW);
    r_msg2_main(fl, "setOpacity:", 0.8);
    r_msg2_main(root, "addSublayer:", fl);
    log("[snow] flake " + i + " layer added");

    // --- CAAnimation setters: r_msg2 (объект не в иерархии → thread-safe) ---
    // Это убирает 5 r_msg2_main на флак и не затрагивает UI-стейт
    var an = r_msg2(clA, "animationWithKeyPath:", kPY);
    r_msg2(an, "setFromValue:", r_msg2(clN, "numberWithDouble:", -sz));
    r_msg2(an, "setToValue:",   r_msg2(clN, "numberWithDouble:", 1100.0));
    r_msg2(an, "setDuration:", dur);
    r_msg2(an, "setRepeatCount:", 9999.0);
    r_msg2(an, "setTimeOffset:", off);

    // Привязываем анимацию к слою — r_msg2_main (модификация layer tree)
    r_msg2_main(fl, "addAnimation:forKey:", an, kAK);
    log("[snow] flake " + i + " anim done");
  }

  log("[snow] all done");
})();
