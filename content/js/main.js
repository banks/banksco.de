document.addEventListener("DOMContentLoaded", function(){

    var $d = document;
    var $id = function(id) { return $d.getElementById(id); };

    // From https://plainjs.com/javascript/attributes/adding-removing-and-testing-for-classes-9/
    function hasClass(el, className) {
        return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
    }

    function addClass(el, className) {
        if (el.classList) el.classList.add(className);
        else if (!hasClass(el, className)) el.className += ' ' + className;
    }

    function removeClass(el, className) {
        if (el.classList) el.classList.remove(className);
        else el.className = el.className.replace(new RegExp('\\b'+ className+'\\b', 'g'), '');
    }

    var AboutPanel = (function() {
        var is_open = false
            ,mouse_over = false
            ,logo = $id('logo')
            ,logo_cstyle = window.getComputedStyle(logo)
            ,closed_w = logo_cstyle.width
            ,closed_h = logo_cstyle.height
            ,open_panel = function() {
                if (is_open) return;

                is_open = true;
                addClass(logo, 'open');
            }
            ,close_panel = function() {
                if (!is_open) return;

                is_open = false;
                removeClass(logo, 'open');
            };

        // Startup, build info from footer
        var ps = $d.querySelectorAll('footer div.about p');
        for (var i = 0; i < ps.length; i++) {
            $id('about').appendChild(ps[i].cloneNode(true));
        }

        // Hook "logo"
        logo.addEventListener('click', function(e){
            if (!is_open) {
                open_panel();
            } else if (hasClass(e.target, 'close')) {
                close_panel();
            } else {
                // Legitimate click on link etc let it work
                return true;
            }
            e.stopPropagation();
            e.preventDefault();
            return false;
        });

        // Close on click outside panel
        $d.addEventListener('click', close_panel);
    })();
});