(() => {
  log("[diag] 1 start");

  var app = r_msg2(r_class("UIApplication"), "sharedApplication");
  log("[diag] 2 app=" + app);

  var win = r_msg2(app, "keyWindow");
  log("[diag] 3 win=" + win);

  var rootLayer = r_msg2(win, "layer");
  log("[diag] 4 rootLayer=" + rootLayer);

  var testLayer = r_msg2(r_class("CALayer"), "layer");
  log("[diag] 5 testLayer=" + testLayer);

  var num = r_msg2(r_class("NSNumber"), "numberWithDouble:", 50);
  log("[diag] 6 num=" + num);

  var key = r_nsstr("bounds.size.width");
  log("[diag] 7 key=" + key);

  r_msg2_main(testLayer, "setValue:forKeyPath:", num, key);
  log("[diag] 8 setValue:forKeyPath: done");

  r_msg2_main(rootLayer, "addSublayer:", testLayer);
  log("[diag] 9 addSublayer done");

  var white = r_msg2(r_class("UIColor"), "whiteColor");
  log("[diag] 10 white=" + white);

  var cg = r_msg2(white, "CGColor");
  log("[diag] 11 cg=" + cg);

  r_msg2_main(testLayer, "setBackgroundColor:", cg);
  log("[diag] 12 setBackgroundColor done");

  var anim = r_msg2(r_class("CABasicAnimation"), "animationWithKeyPath:", r_nsstr("position.y"));
  log("[diag] 13 anim=" + anim);

  r_msg2_main(anim, "setToValue:", r_msg2(r_class("NSNumber"), "numberWithDouble:", 500));
  log("[diag] 14 setToValue done");

  r_msg2_main(anim, "setDuration:", 3.0);
  log("[diag] 15 setDuration done");

  r_msg2_main(testLayer, "addAnimation:forKey:", anim, r_nsstr("fall"));
  log("[diag] 16 addAnimation done - ALL PASSED");
})();
