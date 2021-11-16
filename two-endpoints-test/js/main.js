(function($) {

	"use strict";

	 $('.label.ui.dropdown')
  .dropdown();

		$('.no.label.ui.dropdown')
		  .dropdown({
		  useLabels: false
		});

		$('.ui.button').on('click', function () {
		  $('.ui.dropdown')
		    .dropdown('restore defaults')
		})

	 
})(jQuery);


var states = document.getElementById('choose').selectedOptions;
var values = Array.from(states).map(({value}) => value);
console.log(`values: ${values}`);
/*function validate()
        {
            var selectChoose = document.getElementById('choose');
			selectChoose.multiple = true;
			console.log(`options:${selectChoose}`);
            var maxOptions = 2;
            var optionCount = 0;
            for (var i = 0; i < selectChoose.length; i++) {
                if (selectChoose[i].selected) {
                    optionCount++;
                    if (optionCount > maxOptions) {
                        alert("validation failed, not submitting")
                        return false;
                    }
                }
            }
            return true;
        }

validate();*/