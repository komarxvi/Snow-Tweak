// @name         Snowfall
// @description  Плавный, бесконечный снег над домашним экраном (SpringBoard)
// @author       you
// @version      1.0
// @param        density    Плотность снега, число хлопьев (40-400)     default=160
// @param        fallSpeed  Скорость падения, множитель (0.3-3.0)       default=1.0
// @param        wind       Снос ветром влево/вправо (-2.0-2.0)         default=0.4
// @param        flakeSize  Размер хлопьев в пунктах (1-8)              default=3
// @param        opacity    Общая прозрачность слоя (0.1-1.0)           default=0.85

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // 1) Параметры. QuickLoader должен положить объявленные @param куда-то
  //    в область видимости скрипта — но точный механизм (глобальный
  //    объект `params` или просто переменные) я не смог подтвердить по
  //    документации, поэтому proverяю оба варианта.
  // ---------------------------------------------------------------------
  function paramOr(key, fallback) {
    if (typeof params !== "undefined" && params && key in params) return params[key];
    if (typeof globalThis[key] !== "undefined") return globalThis[key];
    return fallback;
  }
  var density   = paramOr("density", 160);
  var fallSpeed = paramOr("fallSpeed", 1.0);
  var wind      = paramOr("wind", 0.4);
  var flakeSize = paramOr("flakeSize", 3);
  var opacity   = paramOr("opacity", 0.85);

  // ---------------------------------------------------------------------
  // 2) Мост в ObjC. ЭТО ЕДИНСТВЕННОЕ МЕСТО, КОТОРОЕ МОЖЕТ ПОТРЕБОВАТЬ
  //    ПРАВКИ. Cyanide описывает свой JS-раннер как "remote_objc API"
  //    (objc_msgSend / dlsym_call в SpringBoard), но точные имена
  //    глобальных функций на твоей сборке я не смог проверить —
  //    официальная страница "Cyanide: Writing Tweaks" не открылась мне
  //    как текст. Открой готовый скрипт из RepoTweaks Store (например
  //    hide_dock.js) в Cyanide → там будет видно, как реально называются
  //    getClass/msgSend в твоей версии, и это надо подставить сюда.
  // ---------------------------------------------------------------------
  var getClass = (typeof remote_objc !== "undefined") ? remote_objc.getClass : globalThis.getClass;
  var msgSend  = (typeof remote_objc !== "undefined") ? remote_objc.msgSend  : globalThis.msgSend;

  function alloc(className)        { return msgSend(getClass(className), "alloc"); }
  function kvcSet(obj, key, value)  { return msgSend(obj, "setValue:forKey:", value, key); }
  function kvcGet(obj, key)         { return msgSend(obj, "valueForKey:", key); }

  // ---------------------------------------------------------------------
  // 3) Находим ключевое окно SpringBoard (домашний экран)
  // ---------------------------------------------------------------------
  var app       = msgSend(getClass("UIApplication"), "sharedApplication");
  var keyWindow = msgSend(app, "keyWindow");
  var rootLayer = msgSend(keyWindow, "layer");
  var bounds    = msgSend(keyWindow, "bounds"); // {x, y, width, height}

  // Убираем снег от предыдущего запуска скрипта, чтобы не копились слои
  var EMITTER_NAME = "com.snowfall.emitter";
  (function removeOld() {
    var subs = msgSend(rootLayer, "sublayers") || [];
    for (var i = 0; i < subs.length; i++) {
      if (kvcGet(subs[i], "name") === EMITTER_NAME) {
        msgSend(subs[i], "removeFromSuperlayer");
      }
    }
  })();

  // ---------------------------------------------------------------------
  // 4) Сам "рецепт" снега — CAEmitterLayer + CAEmitterCell.
  //    Это стандартный, проверенный способ рисовать частицы в Core
  //    Animation, и после добавления слоя он анимируется сам — никакой
  //    JS-таймер не нужен, снег "всегда идёт" пока слой не удалён.
  // ---------------------------------------------------------------------
  var emitterLayer = alloc("CAEmitterLayer");
  msgSend(emitterLayer, "init");

  kvcSet(emitterLayer, "name", EMITTER_NAME);
  kvcSet(emitterLayer, "frame", { x: 0, y: 0, width: bounds.width, height: bounds.height });
  kvcSet(emitterLayer, "emitterShape", "line");
  kvcSet(emitterLayer, "emitterPosition", { x: bounds.width / 2, y: -10 });
  kvcSet(emitterLayer, "emitterSize", { width: bounds.width, height: 1 });
  kvcSet(emitterLayer, "renderMode", "additive");
  kvcSet(emitterLayer, "opacity", opacity);
  kvcSet(emitterLayer, "zPosition", 9999);

  var flake = alloc("CAEmitterCell");
  msgSend(flake, "init");

  kvcSet(flake, "contents", makeFlakeImage());
  kvcSet(flake, "birthRate", density / 4);           // при lifetime≈4с даёт нужную плотность
  kvcSet(flake, "lifetime", 4.0 / fallSpeed);
  kvcSet(flake, "lifetimeRange", 1.5);
  kvcSet(flake, "velocity", 110 * fallSpeed);
  kvcSet(flake, "velocityRange", 40 * fallSpeed);
  kvcSet(flake, "emissionLongitude", Math.PI);       // вниз
  kvcSet(flake, "emissionRange", Math.PI / 7);
  kvcSet(flake, "xAcceleration", 18 * wind);          // снос ветром
  kvcSet(flake, "spin", 0.8);
  kvcSet(flake, "spinRange", 2.2);
  kvcSet(flake, "scale", flakeSize / 9);
  kvcSet(flake, "scaleRange", flakeSize / 18);
  kvcSet(flake, "alphaSpeed", -0.12);                // мягко тает к концу жизни
  kvcSet(flake, "color", [1, 1, 1, 1]);

  kvcSet(emitterLayer, "emitterCells", [flake]);
  msgSend(rootLayer, "addSublayer:", emitterLayer);

  // ---------------------------------------------------------------------
  // 5) Простая белая точка для частицы (через системный SF Symbol,
  //    чтобы не тянуть свою PNG и не гонять Core Graphics по мосту)
  // ---------------------------------------------------------------------
  function makeFlakeImage() {
    var UIImage = getClass("UIImage");
    var symbol  = msgSend(UIImage, "systemImageNamed:", "circle.fill");
    var white   = msgSend(getClass("UIColor"), "whiteColor");
    var tinted  = msgSend(symbol, "imageWithTintColor:", white);
    return msgSend(tinted, "CGImage");
  }
})();
