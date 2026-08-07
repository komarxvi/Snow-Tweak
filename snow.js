// @param: slider | flakes | Snowflakes | 15 | 5-30

(() => {
  log("[snow] start");

  var total = Math.floor(r_pref_num("flakes") || 15);
  if (total < 5)  total = 5;
  if (total > 30) total = 30;

  var clN = r_class("NSNumber");
  var clL = r_class("CALayer");
  var clA = r_class("CABasicAnimation");

  // UIColor.whiteColor — синглтон, живёт вечно, можно получить сразу
  var wht = r_msg2_main(r_class("UIColor"), "whiteColor");
  var cgW = r_msg2_main(wht, "CGColor");

  var kBW = r_nsstr("bounds.size.width");
  var kBH = r_nsstr("bounds.size.height");
  var kPX = r_nsstr("position.x");
  var kPY = r_nsstr("position.y");
  var kAK = r_nsstr("snow");

  log("[snow] setup ok, waiting for overlay teardown");

  // Ждём 3 сек — за это время Cyanide убирает свой оверлей.
  // Только после этого берём keyWindow: теперь это реальное
  // окно SpringBoard, а не временное окно Cyanide.
  setTimeout(function() {

    var app  = r_msg2_main(r_class("UIApplication"), "sharedApplication");
    var win  = r_msg2_main(app, "keyWindow");
    var root = r_msg2_main(win, "layer");
    log("[snow] real root=" + root + " total=" + total);

    for (var i = 0; i < total; i++) {
      (function(idx) {
        setTimeout(function() {
          var sz  = 2.5 + Math.random() * 3.5;
          var x   = 20  + Math.random() * 390;
          var dur = 7   + Math.random() * 7;
          var off = Math.random() * dur;
          log("[snow] flake " + idx);

          var fl = r_msg2(clL, "layer");

          r_msg2_main(fl, "setValue:forKeyPath:", r_msg2(clN, "numberWithDouble:", sz), kBW);
          r_msg2_main(fl, "setValue:forKeyPath:", r_msg2(clN, "numberWithDouble:", sz), kBH);
          r_msg2_main(fl, "setValue:forKeyPath:", r_msg2(clN, "numberWithDouble:", x),  kPX);
          r_msg2_main(fl, "setBackgroundColor:", cgW);
          r_msg2_main(fl, "setOpacity:", 0.8);
          r_msg2_main(fl, "setCornerRadius:", sz / 2);
          r_msg2_main(root, "addSublayer:", fl);

          var an = r_msg2(clA, "animationWithKeyPath:", kPY);
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

    log("[snow] flake timers armed");
  }, 3000);

})();
