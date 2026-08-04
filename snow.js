// @param: slider | flakes | Snowflakes | 15 | 5-40

(() => {
  log("[snow] 1 start");

  var total = r_pref_num("flakes") || 15;
  total = Math.floor(total);

  // Кешируем классы один раз — объекты классов никогда не деаллоцируются
  var clNum  = r_class("NSNumber");
  var clLay  = r_class("CALayer");
  var clAnim = r_class("CABasicAnimation");
  var clApp  = r_class("UIApplication");
  var clCol  = r_class("UIColor");
  log("[snow] 2 classes ok");

  // Получаем корневой CALayer SpringBoard
  var app  = r_msg2(clApp, "sharedApplication");
  var win  = r_msg2(app,   "keyWindow");
  var root = r_msg2(win,   "layer");
  log("[snow] 3 root=" + root);

  // Белый CGColor — НЕ вкладываем вызовы, всегда отдельные переменные
  var uiWhite = r_msg2(clCol, "whiteColor");
  var cgWhite = r_msg2(uiWhite, "CGColor");
  log("[snow] 4 cgWhite=" + cgWhite);

  // NSString-ключи для KVC — один раз, живут в замыкании
  var kBW = r_nsstr("bounds.size.width");
  var kBH = r_nsstr("bounds.size.height");
  var kPX = r_nsstr("position.x");
  var kPY = r_nsstr("position.y");
  var kAK = r_nsstr("snow");
  log("[snow] 5 strings ok");

  // Создаём снежинки по одной через setTimeout — каждый колбэк ~15 вызовов,
  // скрипт возвращается мгновенно и не триггерит QuickLoader run-timeout.
  for (var i = 0; i < total; i++) {
    (function(idx) {
      setTimeout(function() {
        log("[snow] flake " + idx);

        var sz  = 2 + Math.random() * 4;
        var x   = Math.random() * 430;
        var dur = 6 + Math.random() * 8;
        var off = Math.random() * dur;
        var op  = 0.7 + Math.random() * 0.3;

        // Создаём слой
        var fl = r_msg2(clLay, "layer");

        // NSNumber для каждого числа — отдельно, без вложенности
        var nSZ = r_msg2(clNum, "numberWithDouble:", sz);
        var nX  = r_msg2(clNum, "numberWithDouble:", x);
        var nYI = r_msg2(clNum, "numberWithDouble:", -sz);

        // Задаём геометрию через KVC (мост не умеет передавать CGPoint/CGSize напрямую)
        r_msg2_main(fl, "setValue:forKeyPath:", nSZ, kBW);
        r_msg2_main(fl, "setValue:forKeyPath:", nSZ, kBH);
        r_msg2_main(fl, "setValue:forKeyPath:", nX,  kPX);
        r_msg2_main(fl, "setValue:forKeyPath:", nYI, kPY);

        // Внешний вид — setCornerRadius:/setOpacity: принимают скаляры, работают напрямую
        r_msg2_main(fl, "setCornerRadius:", sz / 2);
        r_msg2_main(fl, "setOpacity:", op);
        r_msg2_main(fl, "setBackgroundColor:", cgWhite);

        // Добавляем слой в дерево
        r_msg2_main(root, "addSublayer:", fl);

        // Анимация падения — Core Animation крутит её сама, JS больше не нужен
        var anim = r_msg2(clAnim, "animationWithKeyPath:", kPY);

        var nFr = r_msg2(clNum, "numberWithDouble:", -sz);
        var nTo = r_msg2(clNum, "numberWithDouble:", 1100);

        r_msg2_main(anim, "setFromValue:", nFr);
        r_msg2_main(anim, "setToValue:",   nTo);
        r_msg2_main(anim, "setDuration:", dur);
        r_msg2_main(anim, "setRepeatCount:", 9999);
        r_msg2_main(anim, "setTimeOffset:", off);

        r_msg2_main(fl, "addAnimation:forKey:", anim, kAK);

        log("[snow] flake " + idx + " done");
      }, idx * 100); // 100 мс между снежинками — минимальная нагрузка
    })(i);
  }

  log("[snow] 6 timers armed, returning");
})();
