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
      valid: '123',
      number: 0
    },
    cipher: {
      valid: 'santaclaus',
      number: 0
    },
    uvcode: {
      valid: 'p_#q3x',
      number: 0
    },
    morse: {
      valid: 'elf',
      number: 0
    },
    mirror: {
      valid: 'gift',
      number: 0
    }
  };


  $('input.form-control').on('input', function () {
    var id = $(this).attr('id');
    var solution = sols[id];
    if (solution.valid == $(this).val().toLowerCase()) {
      var $label = $('<h2>')
          .addClass('col')
          .css('color', 'red')
          .text(solution.number);
      $(this).parent().append($label);
      $(this).remove();
      solution.resolved = true;
    }
  });

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
    timer(Date.now() + timelimit, $('#timer'));
    randomSolutionSet();
  });
  var symbols = [];
  var cable = {};

  function randomSolutionSet() {
    //1
    symbols = _.sampleSize(order, 4);
    $('button.symbol').each(function (index) {
      $(this).text(symbols[index])
    });
    symbols.sort();

    //2
    cable = _.sample(cables);
    var container = $('#cableContainer');
    for (var i = 0; i < cable.wires.length; i++) {
      var wire = cable.wires[i];
      var template = '<div class="col-lg-12"><a data-index="' + i + '" class="wire" href="#"><svg width="200" height="2"><line x1="0" x2="200" y1="0" y2="0" style="stroke: ' + wire + '; stroke-width: 3"></line></svg></a></div>'
      container.append(template);
    }
    $('.wire').on('click', cutWire);
  }

  //Modules
  var order = ["©", "¶", "æ", "Ψ", "Ϙ", "Ϟ", "Ͽ", "Ѭ", "Ԇ", "★", "☆"];

  $('button.symbol').click(function (e) {
    e.preventDefault();
    var sym = $(this).text();
    if (symbols[0] != sym) {
      console.log('Expected: ' + symbols[0], 'Got: ' + sym);
      onInvalidAnswer();
    } else {
      symbols = symbols.slice(1);
      console.log('Remaining: ', symbols);
      $(this).addClass('btn-primary btn-disabled');
      $(this).off('click');
    }

    if (symbols.length == 0) {
      markAsDone('mod1');
    }
  });


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
      onInvalidAnswer();
    }
  }

  function markAsDone(module) {
    $('#' + module).css('background-color', 'rgba(40, 167, 69, 0.4)')
  }

  function onInvalidAnswer() {
    reset();
    boom();
  }

  function reset() {
    $('.module').each().css('background-color', 'transparent');
    $('#cableContainer').empty();
    symbols.length = 0;
    cable = {};
  }

  function timer(timelimit, element) {
    countdown.setLabels(
        '&nbsp;|:|:',
        '&nbsp;|:|:',
        '', '', '');

    function update() {
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
  }

  function boom() {
    $('#modules').hide();
    setTimeout(function () {
      alert('Boom. Mikołaja wyjebało. Spróbuj jeszcze raz.');
    }, 1);
  }
})(jQuery); // End of use strict
