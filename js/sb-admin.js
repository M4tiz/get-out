(function($) {
  "use strict"; // Start of use strict
  // Configure tooltips for collapsed side navigation
  $('.navbar-sidenav [data-toggle="tooltip"]').tooltip({
    template: '<div class="tooltip navbar-sidenav-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
  })
  // Toggle the side navigation
  $("#sidenavToggler").click(function(e) {
    e.preventDefault();
    $("body").toggleClass("sidenav-toggled");
    $(".navbar-sidenav .nav-link-collapse").addClass("collapsed");
    $(".navbar-sidenav .sidenav-second-level, .navbar-sidenav .sidenav-third-level").removeClass("show");
  });
  // Force the toggled class to be removed when a collapsible nav link is clicked
  $(".navbar-sidenav .nav-link-collapse").click(function(e) {
    e.preventDefault();
    $("body").removeClass("sidenav-toggled");
  });
  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .navbar-sidenav, body.fixed-nav .sidenav-toggler, body.fixed-nav .navbar-collapse').on('mousewheel DOMMouseScroll', function(e) {
    var e0 = e.originalEvent,
      delta = e0.wheelDelta || -e0.detail;
    this.scrollTop += (delta < 0 ? 1 : -1) * 30;
    e.preventDefault();
  });
  // Scroll to top button appear
  $(document).scroll(function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });
  // Configure tooltips globally
  $('[data-toggle="tooltip"]').tooltip()
  // Smooth scrolling using jQuery easing
  $(document).on('click', 'a.scroll-to-top', function(event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    event.preventDefault();
  });

  var sols = {
    file: {
      valid: '283',
      number: 4
    },
    cipher: {
      valid: 'santaclaus',
      number: 6
    },
    uvcode: {
      valid: 'chojinka',
      number: 1
    },
    morse: {
      valid: 'elf',
      number: 8
    },
    mirror: {
      valid: 'gift',
      number: 0
    },
    bomb: {
      number: 2
    }
  };


  $('input.form-control').on('input', function (e) {
    e.preventDefault();
    var id = $(this).attr('id');
    var solution = sols[id];
    if (solution.valid == $(this).val().toLowerCase()) {
      showSolution($(this), solution);
    }
  });

  function showSolution(input, solution) {
    var $label = $('<h2>')
        .addClass('col')
        .css('color', 'red')
        .text(solution.number);
    input.parent().append($label);
    input.remove();
    solution.resolved = true;
  }

  function allResolved() {
    var keys = Object.keys(sols);
    for (var i = 0; i < keys.length; i++) {
      if (!sols[keys[i]].resolved) {
        return false;
      }
    }
    return true;
  }

  $('#bomb').click(function () {
    $('#bomb-mod').show();
  });

  $('#bomb-start').click(function () {
    $('#modules').show();
    var timelimit = 1000 * 60 * 5;
    stop = timer(Date.now() + timelimit, $('#timer'));
    randomSolutionSet();
    $(this).hide();
  });
  var stop = $.noop;
  var failed = false;
  var symbols = [];
  var button = '';
  var cable = {};

  function randomSolutionSet() {
    failed = false;

    //1
    var $button = $('button.symbol');
    symbols = _.sampleSize(order, 4);
    $button.each(function (index) {
      $(this).text(symbols[index])
    });
    symbols.sort();
    $button.off();
    $button.click(symbolEvent);

    //2
    cable = _.sample(cables);
    var container = $('#cableContainer');
    for (var i = 0; i < cable.wires.length; i++) {
      var wire = cable.wires[i];
      var template = '<div class="col-lg-12"><a data-index="' + i + '" class="wire" href="#"><svg width="200" height="2"><line x1="0" x2="200" y1="0" y2="0" style="stroke: ' + wire + '; stroke-width: 3"></line></svg></a></div>'
      container.append(template);
    }
    $('.wire').on('click', cutWire);

    //3
    button = _.sample(buttons);
    $('.press-img').text(button.text);

    $('#pressThis')
        .off()
        .on('click', button.click || $.noop)
        .on('mousedown', button.mousedown || $.noop)
        .on('dblclick', button.dblclick || $.noop)
        .on('mouseup', button.mouseup || $.noop);

    //4
    var memory = _.sample(memories);
    var setIndex = 0;
    forwardMemory(setIndex, memory);

    $('.memory-buttons .mem')
        .off('click')
        .click(function () {
          var num = $(this).text();
          console.log('#' + setIndex + ' Memory ' + num + ' | Expected: ' + memory.order[setIndex]);
          if (num == memory.order[setIndex]) {
            forwardMemory(++setIndex, memory);
          } else {
            fail();
          }
        });

  }

  //Modules
  var order = ["©", "¶", "æ", "Ψ", "Ϙ", "Ϟ", "Ͽ", "Ѭ", "Ԇ", "★", "☆"];

  var symbolEvent = function (e) {
    e.preventDefault();
    var sym = $(this).text();
    if (symbols[0] != sym) {
      console.log('Expected: ' + symbols[0], 'Got: ' + sym);
      fail();
    } else {
      symbols = symbols.slice(1);
      console.log('Remaining: ', symbols);
      $(this).addClass('btn-primary btn-disabled');
    }
    $(this).off('click');

    if (symbols.length == 0) {
      markAsDone('mod1');
    }
  };

  var cables = [
    {wires: ['green', 'black', 'black'], correct: 1},
    {wires: ['black', 'red', 'green'], correct: 0},
    {wires: ['red', 'green', 'black'], correct: 1},
    {wires: ['red', 'black', 'red', 'green'], correct: 2},
    {wires: ['black', 'black', 'blue', 'darkorange'], correct: 3},
    {wires: ['blue', 'blue', 'black', 'blue'], correct: 2}
  ];

  function cutWire() {
    var wire = $(this);
    if (wire.attr('data-index') == cable.correct) {
      $('.wire').off('click');
      markAsDone('mod2');
    } else {
      fail();
    }
  }

  var buttons = [
    {
      text: 'Press',
      mouseup: function (e) {
        validateTimerDigit(5)
      },
      dblclick: failIfNotPassed
    },
    {
      text: 'Click',
      dblclick: function (e) {
        markAsDone('mod3')
      },
      click: function () {
        setTimeout(failIfNotPassed, 500);
      }
    },
    {
      text: 'Hold',
      click: function () {
        setTimeout(validateTimerDigit.bind(this, 0), 300);
      },
      dblclick: fail,
      mousedown: function () {
        setTimeout(failIfNotPassed, 1000)
      }
    }
  ];

  function forwardMemory(setIndex, memory) {
    var memoryButtons = $('.memory-buttons .mem');
    if (setIndex == sets.length) {
      memoryButtons.off('click');
      return markAsDone('mod4');
    }
    var memoryStatus = $('.memory-status');
    memoryStatus.text(memoryStatus.text() + '*');
    $('.memory-display').text(memory.display[setIndex]);
    memoryButtons
        .each(function (index) {
          $(this).text(sets[setIndex][index]);
        })
  }

  var memories = [
    {
      display: [3, 1, 3, 3],
      order: [1, 4, 1, 1]
    },
    {
      display: [1, 4, 3, 3],
      order: [4, 3, 1, 4]
    }
  ];
  var sets = [
    [2, 4, 1, 3],
    [1, 3, 2, 4],
    [2, 3, 1, 4],
    [2, 1, 3, 4]
  ];

  //################
  function failIfNotPassed() {
    console.log('Fail if not ' + $('#mod3').attr('data-done'));
    if (!$('#mod3').attr('data-done')) {
      console.log('Fail');
      fail();
    }
  }

  function validateTimerDigit(digit) {
    var time = $('#timer').text();
    if (time.indexOf(digit) < 0) {
      fail();
    } else {
      markAsDone('mod3');
      $('#pressThis').off();
    }
  }

  function markAsDone(module) {
    if (!failed) {
      var modul = $('#' + module);
      modul.css('background-color', 'rgba(40, 167, 69, 0.4)');
      modul.attr('data-done', 'true');

      if (allModulesDone()) {
        hideModules();
        stopTimer();
        showSolution($('#bomb'), sols.bomb);
        delayedAlert('Bomba rozbrojona.')
      }
    }
  }

  function stopTimer() {
    stop();
  }

  function allModulesDone() {
    var done = true;
    $('.module')
        .each(function () {
          done &= ($(this).attr('data-done') === 'true');
        });
    return done;
  }

  function fail() {
    reset();
    boom();
    stopTimer();
    failed = true;
  }

  function reset() {
    $('#bomb-start').show();
    $('.memory-status').text('');
    var symbols = $('button.symbol');
    symbols.click(symbolEvent);
    symbols.removeClass('btn-primary btn-disabled');
    $('.module').css('background-color', 'transparent');
    $('#cableContainer').html('&nbsp;');
    symbols.length = 0;
    cable = {};
  }

  function timer(timelimit, element) {
    var running = true;
    countdown.setLabels(
        '&nbsp;|:|:',
        '&nbsp;|:|:',
        '', '', '');

    function update() {
      if (!running) {
        return;
      }

      var units = countdown.MINUTES | countdown.SECONDS | countdown.MILLISECONDS,
          max = 3,
          digits = 3;

      var start = new Date(timelimit),
          ts = countdown(start, null, units, max, digits);

      element.html(ts.toHTML('strong', null));

      if (Date.now() - timelimit < 0) {
        requestAnimationFrame(update);
      } else {
        boom();
      }
    }

    update();

    return function stop() {
      running = false;
    }
  }

  function boom() {
    hideModules();
    delayedAlert('Hahaha hehehehe. Bomba wybuchła, Mikołaj przez was zginął. Przez was dzieci nie będą miały prezentów. Krew jest teraz na waszych rękach. Spróbujcie jeszcze raz.');
  }

  function delayedAlert(text) {
    setTimeout(function () {
      alert(text);
    }, 1);
  }

  function hideModules() {
    $('#modules').hide();
  }
})(jQuery); // End of use strict
