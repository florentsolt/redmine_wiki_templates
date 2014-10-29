$(function() {

	function getWeek(offset) {
	  // Create a copy of this date object
	  var date  = new Date();

	  // Apply the week ofset
	  if (offset) {
	  	date.setDate(date.getDate() + parseInt(offset) * 7);
	  }

	  // ISO week date weeks start on monday
	  // so correct the day number
	  var dayNr   = (date.getDay() + 6) % 7;

	  // ISO 8601 states that week 1 is the week
	  // with the first thursday of that year.
	  // Set the date to the thursday in the date week
	  date.setDate(date.getDate() - dayNr + 3);

	  // Store the millisecond value of the date
	  var firstThursday = date.valueOf();

	  // Set the date to the first thursday of the year
	  // First set the date to january first
	  date.setMonth(0, 1);
	  // Not a thursday? Correct the date to the next thursday
	  if (date.getDay() != 4) {
	    date.setMonth(0, 1 + ((4 - date.getDay()) + 7) % 7);
	  }

	  // The weeknumber is the number of weeks between the
	  // first thursday of the year and the thursday in the week
	  var week = 1 + Math.ceil((firstThursday - date) / 604800000);
	  return week < 10 ? '0' + week : week;
	}

	function replace(text) {
		return text.replace(/%week%/gm, function() {
			return getWeek()
		}).replace(/%week\+(\d+)%/gm, function(macth, offset) {
			return getWeek(offset);
		}).replace(/%day%/gm, function() {
			var d  = new Date().getDate();
			return (d < 10) ? '0' + d : d;
		}).replace(/%month%/gm, function() {
			var m  = new Date().getMonth() + 1;
			return (m < 10) ? '0' + m : m;
		}).replace(/%year%/gm, function() {
			var y  = new Date().getYear();
			return (y < 1000) ? y + 1900 : y;
		});
	}

	var base_url = $('body.controller-wiki #main-menu a.wiki').attr('href')

	if (wiki_templates_settings && base_url) {
		base_url = base_url.replace(/\/(date_index|index)$/, '');
		var links = $('<div></div>')

		for (var i = 0; i < wiki_templates_settings.length; i++) {
			var template = wiki_templates_settings[i];

			var link = $('<a href="#"></a>')
				.text(template.label)
				.click(function() {
					this.title = replace(this.title);
					if (this.confirm) {
						this.title = prompt("Wiki page title", this.title);
					}
					if (this.title) {
						$('<form>')
							.attr({method: 'POST', action: base_url + "/" + encodeURIComponent(this.title)})
							.append($('<input>').attr({type: 'hidden', name: 'text', value: replace(this.content)}))
							.append($('<input>').attr({type: 'hidden', name: 'authenticity_token', value: $('meta[name=csrf-token]').attr('content')}))
							.appendTo($('body'))
							.submit();
						// window.location.href = base_url + "/" + encodeURIComponent(this.title) + '?text=' + encodeURIComponent(replace(this.content));
					}
				}.bind(template));
			links.append(link).append('<br>');
		}

		$("body.controller-wiki #main #sidebar h3:first").after("<br>").after(links);
	}
});