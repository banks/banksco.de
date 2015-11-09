$(function(){

	var AboutPanel = (function() {
		var is_open = false
			,mouse_over = false
			,$logo = $('#logo')
			,$content = $('footer div.about p').clone()
			,closed_w = $logo.width()
			,closed_h = $logo.height()
			,open_panel = function() {
				if (is_open) return;

				is_open = true;
				$logo.addClass('open')
				   .animate({width: 480, height: 160}
				   		   ,200
				   		   ,function(){

		    		 	   });
			}
			,close_panel = function() {
				if (!is_open) return;

				is_open = false;
				$logo.removeClass('open')
				   .animate({width: closed_w, height: closed_h}
				   		   ,200);

				if (!mouse_over) {
					$logo.fadeTo(200, 0.5);
				}
			};

		// Startup, build info from footer
		$('#about', $logo).append($content);

		// Hook "logo"
		$logo.hover(function(){
						mouse_over = true;
				    	$logo.fadeTo(200, 0.99);
				    }
				    ,function(){
				    	mouse_over = false;
				    	if (!is_open) {
				    		$logo.fadeTo(200, 0.5);
				    	}
				    }).on('click', function(e){
				    	e.stopPropagation();
				    	if (!is_open && $content.length) {
				    		open_panel();
				    	} else if ($(e.target).is('span,a.close')) {
				    		close_panel();
				    	} else {
				    		// Legitimate click on link etc let it work
				    		return true;
				    	}
				    	return false;
				    });

		// Close on click outside panel
		$(document).on('click', close_panel);
	})();

	$('a.email-link').each(function(){
		var $link = $(this);
		$link.attr('href', $link.attr('href').replace('[at]', '@').replace('[dot]', '.'));
	});
});