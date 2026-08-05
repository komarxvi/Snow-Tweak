// @param: slider | flakes | Snowflakes | 15 | 5-30

(() => {
  log("[snow] start");

  var total = Math.floor(r_pref_num("flakes") || 15);
  if (total < 5)  total = 5;
  if (total > 30) total = 30;

  // Классы — не UIKit, r_msg2 допустим
  var clN = r_class("NSNumber");
  var clL = r_class("CALayer");
  var clA = r_class("CABasicAnimation");

  // UIKit → только r_msg2_main (см. официальную доку Cyanide)
  var app  = r_msg2_main(r_class("UIApplication"), "sharedApplication");
  var win  = r_msg2_main(app, "keyWindow");
  var root = r_msg2_main(win, "layer");
  log("[snow] root=" + root);

  var wht = r_msg2_main(r_class("UIColor"), "whiteColor");
  var cgW = r_msg2_main(wht, "CGColor");
  log("[snow] cgW=" + cgW);

  // NSString-ключи (не UIKit — r_msg2 ok)
  var kBW = r_nsstr("bounds.size.width");
  var kBH = r_nsstr("bounds.size.height");
  var kPX = r_nsstr("position.x");
  var kPY = r_nsstr("position.y");
  var kAK = r_nsstr("snow");
  log("[snow] setup ok, total=" + total);

  // setTimeout — GCD background queue (документация подтверждает поддержку).
  // Внутри — только r_msg2_main для всего что касается слоёв и анимаций.
  // Это исключает и respring-таймаут (скрипт возвращается сразу),
  // и kernel panic (нет r_msg2 на background thread для UIKit-объектов).
  for (var i = 0; i < total; i++) {
    (function(idx) {
      setTimeout(function() {
        var sz  = 2.5 + Math.random() * 3.5;
        var x   = 20  + Math.random() * 390;
        var dur = 7   + Math.random() * 7;
        var off = Math.random() * dur;
        log("[snow] flake " + idx);

        // Создаём CALayer (alloc — thread-safe)
        var fl = r_msg2(clL, "layer");

        // Все операции с layer — r_msg2_main
        r_msg2_main(fl, "setValue:forKeyPath:", r_msg2(clN, "numberWithDouble:", sz), kBW);
        r_msg2_main(fl, "setValue:forKeyPath:", r_msg2(clN, "numberWithDouble:", sz), kBH);
        r_msg2_main(fl, "setValue:forKeyPath:", r_msg2(clN, "numberWithDouble:", x),  kPX);
        r_msg2_main(fl, "setBackgroundColor:", cgW);
        r_msg2_main(fl, "setOpacity:", 0.8);
        r_msg2_main(fl, "setCornerRadius:", sz / 2);
        r_msg2_main(root, "addSublayer:", fl);

        // Создаём CABasicAnimation (alloc — thread-safe)
        var an = r_msg2(clA, "animationWithKeyPath:", kPY);

        // Все операции с animation — r_msg2_main
        r_msg2_main(an, "setFromValue:", r_msg2(clN, "numberWithDouble:", -sz));
        r_msg2_main(an, "setToValue:",   r_msg2(clN, "numberWithDouble:", 1100.0));
        r_msg2_main(an, "setDuration:", dur);
        r_msg2_main(an, "setRepeatCount:", 9999.0);
        r_msg2_main(an, "setTimeOffset:", off);
        r_msg2_main(fl, "addAnimation:forKey:", an, kAK);

        log("[snow] flake " + idx + " done");
      }, idx * 200);
    })(i);
  }

  log("[snow] timers armed");
})();
